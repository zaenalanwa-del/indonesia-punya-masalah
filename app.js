(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],modal=$('#modal'),mb=$('#mb');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('id-ID');
function applyPublicTheme(theme={}){
  try{
    if(theme.primary)document.documentElement.style.setProperty('--nk-primary',theme.primary);
    if(theme.background)document.documentElement.style.setProperty('--nk-background',theme.background);
    if(theme.ink)document.documentElement.style.setProperty('--nk-ink',theme.ink);
    if(theme.radius!=null)document.documentElement.style.setProperty('--nk-radius',Math.max(0,Number(theme.radius))+'px');
    if(theme.heroOverlay!=null)document.documentElement.style.setProperty('--nk-hero-overlay',Math.max(0,Math.min(90,Number(theme.heroOverlay)))/100);
    document.body.dataset.nkDensity=theme.density||'comfortable';
    const s=document.getElementById('nk-live-theme')||document.createElement('style');s.id='nk-live-theme';
    s.textContent=':root{--nk-primary:'+esc(theme.primary||'#0875d8')+';--nk-background:'+esc(theme.background||'#eef4f8')+';--nk-ink:'+esc(theme.ink||'#123b60')+';--nk-radius:'+Math.max(0,Number(theme.radius??14))+'px;--nk-hero-overlay:'+Math.max(0,Math.min(90,Number(theme.heroOverlay??50)))/100+'}body{background:var(--nk-background)!important;color:var(--nk-ink)}button.cta,.nav>a.active,.nav .group.open>button{background:var(--nk-primary)!important;border-color:var(--nk-primary)!important}.card,.section,.publicPage,.adSection,.issue,.featureCard,.serviceCard{border-radius:var(--nk-radius)!important}.heroGarudaOverlay{background:linear-gradient(90deg,rgba(5,25,55,var(--nk-hero-overlay)),rgba(5,25,55,calc(var(--nk-hero-overlay)*.65)),rgba(5,25,55,calc(var(--nk-hero-overlay)*.25)))!important}';
    if(!s.parentNode)document.head.appendChild(s);
  }catch(e){console.warn('[theme]',e)}
}
window.addEventListener('message',e=>{if(e.data?.type==='NUANSA_THEME_PREVIEW')applyPublicTheme(e.data.theme||{})});
function themeForToday(base,schedule){const now=new Date();const iso=now.toISOString().slice(0,10);const month=String(now.getMonth()+1);let active={...(base||{})};const monthly=schedule?.monthly||{};if(monthly[month])active={...active,...monthly[month]};for(const x of (schedule?.dates||[])){if(x?.start&&x?.end&&iso>=x.start&&iso<=x.end&&x.theme)active={...active,...x.theme}}return active}
async function loadSavedPublicTheme(){
  try{const [a,b]=await Promise.all([sb.from('cms_settings').select('value').eq('key','public_theme').maybeSingle(),sb.from('cms_settings').select('value').eq('key','public_theme_schedule').maybeSingle()]);const base=a.data?.value||{};const schedule=b.data?.value||{};applyPublicTheme(themeForToday(base,schedule))}catch(e){}
}

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
let sb=null; function initSupabase(){try{if(!sb&&window.supabase?.createClient)sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}})}catch(e){console.warn('Supabase init failed',e)} return sb;} initSupabase();
let session=null;
async function getSession(){initSupabase();if(!sb)return null;const r=await sb.auth.getSession();session=r.data.session||null;return session}
function authHeaders(){return session?.access_token?{Authorization:'Bearer '+session.access_token}:{} }
function isKnownAdmin(){return String(session?.user?.email||'').trim().toLowerCase()==='zaenalanwa@gmail.com'}
function isKnownAdminRoute(){return isKnownAdmin() && location.pathname!=='/admin.html' && !location.search.includes('admin_preview')}
async function forceAdminRedirect(){try{if(location.pathname==='/admin.html'||location.search.includes('admin_preview'))return false;initSupabase();if(!sb)return false;const r=await sb.auth.getSession();const s=r.data?.session||null;if(s?.user?.email&&String(s.user.email).trim().toLowerCase()==='zaenalanwa@gmail.com'){session=s;window.location.href='/admin.html';return true}}catch(e){console.warn('[admin-redirect]',e)}return false}
function renderAuth(){if(isKnownAdmin()&&!location.search.includes('admin_preview')&&location.pathname!=='/admin.html'){location.replace('/admin.html');return}const a=$('#authArea');if(!a)return;const label=session?.user?.email||'Pengunjung';const admin=isKnownAdmin();const sub=admin?'SUPER ADMIN · Buka Dashboard':(session?'Akun aktif · Laporan Saya':'Masuk / Daftar');a.innerHTML='<span class="bell">♧<b>3</b></span><button class="authBtn'+(admin?' adminAuthBtn':'')+'" id="authBtn" type="button"><span class="avatar">👤</span><span><strong>'+esc(label)+'</strong><small>'+esc(sub)+'</small></span></button>';$('#authBtn')?.addEventListener('click',()=>{if(admin){location.replace('/admin.html');return}authPanel()})}
function authPanel(mode='login'){ initSupabase();
if(session){
openModal('Akun Saya','<p><b>'+esc(session.user.email||'')+'</b></p><p class="authNote">Akses data pribadi dibatasi ke akun ini. Admin/moderator memproses laporan sesuai kewenangan.</p><div class="authLinks"><button class="outline" id="myReportsBtn">Laporan Saya</button><button class="outline" id="logoutBtn">Keluar</button></div>');
$('#logoutBtn')?.addEventListener('click',async()=>{await sb.auth.signOut();session=null;renderAuth();closeModal();loadPortal()});
$('#myReportsBtn')?.addEventListener('click',()=>{const rows=portal?.tables?.my_citizen_reports||[];openModal('Laporan Saya',rows.length?rows.map(x=>'<div class="rankrow"><span>●</span><span><b>'+esc(x.title||'Tanpa judul')+'</b><br><small>'+esc(x.category||'')+' · '+esc(x.verification_status||'unverified')+'</small></span><strong>'+esc(x.reported_at||'')+'</strong></div>').join(''):'<p>Belum ada laporan dari akun ini.</p>')});
adFetch('admin_dashboard').then(d=>{if(d?.is_admin){const h=document.querySelector('.authLinks');if(h&&!document.getElementById('openSuperAdmin')){h.insertAdjacentHTML('afterbegin','<button class="cta" id="openSuperAdmin">Super Admin Control Center</button>');$('#openSuperAdmin')?.addEventListener('click',()=>{closeModal();superAdminDashboard(d)})}syncAdminNav(true)}}).catch(()=>syncAdminNav(false));
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
const r=await sb.auth.signUp({email:f.identifier,password:f.password,options:{emailRedirectTo:'https://indonesia-punya-masalah.vercel.app/',data:{first_name:f.first_name,last_name:f.last_name,birth_date:birth,gender:f.gender}}});
if(r.error){m.textContent=r.error.message;return}
m.textContent=r.data.session?'Akun aktif.':'Pendaftaran berhasil. Cek email Anda untuk konfirmasi akun sebelum login.';
}else{
if(f.identifier.includes('@')){
const r=await sb.auth.signInWithPassword({email:f.identifier,password:f.password});if(r.error){m.textContent=r.error.message;return}
session=r.data.session;
if(isKnownAdmin()){location.replace('/admin.html');return}
if(session?.access_token&&session?.refresh_token){try{await sb.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token})}catch(e){console.warn('[auth-set-session]',e)}}
try{const u=await sb.auth.getUser(session?.access_token);if(u?.data?.user)session={...session,user:u.data.user}}catch(e){console.warn('[auth-user]',e)}
renderAuth();closeModal();loadPortal();
}else{m.textContent='Login nomor telepon memerlukan SMS Auth yang harus diaktifkan di Supabase. Untuk sekarang gunakan email.'}
}});
}
async function forgotPassword(){
openModal('Lupa Kata Sandi','<form class="authForm" id="resetForm"><input id="resetEmail" type="email" required placeholder="Email akun Anda"><button class="cta" type="submit">Kirim Tautan Reset</button><p class="authNote" id="resetMsg">Kami akan mengirim tautan untuk membuat kata sandi baru.</p></form>');
$('#resetForm')?.addEventListener('submit',async e=>{e.preventDefault();const email=$('#resetEmail').value.trim(),m=$('#resetMsg');m.textContent='Mengirim...';const r=await sb.auth.resetPasswordForEmail(email,{redirectTo:'https://indonesia-punya-masalah.vercel.app/#reset-password'});m.textContent=r.error?r.error.message:'Tautan reset sudah dikirim. Periksa email Anda.'});
}

