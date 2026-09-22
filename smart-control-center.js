(()=>{'use strict';
const U='https://gfggmkeucgqkkyvummpu.supabase.co',K='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw0';
let sb,me;
const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const meta={
overview:['⌂ Ikhtisar','Pantau kesehatan platform dan aktivitas utama.'],
content:['▣ Konten & Halaman','Kelola modul, draft, publikasi, dan perubahan halaman.'],
theme:['◉ Tema & Visual','Kelola identitas visual dan tampilan publik.'],
menu:['☰ Menu & Navigasi','Kelola struktur menu dan tujuan navigasi.'],
media:['▧ Media Library','Pantau aset, foto laporan, sumber, dan penggunaan media.'],
users:['♙ Pengguna & Role','Pantau akun dan pembagian akses.'],
ads:['▤ Iklan & REDCARD','Kelola pengiklan, campaign, kreatif, slot, harga, dan review.'],
audit:['⌁ Audit & Keamanan','Pantau jejak perubahan dan kontrol keamanan.'],
ai:['✦ AI Workspace','Mesin cerdas: draft, analisis, quality guard, dan change request.'],
smart:['⚙ Smart Page Engine','Orkestrasi halaman, trafik, iklan, personalisasi, dan eksperimen.']
};
async function count(t){try{const r=await sb.from(t).select('*',{count:'exact',head:true});return r.count??0}catch{return 0}}
async function rows(t,cols='*',limit=8){try{const r=await sb.from(t).select(cols).limit(limit);return r.data||[]}catch{return[]}}
function table(data){if(!data.length)return '<div class="empty">Belum ada data.</div>';const keys=Object.keys(data[0]).slice(0,6);return '<div class="tablewrap"><table class="tbl"><thead><tr>'+keys.map(k=>'<th>'+esc(k)+'</th>').join('')+'</tr></thead><tbody>'+data.map(x=>'<tr>'+keys.map(k=>'<td>'+esc(typeof x[k]==='object'?JSON.stringify(x[k]):x[k])+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
async function render(view){
 const title=meta[view]?.[0]||'Control Center',desc=meta[view]?.[1]||'';
 $('#title').textContent=title;$('#desc').textContent=desc;
 const app=$('#app'); app.innerHTML='<div class="notice">Memuat mesin…</div>';
 if(view==='overview') return overview(app);
 if(view==='ads') return ads(app);
 if(view==='media') return media(app);
 if(view==='audit') return audit(app);
 if(view==='users') return users(app);
 if(view==='content'||view==='theme'||view==='menu') return cms(app,view);
 if(view==='ai') return ai(app);
 if(view==='smart') return smart(app);
}
async function overview(a){const ts=['problems','citizen_reports','advertisers','ad_campaigns','cms_change_requests','audit_logs'];const c=await Promise.all(ts.map(count));a.innerHTML='<div class="metrics">'+ts.map((t,i)=>'<div class="metric"><b>'+c[i].toLocaleString('id-ID')+'</b><span>'+t.replaceAll('_',' ')+'</span></div>').join('')+'</div><div class="card"><h2>Mesin Platform</h2><p class="help">Semua lapisan yang sebelumnya tersebar di blueprint/mockup sekarang dipusatkan di Control Center.</p><div class="grid">'+[['Problem Intelligence','profil masalah, laporan warga, bukti, status, dampak'],['Regional Intelligence','Indonesia → provinsi → kab/kota → kecamatan → desa'],['Future Radar','sinyal awal, tren, confidence, skenario'],['Evidence Engine','sumber, tanggal, verifikasi, confidence'],['Advertiser + REDCARD','campaign → kreatif → review → jadwal → analytics'],['Traffic Intelligence','visitor, pageview, CTR, minat wilayah'],['Media Intelligence','foto, alt text, sumber, keterkaitan masalah'],['AI Workspace','draft → quality guard → change request → review']].map(x=>'<div class="module"><h3>'+x[0]+'</h3><p>'+x[1]+'</p><span class="pill">ACTIVE LAYER</span></div>').join('')+'</div></div>'}
async function ads(a){const [adv,camp,cre,slots,tiers,traffic]=await Promise.all(['advertisers','ad_campaigns','ad_creatives','ad_slots','ad_price_tiers','ad_traffic_daily'].map(t=>rows(t)));a.innerHTML='<div class="metrics"><div class="metric"><b>'+adv.length+'</b><span>Pengiklan</span></div><div class="metric"><b>'+camp.length+'</b><span>Campaign</span></div><div class="metric"><b>'+cre.length+'</b><span>Kreatif</span></div><div class="metric"><b>'+slots.length+'</b><span>Slot</span></div></div><div class="card"><h2>REDCARD Pipeline</h2><p class="help">Registrasi → campaign → creative → review → approval → pricing → schedule → publish → analytics → billing.</p>'+table(camp)+'</div><div class="card"><h2>Dynamic Pricing</h2>'+table(tiers)+'</div><div class="card"><h2>Traffic 30 Hari</h2>'+table(traffic)+'</div>'}
async function media(a){const [m,e]=await Promise.all([rows('media_assets'),rows('evidence')]);a.innerHTML='<div class="card"><h2>Media Intelligence</h2><p class="help">Aset dipetakan ke masalah/wilayah, memiliki sumber dan metadata, serta dapat ditandai untuk review.</p>'+table(m)+'</div><div class="card"><h2>Evidence Engine</h2>'+table(e)+'</div>'}
async function audit(a){const [x,c]=await Promise.all([rows('audit_logs'),rows('cms_change_requests')]);a.innerHTML='<div class="card"><h2>Audit Log</h2>'+table(x)+'</div><div class="card"><h2>Change Requests</h2><p class="help">AI tidak menimpa halaman secara langsung; perubahan masuk antrean review.</p>'+table(c)+'</div>'}
async function users(a){const x=await rows('profiles');a.innerHTML='<div class="card"><h2>Pengguna & Role</h2><p class="help">Akses dikelola dari data role yang tersedia. Jangan gunakan user_metadata untuk otorisasi.</p>'+table(x)+'</div>'}
async function cms(a,v){const x=await rows('cms_settings','key,value,updated_at',50);a.innerHTML='<div class="card"><h2>'+meta[v][0]+'</h2><p class="help">Konfigurasi CMS tersimpan terpusat. Nilai yang belum tersedia dapat ditambahkan melalui modul ini.</p>'+table(x)+'</div>'}
async function ai(a){const [cr,p,e,s]=await Promise.all([rows('cms_change_requests'),rows('problems'),rows('evidence'),rows('early_signals')]);a.innerHTML='<div class="metrics"><div class="metric"><b>'+cr.length+'</b><span>Change Requests</span></div><div class="metric"><b>'+p.length+'</b><span>Masalah</span></div><div class="metric"><b>'+e.length+'</b><span>Bukti</span></div><div class="metric"><b>'+s.length+'</b><span>Early Signals</span></div></div><div class="card"><h2>AI Workspace — Mesin Cerdas</h2><div class="grid">'+[['Content Director','membuat draft struktur konten dari data yang tersedia'],['Trend Detector','mendeteksi perubahan pola pada data'],['Regional Intelligence','meringkas isu per wilayah'],['Risk Radar','mengubah sinyal menjadi indikator dengan confidence'],['Quality Guard','memeriksa sumber, gambar, label, dan metadata'],['Change Request','setiap perubahan penting masuk review sebelum publish']].map(x=>'<div class="module"><h3>'+x[0]+'</h3><p>'+x[1]+'</p><button class="btn" data-ai-action="'+esc(x[0])+'">Jalankan pemeriksaan</button></div>').join('')+'</div></div>'}
async function smart(a){a.innerHTML='<div class="card"><h2>Smart Page Engine</h2><p class="help">Mesin ini menghubungkan pengaturan publik dengan dashboard, iklan, personalisasi, eksperimen, dan automation guard.</p><div class="notice">✓ Page Orchestrator · ✓ Smart Ads · ✓ Dynamic Pricing · ✓ Personalization · ✓ A/B framework · ✓ Review gate</div></div>'}
async function init(){sb=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}});if(!sb)return;const r=await sb.auth.getSession();me=r.data.session?.user;if(!me)return;
 document.addEventListener('click',e=>{const b=e.target.closest('.nav button');if(!b)return;const v=b.dataset.view;if(!v)return;e.preventDefault();e.stopImmediatePropagation();document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(v)},true);
 render(document.querySelector('.nav button.active')?.dataset.view||'overview');
}
window.addEventListener('DOMContentLoaded',init);
})();