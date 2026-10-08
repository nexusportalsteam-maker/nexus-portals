/* Nexus site. Fill these two lines from Supabase > Project Settings > API. */
const SUPABASE_URL='https://YOUR-PROJECT.supabase.co';
const SUPABASE_KEY='YOUR-PUBLISHABLE-KEY';

const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready=!SUPABASE_URL.includes('YOUR-')&&window.supabase;
const sb=ready?supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
$('#yr').textContent=new Date().getFullYear();

/* ---------- public content ---------- */
const DEMO=[{title:'Bloom Café',tag:'Website',description:'Menu, gallery and table enquiries for a local café.'},{title:'FleetTrack',tag:'Web app',description:'Live dashboard for a small delivery fleet.'},{title:'GymPass',tag:'Mobile app',description:'Installable booking app with an offline timetable.'}];
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0)*7,0)%360;
function showProjects(l){$('#projects').innerHTML=l.map(p=>`<article class="card">${p.image_url?`<img loading="lazy" src="${esc(p.image_url)}" alt="${esc(p.title)}">`:`<div class="ph" style="--h:${hue(p.title)}">${esc(p.title[0])}</div>`}<div class="b"><small>${esc(p.tag)}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener">View project</a>`:''}</div></article>`).join('')}
const CK={email:'Email',phone:'Phone',whatsapp:'WhatsApp',linkedin:'LinkedIn',github:'GitHub',instagram:'Instagram'};
function href(k,v){return k==='email'?'mailto:'+v:k==='phone'?'tel:'+v:k==='whatsapp'?'https://wa.me/'+v.replace(/\D/g,''):/^https?:/.test(v)?v:'https://'+v}
let S={};
function showContacts(s){S=s;const r=Object.keys(CK).filter(k=>s[k]).map(k=>`<li>${CK[k]}: <a href="${esc(href(k,s[k]))}" target="_blank" rel="noopener">${esc(s[k])}</a></li>`);$('#cl').innerHTML=r.join('')||'<li>Use the form and we will reply by email.</li>'}
async function load(){
 showProjects(DEMO);showContacts({});if(!sb)return;
 const [p,s]=await Promise.all([sb.from('projects').select('*').eq('visible',true).order('created_at',{ascending:false}),sb.from('settings').select('*')]);
 if(p.data&&p.data.length)showProjects(p.data);
 if(s.data)showContacts(Object.fromEntries(s.data.map(r=>[r.key,r.value])));
}
load();
async function sendLead(row,st,form,ok){
 if(!sb){location.href=`mailto:?subject=Nexus enquiry&body=${encodeURIComponent(row.message)}`;return}
 st.textContent='Sending…';const {error}=await sb.from('leads').insert(row);
 if(error){st.textContent='Could not send. Please try again or use the contact details.';return}
 form.reset();st.textContent=ok;
}
$('#cf').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);sendLead({name:f.get('name').trim(),email:f.get('email').trim(),message:f.get('message').trim()},$('#cs'),e.target,'Message sent. We will reply soon.')};

/* ---------- price estimator ---------- */
const cfg=$('#cfg');let shown=0,raf;
function est(){
 const t=$('[name=t]:checked',cfg),fs=$$('[name=f]:checked',cfg),w=+$('[name=w]',cfg).value;
 let n=+t.dataset.p+fs.reduce((a,f)=>a+ +f.dataset.p,0);n=Math.round(n*(w<4?1.25:w>8?.9:1)/10)*10;
 $('#wk').textContent=w+' weeks';$('#tm').textContent=w<4?'Rush delivery adds 25%':w>8?'Relaxed timeline saves 10%':'Standard timeline';
 cancelAnimationFrame(raf);const a=shown,s=performance.now();
 (function f(x){const k=Math.min(1,(x-s)/450);shown=Math.round(a+(n-a)*(1-Math.pow(1-k,3)));$('#pr').textContent='$'+shown.toLocaleString();if(k<1)raf=requestAnimationFrame(f)})(s);
 return `${t.value}${fs.length?' with '+fs.map(f=>f.value).join(', '):''}. ${w} weeks. About $${n.toLocaleString()}.`;
}
cfg.addEventListener('input',est);est();
cfg.onsubmit=e=>{e.preventDefault();const f=new FormData(cfg);sendLead({name:f.get('name').trim(),email:f.get('email').trim(),message:'Project brief: '+est()},$('#ps'),cfg,'Brief sent. We will reply with next steps.')};

/* ---------- command menu (Ctrl/Cmd + K) ---------- */
const cmd=$('#cmd'),cin=$('#cin'),cls=$('#cls');let items=[],ix=0;
const go=s=>{cmd.close();$(s).scrollIntoView({behavior:'smooth'})};
const ACT=[['Price a project',()=>go('#top')],['Services',()=>go('#services')],['Our work',()=>go('#work')],['How a project runs',()=>go('#process')],['Contact us',()=>go('#contact')],['Copy our email',()=>{cmd.close();S.email&&navigator.clipboard.writeText(S.email)}],['Admin sign in',()=>{cmd.close();openAdmin()}]];
function draw(){const q=cin.value.toLowerCase();items=ACT.filter(a=>a[0].toLowerCase().includes(q));ix=Math.min(ix,Math.max(0,items.length-1));cls.innerHTML=items.map((a,i)=>`<li class="${i===ix?'on':''}" data-i="${i}">${a[0]}</li>`).join('')||'<li>No match</li>'}
function openCmd(){cin.value='';ix=0;draw();cmd.showModal();cin.focus()}
cin.oninput=()=>{ix=0;draw()};
cin.onkeydown=e=>{const n=items.length||1;if(e.key==='ArrowDown'){ix=(ix+1)%n;draw();e.preventDefault()}else if(e.key==='ArrowUp'){ix=(ix-1+n)%n;draw();e.preventDefault()}else if(e.key==='Enter'&&items[ix])items[ix][1]()};
cls.onclick=e=>{const l=e.target.closest('li[data-i]');if(l)items[l.dataset.i][1]()};
cmd.onclick=e=>{if(e.target===cmd)cmd.close()};
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmd()}});
$('#kb').onclick=openCmd;

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
