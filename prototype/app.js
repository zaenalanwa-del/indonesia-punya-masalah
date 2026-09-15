const SUPABASE_URL='https://gfggmkeucgqkkyvummpu.supabase.co';
const SUPABASE_KEY='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cb0';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('id-ID').format(Number(n)||0);
const cache=new Map();

async function supabase(path,opts={}){
  const r=await fetch(`${SUPABASE_URL}${path}`,{...opts,headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,'Content-Type':'application/json','Accept':'application/json',...(opts.headers||{})}});
  const t=await r.text(); let d=null;
  try{d=t?JSON.parse(t):null}catch{d=t}
  if(!r.ok) throw Error(typeof d==='string'?d:(d?.message||d?.hint||`HTTP ${r.status}`));
  return d;
}

async function regions(level,parent='',limit=100,search=''){
  const key=`${level}|${parent}|${limit}|${search}`;
  if(cache.has(key)) return cache.get(key);
  let u=`/rest/v1/regions?select=id,name,official_name,level,admin_code_bps,admin_code_pum,parent_region_id,boundary_status,source_name,latitude,longitude&source_name=eq.BIG&level=eq.${encodeURIComponent(level)}&order=name.asc&limit=${limit}`;
  if(parent) u+=`&parent_region_id=eq.${encodeURIComponent(parent)}`;
  if(search) u+=`&name=ilike.*${encodeURIComponent(search)}*`;
  const p=supabase(u); cache.set(key,p); return p;
}

async function table(path,limit=12,order='created_at.desc'){
  return supabase(`${path}?select=*&order=${encodeURIComponent(order)}&limit=${limit}`);
}

const pageData={
  regions:['JELAJAHI INDONESIA','Dari Indonesia sampai dusun','Navigasi wilayah resmi secara bertingkat, dengan boundary dan hubungan parent-child.'],
  problems:['MASALAH','Masalah yang perlu perhatian','Masalah, laporan, bukti, status verifikasi, dampak, dan perubahan dipisahkan agar informasi tetap jernih.'],
  data:['DATA & STATISTIK','Data Indonesia dalam satu tempat','Lihat cakupan wilayah, kualitas, sumber, waktu observasi, dan status pipeline.'],
  report:['SUARA WARGA','Ceritakan masalah di sekitar Anda','Cerita warga menjadi sinyal awal. Sistem tidak otomatis menganggap laporan sebagai fakta produksi.'],
  monitoring:['MONITORING','Apa yang sedang berubah?','Pantau masalah baru, membesar, menurun, viral, dan early warning.'],
  intelligence:['INTELLIGENCE','Memahami pola di balik masalah','Pattern, causal, trend, signal, forecast, dan AI bekerja di atas evidence.'],
  future:['FUTURE RADAR','Melihat kemungkinan ke depan','Forecast selalu membawa horizon, probabilitas, confidence, evidence, dan ketidakpastian.'],
  solutions:['SOLUSI','Dari masalah menuju tindakan','Bandingkan opsi berdasarkan konteks wilayah, bukti, dampak, risiko, dan outcome.'],
  control:['CONTROL CENTER','Kesehatan sistem','Pantau web publik, data, geometry runner, AI, keamanan, dan sinkronisasi.'],
  account:['AKUN','Ruang pengguna','Akun dipakai untuk kontribusi, pelaporan, dan akses fitur sesuai peran.'],
  more:['LAINNYA','Lebih banyak cara ikut terlibat','Metodologi, sumber data, tentang platform, dan kebijakan.']
};

function shell(k,body){const p=pageData[k];return `<div class="page"><span class="eyebrow">${p[0]}</span><h2>${p[1]}</h2><p class="muted">${p[2]}</p>${body}</div>`}
function setActive(view){document.querySelectorAll('.view').forEach(e=>e.classList.remove('active'));const el=$(view);if(el)el.classList.add('active');document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===view));window.scrollTo({top:0,behavior:'smooth'})}
function bindViews(){document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view));}
function pageInto(id,html){$(id).innerHTML=html;setActive(id);bindViews()}

