(()=>{'use strict';
const loadScript=(src,check)=>{
  if(check&&check())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const old=document.querySelector('script[data-nk-loader="'+src+'"]');
    if(old){old.addEventListener('load',()=>resolve(),{once:true});old.addEventListener('error',reject,{once:true});return;}
    const s=document.createElement('script');s.src=src;s.async=true;s.dataset.nkLoader=src;
    s.onload=()=>resolve();s.onerror=reject;document.head.appendChild(s);
  });
};
const ensureSupabase=()=>loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',()=>!!window.supabase?.createClient);
const ensureLeaflet=()=>loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',()=>!!window.L);
const boot=()=>{
  if(window.__nkInteractionRescue)return;
  window.__nkInteractionRescue=true;
  document.addEventListener('click',async e=>{
    const auth=e.target.closest('#authBtn,.authBtn');
    if(auth){
      e.preventDefault();e.stopImmediatePropagation();
      try{await ensureSupabase();window.NK_INTERACTIONS?.authPanel?.()}catch(err){alert('Layanan login sedang dimuat. Coba klik Login sekali lagi.')}
      return;
    }
    const navBtn=e.target.closest('.nav .group>button');
    if(navBtn){
      e.preventDefault();e.stopImmediatePropagation();
      const g=navBtn.closest('.group');
      document.querySelectorAll('.nav .group').forEach(x=>{if(x!==g)x.classList.remove('open')});
      g?.classList.toggle('open');
      return;
    }
    const sub=e.target.closest('.nav .group .sub a');
    if(sub&&window.NK_INTERACTIONS?.handleSubmenu){e.preventDefault();e.stopImmediatePropagation();window.NK_INTERACTIONS.handleSubmenu(sub.textContent.trim());return;}
    const act=e.target.closest('[data-act]');
    if(act&&window.NK_INTERACTIONS?.actions){
      const fn=window.NK_INTERACTIONS.actions[act.dataset.act];
      if(typeof fn==='function'){e.preventDefault();e.stopImmediatePropagation();fn();return;}
    }
  },true);
  window.addEventListener('error',err=>{
    console.warn('NuansaKita interaction rescue:',err.message);
    document.documentElement.classList.add('nk-js-error');
  });
  ensureSupabase().catch(()=>{});
  ensureLeaflet().then(()=>{try{window.loadPortal?.()}catch{}}).catch(()=>{});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();