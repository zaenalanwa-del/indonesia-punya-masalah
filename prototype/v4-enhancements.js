/* Public reference UI enhancements: overrides the map view with a real BIG/Leaflet map. */
window.renderMap=async function(){
  const pageEl=document.getElementById('map');
  if(!pageEl)return;
  pageEl.innerHTML=`<div class="page"><span class="eyebrow">PETA INDONESIA</span><h2>Peta Indonesia</h2><p class="muted">Boundary provinsi dari layanan BIG. Klik wilayah untuk melihat detail.</p><div class="card"><div id="leafletMap" class="leaflet-map"></div><div id="mapInfo" class="notice">Memuat boundary…</div></div></div>`;
  setActive('map');
  if(!window.L){document.getElementById('mapInfo').textContent='Leaflet belum termuat.';return;}
  const map=L.map('leafletMap',{zoomControl:true,scrollWheelZoom:true}).setView([-2.5,118],4.2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
  try{
    const u=new URL('https://geoservices.big.go.id/gis/rest/services/STIG/Batas_Provinsi/MapServer/0/query');
    u.searchParams.set('where','1=1');u.searchParams.set('outFields','KDPPUM,PROVINSI');u.searchParams.set('returnGeometry','true');u.searchParams.set('outSR','4326');u.searchParams.set('f','geojson');
    const r=await fetch(u);if(!r.ok)throw Error(`BIG HTTP ${r.status}`);const gj=await r.json();
    const layer=L.geoJSON(gj,{style:()=>({color:'#fff',weight:1,fillColor:'#26b874',fillOpacity:.6}),onEachFeature:(f,l)=>{const p=f.properties||{};l.bindTooltip(p.PROVINSI||p.KDPPUM||'Provinsi');l.on('click',()=>{document.getElementById('mapInfo').innerHTML=`<b>${esc(p.PROVINSI||'Provinsi')}</b><br><small>Kode BIG ${esc(p.KDPPUM||'—')}</small><br><button class="btn-primary" onclick="render('regions')">Buka wilayah</button>`})}}).addTo(map);
    if(layer.getBounds().isValid())map.fitBounds(layer.getBounds(),{padding:[10,10]});
    document.getElementById('mapInfo').className='notice success';document.getElementById('mapInfo').innerHTML=`<b>${fmt(gj.features?.length||0)} provinsi tampil</b><br><small>Data batas dari BIG.</small>`;
  }catch(e){document.getElementById('mapInfo').className='notice danger';document.getElementById('mapInfo').textContent=`Peta belum dapat dimuat: ${e.message}`}
};
