(()=>{'use strict';
const API='https://gfggmkeucgqkkyvummpu.supabase.co/functions/v1/public-portal-api';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=(el)=>el.querySelector('img')?.getAttribute('src')||'';
const visuals=[
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Press_Conference_of_International_Global_Network.jpg'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Meeting_at_the_Garuda_Palace.jpg'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Indonesian_students.jpg'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Observe_Rainfall_and_Weather_Changes.jpg'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Indonesia_population_pyramid_2026.png'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Village_Meeting_Hall_of_Pandansari.jpg'),
 '/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Coordinating_Minister_Airlangga_%E2%80%93_USTR_Meeting_(cropped).jpg')
];
function visualFor(item,index){const t=String(item.title||'').toLowerCase();let n=index%visuals.length;if(/hujan|cuaca|petir|iklim|banjir|kekeringan/.test(t))n=4;if(/pendidikan|sekolah|santri|siswa|rektor/.test(t))n=2;if(/kesehatan|ambulans|bpjs|rumah sakit/.test(t))n=1;if(/ekonomi|bisnis|honor|baterai|kerja/.test(t))n=5;if(/bencana|gempa|korban|kapal/.test(t))n=3;return visuals[n]}
const mediaGrid=()=>document.querySelector('#sumber-media .sourceGroup .sourceGrid:not(.sourceGridOfficial)');
const officialVisuals={
  'BPS':'/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/2020_Indonesian_population_census_infographics.jpg'),
  'BMKG':'/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Observe_Rainfall_and_Weather_Changes.jpg'),
  'BNPB':'/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg'),
  'Data.go.id':'/api/image?src='+encodeURIComponent('https://commons.wikimedia.org/wiki/Special:Redirect/file/Indonesia_population_pyramid_2026.png'),
  'BIG / TanahAir':'/assets/IKN%202026.png'
};
const officialVisualFor=(item,index,fallback)=>officialVisuals[String(item.source||'').trim()]||fallback||visualFor(item,index);
const officialGrid=()=>document.querySelector('#sumber-media .sourceGridOfficial');
function card(item, fallbackImage, fallbackAlt,index){
  const a=document.createElement('a'); a.className='sourceCard'; a.href=item.link||'#'; a.target='_blank'; a.rel='noopener noreferrer';
  const source=String(item.source||fallbackAlt||'Sumber publik').trim();
  const supplied=item.image_url||item.image||item.thumbnail||item.imageUrl||'';
  const image=(officialVisuals[source]||supplied||visualFor(item,index)||fallbackImage);
  a.innerHTML='<div class="sourceVisual"><img src="'+esc(image)+'" alt="'+esc(source+' — '+(item.title||''))+'" loading="lazy"></div><div><h4>'+esc(source)+'</h4><h3 class="sourceHeadline">'+esc(item.title||'Informasi terbaru dari sumber terkait.')+'</h3><small>'+esc(item.published_at||'Terbaru')+'</small><br><b>Buka sumber ↗</b></div>';
  return a;
}
function replaceGrid(grid,items){
  if(!grid||!items.length)return;
  const old=[...grid.querySelectorAll('.sourceCard')],fallback=img(old[0])||'';
  grid.replaceChildren(...items.slice(0,12).map((x,i)=>card(x,fallback,x.source,i)));
  grid.dataset.autoRotator='';
}
async function load(){
  try{
    const c=new AbortController(),timer=setTimeout(()=>c.abort(),5000);const r=await fetch(API+'?action=news&t='+Date.now(),{cache:'no-store',signal:c.signal}); clearTimeout(timer); if(!r.ok)throw new Error('feed');
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