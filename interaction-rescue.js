(()=>{'use strict';
const loadScript=(src,check)=>{
  if(check&&check())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const old=document.querySelector('script[data-nk-loader="'+src+'"]');
    if(old){old.addEventListener('load',()=>resolve(),{once:true});old.addEventListener('error',reject,{once:true});return;}
    const s=document.createElement('script');s.src=src;s.async=true;s.dataset.nkLoader=src;
    s.onload=()=>resolve();s.onerror=reject;document.head.appendChild(s);
  });
};
const ensureSupabase=()=>loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',()=>!!window.supabase?.createClient);
const ensureLeaflet=()=>loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',()=>!!window.L);

// ADMIN REDIRECT + PUBLIC INTERACTION FAILSAFE
const NK_ADMIN_EMAIL='zaenalanwa@gmail.com';
async function forceAdminRedirect(){
  try{
    if(location.pathname==='/admin.html')return;
    await ensureSupabase();
    const c=window.supabase.createClient('https://gfggmkeucgqkkyvummpu.supabase.co','sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw0',{auth:{persistSession:true,autoRefreshToken:true}});
    const r=await c.auth.getSession();
    const email=String(r.data?.session?.user?.email||'').trim().toLowerCase();
    if(email===NK_ADMIN_EMAIL){location.replace('/admin.html');return true;}
  }catch(e){console.warn('[admin-redirect]',e)}
  return false;
}
async function rescueLogin(){
  try{await ensureSupabase();const c=window.supabase.createClient('https://gfggmkeucgqkkyvummpu.supabase.co','sb_publishable_ptCVbq9h15prKhT0OO5Zmg_LkE3cbw',{auth:{persistSession:true,autoRefreshToken:true}});
    const box=document.querySelector('#modal');const body=document.querySelector('#mb');
    if(!box||!body)return;
    body.innerHTML='<h2>Login / Masuk</h2><form id="rescueLoginForm" class="authForm"><input name="email" type="email" required placeholder="Email"><input name="password" type="password" required minlength="6" placeholder="Kata Sandi"><button class="cta" type="submit">Login / Masuk</button><p id="rescueLoginMsg" class="authNote">Masuk dengan akun Nuansa Kita.</p></form>';
    box.classList.add('open');
    document.querySelector('#rescueLoginForm').onsubmit=async ev=>{ev.preventDefault();const f=Object.fromEntries(new FormData(ev.currentTarget));const m=document.querySelector('#rescueLoginMsg');m.textContent='Memproses login…';const r=await c.auth.signInWithPassword({email:f.email.trim(),password:f.password});if(r.error){m.textContent=r.error.message;return}sessionStorage.setItem('nk-login-ok','1');if(String(r.data?.user?.email||'').toLowerCase()===NK_ADMIN_EMAIL){location.replace('/admin.html');return}location.reload();};
  }catch(e){alert('Login gagal dimuat: '+(e.message||e));}
}
\nconst boot=()=>{
  if(window.__nkInteractionRescue)return;
  window.__nkInteractionRescue=true;
  document.addEventListener('click',async e=>{
    const auth=e.target.closest('#authBtn,.authBtn');
    if(auth){
      e.preventDefault();e.stopImmediatePropagation();
      try{await ensureSupabase();if(window.NK_INTERACTIONS?.authPanel){await window.NK_INTERACTIONS.authPanel()}else await rescueLogin()}catch(err){await rescueLogin()}
      return;
    }
    const navBtn=e.target.closest('.nav .group>button');
    if(navBtn){
      e.preventDefault();e.stopImmediatePropagation();
      const g=navBtn.closest('.group');
      document.querySelectorAll('.nav .group').forEach(x=>{if(x!==g)x.classList.remove('open')});
      g?.classList.toggle('open');
      return;
    }
    const sub=e.target.closest('.nav .group .sub a');
    if(sub&&window.NK_INTERACTIONS?.handleSubmenu){e.preventDefault();e.stopImmediatePropagation();window.NK_INTERACTIONS.handleSubmenu(sub.textContent.trim());return;}
    const act=e.target.closest('[data-act]');
    if(act&&window.NK_INTERACTIONS?.actions){
      const fn=window.NK_INTERACTIONS.actions[act.dataset.act];
      if(typeof fn==='function'){e.preventDefault();e.stopImmediatePropagation();fn();return;}
    }
  },true);
  window.addEventListener('error',err=>{
    console.warn('NuansaKita interaction rescue:',err.message);
    document.documentElement.classList.add('nk-js-error');
  });
  ensureSupabase().catch(()=>{});\n  setTimeout(()=>forceAdminRedirect(),350);\n  window.addEventListener('load',()=>setTimeout(()=>forceAdminRedirect(),250));
  ensureLeaflet().then(()=>{try{window.loadPortal?.()}catch{}}).catch(()=>{});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();