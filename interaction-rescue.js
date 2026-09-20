(()=>{'use strict';
const boot=()=>{
  if(window.__nkInteractionRescue)return;
  window.__nkInteractionRescue=true;
  document.addEventListener('click',e=>{
    const auth=e.target.closest('#authBtn,.authBtn');
    if(auth&&window.NK_INTERACTIONS?.authPanel){e.preventDefault();e.stopImmediatePropagation();window.NK_INTERACTIONS.authPanel();return;}
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
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();