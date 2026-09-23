(()=>{'use strict';
const ROTATE_MS=8000;
const ISSUE_SELECTOR='.issueGrid';
const SOURCE_SELECTOR='.sourceGrid';

function visibleCount(){
  const w=window.innerWidth||1200;
  if(w<=560)return 1;
  if(w<=900)return 2;
  return 4;
}
function makeRotator(container,opts={}){
  if(!container||container.dataset.autoRotator==='1')return;
  const items=[...container.children].filter(el=>el.matches(opts.itemSelector||':scope > *'));
  if(items.length<=1)return;
  container.dataset.autoRotator='1';
  let index=0,timer=null,paused=false;
  const render=()=>{
    if(paused)return;
    const n=Math.min(opts.count?opts.count():items.length,items.length);
    const ordered=[];
    for(let i=0;i<items.length;i++)ordered.push(items[(index+i)%items.length]);
    ordered.forEach(el=>el.style.display='none');
    ordered.slice(0,n).forEach(el=>el.style.display='');
    index=(index+1)%items.length;
  };
  const start=()=>{
    clearInterval(timer);
    if(items.length> (opts.count?opts.count():items.length))timer=setInterval(render,ROTATE_MS);
  };
  container.addEventListener('mouseenter',()=>{paused=true});
  container.addEventListener('mouseleave',()=>{paused=false});
  container.addEventListener('focusin',()=>{paused=true});
  container.addEventListener('focusout',()=>{paused=false});
  render();start();
  window.addEventListener('resize',()=>{render();start()},{passive:true});
}

function init(){
  const issue=document.querySelector(ISSUE_SELECTOR);
  if(issue)makeRotator(issue,{count:visibleCount,itemSelector:'.issue'});
  document.querySelectorAll(SOURCE_SELECTOR).forEach(grid=>{
    makeRotator(grid,{count:visibleCount,itemSelector:'.sourceCard'});
  });
}
const observer=new MutationObserver(()=>init());
observer.observe(document.body,{childList:true,subtree:true});
init();
window.setTimeout(init,1200);
window.setTimeout(init,3500);
})();