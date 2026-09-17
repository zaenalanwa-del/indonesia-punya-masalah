(()=>{
  'use strict';
  document.documentElement.dataset.publicUi='reference-v7';

  const css = `
  /* SUARA WARGA — keep the reference card visible, and provide a true click-to-open popup. */
  .voices{animation:suaraWargaSlideUp .45s cubic-bezier(.2,.8,.2,1) both!important}
  .sw-popup{
    position:fixed;inset:0;z-index:200;background:rgba(7,29,55,.48);
    display:none;align-items:center;justify-content:center;padding:24px;
    backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);
  }
  .sw-popup.show{display:flex;animation:swFadeIn .18s ease both}
  .sw-popup-panel{
    width:min(430px,calc(100vw - 28px));max-height:min(760px,calc(100vh - 40px));
    overflow:auto;background:#fff;border:1px solid #dfe9f4;border-radius:16px;
    box-shadow:0 24px 80px rgba(9,39,73,.28);position:relative;
    animation:swPopupUp .28s cubic-bezier(.2,.8,.2,1) both;
  }
  .sw-popup-head{
    position:sticky;top:0;z-index:3;background:#fff;border-bottom:1px solid #e5edf5;
    padding:16px 18px 12px;display:flex;align-items:flex-start;gap:10px;
  }
  .sw-popup-title{flex:1}
  .sw-popup-title h2{margin:0;color:#102f5f;font-size:19px;line-height:1.2;font-weight:900}
  .sw-popup-title p{margin:5px 0 0;color:#71839a;font-size:11px;line-height:1.45}
  .sw-popup-close{width:34px;height:34px;border:1px solid #dfe8f2;border-radius:9px;background:#f7faff;color:#42617f;font-size:21px;line-height:1;display:grid;place-items:center;flex:none}
  .sw-popup-close:hover{background:#eaf3ff;color:#0867dc}
  .sw-popup-body{padding:0 18px 18px}
  .sw-popup-body .voice{padding:15px 0;border-top:1px solid #e5edf5}
  .sw-popup-body .voice:first-child{border-top:0}
  .sw-popup-body .person{font-size:12px;line-height:1.25;font-weight:850;color:#17385f}
  .sw-popup-body .vavatar{width:34px;height:34px;min-width:34px;border-radius:50%;background:#eef5fd;color:#0867dc;font-size:11px;font-weight:900}
  .sw-popup-body .voice p{font-size:12px;line-height:1.6;margin:8px 0 7px;color:#415b77}
  .sw-popup-body .voice .meta{font-size:10px;color:#7287a0}
  .sw-popup-comment{display:block;width:100%;margin-top:12px;padding:12px;border-radius:9px;background:#0867dc;color:#fff;font-size:12px;font-weight:900;text-align:center;box-shadow:0 6px 16px rgba(8,103,220,.2)}
  .sw-popup-comment:hover{filter:brightness(.96);transform:translateY(-1px)}
  .sw-open-active{overflow:hidden}
  @keyframes swFadeIn{from{opacity:0}to{opacity:1}}
  @keyframes swPopupUp{from{opacity:0;transform:translateY(42px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes suaraWargaSlideUp{from{opacity:0;transform:translate3d(0,30px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
  @media(max-width:760px){.sw-popup{padding:12px}.sw-popup-panel{width:100%;max-height:calc(100vh - 24px);border-radius:14px}.sw-popup-body{padding:0 15px 15px}}
  `;
  const style=document.createElement('style');
  style.id='reference-v7-style';
  style.textContent=css;
  document.head.appendChild(style);

  function openSuaraWarga(){
    let popup=document.getElementById('suaraWargaPopup');
    if(!popup){
      const source=document.querySelector('.voices');
      if(!source)return;
      popup=document.createElement('div');
      popup.id='suaraWargaPopup';
      popup.className='sw-popup';
      popup.innerHTML=`
        <div class="sw-popup-panel" role="dialog" aria-modal="true" aria-labelledby="swPopupTitle">
          <div class="sw-popup-head">
            <div class="sw-popup-title">
              <h2 id="swPopupTitle">Suara Warga</h2>
              <p>Cerita, keluhan, dan harapan dari masyarakat.</p>
            </div>
            <button class="sw-popup-close" type="button" aria-label="Tutup">×</button>
          </div>
          <div class="sw-popup-body"></div>
        </div>`;
      document.body.appendChild(popup);

      const body=popup.querySelector('.sw-popup-body');
      source.querySelectorAll('.voice').forEach(v=>body.appendChild(v.cloneNode(true)));
      const comment=source.querySelector('.comment');
      if(comment){
        const c=comment.cloneNode(true);
        c.classList.add('sw-popup-comment');
        body.appendChild(c);
        c.addEventListener('click',()=>{
          closeSuaraWarga();
          setTimeout(()=>{
            const original=document.querySelector('.voices .comment');
            if(original)original.click();
          },120);
        });
      }

      const close=()=>closeSuaraWarga();
      popup.querySelector('.sw-popup-close').addEventListener('click',close);
      popup.addEventListener('click',e=>{if(e.target===popup)close()});
    }
    popup.classList.add('show');
    document.body.classList.add('sw-open-active');
    const closeBtn=popup.querySelector('.sw-popup-close');
    if(closeBtn)closeBtn.focus();
  }

  function closeSuaraWarga(){
    const popup=document.getElementById('suaraWargaPopup');
    if(popup)popup.classList.remove('show');
    document.body.classList.remove('sw-open-active');
  }

  document.addEventListener('click',e=>{
    const target=e.target.closest('.nav>button[data-sub="suara"], [data-open-suara-warga]');
    if(target){
      e.preventDefault();
      e.stopImmediatePropagation();
      openSuaraWarga();
      return;
    }
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')closeSuaraWarga();
  });
})();
