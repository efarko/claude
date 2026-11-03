// Memoria del bot: historial de cada conversación, prospectos, pausas y candados.
// En producción usa Redis (Upstash, desde el Marketplace de Vercel). Sin Redis
// configurado usa memoria local, que solo sirve para pruebas.
import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";
import type Anthropic from "@anthropic-ai/sdk";

export type Historial = Anthropic.Beta.BetaMessageParam[];

export interface Prospecto {
  numero: string;
  nombre: string;
  tipoProyecto: string;
  descripcion: string;
  plazoOPresupuesto: string;
  aceptaAnticipo: boolean;
  fecha: string;
}

export interface Pendiente {
  texto: string;
  nombre?: string;
}

export interface Store {
  /** true la primera vez que se ve un id de mensaje (Meta a veces reenvía webhooks). */
  reclamarMensaje(id: string): Promise<boolean>;
  agregarPendiente(numero: string, p: Pendiente): Promise<void>;
  tomarPendientes(numero: string): Promise<Pendiente[]>;
  hayPendientes(numero: string): Promise<boolean>;
  /** Devuelve un token si se obtuvo el candado de la conversación, o null si otro proceso la atiende. */
  tomarCandado(numero: string, segundos: number): Promise<string | null>;
  soltarCandado(numero: string, token: string): Promise<void>;
  leerHistorial(numero: string): Promise<Historial>;
  guardarHistorial(numero: string, historial: Historial): Promise<void>;
  borrarHistorial(numero: string): Promise<void>;
  estaPausado(numero: string): Promise<boolean>;
  pausar(numero: string, pausado: boolean): Promise<void>;
  guardarNombre(numero: string, nombre: string): Promise<void>;
  leerNombre(numero: string): Promise<string | undefined>;
  guardarProspecto(p: Prospecto): Promise<void>;
  listarProspectos(cantidad: number): Promise<Prospecto[]>;
}

const DIA = 60 * 60 * 24;
const TTL_CONVERSACION = 60 * DIA;

