(()=>{
'use strict';

// Public boundary: internal intelligence/control views never become routable from the public UI.
const INTERNAL_VIEWS=new Set(['intelligence','future','control','model','models','evidence','query','pipeline','ingestion','moderation','operations']);
const INTERNAL_WORDS=/^(wawasan|intelligence|kemungkinan|perkiraan|perbandingan|skenario|model registry|evidence mentah|query engine|orchestrator|pipeline control)$/i;

function isInternalView(v){return INTERNAL_VIEWS.has(String(v||'').toLowerCase())}
function cleanPublicNav(root=document){
  root.querySelectorAll('[data-view]').forEach(el=>{
    if(isInternalView(el.dataset.view)) el.remove();
  });
  root.querySelectorAll('.nav-link,.pr-menu').forEach(el=>{
    if(INTERNAL_WORDS.test((el.textContent||'').trim())) el.remove();
  });
}

const originalRender=window.render;
window.render=function(view,arg=''){
  if(isInternalView(view)){
    // Internal modules belong under /admin/; public navigation falls back to the public information page.
    if(typeof originalRender==='function') return originalRender('more');
    return;
  }
  return typeof originalRender==='function' ? originalRender(view,arg) : undefined;
};

cleanPublicNav();
new MutationObserver(()=>cleanPublicNav()).observe(document.body,{childList:true,subtree:true});
})();
