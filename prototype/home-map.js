(()=>{
  const palette=['#2bb673','#f6c21c','#ff7b2b','#ed3346','#65c84a','#20aee7','#8bcf43','#ff9e21'];
  const GEO='https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json';
  const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Tiles © Esri'});
  function ready(){
    const host=document.querySelector('.map-visual');
    if(!host||!window.L||document.getElementById('homeIndonesiaMap')?._leaflet_id)return;
    host.querySelectorAll('.map-bg,.island,.map-pin').forEach(e=>e.remove());
    const el=document.getElementById('homeIndonesiaMap')||Object.assign(document.createElement('div'),{id:'homeIndonesiaMap'});
    if(!el.parentNode)host.prepend(el);
    const map=L.map(el,{zoomControl:false,attributionControl:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:true,dragging:true,touchZoom:true,minZoom:3.8,maxZoom:7.2,zoomSnap:.1,zoomDelta:.5});
    map.setView([-2.5,118],4.45);
    L.control.zoom({position:'bottomright'}).addTo(map);
    const base=L.layerGroup().addTo(map);
    fetch(GEO).then(r=>r.json()).then(data=>{
      const layer=L.geoJSON(data,{style:(f,i)=>({color:'rgba(255,255,255,.92)',weight:1.1,fillColor:palette[(Number(f.properties?.cartodb_id)||i||0)%palette.length],fillOpacity:.92}),onEachFeature:(f,l)=>{const p=f.properties||{};const name=p.name||p.NAME_1||p.Propinsi||p.province||'Provinsi Indonesia';l.bindTooltip(name,{sticky:true,direction:'top',className:'ipm-map-tooltip'});l.on({mouseover:e=>e.target.setStyle({weight:2,fillOpacity:1}),mouseout:e=>layer.resetStyle(e.target),click:e=>{const n=e.target.feature?.properties?.name||e.target.feature?.properties?.NAME_1||name;const tip=host.closest('.map-card')?.querySelector('.map-tooltip');if(tip)tip.innerHTML='<b>'+n+'</b><br><small>Membuka masalah dan laporan warga di wilayah ini…</small>';if(typeof window.openPublicRegion==='function')window.openPublicRegion(n)}})} }).addTo(base);
      window.__homeMapLayer=layer;
      map.fitBounds(layer.getBounds(),{padding:[8,8]});
    }).catch(()=>{});
    const buttons=host.parentElement.querySelectorAll('.map-switch button');
    if(buttons.length>=2){
      buttons[0].textContent='Peta';buttons[1].textContent='Satelit';
      buttons[0].onclick=()=>{buttons.forEach(b=>b.classList.remove('active'));buttons[0].classList.add('active');if(map.hasLayer(satellite))map.removeLayer(satellite);if(!map.hasLayer(base))base.addTo(map)};
      buttons[1].onclick=()=>{buttons.forEach(b=>b.classList.remove('active'));buttons[1].classList.add('active');if(map.hasLayer(base))map.removeLayer(base);if(!map.hasLayer(satellite))satellite.addTo(map)};
    }
  }
  document.addEventListener('DOMContentLoaded',ready);
  window.addEventListener('load',()=>setTimeout(ready,300));
})();
