/* Nex v2: lives across pages, hops onto page elements, peeks from behind them, makes suggestions. */
const N=document.createElement('div');N.id='nex';N.setAttribute('role','img');N.setAttribute('aria-label','Nex, the Nexus mascot');
N.innerHTML=`<div id="nb"></div><div class="fl"><svg viewBox="0 0 100 124" width="100%">
<ellipse class="sh" cx="50" cy="120" rx="28" ry="4.5"/>
<g class="lg a"><rect x="32" y="90" width="12" height="26" rx="6"/><rect x="28" y="112" width="20" height="8" rx="4"/></g>
<g class="lg b"><rect x="55" y="90" width="12" height="26" rx="6"/><rect x="51" y="112" width="20" height="8" rx="4"/></g>
<g class="bd">
<g class="an"><line x1="50" y1="32" x2="50" y2="14"/><circle cx="50" cy="12" r="6"/></g>
<rect class="ar l" x="9" y="58" width="12" height="28" rx="6"/><rect class="ar r" x="79" y="58" width="12" height="28" rx="6"/>
<rect class="bo" x="18" y="30" width="64" height="68" rx="30"/>
<rect class="sc" x="27" y="42" width="46" height="34" rx="15"/>
<g class="ey"><circle class="w1" cx="39" cy="57" r="6.5"/><circle class="w1" cx="61" cy="57" r="6.5"/><g class="pu"><circle cx="39" cy="57" r="3"/><circle cx="61" cy="57" r="3"/></g></g>
<path class="mo" d="M43 67q7 6 14 0"/><circle class="ck" cx="30" cy="84" r="4"/><circle class="ck" cx="70" cy="84" r="4"/>
</g></svg></div>`;
document.body.appendChild(N);
const nb=$('#nb',N),pu=$('.pu',N),W=()=>N.offsetWidth,Hh=()=>N.offsetHeight;
let perch=null,started=false;
const JOKES=['I run on coffee and clean code.','I have no bugs. Only features.','Ctrl K, try it.','Legs: 2. Deadlines missed: 0.','Poke me again, I dare you.'];
const setT=(l,b='.5s',c='.5s',f='linear')=>N.style.transition=`left ${l} ${f},bottom ${b} cubic-bezier(.3,1.4,.5,1),clip-path ${c}`;
const cands=()=>$$('.card,.bento>*,.tk,.ps li,.svx').filter(e=>{const r=e.getBoundingClientRect();return r.top>170&&r.top<innerHeight-150&&r.width>160});
const tick=(cfg,v)=>{const i=cfg.querySelector(`[name=f][value="${v}"]`);i.checked=true;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}))};
const RULES=[
 [c=>c.t!=='Website'&&!c.f.includes('Customer logins'),'logins','Most apps need logins so people can come back to their stuff.','Add logins','[value="Customer logins"]',f=>tick(f,'Customer logins')],
 [c=>c.f.includes('Customer logins')&&!c.f.includes('Admin panel'),'admin','Logins mean someone has to manage them.','Add admin panel','[value="Admin panel"]',f=>tick(f,'Admin panel')],
 [c=>c.t==='Website'&&!c.f.includes('SEO setup'),'seo','A site nobody finds is just a hobby.','Add SEO setup','[value="SEO setup"]',f=>tick(f,'SEO setup')],
 [c=>c.f.includes('Bookings')&&!c.f.includes('Payments'),'pay','Take deposits with the bookings?','Add payments','[value="Payments"]',f=>tick(f,'Payments')],
 [c=>c.w<3,'rush','Rush adds 25%. Can you spare a little more time?','Make it 4 weeks','[name=w]',f=>{f.w.value=4;f.w.dispatchEvent(new Event('input',{bubbles:true}))}]
];
const nex={x:-120,busy:false,sleeping:false,last:Date.now(),speed:95,
 say(t,ms=2800,force){if(nb.classList.contains('ask')&&!force)return;nb.classList.remove('ask');nb.textContent=t;nb.classList.add('on');clearTimeout(nex.bt);nex.bt=setTimeout(()=>nb.classList.remove('on'),ms)},
 ask(t,label,yes,ms=10000){
  nb.textContent=t;nb.append(document.createElement('br'));
  const b=document.createElement('button'),n=document.createElement('button');b.textContent=label;n.textContent='No thanks';n.className='no';
  b.onclick=()=>{nb.classList.remove('on','ask');yes();nex.act('jump',700)};n.onclick=()=>nb.classList.remove('on','ask');
  nb.append(b,n);nb.classList.add('on','ask');clearTimeout(nex.bt);nex.bt=setTimeout(()=>nb.classList.remove('on','ask'),ms)},
 async act(c,ms){N.classList.add(c);await wait(ms);N.classList.remove(c)},
 async go(x){
  if(perch){const r=perch.el.getBoundingClientRect();x=Math.min(Math.max(x,r.left+8),r.right-W()-8)}
  const d=Math.abs(x-nex.x);if(d<30)return;const t=d/nex.speed;
  N.classList.toggle('back',x<nex.x);setT(t+'s');N.classList.add('walk');N.style.left=x+'px';nex.x=x;await wait(t*1000);N.classList.remove('walk')},
 async perchOn(el){
  const r=el.getBoundingClientRect(),x=r.left+rnd(8,Math.max(9,r.width-W()-8));
  N.classList.toggle('back',x<nex.x);setT('.6s','.6s','.3s','ease-in-out');perch={el,y:0};
  N.style.left=x+'px';nex.x=x;N.style.bottom=(innerHeight-r.top)+'px';nex.act('jump',700);await wait(650);
  el.classList.add('bump');setTimeout(()=>el.classList.remove('bump'),400)},
 async drop(){if(!perch)return;perch=null;N.style.transition='bottom .55s cubic-bezier(.5,0,1,.7)';N.style.bottom='6px';N.style.clipPath='';await wait(580)},
 async peek(el){
  const r=el.getBoundingClientRect(),h=Hh(),x=r.left+rnd(10,Math.max(11,r.width-W()-10));
  await nex.drop();N.style.transition='clip-path .25s';N.style.clipPath='inset(0 0 100% 0)';await wait(260);
  N.style.transition='none';N.style.left=x+'px';nex.x=x;perch={el,y:h};N.style.bottom=(innerHeight-r.top-h)+'px';N.style.clipPath=`inset(0 0 ${h}px 0)`;N.getBoundingClientRect();
  N.style.transition='bottom .6s cubic-bezier(.3,1.4,.5,1),clip-path .6s';perch.y=46;N.style.bottom=(innerHeight-r.top-46)+'px';N.style.clipPath='inset(0 0 46px 0)';
  await wait(700);nex.say('Boo! Did I scare you?',2000);await nex.act('wave',1500);
  perch.y=0;N.style.bottom=(innerHeight-r.top)+'px';N.style.clipPath='inset(0 0 0px 0)';nex.act('jump',700);await wait(650);N.style.clipPath=''},
 async run(fn){if(nex.busy||nex.sleeping)return;nex.busy=true;try{await fn()}finally{nex.busy=false}},
 cheer(){nex.say('Sent! Yes! We will be in touch.',3200,true);nex.act('cheer',1900)},
 wake(){nex.last=Date.now();if(nex.sleeping){nex.sleeping=false;N.classList.remove('sleep');nex.say('Oh, hi again!')}},
 async exit(){nex.busy=true;await nex.drop();nex.speed=240;await nex.go(innerWidth+60);nex.speed=95},
 async enter(){
  nex.busy=true;N.style.transition='none';N.classList.remove('back');N.style.bottom='6px';N.style.clipPath='';
  if(RM){N.style.left='90px';nex.x=90;nex.busy=false;return}
  N.style.left='-120px';nex.x=-120;N.getBoundingClientRect();nex.speed=150;await nex.go(rnd(120,Math.max(200,innerWidth/3)));nex.speed=95;nex.busy=false},
 watch(s){io.observe(s)},
 mood(w){nex.speed=w<4?210:w>8?55:95;N.classList.toggle('run',w<4);clearTimeout(nex.mt);nex.mt=setTimeout(()=>nex.say(w<4?'Rush job! I will run faster.':w>8?'No hurry. I will stroll.':'Steady pace.',1800),500)},
 advise(cfg){clearTimeout(nex.at);nex.at=setTimeout(()=>{
  const c={t:cfg.t.value,f:$$('[name=f]:checked',cfg).map(i=>i.value),w:+cfg.w.value},r=RULES.find(r=>!nex.asked.has(r[1])&&r[0](c));if(!r)return;
  nex.asked.add(r[1]);const o=cfg.querySelector(r[4])?.closest('.o');o?.classList.add('hint');setTimeout(()=>o?.classList.remove('hint'),2400);
  nex.ask(r[2],r[3],()=>r[5](cfg));nex.act('point',1800)},1100)},
 asked:new Set(),
 async start(){
  if(started)return;started=true;await nex.enter();if(RM)return;
  let seen=0;try{seen=sessionStorage.nex;sessionStorage.nex=1}catch(e){}
  nex.say(seen?'Back again!':'Hi, I am Nex. I live here.',3000);await nex.act('wave',2200);life()}
};
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){io.unobserve(en.target);nex.run(async()=>{nex.say(en.target.dataset.nex);await nex.act('point',1800)})}}),{threshold:.5});

