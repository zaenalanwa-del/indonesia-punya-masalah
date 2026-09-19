(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],modal=$('#modal'),mb=$('#mb');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('id-ID');
function applyLocalHeroAsset(){
 const heroUrl='/assets/IKN%202026.png';
 document.querySelectorAll('.heroGaruda').forEach(el=>{
   el.style.backgroundImage="url('"+heroUrl+"')";
   el.style.backgroundSize='cover';
   el.style.backgroundPosition='center center';
   el.style.opacity='1';
 });
 document.querySelectorAll('.heroGarudaImage').forEach(img=>{img.src=heroUrl;img.removeAttribute('srcset');});
 document.querySelectorAll('.heroGarudaCredit').forEach(el=>{el.style.display='none';});
}
applyLocalHeroAsset();

function openModal(title,html){if(!modal||!mb)return;mb.innerHTML='<h2>'+esc(title)+'</h2>'+html;modal.classList.add('open')}
function closeModal(){modal?.classList.remove('open')}
$('#close')?.addEventListener('click',closeModal);modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
let portal=null;
const SUPABASE_URL='https://gfggmkeucgqkkyvummpu.supabase.co';
const SUPABASE_KEY='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw0';
const sb=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
let session=null;
async function getSession(){if(!sb)return null;const r=await sb.auth.getSession();session=r.data.session||null;return session}
function authHeaders(){return session?.access_token?{Authorization:'Bearer '+session.access_token}:{} }
function renderAuth(){const a=$('#authArea');if(!a)return;const label=session?.user?.email||'Pengunjung';const sub=session?'Akun aktif · Laporan Saya':'Masuk / Daftar';a.innerHTML='<span class="bell">♧<b>3</b></span><button class="authBtn" id="authBtn" type="button"><span class="avatar">👤</span><span><strong>'+esc(label)+'</strong><small>'+esc(sub)+'</small></span></button>';$('#authBtn')?.addEventListener('click',authPanel)}
function authPanel(mode='login'){
if(session){
openModal('Akun Saya','<p><b>'+esc(session.user.email||'')+'</b></p><p class="authNote">Akses data pribadi dibatasi ke akun ini. Admin/moderator memproses laporan sesuai kewenangan.</p><div class="authLinks"><button class="outline" id="myReportsBtn">Laporan Saya</button><button class="outline" id="logoutBtn">Keluar</button></div>');
$('#logoutBtn')?.addEventListener('click',async()=>{await sb.auth.signOut();session=null;renderAuth();closeModal();loadPortal()});
$('#myReportsBtn')?.addEventListener('click',()=>{const rows=portal?.tables?.my_citizen_reports||[];openModal('Laporan Saya',rows.length?rows.map(x=>'<div class="rankrow"><span>●</span><span><b>'+esc(x.title||'Tanpa judul')+'</b><br><small>'+esc(x.category||'')+' · '+esc(x.verification_status||'unverified')+'</small></span><strong>'+esc(x.reported_at||'')+'</strong></div>').join(''):'<p>Belum ada laporan dari akun ini.</p>')});
return;
}
const isSignup=mode==='signup';
const title=isSignup?'Buat Akun Baru':'Masuk ke Akun';
const html=isSignup?'<form class="authForm" id="authForm"><div class="authTwo"><input name="first_name" required maxlength="80" placeholder="Nama Depan"><input name="last_name" maxlength="80" placeholder="Nama Belakang"></div><input name="identifier" type="text" required autocomplete="username" placeholder="Nomor Ponsel atau Email"><div class="passwordWrap"><input id="authPassword" type="password" name="password" required minlength="6" autocomplete="new-password" placeholder="Kata Sandi Baru" style="padding-right:48px"><button type="button" id="togglePassword" aria-label="Tampilkan password" title="Tampilkan password" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:0;background:transparent;cursor:pointer;font-size:20px;line-height:1">👁️</button></div><div class="authThree"><select name="birth_day" required><option value="">Hari</option>'+Array.from({length:31},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+'</option>').join('')+'</select><select name="birth_month" required><option value="">Bulan</option>'+['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((m,i)=>'<option value="'+(i+1)+'">'+m+'</option>').join('')+'</select><select name="birth_year" required><option value="">Tahun</option>'+Array.from({length:100},(_,i)=>{const y=new Date().getFullYear()-i;return '<option value="'+y+'">'+y+'</option>'}).join('')+'</select></div><div class="gender"><span>Jenis Kelamin:</span><label><input type="radio" name="gender" value="female" required> Perempuan</label><label><input type="radio" name="gender" value="male"> Laki-laki</label><label><input type="radio" name="gender" value="custom"> Khusus (Custom)</label></div><p class="privacy">Dengan mengklik Daftar, Anda menyetujui Ketentuan, Kebijakan Privasi, dan Kebijakan Cookie kami.</p><button class="cta" type="submit">Daftar</button><button class="outline" type="button" id="switchAuth">Sudah punya akun? Login / Masuk</button><p class="authNote" id="authMsg">Gunakan email untuk pendaftaran agar konfirmasi akun dapat dikirim melalui email.</p></form>'
:'<form class="authForm" id="authForm"><input name="identifier" type="text" required autocomplete="username" placeholder="Email atau Nomor Telepon"><div class="passwordWrap"><input id="authPassword" type="password" name="password" required minlength="6" autocomplete="current-password" placeholder="Kata Sandi" style="padding-right:48px"><button type="button" id="togglePassword" aria-label="Tampilkan password" title="Tampilkan password" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:0;background:transparent;cursor:pointer;font-size:20px;line-height:1">👁️</button></div><button class="cta" type="submit">Login / Masuk</button><button class="outline" type="button" id="forgotBtn">Lupa Kata Sandi?</button><button class="outline" type="button" id="switchAuth">Buat Akun Baru</button><p class="authNote" id="authMsg">Masuk menggunakan email atau nomor telepon yang terdaftar.</p></form>';
openModal(title,html);
const pw=$('#authPassword'),tp=$('#togglePassword');
tp?.addEventListener('click',()=>{const show=pw?.type==='password';if(pw)pw.type=show?'text':'password';if(tp){tp.textContent=show?'🙈':'👁️';tp.setAttribute('aria-label',show?'Sembunyikan password':'Tampilkan password')}});
$('#switchAuth')?.addEventListener('click',()=>authPanel(isSignup?'login':'signup'));
$('#forgotBtn')?.addEventListener('click',()=>forgotPassword());
$('#authForm')?.addEventListener('submit',async e=>{
e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const m=$('#authMsg');m.textContent='Memproses...';
if(isSignup){
if(!f.identifier.includes('@')){m.textContent='Untuk pendaftaran saat ini gunakan alamat email. Login nomor telepon memerlukan layanan SMS Supabase.';return}
const birth=f.birth_year+'-'+String(f.birth_month).padStart(2,'0')+'-'+String(f.birth_day).padStart(2,'0');
const r=await sb.auth.signUp({email:f.identifier,password:f.password,options:{emailRedirectTo:window.location.origin+'/',data:{first_name:f.first_name,last_name:f.last_name,birth_date:birth,gender:f.gender}}});
if(r.error){m.textContent=r.error.message;return}
m.textContent=r.data.session?'Akun aktif.':'Pendaftaran berhasil. Cek email Anda untuk konfirmasi akun sebelum login.';
}else{
if(f.identifier.includes('@')){
const r=await sb.auth.signInWithPassword({email:f.identifier,password:f.password});if(r.error){m.textContent=r.error.message;return}
session=r.data.session;renderAuth();closeModal();loadPortal();
}else{m.textContent='Login nomor telepon memerlukan SMS Auth yang harus diaktifkan di Supabase. Untuk sekarang gunakan email.'}
}});
}
async function forgotPassword(){
openModal('Lupa Kata Sandi','<form class="authForm" id="resetForm"><input id="resetEmail" type="email" required placeholder="Email akun Anda"><button class="cta" type="submit">Kirim Tautan Reset</button><p class="authNote" id="resetMsg">Kami akan mengirim tautan untuk membuat kata sandi baru.</p></form>');
$('#resetForm')?.addEventListener('submit',async e=>{e.preventDefault();const email=$('#resetEmail').value.trim(),m=$('#resetMsg');m.textContent='Mengirim...';const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/#reset-password'});m.textContent=r.error?r.error.message:'Tautan reset sudah dikirim. Periksa email Anda.'});
}

function initLiveProblemMap(rows=[]){
 const el=$('.mapbox'); if(!el||!window.L)return;
 el.innerHTML='<div class="mapTools"><button class="mapLayer active" data-layer="street">Peta</button><button class="mapLayer" data-layer="satellite">Satelit</button><span class="mapLive">● LIVE</span></div><div class="mapLegend"><b>Peta Masalah & Kejadian</b><span>🔴 Resmi</span><span>🟠 Berita</span><span>🔵 Laporan</span></div>';
 const map=L.map(el,{scrollWheelZoom:false}).setView([-2.5,118],4.6);
 const street=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors'}).addTo(map);
 const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles © Esri'});
 const layer=L.layerGroup().addTo(map);
 const color=r=>r.source_type==='official_disaster'||r.source_type==='official_seismic'?'red':r.source_type==='news_signal'?'orange':'blue';
 rows.filter(r=>Number.isFinite(Number(r.latitude))&&Number.isFinite(Number(r.longitude))).forEach(r=>{
   const cls=color(r);
   const icon=L.divIcon({className:'live-marker-wrap',html:'<span class="live-marker '+cls+'"></span>',iconSize:[18,18],iconAnchor:[9,9]});
   const precision=r.metadata?.location_precision==='exact'?'Koordinat sumber':'Perkiraan pusat wilayah';
   const popup='<div class="incidentPopup"><b>'+esc(r.title)+'</b><br><span>'+esc(r.incident_type||'Peristiwa')+' · '+esc(r.status||'unverified')+'</span><hr><b>Lokasi</b><br>'+esc(r.location_text||'Tidak tersedia')+'<br><b>Koordinat</b><br>'+Number(r.latitude).toFixed(5)+', '+Number(r.longitude).toFixed(5)+'<br><small>'+esc(precision)+' · Sumber: '+esc(r.source_name)+'</small>'+(r.source_url?'<br><a href="'+esc(r.source_url)+'" target="_blank" rel="noopener">Buka sumber →</a>':'')+'</div>';
   L.marker([Number(r.latitude),Number(r.longitude)],{icon}).addTo(layer).bindPopup(popup);
 });
 $('.mapLayer').forEach(b=>b.addEventListener('click',()=>{$('.mapLayer').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.layer==='satellite'){map.removeLayer(street);satellite.addTo(map)}else{map.removeLayer(satellite);street.addTo(map)}}));
 setTimeout(()=>map.invalidateSize(),300); window.problemMap=map;
}

async function loadPortal(){try{await getSession();renderAuth();const r=await fetch('/api/portal-data?tables=regions,problems,early_signals,forecasts,solutions,citizen_reports,data_sources&limit=30',{cache:'no-store',headers:authHeaders()});if(!r.ok)throw Error();portal=await r.json();portal.live_incidents=[];try{const lr=await fetch('/api/bmkg?mode=incidents',{cache:'no-store'});const lj=lr.ok?await lr.json():{};portal.live_incidents.push(...(lj.incidents||[]))}catch{}try{const br=await fetch('https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=json&resultRecordCount=100&orderByFields=objectid%20DESC',{cache:'no-store'});const bj=br.ok?await br.json():{};(bj.features||[]).forEach(f=>{const a=f.attributes||{},g=f.geometry||{};const lat=Number(g.y),lng=Number(g.x);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;const title=a.kejadian||a.jenis_bencana||a.jenis||a.nama_bencana||'Kejadian bencana';portal.live_incidents.push({source_name:'BNPB',source_type:'official_disaster',source_url:'https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/0',title:String(title),description:String(a.kronologi||a.deskripsi||a.keterangan||a.lokasi||''),incident_type:String(title),status:'official_signal',observed_at:new Date().toISOString(),latitude:lat,longitude:lng,location_text:String(a.lokasi||''),severity:'unknown',confidence_score:.95,location_precision:'exact'})})}catch{}hydrate(portal);return portal}catch(e){console.warn(e);return null}}
function photoProxy(url){return '/api/image?src='+encodeURIComponent(url)}
const photoRoad=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Ubud-Jalan_Raya-Pothole-2009.jpeg');
const photoFlood=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg');
const photoSchool=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/The_atmosphere_of_a_junior_high_school_classroom_in_Indonesia.jpg');
const photoHospital=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Indonesia_stadium_hospital_(10705267115).jpg');
const photoMeeting=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/The_first_Ministerial_Meeting_in_Garuda_palace.jpg');
const photoStudents=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Group_of_students_at_school.jpg');
const photoIKN='/assets/IKN%202026.png';
const fallbackPublicReports=[
{id:'jalan-purworejo',title:'Jalan Provinsi di Purworejo Rusak Parah, Warga Resah',category:'Infrastruktur',status:'Mendesak',region_name:'Purworejo, Jawa Tengah',reported_at:'2 jam yang lalu',description:'Laporan contoh untuk tampilan publik. Data contoh ini bukan laporan warga terverifikasi.',media_urls:[photoRoad],source:'Foto dokumentasi jalan · Wikimedia Commons',is_demo:true},
{id:'banjir-demak',title:'Banjir di Demak Rendam 5 Desa, Ratusan Warga Mengungsi',category:'Bencana Alam',status:'Terkini',region_name:'Demak, Jawa Tengah',reported_at:'4 jam yang lalu',description:'Laporan contoh untuk tampilan publik. Data contoh ini bukan laporan warga terverifikasi.',media_urls:[photoFlood],source:'Foto dokumentasi banjir · Wikimedia Commons',is_demo:true},
{id:'sekolah-wonogiri',title:'Ruang Kelas SD di Wonogiri Masih Kurang, Siswa Belajar Shift',category:'Pendidikan',status:'Belum Selesai',region_name:'Wonogiri, Jawa Tengah',reported_at:'6 jam yang lalu',description:'Laporan contoh untuk tampilan publik. Data contoh ini bukan laporan warga terverifikasi.',media_urls:[photoSchool],source:'Foto dokumentasi pendidikan · Wikimedia Commons',is_demo:true},
{id:'puskesmas-lampung',title:'Puskesmas di Lampung Kekurangan Tenaga Medis',category:'Kesehatan',status:'Terkini',region_name:'Lampung Selatan, Lampung',reported_at:'8 jam yang lalu',description:'Laporan contoh untuk tampilan publik. Data contoh ini bukan laporan warga terverifikasi.',media_urls:[photoHospital],source:'Foto dokumentasi kesehatan · Wikimedia Commons',is_demo:true}
];
const issueFallbackImage={
  'Infrastruktur':photoRoad,
  'Bencana Alam':photoFlood,
  'Lingkungan':photoFlood,
  'Pendidikan':photoSchool,
  'Kesehatan':photoHospital,
  'Ekonomi':photoMeeting,
  'Sosial':photoStudents,
  'Sosial & Budaya':photoStudents
};
window.publicIssueIndex=Object.fromEntries(fallbackPublicReports.map(x=>[x.id,x]));
function publicIssueImages(x){
 const raw=x.media_urls??x.metadata?.media_urls??x.metadata?.image_urls??x.metadata?.images??x.metadata?.image_url??x.cover_image_url??x.image_url??x.photo_url??x.image??x.thumbnail_url??'';
 let arr=[];
 if(Array.isArray(raw))arr=raw.map(v=>typeof v==='string'?v:(v?.url||v?.publicUrl||v?.href||'')).filter(Boolean);
 else if(typeof raw==='string')arr=raw.split(/[,\n]/).map(v=>v.trim()).filter(Boolean);
 else if(raw&&typeof raw==='object' && (raw.url||raw.publicUrl||raw.href))arr=[raw.url||raw.publicUrl||raw.href];
 arr=[...new Set(arr.map(String))].slice(0,10);
 return arr.map(u=>/^(https?:\/\/)(commons\.wikimedia\.org|upload\.wikimedia\.org)/i.test(u)?photoProxy(u):u);
}
function publicIssueImage(x){
 const urls=publicIssueImages(x);
 return {url:urls[0]||'',urls,fallback:issueFallbackImage[String(x.category||'')]||'/assets/hero-reference.svg'};
}
function publicIssueRegion(x){
 return x.region_name||x.location_text||x.region||x.region?.name||x.metadata?.region_name||'Wilayah belum diisi';
}
function publicIssueTime(x){
 return x.updated_at||x.reported_at||x.created_at||'';
}
function openPublicIssue(x){
 const el=document.getElementById('reportDetail');const list=document.getElementById('masalah');if(!el||!list)return;
 const im=publicIssueImage(x);const urls=im.urls.length?im.urls:[im.fallback];const isReal=im.urls.length>0&&!x.is_demo;
 const gallery='<div class="reportGallery">'+urls.map((u,i)=>'<button type="button" class="reportGalleryItem" data-src="'+esc(u)+'" data-fallback="'+esc(im.fallback)+'"><img src="'+esc(u)+'" alt="Foto laporan '+esc(x.title||'')+' '+(i+1)+'" referrerpolicy="no-referrer"></button>').join('')+'</div>';
 el.innerHTML='<div class="head"><div><h2>Detail Laporan</h2><p class="muted">Foto, wilayah, isi laporan, dan status ditampilkan jelas.</p></div><button class="outline" id="backReports">← Kembali ke daftar</button></div><div class="reportDetailGrid"><div>'+gallery+'<img id="reportDetailMainImage" class="reportDetailImage" src="'+esc(urls[0])+'" alt="Foto utama '+esc(x.title||'laporan')+'" referrerpolicy="no-referrer" data-fallback="'+esc(im.fallback)+'" onerror="this.onerror=null;this.src=this.dataset.fallback"></div><div class="reportDetailBody"><div class="badges"><span class="badge blue">'+esc(x.category||'Umum')+'</span><span class="badge">'+esc(x.status||x.verification_status||'Terbit')+'</span></div><h1>'+esc(x.title||'Tanpa judul')+'</h1><p class="reportMeta">⌖ '+esc(publicIssueRegion(x))+' · '+esc(publicIssueTime(x))+'</p><h3>Isi Laporan</h3><p>'+esc(x.description||x.narrative||'Belum ada uraian laporan.')+'</p><div class="reportInfo"><b>Daerah</b><span>'+esc(publicIssueRegion(x))+'</span><b>Kategori</b><span>'+esc(x.category||'Umum')+'</span><b>Status</b><span>'+esc(x.status||x.verification_status||'Terbit')+'</span><b>Media</b><span>'+esc(isReal?(x.source||('Foto laporan · '+urls.length+' foto')):'Foto ilustrasi kategori — laporan belum menyediakan foto yang dapat ditampilkan.')+'</span></div></div></div>';
 el.style.display='block';list.style.display='none';history.replaceState(null,'','#laporan/'+encodeURIComponent(x.id||'item'));el.scrollIntoView({behavior:'smooth',block:'start'});
 document.querySelectorAll('.reportGalleryItem').forEach(btn=>{const pic=btn.querySelector('img');pic?.addEventListener('error',()=>{pic.src=btn.dataset.fallback||im.fallback},{once:true});btn.addEventListener('click',()=>{const main=document.getElementById('reportDetailMainImage');if(main){main.src=btn.dataset.src;main.dataset.fallback=btn.dataset.fallback||im.fallback}})});
 document.getElementById('backReports')?.addEventListener('click',()=>{el.style.display='none';list.style.display='block';history.replaceState(null,'','#masalah');list.scrollIntoView({behavior:'smooth',block:'start'})});
}
function renderPublicIssueCards(rows){
 const issueGrid=document.querySelector('.issueGrid');if(!issueGrid)return;
 window.publicIssueIndex=Object.fromEntries(rows.map((x,i)=>[String(x.id||('issue-'+i)),x]));
 issueGrid.innerHTML=rows.map((x,i)=>{
   const id=String(x.id||('issue-'+i));const im=publicIssueImage(x);const src=im.url||im.fallback;const photoLabel=(im.urls.length&&!x.is_demo)?'Foto laporan':'Foto kategori';
   return '<article class="issue" tabindex="0" role="button" data-issue-id="'+esc(id)+'"><img src="'+esc(src)+'" alt="'+esc(photoLabel+' '+(x.title||''))+'" loading="eager" decoding="async" referrerpolicy="no-referrer" data-fallback="'+esc(im.fallback)+'" onerror="this.onerror=null;this.src=this.dataset.fallback"><div class="issueBody"><div class="badges"><span class="badge blue">'+esc(x.category||'Umum')+'</span><span class="badge">'+esc(x.status||x.verification_status||'Terbit')+'</span></div><h3>'+esc(x.title||'Tanpa judul')+'</h3><p>⌖ '+esc(publicIssueRegion(x))+' · '+esc(publicIssueTime(x))+'</p></div></article>';
 }).join('');
}
async function search(q){openModal('Mencari…','<p>Mengambil hasil dari database publik.</p>');try{const r=await fetch('/api/search?q='+encodeURIComponent(q),{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error();const all=[...(d.results?.regions||[]).map(x=>['Wilayah',x.name,x.level]),...(d.results?.problems||[]).map(x=>['Masalah',x.title,x.category]),...(d.results?.verified_reports||[]).map(x=>['Suara Warga',x.title,x.category])];openModal('Hasil Pencarian','<p>Kata kunci: <b>'+esc(q)+'</b></p>'+(all.length?'<div>'+all.map(x=>'<div class="rankrow"><span>'+esc(x[0])+'</span><span>'+esc(x[1])+'</span><strong>'+esc(x[2]||'')+'</strong></div>').join('')+'</div>':'<p>Tidak ada hasil publik yang cocok.</p>'))}catch{openModal('Pencarian','<p>Pencarian database sedang tidak tersedia. Silakan coba lagi.</p>')}}
async function report(){
 await getSession();
 if(!session){
   openModal('Login Diperlukan','<p>Untuk menjaga agar setiap laporan dapat diawasi dan ditelusuri oleh admin, silakan masuk atau daftar terlebih dahulu.</p><button class="cta" id="goLogin">Masuk / Daftar →</button>');
   $('#goLogin')?.addEventListener('click',authPanel);return;
 }
 openModal('Laporkan Masalah','<p>Laporan publik masuk sebagai <b>unverified</b> dan tidak tampil sebagai fakta terverifikasi sebelum proses verifikasi.</p><form id="rf"><input name="title" required maxlength="240" placeholder="Judul masalah"><input name="region_name" placeholder="Nama wilayah (opsional)"><select name="category"><option>Infrastruktur</option><option>Pendidikan</option><option>Kesehatan</option><option>Lingkungan</option><option>Ekonomi</option><option>Sosial</option></select><select name="severity"><option value="low">Rendah</option><option value="medium" selected>Sedang</option><option value="high">Tinggi</option><option value="critical">Kritis</option></select><textarea name="narrative" required maxlength="10000" placeholder="Jelaskan kejadian, lokasi, waktu, dan dampaknya."></textarea><label class="uploadField"><b>Foto / Bukti Visual</b><input name="media_files" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>Maksimal 6 foto, hingga 10 MB per foto.</small></label><button class="cta" type="submit">Kirim Laporan →</button></form>');
 $('#rf').onsubmit=async e=>{
   e.preventDefault();
   const form=e.target;const f=Object.fromEntries(new FormData(form).entries());const fileInput=form.querySelector('input[name="media_files"]');const files=[...(fileInput?.files||[])].slice(0,6);const btn=form.querySelector('button');btn.disabled=true;btn.textContent='Mengunggah...';
   try{
     const media_urls=[];
     for(const file of files){
       if(file.size>10*1024*1024)throw Error('Ukuran foto melebihi 10 MB: '+file.name);
       if(!/^image\/(jpeg|png|webp)$/.test(file.type))throw Error('Format foto tidak didukung: '+file.name);
       const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=session.user.id+'/'+Date.now()+'-'+crypto.randomUUID()+'.'+ext;
       const up=await sb.storage.from('citizen-report-media').upload(path,file,{cacheControl:'3600',contentType:file.type,upsert:false});
       if(up.error)throw up.error;
       const pub=sb.storage.from('citizen-report-media').getPublicUrl(path);if(pub.data?.publicUrl)media_urls.push(pub.data.publicUrl);
     }
     f.media_urls=media_urls;delete f.media_files;btn.textContent='Menyimpan...';
     const r=await fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(f)}),j=await r.json();
     if(!r.ok)throw Error(j.error||'Laporan gagal disimpan');
     await loadPortal();
     openModal('Laporan Diterima','<p>Laporan tersimpan di Supabase dan menunggu verifikasi.</p><p>'+esc(media_urls.length)+' foto berhasil disimpan sebagai media laporan.</p><p>ID: <b>'+esc(j.report_id||'diterima')+'</b></p>');
   }catch(err){openModal('Laporan Gagal','<p>'+esc(err?.message||'Laporan belum tersimpan. Periksa koneksi dan coba kembali.')+'</p>');}
   finally{btn.disabled=false;btn.textContent='Kirim Laporan →'}
 };
}
const content={map:['Peta Indonesia','<p>Peta publik menggunakan geografi nasional dari database dan dapat diperluas dengan filter wilayah, kategori, periode, dan sumber.</p><div class="mapbox"></div>'],data:['Data & Statistik','<p>Modul ini membaca dataset, indikator, periode, kualitas, dan sumber dari portal data.</p><div class="rankrow"><span>Dataset terdaftar</span><strong>'+fmt(portal?.tables?.data_sources?.length)+'</strong></div>'],monitor:['Pantau Perubahan','<p>Modul membaca early signals yang telah dipublikasikan. Sinyal tanpa data tidak dibuat-buat.</p><div class="rankrow"><span>Sinyal tersedia</span><strong>'+fmt(portal?.tables?.early_signals?.length)+'</strong></div>'],insights:['Wawasan & Intelligence','<p>Analisis berbasis claims, evidence, observations, dan sumber. Hasil hanya ditampilkan bila tersedia di sistem.</p>'],forecast:['Kemungkinan / Future Radar','<p>Forecast publik ditampilkan dengan horizon, model, confidence, faktor, dan ketidakpastian ketika data tersedia.</p><div class="rankrow"><span>Forecast tersedia</span><strong>'+fmt(portal?.tables?.forecasts?.length)+'</strong></div>'],solutions:['Solusi','<p>Solusi publik berasal dari tabel solusi dan dapat memuat tipe, dampak, risiko, kelayakan, asumsi, serta outcome.</p><div class="rankrow"><span>Solusi tersedia</span><strong>'+fmt(portal?.tables?.solutions?.length)+'</strong></div>'],about:['Tentang Nuansa Kita','<p>NUANSA KITA — ASPIRASI PUBLIK INDONESIA adalah portal untuk melihat masalah, mendengar suara warga, memahami data, memantau perubahan, mengantisipasi kemungkinan, dan mencari solusi secara transparan.</p>']};
function show(k){const v=content[k]||content.about;openModal(v[0],v[1])}
const actions={map:()=>show('map'),data:()=>show('data'),report,monitor:()=>show('monitor'),insights:()=>show('insights'),forecast:()=>show('forecast'),solutions:()=>show('solutions'),about:()=>show('about')};
$$('[data-act]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();actions[el.dataset.act]?.()}));
function navList(title, rows, emptyText){
 const body=rows.length?'<div class="navResultList">'+rows.map(r=>'<div class="rankrow"><span>●</span><span><b>'+esc(r.title||r.name||'Item')+'</b><br><small>'+esc(r.meta||r.category||r.level||'')+'</small></span></div>').join('')+'</div>':'<div class="navEmpty"><b>'+esc(emptyText||'Belum ada data publik.')+'</b><p>Data akan muncul otomatis setelah tersedia dan lolos aturan publikasi/verifikasi.</p></div>';
 openModal(title,body);
}
function handleSubmenu(t){
 const tables=portal?.tables||{}, problems=tables.problems||[], reports=tables.citizen_reports||[], signals=tables.early_signals||[], forecasts=tables.forecasts||[], solutions=tables.solutions||[], sources=tables.data_sources||[];
 if(t==='Ringkasan Indonesia'||t==='Provinsi'||t==='Kabupaten/Kota'||t==='Kecamatan'||t==='Desa/Kelurahan'||t==='Dusun') {document.querySelector('#jelajah')?.scrollIntoView({behavior:'smooth'});return}
 if(t==='Terkini') return navList('Masalah Terkini',[...problems,...reports].sort((a,b)=>new Date(b.updated_at||b.reported_at||0)-new Date(a.updated_at||a.reported_at||0)).slice(0,10).map(x=>({title:x.title,meta:x.category||x.verification_status})), 'Belum ada masalah terbit/terverifikasi.');
 if(t==='Berdasarkan Wilayah') return navList('Masalah Berdasarkan Wilayah',problems.slice(0,10).map(x=>({title:x.region_name||x.location_text||'Wilayah belum diisi',meta:x.title})), 'Belum ada masalah dengan wilayah publik.');
 if(t==='Berdasarkan Kategori'){const c={};problems.forEach(x=>{const k=x.category||'Lainnya';c[k]=(c[k]||0)+1});return navList('Masalah Berdasarkan Kategori',Object.entries(c).sort((a,b)=>b[1]-a[1]).map(x=>({title:x[0],meta:x[1]+' masalah'})),'Belum ada kategori masalah.')}
 if(t==='Mendesak') return navList('Masalah Mendesak',problems.filter(x=>['critical','high','urgent','mendesak'].includes(String(x.severity||x.status||'').toLowerCase())).slice(0,10).map(x=>({title:x.title,meta:x.category||x.severity})), 'Belum ada masalah mendesak yang dipublikasikan.');
 if(t==='Belum Terselesaikan') return navList('Masalah Belum Terselesaikan',problems.filter(x=>!['resolved','closed','completed'].includes(String(x.status||'').toLowerCase())).slice(0,10).map(x=>({title:x.title,meta:x.status||'Terbuka'})), 'Belum ada masalah terbuka yang dipublikasikan.');
 if(t==='Sumber Data'||t==='Kumpulan Data') return navList(t,sources.slice(0,15).map(x=>({title:x.name||x.title,meta:x.organization||x.source_type||x.url})), 'Belum ada sumber data terdaftar.');
 if(t==='Indikator'||t==='Kualitas & Pembaruan Data') return show('data');
 if(['Laporkan Masalah'].includes(t)) return report();
 if(['Cerita Warga','Keluhan','Usulan','Polling','Diskusi'].includes(t)) return navList(t,reports.slice(0,10).map(x=>({title:x.title,meta:x.category||x.reported_at})),'Belum ada konten publik pada bagian ini.');
 if(['Masalah Baru','Meningkat','Menurun','Ramai Dibicarakan','Peringatan'].includes(t)) return navList(t,signals.slice(0,10).map(x=>({title:x.title||x.description,meta:x.change_percent!=null?x.change_percent+'%':'Sinyal'})),'Belum ada sinyal perubahan yang dipublikasikan.');
 if(['Pola','Penyebab','Tren','Hubungan','Ringkasan Wilayah'].includes(t)) return show('insights');
 if(['Perkiraan','Perbandingan','Skenario'].includes(t)) return navList(t,forecasts.slice(0,10).map(x=>({title:x.title||x.name,meta:x.horizon||x.confidence||'Forecast'})),'Belum ada forecast yang dipublikasikan.');
 if(['Solusi Warga','Solusi Pemerintah','Praktik Baik','Evaluasi Hasil'].includes(t)) return navList(t,solutions.slice(0,10).map(x=>({title:x.title||x.name,meta:x.type||x.status||'Solusi'})),'Belum ada solusi yang dipublikasikan.');
 if(t==='Pusat Fitur'){document.querySelector('#fitur')?.scrollIntoView({behavior:'smooth',block:'start'});return} if(t==='Sumber & Media'){document.querySelector('#sumber-media')?.scrollIntoView({behavior:'smooth',block:'start'});return} if(t==='Tentang Nuansa Kita') return show('about');
 if(t==='Bantuan') return openModal('Bantuan','<p>Gunakan menu panah untuk membuka submenu. Klik item submenu untuk membuka data atau fitur terkait.</p>');
 if(t==='Kontak') return openModal('Kontak','<p>Gunakan kanal kontak yang tersedia di footer untuk kebutuhan informasi dan pengelolaan portal.</p>');
 if(t==='Kebijakan & Privasi') return openModal('Kebijakan & Privasi','<p>Data publik ditampilkan sesuai status publikasi dan aturan akses. Data pribadi akun tidak ditampilkan sebagai data publik.</p>');
}

document.addEventListener('click',e=>{
 const card=e.target.closest('.issue[data-issue-id]');
 if(!card)return;
 e.preventDefault();e.stopImmediatePropagation();
 const x=window.publicIssueIndex?.[card.dataset.issueId];
 if(x)openPublicIssue(x);
},true);
document.addEventListener('keydown',e=>{
 if((e.key==='Enter'||e.key===' ')&&e.target.closest('.issue[data-issue-id]')){
   e.preventDefault();
   const card=e.target.closest('.issue[data-issue-id]');const x=window.publicIssueIndex?.[card.dataset.issueId];if(x)openPublicIssue(x);
 }
});
window.addEventListener('hashchange',()=>{
 const m=location.hash.match(/^#laporan\/(.+)$/);if(m){const id=decodeURIComponent(m[1]);const x=window.publicIssueIndex?.[id];if(x)openPublicIssue(x);}
});
document.addEventListener('click',e=>{
 const btn=e.target.closest('.nav .group>button');
 if(btn){e.preventDefault();e.stopPropagation();const group=btn.closest('.group');document.querySelectorAll('.nav .group.open').forEach(g=>{if(g!==group)g.classList.remove('open')});group.classList.toggle('open');return false}
 const sub=e.target.closest('.nav .group .sub a');
 if(sub){e.preventDefault();e.stopPropagation();handleSubmenu(sub.textContent.trim());return false}
},true);
document.querySelectorAll('.nav .group').forEach(g=>g.classList.remove('open'));
$$('.cat').forEach(b=>b.addEventListener('click',()=>show('data')));
$('#searchForm')?.addEventListener('submit',e=>{e.preventDefault();const q=$('#q').value.trim();if(q)search(q)});
$$('.map-switch button').forEach(b=>b.addEventListener('click',()=>{$$('.map-switch button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const box=$('.mapbox');if(box)box.style.filter=b.textContent.trim()==='Satelit'?'saturate(.65) brightness(.9)':'none'}));
if(sb){sb.auth.onAuthStateChange((_event,s)=>{session=s||null;renderAuth();});}
loadPortal();
if(!window.__nuansaPortalRefresh){window.__nuansaPortalRefresh=setInterval(()=>loadPortal(),60000)}
setTimeout(()=>{const m=location.hash.match(/^#laporan\/(.+)$/);if(m){const x=window.publicIssueIndex?.[decodeURIComponent(m[1])];if(x)openPublicIssue(x)}},900);
})();