(()=>{'use strict';
const U='https://gfggmkeucgqkkyvummpu.supabase.co',K='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw';
const D={layout:{hero:true,problem:true,map:true,statistics:true,voices:true,solutions:true,news:true,sources:true,footer:true,order:['hero','problem','map','statistics','voices','solutions','news','sources','footer']},ads:{enabled:true,max_slots_per_page:4,max_ad_ratio:.18}};
const $=s=>document.querySelector(s);
function sections(){return{
 hero:document.querySelector('#beranda .hero'),
 problem:document.querySelector('#masalah'),
 map:document.querySelector('#problemMap')?.closest('section'),
 statistics:document.querySelector('#beranda .rank'),
 voices:document.querySelector('#citizenVoice')?.closest('section'),
 solutions:document.querySelector('#solusi'),
 news:document.querySelector('#sumber-media'),
 sources:document.querySelector('#sumber-media'),
 footer:document.querySelector('footer')
}}
function apply(c){
 const m=sections(),l=c.layout||D.layout;
 Object.keys(m).forEach(k=>{if(m[k]&&l[k]===false)m[k].style.display='none';else if(m[k])m[k].style.display=''});
 // Keep the source hub and footer structurally pinned at the very bottom.
 const source=m.sources, footer=m.footer;
 if(source&&footer){
   source.style.order=''; footer.style.order='';
   const parent=footer.parentElement;
   if(parent===source.parentElement){
     parent.insertBefore(source,footer);
   }
 }
 // Reorder only the sections that are explicitly controlled and share the same parent.
 const order=(l.order||D.layout.order).filter(k=>k!=='news'&&k!=='sources'&&k!=='footer'&&m[k]);
 const groups=new Map();
 order.forEach(k=>{const e=m[k],p=e?.parentElement;if(e&&p){if(!groups.has(p))groups.set(p,[]);groups.get(p).push(e)}});
 groups.forEach((es,p)=>{
   const set=new Set(es);
   const rest=[...p.children].filter(e=>!set.has(e)&&e!==source&&e!==footer);
   es.forEach(e=>p.appendChild(e));
   rest.forEach(e=>p.appendChild(e));
 });
 // Final hard pin after all reordering.
 if(source&&footer&&source.parentElement===footer.parentElement) footer.parentElement.insertBefore(source,footer);
 if(footer){footer.style.position='relative';footer.style.zIndex='2'}
 const ads=c.ads||D.ads;
 if(ads.enabled===false)document.querySelectorAll('[data-ad-placement],#pengiklan').forEach(e=>e.style.display='none');
 window.NuansaSmartPublic={config:c,refresh:()=>apply(c)}
}
async function price(){
 const el=$('#publicAdPriceSummary');if(!el)return;
 try{
  const sb=window.supabase?.createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
  if(!sb)return;
  const [tr,pt]=await Promise.all([
   sb.from('ad_traffic_daily').select('unique_visitors,day').order('day',{ascending:false}).limit(30),
   sb.from('ad_price_tiers').select('label,tier_name,factor,min_unique_visitors_30d,max_unique_visitors_30d').eq('active',true).order('priority',{ascending:false})
  ]);
  const v=(tr.data||[]).reduce((n,x)=>Math.max(n,Number(x.unique_visitors||0)),0);
  const tiers=pt.data||[],t=tiers.find(x=>v>=Number(x.min_unique_visitors_30d||0)&&(x.max_unique_visitors_30d==null||v<=Number(x.max_unique_visitors_30d)))||tiers[tiers.length-1];
  el.textContent='Trafik 30 hari: '+v.toLocaleString('id-ID')+' unique · Tier '+(t?.label||t?.tier_name||'Normal')+' · Faktor '+Number(t?.factor||1).toFixed(2)+'×'
 }catch{el.textContent='Harga mengikuti tier trafik 30 hari saat kampanye dibuat.'}
}
async function boot(){
 let c=D;
 try{
  const sb=window.supabase?.createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
  if(sb){
   const r=await sb.from('cms_settings').select('key,value').eq('key','smart_public_engine').limit(1);
   if(!r.error&&r.data?.[0]?.value){
    const x=r.data[0].value;
    c={...D,...x,layout:{...D.layout,...x.layout},ads:{...D.ads,...x.ads}};
    c.layout.sources=true;c.layout.footer=true;
   }
  }
 }catch{}
 apply(c);price()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();