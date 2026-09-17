(()=>{
  'use strict';
  document.documentElement.dataset.publicUi='reference-v6';

  /* SUARA WARGA — floating right rail, matching the supplied reference. */
  const css = `
  .voices{
    position:fixed!important;
    z-index:25!important;
    top:72px!important;
    right:12px!important;
    width:326px!important;
    max-height:calc(100vh - 84px)!important;
    overflow:auto!important;
    margin:0!important;
    border-radius:12px!important;
    background:#fff!important;
    box-shadow:0 10px 34px rgba(22,61,105,.14)!important;
    border:1px solid #dfe9f4!important;
    animation:suaraWargaSlideUp .55s cubic-bezier(.2,.8,.2,1) both!important;
  }
  .voices .head{
    min-height:58px!important;
    padding:15px 16px 10px!important;
    background:#fff!important;
    position:sticky!important;
    top:0!important;
    z-index:2!important;
  }
  .voices .head h2{font-size:17px!important;line-height:1.15!important;font-weight:900!important;color:#102f5f!important}
  .voices .more{font-size:11px!important;font-weight:850!important;color:#0867dc!important}
  .voices .voice{padding:11px 16px!important;border-top:1px solid #e5edf5!important}
  .voices .person{font-size:11px!important;line-height:1.25!important;font-weight:850!important;color:#17385f!important}
  .voices .vavatar{width:30px!important;height:30px!important;min-width:30px!important;border-radius:50%!important;background:#eef5fd!important;color:#0867dc!important;font-size:11px!important;font-weight:900!important}
  .voices .voice p{font-size:11px!important;line-height:1.55!important;margin:7px 0 6px!important;color:#415b77!important}
  .voices .voice .meta{font-size:9px!important;color:#7287a0!important}
  .voices .comment{margin:12px 16px 16px!important;padding:11px 10px!important;border-radius:9px!important;background:#0867dc!important;color:#fff!important;font-size:11px!important;font-weight:900!important;box-shadow:0 5px 14px rgba(8,103,220,.18)!important}
  @keyframes suaraWargaSlideUp{from{opacity:0;transform:translate3d(0,55px,0) scale(.985)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}
  @media(max-width:1150px){.voices{position:relative!important;top:auto!important;right:auto!important;width:auto!important;max-height:none!important;margin-top:10px!important;overflow:visible!important;animation:suaraWargaSlideUp .45s ease both!important}}
  @media(max-width:760px){.voices{position:relative!important;width:auto!important;right:auto!important;top:auto!important}}
  `;
  const style=document.createElement('style');
  style.id='reference-v6-style';
  style.textContent=css;
  document.head.appendChild(style);
})();
