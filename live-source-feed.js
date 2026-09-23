(()=>{'use strict';
const API='/api/public-news.js';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=(el)=>el.querySelector('img')?.getAttribute('src')||'';
const mediaGrid=()=>document.querySelector('#sumber-media .sourceGroup .sourceGrid:not(.sourceGridOfficial)');
const officialGrid=()=>document.querySelector('#sumber-media .sourceGridOfficial');
function card(item, fallbackImage, fallbackAlt){
  const a=document.createElement('a'); a.className='sourceCard'; a.href=item.link||'#'; a.target='_blank'; a.rel='noopener noreferrer';
  a.innerHTML='<div class="sourceVisual"><img src="'+esc(fallbackImage)+'" alt="'+esc(item.source||fallbackAlt||'Sumber publik')+'" loading="lazy"></div><div><h4>'+esc(item.source||'Sumber')+'</h4><p>'+esc(item.title||item.description||'Informasi terbaru dari sumber terkait.')+'</p><small>'+esc(item.published_at||'Terbaru')+'</small><br><b>Buka sumber ↗</b></div>';
  return a;
}
function replaceGrid(grid,items){
  if(!grid||!items.length)return;
  const old=[...grid.querySelectorAll('.sourceCard')],fallback=img(old[0])||'';
  grid.replaceChildren(...items.slice(0,12).map(x=>card(x,fallback,x.source)));
  grid.dataset.autoRotator='';
}
async function load(){
  try{
    const r=await fetch(API+'?t='+Date.now(),{cache:'no-store'}); if(!r.ok)throw new Error('feed');
    const j=await r.json(); if(!j.ok)return;
    const items=j.items||[];
    const media=items.filter(x=>x.type==='Media Nasional');
    const official=items.filter(x=>x.type==='Sumber Resmi');
    replaceGrid(mediaGrid(),media);
    replaceGrid(officialGrid(),official);
  }catch(e){/* retain curated fallback cards */}
}
load();
setInterval(load,5*60*1000);
})();