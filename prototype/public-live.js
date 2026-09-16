(()=>{
'use strict';

/* Public-only feature layer. No intelligence, model, evidence, query-engine or admin controls are exposed here. */
const U='https://gfggmkeucgqkkyvummpu.supabase.co';
const K='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cb0';
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const INTERNAL=new Set(['intelligence','future','control','model','models','evidence','query','pipeline','ingestion','moderation','operations']);
async function api(path){
  const r=await fetch(U+path,{headers:{apikey:K,Authorization:`Bearer ${K}`,Accept:'application/json'}});
  const t=await r.text();let d=null;try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok)throw new Error(typeof d==='string'?d:(d?.message||`HTTP ${r.status}`));
  return d;
}
function activate(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));$(id)?.classList.add('active');document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));window.scrollTo({top:0,behavior:'smooth'});window.lucide?.createIcons?.()}
function shell(k,title,desc,body){return `<div class="page public-live-page"><span class="eyebrow">${esc(k)}</span><h2>${esc(title)}</h2><p class="muted">${esc(desc)}</p>${body}</div>`}
function wire(){document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>window.render?.(b.dataset.view));}
function addCss(){if($('public-live-css'))return;const s=document.createElement('style');s.id='public-live-css';s.textContent=`.public-live-page .live-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.public-live-page .live-list{display:grid;gap:7px}.public-live-page .live-row{width:100%;display:flex;justify-content:space-between;align-items:center;text-align:left;border:1px solid #e1e9f1;background:#fff;border-radius:11px;padding:11px 13px;cursor:pointer}.public-live-page .live-row:hover{border-color:#8dbbe8;background:#f8fbff}.public-live-page .live-row b{display:block;font-size:12px;color:#193352}.public-live-page .live-row small{display:block;color:#7b8da2;margin-top:3px}.public-live-page .live-badge{font-size:9px;font-weight:800;border-radius:999px;padding:5px 8px;background:#edf5ff;color:#1d6fbe}.public-live-page .live-note{padding:12px 14px;border-radius:11px;background:#f4f8fc;color:#5e7188;font-size:11px;line-height:1.5}.public-live-page .live-map{height:430px;border-radius:12px;overflow:hidden}.public-live-page .live-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:12px 0}.public-live-page .live-kpi{background:#fff;border:1px solid #e1e9f1;border-radius:11px;padding:13px}.public-live-page .live-kpi small{display:block;color:#8090a2;font-size:9px}.public-live-page .live-kpi b{display:block;font-size:22px;color:#153253;margin-top:4px}.public-live-page .live-kpi span{font-size:9px;color:#8291a2}@media(max-width:800px){.public-live-page .live-grid{grid-template-columns:1fr}.public-live-page .live-kpis{grid-template-columns:1fr 1fr}.public-live-page .live-map{height:330px}}`;document.head.appendChild(s)}

async function renderPublicMap(){
  addCss();const host=$('map');if(!host)return;
  host.innerHTML=shell('PETA INDONESIA','Peta Indonesia','Jelajahi wilayah Indonesia secara publik. Peta ini tidak menampilkan panel intelligence atau kontrol internal.',`<div class="live-grid"><div class="card" style="padding:12px"><div id="public-live-map" class="live-map"></div></div><div class="card" style="padding:14px"><div class="cardhead"><b>PROVINSI</b><span id="map-live-status">memuat…</span></div><div id="map-live-list" class="live-list"><div class="loading">Memuat wilayah…</div></div></div></div>`);activate('map');
  const list=$('map-live-list'),status=$('map-live-status');
  try{
    const rows=await api('/rest/v1/regions?select=id,name,level,latitude,longitude,boundary_status&source_name=eq.BIG&level=eq.province&order=name.asc&limit=38');
    status.textContent=`${rows.length} provinsi`;
    list.innerHTML=rows.map(r=>`<button class="live-row" data-region="${esc(r.id)}"><span><b>${esc(r.name)}</b><small>${esc(r.boundary_status||'registered')}</small></span><span class="live-badge">BUKA →</span></button>`).join('')||'<div class="empty">Belum ada data wilayah.</div>';
    list.querySelectorAll('[data-region]').forEach(b=>b.onclick=()=>{window.render?.('regions')});
    if(window.L){
      const map=L.map('public-live-map',{scrollWheelZoom:false}).setView([-2.5,118],4.4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:12}).addTo(map);
      rows.forEach(r=>{if(Number.isFinite(Number(r.latitude))&&Number.isFinite(Number(r.longitude)))L.circleMarker([r.latitude,r.longitude],{radius:5,weight:1,fillOpacity:.75}).addTo(map).bindTooltip(esc(r.name))});
    }
  }catch(err){status.textContent='mode aman';list.innerHTML=`<div class="live-note"><b>Peta publik belum dapat dimuat.</b><br>${esc(err.message)}</div>`}
}