async function renderRegions(){
  pageInto('regions',shell('regions',`
    <div class="pathbar" id="region-path">Indonesia / Provinsi</div>
    <div class="region-layout">
      <div class="card"><div class="cardhead"><b>DAFTAR WILAYAH</b><span id="region-status">memuat…</span></div>
        <div class="search-wrap small"><span>⌕</span><input id="region-search" placeholder="Cari provinsi atau wilayah…"><button id="region-search-btn">Cari</button></div>
        <div id="region-list" class="regionlist"></div>
      </div>
      <div class="card"><div class="cardhead"><b>RINGKASAN WILAYAH</b><span>hierarki resmi</span></div><div id="region-detail" class="muted">Pilih wilayah di sebelah kiri untuk membuka tingkat berikutnya.</div></div>
    </div>`));
  const list=$('region-list'), status=$('region-status');
  async function load(){
    list.innerHTML='<div class="loading"><b>Memuat wilayah…</b><small>Mengambil daftar dari basis wilayah BIG.</small></div>';
    try{
      const rows=await regions('province','',38,$('region-search').value.trim());
      list.innerHTML=rows.map(r=>`<button class="regionrow" data-id="${esc(r.id)}"><span><b>${esc(r.name)}</b><small>${esc(r.admin_code_pum||r.admin_code_bps||'')}</small></span><span>${r.boundary_status==='loaded'?'BOUNDARY OK':'BOUNDARY PENDING'} →</span></button>`).join('')||'<div class="empty"><b>Tidak ada wilayah ditemukan.</b><small>Coba kata kunci lain.</small></div>';
      status.textContent=`${fmt(rows.length)} provinsi`;
      list.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>drill(b.dataset.id,b.querySelector('b').textContent,'city'));
    }catch(e){status.textContent='mode aman';list.innerHTML=`<div class="empty"><b>Data wilayah belum dapat dimuat.</b><small>${esc(e.message)}</small></div>`}
  }
  $('region-search-btn').onclick=load; $('region-search').onkeydown=e=>{if(e.key==='Enter')load()}; await load();
}

async function drill(parentId,name,next){
  const d=$('region-detail'); if(!d)return;
  const labels={city:'Kabupaten / Kota',district:'Kecamatan',village:'Desa / Kelurahan'};
  d.innerHTML=`<div class="loading"><b>Membuka ${esc(name)}…</b><small>Mengambil ${labels[next]}.</small></div>`;
  try{
    const rows=await regions(next,parentId,200);
    $('region-path').textContent=`Indonesia / ${name} / ${labels[next]}`;
    d.innerHTML=`<div class="subcrumb"><b>${esc(name)}</b><span>→ ${labels[next]}</span></div><div class="regionlist compact">${rows.map(r=>`<button class="regionrow" data-id="${esc(r.id)}" data-level="${esc(r.level)}"><span><b>${esc(r.name)}</b><small>${esc(r.admin_code_pum||r.admin_code_bps||'')}</small></span><span>${r.boundary_status==='loaded'?'OK':'PENDING'} →</span></button>`).join('')||'<div class="empty">Belum ada child region.</div>'}</div>`;
    d.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{
      const level=b.dataset.level; const next2=level==='city'?'district':level==='district'?'village':null;
      if(next2) drill(b.dataset.id,b.querySelector('b').textContent,next2); else showRegionProfile(b.dataset.id,b.querySelector('b').textContent,level);
    });
  }catch(e){d.innerHTML=`<div class="empty"><b>Drill-down gagal.</b><small>${esc(e.message)}</small></div>`}
}

async function showRegionProfile(id,name,level){
  const d=$('region-detail');
  d.innerHTML=`<div class="subcrumb"><b>${esc(name)}</b><span>${esc(level)}</span></div><div class="kpirow"><div class="kpi"><small>WILAYAH</small><b>${esc(name)}</b><span>BIG registry</span></div><div class="kpi"><small>BOUNDARY</small><b>READY</b><span>status dapat dilihat dari registry</span></div><div class="kpi"><small>MASALAH</small><b>—</b><span>menunggu evidence</span></div></div><div class="notice">Profil wilayah ini menjadi pintu masuk ke masalah, data, laporan warga, dan analisis setempat.</div><button class="btn-primary" data-view="report">Laporkan masalah di wilayah ini</button>`;
  bindViews();
}

