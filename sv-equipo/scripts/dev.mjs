// Servidor local para probar sin Vercel: node scripts/dev.mjs (usa DATABASE_URL y MAIL_LOG).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const apis = {};

http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  const m = pathname.match(/^\/api\/([a-z]+)$/);
  if (m) {
    apis[m[1]] ||= (await import(path.join(root, 'api', m[1] + '.js'))).default;
    return apis[m[1]](req, res);
  }
  let file = path.join(root, 'public', pathname === '/' ? 'index.html' : pathname);
  if (!path.extname(file)) file += '.html';
  if (!file.startsWith(path.join(root, 'public')) || !fs.existsSync(file)) { res.statusCode = 404; return res.end('404'); }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log('http://localhost:' + (process.env.PORT || 3000)));