async function renderMonitoring(){
  addCss();const host=$('monitoring');if(!host)return;
  host.innerHTML=shell('PANTAU PERUBAHAN','Apa yang sedang berubah?','Ringkasan publik berdasarkan masalah yang tersedia. Status analisis internal tidak ditampilkan.',`<div id="monitoring-kpis" class="live-kpis"></div><div class="live-grid"><div class="card" style="padding:14px"><div class="cardhead"><b>MASALAH TERBARU</b><span>publik</span></div><div id="monitoring-list" class="live-list"><div class="loading">Memuat…</div></div></div><div class="card" style="padding:14px"><div class="cardhead"><b>CATATAN</b></div><div class="live-note">WASKITA membedakan laporan warga, observasi, evidence dan masalah terverifikasi. Angka pada halaman publik tidak devem dianggap sebagai prediksi atau keputusan otomatis.</div><div class="live-note" style="margin-top:9px">Gunakan <b>Masalah</b> untuk membaca detail dan <b>Suara Warga</b> untuk mengirim sinyal baru.</div></div></div>`);activate('monitoring');
  try{const rows=await api('/rest/v1/problems?select=id,title,category,status,confidence,impact_score,updated_at&order=updated_at.desc&limit=20');
    const unresolved=rows.filter(x=>String(x.status||'').toLowerCase()!=='resolved').length;const high=rows.filter(x=>Number(x.impact_score)>=70).length;
    $('monitoring-kpis').innerHTML=`<div class="live-kpi"><small>MASALAH TERSEDIA</small><b>${rows.length}</b><span>data publik</span></div><div class="live-kpi"><small>BELUM SELESAI</small><b>${unresolved}</b><span>berdasarkan status</span></div><div class="live-kpi"><small>DAMPAK ≥ 70</small><b>${high}</b><span>impact score tersimpan</span></div>`;
    $('monitoring-list').innerHTML=rows.length?rows.map(x=>`<button class="live-row" data-problem="${esc(x.id)}"><span><b>${esc(x.title)}</b><small>${esc(x.category||'Masalah')} · ${esc(x.status||'detected')} · diperbarui ${x.updated_at?new Date(x.updated_at).toLocaleDateString('id-ID'):'—'}</small></span><span class="live-badge">DETAIL →</span></button>`).join(''):'<div class="empty">Belum ada masalah publik.</div>';
    $('monitoring-list').querySelectorAll('[data-problem]').forEach(b=>b.onclick=()=>{window.render?.('problems')});
  }catch(err){$('monitoring-kpis').innerHTML='<div class="live-kpi"><small>STATUS</small><b>—</b><span>data belum tersedia</span></div>';$('monitoring-list').innerHTML=`<div class="live-note">Data monitoring belum dapat dimuat: ${esc(err.message)}</div>`}
}

const baseRender=window.render;
window.render=async function(view,arg=''){
  if(INTERNAL.has(String(view||'').toLowerCase()))return typeof baseRender==='function'?baseRender('more'):undefined;
  if(view==='map')return renderPublicMap();
  if(view==='monitoring')return renderMonitoring();
  return typeof baseRender==='function'?baseRender(view,arg):undefined;
};
addCss();
})();
