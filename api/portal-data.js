const BASE='https://gfggmkeucgqkkyvummpu.supabase.co/functions/v1/public-portal-api';
export default async function handler(req,res){
  if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Method not allowed'});
  try{
    const q=new URLSearchParams();
    const action=String(req.query.action||'data');
    q.set('action',action);
    const keys=['limit','q','placement','days'];
    for(const k of keys) if(req.query[k]!=null) q.set(k,String(req.query[k]));
    const headers={'Content-Type':'application/json'};
    if(req.headers.authorization)headers.Authorization=req.headers.authorization;
    const r=await fetch(BASE+'?'+q.toString(),{
      method:req.method,
      headers,
      body:req.method==='POST'?JSON.stringify(req.body||{}):undefined
    });
    const text=await r.text();
    res.status(r.status);res.setHeader('Content-Type','application/json');
    return res.send(text);
  }catch(e){return res.status(502).json({error:'Data portal unavailable',message:e?.message||String(e)})}
}