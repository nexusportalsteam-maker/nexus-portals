/* Nexus site. Fill these two lines from Supabase > Project Settings > API. */
const SUPABASE_URL='https://YOUR-PROJECT.supabase.co';
const SUPABASE_KEY='YOUR-PUBLISHABLE-KEY';

const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready=!SUPABASE_URL.includes('YOUR-')&&window.supabase;
const sb=ready?supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
$('#yr').textContent=new Date().getFullYear();

/* ---------- public content ---------- */
const DEMO=[
 {title:'Bloom Café',tag:'Website',description:'Menu, gallery and table enquiries for a local café.'},
 {title:'FleetTrack',tag:'Web app',description:'Live dashboard for a small delivery fleet.'},
 {title:'GymPass',tag:'Mobile app',description:'Installable booking app with offline class timetable.'}];
function showProjects(list){
 $('#projects').innerHTML=list.map(p=>`<article class="card">${p.image_url?`<img loading="lazy" src="${esc(p.image_url)}" alt="${esc(p.title)}">`:`<div class="ph">${esc(p.tag||'PROJECT')}</div>`}<div class="b"><small>${esc(p.tag)}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener">View project</a>`:''}</div></article>`).join('');
}
const CK={email:'Email',phone:'Phone',whatsapp:'WhatsApp',linkedin:'LinkedIn',github:'GitHub',instagram:'Instagram'};
function href(k,v){return k==='email'?'mailto:'+v:k==='phone'?'tel:'+v:k==='whatsapp'?'https://wa.me/'+v.replace(/\D/g,''):/^https?:/.test(v)?v:'https://'+v}
function showContacts(s){
 const rows=Object.keys(CK).filter(k=>s[k]).map(k=>`<li>${CK[k]}: <a href="${esc(href(k,s[k]))}" target="_blank" rel="noopener">${esc(s[k])}</a></li>`);
 $('#cl').innerHTML=rows.join('')||'<li>Use the form and we will reply by email.</li>';
}
async function load(){
 showProjects(DEMO);showContacts({});
 if(!sb)return;
 const [p,s]=await Promise.all([sb.from('projects').select('*').eq('visible',true).order('created_at',{ascending:false}),sb.from('settings').select('*')]);
 if(p.data&&p.data.length)showProjects(p.data);
 if(s.data)showContacts(Object.fromEntries(s.data.map(r=>[r.key,r.value])));
}
load();

$('#cf').onsubmit=async e=>{
 e.preventDefault();const f=e.target,st=$('#cs'),d={name:f.name.value.trim(),email:f.email.value.trim(),message:f.message.value.trim()};
 if(!sb){location.href=`mailto:?subject=Nexus enquiry&body=${encodeURIComponent(d.message)}`;return}
 st.textContent='Sending…';
 const {error}=await sb.from('leads').insert(d);
 if(error){st.textContent='Could not send. Please try again or use the contact details.';return}
 f.reset();st.textContent='Message sent. We will reply soon.';talk('sent',5000);fx('party',2500);
};

/* ---------- Isuru the mascot ---------- */
const P=$('#pal'),M=$('#mascot'),say=$('#say');let sT,iT;
const h=new Date().getHours();
const mood=h>=5&&h<12?'morning':h>=12&&h<17?'day':h>=17&&h<21?'tea':'night';
P.classList.add('m-'+mood);
const L={
 morning:['Morning! Fresh code, fresh start. Nice.','Isuru here. Ready to build something. Nice.','Good morning! Tail is wagging, deploys are green.'],
 day:['Deep focus mode. Ask me anything. Nice.','Typing fast. Barking later.','Another bug fixed. Nice.'],
 tea:['Tea time. The best debugger. Nice.','One sip, one commit. Nice.','Evening! Biscuit-driven development.'],
 night:['Zzz… still compiling dreams…','Late shift. Even my semicolons yawn.','Shh… the servers are sleeping.'],
 click:['Nice!','Nice. Very nice.','Woof! I mean, 200 OK.','Careful, the spectacles are new.','Isuru approves. Nice.','Hello, human. Nice to meet you.'],
 svc:['Nice choice!','Ooh, I built one of these. Nice.','Good taste. Nice.'],
 proj:['Nice work, right?','We shipped that. Nice.'],
 type:['Go on, I am listening…','Tell me everything. Nice.','Big idea? Nice.'],
 sent:['Message sent! Nice. We will reply soon.','Nice!! Isuru approved.'],
 idle:['*yawn* Still here? Take your time. Nice.','Psst, the contact form is lonely.'],
 hide:['Okay, I will be quiet. Nice meeting you.']};
const pick=a=>a[Math.random()*a.length|0];
function talk(k,ms=3800){say.textContent=pick(L[k]);say.classList.add('on');clearTimeout(sT);sT=setTimeout(()=>say.classList.remove('on'),ms)}
function fx(c,ms=1200){M.classList.add(c);setTimeout(()=>M.classList.remove(c),ms)}
function wake(){clearTimeout(iT);iT=setTimeout(()=>{fx('yawn',2600);talk('idle');wake()},30000)}
addEventListener('pointermove',e=>{
 wake();const r=P.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height*.3),d=Math.hypot(dx,dy)||1,k=Math.min(3,d/60);
 $$('.p').forEach(p=>p.style.transform=`translate(${(M.classList.contains('fl')?-1:1)*dx/d*k}px,${dy/d*k}px)`);
});
addEventListener('keydown',wake);addEventListener('scroll',wake,{passive:true});
P.onclick=()=>{talk('click');fx('bounce',600)};
document.addEventListener('mouseover',e=>{
 const s=e.target.closest('.svc,.card');if(!s||s.dataset.seen)return;s.dataset.seen=1;setTimeout(()=>delete s.dataset.seen,6000);
 talk(s.classList.contains('svc')?'svc':'proj');fx('push',1400);
});
$('#cf').addEventListener('focusin',()=>{M.classList.add('tilt');if(!M.dataset.t){M.dataset.t=1;talk('type')}});
$('#cf').addEventListener('focusout',()=>M.classList.remove('tilt'));
$('#hide').onclick=()=>{const m=M.classList.toggle('min');if(m)talk('hide');try{localStorage.setItem('iso-min',m?1:'')}catch(x){}};
try{if(localStorage.getItem('iso-min'))M.classList.add('min')}catch(x){}
setTimeout(()=>{if(!M.classList.contains('min'))talk(mood,4500)},1500);wake();

/* ---------- admin (open with /#admin, one account only) ---------- */
const dlg=$('#adm');
function closeAdmin(){dlg.close();history.replaceState(null,'',location.pathname)}
async function openAdmin(){
 if(!sb){alert('Add your Supabase URL and key at the top of app.js first.');return}
 dlg.showModal();const {data}=await sb.auth.getSession();data.session?panel():login();
}
function login(){
 dlg.innerHTML=`<form id="lf" class="af"><h3>Admin sign in</h3><input name="e" type="email" placeholder="Email" required autocomplete="username"><input name="p" type="password" placeholder="Password" required autocomplete="current-password"><button class="btn">Sign in</button><p id="le"></p><button type="button" class="lnk" id="ax">Close</button></form>`;
 $('#lf').onsubmit=async e=>{e.preventDefault();const f=e.target,{error}=await sb.auth.signInWithPassword({email:f.e.value,password:f.p.value});error?$('#le').textContent=error.message:panel()};
 $('#ax').onclick=closeAdmin;
}
function panel(){
 dlg.innerHTML=`<div class="ah"><b>Nexus admin</b><span><button class="lnk" id="lo">Sign out</button> <button class="lnk" id="ax">Close</button></span></div><div class="tabs"><button data-t="P">Projects</button><button data-t="C">Contact</button><button data-t="L">Leads</button></div><div id="tb"></div>`;
 $('#ax').onclick=closeAdmin;$('#lo').onclick=async()=>{await sb.auth.signOut();login()};
 $$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.toggle('on',x===b));({P:tabP,C:tabC,L:tabL})[b.dataset.t]()});
 $('.tabs button').click();
}
async function tabP(){
 const {data}=await sb.from('projects').select('*').order('created_at',{ascending:false}),list=data||[];
 $('#tb').innerHTML=`<form id="pf" class="af"><input type="hidden" name="id"><input name="title" placeholder="Title" required><input name="tag" placeholder="Tag, e.g. Web app"><input name="link" placeholder="Live link (optional)"><textarea name="description" rows="3" placeholder="Short description"></textarea><input name="img" type="file" accept="image/*"><label><input type="checkbox" name="visible" checked> Visible on site</label><button class="btn">Save project</button><p id="pe"></p></form>`+list.map(p=>`<div class="row" data-id="${p.id}"><span>${esc(p.title)} ${p.visible?'':'(hidden)'}</span><span><button data-a="ed">Edit</button><button data-a="vis">${p.visible?'Hide':'Show'}</button><button data-a="del">Delete</button></span></div>`).join('');
 const f=$('#pf');
 f.onsubmit=async e=>{
  e.preventDefault();const pe=$('#pe');pe.textContent='Saving…';
  const row={title:f.title.value,tag:f.tag.value,link:f.link.value,description:f.description.value,visible:f.visible.checked};
  const file=f.img.files[0];
  if(file){const path=Date.now()+'-'+file.name.replace(/[^\w.]/g,'_'),up=await sb.storage.from('projects').upload(path,file);
   if(up.error){pe.textContent=up.error.message;return}row.image_url=sb.storage.from('projects').getPublicUrl(path).data.publicUrl}
  const r=f.id.value?await sb.from('projects').update(row).eq('id',f.id.value):await sb.from('projects').insert(row);
  r.error?pe.textContent=r.error.message:tabP();
 };
 $$('.row button').forEach(b=>b.onclick=async()=>{
  const id=b.closest('.row').dataset.id,p=list.find(x=>x.id===id),a=b.dataset.a;
  if(a==='ed'){['id','title','tag','link','description'].forEach(k=>f[k].value=p[k]||'');f.visible.checked=p.visible;f.scrollIntoView()}
  if(a==='vis'){await sb.from('projects').update({visible:!p.visible}).eq('id',id);tabP()}
  if(a==='del'&&confirm('Delete "'+p.title+'"?')){await sb.from('projects').delete().eq('id',id);tabP()}
 });
}
async function tabC(){
 const {data}=await sb.from('settings').select('*'),s=Object.fromEntries((data||[]).map(r=>[r.key,r.value]));
 $('#tb').innerHTML=`<form id="sf" class="af">${Object.keys(CK).map(k=>`<label>${CK[k]}<input name="${k}" value="${esc(s[k]||'')}"></label>`).join('')}<button class="btn">Save contact details</button><p id="se"></p></form>`;
 $('#sf').onsubmit=async e=>{e.preventDefault();const f=e.target,rows=Object.keys(CK).map(k=>({key:k,value:f[k].value.trim()})),r=await sb.from('settings').upsert(rows);$('#se').textContent=r.error?r.error.message:'Saved. The site is updated.';load()};
}
async function tabL(){
 const {data,error}=await sb.from('leads').select('*').order('created_at',{ascending:false});
 $('#tb').innerHTML=error?esc(error.message):(data.length?data.map(l=>`<div class="lead-i" data-id="${l.id}"><b>${esc(l.name)}</b> <a href="mailto:${esc(l.email)}">${esc(l.email)}</a><br><small>${new Date(l.created_at).toLocaleString()}</small><p>${esc(l.message)}</p><button class="lnk">Delete</button></div>`).join(''):'<p>No messages yet.</p>');
 $$('.lead-i button').forEach(b=>b.onclick=async()=>{await sb.from('leads').delete().eq('id',b.parentNode.dataset.id);tabL()});
}
if(location.hash==='#admin')openAdmin();
addEventListener('hashchange',()=>{if(location.hash==='#admin')openAdmin()});

/* ---------- v2: spotlight cards + Isuru walks ---------- */
document.addEventListener('pointermove',e=>{const c=e.target.closest('.svc,.card,.step');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}});
L.walk=['Just stretching my legs. Nice.','Patrolling the footer. Nice.','Walking meeting. Very productive.','Off to review some pull requests.'];
M.style.left=Math.max(0,innerWidth-M.offsetWidth-24)+'px';
(function stroll(){
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 setTimeout(()=>{
  if(M.classList.contains('min')||document.hidden||M.classList.contains('walk')){stroll();return}
  const w=M.offsetWidth,lo=Math.max(0,100-w/2),hi=innerWidth-w-lo,cur=parseFloat(M.style.left)||0,x=lo+Math.random()*(hi-lo),dist=Math.abs(x-cur);
  if(dist<120){stroll();return}
  M.classList.toggle('fl',x>cur);
  const dur=dist/(mood==='night'?40:mood==='morning'?110:70);
  M.style.transitionDuration=dur+'s';M.classList.add('walk');M.style.left=x+'px';
  if(Math.random()<.6)talk('walk',2800);
  setTimeout(()=>{M.classList.remove('walk');stroll()},dur*1000);
 },5000+Math.random()*6000);
})();
