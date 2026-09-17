(()=>{
'use strict';
const css=`
.voices{display:none!important}
#suaraWargaPopup{position:fixed;inset:0;z-index:99999;pointer-events:none;display:none!important;background:transparent}
#suaraWargaPopup.show{display:block!important}
#suaraWargaPopup .sw-popup-panel{position:absolute;top:82px;right:22px;width:min(470px,calc(100vw - 28px));max-height:calc(100vh - 105px);overflow:auto;background:linear-gradient(180deg,#fff0f6 0%,#fff7fb 52%,#fff 100%);border:2px solid #ee9abd;border-radius:20px;box-shadow:0 24px 70px rgba(100,30,65,.30),0 8px 24px rgba(20,50,80,.16);pointer-events:auto;animation:swIn .28s ease-out}
.sw-head{position:sticky;top:0;z-index:2;padding:20px;background:linear-gradient(135deg,#ffd6e7,#fff0f6);border-bottom:1px solid #efc0d2;display:flex;gap:12px}
.sw-title{flex:1}.sw-title h2{margin:0;color:#68173d;font-size:26px;font-weight:900}.sw-title p{margin:6px 0 0;color:#81556a;font-size:13px;line-height:1.45}
.sw-close{width:42px;height:42px;border:1px solid #e2a1bd;border-radius:11px;background:#fff;color:#8c2350;font-size:27px;cursor:pointer}
.sw-send,.sw-comment{border:0;border-radius:10px;background:#e83f80;color:#fff;font-weight:900;cursor:pointer}.sw-send{margin-top:12px;padding:10px 18px;font-size:13px}.sw-body{padding:4px 20px 20px}.sw-item{padding:17px 0;border-bottom:1px solid #efdce5}.sw-item:last-child{border-bottom:0}.sw-person{display:flex;align-items:center;gap:10px;color:#17385f;font-size:14px;font-weight:900}.sw-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#ffdcea;color:#c22e69;font-weight:900}.sw-text{margin:9px 0 6px;color:#405970;font-size:13px;line-height:1.6}.sw-meta{color:#7c8d9d;font-size:10px}.sw-comment{width:100%;padding:14px;font-size:13px;margin-top:5px}
@keyframes swIn{from{opacity:0;transform:translateY(35px) scale(.97)}to{opacity:1;transform:none}}
@media(max-width:760px){#suaraWargaPopup .sw-popup-panel{top:64px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 78px)}.sw-head{padding:16px}.sw-body{padding:4px 16px 16px}}
`;
const style=document.createElement('style');style.id='suara-warga-popup-v10';style.textContent=css;document.head.appendChild(style);
let popup=null;
function build(){
 if(popup)return popup;
 popup=document.createElement('div');popup.id='suaraWargaPopup';popup.setAttribute('aria-hidden','true');
 popup.innerHTML=`<div class="sw-popup-panel" role="dialog" aria-label="Suara Warga"><div class="sw-head"><div class="sw-title"><h2>Suara Warga</h2><p>Suara langsung dari masyarakat untuk perubahan yang lebih baik.</p><button class="sw-send" type="button">＋ Kirim Suara</button></div><button class="sw-close" type="button" aria-label="Tutup">×</button></div><div class="sw-body"><div class="sw-item"><div class="sw-person"><span class="sw-avatar">AR</span><span>Andi — Jawa Barat</span></div><div class="sw-text">Jalan di lingkungan kami rusak dan perlu segera diperbaiki.</div><div class="sw-meta">Dilaporkan hari ini</div></div><div class="sw-item"><div class="sw-person"><span class="sw-avatar">SN</span><span>Siti — Jawa Tengah</span></div><div class="sw-text">Mohon perhatian untuk fasilitas air bersih di wilayah kami.</div><div class="sw-meta">Dilaporkan kemarin</div></div><div class="sw-item"><div class="sw-person"><span class="sw-avatar">DP</span><span>Dedi — Sulawesi Selatan</span></div><div class="sw-text">Warga mengusulkan penambahan penerangan di jalan desa.</div><div class="sw-meta">Dilaporkan 2 hari lalu</div></div><button class="sw-comment" type="button">Ayo Berkomentar!</button></div></div>`;
 document.body.appendChild(popup);
 popup.querySelector('.sw-close').onclick=close;
 popup.querySelector('.sw-send').onclick=()=>{close();document.querySelector('.comment')?.click()};
 popup.querySelector('.sw-comment').onclick=()=>{close();document.querySelector('.comment')?.click()};
 return popup;
}
function open(){const p=build();p.classList.add('show');p.setAttribute('aria-hidden','false')}
function close(){if(!popup)return;popup.classList.remove('show');popup.setAttribute('aria-hidden','true')}
function bind(){
 document.addEventListener('click',e=>{
  const t=e.target.closest('.nav>button[data-sub="suara"],button[data-sub="suara"]');
  if(t){e.preventDefault();e.stopPropagation();open();return}
  if(popup&&popup.classList.contains('show')&&e.target===popup)close();
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
