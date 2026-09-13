import json, re
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {x['id']: x for x in json.loads((ROOT/'sample_data/demo_sources.json').read_text())}
OBS = json.loads((ROOT/'sample_data/demo_observations.json').read_text())

STOP = {'apa','yang','sedang','terjadi','di','saya','ini','itu','dan','ke','dari','untuk','kenapa','mengapa'}


def infer_intent(question: str):
    q = question.lower()
    domain = 'general'
    for key, label in [('banjir','environment/disaster'),('harga','economy/price'),('jalan','infrastructure'),('umkm','business'),('usaha','business')]:
        if key in q:
            domain = label; break
    horizon = 30 if any(x in q for x in ['30 hari','sebulan','ke depan']) else None
    location = None
    known_locations = ['Purworejo','Jawa Tengah','Indonesia','Kabupaten Purworejo']
    for loc in known_locations:
        if loc.lower() in q:
            location = loc; break
    tokens = [x for x in re.findall(r'[\w-]+', q) if x not in STOP and len(x) > 2]
    return {'domain': domain, 'location': location, 'horizon_days': horizon, 'keywords': tokens[:8]}


def retrieve(intent):
    rows=[]
    for o in OBS:
        if intent['location'] and intent['location'].lower() not in o['region'].lower() and o['region'].lower() not in intent['location'].lower():
            continue
        if intent['domain'].startswith('environment') and 'flood' not in o['metric'] and 'rain' not in o['metric']:
            continue
        rows.append(o)
    return rows


def score_evidence(obs):
    if not obs:
        return 0, 'insufficient'
    scores=[]
    for o in obs:
        scores.append(SOURCES[o['source_id']]['reliability_score'])
    avg=sum(scores)/len(scores)
    diversity=len(set(o['source_id'] for o in obs))
    confidence=min(95, avg + min(15, (diversity-1)*5))
    return round(confidence,1), 'strong' if confidence >= 75 else 'moderate'


def answer_question(question: str):
    intent=infer_intent(question)
    evidence=retrieve(intent)
    confidence,strength=score_evidence(evidence)
    if not evidence:
        summary='Data yang relevan belum cukup untuk membuat kesimpulan yang dapat dipercaya.'
        status='insufficient_data'
    else:
        latest=sorted(evidence,key=lambda x:x['observed_at'])[-1]
        if any('flood' in x['metric'] for x in evidence):
            summary='Ada sinyal peningkatan risiko/aktivitas banjir di wilayah yang dianalisis, tetapi sinyal sosial tetap diperlakukan sebagai indikasi dan perlu diverifikasi dengan sumber lain.'
        else:
            summary='Terdapat beberapa sinyal yang relevan dengan pertanyaan pengguna; kesimpulan awal dibangun dari sumber yang tersedia.'
        status='supported'
    sources=[]
    for o in evidence:
        src=SOURCES[o['source_id']]
        sources.append({'source':src['name'],'type':src['source_type'],'reliability':src['reliability_score'],'metric':o['metric'],'value':o['value'],'unit':o['unit'],'observed_at':o['observed_at']})
    return {
        'status':status,
        'question':question,
        'intent':intent,
        'summary':summary,
        'confidence':confidence,
        'evidence_strength':strength,
        'sources':sources,
        'uncertainty':['Demo data is synthetic; production connectors must be added.'] if evidence else ['Tidak ada bukti cukup pada dataset demo.'],
        'next_actions':['Lihat bukti','Pantau wilayah','Buat laporan PDF']
    }
