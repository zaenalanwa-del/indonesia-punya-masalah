(()=>{
  'use strict';
  document.documentElement.dataset.publicUi='reference-v9';
  const css=`
  /* SUARA WARGA — POPUP MELAYANG KANAN */
  .voices{display:none!important}
  .sw-popup{position:fixed;inset:0;z-index:9999;pointer-events:none;background:transparent;display:none!important}
  .sw-popup.show{display:block!important}
  .sw-popup-panel{position:absolute;top:78px;right:18px;width:min(450px,calc(100vw - 28px));max-height:calc(100vh - 96px);overflow:auto;background:linear-gradient(180deg,#fff1f7 0%,#fff9fc 48%,#fff 100%);border:2px solid #f19abb;border-radius:20px;box-shadow:0 22px 65px rgba(167,49,103,.28),0 5px 20px rgba(25,55,90,.15);pointer-events:auto;animation:swPopupUp .38s cubic-bezier(.2,.8,.2,1) both}
  .sw-popup-head{position:sticky;top:0;z-index:3;padding:20px;background:linear-gradient(135deg,#ffd9e9,#fff0f6);border-bottom:1px solid #f2bfd3;display:flex;gap:12px;align-items:flex-start}
  .sw-popup-title{flex:1}.sw-popup-title h2{margin:0;color:#65163a;font-size:24px;line-height:1.2;font-weight:900}.sw-popup-title p{margin:7px 0 0;color:#80556b;font-size:13px;line-height:1.5}
  .sw-popup-close{width:40px;height:40px;border:1px solid #e7a7c2;border-radius:11px;background:#fff;color:#8d2450;font-size:25px;line-height:1;display:grid;place-items:center;cursor:pointer}
  .sw-popup-send{display:inline-flex;align-items:center;gap:5px;margin-top:12px;padding:10px 17px;border:0;border-radius:10px;background:#e83f80;color:#fff;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 6px 16px rgba(232,63,128,.25)}
  .sw-popup-body{padding:3px 20px 20px}.sw-popup-body .voice{padding:17px 0;border-top:1px solid #f0d9e4}.sw-popup-body .voice:first-child{border-top:0}.sw-popup-body .person{font-size:14px;font-weight:900;color:#17385f}.sw-popup-body .vavatar{width:40px;height:40px;min-width:40px;border-radius:50%;background:#ffddea;color:#c22e69;font-size:13px;font-weight:900}.sw-popup-body .voice p{font-size:13px;line-height:1.65;margin:9px 0 7px;color:#405970}.sw-popup-body .voice .meta{font-size:10px;color:#7c8d9d}.sw-popup-comment{width:100%;margin-top:12px;padding:14px;border:0;border-radius:10px;background:#e83f80;color:#fff;font-size:13px;font-weight:900;cursor:pointer}
  .sw-open-active{overflow:hidden}@keyframes swPopupUp{from{opacity:0;transform:translate3d(0,65px,0) scale(.96)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}
  @media(max-width:760px){.sw-popup-panel{top:62px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 75px);border-radius:16px}.sw-popup-head{padding:16px}.sw-popup-body{padding:2px 16px 16px}}
  `;
  const style=document.createElement('style');style.id='reference-v9-style';style.textContent=css;document.head.appendChild(style);
  function openSuaraWarga(){
    let popup=document.getElementById('suaraWargaPopup');
    if(!popup){
      const source=document.querySelector('.voices');if(!source)return;
      popup=document.createElement('div');popup.id='suaraWargaPopup';popup.className='sw-popup';
      popup.innerHTML='<div class="sw-popup-panel" role="dialog" aria-labelledby="swPopupTitle"><div class="sw-popup-head"><div class="sw-popup-title"><h2 id="swPopupTitle">Suara Warga</h2><p>Suara langsung dari masyarakat untuk perubahan yang lebih baik.</p><button class="sw-popup-send" type="button">＋ Kirim</button></div><button class="sw-popup-close" type="button" aria-label="Tutup">×</button></div><div class="sw-popup-body"></div></div>';
      document.body.appendChild(popup);
      const body=popup.querySelector('.sw-popup-body');source.querySelectorAll('.voice').forEach(v=>body.appendChild(v.cloneNode(true)));
      const comment=source.querySelector('.comment');if(comment){const c=comment.cloneNode(true);c.className='sw-popup-comment';c.textContent='Ayo Berkomentar!';body.appendChild(c);c.addEventListener('click',()=>{closeSuaraWarga();comment.click()})}
      popup.querySelector('.sw-popup-send').addEventListener('click',()=>{closeSuaraWarga();source.querySelector('.comment')?.click()});
      popup.querySelector('.sw-popup-close').addEventListener('click',closeSuaraWarga);
    }
    popup.classList.add('show');document.body.classList.add('sw-open-active');
  }
  function closeSuaraWarga(){document.getElementById('suaraWargaPopup')?.classList.remove('show');document.body.classList.remove('sw-open-active')}
  document.addEventListener('click',e=>{const target=e.target.closest('.nav>button[data-sub="suara"]');if(!target)return;e.preventDefault();e.stopImmediatePropagation();const popup=document.getElementById('suaraWargaPopup');popup?.classList.contains('show')?closeSuaraWarga():openSuaraWarga()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSuaraWarga()});
})();
