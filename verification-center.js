(()=>{'use strict';
const SUPABASE_URL='https://gfggmkeucgqkkyvummpu.supabase.co',SUPABASE_KEY='sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw0';
let client=null;
const $=s=>document.querySelector(s), esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function init(){try{client=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}})}catch(e){}}
async function session(){init();return (await client?.auth.getSession())?.data?.session||null}
async function load(){const s=await session();if(!s){alert('Silakan login sebagai admin terlebih dahulu.');return}
 const {data,error}=await client.from('citizen_reports').select('id,title,description,category,severity,reported_at,verification_status,verification_score,source_type,media_urls,metadata').order('reported_at',{ascending:false}).limit(40);
 if(error){alert(error.message);return}
 const rows=(data||[]).map(r=>'<tr><td><b>'+esc(r.title||'Tanpa judul')+'</b><br><small>'+esc(r.description||'').slice(0,180)+'</small></td><td>'+esc(r.category||'-')+'<br>'+esc(r.severity||'-')+'</td><td>'+new Date(r.reported_at).toLocaleString('id-ID')+'</td><td><span class="pill">'+esc(r.verification_status)+'</span><br><small>skor '+esc(r.verification_score??'-')+'</small></td><td><button class="btn primary vrVerify" data-id="'+r.id+'">Verifikasi</button> <button class="btn vrReject" data-id="'+r.id+'">Tolak</button><br><button class="btn vrPromote" data-id="'+r.id+'">→ Problem + Signal</button></td></tr>').join('');
 const app=$('#app');app.innerHTML='<div class="card"><h2>Verifikasi Laporan Warga</h2><p class="help">Setujui hanya laporan yang memiliki dasar yang cukup. Setelah diverifikasi, database otomatis membuat Problem, Evidence, dan Early Signal.</p><div class="tablewrap"><table class="tbl"><thead><tr><th>Laporan</th><th>Kategori</th><th>Waktu</th><th>Status</th><th>Aksi</th></tr></thead><tbody>'+ (rows||'<tr><td colspan="5">Belum ada laporan.</td></tr>')+'</tbody></table></div></div>';
 document.querySelectorAll('.vrVerify').forEach(b=>b.onclick=()=>update(b.dataset.id,'verified'));
 document.querySelectorAll('.vrReject').forEach(b=>b.onclick=()=>update(b.dataset.id,'rejected'));
 document.querySelectorAll('.vrPromote').forEach(b=>b.onclick=()=>promote(b.dataset.id));
}
async function update(id,status){const score=status==='verified'?Number(prompt('Skor verifikasi 0-100:','80')||0):0;if(status==='verified'&&(!Number.isFinite(score)||score<0||score>100))return alert('Skor harus 0-100.');const r=await client.from('citizen_reports').update({verification_status:status,verification_score:score}).eq('id',id);if(r.error)alert(r.error.message);else load()}
async function promote(id){const r=await client.rpc('promote_verified_report',{p_report_id:id});if(r.error)alert(r.error.message);else{alert('Laporan dipromosikan menjadi Problem + Evidence + Early Signal.');load()}}
function wire(){const nav=document.querySelector('.nav');if(!nav)return;const b=document.createElement('button');b.dataset.view='verification';b.textContent='✓ Verifikasi Laporan';nav.insertBefore(b,nav.querySelector('[data-view="ads"]'));b.onclick=e=>{e.preventDefault();document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');load()}}
setTimeout(wire,500);setTimeout(()=>{const p=new URLSearchParams(location.search);if(p.get('verification')==='1')load()},900);
window.NK_VERIFICATION={load};
})();