function initLiveProblemMap(rows=[],targetEl=null){
 const el=targetEl||$('.mapbox'); if(!el||!window.L)return;
 if(el.__problemMap){try{el.__problemMap.remove()}catch{}}
 el.innerHTML='<div class="mapTools"><button class="mapLayer active" data-layer="street">Peta</button><button class="mapLayer" data-layer="satellite">Satelit</button><span class="mapLive">● LIVE</span></div><div class="mapLegend"><b>Peta Masalah & Kejadian</b><span>🔴 Resmi</span><span>🟠 Berita</span><span>🔵 Laporan</span></div>';
 const map=L.map(el,{scrollWheelZoom:false}).setView([-2.5,118],4.6);
 el.__problemMap=map;
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
 $$('.mapLayer').forEach(b=>b.addEventListener('click',()=>{$$('.mapLayer').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.layer==='satellite'){map.removeLayer(street);satellite.addTo(map)}else{map.removeLayer(satellite);street.addTo(map)}}));
 setTimeout(()=>map.invalidateSize(),300); window.problemMap=map;
}

async function loadPortal(){try{await Promise.race([getSession(),new Promise(r=>setTimeout(r,2500))]);if(isKnownAdminRoute()){location.replace('/admin.html');return}renderAuth();syncAdminNav(false);const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),6000);const r=await fetch('/api/portal-data?tables=regions,problems,early_signals,forecasts,solutions,citizen_reports,data_sources&limit=30',{cache:'no-store',headers:authHeaders(),signal:ctl.signal});clearTimeout(timer);if(!r.ok)throw Error('Portal data HTTP '+r.status);portal=await r.json();portal.live_incidents=[];const mapRows=[...(portal?.tables?.problems||[]),...(portal?.tables?.citizen_reports||[])].filter(x=>Number.isFinite(Number(x.latitude))&&Number.isFinite(Number(x.longitude)));if(window.L){const mainMap=document.querySelector('#problemMap');if(mainMap)initLiveProblemMap(mapRows,mainMap)}setTimeout(()=>loadLiveIncidents(),150);return portal}catch(e){console.warn('[portal]',e);return portal||null}}
async function loadLiveIncidents(){try{if(!portal)return;const [lj,bj]=await Promise.all([fetch('/api/bmkg?mode=incidents',{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),fetch('https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&f=json&resultRecordCount=100&orderByFields=objectid%20DESC',{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))]);portal.live_incidents=[...(lj.incidents||[])];(bj.features||[]).forEach(f=>{const a=f.attributes||{},g=f.geometry||{};const lat=Number(g.y),lng=Number(g.x);if(!Number.isFinite(lat)||!Number.isFinite(lng))return;const title=a.kejadian||a.jenis_bencana||a.jenis||a.nama_bencana||'Kejadian bencana';portal.live_incidents.push({source_name:'BNPB',source_type:'official_disaster',source_url:'https://gis.bnpb.go.id/server/rest/services/Kejadian_Bencana_Mingguan/FeatureServer/0',title:String(title),description:String(a.kronologi||a.deskripsi||a.keterangan||a.lokasi||''),incident_type:String(title),status:'official_signal',observed_at:new Date().toISOString(),latitude:lat,longitude:lng,location_text:String(a.lokasi||''),severity:'unknown',confidence_score:.95,location_precision:'exact'})});const mainMap=document.querySelector('#problemMap');if(mainMap&&window.L){const mapRows=[...(portal?.tables?.problems||[]),...(portal?.tables?.citizen_reports||[]),...(portal?.live_incidents||[])].filter(x=>Number.isFinite(Number(x.latitude))&&Number.isFinite(Number(x.longitude)));initLiveProblemMap(mapRows,mainMap)}}catch(e){console.warn('[live]',e)}}
function photoProxy(url){return '/api/image?src='+encodeURIComponent(url)}
const photoRoad=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Ubud-Jalan_Raya-Pothole-2009.jpeg');
const photoFlood=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg');
const photoSchool=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/The_atmosphere_of_a_junior_high_school_classroom_in_Indonesia.jpg');
const photoHospital=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Indonesia_stadium_hospital_(10705267115).jpg');
const photoMeeting=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/The_first_Ministerial_Meeting_in_Garuda_palace.jpg');
const photoStudents=photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Group_of_students_at_school.jpg');
const photoIKN='/assets/IKN%202026.png';
const fallbackPublicReports=[
{id:'jalan-purworejo',title:'Jalan Provinsi di Purworejo Rusak Parah, Warga Resah',category:'Infrastruktur',status:'Mendesak',region_name:'Purworejo, Jawa Tengah',reported_at:'2 jam yang lalu',description:'Contoh tampilan laporan publik. Bukan laporan warga terverifikasi.',media_urls:[photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Jalan_Basuki_Rachmat_Ngawi-4.jpg')],source:'Foto jalan provinsi · Wikimedia Commons',is_demo:true},
{id:'banjir-demak',title:'Banjir di Demak Rendam 5 Desa, Ratusan Warga Mengungsi',category:'Bencana Alam',status:'Terkini',region_name:'Demak, Jawa Tengah',reported_at:'4 jam yang lalu',description:'Contoh tampilan laporan publik. Bukan laporan warga terverifikasi.',media_urls:[photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg')],source:'Foto banjir · Wikimedia Commons',is_demo:true},
{id:'sekolah-wonogiri',title:'Ruang Kelas SD di Wonogiri Masih Kurang, Siswa Belajar Shift',category:'Pendidikan',status:'Belum Selesai',region_name:'Wonogiri, Jawa Tengah',reported_at:'6 jam yang lalu',description:'Contoh tampilan laporan publik. Bukan laporan warga terverifikasi.',media_urls:[photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/School_in_Indonesia.jpg')],source:'Foto sekolah · Wikimedia Commons',is_demo:true},
{id:'puskesmas-lampung',title:'Puskesmas di Lampung Kekurangan Tenaga Medis',category:'Kesehatan',status:'Terkini',region_name:'Lampung Selatan, Lampung',reported_at:'8 jam yang lalu',description:'Contoh tampilan laporan publik. Bukan laporan warga terverifikasi.',media_urls:[photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Goeteng_Hospital.jpg')],source:'Foto fasilitas kesehatan · Wikimedia Commons',is_demo:true}
];
const issueFallbackImage={
  'Infrastruktur':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Jalan_Basuki_Rachmat_Ngawi-4.jpg'),
  'Bencana Alam':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg'),
  'Lingkungan':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Flood_affected_village_(a).jpg'),
  'Pendidikan':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/School_in_Indonesia.jpg'),
  'Kesehatan':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Goeteng_Hospital.jpg'),
  'Ekonomi':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Modern_office_workspace_featuring_a_computer.jpg'),
  'Sosial':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Village_Meeting_Hall_of_Pandansari.jpg'),
  'Sosial & Budaya':photoProxy('https://commons.wikimedia.org/wiki/Special:Redirect/file/Village_Meeting_Hall_of_Pandansari.jpg')
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
function show(k){
 const v=content[k]||content.about;
 openModal(v[0],v[1]);
 if(k==='map'&&window.L){
   const modalMap=mb?.querySelector('.mapbox');
   if(modalMap){
     const rows=[...(portal?.tables?.problems||[]),...(portal?.tables?.citizen_reports||[]),...(portal?.live_incidents||[])].filter(x=>Number.isFinite(Number(x.latitude))&&Number.isFinite(Number(x.longitude)));
     setTimeout(()=>initLiveProblemMap(rows,modalMap),50);
   }
 }
}

async function adFetch(action,options={}){
 const method=options.method||'GET';
 const qs=new URLSearchParams({action});
 if(options.params)Object.entries(options.params).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')qs.set(k,String(v))});
 const headers={...(method!=='GET'?{'Content-Type':'application/json'}:{}),...authHeaders()};
 const r=await fetch('/api/portal-data?'+qs.toString(),{method,headers,body:method==='GET'?undefined:JSON.stringify(options.body||{}),cache:'no-store'});
 const d=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(d.error||d.message||'Layanan iklan tidak tersedia');
 return d;
}
async function openAdminIfAllowed(redirect=true){
  try{
    if(!sb)return false;
    const s=session||(await sb.auth.getSession()).data.session;
    if(!s?.access_token)return false;
    session=s;
    let d=null;
    try{const u=await sb.auth.getUser(s.access_token);if(u.error)throw u.error;session={...s,user:u.data.user};}catch(e){console.warn('[admin-user]',e?.message||e)}
    try{const rr=await Promise.race([sb.rpc('ad_admin_dashboard'),new Promise((_,rej)=>setTimeout(()=>rej(new Error('admin check timeout')),5000))]);if(!rr.error&&rr.data?.is_admin===true)d=rr.data;else if(rr?.error)console.warn('[admin-rpc]',rr.error.message)}catch(e){console.warn('[admin-rpc]',e?.message||e)}
    if(!d?.is_admin){try{d=await Promise.race([adFetch('admin_dashboard'),new Promise((_,rej)=>setTimeout(()=>rej(new Error('admin API timeout')),5000))])}catch(e){console.warn('[admin-api]',e?.message||e)}}
    if(d?.is_admin===true){syncAdminNav(true);if(redirect&&!location.pathname.endsWith('/admin.html')){location.replace('/admin.html');}return true;}
  }catch(e){console.warn('[admin-access]',e?.message||e)}
  return false;
}

function visitorKey(){
 try{
   let k=localStorage.getItem('nuansa_ad_visitor_key');
   if(!k){k=crypto.randomUUID();localStorage.setItem('nuansa_ad_visitor_key',k)}
   return k;
 }catch{return 'session-'+Math.random().toString(36).slice(2)}
}
async function trackSiteVisit(){
 try{await adFetch('visit',{method:'POST',body:{visitor_key:visitorKey()}})}catch{}
}
async function trackAdEvent(campaign_id,event_type){
 try{await adFetch('event',{method:'POST',body:{campaign_id,event_type,visitor_key:visitorKey()}})}catch{}
}
function money(v){return 'Rp '+fmt(v)}
async function loadPublicAds(){
 const placements=['hero_banner','in_feed','sidebar','footer'];
 await Promise.all(placements.map(async placement=>{
   try{
     const d=await adFetch('ads',{params:{placement,limit:4}});
     const ads=d.ads||[];
     document.querySelectorAll('[data-ad-placement="'+placement+'"]').forEach(slot=>{
       if(!ads.length)return;
       const ad=ads[0];
       slot.classList.remove('empty');
       slot.innerHTML='<span class="adSlotLabel">'+esc((ad.brand_name||'Sponsor')+' · '+esc(placement.replace('_',' ')))+'</span><a class="adCreative" href="'+esc(ad.destination_url||'#')+'" target="_blank" rel="noopener" data-ad-campaign="'+esc(ad.campaign_id)+'"><img src="'+esc(ad.media_url||'')+'" alt="'+esc(ad.title||ad.campaign_name||'Iklan')+'" loading="lazy" referrerpolicy="no-referrer"><span><h4>'+esc(ad.title||ad.campaign_name||'Iklan')+'</h4><p>'+esc(ad.description||'Informasi sponsor')+'</p><b>'+esc(ad.cta_text||'Lihat Selengkapnya')+' →</b></span></a>';
       const link=slot.querySelector('[data-ad-campaign]');
       if(link){
         link.addEventListener('click',()=>trackAdEvent(ad.campaign_id,'click'));
         if('IntersectionObserver' in window){
           const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){trackAdEvent(ad.campaign_id,'impression');io.disconnect()}},{threshold:.5});
           io.observe(link);
         }else trackAdEvent(ad.campaign_id,'impression');
       }
     });
   }catch{}
 }));
 try{
   const p=await adFetch('pricing');
   const summary=document.getElementById('publicAdPriceSummary');
   if(summary)summary.textContent=(p.tier_label||'Starter')+' · '+fmt(p.traffic_unique_30d||0)+' pengunjung unik 30 hari · faktor harga ×'+Number(p.factor||1).toFixed(2);
 }catch{}
}
function adStatusBadge(s){
 const v=String(s||'draft').toLowerCase();
 const cls=['active','approved','paid','completed'].includes(v)?'ok':['rejected','cancelled'].includes(v)?'bad':'warn';
 const label={pending_review:'Menunggu review',approved:'Disetujui',active:'Aktif',paused:'Dijeda',rejected:'Ditolak',cancelled:'Dibatalkan',draft:'Draft',completed:'Selesai'}[v]||v;
 return '<span class="adStatus '+cls+'">'+esc(label)+'</span>';
}
function advertiserDashboardHtml(d){
 const a=d.advertiser;
 const p=d.pricing||{};
 const campaigns=d.campaigns||[];
 const slots=p.slots||[];
 const profile=a?'<div class="adCard"><h3>Profil Pengiklan</h3><p><b>'+esc(a.business_name)+'</b><br>'+esc(a.contact_name||'')+' · '+esc(a.email||'')+'<br>'+esc(a.phone||'')+'</p><small class="adHint">Status: '+adStatusBadge(a.status)+'</small></div>':'<div class="adCard"><h3>Profil Pengiklan</h3><p class="adHint">Profil belum dibuat. Gunakan tombol Pasang Iklan untuk mendaftarkan bisnis.</p></div>';
 const priceRows=slots.map(s=>'<tr><td><strong>'+esc(s.name)+'</strong><br><small>'+esc(s.format||'')+'</small></td><td>'+money(s.price_monthly)+'</td><td>×'+Number(s.factor||1).toFixed(2)+'</td></tr>').join('');
 const rows=campaigns.length?campaigns.map(c=>'<tr><td><strong>'+esc(c.campaign_name)+'</strong><br><small>'+esc(c.placement||'')+'</small></td><td>'+adStatusBadge(c.status)+'</td><td>'+money(c.quoted_price||c.budget||0)+'</td><td>'+fmt(c.impressions||0)+' / '+fmt(c.clicks||0)+'</td></tr>').join(''):'<tr><td colspan="4" class="adHint">Belum ada kampanye.</td></tr>';
 return '<div class="adModalGrid">'+profile+'<div class="adCard"><h3>Tier Trafik Saat Ini</h3><p><b>'+esc(p.tier_label||'Starter')+'</b><br>'+fmt(p.traffic_unique_30d||0)+' pengunjung unik 30 hari · faktor ×'+Number(p.factor||1).toFixed(2)+'</p><button class="cta" id="newAdCampaign">Buat Kampanye →</button>'+(d.is_admin?'<button class="outline" id="openRedcard" style="margin-left:6px">REDCARD Admin</button>':'')+'</div></div><div class="adCard" style="margin-top:14px"><h3>Paket & Harga</h3><table class="adTable"><thead><tr><th>Slot</th><th>Harga aktif / 30 hari</th><th>Faktor</th></tr></thead><tbody>'+priceRows+'</tbody></table></div><div class="adCard" style="margin-top:14px"><h3>Kampanye Saya</h3><table class="adTable"><thead><tr><th>Kampanye</th><th>Status</th><th>Quote</th><th>Tayang / Klik</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
async function advertiserDashboard(){
 await getSession();
 if(!session){openModal('Pusat Pengiklan','<p>Login diperlukan untuk membuat dan mengelola kampanye iklan.</p><button class="cta" id="adLoginBtn">Masuk / Daftar →</button>');$('#adLoginBtn')?.addEventListener('click',()=>authPanel());return}
 try{
   const d=await adFetch('advertiser_dashboard');
   const body=advertiserDashboardHtml(d);
   openModal('Dashboard Pengiklan',body);
   document.getElementById('newAdCampaign')?.addEventListener('click',advertise);
   document.getElementById('openRedcard')?.addEventListener('click',redcard);
   syncAdminNav(!!d.is_admin);
 }catch(e){openModal('Dashboard Pengiklan','<p>'+esc(e.message)+'</p>')}
}
function syncAdminNav(show){
 document.querySelectorAll('.adminAdNav').forEach(x=>x.style.display=show?'block':'none');
}
async function showAdPricing(){
 try{
   const p=await adFetch('pricing');
   const rows=(p.slots||[]).map(s=>'<tr><td><strong>'+esc(s.name)+'</strong><br><small>'+esc(s.description||'')+'</small></td><td>'+esc(s.format||'')+'</td><td>'+money(s.price_monthly)+'/30 hari</td></tr>').join('');
   openModal('Paket & Harga Iklan','<p>Tier saat ini: <b>'+esc(p.tier_label||'Starter')+'</b> · '+fmt(p.traffic_unique_30d||0)+' pengunjung unik 30 hari · faktor ×'+Number(p.factor||1).toFixed(2)+'</p><table class="adTable"><thead><tr><th>Penempatan</th><th>Format</th><th>Harga aktif</th></tr></thead><tbody>'+rows+'</tbody></table><p class="adHint">Harga kampanye dikunci saat quote dibuat. Kenaikan tier trafik berlaku untuk pesanan baru.</p><button class="cta" id="priceToAd">Pasang Iklan →</button>');
   $('#priceToAd')?.addEventListener('click',advertise);
 }catch(e){openModal('Paket & Harga Iklan','<p>'+esc(e.message)+'</p>')}
}
function advertiserFormHtml(d){
 const a=d?.advertiser||{};
 const slots=d?.pricing?.slots||[];
 const slotOptions=slots.map(s=>'<option value="'+esc(s.code)+'">'+esc(s.name)+' · '+money(s.price_monthly)+'/30 hari</option>').join('');
 return '<form class="adForm" id="advertiserForm"><div class="adCard"><h3>1 · Profil Bisnis</h3><div class="adTwo"><input name="business_name" required maxlength="160" placeholder="Nama bisnis / brand" value="'+esc(a.business_name||'')+'"><input name="contact_name" maxlength="120" placeholder="Nama kontak" value="'+esc(a.contact_name||'')+'"></div><div class="adTwo"><input name="phone" maxlength="60" placeholder="Nomor WhatsApp / telepon" value="'+esc(a.phone||'')+'"><input name="email" type="email" maxlength="160" placeholder="Email pengiklan" value="'+esc(a.email||session?.user?.email||'')+'"></div><input name="website" maxlength="240" placeholder="Website / landing page bisnis" value="'+esc(a.website||'')+'"></div><div class="adCard"><h3>2 · Kampanye</h3><input name="campaign_name" required maxlength="180" placeholder="Nama kampanye"><div class="adTwo"><input name="title" required maxlength="180" placeholder="Judul iklan"><select name="placement" required>'+slotOptions+'</select></div><div class="adTwo"><input name="duration_days" type="number" min="1" max="365" value="30" required><input name="start_at" type="date" title="Tanggal mulai (opsional)"></div><textarea name="description" maxlength="1000" placeholder="Deskripsi singkat iklan"></textarea><div class="adTwo"><input name="media_url" maxlength="1000" placeholder="URL gambar iklan (opsional jika upload)"><input name="destination_url" required maxlength="1000" type="url" placeholder="URL tujuan saat iklan diklik"></div><div class="adTwo"><input name="cta_text" maxlength="80" value="Lihat Selengkapnya" placeholder="Teks tombol"><input name="media_file" type="file" accept="image/jpeg,image/png,image/webp"></div><p class="adHint">Materi upload: JPG/PNG/WEBP, maksimal 10 MB. Kampanye baru masuk status menunggu review.</p><div class="adQuote" id="adQuote"><small>Quote harga</small><strong>Memuat…</strong><small id="adQuoteMeta"></small></div><button class="cta" type="submit">Kirim Kampanye untuk Review →</button></div></form>';
}
async function advertise(){
 await getSession();
 if(!session){openModal('Pasang Iklan','<p>Login / daftar dahulu agar kampanye memiliki pemilik dan dapat ditagihkan.</p><button class="cta" id="adLoginBtn">Masuk / Daftar →</button>');$('#adLoginBtn')?.addEventListener('click',()=>authPanel());return}
 try{
   const d=await adFetch('advertiser_dashboard');
   openModal('Pasang Iklan',advertiserFormHtml(d));
   syncAdminNav(!!d.is_admin);
   const form=$('#advertiserForm');const placement=form?.querySelector('[name="placement"]');const days=form?.querySelector('[name="duration_days"]');const quote=$('#adQuote');
   async function refreshQuote(){
     try{
       const q=await adFetch('quote',{params:{placement:placement.value,days:days.value||30}});
       if(quote)quote.innerHTML='<small>Harga untuk kampanye ini</small><strong>'+money(q.price)+'</strong><small id="adQuoteMeta">'+esc(q.tier_label)+' · '+fmt(q.traffic_unique_30d||0)+' pengunjung unik 30 hari · harga dikunci saat order</small>';
     }catch(e){if(quote)quote.innerHTML='<small>'+esc(e.message)+'</small>'}
   }
   placement?.addEventListener('change',refreshQuote);days?.addEventListener('input',refreshQuote);refreshQuote();
   form?.addEventListener('submit',async e=>{
     e.preventDefault();const btn=form.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent='Menyimpan…';
     try{
       const fd=new FormData(form);const p=Object.fromEntries(fd.entries());
       const profile=await adFetch('save_advertiser',{method:'POST',body:{business_name:p.business_name,contact_name:p.contact_name,phone:p.phone,email:p.email,website:p.website}});
       let mediaUrl=String(p.media_url||'').trim();
       const file=form.querySelector('[name="media_file"]')?.files?.[0];
       if(file){
         if(file.size>10*1024*1024)throw Error('File iklan melebihi 10 MB');
         const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=session.user.id+'/ads/'+Date.now()+'-'+crypto.randomUUID()+'.'+ext;
         const up=await sb.storage.from('advertiser-media').upload(path,file,{cacheControl:'3600',contentType:file.type,upsert:false});
         if(up.error)throw up.error;
         mediaUrl=sb.storage.from('advertiser-media').getPublicUrl(path).data.publicUrl||mediaUrl;
       }
       if(!mediaUrl)throw Error('Isi URL gambar iklan atau pilih file upload');
       const start=p.start_at?new Date(p.start_at+'T00:00:00').toISOString():null;
       const created=await adFetch('create_campaign',{method:'POST',body:{
         advertiser_id:profile.advertiser_id,campaign_name:p.campaign_name,title:p.title,description:p.description,
         placement:p.placement,duration_days:Number(p.duration_days||30),start_at:start,media_url:mediaUrl,
         destination_url:p.destination_url,cta_text:p.cta_text||'Lihat Selengkapnya',billing_model:'monthly'
       }});
       openModal('Kampanye Terkirim','<p>Kampanye <b>'+esc(p.campaign_name)+'</b> sudah masuk antrean review.</p><div class="adQuote"><small>Quote terkunci</small><strong>'+money(created.quote?.price||0)+'</strong><small>'+esc(created.quote?.tier_label||'')+' · '+fmt(created.quote?.traffic_unique_30d||0)+' pengunjung unik 30 hari</small></div><p class="adHint">Kenaikan tier trafik akan memengaruhi pesanan baru, bukan mengubah quote kampanye ini.</p><button class="cta" id="afterAdDash">Buka Dashboard Pengiklan →</button>');
       $('#afterAdDash')?.addEventListener('click',advertiserDashboard);
     }catch(err){openModal('Kampanye Gagal','<p>'+esc(err.message||'Kampanye belum tersimpan')+'</p><button class="outline" id="retryAd">Kembali ke Form</button>');$('#retryAd')?.addEventListener('click',advertise)}
     finally{btn.disabled=false;btn.textContent='Kirim Kampanye untuk Review →'}
   });
 }catch(e){openModal('Pasang Iklan','<p>'+esc(e.message)+'</p>')}
}
async function redcard(){
 await getSession();
 if(!session){openModal('REDCARD Administrasi','<p>Login diperlukan.</p>');return}
 try{
   const d=await adFetch('admin_dashboard');
   syncAdminNav(true);
   const t=d.traffic||{};const p=d.pricing||{};const tiers=d.tiers||[];const campaigns=d.campaigns||[];
   const metrics='<div class="redcardTop"><div class="redcardMetric"><b>'+fmt(t.today_pageviews||0)+'</b><small>Pageview hari ini</small></div><div class="redcardMetric"><b>'+fmt(t.today_unique||0)+'</b><small>Pengunjung unik hari ini</small></div><div class="redcardMetric"><b>'+fmt(t.traffic_30d||0)+'</b><small>Pengunjung unik 30 hari</small></div><div class="redcardMetric"><b>'+fmt(t.ad_impressions_30d||0)+'</b><small>Tayangan iklan 30 hari</small></div></div>';
   const tierHtml='<div class="tierGrid">'+tiers.map(x=>'<div class="tierBox"><h4>'+esc(x.label)+'</h4><input data-tier="'+esc(x.tier_name)+'" data-k="min" type="number" min="0" value="'+esc(x.min_unique_visitors_30d)+'" placeholder="Min 30d"><input data-tier="'+esc(x.tier_name)+'" data-k="max" type="number" min="0" value="'+esc(x.max_unique_visitors_30d??'')+'" placeholder="Max 30d (kosong = tanpa batas)"><input data-tier="'+esc(x.tier_name)+'" data-k="factor" type="number" min=".1" step=".05" value="'+esc(x.factor)+'" placeholder="Faktor harga"><button class="outline saveTier" data-tier="'+esc(x.tier_name)+'">Simpan tier</button></div>').join('')+'</div>';
   const rows=campaigns.length?campaigns.map(c=>'<div class="redcardRow"><span><strong>'+esc(c.business_name||'Tanpa nama')+'</strong><br>'+esc(c.campaign_name)+'<br><small>'+esc(c.placement||'')+'</small></span><span>'+adStatusBadge(c.status)+'</span><span>'+money(c.quoted_price||0)+'<br><small>'+fmt(c.impressions||0)+' tayang / '+fmt(c.clicks||0)+' klik</small></span><span class="redcardBtns"><button data-review="approved" data-id="'+esc(c.id)+'">Approve</button><button data-review="active" data-id="'+esc(c.id)+'">Aktifkan</button><button data-review="paused" data-id="'+esc(c.id)+'">Jeda</button><button data-review="rejected" data-id="'+esc(c.id)+'">Tolak</button></span></div>').join(''):'<p class="adHint">Belum ada kampanye.</p>';
   openModal('REDCARD · Administrasi Iklan',metrics+'<div class="adCard"><h3>Mesin Harga Otomatis</h3><p class="adHint">Faktor harga dibaca dari trafik pengunjung unik 30 hari. Perubahan tier hanya memengaruhi pesanan baru; quote kampanye lama tetap terkunci.</p>'+tierHtml+'</div><div class="adCard" style="margin-top:14px"><h3>Antrean Kampanye</h3><div class="redcardRows">'+rows+'</div></div>');
   $$('.saveTier').forEach(b=>b.addEventListener('click',async()=>{
     const tier=b.dataset.tier;const min=document.querySelector('[data-tier="'+CSS.escape(tier)+'"][data-k="min"]')?.value||0;const max=document.querySelector('[data-tier="'+CSS.escape(tier)+'"][data-k="max"]')?.value||null;const factor=document.querySelector('[data-tier="'+CSS.escape(tier)+'"][data-k="factor"]')?.value||1;
     try{await adFetch('admin_tier',{method:'POST',body:{tier_name:tier,min_unique_visitors_30d:Number(min),max_unique_visitors_30d:max===''?null:Number(max),factor:Number(factor),label:tiers.find(x=>x.tier_name===tier)?.label||tier}});await redcard()}catch(e){openModal('REDCARD','<p>'+esc(e.message)+'</p>')}
   }));
   $$('[data-review]').forEach(b=>b.addEventListener('click',async()=>{
     const status=b.dataset.review,id=b.dataset.id,note=window.prompt('Catatan admin (opsional):','')||'';
     try{await adFetch('admin_review',{method:'POST',body:{campaign_id:id,status,note}});await redcard()}catch(e){openModal('REDCARD','<p>'+esc(e.message)+'</p>')}
   }));
 }catch(e){openModal('REDCARD Administrasi','<p>'+esc(e.message||'Akses RedCard ditolak')+'</p>')}
}
async function cmsAdminData(){
  const [content,media,menu,settings,changes,profiles,roles,userRoles,audit]=await Promise.all([
    sb.from('cms_content').select('*').order('updated_at',{ascending:false}),
    sb.from('cms_media').select('*').order('created_at',{ascending:false}).limit(100),
    sb.from('cms_menu_items').select('*').order('parent_key').order('sort_order'),
    sb.from('cms_settings').select('*').order('key'),
    sb.from('cms_change_requests').select('*').order('created_at',{ascending:false}).limit(100),
    sb.from('profiles').select('id,full_name,display_name,account_type,is_active,created_at').order('created_at',{ascending:false}).limit(100),
    sb.from('roles').select('id,name,description').order('name'),
    sb.from('user_roles').select('user_id,role_id,created_at'),
    sb.from('audit_logs').select('id,user_id,action,entity_type,entity_id,created_at').order('created_at',{ascending:false}).limit(100)
  ]);
  for(const r of [content,media,menu,settings,changes,profiles,roles,userRoles,audit]) if(r.error) throw r.error;
  return {content:content.data||[],media:media.data||[],menu:menu.data||[],settings:settings.data||[],changes:changes.data||[],profiles:profiles.data||[],roles:roles.data||[],userRoles:userRoles.data||[],audit:audit.data||[]};
}
function saCard(title,desc,id,action){
 return '<div class="tierBox"><h4>'+esc(title)+'</h4><p class="adHint">'+esc(desc)+'</p><button class="outline" id="'+id+'">'+esc(action)+'</button></div>';
}
function saTable(rows,headers){
 return '<div style="overflow:auto"><table class="adTable"><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
}
async function superAdminDashboard(d={}){
 try{
   const x=await cmsAdminData();
   const t=d.traffic||{},c=d.campaigns||[];
   const body='<div class="adCard"><h3>NUANSA KITA · SUPER ADMIN CONTROL CENTER</h3><p class="adHint">Pusat kendali produksi: konten, media, menu, tampilan, data, wilayah, pengguna, iklan, keamanan, dan workflow AI. Perubahan konten memakai Draft → Review → Publish.</p><div class="redcardTop"><div class="redcardMetric"><b>'+fmt(t.today_pageviews||0)+'</b><small>Pageview hari ini</small></div><div class="redcardMetric"><b>'+fmt(t.today_unique||0)+'</b><small>Pengunjung unik</small></div><div class="redcardMetric"><b>'+fmt(t.traffic_30d||0)+'</b><small>Pengunjung 30 hari</small></div><div class="redcardMetric"><b>'+fmt(c.length)+'</b><small>Kampanye iklan</small></div></div></div><div class="adCard" style="margin-top:14px"><div class="tierGrid">'+
   saCard('Konten & Halaman','Buat, edit, preview, publish, arsip, dan versioning konten.','saContent','Buka Konten')+
   saCard('Media Library','Kelola URL media, alt text, status, dan metadata.','saMedia','Buka Media')+
   saCard('Fitur & Menu','Atur item menu, urutan, parent, dan visibilitas.','saMenu','Buka Menu')+
   saCard('Tampilan & Pengaturan','Kelola judul, tagline, hero, dan konfigurasi publik.','saSettings','Buka Pengaturan')+
   saCard('Data & Wilayah','Pantau dataset portal, sinyal LIVE, dan statistik wilayah.','saData','Buka Data')+
   saCard('Pengguna & Role','Lihat akun, role, status, dan kelola role administratif.','saUsers','Buka Pengguna')+
   saCard('Pengiklan & REDCARD','Review kampanye, trafik, tier harga, dan administrasi iklan.','saAds','Buka REDCARD')+
   saCard('Audit & Keamanan','Lihat jejak administratif dan change requests.','saSecurity','Buka Audit')+
   saCard('NUANSA KITA AI','Buat draft AI change request. Provider AI eksternal belum terhubung.','saAI','Buka AI Workspace')+
   '</div></div><div class="adCard" style="margin-top:14px"><h3>Status Control Center</h3>'+saTable(
    '<tr><td>Konten</td><td>'+fmt(x.content.length)+'</td><td>draft/review/published</td></tr>'+
    '<tr><td>Media</td><td>'+fmt(x.media.length)+'</td><td>library</td></tr>'+
    '<tr><td>Menu</td><td>'+fmt(x.menu.length)+'</td><td>visible/hidden</td></tr>'+
    '<tr><td>Change Requests</td><td>'+fmt(x.changes.length)+'</td><td>approval workflow</td></tr>'+
    '<tr><td>Pengguna</td><td>'+fmt(x.profiles.length)+'</td><td>profile directory</td></tr>'+
    '<tr><td>Audit</td><td>'+fmt(x.audit.length)+'</td><td>administrative trail</td></tr>',
    ['Modul','Jumlah','Status'])+'</div><div class="adCard" style="margin-top:14px"><button class="cta" id="saPublic">Kembali ke Portal Publik</button><button class="outline" id="saRefresh" style="margin-left:6px">Refresh Control Center</button></div>';
   openModal('SUPER ADMIN CONTROL CENTER',body);
   $('#saPublic')?.addEventListener('click',()=>{closeModal();window.scrollTo({top:0,behavior:'smooth'})});
   $('#saRefresh')?.addEventListener('click',()=>superAdminDashboard(d));
   $('#saContent')?.addEventListener('click',()=>saContent(x));
   $('#saMedia')?.addEventListener('click',()=>saMedia(x));
   $('#saMenu')?.addEventListener('click',()=>saMenu(x));
   $('#saSettings')?.addEventListener('click',()=>saSettings(x));
   $('#saData')?.addEventListener('click',()=>saData(x,d));
   $('#saUsers')?.addEventListener('click',()=>saUsers(x));
   $('#saAds')?.addEventListener('click',redcard);
   $('#saSecurity')?.addEventListener('click',()=>saSecurity(x));
   $('#saAI')?.addEventListener('click',()=>saAI(x));
 }catch(e){openModal('SUPER ADMIN CONTROL CENTER','<p>'+esc(e.message||'Control Center gagal dimuat')+'</p><button class="outline" id="saRetry">Coba Lagi</button>');$('#saRetry')?.addEventListener('click',()=>superAdminDashboard(d))}
}
async function saContent(x){
 const rows=x.content.map(v=>'<tr><td><b>'+esc(v.title)+'</b><br><small>'+esc(v.slug)+'</small></td><td>'+esc(v.content_type)+'</td><td>'+adStatusBadge(v.status)+'</td><td><button class="outline saEditContent" data-id="'+v.id+'">Edit</button></td></tr>').join('');
 openModal('CMS · Konten & Halaman','<div class="adCard"><button class="cta" id="newContent">+ Konten Baru</button><button class="outline" id="backSA" style="margin-left:6px">← Control Center</button></div>'+saTable(rows||'<tr><td colspan="4">Belum ada konten.</td></tr>',['Judul','Tipe','Status','Aksi']));
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
 $('#newContent')?.addEventListener('click',()=>saContentForm());
 $$('.saEditContent').forEach(b=>b.addEventListener('click',()=>saContentForm(x.content.find(v=>v.id===b.dataset.id))));
}
function saContentForm(item=null){
 const v=item||{title:'',slug:'',content_type:'page',status:'draft',body:{}};
 openModal(item?'Edit Konten':'Konten Baru','<form class="adForm" id="cmsContentForm"><div class="adCard"><input name="title" required maxlength="200" placeholder="Judul" value="'+esc(v.title)+'"><input name="slug" required maxlength="200" placeholder="slug" value="'+esc(v.slug)+'"><div class="adTwo"><select name="content_type"><option value="page" '+(v.content_type==='page'?'selected':'')+'>Page</option><option value="article" '+(v.content_type==='article'?'selected':'')+'>Article</option><option value="announcement" '+(v.content_type==='announcement'?'selected':'')+'>Announcement</option></select><select name="status"><option value="draft" '+(v.status==='draft'?'selected':'')+'>Draft</option><option value="review" '+(v.status==='review'?'selected':'')+'>Review</option><option value="published" '+(v.status==='published'?'selected':'')+'>Published</option><option value="archived" '+(v.status==='archived'?'selected':'')+'>Archived</option></select></div><textarea name="body" rows="12" placeholder="JSON body konten">'+esc(JSON.stringify(v.body||{},null,2))+'</textarea><button class="cta" type="submit">Simpan Konten</button><button class="outline" type="button" id="cancelContent">Batal</button></div></form>');
 $('#cancelContent')?.addEventListener('click',()=>saContentForm(item));
 $('#cmsContentForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));let body={};try{body=JSON.parse(f.body||'{}')}catch{openModal('CMS','<p>Body harus JSON yang valid.</p>');return}const payload={title:f.title,slug:f.slug,content_type:f.content_type,status:f.status,body,author_id:session?.user?.id,published_at:f.status==='published'?new Date().toISOString():null,version:Number(v.version||0)+(item?1:1)};try{const r=item?await sb.from('cms_content').update(payload).eq('id',item.id):await sb.from('cms_content').insert(payload);if(r.error)throw r.error;await sb.from('cms_change_requests').insert({entity_type:'cms_content',entity_id:item?.id||null,action:item?'update':'create',payload,status:'published'===f.status?'published':'pending',requested_by:session?.user?.id});await saContent((await cmsAdminData()));}catch(err){openModal('CMS Konten','<p>'+esc(err.message)+'</p>')}})
}
async function saMedia(x){
 const rows=x.media.map(v=>'<tr><td><b>'+esc(v.name)+'</b><br><small>'+esc(v.alt_text||'')+'</small></td><td><a href="'+esc(v.url)+'" target="_blank" rel="noopener">Buka media ↗</a></td><td>'+adStatusBadge(v.status)+'</td><td><button class="outline saEditMedia" data-id="'+v.id+'">Edit</button></td></tr>').join('');
 openModal('CMS · Media Library','<div class="adCard"><button class="cta" id="newMedia">+ Tambah Media URL</button><button class="outline" id="backSA" style="margin-left:6px">← Control Center</button></div>'+saTable(rows||'<tr><td colspan="4">Belum ada media.</td></tr>',['Media','URL','Status','Aksi']));
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
 $('#newMedia')?.addEventListener('click',()=>saMediaForm());
 $$('.saEditMedia').forEach(b=>b.addEventListener('click',()=>saMediaForm(x.media.find(v=>v.id===b.dataset.id))));
}
function saMediaForm(item=null){
 const v=item||{name:'',url:'',alt_text:'',media_type:'image',status:'active'};
 openModal(item?'Edit Media':'Tambah Media','<form class="adForm" id="cmsMediaForm"><div class="adCard"><input name="name" required maxlength="200" placeholder="Nama media" value="'+esc(v.name)+'"><input name="url" required type="url" maxlength="2000" placeholder="https://..." value="'+esc(v.url)+'"><input name="alt_text" maxlength="300" placeholder="Alt text" value="'+esc(v.alt_text||'')+'"><select name="status"><option value="active" '+(v.status==='active'?'selected':'')+'>Aktif</option><option value="archived" '+(v.status==='archived'?'selected':'')+'>Arsip</option></select><button class="cta" type="submit">Simpan Media</button></div></form>');
 $('#cmsMediaForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const payload={name:f.name,url:f.url,alt_text:f.alt_text,media_type:'image',status:f.status,uploaded_by:session?.user?.id};try{const r=item?await sb.from('cms_media').update(payload).eq('id',item.id):await sb.from('cms_media').insert(payload);if(r.error)throw r.error;await saMedia(await cmsAdminData())}catch(err){openModal('CMS Media','<p>'+esc(err.message)+'</p>')}})
}
async function saMenu(x){
 const rows=x.menu.map(v=>'<tr><td><input class="saMenuLabel" data-id="'+v.id+'" value="'+esc(v.label)+'"></td><td><input class="saMenuParent" data-id="'+v.id+'" value="'+esc(v.parent_key||'')+'"></td><td><input class="saMenuOrder" data-id="'+v.id+'" type="number" value="'+esc(v.sort_order)+'"></td><td><label><input type="checkbox" class="saMenuVisible" data-id="'+v.id+'" '+(v.visible?'checked':'')+'> tampil</label></td><td><button class="outline saSaveMenu" data-id="'+v.id+'">Simpan</button></td></tr>').join('');
 openModal('CMS · Fitur & Menu','<div class="adCard"><button class="cta" id="newMenu">+ Menu Baru</button><button class="outline" id="backSA" style="margin-left:6px">← Control Center</button></div>'+saTable(rows||'<tr><td colspan="5">Belum ada item menu.</td></tr>',['Label','Parent','Urutan','Visibilitas','Aksi']));
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
 $('#newMenu')?.addEventListener('click',()=>saMenuForm());
 $$('.saSaveMenu').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.id;const label=document.querySelector('.saMenuLabel[data-id="'+CSS.escape(id)+'"]')?.value||'';const parent_key=document.querySelector('.saMenuParent[data-id="'+CSS.escape(id)+'"]')?.value||null;const sort_order=Number(document.querySelector('.saMenuOrder[data-id="'+CSS.escape(id)+'"]')?.value||0);const visible=!!document.querySelector('.saMenuVisible[data-id="'+CSS.escape(id)+'"]')?.checked;const r=await sb.from('cms_menu_items').update({label,parent_key,sort_order,visible,updated_by:session?.user?.id}).eq('id',id);if(r.error)openModal('Menu','<p>'+esc(r.error.message)+'</p>');else saMenu(await cmsAdminData())}));
}
function saMenuForm(){
 openModal('Menu Baru','<form class="adForm" id="newMenuForm"><input name="label" required placeholder="Nama menu"><input name="href" placeholder="#tujuan"><input name="parent_key" placeholder="Parent key (opsional)"><input name="sort_order" type="number" value="0"><label><input name="visible" type="checkbox" checked> Tampilkan</label><button class="cta" type="submit">Simpan Menu</button></form>');
 $('#newMenuForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const r=await sb.from('cms_menu_items').insert({label:f.label,href:f.href||null,parent_key:f.parent_key||null,sort_order:Number(f.sort_order||0),visible:f.visible==='on',updated_by:session?.user?.id});if(r.error)openModal('Menu','<p>'+esc(r.error.message)+'</p>');else saMenu(await cmsAdminData())})
}
async function saSettings(x){
 const get=k=>x.settings.find(v=>v.key===k)?.value||{};
 const site=get('site_title'),tag=get('site_tagline');
 openModal('CMS · Tampilan & Pengaturan','<form class="adForm" id="settingsForm"><div class="adCard"><input name="site_title" placeholder="Judul situs" value="'+esc(site.title||'NUANSA KITA')+'"><input name="site_tagline" placeholder="Tagline" value="'+esc(tag.text||'ASPIRASI PUBLIK INDONESIA')+'"><textarea name="hero_config" rows="8" placeholder="JSON hero">'+esc(JSON.stringify(get('hero_config'),null,2))+'</textarea><textarea name="public_theme" rows="8" placeholder="JSON theme">'+esc(JSON.stringify(get('public_theme'),null,2))+'</textarea><button class="cta" type="submit">Simpan Pengaturan</button><button class="outline" type="button" id="backSA">← Control Center</button></div></form>');
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
 $('#settingsForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));for(const [key,value] of [['site_title',{title:f.site_title}],['site_tagline',{text:f.site_tagline}],['hero_config',JSON.parse(f.hero_config||'{}')],['public_theme',JSON.parse(f.public_theme||'{}')]]){const r=await sb.from('cms_settings').upsert({key,value,updated_by:session?.user?.id});if(r.error){openModal('Pengaturan','<p>'+esc(r.error.message)+'</p>');return}}await saSettings(await cmsAdminData())})
}
async function saData(x,d){
 const tables=portal?.tables||{};const rows=Object.entries(tables).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+fmt(Array.isArray(v)?v.length:0)+'</td><td>Portal data</td></tr>').join('');
 openModal('Data & Wilayah','<div class="adCard"><p>Data portal aktif dipisahkan dari CMS. Modul ini memonitor jumlah record yang sudah tersedia.</p>'+saTable(rows,['Tabel','Record','Sumber'])+'</div><div class="adCard" style="margin-top:14px"><p><b>LIVE incidents:</b> '+fmt(portal?.live_incidents?.length||0)+' sinyal dari BMKG/BNPB yang berhasil dimuat.</p><p><b>Wilayah:</b> '+fmt(tables.regions?.length||0)+' record pada payload portal.</p><button class="outline" id="refreshData">Refresh data portal</button><button class="outline" id="backSA" style="margin-left:6px">← Control Center</button></div>');
 $('#refreshData')?.addEventListener('click',async()=>{await loadPortal();saData(await cmsAdminData(),d)});
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard(d));
}
async function saUsers(x){
 const roleMap=Object.fromEntries(x.roles.map(r=>[r.id,r.name]));
 const rows=x.profiles.map(p=>{const rs=x.userRoles.filter(u=>u.user_id===p.id).map(u=>roleMap[u.role_id]||'unknown');return '<tr><td><b>'+esc(p.display_name||p.full_name||'Tanpa nama')+'</b><br><small>'+esc(p.id)+'</small></td><td>'+esc(p.account_type||'user')+'</td><td>'+esc(rs.join(', ')||'user')+'</td><td>'+ (p.is_active===false?'Nonaktif':'Aktif') +'</td><td><button class="outline saRole" data-user="'+p.id+'">Kelola Role</button></td></tr>'}).join('');
 openModal('Pengguna & Role',saTable(rows||'<tr><td colspan="5">Belum ada profile.</td></tr>',['Pengguna','Tipe','Role','Status','Aksi'])+'<button class="outline" id="backSA">← Control Center</button>');
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
 $$('.saRole').forEach(b=>b.addEventListener('click',()=>saRoleForm(x,b.dataset.user)));
}
function saRoleForm(x,userId){
 const roleMap=Object.fromEntries(x.roles.map(r=>[r.id,r.name]));const current=new Set(x.userRoles.filter(u=>u.user_id===userId).map(u=>u.role_id));
 openModal('Kelola Role','<p>User: <code>'+esc(userId)+'</code></p><div class="adCard">'+x.roles.map(r=>'<label style="display:block;margin:8px 0"><input type="checkbox" class="saRoleCheck" data-role="'+r.id+'" '+(current.has(r.id)?'checked':'')+'> '+esc(r.name)+' — '+esc(r.description||'')+'</label>').join('')+'</div><button class="cta" id="saveRoles">Simpan Role</button><button class="outline" id="cancelRoles">Batal</button>');
 $('#cancelRoles')?.addEventListener('click',()=>saUsers(x));
 $('#saveRoles')?.addEventListener('click',async()=>{if(!confirm('Simpan perubahan role pengguna ini?'))return;const selected=$$('.saRoleCheck').filter(z=>z.checked).map(z=>z.dataset.role);const old=[...current];for(const id of old.filter(id=>!selected.includes(id))){const r=await sb.from('user_roles').delete().eq('user_id',userId).eq('role_id',id);if(r.error){openModal('Role','<p>'+esc(r.error.message)+'</p>');return}}for(const id of selected.filter(id=>!old.includes(id))){const r=await sb.from('user_roles').insert({user_id:userId,role_id:id});if(r.error){openModal('Role','<p>'+esc(r.error.message)+'</p>');return}}await sb.from('audit_logs').insert({user_id:session?.user?.id,action:'change_role',entity_type:'user',entity_id:userId,new_data:{role_ids:selected}});await saUsers(await cmsAdminData())});
}
async function saSecurity(x){
 const rows=x.audit.map(a=>'<tr><td>'+esc(new Date(a.created_at).toLocaleString('id-ID'))+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.entity_type||'')+'</td><td><small>'+esc(a.user_id||'')+'</small></td></tr>').join('');
 const ch=x.changes.map(a=>'<tr><td>'+esc(new Date(a.created_at).toLocaleString('id-ID'))+'</td><td>'+esc(a.entity_type)+'</td><td>'+esc(a.action)+'</td><td>'+adStatusBadge(a.status)+'</td></tr>').join('');
 openModal('Audit & Keamanan','<div class="adCard"><h3>Audit Log</h3>'+saTable(rows||'<tr><td colspan="4">Belum ada audit.</td></tr>',['Waktu','Aksi','Entitas','User'])+'</div><div class="adCard" style="margin-top:14px"><h3>Change Requests</h3>'+saTable(ch||'<tr><td colspan="4">Belum ada request.</td></tr>',['Waktu','Entitas','Aksi','Status'])+'</div><button class="outline" id="backSA">← Control Center</button>');
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
}
async function saAI(x){
 const rows=x.changes.filter(a=>a.entity_type==='ai' || a.action==='ai_draft').map(a=>'<tr><td>'+esc(a.action)+'</td><td>'+esc(JSON.stringify(a.payload||{}))+'</td><td>'+adStatusBadge(a.status)+'</td></tr>').join('');
 let status='Memeriksa konfigurasi…';
 try{const st=await adFetch('ai_status');status=st.configured?('Provider aktif · '+esc(st.model||'model default')):'Provider belum aktif · tambahkan OPENAI_API_KEY pada Supabase Edge Function';}catch(e){status='Status AI tidak dapat diperiksa.'}
 openModal('NUANSA KITA AI WORKSPACE','<div class="adCard"><p><b>Workflow aman:</b> AI membuat draft. Tidak ada publish otomatis.</p><p class="adHint" id="aiStatus">'+status+'</p><form id="aiDraftForm"><input name="title" required placeholder="Tujuan perubahan AI"><textarea name="prompt" required rows="7" placeholder="Instruksi / brief untuk AI"></textarea><button class="cta" type="submit">Jalankan AI & Buat Draft</button></form></div>'+saTable(rows||'<tr><td colspan="3">Belum ada draft AI.</td></tr>',['Aksi','Payload','Status'])+'<button class="outline" id="backSA">← Control Center</button>');
 $('#backSA')?.addEventListener('click',()=>superAdminDashboard());
 $('#aiDraftForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));const btn=e.target.querySelector('button');btn.disabled=true;btn.textContent='AI memproses…';try{const r=await adFetch('ai_generate',{method:'POST',body:{title:f.title,prompt:f.prompt}});await sb.from('cms_change_requests').insert({entity_type:'ai',action:'ai_draft',payload:{title:f.title,prompt:f.prompt,result:r.text||'',model:r.model||null,created_by:session?.user?.id},status:'draft',requested_by:session?.user?.id});openModal('AI Draft Berhasil','<div class="adCard"><h3>'+esc(f.title)+'</h3><p>'+esc(r.text||'AI tidak mengembalikan teks.')+'</p><button class="cta" id="backAI">Kembali ke AI Workspace</button></div>');$('#backAI')?.addEventListener('click',()=>saAI(x));}catch(e){openModal('AI Workspace','<p>'+esc(e.message||'AI belum aktif')+'</p><button class="outline" id="retryAI">Kembali</button>');$('#retryAI')?.addEventListener('click',()=>saAI(x))}finally{btn.disabled=false;btn.textContent='Jalankan AI & Buat Draft'}})
}
const actions={map:()=>show('map'),data:()=>show('data'),report,monitor:()=>show('monitor'),insights:()=>show('insights'),forecast:()=>show('forecast'),solutions:()=>show('solutions'),about:()=>show('about'),advertise,advertiserDashboard,showAdPricing,redcard};
window.NK_INTERACTIONS={authPanel,show,report,advertise,advertiserDashboard,showAdPricing,redcard,handleSubmenu,actions};
$$('[data-act]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();actions[el.dataset.act]?.()}));
function navList(title, rows, emptyText){
 const body=rows.length?'<div class="navResultList">'+rows.map(r=>'<div class="rankrow"><span>●</span><span><b>'+esc(r.title||r.name||'Item')+'</b><br><small>'+esc(r.meta||r.category||r.level||'')+'</small></span></div>').join('')+'</div>':'<div class="navEmpty"><b>'+esc(emptyText||'Belum ada data publik.')+'</b><p>Data akan muncul otomatis setelah tersedia dan lolos aturan publikasi/verifikasi.</p></div>';
 openModal(title,body);
}
function handleSubmenu(t){
 const tables=portal?.tables||{}, problems=tables.problems||[], reports=tables.citizen_reports||[], signals=tables.early_signals||[], forecasts=tables.forecasts||[], solutions=tables.solutions||[], sources=tables.data_sources||[];
 if(t==='Ringkasan Indonesia'||t==='Provinsi'||t==='Kabupaten/Kota'||t==='Kecamatan'||t==='Desa/Kelurahan'||t==='Dusun'||t==='Pulau & Kawasan'||t==='Wilayah Prioritas') {document.querySelector('#jelajah')?.scrollIntoView({behavior:'smooth'});return}
 if(t==='Terkini') return navList('Masalah Terkini',[...problems,...reports].sort((a,b)=>new Date(b.updated_at||b.reported_at||0)-new Date(a.updated_at||a.reported_at||0)).slice(0,10).map(x=>({title:x.title,meta:x.category||x.verification_status})), 'Belum ada masalah terbit/terverifikasi.');
 if(t==='Berdasarkan Wilayah') return navList('Masalah Berdasarkan Wilayah',problems.slice(0,10).map(x=>({title:x.region_name||x.location_text||'Wilayah belum diisi',meta:x.title})), 'Belum ada masalah dengan wilayah publik.');
 if(t==='Berdasarkan Kategori'){const c={};problems.forEach(x=>{const k=x.category||'Lainnya';c[k]=(c[k]||0)+1});return navList('Masalah Berdasarkan Kategori',Object.entries(c).sort((a,b)=>b[1]-a[1]).map(x=>({title:x[0],meta:x[1]+' masalah'})),'Belum ada kategori masalah.')}
 if(t==='Mendesak'||t==='Dampak Tinggi') return navList(t,problems.filter(x=>['critical','high','urgent','mendesak'].includes(String(x.severity||x.status||'').toLowerCase())).slice(0,10).map(x=>({title:x.title,meta:x.category||x.severity})), 'Belum ada masalah prioritas yang dipublikasikan.');
 if(t==='Belum Terselesaikan'||t==='Perubahan Terakhir') return navList(t,problems.filter(x=>!['resolved','closed','completed'].includes(String(x.status||'').toLowerCase())).sort((a,b)=>new Date(b.updated_at||b.reported_at||0)-new Date(a.updated_at||a.reported_at||0)).slice(0,10).map(x=>({title:x.title,meta:x.status||'Terbuka'})), 'Belum ada masalah terbuka yang dipublikasikan.');
 if(t==='Sumber Data'||t==='Kumpulan Data') return navList(t,sources.slice(0,15).map(x=>({title:x.name||x.title,meta:x.organization||x.source_type||x.url})), 'Belum ada sumber data terdaftar.');
 if(t==='Indikator'||t==='Kualitas & Pembaruan Data'||t==='Dashboard Indikator'||t==='Seri Waktu') return show('data');
 if(['Laporkan Masalah'].includes(t)) return report();
 if(['Cerita Warga','Keluhan','Usulan','Polling','Diskusi','Laporan Terverifikasi','Laporan Terbaru'].includes(t)) return navList(t,reports.slice(0,10).map(x=>({title:x.title,meta:x.category||x.reported_at})),'Belum ada konten publik pada bagian ini.');
 if(['Masalah Baru','Meningkat','Menurun','Ramai Dibicarakan','Peringatan','Lonjakan Aktivitas','Hotspot Wilayah'].includes(t)) return navList(t,signals.slice(0,10).map(x=>({title:x.title||x.description,meta:x.change_percent!=null?x.change_percent+'%':'Sinyal'})),'Belum ada sinyal perubahan yang dipublikasikan.');
 if(['Pola','Penyebab','Tren','Hubungan','Ringkasan Wilayah','Perbandingan Wilayah','Korelasi Indikator'].includes(t)) return show('insights');
 if(['Perkiraan','Perbandingan','Skenario','Indikator Risiko','Sinyal Awal'].includes(t)) return navList(t,forecasts.slice(0,10).map(x=>({title:x.title||x.name,meta:x.horizon||x.confidence||'Forecast'})),'Belum ada forecast yang dipublikasikan.');
 if(['Solusi Warga','Solusi Pemerintah','Praktik Baik','Evaluasi Hasil','Solusi Terbaru','Praktik Terbukti'].includes(t)) return navList(t,solutions.slice(0,10).map(x=>({title:x.title||x.name,meta:x.type||x.status||'Solusi'})),'Belum ada solusi yang dipublikasikan.');
 if(t==='Pusat Fitur'){document.querySelector('#fitur')?.scrollIntoView({behavior:'smooth',block:'start'});return} if(t==='Sumber & Media'){document.querySelector('#sumber-media')?.scrollIntoView({behavior:'smooth',block:'start'});return} if(t==='Pasang Iklan') return advertise(); if(t==='Paket & Harga') return showAdPricing(); if(t==='Dashboard Pengiklan'||t==='Lokasi Iklan'||t==='Media Kit Iklan') return advertiserDashboard(); if(t==='REDCARD Administrasi') return redcard(); if(t==='Tentang Nuansa Kita') return show('about');
 if(t==='Bantuan'||t==='Panduan Pengguna') return openModal(t,'<p>Gunakan menu panah untuk membuka submenu. Klik item submenu untuk membuka data atau fitur terkait.</p>');
 if(t==='Kontak') return openModal('Kontak','<p>Gunakan kanal kontak yang tersedia di footer untuk kebutuhan informasi dan pengelolaan portal.</p>');
 if(t==='Kebijakan & Privasi'||t==='Pusat Keamanan') return openModal(t,'<p>Data publik ditampilkan sesuai status publikasi dan aturan akses. Data pribadi akun tidak ditampilkan sebagai data publik.</p>');
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
initSupabase();
function goAdminIfNeeded(){if(isKnownAdmin()&&!location.search.includes('admin_preview')&&location.pathname!=='/admin.html'){window.location.assign('/admin.html');return true}return false}
if(sb){
  loadSavedPublicTheme();
  sb.auth.onAuthStateChange((_event,s)=>{session=s||null;if(!goAdminIfNeeded()){renderAuth();syncAdminNav(false)}});
  forceAdminRedirect();
}
document.documentElement.classList.add('nk-js-ready');
const defer=(fn,ms=1200)=>('requestIdleCallback' in window?requestIdleCallback(fn,{timeout:ms}):setTimeout(fn,ms));
defer(async()=>{try{await getSession();if(await forceAdminRedirect())return;if(goAdminIfNeeded())return;renderAuth()}catch(e){console.warn('[auth-boot]',e)}},50);
defer(()=>trackSiteVisit(),2500);
defer(()=>loadPublicAds(),1800);
defer(()=>loadPortal(),1100);
if(!window.__nuansaPortalRefresh){window.__nuansaPortalRefresh=setInterval(()=>loadPortal(),300000)}
setTimeout(()=>{const m=location.hash.match(/^#laporan\/(.+)$/);if(m){const x=window.publicIssueIndex?.[decodeURIComponent(m[1])];if(x)openPublicIssue(x)}},900);
})();