/* hop between two open tabs of the site */
let bc=null;try{bc=new BroadcastChannel('nex')}catch(e){}
let arrive=false,acked=false;
const doArrive=async()=>{arrive=false;await wait(300);await nex.run(async()=>{await nex.enter();nex.say('Hopped over from my other tab!')})};
if(bc)bc.onmessage=e=>{if(e.data==='hop'){bc.postMessage('ack');arrive=true;if(!document.hidden)doArrive()}else if(e.data==='ack')acked=true};
async function hop(){
 acked=false;nex.say('Off to my other tab. Bye!',1800);await nex.drop();nex.speed=200;await nex.go(innerWidth+60);nex.speed=95;bc.postMessage('hop');await wait(600);
 if(!acked)nex.say('No other tab open. Back I go.');else await wait(7000);
 await nex.enter()}

/* moods, pointer, tab title */
const moves=[
 async()=>{const[l,h]=[90,Math.max(120,innerWidth-W()-90)];await nex.go(rnd(l,h));if(Math.random()<.5)nex.say(pick(JOKES))},
 async()=>{nex.say('Hello there!',2200);await nex.act('wave',2200)},
 async()=>{await nex.act('jump',700)},
 async()=>{nex.say('Nobody is watching. Dance time.',2600);await nex.act('dance',2900)},
 async()=>{const c=cands();if(c.length)await nex.perchOn(pick(c))},
 async()=>{const c=cands();if(c.length)await nex.peek(pick(c))}
];
async function life(){for(;;){
 await wait(rnd(3000,7000));if(document.hidden||nex.busy||nex.sleeping)continue;
 if(Date.now()-nex.last>45000){nex.sleeping=true;N.classList.add('sleep');nex.say('zzz…',4000);continue}
 await nex.run(async()=>{const k=Math.random();
  if(perch){if(k<.3)await nex.go(rnd(0,innerWidth));else if(k<.5){nex.say(pick(JOKES));await nex.act('wave',2000)}else if(k<.7){const c=cands();if(c.length)await nex.perchOn(pick(c))}else await nex.drop()}
  else if(bc&&k>.97)await hop();
  else await pick(moves)()})}}
