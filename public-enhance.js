(()=>{
  'use strict';
  document.documentElement.dataset.publicUi='reference-v8';

  const css=`
  /* SUARA WARGA — popup melayang kanan, pink, buka/tutup dengan klik */
  .voices{display:none!important}
  .sw-popup{
    position:fixed;inset:0;z-index:200;pointer-events:none;background:transparent;
  }
  .sw-popup.show{display:block}
  .sw-popup-panel{
    position:absolute;top:82px;right:18px;width:min(430px,calc(100vw - 28px));
    max-height:calc(100vh - 105px);overflow:auto;
    background:linear-gradient(180deg,#fff7fb 0%,#fff 100%);
    border:1px solid #f08ab3;border-radius:18px;
    box-shadow:0 18px 55px rgba(177,62,112,.24),0 4px 16px rgba(40,67,95,.12);
    pointer-events:auto;animation:swPopupRightUp .34s cubic-bezier(.2,.8,.2,1) both;
  }
  .sw-popup-head{
    position:sticky;top:0;z-index:3;
    padding:18px 18px 14px;display:flex;align-items:flex-start;gap:12px;
    background:linear-gradient(180deg,#ffe8f2 0%,#fff4f8 100%);
    border-bottom:1px solid #f4c2d5;
  }
  .sw-popup-title{flex:1}
  .sw-popup-title h2{margin:0;color:#5d1535;font-size:22px;line-height:1.2;font-weight:900}
  .sw-popup-title p{margin:6px 0 0;color:#86576d;font-size:12px;line-height:1.5}
  .sw-popup-close{width:38px;height:38px;border:1px solid #eeb0c9;border-radius:10px;background:#fff0f6;color:#8b2450;font-size:24px;line-height:1;display:grid;place-items:center;flex:none;transition:.15s}
  .sw-popup-close:hover{background:#fce0eb;transform:scale(1.04)}
  .sw-popup-send{display:inline-flex;align-items:center;gap:6px;margin-top:11px;padding:9px 15px;border-radius:9px;background:#ed3f82;color:#fff;font-size:12px;font-weight:900;box-shadow:0 6px 15px rgba(237,63,130,.2)}
  .sw-popup-body{padding:2px 18px 18px}
  .sw-popup-body .voice{padding:15px 0;border-top:1px solid #f0dce5}
  .sw-popup-body .voice:first-child{border-top:0}
  .sw-popup-body .person{font-size:13px;line-height:1.3;font-weight:900;color:#17385f}
  .sw-popup-body .vavatar{width:38px;height:38px;min-width:38px;border-radius:50%;background:#ffe3ee;color:#c52d68;font-size:12px;font-weight:900}
  .sw-popup-body .voice p{font-size:13px;line-height:1.6;margin:8px 0 7px;color:#405a74}
  .sw-popup-body .voice .meta{font-size:10px;color:#7b8b9d}
  .sw-popup-comment{display:block;width:100%;margin-top:13px;padding:13px;border-radius:10px;background:#ed3f82;color:#fff;font-size:13px;font-weight:900;text-align:center;box-shadow:0 7px 18px rgba(237,63,130,.2)}
  .sw-popup-comment:hover{filter:brightness(.97);transform:translateY(-1px)}
  .sw-open-active{overflow:hidden}
  @keyframes swPopupRightUp{from{opacity:0;transform:translate3d(0,55px,0) scale(.97)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}
  @media(max-width:760px){
    .sw-popup-panel{top:64px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 78px);border-radius:15px}
    .sw-popup-head{padding:15px}.sw-popup-body{padding:2px 15px 15px}
  }
  `;
  const style=document.createElement('style');
  style.id='reference-v8-style';
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
        <div class="sw-popup-panel" role="dialog" aria-modal="false" aria-labelledby="swPopupTitle">
          <div class="sw-popup-head">
            <div class="sw-popup-title">
              <h2 id="swPopupTitle">Suara Warga</h2>
              <p>Suara langsung dari masyarakat untuk perubahan yang lebih baik.</p>
              <button class="sw-popup-send" type="button">＋ Kirim</button>
            </div>
            <button class="sw-popup-close" type="button" aria-label="Tutup">×</button>
          </div>
          <div class="sw-popup-body"></div>
        </div>`;
      document.body.appendChild(popup);

      const body=popup.querySelector('.sw-popup-body');
      source.querySelectorAll('.voice').forEach(v=>body.appendChild(v.cloneNode(true)));

      const send=popup.querySelector('.sw-popup-send');
      if(send)send.addEventListener('click',()=>{
        closeSuaraWarga();
        const original=document.querySelector('.voices .comment');
        if(original)original.click();
      });

      const comment=source.querySelector('.comment');
      if(comment){
        const c=comment.cloneNode(true);
        c.classList.add('sw-popup-comment');
        body.appendChild(c);
        c.addEventListener('click',()=>{
          closeSuaraWarga();
          setTimeout(()=>{const original=document.querySelector('.voices .comment');if(original)original.click()},120);
        });
      }

      popup.querySelector('.sw-popup-close').addEventListener('click',closeSuaraWarga);
    }
    popup.classList.add('show');
    document.body.classList.add('sw-open-active');
  }

  function closeSuaraWarga(){
    const popup=document.getElementById('suaraWargaPopup');
    if(popup)popup.classList.remove('show');
    document.body.classList.remove('sw-open-active');
  }

  document.addEventListener('click',e=>{
    const target=e.target.closest('.nav>button[data-sub="suara"], [data-open-suara-warga]');
    if(!target)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const popup=document.getElementById('suaraWargaPopup');
    if(popup && popup.classList.contains('show')) closeSuaraWarga();
    else openSuaraWarga();
  },true);

  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSuaraWarga()});
})();
