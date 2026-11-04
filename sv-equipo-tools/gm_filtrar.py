# Uso: python3 gm_filtrar.py status.json salida.json gm1.json gm2.json ...
# Filtra resultados de Google Maps con el criterio de alto interés y deja el formato que usa audit.js.
import json, re, sys, unicodedata, collections, os
CYR = str.maketrans('АаВЕеКМНОоРрСсТуХхІіЈј', 'AaBEeKMHOoPpCcTyXxIiJj')
def norm(s): return re.sub(r'[^a-z0-9]+', ' ', unicodedata.normalize('NFD', (s or '').translate(CYR).lower()).encode('ascii', 'ignore').decode()).strip()
COMUNES = set('clinica clinicas dental dentales consultorio consultorios odontologico odontologica odontologia odontologos dentista dentistas centro centros podologia podologico podologa podologo veterinaria veterinario fisioterapia terapia terapias fisica psicologia psicologico psicologa psicologo psicologos casa casas reposo residencia geriatrico geriatrica hogar asilo integral especializada especializado salud vida care plus center smile smiles sonrisa sonrisas dent feet pet vet spa masajes estetica medico medica lima sede miraflores surco isidro borja molina odonto odontologists odontological denti clinic digital service services peru dra dr doctor doctora'.split())
def marca(s):
    """Primera palabra propia del nombre, para reconocer otra sede de la misma marca."""
    for t in norm(re.split(r'\s[-|–]\s', s or '')[0]).split():
        if len(t) >= 5 and t not in COMUNES and not t.isdigit(): return t
    return None
def misma_marca(m, rubro, conocidas):
    """Misma palabra, o una empieza con la otra si ambas tienen 7+ letras; y del mismo rubro ('*' = cualquiera)."""
    if not m: return False
    return any((m == o or (min(len(m), len(o)) >= 7 and (m.startswith(o) or o.startswith(m)))) and (rubro in cats or '*' in cats)
               for o, cats in conocidas.items())
def dominio(w): return re.sub(r'^https?://(www\.)?', '', w or '').split('/')[0].lower()
status, salida, *ins = sys.argv[1:]
known = {norm(n) for n in json.load(open(status)).get('names', [])}
known_wa, known_dom = set(), set()
known_marca = collections.defaultdict(set)
here = os.path.dirname(os.path.abspath(__file__))
try:
    for l in open(os.path.join(here, 'exportados.txt'), encoding='utf-8'):
        n, w, dm, rb = (l.rstrip('\n').split('\t') + ['', '', ''])[:4]
        known.add(norm(n)); known_wa.add(w.strip())
        if marca(n): known_marca[marca(n)].add(rb or '*')
        if dm: known_dom.add(dm)
except FileNotFoundError: pass
for n in json.load(open(status)).get('names', []):
    if marca(n) and len(marca(n)) >= 6: known_marca[marca(n)].add('*')
EXCL = re.compile(r'canitas|virgen del carmen|roxste|art ?& ?glass', re.I)
CHAINS = re.compile(r'multident|dentavida|sanna|auna|clinica internacional|ricardo palma|san pablo|javier prado|oncosalud|vitalia|cuidado de la salud|essalud|minsa|hospital|policlinico municipal|municipal|ciam|centro de salud|puesto de salud|^casa del adulto mayor$|smile ?care|orthoplus|hermanitas|desamparados|parroquia|beneficencia|congregaci|solidari|centro integral de atenci', re.I)
SOCIAL = re.compile(r'facebook|instagram|tiktok|linktr|wa\.me|wa\.link|bit\.ly|beacons|taplink|whatsapp|gurugo|paginasamarillas|doctoralia|google\.com|business\.site|youtube', re.I)
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
    m, d = marca(x['name']), dominio(web)
    if misma_marca(m, rubro, known_marca) or (web and d in known_dom): continue  # otra sede de una marca ya usada
    if m: known_marca[m].add(rubro)
    if web: known_dom.add(d)
    seen.add(k); known_wa.add(x['wa'])
    out.append({'name': x['name'].translate(CYR).strip(), 'category': rubro, 'district': district, 'web': web, 'wa': x['wa'], 'fijo': x.get('fijo', ''),
                'rating': x['rating'], 'reviews': x['reviews'], 'maps': x['maps']})
json.dump(out, open(salida, 'w'), ensure_ascii=False, indent=1)
print(len(rows), 'resultados ->', len(out), 'candidatos;', sum(1 for o in out if not o['web']), 'sin web propia')
print(collections.Counter(o['category'] for o in out))
