(()=>{
'use strict';
const $=id=>document.getElementById(id);
function esc(s){return String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
function card(icon,kicker,title,text,metric='',view=''){return `<article class="public-card">${icon?`<div class="public-icon">${icon}</div>`:''}<span class="public-kicker">${esc(kicker)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${metric?`<div class="public-metric"><b>${esc(metric)}</b><span>lihat detail →</span></div>`:''}${view?`<div style="margin-top:13px"><button class="btn-outline" data-view="${esc(view)}">Buka Fitur →</button></div>`:''}</article>`}
function add(){
 const home=$('home');if(!home||$('public-expansion'))return;
 const wrap=document.createElement('div');wrap.id='public-expansion';wrap.innerHTML=`
<section class="public-section"><div class="public-section-head"><div><h2>Semua lapisan Indonesia, dalam satu alur</h2><p>Halaman publik mengikuti pola contoh: ringkasan → jelajah wilayah → masalah → data → aspirasi → intelligence → masa depan → solusi.</p></div></div><div class="public-grid-4">
${card('▦','WILAYAH','Dari Indonesia sampai Dusun','Hierarki wilayah resmi menjadi tulang punggung pencarian dan pemetaan masalah.','91.363 wilayah','regions')}
${card('⚠','MASALAH','Problem Engine','Pisahkan isu, status, dampak, confidence, dan evidence agar masalah tidak sekadar menjadi judul.','Problem lifecycle','problems')}
${card('◈','DATA','Data Ocean','Satukan source, dataset, observation, provenance, kualitas, dan versi data dalam satu ruang.','Traceable','data')}
${card('✎','ASPIRASI','Suara Warga','Cerita warga masuk sebagai sinyal awal dan melewati verifikasi sebelum menjadi fakta produksi.','Human-in-loop','report')}
</div></section>
<section class="public-section"><div class="public-section-head"><div><h2>Bagaimana mesin pengetahuan bekerja</h2><p>Urutan fitur mengikuti filosofi proyek: lihat masalah → dengarkan manusia → kumpulkan data → pahami penyebab → prediksi → cari solusi → ukur hasil.</p></div></div><div class="public-card"><div class="public-roadmap"><span>Data Ocean</span><i class="arrow">→</i><span>Acquisition</span><i class="arrow">→</i><span>Validation</span><i class="arrow">→</i><span>Problem</span><i class="arrow">→</i><span>Pattern</span><i class="arrow">→</i><span>Causal</span><i class="arrow">→</i><span>Forecast</span></div><div class="public-roadmap"><span>Evidence</span><i class="arrow">→</i><span>Knowledge Graph</span><i class="arrow">→</i><span>Trend / Signal</span><i class="arrow">→</i><span>Future Radar</span><i class="arrow">→</i><span>Scenario</span><i class="arrow">→</i><span>Solution</span><i class="arrow">→</i><span>Accuracy</span></div><div style="margin-top:15px">${card('◎','AI BRAIN','Evidence-first intelligence','Setiap analisis harus bisa ditelusuri ke data, sumber, confidence, ketidakpastian, dan outcome.','','intelligence')}</div></div></section>
<section class="public-section"><div class="public-section-head"><div><h2>API, konfigurasi, dan integritas data</h2><p>Konfigurasi sistem bukan halaman terpisah yang terlepas dari data. Status API, sumber, pipeline, kualitas, dan audit perlu menjadi bagian dari pengalaman data publik.</p></div><button class="btn-outline" data-view="data">Buka Data & Statistik →</button></div><div class="public-grid-3">
<article class="public-card public-api"><span class="public-kicker">API</span><h3>Data API</h3><div class="public-api-list"><div class="public-api-row"><div><b>Region Registry</b><small>provinsi → desa</small></div><span class="public-status">READY</span></div><div class="public-api-row"><div><b>Problem API</b><small>status / impact / confidence</small></div><span class="public-status">READY</span></div><div class="public-api-row"><div><b>Evidence API</b><small>source / report / observation</small></div><span class="public-status">READY</span></div><div class="public-api-row"><div><b>Prediction API</b><small>horizon / probability / outcome</small></div><span class="public-status">READY</span></div></div></article>
${card('⌁','CONFIG','Konfigurasi & Pipeline','Pengaturan bukan data palsu: tampilkan status sinkronisasi, versi sumber, geometry, validasi, dan proses background secara transparan.','','control')}
${card('✓','GOVERNANCE','Audit & Data Trust','Confidence, provenance, uncertainty, human review, dan audit trail menjadi bagian dari keputusan publik.','Evidence-first','more')}
</div></section>
<section class="public-section"><div class="public-grid-2"><article class="public-card public-cta"><div><strong>Masalah tidak berhenti pada laporan.</strong><p>Masuk ke monitoring untuk melihat perubahan, lalu ke intelligence untuk memahami pola.</p></div><button class="btn-primary" data-view="monitoring">Buka Monitoring →</button></article><article class="public-card public-cta"><div><strong>Masa depan harus bisa diuji.</strong><p>Future Radar menampilkan kemungkinan dengan horizon, probabilitas, confidence, dan outcome.</p></div><button class="btn-primary" data-view="future">Buka Future Radar →</button></article></div></section>
<section class="public-section"><div class="public-section-head"><div><h2>Ruang aksi</h2><p>Hasil akhir platform adalah keputusan yang lebih tepat, opsi solusi yang dapat dibandingkan, dan perubahan yang bisa diukur.</p></div></div><div class="public-grid-3">
${card('↗','INTELLIGENCE','Analisis & Prediksi','Evidence Explorer, Pattern, Causal, Trend, Forecast, dan confidence dalam satu ruang kerja.','','intelligence')}
${card('◇','SCENARIO','Simulasi','Bandingkan skenario dan risiko sebelum intervensi dijalankan.','','solutions')}
${card('✓','OUTCOME','Solusi & Aksi','Kaitkan opsi tindakan dengan dampak, risiko, biaya, dan outcome yang dapat diukur.','','solutions')}
</div></section>
<div class="public-foot-space"></div>`;
 home.appendChild(wrap);
 document.querySelectorAll('#public-expansion [data-view]').forEach(b=>b.addEventListener('click',()=>window.render?.(b.dataset.view)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
