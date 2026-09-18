const BASE='https://gfggmkeucgqkkyvummpu.supabase.co/functions/v1/public-portal-api';
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const headers={'Content-Type':'application/json'};
    if(req.headers.authorization)headers.Authorization=req.headers.authorization;
    const r=await fetch(BASE+'?action=report',{method:'POST',headers,body:JSON.stringify(req.body||{})});
    const text=await r.text();
    res.status(r.status);res.setHeader('Content-Type','application/json');
    return res.send(text);
  }catch(e){return res.status(502).json({error:'Report service unavailable',message:e.message})}
}