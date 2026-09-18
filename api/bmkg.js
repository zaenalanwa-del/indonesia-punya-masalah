const BMKG='https://api.bmkg.go.id/publik';
async function getJson(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const mode=String(req.query.mode||'weather');
 if(mode==='incidents'){
  try{
   const d=await getJson('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
   const g=d?.Infogempa?.gempa;const incidents=[];
   if(g){const la=String(g.Lintang||''),lo=String(g.Bujur||'');const lat=parseFloat(la),lng=parseFloat(lo);incidents.push({source_name:'BMKG',source_type:'official_seismic',source_url:'https://data.bmkg.go.id/gempabumi/',title:'Gempa '+(g.Magnitude||'')+' '+(g.Wilayah||''),description:'Magnitudo '+(g.Magnitude||'')+', kedalaman '+(g.Kedalaman||'')+', '+(g.Potensi||''),incident_type:'Gempa Bumi',status:'official_signal',observed_at:new Date().toISOString(),latitude:/LS/i.test(la)?-Math.abs(lat):lat,longitude:/BB/i.test(lo)?-Math.abs(lng):lng,location_text:g.Wilayah||'',severity:Number(g.Magnitude)>=6?'high':Number(g.Magnitude)>=5?'medium':'low',confidence_score:.99,location_precision:'exact'})}
   res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');return res.status(200).json({source:'BMKG',generated_at:new Date().toISOString(),incidents});
  }catch(e){return res.status(502).json({error:'BMKG live feed unavailable',detail:String(e.message||e)})}
 }
 const adm4=String(req.query.adm4||'').trim();
 if(!/^\\d{2}\\.\\d{2}\\.\\d{2}\\.\\d{4}$/.test(adm4))return res.status(400).json({error:'adm4 must be an Indonesian level-IV administrative code'});
 try{const data=await getJson(BMKG+'/prakiraan-cuaca?adm4='+encodeURIComponent(adm4));res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=1800');return res.status(200).json({source:'BMKG',attribution:'Badan Meteorologi, Klimatologi, dan Geofisika',generated_at:new Date().toISOString(),data})}catch{return res.status(502).json({error:'BMKG unavailable'})}
}