/* Nexus site. Fill these two lines from Supabase > Project Settings > API. */
const SUPABASE_URL='https://YOUR-PROJECT.supabase.co';
const SUPABASE_KEY='YOUR-PUBLISHABLE-KEY';

const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready=!SUPABASE_URL.includes('YOUR-')&&window.supabase;
const sb=ready?supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
const wait=ms=>new Promise(r=>setTimeout(r,ms)),rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
$('#yr').textContent=new Date().getFullYear();

/* ---------- public content (cached, repainted after every page swap) ---------- */
const DEMO=[{title:'Bloom Café',tag:'Website',description:'Menu, gallery and table enquiries for a local café.'},{title:'FleetTrack',tag:'Web app',description:'Live dashboard for a small delivery fleet.'},{title:'GymPass',tag:'Mobile app',description:'Installable booking app with an offline timetable.'},{title:'Atlas Portal',tag:'Customer portal',description:'Clients track orders, files and invoices in one login.'},{title:'Slate Studio',tag:'Website',description:'Portfolio site the owner edits without calling us.'},{title:'Tidal',tag:'Web app',description:'Booking and capacity planner for a boat-hire company.'}];
let P=DEMO,S={},tag='';
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0)*7,0)%360;
function showProjects(){
 const el=$('#projects');if(!el)return;let l=P;const fl=$('#flt');
 if(fl){fl.innerHTML=['All',...new Set(P.map(p=>p.tag).filter(Boolean))].map(t=>`<button class="fc ${(t==='All'?'':t)===tag?'on':''}" data-t="${t==='All'?'':esc(t)}">${esc(t)}</button>`).join('');fl.onclick=e=>{const b=e.target.closest('button');if(b){tag=b.dataset.t;showProjects()}}}
 if(tag)l=l.filter(p=>p.tag===tag);if(el.dataset.limit)l=l.slice(0,+el.dataset.limit);
 el.innerHTML=l.map((p,i)=>`<article class="card" style="--i:${i}">${p.image_url?`<img loading="lazy" src="${esc(p.image_url)}" alt="${esc(p.title)}">`:`<div class="ph" style="--h:${hue(p.title)}">${esc(p.title[0])}</div>`}<div class="b"><small>${esc(p.tag)}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener">View project</a>`:''}</div></article>`).join('');
}
const CK={email:'Email',phone:'Phone',whatsapp:'WhatsApp',linkedin:'LinkedIn',github:'GitHub',instagram:'Instagram'};
function href(k,v){return k==='email'?'mailto:'+v:k==='phone'?'tel:'+v:k==='whatsapp'?'https://wa.me/'+v.replace(/\D/g,''):/^https?:/.test(v)?v:'https://'+v}
function showContacts(){const el=$('#cl');if(!el)return;const r=Object.keys(CK).filter(k=>S[k]).map(k=>`<li>${CK[k]}: <a href="${esc(href(k,S[k]))}" target="_blank" rel="noopener">${esc(S[k])}</a></li>`);el.innerHTML=r.join('')||'<li>Use the form and we will reply by email.</li>'}
const paint=()=>{showProjects();showContacts()};
async function load(){
 paint();if(!sb)return;
 const [p,s]=await Promise.all([sb.from('projects').select('*').eq('visible',true).order('created_at',{ascending:false}),sb.from('settings').select('*')]);
 if(p.data&&p.data.length)P=p.data;
 if(s.data)S=Object.fromEntries(s.data.map(r=>[r.key,r.value]));
 paint();
}
async function sendLead(row,st,form,ok){
 if(!sb){location.href=`mailto:?subject=Nexus enquiry&body=${encodeURIComponent(row.message)}`;return}
 st.textContent='Sending…';const {error}=await sb.from('leads').insert(row);
 if(error){st.textContent='Could not send. Please try again or use the contact details.';return}
 form.reset();form.dispatchEvent(new Event('input',{bubbles:true}));st.textContent=ok;nex.cheer();
 if(form.id==='cfg'){form.insertAdjacentHTML('beforeend','<div class="stamp">Sent</div>');setTimeout(()=>$('.stamp',form)?.remove(),3500)}
}

/* ---------- per-page setup ---------- */
let shown=0,raf;
function coin(el,p){
 const o=el.closest('.o'),pr=$('#pr');if(!o||!pr)return;const a=o.getBoundingClientRect(),b=pr.getBoundingClientRect(),c=document.createElement('b');
 c.className='coin';c.textContent='+$'+p;c.style.cssText=`left:${a.left+a.width/2}px;top:${a.top}px`;document.body.append(c);
 c.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${b.left-a.left}px,${b.top-a.top}px) scale(.5)`,opacity:.3}],{duration:700,easing:'cubic-bezier(.5,0,.8,.5)'}).onfinish=()=>{c.remove();pr.classList.remove('bump');void pr.offsetWidth;pr.classList.add('bump')};
}
function bindForms(){
 const cf=$('#cf');
 if(cf)cf.onsubmit=e=>{e.preventDefault();const f=new FormData(cf);sendLead({name:f.get('name').trim(),email:f.get('email').trim(),message:f.get('message').trim()},$('#cs'),cf,'Message sent. We will reply soon.')};
 const cfg=$('#cfg');if(!cfg)return;shown=0;
 const usd=n=>'$'+n.toLocaleString();
 const est=()=>{
  const t=$('[name=t]:checked',cfg),fs=$$('[name=f]:checked',cfg),w=+cfg.w.value,m=w<4?1.25:w>8?.9:1;
  const n=Math.round((+t.dataset.p+fs.reduce((a,f)=>a+ +f.dataset.p,0))*m/10)*10;
  $('#wk').textContent=w+' weeks';$('#tm').textContent=w<4?'Rush delivery adds 25%':w>8?'Relaxed timeline saves 10%':'Standard timeline';
  $('#rc').innerHTML=`<li><span>${esc(t.value)}</span><span>${usd(+t.dataset.p)}</span></li>`+fs.map(f=>`<li><span>${esc(f.value)}</span><span>+${usd(+f.dataset.p)}</span></li>`).join('')+`<li><span>${w} weeks</span><span>${m===1?'standard':m>1?'+25%':'-10%'}</span></li>`;
  cancelAnimationFrame(raf);const a=shown,s=performance.now();
  (function f(x){const k=Math.min(1,(x-s)/450);shown=Math.round(a+(n-a)*(1-Math.pow(1-k,3)));$('#pr').textContent=usd(shown);if(k<1)raf=requestAnimationFrame(f)})(s);
  return `${t.value}${fs.length?' with '+fs.map(f=>f.value).join(', '):''}. ${w} weeks. About ${usd(n)}.`;
 };
 cfg.addEventListener('input',e=>{est();if(e.target.name==='w')nex.mood(+cfg.w.value);nex.advise(cfg)});
 cfg.addEventListener('change',e=>{if(e.target.name==='f'&&e.target.checked)coin(e.target,+e.target.dataset.p)});
 cfg.onsubmit=e=>{e.preventDefault();const f=new FormData(cfg);sendLead({name:f.get('name').trim(),email:f.get('email').trim(),message:'Project brief: '+est()},$('#ps'),cfg,'Quote sent. We will reply with next steps.')};
 est();
}
const rvIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');rvIO.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function pageInit(){
 const cur=location.pathname.split('/').pop()||'index.html';
 $$('.bar nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')===cur));
 paint();bindForms();$$('[data-nex]').forEach(nex.watch);
 $$('main h2,main .bento>*,main .ps li,main .svx,main .tk,main .intro').forEach(e=>{e.classList.add('rv');e.style.setProperty('--d',Math.min(3,[...e.parentNode.children].indexOf(e))*.09+'s');rvIO.observe(e)});
 if(location.hash)$(location.hash)?.scrollIntoView();
}
const boot=()=>{pageInit();nex.start();load()};

