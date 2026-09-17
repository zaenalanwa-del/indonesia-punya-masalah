(()=>{
'use strict';
/* IPM MASTER UI PATCH v11 — stable standalone Suara Warga + readability/reference alignment */
const css=`
/* --- Reference readability/layout polish --- */
body{font-size:14px!important;color:#14345d!important}
.side{width:220px!important}
.main{margin-left:220px!important}
.top{height:70px!important;padding:0 24px!important}
.top .search{height:42px!important;font-size:14px!important}
.brand b{font-size:13px!important}.brand small{font-size:10px!important}
.nav>a,.nav>button{font-size:13px!important;padding:10px 11px!important}
.sub a{font-size:12px!important;padding:7px 11px!important}
.ico{font-size:17px!important}
.wrap{padding:16px 20px 44px!important;max-width:1500px!important}
.hero{min-height:310px!important;height:310px!important;padding:38px 42px!important;border-radius:16px!important}
.hero h1{font-size:39px!important;line-height:1.1!important}.hero p{font-size:14px!important}.pill{font-size:12px!important;padding:8px 14px!important}.cta{font-size:13px!important;padding:11px 17px!important}
.heroStats{padding:14px 24px!important}.heroStats strong{font-size:21px!important}.heroStats span{font-size:11px!important}
.head{padding:17px 19px 12px!important}.head h2{font-size:19px!important}.more{font-size:12px!important}
.issue h3{font-size:13px!important}.meta{font-size:10px!important}.tag{font-size:10px!important}
.cat strong{font-size:12px!important}.cat small{font-size:9px!important}
.rankrow span,.rankrow b{font-size:11px!important}.stat b{font-size:23px!important}.stat span{font-size:10px!important}
.footer h3{font-size:13px!important}.footer p,.footer a{font-size:11px!important}
/* Keep the source rail out of the visible homepage; popup is standalone. */
.voices{display:none!important}
#suaraWargaPopup{position:fixed;inset:0;z-index:99999;pointer-events:none;display:none!important;background:transparent}
#suaraWargaPopup.show{display:block!important}
#suaraWargaPopup .sw-popup-panel{position:absolute;top:82px;right:22px;width:min(490px,calc(100vw - 28px));max-height:calc(100vh - 104px);overflow:auto;background:linear-gradient(180deg,#fff0f6 0%,#fff8fb 48%,#fff 100%);border:2px solid #ef9abd;border-radius:20px;box-shadow:0 26px 75px rgba(90,24,57,.30),0 8px 25px rgba(20,50,80,.16);pointer-events:auto;animation:swIn .28s ease-out}
.sw-head{position:sticky;top:0;z-index:2;padding:21px;background:linear-gradient(135deg,#ffd5e6,#fff1f7);border-bottom:1px solid #efbfd2;display:flex;gap:13px}
.sw-title{flex:1}.sw-title h2{margin:0;color:#68173d;font-size:28px;font-weight:900}.sw-title p{margin:7px 0 0;color:#81556a;font-size:14px;line-height:1.5}.sw-close{width:44px;height:44px;border:1px solid #dfa0bb;border-radius:11px;background:#fff;color:#8c2350;font-size:28px;cursor:pointer;flex:none}.sw-send,.sw-comment{border:0;border-radius:10px;background:#e83f80;color:#fff;font-weight:900;cursor:pointer}.sw-send{margin-top:13px;padding:11px 19px;font-size:13px}.sw-body{padding:4px 21px 21px}.sw-item{padding:18px 0;border-bottom:1px solid #efdce5}.sw-person{display:flex;align-items:center;gap:10px;color:#17385f;font-size:14px;font-weight:900}.sw-avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:#ffdcea;color:#c22e69;font-weight:900}.sw-text{margin:10px 0 7px;color:#405970;font-size:14px;line-height:1.65}.sw-meta{color:#7c8d9d;font-size:10px}.sw-comment{width:100%;padding:14px;font-size:14px;margin-top:6px}
@keyframes swIn{from{opacity:0;transform:translateY(30px) scale(.97)}to{opacity:1;transform:none}}
@media(max-width:1150px){.side{width:205px!important}.main{margin-left:205px!important}.wrap{padding:14px!important}.hero h1{font-size:34px!important}}
@media(max-width:760px){.side{width:280px!important}.main{margin-left:0!important}.top{height:62px!important;padding:0 12px!important}.wrap{padding:10px!important}.hero{height:auto!important;min-height:320px!important;padding:26px!important}.hero h1{font-size:30px!important}.heroStats{position:static!important;margin:24px -26px -26px!important}.footer{grid-template-columns:1fr 1fr!important}#suaraWargaPopup .sw-popup-panel{top:64px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 78px)}.sw-head{padding:16px}.sw-title h2{font-size:23px}.sw-title p{font-size:12px}.sw-body{padding:4px 16px 16px}}
`;
const style=document.createElement('style');style.id='ipm-master-ui-v11';style.textContent=css;document.head.appendChild(style);
let popup=null;
function build(){
 if(popup)return popup;
 popup=document.createElement('div');popup.id='suaraWargaPopup';popup.setAttribute('aria-hidden','true');
 popup.innerHTML=`<div class="sw-popup-panel" role="dialog" aria-label="Suara Warga"><div class="sw-head"><div class="sw-title"><h2>Suara Warga</h2><p>Suara langsung dari masyarakat untuk perubahan yang lebih baik.</p><button class="sw-send" type="button">＋ Kirim Suara</button></div><button class="sw-close" type="button" aria-label="Tutup">×</button></div><div class="sw-body"><div class="sw-item"><div class="sw-person"><span class="sw-avatar">AR</span><span>Andi — Jawa Barat</span></div><div class="sw-text">Jalan di lingkungan kami rusak dan perlu segera diperbaiki.</div><div class="sw-meta">Dilaporkan hari ini</div></div><div class="sw-item"><div class="sw-person"><span class="sw-avatar">SN</span><span>Siti — Jawa Tengah</span></div><div class="sw-text">Mohon perhatian untuk fasilitas air bersih di wilayah kami.</div><div class="sw-meta">Dilaporkan kemarin</div></div><div class="sw-item"><div class="sw-person"><span class="sw-avatar">DP</span><span>Dedi — Sulawesi Selatan</span></div><div class="sw-text">Warga mengusulkan penambahan penerangan di jalan desa.</div><div class="sw-meta">Dilaporkan 2 hari lalu</div></div><button class="sw-comment" type="button">Ayo Berkomentar!</button></div></div>`;
 document.body.appendChild(popup);
 popup.querySelector('.sw-close').addEventListener('click',close);
 popup.querySelector('.sw-send').addEventListener('click',()=>{close();document.querySelector('.comment')?.click()});
 popup.querySelector('.sw-comment').addEventListener('click',()=>{close();document.querySelector('.comment')?.click()});
 return popup;
}
function open(){const p=build();p.classList.add('show');p.setAttribute('aria-hidden','false')}
function close(){if(!popup)return;popup.classList.remove('show');popup.setAttribute('aria-hidden','true')}
function bind(){
 document.addEventListener('click',e=>{
  const t=e.target.closest('.nav>button[data-sub="suara"],button[data-sub="suara"]');
  if(t){e.preventDefault();e.stopImmediatePropagation();open();return}
  if(popup&&popup.classList.contains('show')&&e.target===popup)close();
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
