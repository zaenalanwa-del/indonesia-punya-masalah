const BASE='https://gfggmkeucgqkkyvummpu.supabase.co/functions/v1/public-portal-api';
export default async function handler(req,res){
  try{
    const q=new URLSearchParams();
    const action=String(req.query.action||'pricing');
    q.set('action',action);
    for(const k of ['placement','limit','days']) if(req.query[k]!=null) q.set(k,String(req.query[k]));
    const headers={'Content-Type':'application/json'};
    if(req.headers.authorization)headers.Authorization=req.headers.authorization;
    const r=await fetch(BASE+'?'+q.toString(),{
      method:req.method,
      headers,
      body:req.method==='GET'||req.method==='HEAD'?undefined:JSON.stringify(req.body||{})
    });
    const text=await r.text();
    res.status(r.status).setHeader('Content-Type','application/json');
    return res.send(text);
  }catch(e){
    return res.status(502).json({error:'Ad service unavailable',message:e?.message||String(e)});
  }
}