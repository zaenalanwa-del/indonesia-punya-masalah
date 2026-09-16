export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).json({status:'error',message:'Method Not Allowed'});
  try{
    const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const title=String(b.title||'').trim(), narrative=String(b.narrative||'').trim();
    if(!title||!narrative) return res.status(400).json({status:'error',message:'Judul dan uraian wajib diisi.'});
    const id='RPT-'+Date.now().toString(36).toUpperCase();
    return res.status(202).json({status:'received',persistence:'pending_production_storage',message:'Laporan diterima untuk antrean verifikasi.',report:{id,title,narrative,category:b.category||'Lainnya',region_name:b.region_name||'Indonesia',verification_status:'received',created_at:new Date().toISOString()}});
  }catch(e){return res.status(400).json({status:'error',message:'Payload laporan tidak valid.'})}
}