const SOLTAR_CANDADO = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`;

export class RedisStore implements Store {
  constructor(private readonly redis: Redis) {}

  async reclamarMensaje(id: string) {
    return (await this.redis.set(`msg:${id}`, "1", { nx: true, ex: 3 * DIA })) === "OK";
  }
  async agregarPendiente(numero: string, p: Pendiente) {
    await this.redis.rpush(`pend:${numero}`, JSON.stringify(p));
    await this.redis.expire(`pend:${numero}`, DIA);
  }
  async tomarPendientes(numero: string) {
    const clave = `pend:${numero}`;
    const tx = this.redis.multi();
    tx.lrange(clave, 0, -1);
    tx.del(clave);
    const [items] = (await tx.exec()) as [string[], number];
    return (items ?? []).map((i) => JSON.parse(i) as Pendiente);
  }
  async hayPendientes(numero: string) {
    return (await this.redis.llen(`pend:${numero}`)) > 0;
  }
  async tomarCandado(numero: string, segundos: number) {
    const token = randomUUID();
    const ok = await this.redis.set(`lock:${numero}`, token, { nx: true, ex: segundos });
    return ok === "OK" ? token : null;
  }
  async soltarCandado(numero: string, token: string) {
    await this.redis.eval(SOLTAR_CANDADO, [`lock:${numero}`], [token]);
  }
  async leerHistorial(numero: string) {
    const crudo = await this.redis.get<string>(`hist:${numero}`);
    return crudo ? (JSON.parse(crudo) as Historial) : [];
  }
  async guardarHistorial(numero: string, historial: Historial) {
    await this.redis.set(`hist:${numero}`, JSON.stringify(historial), { ex: TTL_CONVERSACION });
  }
  async borrarHistorial(numero: string) {
    await this.redis.del(`hist:${numero}`);
  }
  async estaPausado(numero: string) {
    return (await this.redis.get<string>(`pausa:${numero}`)) === "1";
  }
  async pausar(numero: string, pausado: boolean) {
    if (pausado) await this.redis.set(`pausa:${numero}`, "1", { ex: TTL_CONVERSACION });
    else await this.redis.del(`pausa:${numero}`);
  }
  async guardarNombre(numero: string, nombre: string) {
    await this.redis.set(`nombre:${numero}`, nombre, { ex: TTL_CONVERSACION });
  }
  async leerNombre(numero: string) {
    return (await this.redis.get<string>(`nombre:${numero}`)) ?? undefined;
  }
  async guardarProspecto(p: Prospecto) {
    await this.redis.lpush("prospectos", JSON.stringify(p));
    await this.redis.ltrim("prospectos", 0, 499);
  }
  async listarProspectos(cantidad: number) {
    const items = await this.redis.lrange<string>("prospectos", 0, cantidad - 1);
    return items.map((i) => JSON.parse(i) as Prospecto);
  }
}

/** Implementación en memoria para pruebas locales. Se pierde al reiniciar. */
export class MemoriaStore implements Store {
  private kv = new Map<string, unknown>();
  private prospectos: Prospecto[] = [];

  async reclamarMensaje(id: string) {
    if (this.kv.has(`msg:${id}`)) return false;
    this.kv.set(`msg:${id}`, true);
    return true;
  }
  async agregarPendiente(numero: string, p: Pendiente) {
    const lista = (this.kv.get(`pend:${numero}`) as Pendiente[]) ?? [];
    lista.push(p);
    this.kv.set(`pend:${numero}`, lista);
  }
  async tomarPendientes(numero: string) {
    const lista = (this.kv.get(`pend:${numero}`) as Pendiente[]) ?? [];
    this.kv.delete(`pend:${numero}`);
    return lista;
  }
  async hayPendientes(numero: string) {
    return ((this.kv.get(`pend:${numero}`) as Pendiente[]) ?? []).length > 0;
  }
  async tomarCandado(numero: string) {
    if (this.kv.has(`lock:${numero}`)) return null;
    const token = randomUUID();
    this.kv.set(`lock:${numero}`, token);
    return token;
  }
  async soltarCandado(numero: string, token: string) {
    if (this.kv.get(`lock:${numero}`) === token) this.kv.delete(`lock:${numero}`);
  }
  async leerHistorial(numero: string) {
    return structuredClone((this.kv.get(`hist:${numero}`) as Historial) ?? []);
  }
  async guardarHistorial(numero: string, historial: Historial) {
    this.kv.set(`hist:${numero}`, structuredClone(historial));
  }
  async borrarHistorial(numero: string) {
    this.kv.delete(`hist:${numero}`);
  }
  async estaPausado(numero: string) {
    return this.kv.get(`pausa:${numero}`) === true;
  }
  async pausar(numero: string, pausado: boolean) {
    if (pausado) this.kv.set(`pausa:${numero}`, true);
    else this.kv.delete(`pausa:${numero}`);
  }
  async guardarNombre(numero: string, nombre: string) {
    this.kv.set(`nombre:${numero}`, nombre);
  }
  async leerNombre(numero: string) {
    return this.kv.get(`nombre:${numero}`) as string | undefined;
  }
  async guardarProspecto(p: Prospecto) {
    this.prospectos.unshift(p);
  }
  async listarProspectos(cantidad: number) {
    return this.prospectos.slice(0, cantidad);
  }
}

export function crearStore(): Store {
  // Upstash desde el Marketplace de Vercel crea KV_REST_API_* o UPSTASH_REDIS_REST_*.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return new RedisStore(new Redis({ url, token, automaticDeserialization: false }));
  }
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Falta configurar Redis (Upstash): sin él el bot olvida las conversaciones.");
  }
  console.warn("Sin Redis configurado: usando memoria local (solo para pruebas).");
  return new MemoriaStore();
}
