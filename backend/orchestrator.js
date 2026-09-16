import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = async (name) => {
  try { return JSON.parse(await fs.readFile(path.join(ROOT, 'data', name), 'utf8')); }
  catch { return []; }
};

const STOP = new Set(['apa','yang','sedang','terjadi','di','saya','ini','itu','dan','ke','dari','untuk','kenapa','mengapa','bisa','akan','dengan']);
const DOMAIN_RULES = {
  'environment/disaster':['banjir','hujan','longsor','rob','lingkungan','sampah'],
  'economy/price':['harga','inflasi','beras','pangan','sembako','ekonomi'],
  infrastructure:['jalan','jembatan','infrastruktur','drainase','akses'],
  business:['umkm','usaha','pasar','pedagang'],
  health:['kesehatan','puskesmas','dokter','medis','stunting'],
  education:['sekolah','pendidikan','kelas','guru','murid']
};

export async function answerQuestion(question) {
  const [sourceRows, observations] = await Promise.all([readJson('demo_sources.json'), readJson('demo_observations.json')]);
  const sources = Object.fromEntries(sourceRows.map(x => [x.id, x]));
  const q = String(question || '').trim().toLowerCase();
  let domain = 'general';
  for (const [label, keys] of Object.entries(DOMAIN_RULES)) if (keys.some(k => q.includes(k))) { domain = label; break; }
  const regions = [...new Set(observations.map(o => o.region).filter(Boolean))].sort((a,b)=>b.length-a.length);
  const location = regions.find(x => q.includes(x.toLowerCase())) || null;
  const horizon_days = ['30 hari','sebulan','ke depan'].some(x=>q.includes(x)) ? 30 : null;
  const keywords = q.match(/[\p{L}\p{N}_-]+/gu)?.filter(x=>!STOP.has(x)&&x.length>2).slice(0,10) || [];
  const evidence = observations.filter(o => {
    if (location && !String(o.region).toLowerCase().includes(location.toLowerCase())) return false;
    if (domain !== 'general') {
      const keys = DOMAIN_RULES[domain] || [];
      const hay = JSON.stringify(o).toLowerCase();
      if (!keys.some(k=>hay.includes(k))) return false;
    }
    return true;
  });
  const scores = evidence.map(o=>Number(sources[o.source_id]?.reliability_score ?? 50));
  const avg = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;
  const diversity = new Set(evidence.map(o=>o.source_id)).size;
  const confidence = evidence.length ? Math.round(Math.min(95,avg+Math.min(15,Math.max(0,diversity-1)*5))*10)/10 : 0;
  const resultSources = evidence.map(o=>({source:sources[o.source_id]?.name||'Unknown source',type:sources[o.source_id]?.source_type||'unknown',reliability:sources[o.source_id]?.reliability_score ?? null,metric:o.metric,value:o.value,unit:o.unit,observed_at:o.observed_at}));
  return {
    status:evidence.length?'supported':'insufficient_data', question, intent:{domain,location,horizon_days,keywords},
    summary:evidence.length?'Terdapat sinyal yang relevan pada dataset yang tersedia. Hasil ini masih analisis awal dan bukan klaim nasional terverifikasi.':'Data yang relevan belum cukup untuk membuat kesimpulan yang dapat dipercaya.',
    confidence, evidence_strength:evidence.length?(confidence>=75?'strong':'moderate'):'insufficient', sources:resultSources,
    uncertainty:['Dataset repository saat ini masih berisi data demo/sintetis; connector produksi belum aktif.'],
    next_actions:['Lihat bukti','Pantau wilayah','Buat laporan PDF']
  };
}