async function renderMap(){
  pageInto('map',shell('regions',`<div class="card"><div class="cardhead"><div><b>PETA INDONESIA</b><p class="muted">Peta publik menampilkan struktur wilayah dan sinyal. Boundary produksi ditampilkan setelah geometry tersedia.</p></div><div><button class="btn-outline" id="map-reset">Reset</button><button class="btn-primary" data-view="regions">Jelajahi wilayah</button></div></div><div class="map big" id="interactive-map"><div class="mapgrid"></div><div class="island a"></div><div class="island b"></div><div class="island c"></div><div class="island d"></div><i class="pin p1">●</i><i class="pin p2">●</i><i class="pin p3">●</i><i class="pin p4">●</i><div class="map-tooltip" id="map-tip">Pilih titik untuk melihat informasi wilayah.</div></div><div class="map-tools"><button class="filter active" data-filter="all">Semua</button><button class="filter" data-filter="problem">Masalah</button><button class="filter" data-filter="human">Suara Warga</button><button class="filter" data-filter="signal">Sinyal</button></div><div id="map-feedback" class="notice success">Peta interaktif siap. Klik marker untuk melihat konteks.</div></div>`));
  const tip=$('map-tip');
  document.querySelectorAll('.map .pin').forEach((p,i)=>p.onclick=()=>{const names=['Sumatera','Jawa Tengah','Sulawesi','Papua'];tip.innerHTML=`<b>${names[i]}</b><br><small>Contoh layer interaktif • buka Peta/Region untuk drill-down data nyata.</small>`});
  document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('map-feedback').textContent=`Filter ${b.textContent} aktif pada peta publik.`});
  $('map-reset').onclick=()=>{tip.textContent='Pilih titik untuk melihat informasi wilayah.'};
}

