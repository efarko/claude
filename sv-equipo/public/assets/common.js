// Ayudas compartidas: llamadas a la API, creación de elementos sin innerHTML y avisos.
export async function api(path, body, { method } = {}) {
  const res = await fetch('/api/' + path, {
    method: method || (body ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json', 'X-SV': '1' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (res.status === 401 && location.pathname !== '/' && location.pathname !== '/index.html') {
    location.href = '/';
    throw new Error('Inicia sesión');
  }
  if (!res.ok) throw new Error(data.error || 'Algo salió mal. Intenta de nuevo.');
  return data;
}

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
  return el;
}

let toastTimer;
export function toast(text) {
  document.querySelector('.toast')?.remove();
  const t = h('div', { class: 'toast', role: 'status' }, text);
  document.body.append(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}

export async function logout() {
  try { await api('auth?a=logout', {}); } catch {}
  location.href = '/';
}

export const fmtTime = (d) => new Date(d).toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' });
export const fmtDate = (d) => new Date(d).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtDay = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

export function busy(btn, on) {
  if (!btn) return;
  btn.disabled = on;
  btn.setAttribute('aria-busy', on ? 'true' : 'false');
}