N.onclick=()=>{nex.wake();nex.run(async()=>{const k=Math.random();if(k<.4){nex.say(pick(JOKES));await nex.act('jump',700)}else if(k<.7)await moves[1]();else await moves[3]()})};
['pointermove','scroll','keydown','touchstart'].forEach(ev=>addEventListener(ev,()=>nex.wake(),{passive:true}));
addEventListener('pointermove',e=>{const r=N.getBoundingClientRect(),dx=Math.max(-3,Math.min(3,(e.clientX-r.left-43)/60)),dy=Math.max(-2.5,Math.min(2.5,(e.clientY-r.top-55)/60));pu.style.transform=`translate(${N.classList.contains('back')?-dx:dx}px,${dy}px)`});
addEventListener('scroll',()=>{
 if(!perch)return;const r=perch.el.getBoundingClientRect();
 if(r.bottom<60||r.top>innerHeight-30){perch=null;N.style.transition='bottom .6s cubic-bezier(.5,0,1,.7)';N.style.bottom='6px';N.style.clipPath='';return}
 if(!N.classList.contains('walk'))N.style.transition='left 0s,bottom 0s,clip-path .1s';N.style.bottom=(innerHeight-r.top-perch.y)+'px'},{passive:true});
addEventListener('resize',()=>{if(perch)return;const h=Math.max(120,innerWidth-W()-90);if(nex.x>h){nex.x=h;N.style.transition='none';N.style.left=h+'px'}});
const fav=$('link[rel=icon]'),fav0=fav&&fav.href,FACE="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='10' fill='%2312b5a6'/><rect x='6' y='8' width='20' height='14' rx='6' fill='%231c1233'/><circle cx='12' cy='15' r='2.5' fill='white'/><circle cx='20' cy='15' r='2.5' fill='white'/></svg>";
let tt,base;
document.addEventListener('visibilitychange',()=>{
 if(document.hidden){base=document.title;let i=0;const f=['Nex is walking >','Nex is walking >>','Come back! (^_^)','Nex misses you'];tt=setInterval(()=>document.title=f[i++%4],900);if(fav)fav.href=FACE}
 else{clearInterval(tt);if(base)document.title=base;if(fav)fav.href=fav0;nex.say('Welcome back!');if(arrive)doArrive()}});
boot();
