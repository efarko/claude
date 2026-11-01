# Uso: python3 gm_filtrar.py status.json salida.json gm1.json gm2.json ...
# Filtra resultados de Google Maps con el criterio de alto interés y deja el formato que usa audit.js.
import json, re, sys, unicodedata, collections, os
def norm(s): return re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFD', (s or '').lower()).encode('ascii', 'ignore').decode()).strip()
status, salida, *ins = sys.argv[1:]
known = {norm(n) for n in json.load(open(status)).get('names', [])}
known_wa = set()
here = os.path.dirname(os.path.abspath(__file__))
try:
    for l in open(os.path.join(here, 'exportados.txt'), encoding='utf-8'):
        n, _, w = l.rstrip('\n').partition('\t'); known.add(norm(n)); known_wa.add(w.strip())
except FileNotFoundError: pass
EXCL = re.compile(r'canitas|virgen del carmen|roxste|art ?& ?glass', re.I)
CHAINS = re.compile(r'multident|dentavida|sanna|auna|clinica internacional|ricardo palma|san pablo|javier prado|oncosalud|vitalia|cuidado de la salud|essalud|minsa|hospital|policlinico municipal|municipal|ciam|centro de salud|puesto de salud|^casa del adulto mayor$|smile ?care|orthoplus', re.I)
SOCIAL = re.compile(r'facebook|instagram|tiktok|linktr|wa\.me|whatsapp|gurugo|paginasamarillas|doctoralia|google\.com|business\.site|youtube', re.I)
RUBRO = [(r'reposo|geri|adulto mayor|ancian', 'casas de reposo'), (r'pod[oó]log', 'podología'), (r'fisio|terapia f[ií]sica|rehabilit', 'fisioterapia'),
         (r'dental|dentista|odont|ortodon', 'clínica dental'), (r'lenguaje', 'terapia de lenguaje'), (r'psic', 'psicología'), (r'veterin', 'veterinaria'), (r'est[eé]tic|spa', 'centro de estética')]
rows = [x for f in ins for x in json.load(open(f))]
dom = collections.Counter(re.sub(r'^https?://(www\.)?', '', x['web']).split('/')[0] for x in rows if x['web'] and not SOCIAL.search(x['web']))
out, seen = [], set()
for x in rows:
    k = norm(x['name'])
    if not x['wa'] or not re.fullmatch(r'9\d{8}', x['wa']) or x['closed'] or k in known or k in seen or x['wa'] in known_wa or EXCL.search(x['name']) or CHAINS.search(x['name']): continue
    q = x['query']
    rubro = next((r for p, r in RUBRO if re.search(p, q, re.I)), 'salud')
    min_rev = 3 if rubro == 'casas de reposo' else 5
    if x['reviews'] < min_rev or (x['rating'] and x['rating'] < 4.0): continue
    web = '' if (not x['web'] or SOCIAL.search(x['web'])) else x['web']
    if web and dom[re.sub(r'^https?://(www\.)?', '', web).split('/')[0]] >= 3: continue  # cadena con varias sedes
    district = re.sub(r'^(?:casa de reposo|centro geri[aá]trico|cl[ií]nica dental|consultorio dental|dentista|ortodoncia|fisioterapia|terapia f[ií]sica|pod[oó]logo|podolog[ií]a|terapia de lenguaje|psic[oó]logo infantil|psic[oó]logo|veterinaria|centro de est[eé]tica)\s+', '', q, flags=re.I)
    if district != 'Cercado de Lima': district = district.replace(' Lima', '')
    seen.add(k); known_wa.add(x['wa'])
    out.append({'name': x['name'].strip(), 'category': rubro, 'district': district, 'web': web, 'wa': x['wa'], 'fijo': x.get('fijo', ''),
                'rating': x['rating'], 'reviews': x['reviews'], 'maps': x['maps']})
json.dump(out, open(salida, 'w'), ensure_ascii=False, indent=1)
print(len(rows), 'resultados ->', len(out), 'candidatos;', sum(1 for o in out if not o['web']), 'sin web propia')
print(collections.Counter(o['category'] for o in out))
