# Uso: python3 gm_final.py auditado.json salida.json DD/MM
# Deja solo los que tienen un fallo comprobado, ordena por interés y arma el mensaje de WhatsApp con sus reseñas de Google.
import json, sys, os, re
GEN = set("""dentista dentistas implantes implante dentales dental clinica clínica consultorio odontologico odontológico odontologia odontología centro
casa casas reposo geriatrico geriátrico residencia hogar asilo carillas ortodoncia protesis prótesis endodoncia brackets blanqueamiento urgencias especialistas especializada especializado
podologia podología masajes terapia terapias fisica física fisioterapia psicologo psicólogo psicologa psicóloga veterinaria en y de la el los las del
miraflores surco santiago san isidro borja molina barranco lince jesus jesús maria maría pueblo libre magdalena miguel surquillo lima peru perú""".split())
def _generico(t): return all(w.lower().strip('.,"“”-') in GEN for w in t.split())
def corto(n):
    """Nombre para el saludo: sin la cola de palabras clave, sedes ni paréntesis que algunos ponen en Google Maps."""
    t = re.sub(r'\s*\(.*?\)\s*', ' ', n).strip()
    # comillas: «PODOLOGIA “PARDO”» -> PODOLOGIA PARDO; «PODOVITAL "podología y masajes…"» -> PODOVITAL
    m = re.match(r'^(.*?)\s*["“]([^"”]*)["”]?.*$', t)
    if m:  # entre comillas: se queda si lo de antes es genérico o si es corto (PODOLOGIA “PARDO”)
        antes, dentro = m.group(1).strip(), m.group(2).strip()
        t = (antes + ' ' + dentro).strip() if (not antes or _generico(antes) or len(dentro.split()) < 3) else antes
    partes = [re.sub(r'^mejor\s+|\s+sede\b.*$', '', p, flags=re.I).strip() for p in re.split(r'\s(?:\|\||[-|–])\s|:\s|(?<!\bDr)(?<!\bDra)(?<!\bSr)(?<!\bSra)\.\s', t)]
    partes = [p for p in partes if p]
    propias = [p for p in partes if not _generico(p)]
    if not propias: return t if len(t) <= 40 or not partes else partes[0]
    return propias[0]
def dominio(w): return re.sub(r'^https?://(www\.)?', '', w or '').split('/')[0].lower()
src, dst, fecha = sys.argv[1:]
d = json.load(open(src))
ORDEN = ['casas de reposo', 'clínica dental', 'fisioterapia', 'podología', 'terapia de lenguaje', 'psicología', 'veterinaria', 'centro de estética', 'salud']
rows = []
for x in d:
    if 'skip' in x or not x.get('problem'): continue
    if x['problem'].startswith('el pie de su web'): continue  # un año viejo solo no basta
    nom = corto(x['name']); quien = 'clientes' if x['category'] == 'veterinaria' else 'pacientes'
    r = f"{x['rating']:.1f}".replace('.', ',')
    if not x['web']:
        msg = (f"Hola, buenas. Soy {{closer}}, de SV WebStudio. Vi {nom} en Google Maps: tienen {r} de calificación con {x['reviews']} reseñas, muy bien. "
               "Pero quien los busca desde el celular no encuentra una página web propia con sus servicios y un botón directo a WhatsApp, y suele irse con el siguiente resultado. "
               "Les preparamos gratis una muestra de cómo se vería la suya, para que la vean en su celular, sin compromiso. ¿Se la envío por aquí?")
    else:
        msg = (f"Hola, buenas. Soy {{closer}}, de SV WebStudio. Vi {nom} en Google Maps: tienen {r} de calificación con {x['reviews']} reseñas. "
               f"Revisé su web desde el celular y vimos que {x['problem']}, así que algunos {quien} se pueden ir sin escribirles. "
               "Les preparamos gratis una muestra de cómo se vería su web arreglada, para que la vean en su celular, sin compromiso. ¿Se la envío por aquí?")
    phones = [{'label': 'Fijo', 'tel': x['fijo']}] if x.get('fijo') else []
    rows.append({'name': x['name'], 'category': x['category'], 'district': x['district'], 'web': x['web'], 'problem': x['problem'], 'need': x['need'],
                 'wa': x['wa'], 'phones': phones, 'source': f"Google Maps {fecha} ({r}★, {x['reviews']} reseñas)", 'msg': msg[:600],
                 '_score': (ORDEN.index(x['category']) if x['category'] in ORDEN else 9, 0 if not x['web'] else 1, -x['reviews'])})
rows.sort(key=lambda r: r['_score'])
for r in rows: r.pop('_score')
json.dump(rows, open(dst, 'w'), ensure_ascii=False, indent=1)
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, 'exportados.txt'), 'a', encoding='utf-8') as f:
    for r in rows: f.write('\t'.join([r['name'], r['wa'], dominio(r['web']), r['category']]) + '\n')
print(len(rows), 'prospectos;', sum(1 for r in rows if not r['web']), 'sin web')