async function renderProblems(){
  pageInto('problems',shell('problems',`<div class="tabs"><button class="tab active" data-problem-tab="latest">Terkini</button><button class="tab" data-problem-tab="impact">Dampak tinggi</button><button class="tab" data-problem-tab="unresolved">Belum terselesaikan</button></div><div id="problem-content"><div class="loading">Memuat daftar masalah…</div></div>`));
  const tabs=document.querySelectorAll('[data-problem-tab]'); tabs.forEach(t=>t.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');loadProblems(t.dataset.problemTab)}); await loadProblems('latest');
}
async function loadProblems(mode){
  const box=$('problem-content'); box.innerHTML='<div class="loading">Mencari masalah…</div>';
  try{
    let path='/rest/v1/problems?select=id,title,category,status,confidence,impact_score,first_detected_at,last_observed_at&order=updated_at.desc&limit=30';
    if(mode==='impact')path+='&impact_score=gte.70'; if(mode==='unresolved')path+='&status=not.eq.resolved';
    const rows=await supabase(path);
    box.innerHTML=rows.length?`<div class="list">${rows.map(r=>`<button class="issue-card" data-problem-id="${esc(r.id)}"><div><span class="tag blue">${esc(r.category||'Masalah')}</span><h3>${esc(r.title)}</h3><small>${esc(r.status||'detected')} • confidence ${esc(r.confidence??'—')} • impact ${esc(r.impact_score??'—')}</small></div><span>→</span></button>`).join('')}</div>`:'<div class="empty"><b>Belum ada masalah produksi yang bisa ditampilkan.</b><small>Problem muncul setelah evidence tervalidasi.</small></div>';
    box.querySelectorAll('[data-problem-id]').forEach(b=>b.onclick=()=>problemDetail(b.dataset.problemId));
  }catch(e){box.innerHTML=`<div class="empty"><b>Belum bisa membaca Problem Engine.</b><small>${esc(e.message)}</small></div>`}
}
async function problemDetail(id){
  const box=$('problem-content');box.innerHTML='<div class="loading">Membuka detail masalah…</div>';
  try{const rows=await supabase(`/rest/v1/problems?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);const p=rows[0];if(!p)throw Error('Masalah tidak ditemukan');box.innerHTML=`<div class="card detail-card"><div class="cardhead"><span class="tag red">${esc(p.status||'detected')}</span><span>${esc(p.category||'—')}</span></div><h3>${esc(p.title)}</h3><div class="kpirow"><div class="kpi"><small>CONFIDENCE</small><b>${esc(p.confidence??'—')}</b></div><div class="kpi"><small>IMPACT</small><b>${esc(p.impact_score??'—')}</b></div><div class="kpi"><small>LAST OBSERVED</small><b>${p.last_observed_at?new Date(p.last_observed_at).toLocaleDateString('id-ID'):'—'}</b></div></div><div class="notice">Detail evidence, sumber, dan hubungan wilayah ditampilkan setelah evidence tersedia.</div></div>`}catch(e){box.innerHTML=`<div class="empty"><b>Detail gagal dibuka.</b><small>${esc(e.message)}</small></div>`}
}

async function renderData(){
  pageInto('data',shell('data',`<div class="stats"><div><small>PROVINSI</small><b>38</b><span>inventaris BIG</span></div><div><small>KAB / KOTA</small><b>514</b><span>inventaris BIG</span></div><div><small>KECAMATAN</small><b>7.282</b><span>geometri diproses bertahap</span></div><div><small>DESA / KEL</small><b>83.529</b><span>geometri diproses bertahap</span></div></div><div class="grid2"><div class="card"><div class="cardhead"><b>DATA TRUST</b><b id="trust-score">—</b></div><div class="meter"><i id="trust-meter" style="width:0%"></i></div><div class="trust"><span>Freshness <b id="trust-fresh">—</b></span><span>Completeness <b id="trust-complete">—</b></span><span>Consistency <b id="trust-consistent">—</b></span></div><p class="muted">Nilai trust dihitung dari metadata dataset ketika dataset produksi tersedia.</p></div><div class="card"><div class="cardhead"><b>PIPELINE</b><span>STATUS</span></div><div class="pipeline"><span>Acquisition</span><span>Validation</span><span>Geo Engine</span><span>Knowledge Graph</span><span>Problem Engine</span><span>AI Brain</span></div></div></div><div class="card"><div class="cardhead"><b>SUMBER DATA</b><button class="text-link" id="reload-sources">Refresh</button></div><div id="source-list" class="list"><div class="loading">Memuat sumber…</div></div></div>`));
  try{const src=await table('/rest/v1/sources',10,'reliability_score.desc');$('source-list').innerHTML=src.map(s=>`<article><div><b>${esc(s.name)}</b><small>${esc(s.publisher||'')} • ${esc(s.source_type||'')}</small></div><span>${esc(s.reliability_score??'—')}</span></article>`).join('')||'<div class="empty">Belum ada registry sumber.</div>'}catch(e){$('source-list').innerHTML=`<div class="empty"><b>Registry sumber belum tersedia secara publik.</b><small>${esc(e.message)}</small></div>`}
  $('reload-sources').onclick=()=>renderData();
}

function renderReport(){
  pageInto('report',shell('report',`<div class="report-intro"><div class="mini-icon red">♥</div><div><b>Masalah kecil tetap layak didengar.</b><span>Berikan konteks yang cukup agar laporan bisa diverifikasi.</span></div></div><div class="form card"><label>Judul masalah<input id="r-title" maxlength="140" placeholder="Contoh: Jalan rusak di depan sekolah"></label><label>Lokasi<input id="r-location" maxlength="180" placeholder="Desa / Kecamatan / Kabupaten"></label><label>Kategori<select id="r-category"><option>Infrastruktur</option><option>Ekonomi</option><option>Pendidikan</option><option>Kesehatan</option><option>Lingkungan</option><option>Sosial</option></select></label><label>Kejadian<input id="r-date" type="date"></label><label>Ceritakan<textarea id="r-story" rows="7" maxlength="5000" placeholder="Apa yang terjadi? Siapa yang terdampak? Sejak kapan? Apa yang sudah dicoba?"></textarea></label><div class="notice">Laporan warga dicatat sebagai <b>human signal</b>. Verifikasi tetap diperlukan sebelum menjadi fakta atau problem produksi.</div><button id="send-report" class="btn-primary">Kirim laporan</button><div id="report-result"></div></div>`));
  $('send-report').onclick=async()=>{
    const x={title:$('r-title').value.trim(),location:$('r-location').value.trim(),category:$('r-category').value,narrative:$('r-story').value.trim(),occurred_at:$('r-date').value||null};
    if(!x.title||!x.narrative){$('report-result').innerHTML='<div class="notice danger">Judul dan cerita wajib diisi.</div>';return}
    $('send-report').disabled=true;$('report-result').innerHTML='<div class="notice">Mengirim laporan…</div>';
    try{await supabase('/rest/v1/human_reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({category:x.category,title:x.title,narrative:`${x.location?`Lokasi: ${x.location}\n`:''}${x.narrative}`,occurred_at:x.occurred_at,verification_status:'received'})});$('report-result').innerHTML='<div class="notice success">Terima kasih. Laporan sudah diterima sebagai sinyal warga.</div>';$('r-title').value='';$('r-location').value='';$('r-story').value=''}catch(e){$('report-result').innerHTML=`<div class="notice danger">Laporan belum bisa dikirim. ${esc(e.message)}</div>`}finally{$('send-report').disabled=false}
  };
}

async function renderMonitoring(){
  pageInto('monitoring',shell('monitoring',`<div class="tabs"><button class="tab active" data-monitor="new">Masalah baru</button><button class="tab" data-monitor="rise">Membesar</button><button class="tab" data-monitor="fall">Menurun</button><button class="tab" data-monitor="warning">Early warning</button></div><div id="monitor-content"><div class="loading">Memuat sinyal…</div></div>`));
  const tabs=document.querySelectorAll('[data-monitor]');tabs.forEach(t=>t.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');loadSignals(t.dataset.monitor)});await loadSignals('new');
}
async function loadSignals(mode){const box=$('monitor-content');box.innerHTML='<div class="loading">Memuat sinyal…</div>';try{let q='/rest/v1/early_signals?select=*&order=detected_at.desc&limit=30';if(mode==='warning')q+='&status=eq.warning';const rows=await supabase(q);box.innerHTML=rows.length?`<div class="list">${rows.map(r=>`<article><span class="tag ${Number(r.magnitude)>70?'red':'blue'}">${esc(r.status||'monitoring')}</span><div><b>${esc(r.title)}</b><small>${esc(r.category||'')} • confidence ${esc(r.confidence??'—')}</small></div><strong>${esc(r.magnitude??'—')}</strong></article>`).join('')}</div>`:'<div class="empty"><b>Belum ada stream sinyal produksi.</b><small>Sinyal akan muncul ketika pipeline observation dan early signal terisi.</small></div>'}catch(e){box.innerHTML=`<div class="empty"><b>Monitoring belum terhubung.</b><small>${esc(e.message)}</small></div>`}}

function renderIntelligence(){
  pageInto('intelligence',shell('intelligence',`<div class="ai"><button data-intel="pattern"><b>Pattern AI</b><span>Temukan pola berulang.</span></button><button data-intel="causal"><b>Causal Analysis</b><span>Uji hipotesis penyebab.</span></button><button data-intel="trend"><b>Trend & Signal</b><span>Deteksi perubahan.</span></button><button data-intel="future"><b>Future Radar</b><span>Susun kemungkinan.</span></button><button data-intel="forecast"><b>Forecast Engine</b><span>Hitung probabilitas.</span></button><button data-intel="brain"><b>AI Brain</b><span>Belajar dari outcome.</span></button></div><div id="intel-output" class="card"><b>Pilih satu lapisan intelligence.</b><p class="muted">Setiap lapisan akan menampilkan evidence, metode, confidence, dan uncertainty.</p></div>`));
  document.querySelectorAll('[data-intel]').forEach(b=>b.onclick=()=>intelOpen(b.dataset.intel));
}
function intelOpen(type){const cfg={pattern:['Pattern AI','Mencari pola berulang pada observation, report, dan signal yang tervalidasi.'],causal:['Causal Analysis','Menyusun hipotesis penyebab dan memisahkan korelasi dari hubungan sebab-akibat.'],trend:['Trend & Signal','Mencari perubahan terhadap baseline dan mendeteksi sinyal awal.'],future:['Future Radar','Menyusun kemungkinan masa depan tanpa menyamakan kemungkinan dengan fakta.'],forecast:['Forecast Engine','Menampilkan probabilitas berbasis baseline dan model yang terdaftar.'],brain:['AI Brain','Belajar dari outcome dan evaluasi prediksi sebelumnya.']}[type];$('intel-output').innerHTML=`<b>${cfg[0]}</b><h3>${cfg[1]}</h3><div class="flow"><span>Evidence</span><span>Baseline</span><span>Model</span><span>Confidence</span><span>Uncertainty</span><span>Outcome</span></div><div class="notice">Mode produksi akan mengisi panel ini dari data nyata. Tidak ada angka prediksi sintetis yang ditampilkan sebagai fakta.</div>`}

function renderFuture(){pageInto('future',shell('future',`<div class="forecast"><article><small>SKENARIO UTAMA</small><strong>—</strong><b>Baseline belum tersedia</b><span>Butuh data historis yang cukup.</span></article><article><small>ALTERNATIF</small><strong>—</strong><b>Stabil</b><span>Belum dihitung.</span></article><article><small>RISIKO RENDAH</small><strong>—</strong><b>Menurun</b><span>Belum dihitung.</span></article></div><div class="card"><b>FORECAST SAFETY GATE</b><p class="muted">Fakta, asumsi, probabilitas, confidence, dan uncertainty selalu dipisahkan.</p><button class="btn-primary" data-view="intelligence">Buka Intelligence →</button></div>`))}

function renderSolutions(){pageInto('solutions',shell('solutions',`<div class="list"><article><b>01</b><div><b>Solusi berbasis wilayah</b><small>Fokus pada akar masalah dan kondisi lokal.</small></div><button class="btn-outline" data-view="regions">Lihat wilayah</button></article><article><b>02</b><div><b>Kolaborasi warga & pemerintah</b><small>Report → validasi → tindakan → outcome.</small></div><button class="btn-outline" data-view="report">Mulai dari warga</button></article><article><b>03</b><div><b>Uji skenario</b><small>Simulasikan dampak sebelum intervensi diterapkan.</small></div><button class="btn-outline" data-view="future">Simulasikan</button></article></div><div class="notice">Rekomendasi solusi produksi akan diranking berdasarkan evidence, konteks, dampak, risiko, dan hasil nyata.</div>`))}

function renderControl(){pageInto('control',shell('control',`<div class="control"><div><small>PUBLIC WEB</small><b>ONLINE</b><span>Human-centered shell</span></div><div><small>GEOMETRY</small><b>RUNNING</b><span>District + village runners</span></div><div><small>DATA</small><b>TRACEABLE</b><span>Source-aware</span></div><div><small>AI</small><b>GUARDED</b><span>Evidence first</span></div></div><div class="card"><b>OPERATIONS NOTE</b><p class="muted">Geometry runner dan pipeline data berjalan terpisah dari halaman publik. UI hanya membaca status dan tidak mengubah pekerjaan background.</p></div>`))}
function renderAccount(){pageInto('account',shell('account',`<div class="form card"><label>Nama<input id="profile-name" placeholder="Nama tampilan"></label><label>Peran<select id="profile-role"><option>Warga</option><option>Peneliti</option><option>Pemerintah</option><option>Moderator</option><option>Admin</option></select></label><button class="btn-primary" id="save-profile">Simpan Profil</button><div id="profile-result"></div></div>`));$('save-profile').onclick=()=>{localStorage.setItem('ipm_profile_name',$('profile-name').value.trim());localStorage.setItem('ipm_profile_role',$('profile-role').value);$('profile-result').innerHTML='<div class="notice success">Profil tersimpan di browser ini.</div>'};const n=localStorage.getItem('ipm_profile_name');const r=localStorage.getItem('ipm_profile_role');if(n)$('profile-name').value=n;if(r)$('profile-role').value=r}
function renderMore(){pageInto('more',shell('more',`<div class="feature-links"><button data-view="data"><b>Sumber data</b><span>Lihat registry dan kualitas sumber.</span></button><button data-view="intelligence"><b>Metodologi intelligence</b><span>Kenali batas AI, evidence, dan uncertainty.</span></button><button data-view="report"><b>Kontribusi warga</b><span>Mulai dari laporan masalah.</span></button><button data-view="solutions"><b>Tentang solusi</b><span>Dari bukti menuju tindakan.</span></button></div>`))}

async function analyze(){
  const q=$('question')?.value.trim(); if(!q)return;
  setActive('result');$('result').innerHTML=`<div class="page"><span class="eyebrow">PENCARIAN INDONESIA</span><h2>${esc(q)}</h2><p class="muted">Mencari konteks wilayah, masalah, dan sumber yang tersedia…</p><div id="search-results" class="card"><div class="loading">Menelusuri…</div></div></div>`;
  try{
    const data=await supabase(`/rest/v1/regions?select=id,name,level,admin_code_pum,admin_code_bps&source_name=eq.BIG&name=ilike.*${encodeURIComponent(q)}*&limit=12`);
    const problems=await supabase(`/rest/v1/problems?select=id,title,category,status,confidence,impact_score&title=ilike.*${encodeURIComponent(q.replace(/[^a-zA-Z0-9 ]/g,''))}*&limit=8`).catch(()=>[]);
    $('search-results').innerHTML=`<div class="search-section"><b>Wilayah terkait</b>${data.length?data.map(r=>`<button class="search-hit" data-view="regions"><span>${esc(r.name)}</span><small>${esc(r.level)} • ${esc(r.admin_code_pum||r.admin_code_bps||'')}</small></button>`).join(''):'<p class="muted">Belum ada wilayah yang cocok.</p>'}</div><div class="search-section"><b>Masalah terkait</b>${problems.length?problems.map(r=>`<button class="search-hit" data-view="problems"><span>${esc(r.title)}</span><small>${esc(r.category||'')} • confidence ${esc(r.confidence??'—')}</small></button>`).join(''):'<p class="muted">Belum ada masalah produksi yang cocok.</p>'}</div><div class="notice">Pencarian publik membedakan hasil yang benar-benar ditemukan dari hal yang belum memiliki data.</div>`;bindViews();
  }catch(e){$('search-results').innerHTML=`<div class="empty"><b>Pencarian belum terhubung.</b><small>${esc(e.message)}</small></div>`}
}

function init(){
  bindViews();
  document.querySelectorAll('.topic-chips [data-q]').forEach(b=>b.onclick=()=>{$('question').value=b.dataset.q;analyze()});
  $('ask')?.addEventListener('click',analyze);$('question')?.addEventListener('keydown',e=>{if(e.key==='Enter')analyze()});
  $('mobileMenu')?.addEventListener('click',()=>document.querySelector('.main-nav')?.classList.toggle('open'));
  document.querySelector('.icon-btn')?.addEventListener('click',()=>{$('question')?.focus();window.scrollTo({top:180,behavior:'smooth'})});
  render('home');
}

function render(v){
  if(v==='home'){setActive('home');bindViews();return}
  if(v==='regions')return renderRegions(); if(v==='map')return renderMap(); if(v==='problems')return renderProblems(); if(v==='data')return renderData(); if(v==='report')return renderReport(); if(v==='monitoring')return renderMonitoring(); if(v==='intelligence')return renderIntelligence(); if(v==='future')return renderFuture(); if(v==='solutions')return renderSolutions(); if(v==='control')return renderControl(); if(v==='account')return renderAccount(); if(v==='more')return renderMore();
}

document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
