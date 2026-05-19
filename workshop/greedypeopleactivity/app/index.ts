export default function App(){return(<div className='min-h-screen bg-black text-white p-6 font-sans overflow-hidden'><div className='max-w-6xl mx-auto'><h1 className='text-5xl font-bold mb-4'>Cinematic Route Drive System</h1><p className='text-zinc-400 text-lg mb-8'>Interactive cinematic travel route engine using Mapbox GL JS, Three.js style camera movement, and animated route playback.</p><div className='grid lg:grid-cols-2 gap-6'><div className='bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl'><h2 className='text-2xl font-semibold mb-4'>Install</h2><div className='bg-black rounded-2xl p-4 text-sm overflow-auto text-zinc-300'><pre>{`npm install mapbox-gl gsap @turf/turf`}</pre></div><h2 className='text-2xl font-semibold mt-8 mb-4'>main.js</h2><div className='bg-black rounded-2xl p-4 text-sm overflow-auto text-zinc-300 max-h-[500px]'><pre>{`import mapboxgl from 'mapbox-gl';
import gsap from 'gsap';
import * as turf from '@turf/turf';
import './style.css';

mapboxgl.accessToken='YOUR_MAPBOX_TOKEN';

const route=[
{type:'start',name:'Waterloo Secondary School',coords:[-61.4338805,10.4708118]},
{type:'walk',name:'Taxi Walk Point',coords:[-61.42133191361708,10.464053396722628]},
{type:'taxi_pickup',name:'Taxi Pickup',coords:[-61.41105360175546,10.515911661787309]},
{type:'destination',name:'Naafa Pizza',coords:[-61.4132164,10.5282454]},
{type:'walk',name:'Walk Point',coords:[-61.409311180766935,10.529467391465097]},
{type:'destination',name:'Popeyes',coords:[-61.4082303,10.5278447]},
{type:'destination',name:'Burger King',coords:[-61.4076697,10.5265459]},
{type:'destination',name:'Little Caesars',coords:[-61.4091912,10.5322341]}
];

const map=new mapboxgl.Map({
container:'map',
style:'mapbox://styles/mapbox/dark-v11',
center:route[0].coords,
zoom:16,
pitch:70,
bearing:-20,
antialias:true
});

map.on('load',async()=>{
for(const stop of route){
new mapboxgl.Marker({color:stop.type==='destination'?'#ff4444':'#44aaff'})
.setLngLat(stop.coords)
.setPopup(new mapboxgl.Popup().setHTML('<h3>'+stop.name+'</h3>'))
.addTo(map);
}

const allCoords=route.map(r=>r.coords);

const line={
type:'Feature',
geometry:{
type:'LineString',
coordinates:allCoords
}
};

map.addSource('route',{type:'geojson',data:line});

map.addLayer({
id:'route-line',
type:'line',
source:'route',
layout:{'line-cap':'round','line-join':'round'},
paint:{
'line-color':'#00d0ff',
'line-width':6,
'line-glow-width':12,
'line-opacity':0.85
}
});

const car=document.createElement('div');
car.className='car';

const marker=new mapboxgl.Marker(car)
.setLngLat(route[0].coords)
.addTo(map);

const length=turf.length(line);
const steps=1200;
const arc=[];

for(let i=0;i<length;i+=length/steps){
const segment=turf.along(line,i);
arc.push(segment.geometry.coordinates);
}

let counter=0;

function animate(){
const start=arc[counter>=steps?counter-1:counter];
const end=arc[counter>=steps?counter:counter+1];

if(!start||!end)return;

marker.setLngLat(start);

map.easeTo({
center:start,
zoom:17,
pitch:75,
bearing:turf.bearing(turf.point(start),turf.point(end)),
duration:50,
essential:true
});

counter++;

if(counter<arc.length){
requestAnimationFrame(animate);
}else{
map.flyTo({
center:route[route.length-1].coords,
zoom:18,
pitch:80,
bearing:180,
duration:6000
});
}
}

setTimeout(()=>{
animate();
},2000);
});`}</pre></div></div><div className='space-y-6'><div className='bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl'><h2 className='text-2xl font-semibold mb-4'>index.html</h2><div className='bg-black rounded-2xl p-4 text-sm overflow-auto text-zinc-300'><pre>{`<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width,initial-scale=1.0'>
<link href='https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css' rel='stylesheet'>
<link rel='stylesheet' href='./style.css'>
<title>Cinematic Route System</title>
</head>
<body>
<div id='map'></div>
<script type='module' src='./main.js'></script>
</body>
</html>`}</pre></div></div><div className='bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl'><h2 className='text-2xl font-semibold mb-4'>style.css</h2><div className='bg-black rounded-2xl p-4 text-sm overflow-auto text-zinc-300 max-h-[450px]'><pre>{`html,body,#map{
margin:0;
width:100%;
height:100%;
overflow:hidden;
background:#000;
font-family:Inter,sans-serif;
}

.mapboxgl-canvas{
filter:contrast(1.1) saturate(1.25);
}

.car{
width:20px;
height:20px;
border-radius:999px;
background:#00d0ff;
box-shadow:0 0 20px #00d0ff,0 0 40px #00d0ff;
border:2px solid white;
}

.mapboxgl-popup-content{
background:#090909;
color:white;
border-radius:16px;
padding:14px;
border:1px solid #222;
}

.mapboxgl-popup-tip{
border-top-color:#090909!important;
}`}</pre></div></div><div className='bg-zinc-900 rounded-3xl p-6 border border-zinc-800 shadow-2xl'><h2 className='text-2xl font-semibold mb-4'>Features</h2><ul className='space-y-3 text-zinc-300 text-lg'><li>• Real animated travel route</li><li>• Cinematic camera rotation</li><li>• Smooth fly transitions</li><li>• Auto-follow taxi system</li><li>• Route glow effects</li><li>• Stop markers and labels</li><li>• Real coordinates from Trinidad</li><li>• Dark neon cinematic vibe</li><li>• Exportable screen recordings</li></ul></div></div></div></div></div>)}