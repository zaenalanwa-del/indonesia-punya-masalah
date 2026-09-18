const BASE='https://gfggmkeucgqkkyvummpu.supabase.co/rest/v1/live_incidents?select=id,source_name,source_type,source_url,title,description,incident_type,status,observed_at,published_at,latitude,longitude,location_text,severity,confidence_score,metadata&is_active=eq.true&order=observed_at.desc&limit=300';
const KEY=process.env.SUPABASE_ANON_KEY||'sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cb0';
export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 try{const r=await fetch(BASE,{headers:{apikey:KEY,Authorization:'Bearer '+KEY,Accept:'application/json'}});const text=await r.text();res.status(r.status).setHeader('Content-Type','application/json');return res.send(text)}
 catch(e){return res.status(502).json({error:e.message})}
}