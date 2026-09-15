(()=>{
'use strict';

const PUBLIC_LABELS={
  intelligence:'Wawasan',
  monitoring:'Pantau Perubahan',
  future:'Kemungkinan',
  solutions:'Solusi',
  'Problem Engine':'Masalah Indonesia',
  'Data Ocean':'Data Indonesia',
  'Acquisition':'Pengumpulan Data',
  'Validation':'Verifikasi Data',
  'Knowledge Graph':'Hubungan Informasi',
  'Pattern Engine':'Pola & Hubungan',
  'Pattern AI':'Pola & Hubungan',
  'Causal Engine':'Penyebab',
  'Causal Analysis':'Penyebab & Hubungan',
  'Trend / Signal AI':'Perubahan & Sinyal',
  'Trend & Signal':'Perubahan & Sinyal',
  'Future Radar':'Kemungkinan',
  'Forecast Engine':'Perkiraan',
  'Forecast':'Perkiraan',
  'Scenario Simulator':'Perbandingan Skenario',
  'Solution AI':'Solusi & Aksi',
  'Accuracy Engine':'Evaluasi',
  'AI Brain':'Sistem Pembelajaran',
  'Control Center':'Pengelolaan',
  'Sources':'Sumber Data',
  'Datasets':'Kumpulan Data',
  'Observations':'Indikator',
  'API Registry':'Layanan Data',
  'Konfigurasi Data':'Pengaturan Data',
  'Data Flow':'Alur Informasi',
  'Data Trust':'Kepercayaan Data',
  'SYSTEM':'Informasi'
};

function textReplace(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    let s=n.nodeValue;
    Object.entries(PUBLIC_LABELS).forEach(([from,to])=>{s=s.split(from).join(to)});
    n.nodeValue=s;
  });
}

function removeInternalPanels(root){
  root.querySelectorAll('.suite-panel,.card').forEach(el=>{
    const h=el.querySelector('h3,h2,.cardhead b,.suite-panel-head h3');
    if(!h)return;
    const t=(h.textContent||'').trim().toLowerCase();
    if(['api registry','konfigurasi data'].some(x=>t===x||t.includes(x))){el.remove();}
  });
}

function cleanPublic(){
  const home=document.getElementById('home');
  document.getElementById('public-expansion')?.remove();
  document.getElementById('public-features')?.classList.add('public-clean-layout');
  document.querySelectorAll('[data-view="control"]').forEach(x=>x.remove());
  document.getElementById('control')?.classList.remove('active');

  document.querySelectorAll('.nav-link[data-view]').forEach(a=>{
    const k=a.dataset.view;
    if(PUBLIC_LABELS[k])a.textContent=PUBLIC_LABELS[k];
    if(k==='control')a.remove();
  });
  document.querySelectorAll('.footer-links [data-view="intelligence"]').forEach(a=>a.textContent='Wawasan');

  if(home){
    home.querySelectorAll('.feature-items button').forEach(btn=>{
      const view=btn.dataset.view;
      const title=btn.querySelector('b');
      if(!title)return;
      if(view==='intelligence')title.textContent='Wawasan & Kemungkinan';
      if(view==='monitoring')title.textContent='Pantau Perubahan';
    });
  }

  const active=document.querySelector('.view.active:not(#control)');
  if(active){
    textReplace(active);
    removeInternalPanels(active);
  }
  try{window.lucide?.createIcons()}catch{}
}

function install(){
  cleanPublic();
  const original=window.render;
  if(typeof original!=='function')return;
  if(original.__publicWrapped)return;
  async function publicRender(view,arg){
    if(view==='control')view='home';
    const result=original(view,arg);
    try{await result}catch(e){throw e}finally{
      setTimeout(cleanPublic,0);
      setTimeout(cleanPublic,180);
      setTimeout(cleanPublic,700);
    }
    return result;
  }
  publicRender.__publicWrapped=true;
  window.render=publicRender;
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
setTimeout(cleanPublic,300);
setTimeout(cleanPublic,1000);
})();
