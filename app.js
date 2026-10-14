/* Nexus site. Fill these two lines from Supabase > Project Settings > API. */
const SUPABASE_URL='https://yvqiyvozbetvskwwhrlg.supabase.co';
const SUPABASE_KEY='sb_publishable_Ih55Z9wDGIGXHcCVG8X9TQ_jF1wxIim';

const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ready=!SUPABASE_URL.includes('YOUR-')&&window.supabase;
const sb=ready?supabase.createClient(SUPABASE_URL,SUPABASE_KEY):null;
const wait=ms=>new Promise(r=>setTimeout(r,ms)),rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
$('#yr').textContent=new Date().getFullYear();

/* ---------- public content (cached, repainted after every page swap) ---------- */
let P=[],S={},tag='',done=!sb;
const hue=s=>[...s].reduce((a,c)=>a+c.charCodeAt(0)*7,0)%360;
function showProjects(){
 const el=$('#projects');if(!el)return;let l=P;const fl=$('#flt');
 if(fl){fl.innerHTML=['All',...new Set(P.map(p=>p.tag).filter(Boolean))].map(t=>`<button class="fc ${(t==='All'?'':t)===tag?'on':''}" data-t="${t==='All'?'':esc(t)}">${esc(t)}</button>`).join('');fl.onclick=e=>{const b=e.target.closest('button');if(b){tag=b.dataset.t;showProjects()}}}
 if(tag)l=l.filter(p=>p.tag===tag);if(el.dataset.limit)l=l.slice(0,+el.dataset.limit);
 if(!l.length){el.innerHTML='<p class="empty">'+(done?'Our projects will appear here soon.':'Loading projects…')+'</p>';return}
 el.innerHTML=l.map((p,i)=>`<article class="card" style="--i:${i}">${p.image_url?`<img loading="lazy" src="${esc(p.image_url)}" alt="${esc(p.title)}">`:`<div class="ph" style="--h:${hue(p.title)}">${esc(p.title[0])}</div>`}<div class="b"><small>${esc(p.tag)}</small><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener">View project</a>`:''}</div></article>`).join('');
}
const CK={email:'Email',phone:'Phone',whatsapp:'WhatsApp',linkedin:'LinkedIn',github:'GitHub',instagram:'Instagram'};
function href(k,v){return k==='email'?'mailto:'+v:k==='phone'?'tel:'+v:k==='whatsapp'?'https://wa.me/'+v.replace(/\D/g,''):/^https?:/.test(v)?v:'https://'+v}
function showContacts(){const el=$('#cl');if(!el)return;const r=Object.keys(CK).filter(k=>S[k]).map(k=>`<li>${CK[k]}: <a href="${esc(href(k,S[k]))}" target="_blank" rel="noopener">${esc(S[k])}</a></li>`);el.innerHTML=r.join('')||'<li>Use the form and we will reply by email.</li>'}
const paint=()=>{showProjects();showContacts()};
async function load(){
 paint();if(!sb)return;
 const [p,s]=await Promise.all([sb.from('projects').select('*').eq('visible',true).order('created_at',{ascending:false}),sb.from('settings').select('*')]);
 if(p.data)P=p.data;
 if(s.data)S=Object.fromEntries(s.data.map(r=>[r.key,r.value]));
 done=true;paint();
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
addEventListener('scroll',()=>{const r=$('.road');if(r)r.style.setProperty('--rx',-(scrollY*.6%72)+'px')},{passive:true});

/* ---------- command menu (Ctrl/Cmd + K) ---------- */
const cmd=$('#cmd'),cin=$('#cin'),cls=$('#cls');let items=[],ix=0;
const go=h=>{cmd.close();visit(new URL(h,location.href))};
const ACT=[['Home',()=>go('index.html')],['Services',()=>go('services.html')],['Our work',()=>go('work.html')],['Price a project',()=>go('quote.html')],['Contact us',()=>go('contact.html')],['Copy our email',()=>{cmd.close();S.email&&navigator.clipboard.writeText(S.email)}],['Sign in',()=>{cmd.close();openAdmin()}]];
function draw(){const q=cin.value.toLowerCase();items=ACT.filter(a=>a[0].toLowerCase().includes(q));ix=Math.min(ix,Math.max(0,items.length-1));cls.innerHTML=items.map((a,i)=>`<li class="${i===ix?'on':''}" data-i="${i}">${a[0]}</li>`).join('')||'<li>No match</li>'}
function openCmd(){cin.value='';ix=0;draw();cmd.showModal();cin.focus()}
cin.oninput=()=>{ix=0;draw()};
cin.onkeydown=e=>{const n=items.length||1;if(e.key==='ArrowDown'){ix=(ix+1)%n;draw();e.preventDefault()}else if(e.key==='ArrowUp'){ix=(ix-1+n)%n;draw();e.preventDefault()}else if(e.key==='Enter'&&items[ix])items[ix][1]()};
cls.onclick=e=>{const l=e.target.closest('li[data-i]');if(l)items[l.dataset.i][1]()};
cmd.onclick=e=>{if(e.target===cmd)cmd.close()};
addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmd()}});
$('#kb').onclick=openCmd;

/* ---------- accounts: admin and customers share one sign-in ---------- */
const dlg=$('#adm');
$('footer .w').insertAdjacentHTML('beforeend',' <button class="lnk fl" id="fl">Sign in</button>');
$('#fl').onclick=()=>openAdmin();
const nf=n=>Number(n||0).toLocaleString(),day=d=>d.toISOString().slice(0,10),site=u=>/^https?:/i.test(u)?u:'https://'+u;
const head=t=>`<div class="ah"><b>${t}</b><span><button class="lnk" id="lo">Sign out</button> <button class="lnk" id="ax">Close</button></span></div>`;
const bindHead=()=>{$('#ax').onclick=closeAdmin;$('#lo').onclick=async()=>{await sb.auth.signOut();login()}};
function closeAdmin(){dlg.close();history.replaceState(null,'',location.pathname)}
async function openAdmin(){
 if(!sb){alert('Add your Supabase URL and key at the top of app.js first.');return}
 if(!dlg.open)dlg.showModal();const {data}=await sb.auth.getSession();data.session?enter(data.session.user):login();
}
async function enter(user){
 dlg.innerHTML='<p>Loading…</p>';
 const {data:me}=await sb.from('profiles').select('*').eq('id',user.id).maybeSingle();
 if(!me){dlg.innerHTML='<div class="af"><p>Your account is not set up yet. Please contact us.</p><button class="lnk" id="lo">Sign out</button></div>';$('#lo').onclick=async()=>{await sb.auth.signOut();login()};return}
 me.role==='admin'?panel():portal(me);
}
function login(){
 dlg.innerHTML=`<form id="lf" class="af"><h3>Sign in</h3><input name="e" type="email" placeholder="Email" required autocomplete="username"><input name="p" type="password" placeholder="Password" required autocomplete="current-password"><button class="btn">Sign in</button><p id="le"></p><button type="button" class="lnk" id="ax">Close</button></form>`;
 $('#lf').onsubmit=async e=>{e.preventDefault();const f=e.target,{data,error}=await sb.auth.signInWithPassword({email:f.e.value,password:f.p.value});error?$('#le').textContent=error.message:enter(data.user)};
 $('#ax').onclick=closeAdmin;
}

/* ---------- customer portal ---------- */
async function portal(me){
 dlg.innerHTML=head('Welcome'+(me.name?', '+esc(me.name):''))+'<div id="tb">Loading…</div>';bindHead();
 const {data:sites}=await sb.from('sites').select('*').order('created_at');
 if(!sites||!sites.length){$('#tb').innerHTML='<p>Your project is being set up. Your website stats will appear here once it is live.</p>';return}
 const ids=sites.map(s=>s.id),since=day(new Date(Date.now()-59*864e5));
 const [st,fi]=await Promise.all([sb.from('site_stats').select('*').in('site_id',ids).gte('day',since),sb.from('site_files').select('*').in('site_id',ids).order('created_at',{ascending:false})]);
 const files=fi.data||[],urls={};
 if(files.length){const r=await sb.storage.from('customer-files').createSignedUrls(files.map(f=>f.path),3600);(r.data||[]).forEach(x=>{if(x.path&&x.signedUrl)urls[x.path]=x.signedUrl})}
 $('#tb').innerHTML=sites.map(s=>siteCard(s,(st.data||[]).filter(r=>r.site_id===s.id),files.filter(f=>f.site_id===s.id),urls)).join('');
}
function siteCard(s,rows,files,urls){
 const m=Object.fromEntries(rows.map(r=>[r.day,r])),days=[...Array(60)].map((_,i)=>day(new Date(Date.now()-(59-i)*864e5))),z={visits:0,page_views:0};
 const cur=days.slice(30).map(d=>m[d]||z),prev=days.slice(0,30).map(d=>m[d]||z),sum=(a,k)=>a.reduce((t,r)=>t+r[k],0);
 const v=sum(cur,'visits'),pv=sum(cur,'page_views'),old=sum(prev,'visits'),chg=old?Math.round((v-old)/old*100):null,max=Math.max(1,...cur.map(r=>r.visits));
 const stats=rows.length?`<div class="kp"><div><b>${nf(v)}</b><small>Visits, last 30 days${chg===null?'':` (${chg>=0?'+':''}${chg}%)`}</small></div><div><b>${nf(pv)}</b><small>Page views</small></div><div><b>${v?(pv/v).toFixed(1):'0'}</b><small>Pages per visit</small></div></div><div class="bars" role="img" aria-label="Visits per day, last 30 days">${cur.map((r,i)=>`<i style="height:${Math.max(3,r.visits/max*100)}%" title="${days[30+i]}: ${nf(r.visits)} visits"></i>`).join('')}</div>`:'<p class="mu">Stats will appear here once your site has visitors.</p>';
 const fl=files.filter(f=>urls[f.path]).map(f=>`<p><a href="${esc(urls[f.path])}" target="_blank" rel="noopener">${esc(f.name)}</a></p>`).join('');
 return `<section class="sc"><h3>${esc(s.name)}</h3>${s.url?`<a href="${esc(site(s.url))}" target="_blank" rel="noopener">${esc(s.url)}</a>`:''}${stats}${fl?'<h4>Files and demos</h4>'+fl:''}</section>`;
}

/* ---------- admin ---------- */
function panel(){
 dlg.innerHTML=head('Nexus admin')+'<div class="tabs"><button data-t="P">Projects</button><button data-t="U">Customers</button><button data-t="C">Contact</button><button data-t="L">Leads</button></div><div id="tb"></div>';bindHead();
 $$('.tabs button').forEach(b=>b.onclick=()=>{$$('.tabs button').forEach(x=>x.classList.toggle('on',x===b));({P:tabP,U:tabU,C:tabC,L:tabL})[b.dataset.t]()});
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
 $('#tb').innerHTML=error?esc(error.message):(data.length?data.map(l=>`<div class="lead-i" data-id="${l.id}"><b>${esc(l.name)}</b> <a href="mailto:${esc(l.email)}">${esc(l.email)}</a> <small>· ${esc(l.status)}</small><br><small>${new Date(l.created_at).toLocaleString()}</small><p>${esc(l.message)}</p><button class="lnk" data-a="acc">${l.status==='accepted'?'Mark as new':'Accept'}</button> <button class="lnk" data-a="dec">Decline</button> <button class="lnk" data-a="del">Delete</button></div>`).join(''):'<p>No messages yet.</p>');
 $$('.lead-i button').forEach(b=>b.onclick=async()=>{
  const id=b.parentNode.dataset.id,l=data.find(x=>x.id===id),a=b.dataset.a;
  if(a==='del'){if(!confirm('Delete this message?'))return;await sb.from('leads').delete().eq('id',id)}
  else await sb.from('leads').update({status:a==='dec'?'declined':l.status==='accepted'?'new':'accepted'}).eq('id',id);
  tabL()});
}
async function tabU(){
 const [p,s]=await Promise.all([sb.from('profiles').select('*').eq('role','customer').order('created_at',{ascending:false}),sb.from('sites').select('id,owner')]);
 const list=p.data||[],n=o=>(s.data||[]).filter(x=>x.owner===o).length;
 $('#tb').innerHTML='<p class="mu">To accept a job: create the customer in Supabase (Authentication > Users > Add user), then open them here to add their website, stats and files.</p>'+(list.length?list.map(c=>`<div class="row" data-id="${c.id}"><span>${esc(c.name||c.email)}<br><small>${esc(c.email)} · ${n(c.id)} site(s)</small></span><span><button>Manage</button></span></div>`).join(''):'<p>No customers yet.</p>');
 $$('.row button').forEach(b=>b.onclick=()=>cust(list.find(x=>x.id===b.closest('.row').dataset.id)));
}
async function cust(c){
 const {data:sites}=await sb.from('sites').select('*').eq('owner',c.id).order('created_at'),ids=(sites||[]).map(s=>s.id),since=day(new Date(Date.now()-29*864e5));
 const [st,fi]=ids.length?await Promise.all([sb.from('site_stats').select('*').in('site_id',ids).gte('day',since).order('day',{ascending:false}),sb.from('site_files').select('*').in('site_id',ids)]):[{data:[]},{data:[]}];
 $('#tb').innerHTML=`<button class="lnk" id="bk">← All customers</button>
 <form id="nf" class="af"><h4>${esc(c.email)}</h4><input name="name" value="${esc(c.name||'')}" placeholder="Customer name"><button class="btn">Save name</button></form>
 <form id="sf2" class="af"><h4>Add a website</h4><input name="name" placeholder="Site name" required><input name="url" placeholder="Site address (optional)"><button class="btn">Add website</button></form>`+
 (sites||[]).map(s=>`<section class="sc" data-id="${s.id}"><div class="ah"><h3>${esc(s.name)}</h3><button class="lnk" data-a="dels">Delete site</button></div>
  <form class="af"><label>Stats, one line per day: date,visits,page views<textarea name="t" rows="3" placeholder="2026-10-14,120,340"></textarea></label><button class="btn">Save stats</button><p class="se"></p></form>
  <small>Recent (visits/page views): ${(st.data||[]).filter(r=>r.site_id===s.id).slice(0,5).map(r=>`${r.day} (${r.visits}/${r.page_views})`).join(' · ')||'none yet'}</small>
  <form class="af"><input name="f" type="file" required><button class="btn">Upload file or demo</button><p class="se"></p></form>
  ${(fi.data||[]).filter(f=>f.site_id===s.id).map(f=>`<div class="row" data-fid="${f.id}" data-p="${esc(f.path)}"><span>${esc(f.name)}</span><span><button>Delete</button></span></div>`).join('')}</section>`).join('');
 $('#bk').onclick=tabU;
 $('#nf').onsubmit=async e=>{e.preventDefault();const name=e.target.elements.name.value.trim(),r=await sb.from('profiles').update({name}).eq('id',c.id);if(!r.error)c.name=name;$('button',e.target).textContent=r.error?r.error.message:'Saved'};
 $('#sf2').onsubmit=async e=>{e.preventDefault();const f=e.target.elements,r=await sb.from('sites').insert({owner:c.id,name:f.name.value.trim(),url:f.url.value.trim()||null});r.error?alert(r.error.message):cust(c)};
 $$('.sc').forEach(sec=>{
  const sid=sec.dataset.id,[sf,ff]=$$('form',sec);
  sf.onsubmit=async e=>{e.preventDefault();const msg=$('.se',sf),rows=[];
   for(const ln of sf.elements.t.value.split('\n')){
    const p=ln.split(/[,;\t]/).map(x=>x.trim());if(!p[0])continue;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(p[0])||p.length<2||p.slice(1,3).some(x=>!/^\d+$/.test(x))){msg.textContent='Check this line: '+ln;return}
    rows.push({site_id:sid,day:p[0],visits:+p[1],page_views:+(p[2]||0)})}
   if(!rows.length){msg.textContent='Nothing to save.';return}
   const r=await sb.from('site_stats').upsert(rows,{onConflict:'site_id,day'});r.error?msg.textContent=r.error.message:cust(c)};
  ff.onsubmit=async e=>{e.preventDefault();const msg=$('.se',ff),file=ff.elements.f.files[0];msg.textContent='Uploading…';
   const path=sid+'/'+Date.now()+'-'+file.name.replace(/[^\w.-]/g,'_'),up=await sb.storage.from('customer-files').upload(path,file);
   if(up.error){msg.textContent=up.error.message;return}
   const r=await sb.from('site_files').insert({site_id:sid,name:file.name,path});r.error?msg.textContent=r.error.message:cust(c)};
  $$('.row button',sec).forEach(b=>b.onclick=async()=>{const row=b.closest('.row');if(!confirm('Delete this file?'))return;await sb.storage.from('customer-files').remove([row.dataset.p]);await sb.from('site_files').delete().eq('id',row.dataset.fid);cust(c)});
  $('[data-a=dels]',sec).onclick=async()=>{if(!confirm('Delete this website with all its stats and files?'))return;const paths=(fi.data||[]).filter(f=>f.site_id===sid).map(f=>f.path);if(paths.length)await sb.storage.from('customer-files').remove(paths);await sb.from('sites').delete().eq('id',sid);cust(c)};
 });
}
if(['#admin','#login'].includes(location.hash))openAdmin();
addEventListener('hashchange',()=>{if(['#admin','#login'].includes(location.hash))openAdmin()});
