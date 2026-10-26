const SB_URL='https://gpsfsjygpfsyrnlidszi.supabase.co';
const SB_KEY='sb_publishable_AyC6ZFsuNCP06e27_CjAwA_i6eAqysR';
const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.57.4?bundle');
const sb=createClient(SB_URL,SB_KEY);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const when=s=>s?new Date(s).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}):'—';
const $=id=>document.getElementById(id);
const message=(s,error=false)=>{const el=$('message');el.className='message'+(error?' error':'');el.textContent=s;el.hidden=false;};
let admin=false,reports=[];
const statusOptions=(value)=> ['pending','reviewed','dismissed'].map(s=>`<option value="${s}" ${s===value?'selected':''}>${{pending:'Awaiting review',reviewed:'Reviewed (NOT utility-confirmed)',dismissed:'Dismiss as misleading / spam'}[s]}</option>`).join('');
function renderSignals(){
 const filter=$('status-filter').value;
 const filtered=reports.filter(r=> filter==='all'||(filter==='restored'?Boolean(r.restored_at):r.status===filter));
 $('tickets').innerHTML=filtered.length?filtered.map(r=>{
  const restored=Boolean(r.restored_at);
  return `<article class="ticket" data-id="${r.id}"><div class="row"><h3>${esc(r.incident_type)} observation · #${r.id}</h3><span class="tag">${esc(r.status)}</span></div>
  <div class="meta"><span>${esc(when(r.created_at))}</span><span>${esc(r.location_name)}</span><span>${restored?'Reporter marked restored':'No restoration update'}</span></div><p>${esc(r.description)}</p>
  <p class="context">${esc(r.display_name)} · Reports are residents' observations, never official status. Do not disclose personal information.</p>
  <form class="stack" data-submit="moderate"><label>Optional public context note (NOT a reply or repair ticket)<textarea name="note" maxlength="1500" placeholder="Example: Please check your official utility's announcements; this report is not verified.">${esc(r.admin_response||'')}</textarea></label>
  <div class="row"><label style="min-width:180px">Moderation decision <select name="status">${statusOptions(r.status)}</select></label><button class="primary" type="submit">Save moderation</button></div></form></article>`;
 }).join(''):'<div class="empty">No observations match this filter. When residents share reports they will appear here.</div>';
}
async function reload(){
 if(!admin)return;
 $('tickets').textContent='Loading local observations…';
 const {data,error}=await sb.from('community_reports').select('id,display_name,location_name,incident_type,description,created_at,status,restored_at,admin_response').order('created_at',{ascending:false}).limit(100);
 if(error){message('Could not load reports: '+error.message,true);return;}
 reports=data||[];
 $('reports-count').textContent=reports.length;
 $('pending-count').textContent=reports.filter(x=>x.status==='unverified').length;
 $('dismissed-count').textContent=reports.filter(x=>x.status==='dismissed').length;
 renderSignals();
}
document.addEventListener('click',e=>{if(e.target.closest('[data-action="reload"]'))reload();});
$('status-filter').addEventListener('change',renderSignals);
document.addEventListener('submit',async e=>{
 const form=e.target.closest('[data-submit="moderate"]');if(!form)return;e.preventDefault();if(!admin)return;
 const id=Number(form.closest('.ticket')?.dataset.id);if(!Number.isSafeInteger(id))return;
 const status=form.elements.status.value,note=form.elements.note.value.trim();
 if(!['pending','reviewed','dismissed'].includes(status)||note.length>1500||(note&&note.length<2)){message('Invalid moderation decision or note.',true);return;}
 const btn=form.querySelector('button[type=submit]');btn.disabled=true;
 const payload={status,moderation_status:status==='unverified'?'pending':status==='dismissed'?'resolved':status==='pending'?'pending':'reviewing',admin_response:note||null};
 if(status==='pending')payload.status='unverified';
 const {error}=await sb.from('community_reports').update(payload).eq('id',id);
 if(error){message('Unable to update: '+error.message,true);btn.disabled=false;return;}
 message(status==='dismissed'?'Observation dismissed and hidden from the public feed.':'Moderation saved. This is not official outage confirmation.');
 await reload();
});
async function init(){
 try{
  const {data:{session},error}=await sb.auth.getSession();if(error)throw error;
  if(session){const refresh=await sb.auth.refreshSession();if(refresh.error)throw refresh.error;}
  const auth=await sb.auth.getUser(),user=auth.data?.user;
  if(auth.error||!user||user.app_metadata?.powerguard_role!=='admin'){$('login-required').classList.remove('hide');return;}
  admin=true;$('admin-app').classList.remove('hide');await reload();
 }catch(err){message('Unable to load moderation: '+err.message,true);$('login-required').classList.remove('hide');}
}
init();
