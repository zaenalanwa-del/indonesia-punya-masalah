(()=>{
  'use strict';
  document.documentElement.dataset.publicUi='reference-v5';
  const css = `
/* MASTER VISUAL ALIGNMENT — supplied reference image */
:root{--ref-side:216px;--ref-right:326px;--ref-gap:10px;--ref-blue:#0867dc;--ref-ink:#102f5f;--ref-muted:#607794;--ref-line:#dce8f5}
html,body{background:#f5f9fd!important}
body{font-size:14px!important;color:var(--ref-ink)!important;overflow-x:hidden}
.side{width:var(--ref-side)!important;background:#fff!important;border-right:1px solid #dce7f2!important}
.main{margin-left:var(--ref-side)!important}
.brand{height:58px!important;padding:7px 14px!important;border-bottom:0!important;gap:8px!important}
.brandmark{width:44px!important;height:44px!important;border-radius:0!important;background:linear-gradient(145deg,#e62532,#ef3d3d 55%,#e9edf4)!important;clip-path:polygon(0 78%,20% 12%,92% 0,75% 50%,100% 40%,78% 88%,35% 100%)!important;font-size:0!important;flex:none!important}
.brand b{font-size:13px!important;line-height:1.02!important;color:#102f5f!important}
.brand small{font-size:9px!important;margin-top:4px!important;color:#667b96!important;white-space:nowrap!important}
.nav{padding:9px 8px!important}
.nav>a,.nav>button{font-size:11px!important;padding:7px 9px!important;min-height:29px!important;gap:8px!important;color:#1c3d69!important}
.nav>a.active{background:#0867dc!important;color:#fff!important;font-weight:850!important}
.ico{width:18px!important;font-size:15px!important}
.sub{margin-left:27px!important;margin-bottom:3px!important}
.sub a{font-size:9.5px!important;padding:4px 8px!important;color:#627895!important;line-height:1.15!important}
.top{height:58px!important;padding:0 16px!important;gap:14px!important;border-bottom:0!important;position:relative!important}
.search{height:34px!important;max-width:452px!important;margin-left:74px!important;border-radius:18px!important;background:#fff!important;padding:0 16px 0 40px!important;font-size:12px!important;box-shadow:none!important}
.notify{width:32px!important;height:32px!important;margin-left:auto!important;border:0!important}
.notify:after{font-size:8px!important;padding:1px 4px!important}
.profile{font-size:11px!important;gap:7px!important;color:#17385f!important}
.avatar{width:30px!important;height:30px!important;font-size:12px!important}
.wrap{max-width:none!important;margin:0!important;padding:0 10px 28px 0!important;display:block!important;position:relative!important}
.row{display:block!important}
.dataRow{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr)!important;gap:10px!important;margin-top:10px!important}
.dataRow#stats{display:block!important;min-height:0!important}
.voices{position:absolute!important;top:20px!important;right:0!important;width:var(--ref-right)!important}
.dataRow#stats>:first-child{position:absolute!important;right:0!important;top:514px!important;width:var(--ref-right)!important}
.dataRow#stats>:last-child{position:absolute!important;right:0!important;top:740px!important;width:var(--ref-right)!important}
.hero{height:290px!important;min-height:290px!important;border-radius:0 0 10px 10px!important;padding:36px 42px!important;background:linear-gradient(90deg,rgba(6,46,87,.90),rgba(6,54,102,.28)),url('https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1800&q=88') center/cover!important}
.pill{font-size:11px!important;padding:7px 13px!important}
.hero h1{font-size:36px!important;line-height:1.04!important;margin:14px 0 12px!important;letter-spacing:-.8px!important;max-width:650px!important}
.hero p{font-size:13px!important;line-height:1.45!important;max-width:560px!important;margin-bottom:15px!important}
.cta{font-size:12px!important;padding:10px 15px!important;border-radius:8px!important}
.heroStats{padding:10px 18px!important;background:rgba(5,31,55,.80)!important}
.heroStats strong{font-size:16px!important}
.heroStats span{font-size:9px!important}
#issues{margin:10px 0 0!important}
.head{padding:13px 16px 9px!important}
.head h2{font-size:16px!important;color:#102f5f!important}
.more{font-size:10px!important}
.issues{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:9px!important;padding:0 16px 15px!important}
.issue{border-radius:7px!important}
.thumb{height:88px!important}
.issueBody{padding:8px!important}
.issue h3{font-size:11px!important;line-height:1.35!important}
.meta{font-size:9px!important}
.tag{font-size:8px!important;padding:3px 5px!important}
.voices{margin:0!important;align-self:start!important}
.voices .head h2{font-size:17px!important}
.voice{padding:10px 14px!important}
.person{font-size:10px!important}
.vavatar{width:28px!important;height:28px!important}
.voice p{font-size:10px!important;line-height:1.45!important}
.comment{font-size:11px!important;margin:9px 14px 14px!important;padding:9px!important}
.categories{margin:10px 0 0!important}
.cats{grid-template-columns:repeat(8,minmax(0,1fr))!important;gap:8px!important;padding:0 14px 14px!important}
.cat{padding:10px 5px!important;border-radius:7px!important}
.cat .ci{width:32px!important;height:32px!important;font-size:16px!important}
.cat strong{font-size:10px!important;margin-top:6px!important}
.cat small{font-size:8px!important}
.mapCard,.rankCard,.dataRow#stats>.card{margin:0!important}
.mapbox{height:174px!important;margin:0 14px 14px!important;background:linear-gradient(135deg,#eaf5fc,#d6e8f5)!important}
.island{transform:scale(.78)!important}
.rank{padding:0 14px!important}
.rankrow{padding:7px 0!important}
.rankrow span{font-size:9px!important}
.rankrow b{font-size:9px!important}
.rn{width:23px!important;height:23px!important;font-size:9px!important}
.statsGrid{gap:8px!important;padding:0 14px 14px!important}
.stat{padding:10px!important}
.stat b{font-size:19px!important}
.stat span{font-size:8px!important}
.miniMap{height:128px!important;margin:0 14px 14px!important}
.miniMap:after{font-size:8px!important}
.feature{margin:0!important;min-height:128px!important;border-radius:9px!important;padding:19px 24px!important;grid-template-columns:1.2fr 1fr!important;background:linear-gradient(90deg,#073e7b,#164d82)!important}
.feature h2{font-size:20px!important}
.feature p{font-size:10px!important;line-height:1.45!important}
.featureGrid b{font-size:10px!important}.featureGrid small{font-size:8px!important}
.monitor{margin:0!important}
.monitorGrid{gap:8px!important;padding:0 14px 14px!important}
.monitorItem{padding:9px!important}.monitorItem b{font-size:10px!important}.monitorItem p{font-size:8px!important}
.footer{margin-top:0!important;padding:18px 2px!important}.footer h3{font-size:11px!important}.footer p,.footer a{font-size:9px!important}
@media(max-width:1150px){.wrap{padding:0 10px 28px!important}.search{margin-left:0!important}.dataRow{grid-template-columns:1fr!important}.dataRow#stats>:first-child,.dataRow#stats>:last-child{position:static!important;width:auto!important;margin-top:10px!important}.voices{position:static!important;width:auto!important;margin-top:10px!important}.issues{grid-template-columns:repeat(2,1fr)!important}.cats{grid-template-columns:repeat(4,1fr)!important}.hero{height:auto!important;min-height:300px!important}.voices{align-self:auto!important}}
@media(max-width:760px){.side{transform:translateX(-100%)!important}.side.show{transform:none!important}.main{margin-left:0!important}.top{padding:0 10px!important}.profile{display:none!important}.wrap{padding:0 10px 20px!important}.hero{padding:25px!important;border-radius:0 0 10px 10px!important}.hero h1{font-size:29px!important}.heroStats{position:static!important;margin:24px -25px -25px!important}.issues,.cats{grid-template-columns:1fr 1fr!important}.feature{grid-template-columns:1fr!important}.monitorGrid{grid-template-columns:1fr 1fr!important}}
`;
  const style=document.createElement('style');style.id='reference-v5-style';style.textContent=css;document.head.appendChild(style);
})();
