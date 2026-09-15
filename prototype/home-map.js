(()=>{
  const palette=['#19b66d','#f4c21e','#ff7a22','#ed3346','#61c44b','#18aee8','#8bce43','#ff9b21'];
  const GEO='https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json';
  const light=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:12,attribution:'© OpenStreetMap'});
  const satellite=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:18,attribution:'Tiles © Esri'});
  function ready(){
    const host=document.querySelector('.map-visual');
    if(!host||!window.L)return;
    host.querySelectorAll('.map-bg,.island,.map-pin').forEach(e=>e.remove());
    let el=document.getElementById('homeIndonesiaMap');
    if(!el){el=document.createElement('div');el.id='homeIndonesiaMap';host.prepend(el)}
    const map=L.map(el,{zoomControl:false,attributionControl:true,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,dragging:true,touchZoom:true,minZoom:4,maxZoom:10});
    light.addTo(map);
    L.control.zoom({position:'bottomright'}).addTo(map);
    fetch(GEO).then(r=>r.json()).then(data=>{
      const layer=L.geoJSON(data,{style:(f,i)=>({color:'#fff',weight:1,fillColor:palette[(f.properties?.cartodb_id||i||0)%palette.length],fillOpacity:.88}),onEachFeature:(f,l)=>{const p=f.properties||{};const name=p.name||p.NAME_1||p.Propinsi||p.province||'Provinsi Indonesia';l.bindTooltip(name,{sticky:true,direction:'top'});l.on({mouseover:e=>e.target.setStyle({weight:2,fillOpacity:1}),mouseout:e=>layer.resetStyle(e.target)})}}).addTo(map);
      map.fitBounds(layer.getBounds(),{padding:[7,7]});
      window.__homeMapLayer=layer;
    }).catch(()=>{
      const fallback=L.circle([ -2.5,118],[150],{opacity:0}); fallback.addTo(map); map.setView([-2.5,118],4.7);
    });
    const buttons=document.querySelectorAll('.map-switch button');
    if(buttons.length>=2){
      buttons[0].textContent='Peta';buttons[1].textContent='Satelit';
      buttons[0].onclick=()=>{buttons.forEach(b=>b.classList.remove('active'));buttons[0].classList.add('active');map.removeLayer(satellite);map.addLayer(light)};
      buttons[1].onclick=()=>{buttons.forEach(b=>b.classList.remove('active'));buttons[1].classList.add('active');map.removeLayer(light);map.addLayer(satellite)};
    }
  }
  document.addEventListener('DOMContentLoaded',ready);
  window.addEventListener('load',()=>setTimeout(ready,250));
})();
