const BMKG='https://api.bmkg.go.id/publik';
const SB='https://gfggmkeucgqkkyvummpu.supabase.co/rest/v1';
const KEY=process.env.SUPABASE_ANON_KEY||'sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw';
const headers={apikey:KEY,Authorization:'Bearer '+KEY,Accept:'application/json'};
async function json(url,opts={}){const r=await fetch(url,opts);if(!r.ok)throw Error('upstream '+r.status);return r.json()}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return String(h)}
function pick(o,keys){for(const k of keys)if(o?.[k]!=null&&String(o[k]).trim())return o[k];return null}
function parseXml(xml){const out=[];for(const b of (xml.match(/<item\\b[\\s\\S]*?<\\/item>/gi)||[]).slice(0,60)){const g=t=>{const m=b.match(new RegExp('<'+t+'(?:[^>]*)>([\\s\\S]*?)<\\/'+t+'>','i'));return m?m[1].replace(/<!\\[CDATA\\[|\\]\\]>/g,'').replace(/<[^>]+>/g,'').trim():''};const title=g('title'),link=g('link'),description=g('description'),pub=g('pubDate');if(title&&link)out.push({title,link,description,published_at:pub?new Date(pub).toISOString():null})}return out}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 if(req.query.mode==='incidents'){
  try{
   const [eq,regions]=await Promise.all([
    json('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json'),
    json(SB+'/regions?select=id,name,level,latitude,longitude&level=in.(province,regency)&is_active=eq.true&limit=1000',{headers})
   ]);
   const regionList=Array.isArray(regions)?regions:[];
   const match=t=>{const s=String(t||'').toLowerCase();let best=null;for(const r of regionList){const n=String(r.name||'').toLowerCase();if(n.length>3&&s.includes(n)&&(!best||n.length>String(best.name).length))best=r}return best};
   const g=eq?.Infogempa?.gempa;const rows=[];
   if(g){const la=String(g.Lintang||''),lo=String(g.Bujur||'');const a=parseFloat(la),b=parseFloat(lo);rows.push({source_name:'BMKG',source_type:'official_seismic',source_url:'https://data.bmkg.go.id/gempabumi/',title:'Gempa '+(g.Magnitude||'')+' '+(g.Wilayah||''),description:'Magnitudo '+(g.Magnitude||'')+', kedalaman '+(g.Kedalaman||'')+', '+(g.Potensi||''),incident_type:'Gempa Bumi',status:'official_signal',observed_at:new Date().toISOString(),latitude:/LS/i.test(la)?-Math.abs(a):a,longitude:/BB/i.test(lo)?-Math.abs(b):b,location_text:g.Wilayah||'',severity:Number(g.Magnitude)>=6?'high':Number(g.Magnitude)>=5?'medium':'low',confidence_score:.99,location_precision:'exact'})}
   const feeds=['https://www.antaranews.com/rss/terkini.xml','https://www.antaranews.com/rss/metro-kriminalitas.xml','https://www.antaranews.com/rss/nusantara.xml'];
   for(const u of feeds){try{const rr=await fetch(u,{headers:{Accept:'application/rss+xml,application/xml,text/xml'}});if(!rr.ok)continue;for(const n of parseXml(await rr.text())){if(!/(kebakaran|kecelakaan|banjir|longsor|gempa|erupsi|ledakan|tenggelam|tabrakan|darurat)/i.test(n.title+' '+n.description))continue;const r=match(n.title+' '+n.description);rows.push({source_name:'ANTARA RSS',source_type:'news_signal',source_url:n.link,title:n.title,description:n.description||'',incident_type:(n.title.match(/kebakaran|kecelakaan|banjir|longsor|gempa|erupsi|ledakan|tenggelam|tabrakan|darurat/i)||['Peristiwa'])[0],status:'unverified',observed_at:n.published_at||new Date().toISOString(),published_at:n.published_at,latitude:r?.latitude||null,longitude:r?.longitude||null,location_text:r?.name||'Lokasi belum teridentifikasi',severity:'unknown',confidence_score:.55,location_precision:r?'region_centroid':'unknown'})}}catch{}}
   res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
   return res.status(200).json({source:'BMKG + BNPB-linked public feeds + ANTARA RSS',generated_at:new Date().toISOString(),incidents:rows});
  }catch(e){return res.status(502).json({error:'Live incident feeds unavailable',message:e.message})}
 }
 const adm4=String(req.query.adm4||'').trim();
 if(!/^\\d{2}\\.\\d{2}\\.\\d{2}\\.\\d{4}$/.test(adm4))return res.status(400).json({error:'adm4 must be an Indonesian level-IV administrative code'});
 try{const data=await json(BMKG+'/prakiraan-cuaca?adm4='+encodeURIComponent(adm4),{headers:{Accept:'application/json'}});res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=1800');return res.status(200).json({source:'BMKG',attribution:'Badan Meteorologi, Klimatologi, dan Geofisika',generated_at:new Date().toISOString(),data})}catch{return res.status(502).json({error:'BMKG unavailable'})}
}