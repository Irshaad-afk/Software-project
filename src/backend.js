const cfg=()=>window.POWERGUARD_CONFIG || {};
const store=(key,def)=>{try{return JSON.parse(localStorage.getItem(key))??def}catch{return def}};
const save=(key,obj)=>localStorage.setItem(key,JSON.stringify(obj));
let clientPromise=null;
let localNodeServer=false;
/** Detect our no-dependency Node + SQLite backend, if this page is hosted by it. */
export async function detectNodeServer(){
  try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),1600);
    try{const response=await fetch('/api/health',{cache:'no-store',signal:controller.signal});const data=await response.json();localNodeServer=Boolean(response.ok&&data.ok&&data.auth==='node-sqlite');}
    finally{clearTimeout(timer)}
  }catch{localNodeServer=false}
  return localNodeServer;
}
export const isServerEnabled=()=>localNodeServer;
export const isOnlineAuthEnabled=()=>localNodeServer||isCloudEnabled();
async function api(url,options={}){
  const response=await fetch(url,{...options,credentials:'same-origin',headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(options.headers||{})}});
  let payload;try{payload=await response.json()}catch{throw Error('Invalid response from PowerGuard server')}
  if(!response.ok)throw Error(payload.error||`PowerGuard server responded ${response.status}`);
  return payload;
}
export const isCloudEnabled=()=>Boolean(cfg().supabaseUrl && cfg().supabaseAnonKey);
async function client(){
  if(!isCloudEnabled())return null;
  if(!clientPromise)clientPromise=import('https://esm.sh/@supabase/supabase-js@2.57.4?bundle')
    .then(m=>m.createClient(cfg().supabaseUrl,cfg().supabaseAnonKey));
  return clientPromise;
}
const demouser={id:'local-demo',email:'demo@powerguard.local',user_metadata:{display_name:'Demo Explorer'},isDemo:true};
export async function sessionUser(){
  if(localNodeServer){const data=await api('/api/auth/me');return data.user|| (store('pg:demo',false)?demouser:null)}
  if(!isCloudEnabled())return store('pg:demo',false)?demouser:null;
  const sb=await client();const {data,error}=await sb.auth.getUser();if(error)return null;
  return data.user;
}
export async function signIn(email,password){
  if(localNodeServer){const data=await api('/api/auth/signin',{method:'POST',body:JSON.stringify({email,password})});localStorage.removeItem('pg:demo');return data.user}
  const sb=await client();if(!sb)throw Error('Online authentication is not configured. Use demo access.');
  const {data,error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;
  return data.user;
}
export async function signUp(email,password,name){
  if(localNodeServer){const data=await api('/api/auth/signup',{method:'POST',body:JSON.stringify({email,password,name})});localStorage.removeItem('pg:demo');return data}
  const sb=await client();if(!sb)throw Error('Online authentication is not configured. Use demo access.');
  const {data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:name}}});if(error)throw error;
  return data;
}
export async function signOut(){
  if(localNodeServer){await api('/api/auth/logout',{method:'POST'});localStorage.removeItem('pg:demo');return}
  if(!isCloudEnabled()){localStorage.removeItem('pg:demo');return;}
  const sb=await client();const {error}=await sb.auth.signOut();if(error)throw error;
}
export function demoSignIn(){save('pg:demo',true);return demouser;}
export async function listReports(){
  if(localNodeServer){const data=await api('/api/reports');return [...(store('pg:demo',false)?store('pg:reports',[]):[]),...data.reports]}
  if(!isCloudEnabled())return store('pg:reports',[]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  const sb=await client();const {data,error}=await sb.from('community_reports').select('id,user_id,display_name,location_key,location_name,incident_type,description,observed_at,created_at,status,restored_at,moderation_status,admin_response').order('created_at',{ascending:false}).limit(70);if(error)throw error;
  return [...(store('pg:demo',false)?store('pg:reports',[]):[]),...(data||[])];
}
export async function addReport(user,fields){
  if(!user)throw Error('Sign in to submit a report.');
  const input={user_id:user.id,display_name:String(fields.display_name||'Community member').slice(0,60),location_key:fields.location_key,location_name:fields.location_name,
    incident_type:fields.incident_type,description:fields.description.trim(),observed_at:new Date().toISOString(),status:'unverified'};
  if(user.isDemo){const item={...input,id:Date.now(),created_at:new Date().toISOString(),isDemo:true};save('pg:reports',[item,...store('pg:reports',[])]);return item;}
  if(localNodeServer){const data=await api('/api/reports',{method:'POST',body:JSON.stringify(input)});return data.report}
  const sb=await client();const {data,error}=await sb.from('community_reports').insert(input).select().single();if(error)throw error;return data;
}
export async function addFeedback(user,fields){
  if(!user)throw Error('Sign in to send feedback.');
  const input={user_id:user.id,category:fields.category,message:fields.message.trim()};
  if(user.isDemo){save('pg:feedback',[{...input,created_at:new Date().toISOString()},...store('pg:feedback',[])]);return;}
  if(localNodeServer){await api('/api/feedback',{method:'POST',body:JSON.stringify(input)});return}
  const sb=await client();const {error}=await sb.from('feedback').insert(input);if(error)throw error;
}
export function getPreferences(){return store('pg:prefs',{student:true,remote:false,pump:false,medical:false})}
export function savePreferences(v){save('pg:prefs',v)}
export function checklistKey(loc){return `pg:checklist:${loc.name.toLowerCase().replace(/[^a-z0-9]/g,'')}`}
export function getChecklist(loc){return store(checklistKey(loc),[])}
export function saveChecklist(loc,v){save(checklistKey(loc),v)}
export function saveLocation(loc){save('pg:location',loc)}
export function getSavedLocation(){return store('pg:location',null)}

/** Reporter can note electricity restoration; no claim of official confirmation. */
export async function markRestored(user,id){
 if(!user)throw Error('Sign in to update your observation.');
 const restored_at=new Date().toISOString();
 if(user.isDemo){
  const rows=store('pg:reports',[]);const record=rows.find(r=>String(r.id)===String(id)&&r.user_id===user.id&&r.incident_type==='outage'&&!r.restored_at);
  if(!record)throw Error('This observation cannot be updated.');
  record.restored_at=restored_at;save('pg:reports',rows);return record;
 }
 if(localNodeServer)throw Error('Restoration updates require the Supabase cloud version.');
 const sb=await client();
 const {data,error}=await sb.from('community_reports').update({restored_at}).eq('id',id).eq('user_id',user.id).is('restored_at',null).eq('incident_type','outage').select('id,restored_at').single();
 if(error)throw error;
 return data;
}
