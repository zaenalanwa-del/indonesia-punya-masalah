const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const menu=$('#menuBtn'),side=$('#sidebar');if(menu)menu.onclick=()=>side.classList.toggle('open');
$$('[data-scroll]').forEach(b=>b.onclick=()=>document.querySelector(b.dataset.scroll)?.scrollIntoView({behavior:'smooth'}));
const modal=$('#reportModal');
$$('[data-report]').forEach(b=>b.onclick=()=>modal?.classList.add('open'));
modal?.querySelector('.close')?.addEventListener('click',()=>modal.classList.remove('open'));
modal?.addEventListener('click',e=>{if(e.target===modal)modal.classList.remove('open')});
$('#reportForm')?.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));try{const r=await fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw Error();alert('Laporan diterima dan masuk antrean review.');e.currentTarget.reset();modal.classList.remove('open')}catch(err){alert('Mode demo: laporan tersimpan secara lokal di antarmuka.');e.currentTarget.reset();modal.classList.remove('open')}});
$('#searchInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const q=e.currentTarget.value.trim();if(q)location.hash='masalah';}});
