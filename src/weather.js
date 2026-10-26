import {analyzeForecast} from './risk.js';
export const CITIES = [
  {name:'Chennai',admin1:'Tamil Nadu',country:'India',latitude:13.0827,longitude:80.2707},
  {name:'Bengaluru',admin1:'Karnataka',country:'India',latitude:12.9716,longitude:77.5946},
  {name:'Coimbatore',admin1:'Tamil Nadu',country:'India',latitude:11.0168,longitude:76.9558},
  {name:'Mumbai',admin1:'Maharashtra',country:'India',latitude:19.076,longitude:72.8777},
  {name:'Hyderabad',admin1:'Telangana',country:'India',latitude:17.385,longitude:78.4867},
  {name:'Delhi',admin1:'Delhi',country:'India',latitude:28.6139,longitude:77.209},
  {name:'Madurai',admin1:'Tamil Nadu',country:'India',latitude:9.9252,longitude:78.1198},
  {name:'Kochi',admin1:'Kerala',country:'India',latitude:9.9312,longitude:76.2673},
];
async function json(url,timeout=10500){
  const controller = new AbortController();const id=setTimeout(()=>controller.abort(),timeout);
  try{const r=await fetch(url,{signal:controller.signal,headers:{'Accept':'application/json'}});if(!r.ok)throw new Error(`Weather service HTTP ${r.status}`);return await r.json();}
  finally{clearTimeout(id);}
}
export async function searchCities(query){
  if(query.trim().length<2)return [];
  const results=await json(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=7&language=en&format=json`);
  return (results.results||[]).map(({name,admin1,country,latitude,longitude,id})=>({name,admin1,country,latitude,longitude,id}));
}
export async function loadWeather(location){
  const query = new URLSearchParams({latitude:String(location.latitude),longitude:String(location.longitude),
    current:'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m',
    hourly:'temperature_2m,precipitation_probability,precipitation,wind_gusts_10m,weather_code',
    forecast_days:'3',timezone:'auto'});
  const data=await json(`https://api.open-meteo.com/v1/forecast?${query}`);
  if(!data.current || !data.hourly || !data.hourly.time)throw new Error('Incomplete weather service response');
  return {data,analysis:analyzeForecast(data),source:'live'};
}
/** Offline fixture visibly marked SAMPLE: never present as a real forecast. */
export function sampleWeather(){
  const day=new Date(); day.setMinutes(0,0,0);
  const time=Array.from({length:48},(_,i)=>{const d=new Date(day.getTime()+i*3600000);const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),da=String(d.getDate()).padStart(2,'0'),h=String(d.getHours()).padStart(2,'0');return `${y}-${m}-${da}T${h}:00`;});
  const val=(i)=>Math.max(0,Math.round(40+26*Math.sin((i-4)/4)+9*Math.cos(i/2)));
  const data={current:{time:time[0],temperature_2m:29,relative_humidity_2m:84,precipitation:1.6,weather_code:95,wind_speed_10m:22,wind_gusts_10m:51},hourly:{
    time,temperature_2m:time.map((_,i)=>Math.round(27+3*Math.sin(i/5))),
    precipitation_probability:time.map((_,i)=>Math.min(98,Math.max(4,val(i)))),
    precipitation:time.map((_,i)=>Math.max(0,Math.round((2.3+3*Math.sin(i/4))*10)/10)),
    wind_gusts_10m:time.map((_,i)=>Math.max(12,Math.round(39+17*Math.sin((i+1)/4)))),
    weather_code:time.map((_,i)=>i%8<3?95:i%8<6?63:3)
  }};
  return {data,analysis:analyzeForecast(data),source:'sample'};
}
