(()=>{
const map={
  nav:['home','map','triangle-alert','bar-chart-3','message-circle','brain','star','more-horizontal'],
  explorer:['flag','map','building-2','landmark','house','house'],
  categories:['wallet-cards','users','heart-pulse','construction','graduation-cap','leaf'],
  features:['map','messages-square','flag','chart-no-axes-combined','shield-check','layout-dashboard'],
  stats:['map-pin','building-2','landmark','house'],
  report:'users',
  search:'search'
};
function add(el,name,cls=''){if(!el||!name)return;const i=document.createElement('i');i.setAttribute('data-lucide',name);if(cls)i.className=cls;el.prepend(i)}
function paint(){
  document.querySelectorAll('.nav-link').forEach((e,i)=>{e.querySelector('[data-lucide]')?.remove();add(e,map.nav[i]);});
  document.querySelectorAll('.explorer-row').forEach((e,i)=>{const s=e.querySelector('span');if(s&&!s.querySelector('[data-lucide]')){s.textContent='';add(s,map.explorer[i],'ref-icon');}});
  document.querySelectorAll('.category-grid button').forEach((e,i)=>{const s=e.querySelector('.cat');if(s&&!s.querySelector('[data-lucide]')){s.textContent='';s.classList.add('ref-icon-circle');add(s,map.categories[i],'ref-cat-icon');}});
  document.querySelectorAll('.feature-items button').forEach((e,i)=>{const s=e.querySelector('span');if(s&&!s.querySelector('[data-lucide]')){s.textContent='';add(s,map.features[i],'ref-feature-icon');}});
  document.querySelectorAll('.stat-card .stat-icon').forEach((e,i)=>{if(!e.querySelector('[data-lucide]')){e.textContent='';add(e,map.stats[i],'ref-stat-icon');}});
  document.querySelectorAll('.report-badge').forEach(e=>{if(!e.querySelector('[data-lucide]')){e.textContent='';add(e,map.report,'ref-report-icon')}});
  document.querySelectorAll('.search-wrap>span').forEach(e=>{if(!e.querySelector('[data-lucide]')){e.textContent='';add(e,map.search,'ref-search-icon')}});
  try{window.lucide?.createIcons()}catch(err){console.warn('Lucide icon render skipped',err)}
}
function boot(){paint();setTimeout(paint,250)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();