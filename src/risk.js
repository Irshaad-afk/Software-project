/** Explainable weather hazard indicator. NOT the probability of an actual grid outage. */
export const clamp = (value, low=0, high=100) => Math.max(low, Math.min(high, Number.isFinite(Number(value)) ? Number(value) : 0));

export function stormSeverity(weatherCode) {
  const c = Number(weatherCode);
  if ([95,96,99].includes(c)) return 100; // Thunderstorm
  if ([82,86].includes(c)) return 80;       // Violent showers / heavy snow
  if ([65,67,75,81].includes(c)) return 60;
  if ([61,63,66,73,80].includes(c)) return 38;
  if ([51,53,55,56,57,71,77,85].includes(c)) return 18;
  return 0;
}

export function scoreWeather({gust=0, rain=0, rainProbability=0, weatherCode=0}={}) {
  const wind = clamp((Number(gust || 0) - 20) / 70 * 100);
  const precipitation = clamp((Number(rain || 0) / 12) * 75 + clamp(rainProbability)*.25);
  const storm = stormSeverity(weatherCode);
  const score = Math.round(clamp(.4*wind + .35*precipitation + .25*storm));
  const band = score >= 65 ? 'high' : score >= 35 ? 'moderate' : 'low';
  return {score, band, parts:{wind:Math.round(wind),precipitation:Math.round(precipitation),storm}};
}

export function analyzeForecast(weather) {
  const hours = weather?.hourly;
  if (!hours || !Array.isArray(hours.time) || !hours.time.length) return null;
  const now = weather.current?.time || hours.time[0];
  let start = hours.time.findIndex(t => t >= now.slice(0,13));
  if(start < 0) start = 0;
  const points = hours.time.slice(start,start+24).map((time,offset)=>{
    const i=start+offset;
    const gust=Number(hours.wind_gusts_10m?.[i] ?? 0);
    const rain=Number(hours.precipitation?.[i] ?? 0);
    const rainProbability=Number(hours.precipitation_probability?.[i] ?? 0);
    const weatherCode=Number(hours.weather_code?.[i] ?? 0);
    return {time,gust,rain,rainProbability,weatherCode,temp:Number(hours.temperature_2m?.[i] ?? 0),...scoreWeather({gust,rain,rainProbability,weatherCode})};
  });
  if(!points.length) return null;
  const next12=points.slice(0,12);
  const peak=next12.reduce((a,b)=>b.score>a.score?b:a,next12[0]);
  return {points,peak,score:peak.score,band:peak.band,
    maxGust:Math.round(Math.max(...points.map(p=>p.gust))),
    maxRainProb:Math.round(Math.max(...points.map(p=>p.rainProbability))),
    totalRain:Math.round(points.reduce((n,p)=>n+p.rain,0)*10)/10};
}

export function formatHour(iso) {
  if(!iso || iso.length<16) return '—';
  const hour=Number(iso.slice(11,13));
  return `${hour%12 || 12}${hour>=12?' PM':' AM'}`;
}

export function riskLabel(band){ return ({high:'Elevated weather risk',moderate:'Moderate weather risk',low:'Low weather risk'})[band] || 'Risk unavailable'; }