/* ---------- page router: real pages, but Nex never reloads ---------- */
async function visit(u,push=true){
 if(visit.b)return;visit.b=1;
 try{
  $('main').classList.add('leave');
  const [html]=await Promise.all([fetch(u.pathname+u.search).then(r=>{if(!r.ok)throw 0;return r.text()}),nex.exit()]);
  const d=new DOMParser().parseFromString(html,'text/html');
  document.title=d.title;$('main').replaceWith(d.querySelector('main'));
  if(push)history.pushState(null,'',u.href);
  scrollTo(0,0);pageInit();$('main').classList.add('enter');await nex.enter();
 }catch(e){location.href=u.href}
 visit.b=0;
}
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');if(!a||a.target||e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;
 const u=new URL(a.href,location.href);
 if(u.origin!==location.origin||!/(\.html|\/)$/.test(u.pathname))return;
 if(u.pathname===location.pathname){if(!u.hash){e.preventDefault();scrollTo({top:0,behavior:'smooth'})}return}
 e.preventDefault();visit(u);
});
addEventListener('popstate',()=>visit(new URL(location.href),false));

/* ---------- page effects that follow the user ---------- */
let lt=null;
addEventListener('pointermove',e=>{
 if(RM)return;
 const mx=e.clientX/innerWidth-.5,my=e.clientY/innerHeight-.5;
 $$('.fx').forEach((f,i)=>f.style.translate=`${-mx*(30+i*24)}px ${-my*(30+i*24)}px`);
 $$('.hero h1 span').forEach((s,i)=>s.style.translate=`${mx*(8+i%3*5)}px ${my*(4+i%2*5)}px`);
 $$('.btn').forEach(b=>{const r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);b.style.translate=Math.hypot(dx,dy)<90?`${dx*.18}px ${dy*.25}px`:''});
 const t=e.target.closest?.('.card,.bento>*');
 if(lt&&lt!==t){lt.style.removeProperty('--tx');lt.style.removeProperty('--ty')}lt=t;
 if(t){const r=t.getBoundingClientRect();t.style.setProperty('--ty',((e.clientX-r.left)/r.width-.5)*10+'deg');t.style.setProperty('--tx',-((e.clientY-r.top)/r.height-.5)*10+'deg')}
});
addEventListener('scroll',()=>{const b=$('.bar'),m=document.documentElement.scrollHeight-innerHeight;b.style.setProperty('--p',m>0?Math.min(1,scrollY/m):0);b.classList.toggle('st',scrollY>8)},{passive:true});
addEventListener('scroll',()=>{const r=$('.road');if(r)r.style.setProperty('--rx',-(scrollY*.6%72)+'px')},{passive:true});

/* ---------- command menu (Ctrl/Cmd + K) ---------- */
const cmd=$('#cmd'),cin=$('#cin'),cls=$('#cls');let items=[],ix=0;
const go=h=>{cmd.close();visit(new URL(h,location.href))};
const ACT=[['Home',()=>go('index.html')],['Services',()=>go('services.html')],['Our work',()=>go('work.html')],['Price a project',()=>go('quote.html')],['Contact us',()=>go('contact.html')],['Copy our email',()=>{cmd.close();S.email&&navigator.clipboard.writeText(S.email)}],['Admin sign in',()=>{cmd.close();openAdmin()}]];
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

