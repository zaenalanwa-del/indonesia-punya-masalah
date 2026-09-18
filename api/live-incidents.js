import crypto from 'node:crypto';

const SUPABASE_URL=process.env.SUPABASE_URL||'https://gfggmkeucgqkkyvummpu.supabase.co';
const SERVICE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET=process.env.CRON_SECRET;

function auth(req){
  const a=String(req.headers.authorization||'');
  const token=a.startsWith('Bearer ')?a.slice(7):'';
  return Boolean(CRON_SECRET&&token===CRON_SECRET);
}
async function sb(path,options={}){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,headers:{apikey:SERVICE_KEY,Authorization:`Bearer ${SERVICE_KEY}`,'Content-Type':'application/json',...(options.headers||{})}});
  const t=await r.text(); let d=null; try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok)throw new Error(`Supabase ${r.status}: ${typeof d==='string'?d:d?.message||'request failed'}`);
  return d;
}
function hash(s){return crypto.createHash('sha256').update(s).digest('hex').slice(0,48)}
function pick(o,keys){for(const k of keys){if(o?.[k]!==undefined&&o?.[k]!==null&&String(o[k]).trim()!=='')return o[k]}return null}
function parseXmlItems(xml){
  const items=[]; const re=/<item\\b[\\s\\S]*?<\\/item>/gi; const blocks=xml.match(re)||[];
  for(const b of blocks.slice(0,80)){
    const get=(tag)=>{const m=b.match(new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`,'i'));return m?m[1].replace(/<!\\[CDATA\\[|\\]\\]>/g,'').replace(/<[^>]+>/g,'').trim():''};
    const title=get('title'),link=get('link'),desc=get('description'),date=get('pubDate');
    if(title&&link)items.push({title,link,description:desc,published_at:date?new Date(date).toISOString():null});
  }
  return items;
}
async function fetchJson(url){
  const r=await fetch(url,{headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}
async function upsert(rows){
  if(!rows.length)return 0;
  await sb('live_incidents?on_conflict=source_name,external_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
  return rows.length;
}
async function getRegions(){
  const rows=await sb('regions?select=id,name,level,latitude,longitude&level=in.(province,regency)&is_active=eq.true&limit=1000');
  return Array.isArray(rows)?rows:[];
}
function matchRegion(text,regions){
  const s=String(text||'').toLowerCase();
  let best=null;
  for(const r of regions){
    const n=String(r.name||'').toLowerCase();
    if(n.length<4)continue;
    if(s.includes(n) && (!best||n.length>String(best.name).length))best=r;
  }
  return best;
}
async function bnpb(){
  const url='https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=json&resultRecordCount=2000&orderByFields=objectid%20DESC';
  const d=await fetchJson(url);
  const features=Array.isArray(d.features)?d.features:[];
  return features.map((f,i)=>{
    const a=f.attributes||{}, g=f.geometry||{};
    const title=pick(a,['kejadian','jenis_bencana','jenis','nama_bencana','Kejadian'])||'Kejadian bencana';
    const loc=pick(a,['lokasi','Location','lokasi_kejadian','alamat'])||'';
    const region=matchRegion(String(loc)+' '+JSON.stringify(a),REGIONS);
    const lat=Number(g.y),lng=Number(g.x);
    return {source_name:'BNPB',source_type:'official_disaster',source_url:'https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/0',external_id:String(pick(a,['id','kode_bencana','objectid'])||hash(JSON.stringify(a))),title:String(title),description:String(pick(a,['kronologi','deskripsi','keterangan'])||loc||''),incident_type:String(title),status:'official_signal',observed_at:new Date().toISOString(),published_at:null,latitude:Number.isFinite(lat)?lat:(region?.latitude||null),longitude:Number.isFinite(lng)?lng:(region?.longitude||null),region_id:region?.id||null,location_text:loc||region?.name||null,severity:'unknown',confidence_score:0.95,raw_payload:{attributes:a,geometry:g},metadata:{location_precision:Number.isFinite(lat)&&Number.isFinite(lng)?'exact':'region_centroid'}}});
}
async function bmkg(){
  const url='https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
  const d=await fetchJson(url); const g=d?.Infogempa?.gempa; if(!g)return[];
  const lat=Number(String(g.Lintang||'').replace(/[^0-9.-]/g,'')); const lng=Number(String(g.Bujur||'').replace(/[^0-9.-]/g,''));
  const la=String(g.Lintang||''); const lo=String(g.Bujur||'');
  const latitude=/LS/i.test(la)?-Math.abs(lat):lat; const longitude=/BB/i.test(lo)?-Math.abs(lng):lng;
  return [{source_name:'BMKG',source_type:'official_seismic',source_url:'https://data.bmkg.go.id/gempabumi/',external_id:String(g.Shakemap||g.Tanggal+'-'+g.Jam),title:`Gempa ${g.Magnitude||''} ${g.Wilayah||''}`.trim(),description:`Gempa bumi ${g.Magnitude||''} M; kedalaman ${g.Kedalaman||''}; ${g.Potensi||''}`.trim(),incident_type:'Gempa Bumi',status:'official_signal',observed_at:new Date().toISOString(),published_at:null,latitude,longitude,region_id:null,location_text:g.Wilayah||null,severity:Number(g.Magnitude)>=6?'high':Number(g.Magnitude)>=5?'medium':'low',confidence_score:0.99,raw_payload:g,metadata:{location_precision:'exact'}}];
}
async function news(){
  const feeds=['https://www.antaranews.com/rss/terkini.xml','https://www.antaranews.com/rss/metro-kriminalitas.xml','https://www.antaranews.com/rss/nusantara.xml'];
  const rows=[];
  for(const url of feeds){
    try{const r=await fetch(url,{headers:{Accept:'application/rss+xml,application/xml,text/xml'}});if(!r.ok)continue;const xml=await r.text();for(const x of parseXmlItems(xml)){const text=(x.title+' '+x.description).toLowerCase();if(!/(kebakaran|kecelakaan|banjir|longsor|gempa|erupsi|ledakan|kebakaran|tenggelam|tabrakan|darurat)/i.test(text))continue;const region=matchRegion(x.title+' '+x.description,REGIONS);rows.push({source_name:'ANTARA RSS',source_type:'news_signal',source_url:x.link,external_id:hash(x.link),title:x.title,description:x.description||'',incident_type:(text.match(/kebakaran|kecelakaan|banjir|longsor|gempa|erupsi|ledakan|tenggelam|tabrakan|darurat/i)||['Peristiwa'])[0],status:'unverified',observed_at:x.published_at||new Date().toISOString(),published_at:x.published_at,latitude:region?.latitude||null,longitude:region?.longitude||null,region_id:region?.id||null,location_text:region?.name||null,severity:'unknown',confidence_score:0.55,raw_payload:x,metadata:{location_precision:region?'region_centroid':'unknown',verification_note:'Sinyal berita; bukan konfirmasi kejadian lapangan'}})}}catch(e){}
  }
  return rows;
}
let REGIONS=[];
export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  if(!SERVICE_KEY||!auth(req))return res.status(401).json({error:'Unauthorized'});
  try{
    REGIONS=await getRegions();
    const results=await Promise.all([bnpb(),bmkg(),news()]);
    const rows=results.flat();
    const count=await upsert(rows);
    await sb('live_incidents?is_active=eq.true&observed_at=lt.'+encodeURIComponent(new Date(Date.now()-1000*60*60*24*14).toISOString()),{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({is_active:false})});
    return res.status(200).json({ok:true,generated_at:new Date().toISOString(),fetched:rows.length,upserted:count,sources:{bnpb:results[0].length,bmkg:results[1].length,news:results[2].length}});
  }catch(e){return res.status(500).json({error:e.message})}
}