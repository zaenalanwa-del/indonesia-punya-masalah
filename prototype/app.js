const SUPABASE_URL='https://gfggmkeucgqkkyvummpu.supabase.co';
const SUPABASE_KEY='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cb0';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('id-ID').format(Number(n)||0);
const apiHeaders={'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`};
const cache=new Map();

const pages={
regions:['REGION INTELLIGENCE','Jelajahi Indonesia','Navigasi wilayah resmi dari tingkat provinsi sampai desa/kelurahan, dengan parent-child drill-down dan status batas.'],
problems:['PROBLEM ENGINE','Masalah yang perlu perhatian','Prioritas dibangun dari dampak, perubahan, bukti, dan suara manusia.'],
data:['DATA OCEAN','Data & Statistik','Pantau cakupan wilayah, kualitas data, freshness, completeness, dan sumber.'],
report:['MASS HUMAN INTERACTION','Laporkan Masalah','Laporan warga masuk sebagai sinyal mentah lalu melewati validasi dan penguatan bukti.'],
monitoring:['SIGNAL CENTER','Monitoring','Pantau masalah baru, membesar, menurun, viral, dan early warning.'],
intelligence:['INTELLIGENCE LAYER','Intelligence','Pattern, causal, trend, forecast, dan AI bekerja di atas evidence yang dapat ditelusuri.'],
future:['FUTURE INTELLIGENCE','Future Radar','Pisahkan kemungkinan, probabilitas, confidence, horizon, dan ketidakpastian.'],
solutions:['SOLUTION LAYER','Dari masalah ke solusi','Bandingkan opsi solusi berdasarkan kecocokan wilayah, bukti, dampak, risiko, dan hasil.'],
control:['OPERATIONS','Control Center','Pantau kesehatan pipeline, data, geometri, AI, keamanan, dan pekerjaan sinkronisasi.'],
account:['ACCOUNT','Profil pengguna','Akses publik, analitik, kontribusi warga, dan administrasi mengikuti peran.']
};

async function supabase(path,opts={}){
  const r=await fetch(`${SUPABASE_URL}${path}`,{...opts,headers:{...apiHeaders,'Accept':'application/json',...(opts.headers||{})}});
  const text=await r.text();
  let data=null; try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok) throw new Error(typeof data==='string'?data:(data?.message||data?.hint||`HTTP ${r.status}`));
  return data;
}
async function queryRegions(level,parentId='',limit=100){
  const key=`${level}|${parentId}|${limit}`;
  if(cache.has(key)) return cache.get(key);
  let url=`/rest/v1/regions?select=id,name,level,admin_code_bps,admin_code_pum,parent_region_id,latitude,longitude,boundary_status,source_name&level=eq.${encodeURIComponent(level)}&source_name=eq.BIG&order=name.asc&limit=${limit}`;
  if(parentId) url+=`&parent_region_id=eq.${encodeURIComponent(parentId)}`;
  const p=supabase(url).then(x=>Array.isArray(x)?x:[]);
  cache.set(key,p); return p;
}
async function regionSummary(){
  const levels=[['province','Provinsi'],['city','Kab/Kota'],['district','Kecamatan'],['village','Desa/Kel']];
  const out=[];
  for(const [level,label] of levels){
    try{
      const rows=await queryRegions(level,'',5);
      out.push({label,rows,ok:true});
    }catch(e){out.push({label,rows:[],ok:false,error:e.message})}
  }
  return out;
}
function nav(){
  document.querySelectorAll('nav [data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view));
  document.querySelectorAll('.chips [data-q]').forEach(b=>b.onclick=()=>{$('question').value=b.dataset.q;analyze()});
}
function shell(title,desc,body){
  return `<div class="page"><small class="eyebrow">${title}</small><h2>${desc.title||desc}</h2>${desc.subtitle?`<p class="muted">${desc.subtitle}</p>`:''}${body}</div>`
}
function regionCard(r){
 return `<button class="regionrow" data-region-id="${esc(r.id)}" data-region-level="${esc(r.level)}"><span><b>${esc(r.name)}</b><small>${esc(r.admin_code_pum||r.admin_code_bps||'')}</small></span><span>${r.boundary_status==='loaded'?'BOUNDARY OK':'BOUNDARY PENDING'} →</span></button>`;
}
async function renderRegions(){
 const e=$('regions'); e.innerHTML=shell(pages.regions[0],{title:pages.regions[1],subtitle:pages.regions[2]},`<div id="region-path" class="pathbar">Indonesia / Provinsi</div><div class="card"><div class="cardhead"><b>PROVINSI</b><span id="region-status">memuat…</span></div><div id="region-list" class="regionlist"></div></div><div class="card"><div class="cardhead"><b>DRILL-DOWN</b><span>Provinsi → Kab/Kota → Kecamatan → Desa/Kel</span></div><div id="region-detail" class="muted">Pilih wilayah untuk membuka tingkat berikutnya.</div></div>`);
 const list=$('region-list');
 try{
  const rows=await queryRegions('province','',38); list.innerHTML=rows.map(regionCard).join(''); $('region-status').textContent=`${fmt(rows.length)} dimuat`;
  list.querySelectorAll('[data-region-id]').forEach(btn=>btn.onclick=()=>drillRegion(btn.dataset.regionId,btn.querySelector('b').textContent,'city'));
 }catch(err){list.innerHTML=`<div class="empty"><b>Data wilayah belum dapat dibaca dari API publik.</b><small>${esc(err.message)}</small></div>`;$('region-status').textContent='fallback';}
}
async function drillRegion(id,name,next){
 const detail=$('region-detail'); if(!detail)return;
 detail.innerHTML=`<div class="loading">Membuka ${esc(name)}…</div>`;
 const chain={city:'Kab/Kota',district:'Kecamatan',village:'Desa/Kel'};
 try{
  const rows=await queryRegions(next,id,100);
  detail.innerHTML=`<div class="subcrumb"><b>${esc(name)}</b> → ${chain[next]}</div><div class="regionlist compact">${rows.map(regionCard).join('')||'<div class="empty">Belum ada child region yang ditemukan.</div>'}</div>`;
  detail.querySelectorAll('[data-region-id]').forEach(btn=>btn.onclick=()=>{
    const level=btn.dataset.regionLevel;
    const next2=level==='city'?'district':level==='district'?'village':null;
    if(next2) drillRegion(btn.dataset.regionId,btn.querySelector('b').textContent,next2);
  });
 }catch(err){detail.innerHTML=`<div class="empty"><b>Drill-down belum tersedia.</b><small>${esc(err.message)}</small></div>`}
}

function renderProblems(){
 $('problems').innerHTML=shell(pages.problems[0],{title:pages.problems[1],subtitle:pages.problems[2]},`<div class="kpirow"><div class="kpi"><small>DETECTED</small><b>—</b><span>menunggu evidence layer</span></div><div class="kpi"><small>HIGH IMPACT</small><b>—</b><span>belum dihitung</span></div><div class="kpi"><small>CHANGING</small><b>—</b><span>trend engine</span></div></div><div class="card"><div class="cardhead"><b>PROBLEM QUEUE</b><span>Evidence-first</span></div><div class="list"><article><mark>PIPELINE</mark><div><b>Problem engine aktif</b><small>Masalah produksi muncul setelah bukti tervalidasi dan dikaitkan ke wilayah.</small></div><span>READY</span></article><article><mark>TRUST</mark><div><b>Setiap masalah wajib punya jejak evidence</b><small>Sumber, waktu observasi, confidence, dan ketidakpastian tetap terlihat.</small></div><span>TRACEABLE</span></article></div></div>`);
}
function renderData(){
 $('data').innerHTML=shell(pages.data[0],{title:pages.data[1],subtitle:pages.data[2]},`<div class="stats"><div><small>PROVINSI</small><b>38</b><span>inventaris BIG</span></div><div><small>KAB/KOTA</small><b>514</b><span>inventaris BIG</span></div><div><small>KECAMATAN</small><b>7.282</b><span>geometri berjalan</span></div><div><small>DESA/KEL</small><b>83.529</b><span>geometri berjalan</span></div></div><div class="grid2"><div class="card"><div class="cardhead"><b>DATA TRUST</b><b>91/100*</b></div><div class="meter"><i style="width:91%"></i></div><div class="trust"><span>Freshness <b>94</b></span><span>Completeness <b>89</b></span><span>Consistency <b>92</b></span></div><small class="muted">*indikator UI; nilai produksi akan dihitung dari metadata dataset.</small></div><div class="card"><div class="cardhead"><b>GEOMETRY COVERAGE</b><span>LIVE JOBS</span></div><div class="pipeline"><span>Province ✓</span><span>City ✓</span><span>District →</span><span>Village →</span></div><p class="muted">Boundary menjadi dasar peta, drill-down wilayah, agregasi dan analisis spasial.</p></div></div>`);
}
function renderMonitoring(){
 $('monitoring').innerHTML=shell(pages.monitoring[0],{title:pages.monitoring[1],subtitle:pages.monitoring[2]},`<div class="grid2"><div class="card"><small>EARLY WARNING</small><h3>Signal baru</h3><div class="empty"><b>Menunggu stream sinyal produksi</b><small>Trend & Signal AI akan mengisi ketika observation/social signal tersedia.</small></div></div><div class="card"><small>HUMAN SIGNAL</small><h3>Suara warga</h3><p class="muted">Laporan tidak langsung dianggap fakta. Sistem memisahkan report, evidence, verification, dan problem.</p><button class="primary" data-view="report">Buat laporan →</button></div></div>`); nav();
}
function renderIntelligence(){
 $('intelligence').innerHTML=shell(pages.intelligence[0],{title:pages.intelligence[1],subtitle:pages.intelligence[2]},`<div class="ai"><article><b>Pattern AI</b><span>Temukan pola berulang</span></article><article><b>Causal Analysis</b><span>Uji hipotesis penyebab</span></article><article><b>Trend & Signal</b><span>Deteksi perubahan</span></article><article><b>Future Radar</b><span>Susun kemungkinan</span></article><article><b>Forecast Engine</b><span>Hitung probabilitas</span></article><article><b>Scenario Simulator</b><span>Uji intervensi</span></article></div><div class="card"><b>ATURAN KERJA AI</b><p class="muted">AI tidak boleh mengubah sinyal menjadi keputusan tanpa evidence, confidence, provenance, dan uncertainty yang dapat ditelusuri.</p></div>`);
}
function renderFuture(){
 $('future').innerHTML=shell(pages.future[0],{title:pages.future[1],subtitle:pages.future[2]},`<div class="forecast"><article><small>SCENARIO A</small><strong>—</strong><b>Menunggu baseline</b><span>probabilitas belum dihitung</span></article><article><small>SCENARIO B</small><strong>—</strong><b>Stabil</b><span>butuh data produksi</span></article><article><small>SCENARIO C</small><strong>—</strong><b>Menurun</b><span>butuh evaluasi outcome</span></article></div><div class="card"><b>FORECAST SAFETY GATE</b><p class="muted">Prediksi hanya ditampilkan setelah kualitas data dan bukti memenuhi ambang yang ditetapkan.</p></div>`);
}
function renderSolutions(){
 $('solutions').innerHTML=shell(pages.solutions[0],{title:pages.solutions[1],subtitle:pages.solutions[2]},`<div class="list"><article><b>01</b><div><b>Solusi berbasis wilayah</b><small>Prioritaskan titik masalah dengan dampak dan confidence yang jelas.</small></div><span>BEST FIT</span></article><article><b>02</b><div><b>Kolaborasi warga & pemerintah</b><small>Report → validasi → tindakan → outcome.</small></div><span>TRACK</span></article><article><b>03</b><div><b>Scenario Simulator</b><small>Bandingkan risiko sebelum intervensi diterapkan.</small></div><span>SIMULATE</span></article></div>`);
}
function renderControl(){
 $('control').innerHTML=shell(pages.control[0],{title:pages.control[1],subtitle:pages.control[2]},`<div class="control"><div><small>WEB</small><b>ONLINE</b><span>Public shell</span></div><div><small>GEOMETRY</small><b>RUNNING</b><span>District + village jobs</span></div><div><small>DATA</small><b>TRACEABLE</b><span>Source registry</span></div><div><small>AI</small><b>GUARDED</b><span>Evidence first</span></div></div>`);
}
function renderAccount(){
 $('account').innerHTML=shell(pages.account[0],{title:pages.account[1],subtitle:pages.account[2]},`<div class="form card"><label>Nama<input placeholder="Nama tampilan"></label><label>Peran<select><option>Warga</option><option>Peneliti</option><option>Pemerintah</option><option>Moderator</option><option>Admin</option></select></label><button class="primary" onclick="alert('Profil demo tersimpan di browser.')">Simpan Profil</button></div>`);
}
function renderReport(){
 $('report').innerHTML=shell(pages.report[0],{title:pages.report[1],subtitle:pages.report[2]},`<div class="form card" id="report-form"><label>Judul masalah<input id="r-title" placeholder="Contoh: Jalan rusak di depan sekolah"></label><label>Lokasi<input id="r-location" placeholder="Desa / Kecamatan / Kabupaten"></label><label>Kategori<select id="r-category"><option>Infrastruktur</option><option>Sosial</option><option>Kesehatan</option><option>Pendidikan</option><option>Ekonomi</option><option>Lingkungan</option></select></label><label>Terjadi sejak<input id="r-date" type="date"></label><label>Ceritakan<textarea id="r-story" rows="6" placeholder="Apa yang terjadi? Siapa yang terdampak? Sejak kapan?"></textarea></label><div class="notice">Laporan ini akan diperlakukan sebagai sinyal warga dan perlu verifikasi sebelum menjadi data fakta/problem produksi.</div><button class="primary" id="send-report">Kirim laporan</button><div id="report-result"></div></div>`);
 $('send-report').onclick=()=>{const payload={title:$('r-title').value.trim(),location:$('r-location').value.trim(),category:$('r-category').value,occurred_at:$('r-date').value||null,narrative:$('r-story').value.trim(),created_at:new Date().toISOString()}; if(!payload.title||!payload.narrative){$('report-result').innerHTML='<div class="notice danger">Judul dan cerita wajib diisi.</div>';return} const arr=JSON.parse(localStorage.getItem('ipm_reports')||'[]');arr.push(payload);localStorage.setItem('ipm_reports',JSON.stringify(arr));$('report-result').innerHTML='<div class="notice success">Laporan tersimpan di perangkat sebagai draft kontribusi. Koneksi ke inbox verifikasi server akan diaktifkan pada tahap backend.</div>';};
}
async function renderMap(){
 const e=$('map'); e.innerHTML=shell('GEOSPATIAL ENGINE',{title:'Peta Intelligence Indonesia',subtitle:'Peta publik dimulai dari inventaris wilayah dan akan berkembang menjadi layer masalah, human signal, evidence, trend, dan forecast.'},`<div class="map bigmap"><div class="mapgrid"></div><div class="island a"></div><div class="island b"></div><div class="island c"></div><div class="island d"></div><i class="pin p1">● Problem</i><i class="pin p2">● Human</i><i class="pin p3">● Signal</i><label>INDONESIA INTELLIGENCE MAP</label></div><div class="card"><div class="cardhead"><b>HIERARCHY</b><span>6 LEVEL</span></div><div class="steps compactsteps"><span><b>1</b>Indonesia</span><span><b>2</b>Provinsi</span><span><b>3</b>Kab/Kota</span><span><b>4</b>Kecamatan</span><span><b>5</b>Desa/Kel</span><span><b>6</b>Dusun</span></div></div>`);
}
function render(v){
 document.querySelectorAll('.view').forEach(x=>x.classList.remove('active')); const e=$(v); e.classList.add('active');
 $('crumb').textContent=v==='home'?'Beranda':pages[v]?.[1]||'Hasil';
 if(v==='regions') renderRegions(); else if(v==='map') renderMap(); else if(v==='problems') renderProblems(); else if(v==='data') renderData(); else if(v==='report') renderReport(); else if(v==='monitoring') renderMonitoring(); else if(v==='intelligence') renderIntelligence(); else if(v==='future') renderFuture(); else if(v==='solutions') renderSolutions(); else if(v==='control') renderControl(); else if(v==='account') renderAccount();
 e.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>render(b.dataset.view)); window.scrollTo({top:0,behavior:'smooth'});
}
async function analyze(){
 const t=$('question').value.trim(); if(!t)return; const r=$('result'); document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); r.classList.add('active'); $('crumb').textContent='Hasil Analisis';
 r.innerHTML=`<div class="page"><small class="eyebrow">QUESTION ORCHESTRATOR</small><h2>Menganalisis: “${esc(t)}”</h2><div class="flow"><span>Intent</span><span>Lokasi</span><span>Evidence</span><span>Confidence</span><span>Forecast</span><span>Solution</span></div><div class="card" id="analysis-card"><div class="loading">Menghubungkan ke engine jawaban…</div></div></div>`;
 try{
   const data=await fetch(`/api/ask?q=${encodeURIComponent(t)}`).then(async x=>{if(!x.ok)throw new Error(`API /api/ask HTTP ${x.status}`);return x.json()});
   $('analysis-card').innerHTML=`<span class="live">API CONNECTED</span><h3>${esc(data.summary||'Jawaban diterima dari orchestrator.')}</h3><div class="trust"><span>Confidence <b>${esc(data.confidence??'—')}</b></span><span>Evidence <b>${esc(data.evidence_strength??'—')}</b></span></div><p class="muted">${data.uncertainty?.length?esc(data.uncertainty.join(' • ')):'Ketidakpastian tidak tersedia pada respons.'}</p>`;
 }catch(err){
   $('analysis-card').innerHTML=`<span class="live">UI FALLBACK</span><h3>Sinyal pertanyaan sudah dipahami.</h3><p class="muted">Engine publik belum tersedia dari halaman ini. Alur tetap menjaga urutan: intent → lokasi → evidence → confidence → forecast → solution.</p><div class="notice">${esc(err.message)}</div>`;
 }
 window.scrollTo({top:0,behavior:'smooth'});
}
nav(); $('ask').onclick=analyze; $('question').onkeydown=e=>{if(e.key==='Enter')analyze()}; render('home');