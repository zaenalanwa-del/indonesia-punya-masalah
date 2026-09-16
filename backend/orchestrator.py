import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def _load_json(path):
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding='utf-8'))

# The repository currently contains synthetic/sample observations. The orchestrator
# keeps provenance explicit and never presents them as verified national data.
SOURCES = {x['id']: x for x in _load_json(ROOT/'data/demo_sources.json')}
if not SOURCES:
    SOURCES = {x['id']: x for x in _load_json(ROOT/'sample_data/demo_sources.json')}
OBS = _load_json(ROOT/'data/demo_observations.json')
if not OBS:
    OBS = _load_json(ROOT/'sample_data/demo_observations.json')

STOP = {'apa','yang','sedang','terjadi','di','saya','ini','itu','dan','ke','dari','untuk','kenapa','mengapa','bisa','akan','dengan'}
DOMAIN_RULES = {
    'environment/disaster': ('banjir','hujan','longsor','rob','lingkungan','sampah'),
    'economy/price': ('harga','inflasi','beras','pangan','sembako','ekonomi'),
    'infrastructure': ('jalan','jembatan','infrastruktur','drainase','akses'),
    'business': ('umkm','usaha','pasar','pedagang'),
    'health': ('kesehatan','puskesmas','dokter','medis','stunting'),
    'education': ('sekolah','pendidikan','kelas','guru','murid'),
}


def infer_intent(question: str):
    q = question.lower()
    domain = 'general'
    for label, keys in DOMAIN_RULES.items():
        if any(k in q for k in keys):
            domain = label
            break
    horizon = 30 if any(x in q for x in ['30 hari','sebulan','ke depan']) else None
    locations = sorted({str(o.get('region','')) for o in OBS if o.get('region')}, key=len, reverse=True)
    location = next((loc for loc in locations if loc.lower() in q), None)
    tokens = [x for x in re.findall(r'[\w-]+', q) if x not in STOP and len(x) > 2]
    return {'domain': domain, 'location': location, 'horizon_days': horizon, 'keywords': tokens[:10]}


def retrieve(intent):
    rows = []
    for o in OBS:
        region = str(o.get('region',''))
        metric = str(o.get('metric','')).lower()
        if intent['location'] and intent['location'].lower() not in region.lower():
            continue
        if intent['domain'] != 'general':
            keys = DOMAIN_RULES.get(intent['domain'], ())
            if not any(k in metric or k in str(o).lower() for k in keys):
                continue
        rows.append(o)
    return rows


def score_evidence(obs):
    if not obs:
        return 0, 'insufficient'
    scores = [float(SOURCES.get(o.get('source_id'), {}).get('reliability_score', 50)) for o in obs]
    avg = sum(scores) / len(scores)
    diversity = len(set(o.get('source_id') for o in obs))
    confidence = min(95, avg + min(15, max(0, diversity - 1) * 5))
    return round(confidence, 1), ('strong' if confidence >= 75 else 'moderate')


def answer_question(question: str):
    intent = infer_intent(question)
    evidence = retrieve(intent)
    confidence, strength = score_evidence(evidence)
    if not evidence:
        summary = 'Data yang relevan belum cukup untuk membuat kesimpulan yang dapat dipercaya.'
        status = 'insufficient_data'
    else:
        summary = 'Terdapat sinyal yang relevan pada dataset yang tersedia. Hasil ini masih bersifat analisis awal dan bukan klaim nasional terverifikasi.'
        status = 'supported'
    sources = []
    for o in evidence:
        src = SOURCES.get(o.get('source_id'), {})
        sources.append({'source': src.get('name','Unknown source'), 'type': src.get('source_type','unknown'), 'reliability': src.get('reliability_score'), 'metric': o.get('metric'), 'value': o.get('value'), 'unit': o.get('unit'), 'observed_at': o.get('observed_at')})
    return {
        'status': status,
        'question': question,
        'intent': intent,
        'summary': summary,
        'confidence': confidence,
        'evidence_strength': strength,
        'sources': sources,
        'uncertainty': ['Dataset repository saat ini masih berisi data demo/sintetis; connector produksi belum aktif.'],
        'next_actions': ['Lihat bukti', 'Pantau wilayah', 'Buat laporan PDF']
    }
