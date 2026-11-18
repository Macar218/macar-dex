
/* ---------- DATA ---------- */
const TYPES=['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
const TCOL={Normal:'#8a8a78',Fire:'#e2571f',Water:'#3f7fe0',Electric:'#d9a406',Grass:'#4aa33a',Ice:'#4fb5b8',Fighting:'#b8322c',Poison:'#9a3fa5',Ground:'#b8913f',Flying:'#7d8fe0',Psychic:'#e04f84',Bug:'#8aa31a',Rock:'#9a8530',Ghost:'#6a4f93',Dragon:'#5a31e0',Dark:'#5b4638',Steel:'#7a8aa0',Fairy:'#d97aa0'};
const CH={
Normal:{h:[],l:['Rock','Steel'],z:['Ghost']},
Fire:{h:['Grass','Ice','Bug','Steel'],l:['Fire','Water','Rock','Dragon'],z:[]},
Water:{h:['Fire','Ground','Rock'],l:['Water','Grass','Dragon'],z:[]},
Electric:{h:['Water','Flying'],l:['Electric','Grass','Dragon'],z:['Ground']},
Grass:{h:['Water','Ground','Rock'],l:['Fire','Grass','Poison','Flying','Bug','Dragon','Steel'],z:[]},
Ice:{h:['Grass','Ground','Flying','Dragon'],l:['Fire','Water','Ice','Steel'],z:[]},
Fighting:{h:['Normal','Ice','Rock','Dark','Steel'],l:['Poison','Flying','Psychic','Bug','Fairy'],z:['Ghost']},
Poison:{h:['Grass','Fairy'],l:['Poison','Ground','Rock','Ghost'],z:['Steel']},
Ground:{h:['Fire','Electric','Poison','Rock','Steel'],l:['Grass','Bug'],z:['Flying']},
Flying:{h:['Grass','Fighting','Bug'],l:['Electric','Rock','Steel'],z:[]},
Psychic:{h:['Fighting','Poison'],l:['Psychic','Steel'],z:['Dark']},
Bug:{h:['Grass','Psychic','Dark'],l:['Fire','Fighting','Poison','Flying','Ghost','Steel','Fairy'],z:[]},
Rock:{h:['Fire','Ice','Flying','Bug'],l:['Fighting','Ground','Steel'],z:[]},
Ghost:{h:['Psychic','Ghost'],l:['Dark'],z:['Normal']},
Dragon:{h:['Dragon'],l:['Steel'],z:['Fairy']},
Dark:{h:['Psychic','Ghost'],l:['Fighting','Dark','Fairy'],z:[]},
Steel:{h:['Ice','Rock','Fairy'],l:['Fire','Water','Electric','Steel'],z:[]},
Fairy:{h:['Fighting','Dragon','Dark'],l:['Fire','Poison','Steel'],z:[]}
};
function eff(att,def){const c=CH[att];if(c.z.includes(def))return 0;if(c.h.includes(def))return 2;if(c.l.includes(def))return .5;return 1}
function effVs(att,defs){return defs.reduce((m,d)=>m*eff(att,d),1)}

const P=window.DEX.map(d=>({k:d.k,n:d.n,t:d.t,b:d.b,s:d.b[5],ah:d.a,a:d.a.map(x=>x[0]),m:d.m||0,i:d.i||'',img:d.s}));

// Ability categories (descriptions come from Showdown, in English)
const CATMAP={
 'Speed':['Swift Swim','Chlorophyll','Sand Rush','Slush Rush','Unburden','Prankster','Surge Surfer','Quick Feet'],
 'Weather & Terrain':['Drought','Drizzle','Sand Stream','Snow Warning','Grassy Surge','Psychic Surge','Electric Surge','Misty Surge','Orichalcum Pulse','Hadron Engine','Desolate Land','Primordial Sea','Delta Stream','Sand Spit','Seed Sower'],
 'Damage':['Defiant','Supreme Overlord','Adaptability','Pixilate','Aerilate','Refrigerate','Galvanize','Tough Claws','Fairy Aura','Dark Aura','Sand Force','Competitive','Liquid Voice','Poison Touch','Overgrow','Blaze','Torrent','Swarm','Sharpness','Technician','Sheer Force','Iron Fist','Strong Jaw','Mega Launcher','Reckless','Guts','Hustle','Huge Power','Pure Power','Analytic','Tinted Lens','Mold Breaker','Moxie','Steelworker','Transistor','Dragon\'s Maw','Rocky Payload','Toxic Boost','Flare Boost','Solar Power','Dragonize','Piercing Drill','Aura Guard','Parental Bond','Skill Link','Contrary','No Guard','Scrappy','Sniper','Sweeping Edge'],
 'Defense':['Armor Tail','Lightning Rod','Levitate','Rough Skin','Iron Barbs','Stamina','Sturdy','Multiscale','Good as Gold','Sap Sipper','Flash Fire','Flame Body','Bulletproof','Soundproof','Marvel Scale','Clear Body','Sand Veil','Snow Cloak','Thick Fat','Water Absorb','Volt Absorb','Storm Drain','Motor Drive','Dry Skin','Fur Coat','Filter','Solid Rock','Ice Scales','Earth Eater','Well-Baked Body','Wind Rider','Fluffy','Heatproof','Unaware','Own Tempo','Oblivious','Inner Focus','Steadfast','Water Veil','Immunity','Magic Guard','Magic Bounce'],
 'Utility':['Intimidate','Emergency Exit','Shadow Tag','Hospitality','Infiltrator','Unnerve','Pressure','Trace','Regenerator','Natural Cure','Screen Cleaner','Costar','Friend Guard','Healer','Telepathy','Symbiosis','Flower Veil','Cud Chew','Harvest','Sticky Hold','Mirror Armor']
};
const CATCOL={'Speed':'#e556a8','Weather & Terrain':'#4f86ec','Damage':'#e2490d','Defense':'#52b869','Utility':'#9a3fa5','Other':'#7a8aa0'};
const ABCAT={};Object.entries(CATMAP).forEach(([c,l])=>l.forEach(n=>ABCAT[n]=c));
const FIXPK=x=>String(x||'').replace(/\bPokemon\b/g,'Pokémon');
if(window.ABILITY_EN)for(const k in window.ABILITY_EN)window.ABILITY_EN[k]=FIXPK(window.ABILITY_EN[k]);
if(window.MOVES)window.MOVES.forEach(m=>{m.d=FIXPK(m.d)});
function abDesc(n){return {cat:ABCAT[n]||'Other',d:(window.ABILITY_EN&&window.ABILITY_EN[n])||'No description.'}}

// Natures: [name, +stat, −stat]
if(window.ES&&window.ITEMS){ES.i={};ES.id={};ITEMS.forEach(x=>{ES.i[x.n]=x.es;ES.id[x.n]=x.dEs})}
const ESN=(k,n)=>((window.ES&&ES[k]&&ES[k][n])||'');
const bi=(k,n)=>{const e=ESN(k,n);return `${esc(n)}${e&&e!==n?`<span class="es">${esc(e)}</span>`:''}`};
const hasQ=(k,n,q)=>n.toLowerCase().includes(q)||ESN(k,n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(q.normalize('NFD').replace(/[\u0300-\u036f]/g,''));
let DL='both';try{DL=localStorage.getItem('vgcDesc')||'both'}catch(e){}
const ESD=(k,n)=>((window.ES&&ES[k+'d']&&ES[k+'d'][n])||'');
const dsc=(k,n,en)=>{en=String(en||'').replace(/\bPokemon\b/g,'Pokémon');const e=ESD(k,n);if(DL==='en'||!e)return esc(en);if(DL==='es')return esc(e);return `<span class="en">${esc(en)}</span><span class="esd">${esc(e)}</span>`};
const SL=x=>({SpA:'SpAtk',SpD:'SpDef'}[x]||x);
const NATS=[
['Hardy',null,null],['Lonely','Atk','Def'],['Brave','Atk','Spe'],['Adamant','Atk','SpA'],['Naughty','Atk','SpD'],
['Bold','Def','Atk'],['Docile',null,null],['Relaxed','Def','Spe'],['Impish','Def','SpA'],['Lax','Def','SpD'],
['Timid','Spe','Atk'],['Hasty','Spe','Def'],['Serious',null,null],['Jolly','Spe','SpA'],['Naive','Spe','SpD'],
['Modest','SpA','Atk'],['Mild','SpA','Def'],['Quiet','SpA','Spe'],['Bashful',null,null],['Rash','SpA','SpD'],
['Calm','SpD','Atk'],['Gentle','SpD','Def'],['Sassy','SpD','Spe'],['Careful','SpD','SpA'],['Quirky',null,null]
];
const METANAT=[
['Sneasler','Adamant','2 HP / 32 Atk / 32 Spe','White Herb'],
['Kingambit','Brave','32 HP / 32 Atk / 2 SpD','Chople Berry'],
['Basculegion','Brave','2 HP / 32 Atk / 32 Def','Focus Sash'],
['Charizard-Mega-Y','Quiet','32 HP / 2 Def / 32 SpA','Charizardite Y'],
['Rillaboom','Adamant','32 HP / 32 Atk / 2 Spe','Miracle Seed'],
['Incineroar','Adamant','32 HP / 14 Atk / 10 Def / 10 SpD','Sitrus Berry'],
['Garchomp','Adamant','2 HP / 32 Atk / 32 Spe','Choice Scarf'],
['Farigiraf','Quiet','10 HP / 13 Def / 30 SpA / 13 SpD','Sitrus Berry'],
['Archaludon','Bold','30 HP / 1 Def / 1 SpA / 19 SpD / 15 Spe','Leftovers'],
['Indeedee-F','Bold','32 HP / 32 Def / 2 SpD','Rocky Helmet'],
['Floette-Mega','Modest','16 HP / 12 Def / 15 SpA / 23 Spe','Floettite'],
['Dragonite-Mega','Modest','25 HP / 32 SpA / 9 Spe','Dragoninite'],
['Gardevoir-Mega','Quiet','16 HP / 18 Def / 32 SpA','Gardevoirite']
];

/* ---------- HELPERS ---------- */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const tpills=a=>a.map(t=>`<span class="tp" style="background:${TCOL[t]}">${t}</span>`).join('');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nameHTML=p=>`${esc(p.n)}${p.m?'<span class="mega">MEGA</span>':''}`;
const spd=(b,sp,nat)=>Math.floor((b+20+sp)*nat);
const stat50=(p,i,sp,nat)=>i===0?p.b[0]+75+sp:Math.floor((p.b[i]+20+sp)*nat);
function stageMult(s){return s>=0?(2+s)/2:2/(2-s)}
const SCEN={
 '0-':{l:'0 SP −',f:b=>spd(b,0,.9)},
 '0=':{l:'0 SP',f:b=>spd(b,0,1)},
 '32=':{l:'32 SP',f:b=>spd(b,32,1)},
 '32+':{l:'32 SP +',f:b=>spd(b,32,1.1)},
 '+1':{l:'32 SP + +1 stage',f:b=>Math.floor(spd(b,32,1.1)*1.5)},
 '-1':{l:'32 SP + −1 stage',f:b=>Math.floor(spd(b,32,1.1)*2/3)},
 'para':{l:'32 SP + paralyzed',f:b=>Math.floor(spd(b,32,1.1)*.5)},
 'scarf':{l:'32 SP + Scarf',f:b=>Math.floor(spd(b,32,1.1)*1.5)},
 'tw':{l:'32 SP + Tailwind',f:b=>spd(b,32,1.1)*2}
};
const STATS=['HP','Atk','Def','SpAtk','SpDef','Spe'];
const STATCOL=['var(--s-hp)','var(--s-atk)','var(--s-def)','var(--s-spa)','var(--s-spd)','var(--s-spe)'];
const MEGAS={};
const BKEY={floettemega:'floetteeternal',meowsticmmega:'meowstic'};
P.forEach(p=>{if(!p.m)return;const bk=BKEY[p.k]||p.k.replace(/mega[xyz]?$/,'').replace(/^(meowstic)f$/,'$1f');(MEGAS[bk]||(MEGAS[bk]=[])).push(p)});
Object.values(MEGAS).forEach(l=>l.sort((a,b)=>a.n.localeCompare(b.n)));
const BASES=P.filter(p=>!p.m);
let SPON=false;try{SPON=localStorage.getItem('vgcSP')==='1'}catch(e){}
let LASTCARD=null;
let FAV=new Set();try{FAV=new Set(JSON.parse(localStorage.getItem('vgcFav')||'[]'))}catch(e){}
function toggleFav(k){FAV.has(k)?FAV.delete(k):FAV.add(k);try{localStorage.setItem('vgcFav',JSON.stringify([...FAV]))}catch(e){}}
const spdBase=p=>SPON?SCEN['32+'].f(p.s):SCEN['0='].f(p.s);
const spdScarf=p=>Math.floor(spdBase(p)*1.5);
const spdTW=p=>spdBase(p)*2;
const SRC=window.SRC||{},USAGES=window.USAGES||{};
let SRCK='showdown';
const EVENTS=window.EVENTS||[],CURREG=window.CURREG||'';
let OFFN='3';try{const s=localStorage.getItem('vgcOff');if(s)OFFN=s}catch(e){}
function buildOfficial(){
  const evs=EVENTS.filter(e=>e.reg===CURREG&&e.type==='Regional').sort((x,y)=>y.date.localeCompare(x.date));
  const use=OFFN==='all'?evs:evs.slice(0,+OFFN||3);
  const tot=use.reduce((s,e)=>s+e.teams,0),u={};
  use.forEach(e=>{for(const k in e.u)u[k]=(u[k]||0)+e.u[k]*e.teams});
  for(const k in u)u[k]=Math.round(u[k]/tot*10)/10;
  USAGES.official=u;
  const o=SRC.official;if(o&&use.length){o.n=Object.keys(u).length;o.date=use[use.length-1].date+' to '+use[0].date;o.sample=use.length+' Regionals ('+use.map(e=>e.name.replace(/^\d{4} /,'').replace(' Regional','')).join(', ')+'), '+tot.toLocaleString('en')+' teams'}
}
buildOfficial();
let U=USAGES[SRCK]||{};
const srcTxt=()=>{const s=SRC[SRCK]||{};return (s.label||'')+' · '+(s.date||'')};
const uOf=p=>U[p.k]||0;
const uTot=p=>uOf(p)+(MEGAS[p.k]||[]).reduce((a,m)=>a+uOf(m),0);
const tierOf=v=>v>=20?'S':v>=10?'A':v>=5?'B':v>=2?'C':v>=.1?'D':'';
const fmtU=v=>v>=.1?(v>=10?Math.round(v*10)/10:v.toFixed(1))+'%':'<0.1%';
const inMeta=p=>uOf(p)>=0.3;
const sumSrc=(s,p)=>{const u=USAGES[s]||{};return (u[p.k]||0)+(MEGAS[p.k]||[]).reduce((x,m)=>x+(u[m.k]||0),0)};
const alpha=[...P].sort((a,b)=>a.n.localeCompare(b.n));
const TABS=['home','dex','moves','speed','types','abilities','natures','quiz','calc','items','teams'];
const deb=(f,ms=90)=>{let t;return()=>{clearTimeout(t);t=setTimeout(f,ms)}};
const DONE={};
function ensure(id){if(DONE[id])return;DONE[id]=1;const f={moves:initMoves,types:buildTypes,abilities:renderAb,natures:renderNat,speed:calc,quiz:showQMenu,calc:()=>window.initCalc?initCalc():(DONE.calc=0),items:()=>window.renderItems?renderItems():(DONE.items=0),teams:()=>window.renderTeams?renderTeams():(DONE.teams=0)}[id];if(f)f()}
const bg=p=>'var(--surface)';
const formOk=(p,m)=>m==='all'||(m==='meta'?inMeta(p):0)||(m==='fav'?FAV.has(p.m?(BKEY[p.k]||p.k.replace(/mega[xyz]?$/,'')):p.k):(m==='mega')===!!p.m);

/* ---------- TABS ---------- */
function showTab(id){
  {const f=document.querySelector('.dev .rotom');if(f){f.classList.remove('hi');void f.offsetWidth;f.classList.add('hi')}}
  $$('#tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===id));
  const more=$('#tabs [data-more]');more.setAttribute('aria-selected',['types','abilities','natures','moves','items','teams'].includes(id));
  $('#moreSheet').classList.add('hide');more.setAttribute('aria-expanded','false');
  TABS.forEach(t=>$('#tab-'+t).classList.toggle('hide',t!==id));
  try{history.replaceState(null,'','#'+id)}catch(e){}
  if(id==='home')renderHome();else ensure(id);
  if(id==='teams'&&DONE.teams&&window.renderTeams)renderTeams();
  if(id==='speed')scrollLadder();
  window.scrollTo(0,0);
}
$('#tabs').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.more){const sh=$('#moreSheet');sh.classList.toggle('hide');b.setAttribute('aria-expanded',!sh.classList.contains('hide'));return}
  showTab(b.dataset.tab);
});
document.addEventListener('click',e=>{if(!e.target.closest('#tabs'))$('#moreSheet').classList.add('hide')});
$('#subline').textContent=`${P.length} forms (${P.filter(p=>!p.m).length} Pokémon and ${P.filter(p=>p.m).length} Megas) · Pokémon Champions, Level 50 · data from Pokémon Showdown.`;

/* ---------- DEX ---------- */
$('#pT').innerHTML='<option value="">All types</option>'+TYPES.map(t=>`<option value="${t}">${t}</option>`).join('');
function sortVal(p,k){
  if(k==='spe')return spdBase(p);
  if(k==='use')return uTot(p);
  if(k==='bst')return p.b.reduce((a,b)=>a+b,0);
  if(k==='atk')return p.b[1];
  if(k==='spa')return p.b[3];
  if(k==='bulk')return p.b[0]*p.b[2]*p.b[4]/1000;
  return 0;
}
const typeCol=p=>`--c1:${TCOL[p.t[0]]};--c2:${TCOL[p.t[1]||p.t[0]]}`;
const MEGAIMG='data:image/png;base64,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';
let CHIP='use';
function chipHTML(p){
  if(!CHIP)return '';
  if(CHIP==='use'){const t=uTot(p);return `<span class="mval t${tierOf(t)}" title="Usage in ${esc((SRC[SRCK]||{}).label||'')}: ${fmtU(t)} (base + Megas)">${fmtU(t)}</span>`}
  const m=metricOf(p);
  return m?`<span class="mval st-${CHIP}">${m[0]} <b>${m[1]}</b></span>`:'';
}
function metricOf(p){
  const sp=SPON?32:0;
  return {spe:['Spe',spdBase(p)],bst:['BST',p.b.reduce((x,y)=>x+y,0)],atk:['Atk',stat50(p,1,sp,1)],spa:['SpAtk',stat50(p,3,sp,1)],bulk:['Bulk',Math.round(sortVal(p,'bulk'))]}[CHIP]||null;
}
function abOrder(p){
  const s=(window.SETS||{})[p.k];
  if(s&&s.a.length){const L=s.a.filter(x=>x[1]>=1).slice(0,3);if(L.length)return L.map(([n,v])=>esc(n)+' <i>'+Math.round(v)+'%</i>').join(' · ')}
  return p.ah.map(([n])=>esc(n)).join(' · ');
}
function pkCard(p){
  const v=[0,1,2,3,4,5].map(i=>i===5?spdBase(p):stat50(p,i,SPON?32:0,1)),L=MEGAS[p.k]?[p,...MEGAS[p.k]]:null;
  return `<div class="pk" role="button" tabindex="0" data-k="${p.k}" style="${typeCol(p)}">${L||p.m?`<img class="mstone" src="${MEGAIMG}" alt="Mega" title="Has Mega Evolution">`:''}<span class="face"><span class="in">
    <span class="top"><b${p.n.length>8?` style="font-size:${p.n.length>13?9:p.n.length>11?10:p.n.length>9?11:12}px"`:''}>${esc(p.n)}</b>${chipHTML(p)}</span>
    <span class="art"><span class="fav" data-fav="${p.k}" role="button" aria-label="Favourite" aria-pressed="${FAV.has(p.k)}">★</span><img src="${p.img}" alt="" loading="lazy" decoding="async"></span>
    <span class="tps">${tpills(p.t)}</span>
    <span class="sts">${[0,1,2,3,4,5].map(i=>`<span class="${i===5?'sp':''}"><em style="color:${STATCOL[i]}">${STATS[i]}</em><b>${v[i]}</b></span>`).join('')}</span>
    <span class="abl1">${abOrder(p)}</span>
    <span class="xrow">${L&&CHIP?L.map((f,_,A)=>`<span class="mp${f.m?' m':''}">${f.m?(A.length>2?megaLbl(f).replace('Mega ','M-'):'Mega'):'Base'} <b>${CHIP==='use'?fmtU(uOf(f)):(metricOf(f)||[0,''])[1]}</b></span>`).join(''):''}</span></span></span></div>`;
}
function usOk(p,f){
  if(!f)return true;const t=uTot(p);
  return f==='a'?t>=10:f==='c'?t>=2:f==='m'?t>=0.3:f==='d'?(t>=0.1&&t<2):f==='n'?t<0.1:true;
}
function renderCards(){
  const q=$('#pQ').value.trim().toLowerCase(),ty=$('#pT').value,s=$('#pS').value,ab=$('#pA').value,mv=parseInt($('#pV').value,10),mg=$('#pM').value,fv=$('#pF').checked;
  const tierSel=$('#pU').value,hideLow=s==='use'&&tierSel!=='n';
  const SRCL=mg==='o'?Object.values(MEGAS).flat():BASES;
  let rows=SRCL.filter(p=>(!q||p.n.toLowerCase().includes(q)||p.a.some(a=>a.toLowerCase().includes(q))||(MEGAS[p.k]||[]).some(m=>m.n.toLowerCase().includes(q)))
    &&(!ty||p.t.includes(ty)||(MEGAS[p.k]||[]).some(m=>m.t.includes(ty)))
    &&(!ab||p.a.includes(ab)||(MEGAS[p.k]||[]).some(m=>m.a.includes(ab)))
    &&(isNaN(mv)||spdBase(p)>=mv)
    &&(!mg||mg==='o'||(mg==='y')===!!MEGAS[p.k])&&(!hideLow||uTot(p)>=0.1)
    &&(!fv||FAV.has(p.k))&&usOk(p,$('#pU').value));
  rows=s==='n'?rows.sort((a,b)=>a.n.localeCompare(b.n)):rows.sort((a,b)=>sortVal(b,s)-sortVal(a,s)||a.n.localeCompare(b.n));
  const tierV=$('#pU').value,mvSet=!isNaN(mv);
  CHIP=s==='use'?'use':s==='n'?(tierV?'use':(mvSet?'spe':null)):s;
  {const uAct=CHIP==='use'||!!tierV;
   const sn=$('#srcNote');if(sn)sn.classList.toggle('hide',!uAct);
   const sf=$('#pSrc').closest('.field');if(sf)sf.style.display=uAct?'':'none';
   const fo=$('#fOff');if(fo)fo.style.display=(uAct&&SRCK==='official')?'':'none';
   const dn=$('#dexNote');if(dn)dn.textContent=CHIP==='use'?'Pill = usage in the selected source: S ≥20% · A ≥10% · B ≥5% · C ≥2% · D ≥0.1%. ★ = favourite.':CHIP?'Pill = the stat you sort by. Megas show the same stat at the bottom. ★ = favourite.':'★ = favourite.'}
  $('#pCount').textContent=rows.length+' results';
  {const n=['pT','pA','pV','pU','pM'].filter(id=>$('#'+id).value!=='').length,bd=$('#fBadge');bd.textContent=n;bd.classList.toggle('hide',!n)}
  $('#cards').innerHTML=rows.map(pkCard).join('')||'<p class="note">No Pokémon match these filters.</p>';normAll();
}

/* equal visual size for all sprites: measure opaque bbox, centre it and scale to a common size */
const SPRN=new Map();
function normSprite(img){
  const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return;
  const src=img.currentSrc||img.src;let m=SPRN.get(src);
  if(!m){
    try{
      const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
      const d=x.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
      for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(d[(j*w+i)*4+3]>28){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}}
      if(x1<0)return;
      const bw=x1-x0+1,bh=y1-y0+1,s=Math.min(1.6,.92*Math.max(w,h)/Math.max(bw,bh));
      m={s,tx:(w/2-(x0+x1+1)/2)/w*100,ty:(h/2-(y0+y1+1)/2)/h*100};
    }catch(e){return}
    SPRN.set(src,m);
  }
  img.style.transform=`translate(${m.tx.toFixed(1)}%,${m.ty.toFixed(1)}%) scale(${m.s.toFixed(3)})`;
}
$('#cards').addEventListener('load',e=>{const t=e.target;if(t.tagName==='IMG'&&t.closest('.art'))normSprite(t)},true);
function normAll(){document.querySelectorAll('#cards .art img').forEach(i=>{if(i.complete&&i.naturalWidth)normSprite(i)})}
$('#fToggle').addEventListener('click',()=>{const o=$('#fPanel').classList.toggle('hide');$('#fToggle').setAttribute('aria-expanded',!o)});
let STON=true;try{STON=localStorage.getItem('vgcSt')!=='0'}catch(e){}
$('#pSt').checked=STON;$('#cards').classList.toggle('nostats',!STON);
$('#pSt').addEventListener('change',e=>{STON=e.target.checked;try{localStorage.setItem('vgcSt',STON?'1':'0')}catch(x){}$('#cards').classList.toggle('nostats',!STON)});
$('#pQ').addEventListener('input',deb(renderCards));$('#pV').addEventListener('input',deb(renderCards));['pT','pS','pA','pM','pF','pU'].forEach(id=>$('#'+id).addEventListener('input',renderCards));
$('#modalBox').addEventListener('click',e=>{const t=e.target.closest('[data-tm]');if(t){openCard(t.dataset.tm);const m=$('#modalBox');m.scrollTop=0}});
$('#cards').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('pk')){e.preventDefault();openCard(e.target.dataset.k)}});
$('#cards').addEventListener('click',e=>{
  const f=e.target.closest('[data-fav]');
  if(f){e.stopPropagation();toggleFav(f.dataset.fav);f.setAttribute('aria-pressed',FAV.has(f.dataset.fav));if($('#pF').checked)renderCards();return}
  const b=e.target.closest('.pk');if(b)openCard(b.dataset.k);
});
function matchupsBlock(p){
  const g={4:[],2:[],.5:[],.25:[],0:[]};
  TYPES.forEach(a=>{const m=effVs(a,p.t);if(g[m])g[m].push(a)});
  const lbl={4:'×4',2:'×2',.5:'×½',.25:'×¼',0:'×0'};
  return `<h3 class="h" style="margin-top:18px">Type matchups</h3><div class="mx">${[4,2,.5,.25,0].filter(k=>g[k].length).map(k=>`<div class="cell"><b>${lbl[k]}</b><div class="chips">${g[k].map(t=>`<span class="tp" style="background:${TCOL[t]}">${t}</span>`).join('')}</div></div>`).join('')}</div>`;
}
function spSwitch(){return `<label class="spf"><span>Stats</span><select class="spsel-s"><option value="0"${SPON?'':' selected'}>No SP</option><option value="1"${SPON?' selected':''}>32 SP</option></select></label>`}
function megaLbl(f){if(!f.m)return 'Base';const m=f.n.match(/Mega-([XYZ])$/);return m?'Mega '+m[1]:'Mega'}
function setsBlock(p,base){
  const S=(window.SETS||{}),s=S[p.k]||S[base];
  if(!s)return '<p class="note" style="margin-top:14px">No set data for this Pokémon (under the Smogon usage cut-off).</p>';
  const bars=L=>L.map(([n,v])=>`<div class="sr"><span>${esc(n)}</span><div class="tr"><i style="width:${Math.min(100,v)}%"></i></div><b>${v>=1?Math.round(v)+'%':'<1%'}</b></div>`).join('');
  const tm=s.t.map(([k,v])=>{const q=P.find(x=>x.k===k);return q?`<button class="tmc" data-tm="${k}"><img src="${q.img}" alt=""><span>${esc(q.n)}</span><b>${Math.round(v)}%</b></button>`:''}).join('');
  return `<div class="setsb"><h3 class="h" style="margin:0 0 8px">Abilities · % of sets</h3>${bars(s.a)}<h3 class="h" style="margin:14px 0 8px">Moves · % of sets</h3>${bars(s.m)}<h3 class="h" style="margin:14px 0 8px">Usual teammates · % of teams</h3><div class="tmg">${tm}</div><p class="note" style="margin:8px 0 0;font-size:11.5px">Source: Smogon monthly stats (Reg M-C, 1760+). Moves add up to more than 100% because each set has four.</p></div>`;
}
function openCard(k,base){
  const p=P.find(x=>x.k===k);if(!p)return;
  base=base||(p.m?(BKEY[p.k]||p.k.replace(/mega[xyz]?$/,'')):p.k);
  const forms=[P.find(x=>x.k===base),...(MEGAS[base]||[])].filter(Boolean);
  LASTCARD={k,base};
  const bst=p.b.reduce((a,b)=>a+b,0);
  const rows=STATS.map((l,i)=>{
    const a=stat50(p,i,0,1),b=stat50(p,i,32,1),c=i===0?b:stat50(p,i,32,1.1);
    const w=Math.min(100,(SPON?c:a)/300*100);
    return `<tr><td class="lb" style="color:${STATCOL[i]}">${l}</td><td class="bar"><div class="tr"><i style="width:${w}%;background:${STATCOL[i]}"></i></div></td>${SPON?`<td>${a}</td><td>${b}</td><td><b>${i===0?'–':c}</b></td>`:`<td><b>${a}</b></td>`}</tr>`;
  }).join('');
  const abs=p.ah.map(([n,h])=>{const d=abDesc(n);return `<div class="abl" data-ab="${esc(n)}" role="button" style="cursor:pointer"><b>${esc(n)}</b><span class="tag" style="color:${CATCOL[d.cat]}">${d.cat.toUpperCase()}</span><p>${dsc('a',n,d.d)}</p></div>`}).join('');
  $('#modalBox').style.setProperty('--tc',TCOL[p.t[0]]);
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="hero"><img src="${p.img}" alt=""><div><h2>${nameHTML(p)}</h2><div style="margin-top:8px">${tpills(p.t)}</div><div class="meta">Base stat total ${bst}${p.i?' · Holds '+esc(p.i):''}</div></div></div>
   ${forms.length>1?`<div class="ftabs" style="padding-top:10px">${forms.map(f=>`<button class="${f.m?'mg':'bs'}" data-f="${f.k}" data-b="${base}" aria-pressed="${f.k===p.k}">${f.m?'✦ ':''}${megaLbl(f)}</button>`).join('')}</div>`:''}
   <div class="mact"><button class="favstar" data-fav="${base}" aria-pressed="${FAV.has(base)}" aria-label="Favourite" title="Favourite">${FAV.has(base)?'★':'☆'}</button><button class="btn" data-fq="${base}">Quiz me on this Pokémon</button><button class="btn" data-calc="${p.k}">Damage calc</button></div>
   <div class="mbody">
   <div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 class="h" style="margin:0">Stats at Level 50</h3>${spSwitch()}</div>
   <table class="st"><thead><tr><th></th><th></th>${SPON?'<th>0 SP</th><th>32 SP</th><th>32 SP +</th>':'<th>Lv 50</th>'}</tr></thead><tbody>${rows}</tbody></table>
   ${(()=>{const bp=P.find(x=>x.k===base);const fs=forms.filter(f=>uOf(f)>0);const tot=uTot(bp);
     const cell=s=>{const v=sumSrc(s,bp),S=SRC[s]||{};return `<div class="ucell${s===SRCK?' sel':''}"><small>${esc(S.label||s)}</small><b>${v>0?fmtU(v):'—'}</b><i>${esc(S.date||'')}</i></div>`};
     const brk=forms.length>1?`<div class="ubreak2"><div class="uh">Where the ${fmtU(tot)} comes from (${esc(SRC[SRCK].label)})</div>${forms.map(f=>{const v=uOf(f),w=tot>0?Math.round(v/tot*100):0;return `<div class="ur${f.m?' mg':''}"><span>${f.m?'Mega '+esc(megaLbl(f).replace('Mega','').trim()||'').trim():'Base form'}</span><div class="tr"><i style="width:${w}%"></i></div><b>${fmtU(v)}</b></div>`}).join('')}<div class="ur tot"><span>Total</span><div class="tr"><i style="width:100%"></i></div><b>${fmtU(tot)}</b></div></div>`:'';
     return `<div class="usage"><h3 class="h" style="margin:0 0 8px">Usage · % of teams that bring it</h3><div class="ugrid">${['showdown','official','online'].map(cell).join('')}</div>${brk}<p class="note" style="margin:8px 0 0;font-size:11.5px">Counts the base Pokémon and all its Megas together. Highlighted = source selected in the Dex. “—” = not listed (under 0.1%).</p></div>`})()}
   <h3 class="h" style="margin-top:18px">Speed</h3>
   <div class="speedstrip">${[[SPON?'32 SP +':'Speed',spdBase(p)],[SPON?'32 SP + Scarf':'+ Scarf',spdScarf(p)],[SPON?'32 SP + Tailwind':'+ Tailwind',spdTW(p)]].map(([l,v])=>`<div><small>${l}</small><b>${v}</b></div>`).join('')}</div>
   ${matchupsBlock(p)}
   <h3 class="h" style="margin-top:18px">Abilities</h3>${abs}${setsBlock(p,base)}${movesBlock(base)}</div>`;
  $('#modal').classList.remove('hide');
  $('#mClose').focus();
}
function closeCard(){$('#modal').classList.add('hide');LASTCARD=null}
$('#modal').addEventListener('click',e=>{const fv=e.target.closest('.favstar');if(fv){toggleFav(fv.dataset.fav);fv.setAttribute('aria-pressed',FAV.has(fv.dataset.fav));fv.textContent=FAV.has(fv.dataset.fav)?'★':'☆';renderCards();return}const fq=e.target.closest('[data-fq]');if(fq){closeCard();startFocus(fq.dataset.fq);return}const f=e.target.closest('.ftabs button');if(f){openCard(f.dataset.f,f.dataset.b);return}const ab=e.target.closest('[data-ab]');if(ab){openAbility(ab.dataset.ab);return}const mc=e.target.closest('.mchip');if(mc){openMove(+mc.dataset.mv);return}const lr=e.target.closest('.lr');if(lr){openCard(lr.dataset.k);return}if(e.target.id==='modal'||e.target.id==='mClose')closeCard()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCard()});

/* ---------- SPEED ---------- */
$('#cMon').innerHTML=alpha.map(p=>`<option value="${p.k}">${p.n} (base ${p.s})</option>`).join('');
$('#cMon').value='sneasler';
function calc(){
  const p=P.find(x=>x.k===$('#cMon').value);
  const sp=+$('#cSP').value;$('#cSPv').textContent=sp;
  const nat=+($$('input[name=cNat]').find(r=>r.checked).value);
  let v=spd(p.s,sp,nat);
  const st=+$('#cStage').value;
  if(st!==0)v=Math.floor(v*stageMult(st));
  if($('#cScarf').checked)v=Math.floor(v*1.5);
  if($('#cAbil').checked)v=v*2;
  if($('#cTW').checked)v=v*2;
  if($('#cPara').checked)v=Math.floor(v*.5);
  const tr=$('#cTR').checked;
  $('#cOut').innerHTML=`<img src="${p.img}" alt="">${v}<small>${esc(p.n)}</small>`;
  const parts=[`base ${p.s}`,`${sp} SP`,nat===1.1?'+Spe':nat===.9?'−Spe':'neutral'];
  if(st)parts.push((st>0?'+':'')+st);
  if($('#cScarf').checked)parts.push('Scarf');
  if($('#cAbil').checked)parts.push('ability ×2');
  if($('#cTW').checked)parts.push('Tailwind');
  if($('#cPara').checked)parts.push('paralyzed');
  $('#cLine').textContent=parts.join(' · ');
  renderLadder(p,v,tr);
  renderSpeedTable();
}
function renderLadder(me,v,tr){
  const sc=SCEN[$('#cRival').value],m=$('#lM').value;
  const groups={};let win=0,tie=0,lose=0;
  P.forEach(q=>{
    if(!formOk(q,m)&&q.k!==me.k)return;
    const r=sc.f(q.s);(groups[r]||(groups[r]=[])).push(q);
    if(q.k===me.k)return;
    if(r===v)tie++;else if(tr?v<r:v>r)win++;else lose++;
  });
  $('#cSum').innerHTML=`<div class="g"><b>${win}</b><small>you move first</small></div><div class="w"><b>${tie}</b><small>tie</small></div><div class="b"><b>${lose}</b><small>they move first</small></div>`;
  const vals=Object.keys(groups).map(Number).sort((a,b)=>b-a);
  let h='',placed=false;
  const line=`<div class="me-line mid"><img src="${me.img}" alt="" width="28" height="28"> ${esc(me.n)} <b>${v}</b>${tr?' · Trick Room: lower Speed goes first':''}</div>`;
  vals.forEach(val=>{
    if(!placed&&val<=v){h+=line;placed=true}
    const cls=val===v?'tie':(tr?v<val:v>val)?'win':'lose';
    h+=`<div class="lrow ${cls}"><div class="lv">${val}</div><div class="lm">${groups[val].map(q=>`<img src="${q.img}" alt="${esc(q.n)}" title="${esc(q.n)} · ${val}" loading="lazy" class="${q.k===me.k?'me':''}">`).join('')}</div></div>`;
  });
  if(!placed)h+=line;
  $('#ladder').innerHTML=h;
  scrollLadder();
}
function scrollLadder(){
  requestAnimationFrame(()=>{
    const l=$('#ladder'),m=l&&l.querySelector('.me-line');
    if(l&&m&&l.clientHeight)l.scrollTop=Math.max(0,m.offsetTop-l.clientHeight/2);
  });
}
['cMon','cSP','cStage','cScarf','cAbil','cTW','cPara','cTR','cRival','lM'].forEach(id=>$('#'+id).addEventListener('input',calc));
$$('input[name=cNat]').forEach(r=>r.addEventListener('change',calc));

document.addEventListener('click',e=>{const b=e.target.closest('[data-scroll]');if(!b)return;const t=document.querySelector(b.dataset.scroll);if(t)t.scrollIntoView({block:'start'})});
let sortKey='32+',sortDir=-1;
const COLS=[['n','Pokémon'],['0=','0 SP'],['s','Base'],['32=','32 SP'],['32+','32 SP +'],['scarf','+ Scarf'],['tw','+ Tailwind'],['0-','0 SP −']];
function rowVal(p,k){if(k==='n')return p.n.toLowerCase();if(k==='s')return p.s;return SCEN[k].f(p.s)}
function renderSpeedTable(){
  const q=$('#fQ').value.trim().toLowerCase(),m=$('#fM').value;
  let rows=P.filter(p=>(!q||p.n.toLowerCase().includes(q))&&formOk(p,m));
  rows.sort((a,b)=>{const x=rowVal(a,sortKey),y=rowVal(b,sortKey);return (x>y?1:x<y?-1:0)*sortDir||b.s-a.s});
  $('#spT thead').innerHTML='<tr>'+COLS.map(([k,l])=>`<th data-k="${k}" ${k===sortKey?`aria-sort="${sortDir>0?'ascending':'descending'}"`:''}>${l}${k===sortKey?(sortDir>0?' ▲':' ▼'):''}</th>`).join('')+'</tr>';
  const sel=$('#cMon').value;
  $('#spT tbody').innerHTML=rows.map(p=>`<tr class="${p.k===sel?'sel':''}"><td><div class="who"><img src="${p.img}" alt="" loading="lazy" decoding="async"><span>${nameHTML(p)}</span></div></td><td class="num">${SCEN['0='].f(p.s)}</td><td class="num">${p.s}</td><td class="num">${SCEN['32='].f(p.s)}</td><td class="num hi"><b>${SCEN['32+'].f(p.s)}</b></td><td class="num hi"><b>${SCEN['scarf'].f(p.s)}</b></td><td class="num">${SCEN['tw'].f(p.s)}</td><td class="num dim">${SCEN['0-'].f(p.s)}</td></tr>`).join('');
}
$('#spT').addEventListener('click',e=>{
  const th=e.target.closest('th');if(!th)return;
  const k=th.dataset.k;
  if(k===sortKey)sortDir*=-1;else{sortKey=k;sortDir=k==='n'?1:-1}
  renderSpeedTable();
});
$('#fQ').addEventListener('input',deb(renderSpeedTable));
$('#fM').addEventListener('input',renderSpeedTable);

/* ---------- TYPES ---------- */
function buildTypes(){
  const sel=a=>a.map(t=>`<option value="${t}">${t}</option>`).join('');
  $('#dT1').innerHTML=sel(TYPES);
  $('#dT2').innerHTML='<option value="">— none —</option>'+sel(TYPES);
  $('#dT1').value='Water';
  $('#dMon').innerHTML='<option value="">— choose —</option>'+alpha.map(p=>`<option value="${p.k}">${p.n}</option>`).join('');
  let h='<thead><tr><th style="background:none"></th>'+TYPES.map(t=>`<th data-c="${t}" style="background:${TCOL[t]}" title="${t}">${t.slice(0,3)}</th>`).join('')+'</tr></thead><tbody>';
  TYPES.forEach(a=>{
    h+=`<tr><th data-r="${a}" style="background:${TCOL[a]}" title="${a}">${a.slice(0,3)}</th>`;
    TYPES.forEach(d=>{const m=eff(a,d);h+=`<td data-r="${a}" data-c="${d}" class="${m===2?'m2':m===.5?'m05':m===0?'m0':''}" title="${a} → ${d}: ×${m}">${m===1?'':m===.5?'½':m}</td>`});
    h+='</tr>';
  });
  $('#tc').innerHTML=h+'</tbody>';
  defOut();
}
function defOut(){
  const defs=[$('#dT1').value,$('#dT2').value].filter(Boolean);
  const p=P.find(x=>x.k===$('#dMon').value);
  $('#defTop').innerHTML=p?`<div class="def-top"><img src="${p.img}" alt=""><div><b>${nameHTML(p)}</b><div>${tpills(p.t)}</div></div></div>`:`<div class="def-top"><div>${tpills(defs)}</div></div>`;
  const g={4:[],2:[],1:[],.5:[],.25:[],0:[]};
  TYPES.forEach(a=>{const m=effVs(a,defs);(g[m]||(g[m]=[])).push(a)});
  const lbl={4:'×4',2:'×2',.5:'×½',.25:'×¼',0:'×0'};
  const fmtM=m=>m===1?'1':m===0?'0':m===.5?'½':m===.25?'¼':'×'+m;
  const cls=m=>m>=4?'x4':m>1?'x2':m===0?'x0':m===.25?'x025':m<1?'x05':'';
  const order=TYPES.map(a=>({a,m:effVs(a,defs),m1:eff(a,defs[0]),m2:defs[1]?eff(a,defs[1]):null})).sort((x,y)=>y.m-x.m||TYPES.indexOf(x.a)-TYPES.indexOf(y.a));
  const BAND={4:['×4','Double weakness'],2:['×2','Weak'],1:['×1','Neutral'],.5:['×½','Resists'],.25:['×¼','Double resistance'],0:['×0','Immune']};
  const bandCls={4:'x4',2:'x2',1:'x1',.5:'x05',.25:'x025',0:'x0'};
  $('#defOut').innerHTML=defs.length?[4,2,1,.5,.25,0].filter(k=>(g[k]||[]).length).map(k=>`<div class="band ${bandCls[k]}"><div class="bm"><b>${BAND[k][0]}</b><small>${BAND[k][1]}</small></div><div class="bt">${g[k].map(t=>`<span class="tp" style="background:${TCOL[t]}">${t}</span>`).join('')}</div></div>`).join(''):'';
  $('#defTbl').innerHTML=defs.length>1?`<h3 class="h" style="margin-top:16px">Breakdown by type</h3><table class="dtbl"><thead><tr><th style="text-align:left">Attacking</th><th>vs ${defs[0]}</th><th>vs ${defs[1]}</th><th class="tot">Total</th></tr></thead><tbody>${order.map(o=>`<tr><td><span class="tp" style="background:${TCOL[o.a]}">${o.a}</span></td><td class="sub ${cls(o.m1)}">${fmtM(o.m1)}</td><td class="sub ${cls(o.m2)}">${fmtM(o.m2)}</td><td class="tot ${cls(o.m)}">${o.m===0?'×0':o.m===.5?'×½':o.m===.25?'×¼':'×'+o.m}</td></tr>`).join('')}</tbody></table>`:'';
}
$('#dT1').addEventListener('input',()=>{$('#dMon').value='';defOut()});
$('#dT2').addEventListener('input',()=>{$('#dMon').value='';defOut()});
$('#dMon').addEventListener('input',()=>{
  const p=P.find(x=>x.k===$('#dMon').value);if(!p)return defOut();
  $('#dT1').value=p.t[0];$('#dT2').value=p.t[1]||'';defOut();
});
$('#tc').addEventListener('click',e=>{
  const c=e.target.closest('td');
  $$('#tc .hl').forEach(x=>x.classList.remove('hl'));
  if(!c)return;
  $$(`#tc [data-r="${c.dataset.r}"]`).forEach(x=>x.classList.add('hl'));
  $$(`#tc [data-c="${c.dataset.c}"]`).forEach(x=>x.classList.add('hl'));
});
$('#tc').addEventListener('mouseover',e=>{
  const c=e.target.closest('td');
  $$('#tc .hl').forEach(x=>x.classList.remove('hl'));
  if(!c)return;
  $$(`#tc [data-r="${c.dataset.r}"]`).forEach(x=>x.classList.add('hl'));
  $$(`#tc [data-c="${c.dataset.c}"]`).forEach(x=>x.classList.add('hl'));
});
/* team check */
let TEAM=['','','','','',''];try{const t=JSON.parse(localStorage.getItem('vgcTeam')||'[]');if(Array.isArray(t))TEAM=[0,1,2,3,4,5].map(i=>BYK[t[i]]?t[i]:'')}catch(e){}
function renderTeam(){
  const opts='<option value="">— empty —</option>'+alpha.map(p=>`<option value="${p.k}">${esc(p.n)}</option>`).join('');
  $('#teamSel').innerHTML=TEAM.map((k,i)=>`<select data-i="${i}" aria-label="Team slot ${i+1}">${opts}</select>`).join('');
  $$('#teamSel select').forEach((el,i)=>el.value=TEAM[i]);
  const mem=TEAM.map(k=>BYK[k]).filter(Boolean);
  if(!mem.length){$('#teamOut').innerHTML='<p class="note">Add Pokémon to see your team\'s weaknesses.</p>';return}
  let rows='',exposed=[];
  TYPES.forEach(a=>{
    const ms=mem.map(p=>effVs(a,p.t));
    const weak=ms.filter(m=>m>1).length,res=ms.filter(m=>m<1).length;
    const expo=weak>=2&&weak>res;if(expo)exposed.push(a);
    rows+=`<tr class="${expo?'expo':''}"><td class="tn"><span class="tp" style="background:${TCOL[a]}">${a}</span></td>${ms.map(m=>`<td class="${m>=4?'bad4':m>1?'bad':m===0?'imm':m<1?'good':''}">${m===1?'':m===0?'0':m===.5?'½':m===.25?'¼':'×'+m}</td>`).join('')}<td class="tot">${weak||''}</td><td class="tot">${res||''}</td></tr>`;
  });
  const covered=TYPES.filter(d=>mem.some(p=>p.t.some(t=>eff(t,d)>=2)));
  const gaps=TYPES.filter(d=>!covered.includes(d));
  $('#teamOut').innerHTML=`<div class="mx" style="margin-bottom:14px">
     <div class="cell"><b>Exposed types</b><div class="chips">${exposed.map(t=>`<span class="tp" style="background:${TCOL[t]}">${t}</span>`).join('')||'<span class="note" style="margin:0">None: no type hits 2+ of your team without being resisted.</span>'}</div></div>
     <div class="cell"><b>STAB gaps</b><div class="chips">${gaps.map(t=>`<span class="tp" style="background:${TCOL[t]}">${t}</span>`).join('')||'<span class="note" style="margin:0">Your STABs hit every type super effectively.</span>'}</div><div class="note" style="margin:6px 0 0">Types none of your STABs hit super effectively.</div></div></div>
   <div class="tablewrap" style="overflow-x:auto"><table class="teamtbl"><thead><tr><th>Attacking</th>${mem.map(p=>`<th><img src="${p.img}" alt="">${esc(p.n)}</th>`).join('')}<th>Weak</th><th>Res.</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
$('#teamSel').addEventListener('change',e=>{const el=e.target.closest('select');if(!el)return;TEAM[+el.dataset.i]=el.value;try{localStorage.setItem('vgcTeam',JSON.stringify(TEAM))}catch(x){}renderTeam()});
$('#tSub').addEventListener('click',e=>{const b=e.target.closest('.gchip');if(!b)return;$$('#tSub .gchip').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#tp-chart').classList.toggle('hide',b.dataset.t!=='chart');$('#tp-team').classList.toggle('hide',b.dataset.t!=='team');if(b.dataset.t==='team')renderTeam()});
$('#tc').addEventListener('mouseleave',()=>$$('#tc .hl').forEach(x=>x.classList.remove('hl')));

/* ---------- ABILITIES ---------- */
const HOLD={};
P.forEach(p=>p.ah.forEach(([n,h])=>{(HOLD[n]||(HOLD[n]=[])).push({p,h})}));
const CATS=['All','Speed','Weather & Terrain','Damage','Defense','Utility','Other'];
$('#aCat').innerHTML=CATS.map(c=>`<option>${c}</option>`).join('');
const KEYAB=['Intimidate','Prankster','Drought','Drizzle','Sand Stream','Snow Warning','Grassy Surge','Electric Surge','Psychic Surge','Misty Surge','Unburden','Defiant','Competitive','Good as Gold','Armor Tail','Lightning Rod','Storm Drain','Flash Fire','Levitate','Sheer Force','Regenerator','Multiscale','Fake Out','Swift Swim','Chlorophyll','Sand Rush','Slush Rush','Surge Surfer','Protosynthesis','Quark Drive','Parental Bond','Moxie','Technician','Huge Power','Magic Bounce','Unaware','Fur Coat','Sturdy','Hospitality','Costar','Supreme Overlord'];
function renderAb(){
  const q=$('#aQ').value.trim().toLowerCase(),c=$('#aCat').value;
  const items=Object.keys(HOLD).map(k=>({k,...abDesc(k),mons:HOLD[k]}))
    .filter(x=>(c==='All'||x.cat===c)&&(!q||hasQ('a',x.k,q)||x.mons.some(m=>m.p.n.toLowerCase().includes(q))))
    .sort((a,b)=>b.mons.length-a.mons.length||a.k.localeCompare(b.k));
  $('#aCount').textContent=items.length+' abilities';
  const compact=!$('#aMons').checked;
  $('#abGrid').classList.toggle('compact',compact);
  const card=x=>`<div class="ab" data-ab="${esc(x.k)}" role="button" tabindex="0" style="--c:${CATCOL[x.cat]}"><h4><span>${bi('a',x.k)}</span><span class="cat">${x.cat}</span></h4><p title="${esc(x.d)}">${dsc('a',x.k,x.d)}</p>${compact?`<div class="abn">${x.mons.length} Pokémon · tap for details</div>`:`<div class="chips">${x.mons.map(m=>`<span class="chip"><img src="${m.p.img}" alt="">${esc(m.p.n)}</span>`).join('')}</div>`}</div>`;
  if(!q&&c==='All'){
    const key=KEYAB.map(k=>items.find(x=>x.k===k)).filter(Boolean),rest=items.filter(x=>!key.includes(x));
    $('#abGrid').innerHTML=`<h3 class="h span">Key abilities in VGC (${key.length})</h3>${key.map(card).join('')}<h3 class="h span">All other abilities (${rest.length})</h3>${rest.map(card).join('')}`;
  }else $('#abGrid').innerHTML=items.map(card).join('')||'<p class="note">No results.</p>';
}
function dlSwitch(){document.body.classList.remove('dl-en','dl-es','dl-both');document.body.classList.add('dl-'+DL);$$('[data-dlsw]').forEach(e=>{e.innerHTML='<span>Descriptions</span>'+[['en','English'],['es','Español'],['both','Both']].map(([k,l])=>`<button class="gchip" data-dl="${k}" aria-pressed="${k===DL}">${l}</button>`).join('')})}
document.addEventListener('click',e=>{const b=e.target.closest('[data-dl]');if(!b)return;DL=b.dataset.dl;try{localStorage.setItem('vgcDesc',DL)}catch(x){}dlSwitch();if(DONE.abilities)renderAb();if(DONE.moves)renderMoves();if(DONE.items&&window.renderItems)renderItems()});
dlSwitch();
$('#aQ').addEventListener('input',deb(renderAb));$('#aCat').addEventListener('input',renderAb);$('#aMons').addEventListener('change',renderAb);
$('#abGrid').addEventListener('click',e=>{const a=e.target.closest('.ab[data-ab]');if(a)openAbility(a.dataset.ab)});
$('#abGrid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset&&e.target.dataset.ab){e.preventDefault();openAbility(e.target.dataset.ab)}});
function openAbility(name){
  const d=abDesc(name),mons=(HOLD[name]||[]).map(x=>x.p).sort((a,b)=>uTot(b)-uTot(a)||a.n.localeCompare(b.n));
  const boost=[],block=[];
  MV.forEach((m,i)=>{const fx=abilityFx(m);if(fx.boosted.includes(name))boost.push([m,i]);if(fx.blocked.includes(name))block.push([m,i])});
  const mchips=L=>L.length?`<div class="mchips">${L.sort((a,b)=>a[0].n.localeCompare(b[0].n)).map(([m,i])=>`<button class="mchip" data-mv="${i}" style="--c:${TCOL[m.t]}" title="${esc(m.d)} · ${esc(ESN('m',m.n))}">${esc(m.n)}${m.c!=='T'?`<small>${m.p||''}</small>`:''}</button>`).join('')}</div>`:'<p class="note" style="margin:0">None tracked.</p>';
  LASTCARD=null;
  $('#modalBox').style.setProperty('--tc',CATCOL[d.cat]);
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="hero" style="padding:20px 18px 14px"><div><h2>${bi('a',name)}</h2><div style="margin-top:8px"><span class="cp" style="--c:${CATCOL[d.cat]}">${d.cat}</span></div></div></div>
   <div class="mbody">
   <div class="mdesc">${dsc('a',name,d.d)}</div>
   <h3 class="h">Pokémon with it (${mons.length}) <small style="font-weight:400;color:var(--muted)">· tap one to open it</small></h3>
   <div class="lgrid" style="margin-bottom:16px">${mons.map(p=>`<button class="lr" data-k="${p.k}"><img src="${p.img}" alt="" loading="lazy" decoding="async"><span>${esc(p.n)}</span></button>`).join('')}</div>
   <div class="fxgrid"><div class="abcol up"><h4>Moves it boosts or enables</h4>${mchips(boost)}</div><div class="abcol dn"><h4>Moves it blocks or punishes</h4>${mchips(block)}</div></div>
   </div>`;
  $('#modal').classList.remove('hide');$('#mClose').focus();$('#modalBox').scrollTop=0;
}

/* ---------- NATURES ---------- */
function renderNat(){
  const S=['Atk','Def','SpA','SpD','Spe'];
  let h='<thead><tr><th></th>'+S.map(s=>`<th class="hdr-dn">−${SL(s)}</th>`).join('')+'</tr></thead><tbody>';
  S.forEach(u=>{
    h+=`<tr><th class="hdr-up" style="text-align:right;padding-right:6px">+${SL(u)}</th>`;
    S.forEach(d=>{
      const n=NATS.find(x=>u===d?(!x[1]&&NATS.indexOf(x)===S.indexOf(u)*6):(x[1]===u&&x[2]===d));
      if(u===d)h+=`<td class="neu">${bi('n',n[0])}</td>`;
      else h+=`<td class="${u==='Spe'?'spe':d==='Spe'?'dn':''}">${bi('n',n[0])}</td>`;
    });
    h+='</tr>';
  });
  $('#ng').innerHTML=h+'</tbody>';
}
$('#metaNat tbody').innerHTML=METANAT.map(r=>{
  const n=NATS.find(x=>x[0]===r[1]);
  const mp=P.find(x=>x.n===r[0]);
  return `<tr><td><div class="who">${mp?`<img src="${mp.img}" alt="">`:''}<span>${r[0]}</span></div></td><td><b>${bi('n',r[1])}</b> ${n[1]?`<span class="chip plain g">+${SL(n[1])}</span>`:''} ${n[2]?`<span class="chip plain b">−${SL(n[2])}</span>`:''}</td><td>${r[2].replace(/\bSpA\b/g,'SpAtk').replace(/\bSpD\b/g,'SpDef')}</td><td>${r[3]}</td></tr>`;
}).join('');

/* ---------- MOVES ---------- */
const MV=window.MOVES||[];
const BYK=Object.fromEntries(P.map(p=>[p.k,p]));
const CATN={P:'Physical',S:'Special',T:'Status'};
const CATC={P:'#e2751d',S:'#4f86ec',T:'#7a8aa0'};
const PROPN={contact:'Contact',sound:'Sound',punch:'Punch',bite:'Bite',slicing:'Slicing',wind:'Wind',pulse:'Pulse',powder:'Powder',bullet:'Ball/Bomb',dance:'Dance'};
const GROUPS=['Priority','Speed control','Protection','Redirection','Spread','Setup','Status condition','Recovery','Pivot','Weather & Terrain','Field effect','Screens','Ally support','Disruption','Stat drop','Flinch','Force switch','Negative priority','Hazards','Recoil','Drain','Multi-hit','Self-KO'];
let LEARNERS=null;
function learners(i){
  if(!LEARNERS){LEARNERS=MV.map(()=>[]);for(const k in window.LEARN)window.LEARN[k].forEach(j=>LEARNERS[j].push(k))}
  return LEARNERS[i];
}
const mvPill=m=>`<span class="tp" style="background:${TCOL[m.t]}">${m.t}</span>`;
const catPill=m=>`<span class="cp" style="--c:${CATC[m.c]}">${CATN[m.c]}</span>`;
const prStr=m=>m.pr?(m.pr>0?'+':'')+m.pr:'0';
const numsStr=m=>`${m.c==='T'?'':`<span>Power <b>${m.p||'–'}</b></span>`}<span>Acc <b>${m.a||'–'}</b></span><span>PP <b>${m.pp}</b></span><span>Priority <b>${prStr(m)}</b></span>`;
let mvGroup='';
function initMoves(){
  const gb=g=>`<button class="gchip" data-g="${g}" aria-pressed="${g===''}">${g||'All'} <i>${g?MV.filter(m=>m.g.includes(g)).length:MV.length}</i></button>`;
  $('#mGroups').innerHTML=gb('')+GROUPS.map(gb).join('');
  $('#mT').innerHTML='<option value="">All types</option>'+TYPES.map(t=>`<option>${t}</option>`).join('');
  $('#mP').innerHTML='<option value="">Any property</option>'+Object.entries(PROPN).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  renderMoves();
}
function renderMoves(){
  const q=$('#mQ').value.trim().toLowerCase(),c=$('#mC').value,t=$('#mT').value,pr=$('#mP').value,s=$('#mS').value;
  let rows=MV.map((m,i)=>[m,i]).filter(([m])=>(!mvGroup||m.g.includes(mvGroup))&&(!c||m.c===c)&&(!t||m.t===t)&&(!pr||m.f.includes(pr))&&(!q||hasQ('m',m.n,q)||m.d.toLowerCase().includes(q)));
  const key={n:null,p:([m])=>-m.p,a:([m])=>-(m.a||101),pp:([m])=>-m.pp,pr:([m])=>-m.pr,l:([,i])=>-learners(i).length}[s];
  if(key)rows.sort((x,y)=>key(x)-key(y)||x[0].n.localeCompare(y[0].n));
  $('#mCount').textContent=rows.length+' moves';
  {const n=[c?1:0,t?1:0,pr?1:0,s!=='n'?1:0].reduce((a,b)=>a+b,0),bd=$('#mFBadge');bd.textContent=n;bd.classList.toggle('hide',!n)}
  $('#mList').innerHTML=rows.map(([m,i])=>`<button class="mv" data-mv="${i}" style="--c:${TCOL[m.t]}"><span class="mh">${mvPill(m)}<b>${bi('m',m.n)}</b>${catPill(m)}</span><span class="mn">${numsStr(m)}</span><span class="md">${dsc('m',m.n,m.d)}</span></button>`).join('')||'<p class="note">No moves match.</p>';
}
$('#tab-moves').addEventListener('click',e=>{
  const b=e.target.closest('.gchip[data-g]');if(!b)return;
  mvGroup=b.dataset.g;$$('#mGroups .gchip,#mGroups2 .gchip').forEach(x=>x.setAttribute('aria-pressed',x.dataset.g===mvGroup));renderMoves();
});
$('#mFToggle').addEventListener('click',()=>{const o=$('#mFPanel').classList.toggle('hide');$('#mFToggle').setAttribute('aria-expanded',!o)});
['mC','mT','mP','mS'].forEach(id=>$('#'+id).addEventListener('input',renderMoves));
$('#mQ').addEventListener('input',deb(renderMoves));
$('#mList').addEventListener('click',e=>{const b=e.target.closest('.mv');if(b)openMove(+b.dataset.mv)});
const FXB={sound:['Soundproof'],bullet:['Bulletproof'],powder:['Overcoat'],wind:['Wind Rider']};
const FXT={Fire:['Flash Fire','Well-Baked Body','Thick Fat','Heatproof'],Water:['Water Absorb','Storm Drain','Dry Skin'],Electric:['Volt Absorb','Lightning Rod','Motor Drive'],Ground:['Levitate','Earth Eater'],Grass:['Sap Sipper'],Ice:['Thick Fat']};
const BOOSTB={punch:['Iron Fist'],bite:['Strong Jaw'],slicing:['Sharpness'],pulse:['Mega Launcher'],wind:['Wind Power'],contact:['Tough Claws'],dance:['Dancer'],sound:['Liquid Voice','Punk Rock']};
const BOOSTT={Grass:['Overgrow'],Fire:['Blaze'],Water:['Torrent'],Bug:['Swarm'],Electric:['Transistor'],Dragon:["Dragon's Maw"]};
function abilityFx(m){
  const blocked=[...(FXT[m.t]||[]),...m.f.flatMap(f=>FXB[f]||[])];
  const boosted=[...(BOOSTT[m.t]||[]),...m.f.flatMap(f=>BOOSTB[f]||[])];
  const extra=[];
  if(m.g.includes('Multi-hit'))boosted.push('Skill Link');
  if(m.g.includes('Recoil'))boosted.push('Reckless');
  if(m.c==='T'&&m.pr>0)boosted.push('Prankster');
  if(m.t==='Flying'&&m.pr>0)boosted.push('Gale Wings');
  if(m.f.includes('contact'))blocked.push('Rough Skin','Iron Barbs','Flame Body','Static');
  const ok=n=>HOLD[n];
  return {blocked:[...new Set(blocked)].filter(ok),boosted:[...new Set(boosted)].filter(ok)};
}
function similarMoves(i){
  const m=MV[i],tags=m.g.filter(g=>g!=='Status move');
  let l=MV.map((x,j)=>[x,j]).filter(([x,j])=>j!==i&&(tags.length?x.g.filter(g=>tags.includes(g)).length>0&&(x.c==='T')===(m.c==='T'):x.t===m.t&&x.c===m.c));
  l.forEach(a=>a[2]=a[0].g.filter(g=>tags.includes(g)).length*10-(Math.abs(a[0].p-m.p)/10)-(a[0].t===m.t?-2:0));
  return l.sort((a,b)=>b[2]-a[2]||a[0].n.localeCompare(b[0].n)).slice(0,12);
}
const mMeter=(l,v,max,txt,col)=>`<div class="mm"><small>${l}</small><b>${txt}</b><div class="tr"><i style="width:${Math.max(4,Math.min(100,v/max*100))}%;background:${col}"></i></div></div>`;
function openMove(i){
  const m=MV[i];if(!m)return;
  const L=learners(i).map(k=>BYK[k]).filter(Boolean).sort((a,b)=>a.n.localeCompare(b.n));
  const tags=[...m.g.filter(g=>g!=='Status move'),...m.f.map(f=>PROPN[f])];
  LASTCARD=null;
  $('#modalBox').style.setProperty('--tc',TCOL[m.t]);
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="hero" style="padding:20px 18px 14px"><div><h2>${bi('m',m.n)}</h2><div style="margin-top:8px">${mvPill(m)} ${catPill(m)}</div></div></div>
   <div class="mbody">
   <div class="mdesc">${dsc('m',m.n,m.d)}</div>
   <div class="mmeters">
     ${m.c!=='T'?mMeter('Power',m.p||0,150,m.p||'–','#ff6b4a'):''}
     ${mMeter('Accuracy',m.a||100,100,m.a?m.a+'%':'Never misses','#4fd0ff')}
     ${mMeter('PP',m.pp,40,m.pp,'#9be86f')}
     <div class="mm"><small>Priority</small><b class="${m.pr>0?'up':m.pr<0?'dn':''}">${prStr(m)}<em>${m.pr>0?'moves earlier':m.pr<0?'moves later':'normal order'}</em></b></div>
     <div class="mm wide"><small>Target</small><b style="font-family:var(--body);font-size:14px">${esc(m.tg)}</b></div>
   </div>
   ${tags.length?`<div class="chips" style="margin:12px 0 16px">${tags.map(t=>`<span class="chip plain">${esc(t)}</span>`).join('')}</div>`:''}
   ${(()=>{const fx=abilityFx(m);
     const tile=(a,k)=>`<button class="abt ${k}" data-ab="${esc(a)}"><i>${k==='up'?'▲':'▼'}</i><span><b>${bi('a',a)}</b><small>${dsc('a',a,abDesc(a).d)}</small></span></button>`;
     if(!fx.boosted.length&&!fx.blocked.length)return '';
     return `<h3 class="h">Abilities that matter</h3><div class="fxgrid">${fx.boosted.length?`<div class="abcol up"><h4>Boosted by</h4>${fx.boosted.map(a=>tile(a,'up')).join('')}</div>`:''}${fx.blocked.length?`<div class="abcol dn"><h4>Blocked / punished by</h4>${fx.blocked.map(a=>tile(a,'dn')).join('')}</div>`:''}</div>`})()}
   ${(()=>{const sm=similarMoves(i);return sm.length?`<h3 class="h">Similar moves</h3><div class="mchips" style="margin-bottom:16px">${sm.map(([x,j])=>`<button class="mchip" data-mv="${j}" style="--c:${TCOL[x.t]}" title="${esc(x.d)}">${esc(x.n)}${x.c!=='T'?`<small>${x.p||''}</small>`:''}</button>`).join('')}</div>`:''})()}
   <h3 class="h">Learned by (${L.length})</h3>
   <div class="lgrid">${L.map(p=>`<button class="lr" data-k="${p.k}"><img src="${p.img}" alt="" loading="lazy" decoding="async"><span>${esc(p.n)}</span></button>`).join('')}</div></div>`;
  $('#modal').classList.remove('hide');$('#mClose').focus();
}
function movesBlock(base){
  const ids=(window.LEARN||{})[base];if(!ids||!ids.length)return '';
  const ms=ids.map(i=>[MV[i],i]);
  const used=new Set();
  const take=(label,f)=>{const l=ms.filter(([m,i])=>!used.has(i)&&f(m));l.forEach(([,i])=>used.add(i));return [label,l]};
  const secs=[
    take('Priority attacks',m=>m.g.includes('Priority')&&m.c!=='T'),
    take('Protection & redirection',m=>m.g.includes('Protection')||m.g.includes('Redirection')),
    take('Speed control & field',m=>m.g.includes('Speed control')||m.g.includes('Weather & Terrain')||m.g.includes('Field effect')||m.g.includes('Screens')),
    take('Support & status',m=>m.c==='T'),
    take('Physical attacks',m=>m.c==='P'),
    take('Special attacks',m=>m.c==='S')
  ].filter(([,l])=>l.length);
  secs.forEach(([lab,l])=>{if(lab.endsWith('attacks'))l.sort((a,b)=>b[0].p-a[0].p||a[0].n.localeCompare(b[0].n));else l.sort((a,b)=>a[0].n.localeCompare(b[0].n))});
  return `<details class="mdet"><summary>Moves (${ids.length})</summary>${secs.map(([lab,l])=>`<h4>${lab} <i>${l.length}</i></h4><div class="mchips">${l.map(([m,i])=>`<button class="mchip" data-mv="${i}" style="--c:${TCOL[m.t]}" title="${esc(m.d)}">${esc(m.n)}${m.c!=='T'?`<small>${m.p||''}</small>`:''}</button>`).join('')}</div>`).join('')}</details>`;
}

/* ---------- QUIZ ---------- */
const sdU=p=>(USAGES.showdown||{})[p.k]||0;
const POOLTH={'03':0.3,'01':0.1,all:0};
function poolFor(sel){return sel==='all'?P:P.filter(p=>sdU(p)>=POOLTH[sel])}
let POOLSEL='03';try{const v=localStorage.getItem('vgcPool');POOLSEL=v==='all'?'all':v==='01'?'01':'03'}catch(e){}
let POOL=poolFor(POOLSEL);
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function pickN(arr,n,ok=()=>true,avoid=[]){
  const out=[];
  for(const x of shuffle(arr)){if(out.length>=n)break;if(ok(x)&&!avoid.includes(x)&&!out.includes(x))out.push(x)}
  return out;
}
const strip=h=>String(h).replace(/<span class="es">/g,' · ').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const todayStr=(o=0)=>{const d=new Date(Date.now()+o*864e5);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seeded(seed,fn){const o=Math.random;Math.random=mulberry(seed);try{return fn()}finally{Math.random=o}}
const SECS=[['mixed','Mixed'],['pokemon','Pokémon'],['speed','Speed'],['types','Types'],['abilities','Abilities'],['natures','Natures'],['moves','Moves'],['items','Items']];
const opt=(html,ok,k)=>({html,ok,k});
const monOpt=(p,ok)=>opt(esc(p.n),ok,p.k);
const typeStr=t=>tpills(t);
const natFx=n=>n[1]?`+${SL(n[1])} −${SL(n[2])}`:'neutral';
const NATP=NATS.filter(n=>n[1]);
const GQ=['Protection','Redirection','Speed control','Pivot','Setup','Recovery','Weather & Terrain','Field effect','Screens','Ally support','Status condition','Disruption','Force switch'];
const mvName=m=>`<b>${bi('m',m.n)}</b>`;
const MODS=[{l:'+1 stage',f:v=>Math.floor(v*1.5)},{l:'+2 stages',f:v=>v*2},{l:'−1 stage',f:v=>Math.floor(v*2/3)},{l:'paralyzed',f:v=>Math.floor(v/2)},{l:'Choice Scarf',f:v=>Math.floor(v*1.5)},{l:'Tailwind',f:v=>v*2}];
const WEATHER=[['Rain','Swift Swim'],['Sun','Chlorophyll'],['Sandstorm','Sand Rush'],['Snow','Slush Rush'],['Electric Terrain','Surge Surfer']];
const RULES=[['Soundproof','blocks','sound'],['Iron Fist','boosts','punch'],['Strong Jaw','boosts','bite'],['Sharpness','boosts','slicing'],['Wind Rider','absorbs','wind'],['Overcoat','blocks','powder'],['Bulletproof','blocks','bullet'],['Mega Launcher','boosts','pulse'],['Tough Claws','boosts','contact'],['Rough Skin','punishes','contact']];
const G={};
G.pokemon=[
 ()=>{const p=rnd(POOL);return{prompt:'Who is this Pokémon?',ik:p.k,opts:[opt(esc(p.n),1),...pickN(POOL,3,x=>x.n!==p.n).map(x=>opt(esc(x.n),0))],explain:`${esc(p.n)} · ${typeStr(p.t)}`}},
 p0=>{const p=p0||rnd(POOL);const key=t=>t.join('/');const others=[...new Set(P.map(x=>key(x.t)))].filter(k=>k!==key(p.t));
   return{prompt:`What is the typing of ${esc(p.n)}?`,ik:p.k,opts:[opt(typeStr(p.t),1),...pickN(others,3).map(k=>opt(typeStr(k.split('/')),0))],explain:`${esc(p.n)} is ${p.t.join('/')}.`}}
];
G.speed=[
 ()=>{let a,b,sa,sb,va,vb,t=0;const QSC=['32=','32+','scarf','0=','0-','tw'];
   do{a=rnd(POOL);b=rnd(POOL);sa=rnd(QSC);sb=rnd(QSC);va=SCEN[sa].f(a.s);vb=SCEN[sb].f(b.s);t++}while((a===b||Math.abs(va-vb)>28||(va===vb&&Math.random()<.7))&&t<800);
   const ok=va===vb?2:va>vb?0:1;
   return{prompt:'Who moves first?',opts:[opt(`<b>${esc(a.n)}</b><small>${SCEN[sa].l}</small>`,ok===0,a.k),opt(`<b>${esc(b.n)}</b><small>${SCEN[sb].l}</small>`,ok===1,b.k),opt('<b>Tie</b><small>same Speed</small>',ok===2)],keepOrder:1,explain:`${esc(a.n)} ${va} · ${esc(b.n)} ${vb}.`}},
 p0=>{const a=p0||rnd(POOL),s=rnd(['0-','0=','32=','32+','scarf']);
   return{type:'num',prompt:`What is ${esc(a.n)}'s Speed at ${SCEN[s].l}?`,ik:a.k,answer:SCEN[s].f(a.s),hint:'⌊(base + 20 + SP) × nature⌋, then Scarf ×1.5',explain:`Base ${a.s}.`}},
 ()=>{let a,b,ma,mb,va,vb,t=0;const tr=Math.random()<.25;
   do{a=rnd(POOL);b=rnd(POOL);ma=rnd(MODS);mb=rnd([...MODS,null]);va=ma.f(SCEN['32+'].f(a.s));vb=mb?mb.f(SCEN['32+'].f(b.s)):SCEN['32+'].f(b.s);t++}while((a===b||Math.abs(va-vb)>35||va===vb||ma===mb)&&t<1500);
   const ok=tr?(va<vb?0:1):(va>vb?0:1);
   return{prompt:tr?'Under Trick Room, who moves first?':'Who moves first?',opts:[opt(`<b>${esc(a.n)}</b><small>32 SP + · ${ma.l}</small>`,ok===0,a.k),opt(`<b>${esc(b.n)}</b><small>32 SP +${mb?' · '+mb.l:''}</small>`,ok===1,b.k)],keepOrder:1,explain:`${esc(a.n)} ${va} · ${esc(b.n)} ${vb}.${tr?' Lower Speed goes first.':''}`}},
 ()=>{const [wn,ab]=rnd(WEATHER);const hold=HOLD[ab];if(!hold)return null;let a=rnd(hold).p,b,sb,va,vb,t=0;va=SCEN['32+'].f(a.s)*2;
   do{b=rnd(POOL);sb=rnd(['32+','scarf','tw']);vb=SCEN[sb].f(b.s);t++}while((b===a||Math.abs(va-vb)>40||va===vb)&&t<1500);
   const ok=va>vb?0:1;
   return{prompt:`In ${wn}, who moves first?`,opts:[opt(`<b>${esc(a.n)}</b><small>32 SP + · ${ab} (×2)</small>`,ok===0,a.k),opt(`<b>${esc(b.n)}</b><small>${SCEN[sb].l}</small>`,ok===1,b.k)],keepOrder:1,explain:`${esc(a.n)} ${va} · ${esc(b.n)} ${vb}.`}}
,
 p0=>{const a=p0||rnd(POOL);return{type:'num',prompt:`What is ${esc(a.n)}'s base Speed?`,ik:a.k,answer:a.s,hint:'The base stat of the Pokémon.',explain:`${esc(a.n)}: base Speed ${a.s}.`}},
 ()=>{const a=rnd(POOL),sc=rnd(['32=','32+','scarf','0=','tw']),v=SCEN[sc].f(a.s),w=new Set();
   while(w.size<3){const d=(Math.floor(Math.random()*10)+2)*(Math.random()<.5?-1:1);if(v+d>0)w.add(v+d)}
   return{prompt:`${esc(a.n)}'s Speed at ${SCEN[sc].l}?`,ik:a.k,opts:[opt(`<b>${v}</b>`,1),...[...w].map(x=>opt(`<b>${x}</b>`,0))],compact:1,explain:`Base ${a.s} → ${v}.`}}
];
G.types=[
 p0=>{const p=p0||rnd(POOL),d=p.t;const weak=TYPES.filter(a=>effVs(a,d)>=2),safe=TYPES.filter(a=>effVs(a,d)<=1);if(!weak.length)return null;
   return{prompt:`Which type hits ${esc(p.n)} super effectively?`,ik:p.k,opts:[opt(typeStr([rnd(weak)]),1),...pickN(safe,3).map(t=>opt(typeStr([t]),0))],explain:`${esc(p.n)} (${d.join('/')}) is weak to ${weak.map(t=>t+(effVs(t,d)===4?' ×4':'')).join(', ')}.`}},
 p0=>{const p=p0||rnd(POOL);let a=rnd(TYPES),m=effVs(a,p.t);if(m===1&&Math.random()<.6){a=rnd(TYPES);m=effVs(a,p.t)}
   const L=[[0,'×0'],[.25,'×¼'],[.5,'×½'],[1,'×1'],[2,'×2'],[4,'×4']];
   return{prompt:`${typeStr([a])} attacks ${esc(p.n)}: how much damage?`,ik:p.k,opts:L.map(([v,l])=>opt(`<b>${l}</b>`,v===m)),keepOrder:1,compact:1,explain:`${a} vs ${p.t.join('/')} = ×${m}.`}},
 ()=>{const a=rnd(TYPES);const imm=POOL.filter(p=>effVs(a,p.t)===0),other=POOL.filter(p=>effVs(a,p.t)>0);if(!imm.length)return null;
   const c=rnd(imm);return{prompt:`Which Pokémon is immune to ${typeStr([a])}?`,opts:[monOpt(c,1),...pickN(other,3).map(p=>monOpt(p,0))],explain:`${esc(c.n)} (${c.t.join('/')}) takes no damage from ${a}.`}}
];
const IQ=()=>(window.ITEMS||[]).filter(x=>x.cat!=='Mega Stone'&&x.d&&x.d.length>12);
const itOpt=(x,ok)=>opt(`<span class="iopt">${x.img?`<img src="${x.img}" alt="">`:''}<b>${bi('i',x.n)}</b></span>`,ok,x.n);
G.items=[
 ()=>{const L=IQ();if(L.length<4)return null;const c=rnd(L);
   return{prompt:`Which item is this?<div class="quote">${dsc('i',c.n,c.d)}</div>`,opts:[itOpt(c,1),...pickN(L,3,x=>x!==c&&x.cat===c.cat).concat(pickN(L,3,x=>x!==c)).slice(0,3).map(x=>itOpt(x,0))],compact:1,explain:`<b>${bi('i',c.n)}</b>: ${dsc('i',c.n,c.d)}`}},
 ()=>{const L=IQ();if(L.length<4)return null;const c=rnd(L.filter(x=>x.u&&x.u.length)||L);
   return{prompt:`What does <span class="iopt">${c.img?`<img src="${c.img}" alt="">`:''}<b>${bi('i',c.n)}</b></span> do?`,opts:[opt(dsc('i',c.n,c.d),1),...pickN(L,3,x=>x!==c&&x.d!==c.d).map(x=>opt(dsc('i',x.n,x.d),0))],explain:`<b>${bi('i',c.n)}</b>${c.u&&c.u.length?` · used by ${c.u.slice(0,4).map(([k])=>BYK[k]?esc(BYK[k].n):'').filter(Boolean).join(', ')}`:''}.`}}
];
const HK=()=>Object.keys(HOLD);
G.abilities=[
 p0=>{const p=p0||rnd(POOL),mine=p.a;const c=rnd(mine);
   return{prompt:`Which ability can ${esc(p.n)} have?`,ik:p.k,opts:[opt(bi('a',c),1),...pickN(HK(),3,k=>!mine.includes(k)).map(k=>opt(bi('a',k),0))],explain:`${esc(p.n)}: ${p.ah.map(a=>esc(a[0])+'').join(', ')}.`}},
 ()=>{const c=rnd(HK().filter(k=>{const d=abDesc(k).d;return d.length>12&&!d.toLowerCase().includes(k.toLowerCase())}));if(!c)return null;
   return{prompt:`Which ability is this?<div class="quote">${dsc('a',c,abDesc(c).d)}</div>`,opts:[opt(bi('a',c),1),...pickN(HK(),3,k=>k!==c).map(k=>opt(bi('a',k),0))],explain:`<b>${bi('a',c)}</b>: ${HOLD[c].slice(0,6).map(m=>esc(m.p.n)).join(', ')}${HOLD[c].length>6?'…':''}`}},
 ()=>{const c=rnd(HK().filter(k=>HOLD[k].length<=8));const hold=HOLD[c].map(x=>x.p);const h=rnd(hold);
   return{prompt:`Which Pokémon can have <b>${bi('a',c)}</b>?`,opts:[monOpt(h,1),...pickN(POOL,3,p=>!hold.includes(p)).map(p=>monOpt(p,0))],explain:`${esc(abDesc(c).d)}`}}
];
G.natures=[
 ()=>{const n=rnd(NATP);const same=NATP.filter(x=>x!==n&&(x[1]===n[1]||x[2]===n[2]));
   return{prompt:`Which nature is <span class="fx">+${SL(n[1])} −${SL(n[2])}</span>?`,opts:[opt(`<b>${bi('n',n[0])}</b>`,1),...pickN([...same,...NATP],3,x=>x!==n).map(x=>opt(`<b>${bi('n',x[0])}</b>`,0))],compact:1,explain:`${n[0]}: ${natFx(n)}.`}},
 ()=>{const n=rnd(NATP);return{prompt:`What does <b>${bi('n',n[0])}</b> do?`,opts:[opt(natFx(n),1),...pickN(NATP,3,x=>natFx(x)!==natFx(n)).map(x=>opt(natFx(x),0))],compact:1,explain:`${n[0]}: ${natFx(n)}.`}},
 ()=>{const phys=Math.random()<.5;const best=NATP.find(n=>n[1]==='Spe'&&n[2]===(phys?'SpA':'Atk'));
   return{prompt:`A ${phys?'physical':'special'} attacker wants max Speed and lowers the offense stat it doesn't use. Which nature?`,opts:[opt(`<b>${bi('n',best[0])}</b>`,1),...pickN(NATP,3,n=>n!==best&&n[1]!=='Spe').map(n=>opt(`<b>${bi('n',n[0])}</b>`,0))],compact:1,explain:`${best[0]}: ${natFx(best)}.`}}
];
G.moves=[
 ()=>{const c=rnd(MV.filter(m=>m.d.length>14&&!m.d.toLowerCase().includes(m.n.toLowerCase())));
   return{prompt:`Which move is this?<div class="quote">${dsc('m',c.n,c.d)}</div>`,opts:[opt(mvName(c),1),...pickN(MV,3,m=>m!==c&&m.c===c.c).map(m=>opt(mvName(m),0))],compact:1,explain:`${mvPill(c)} ${catPill(c)} · ${numsStr(c)}`}},
 ()=>{const pri=MV.filter(m=>m.pr>0&&m.c!=='T'),c=rnd(pri);return{prompt:'Which attack has priority?',opts:[opt(mvName(c),1),...pickN(MV,3,m=>m.pr===0&&m.c!=='T').map(m=>opt(mvName(m),0))],compact:1,explain:`${esc(c.n)} has priority ${prStr(c)}. Priority attacks: ${pri.map(m=>esc(m.n)).join(', ')}.`}},
 ()=>{const c=rnd(MV.map((m,i)=>[m,i]).filter(([,i])=>{const n=learners(i).length;return n>=3&&n<=40}));const L=learners(c[1]).map(k=>BYK[k]);
   return{prompt:`Which Pokémon can learn <b>${esc(c[0].n)}</b>?`,opts:[monOpt(rnd(L),1),...pickN(POOL,3,p=>!L.includes(p)&&!p.m).map(p=>monOpt(p,0))],explain:`${esc(c[0].n)}: ${L.map(p=>esc(p.n)).join(', ')}.`}},
 ()=>{const m=rnd(MV);return{prompt:`What type is <b>${esc(m.n)}</b>?`,opts:[opt(typeStr([m.t]),1),...pickN(TYPES,3,t=>t!==m.t).map(t=>opt(typeStr([t]),0))],explain:`${esc(m.n)} is ${m.t}. ${esc(m.d)}`}},
 ()=>{const m=rnd(MV.filter(x=>x.p>0));const pool=[...new Set(MV.filter(x=>x.p>0).map(x=>x.p))];
   return{prompt:`Base power of <b>${esc(m.n)}</b>?`,opts:[opt(`<b>${m.p}</b>`,1),...pickN(pool.filter(v=>v!==m.p).sort((x,y)=>Math.abs(x-m.p)-Math.abs(y-m.p)).slice(0,7),3).map(v=>opt(`<b>${v}</b>`,0))],compact:1,explain:`${mvPill(m)} ${catPill(m)} · ${numsStr(m)}`}},
 ()=>{const m=rnd(MV.filter(x=>x.g.some(g=>GQ.includes(g))));const own=m.g.filter(g=>GQ.includes(g));const c=rnd(own);
   return{prompt:`Which group fits <b>${esc(m.n)}</b>?`,opts:[opt(esc(c),1),...pickN(GQ,3,g=>!own.includes(g)).map(g=>opt(esc(g),0))],compact:1,explain:`${esc(m.n)}: ${own.join(', ')}. ${esc(m.d)}`}},
 ()=>{const [ab,verb,fl]=rnd(RULES);const yes=MV.filter(m=>m.f.includes(fl)&&m.c!=='T'),no=MV.filter(m=>!m.f.includes(fl)&&m.c!=='T');if(!yes.length)return null;const c=rnd(yes);
   return{prompt:`Which move does <b>${ab}</b> ${verb}?`,opts:[opt(mvName(c),1),...pickN(no,3).map(m=>opt(mvName(m),0))],compact:1,explain:`${esc(c.n)} is a ${fl==='bullet'?'ball/bomb':fl} move. ${ab} ${verb} those.`}},
 ()=>{const yes=MV.filter(m=>m.f.includes('bypass')&&m.p>0),no=MV.filter(m=>!m.f.includes('bypass')&&m.c!=='T');if(!yes.length)return null;const c=rnd(yes);
   return{prompt:'Which move is NOT stopped by Protect?',opts:[opt(mvName(c),1),...pickN(no,3).map(m=>opt(mvName(m),0))],compact:1,explain:`${esc(c.n)}: ${esc(c.d)}`}},
 ()=>{const T={Electric:'Lightning Rod / Volt Absorb',Water:'Storm Drain / Water Absorb',Fire:'Flash Fire',Grass:'Sap Sipper',Ground:'Levitate'};const t=rnd(Object.keys(T));
   const yes=MV.filter(m=>m.t===t&&m.c!=='T'&&m.p>0),no=MV.filter(m=>m.t!==t&&m.c!=='T'&&m.p>0);if(!yes.length)return null;const c=rnd(yes);
   return{prompt:`Which attack is absorbed or blocked by <b>${T[t]}</b>?`,opts:[opt(mvName(c),1),...pickN(no,3).map(m=>opt(mvName(m),0))],compact:1,explain:`${esc(c.n)} is ${t}-type.`}},
 p0=>{const p=p0||rnd(POOL.filter(x=>!x.m));const mine=window.LEARN[BKEY[p.k]||p.k]||[];if(mine.length<4)return null;const set=new Set(mine);
   const c=MV[rnd(mine)],no=pickN(MV.map((m,i)=>[m,i]).filter(([,i])=>!set.has(i)&&MV[i].c!=='T'),3);
   return{prompt:`Which of these moves can ${esc(p.n)} learn?`,ik:p.k,opts:[opt(mvName(c),1),...no.map(([m])=>opt(mvName(m),0))],compact:1,explain:`${esc(c.n)}: ${esc(c.d)}`}}
];
/* ---- engine ---- */
const QZ={sec:'mixed',mode:'inf',cur:null,done:false,streak:0,run:null,adv:0,timer:0,focus:null,
  stats:LS.get('vgcQuiz2',{}),missed:LS.get('vgcMissed',[]),daily:LS.get('vgcDaily',{last:'',streak:0,best:0,scores:{}}),hist:LS.get('vgcHist',{}),view:'menu'};
const qkey=q=>q.type==='custom'?q.key:q.prompt+'|'+(q.type==='num'?q.answer:(q.opts.find(o=>o.ok)||{}).html);
const saveQ=()=>{LS.set('vgcHist',QZ.hist);LS.set('vgcQuiz2',QZ.stats);LS.set('vgcMissed',QZ.missed.slice(-300))};
function secStat(sec){return QZ.stats[sec]||(QZ.stats[sec]={ok:0,n:0,best:0})}
function weightedSec(){
  const keys=Object.keys(G);const w=keys.map(k=>{const s=QZ.stats[k];const acc=s&&s.n>=5?s.ok/s.n:.6;return .5+(1-acc)*2.5});
  let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<keys.length;i++){r-=w[i];if(r<=0)return keys[i]}return keys[0];
}
function makeQ(uniform){
  let sec=QZ.sec==='mixed'||uniform?(uniform?rnd(Object.keys(G)):weightedSec()):QZ.sec;
  for(let t=0;t<25;t++){const q=rnd(G[sec])();if(q){q.sec=sec;return q}}
  return null;
}
function focusQs(k){
  const p=BYK[k];const F=[['pokemon',G.pokemon[1]],['types',G.types[0]],['types',G.types[1]],['abilities',G.abilities[0]],['speed',G.speed[1]],['moves',G.moves[9]],['types',G.types[1]],['speed',G.speed[1]]];
  return F.map(([sec,g])=>{const q=g(p)||G.types[1](p);q.sec=sec;return q});
}
const DAILY_N=20;
const DAILY_MSG=['No hits at all. Go through the basics before the next one.','Barely anything. Open the Dex and study.','Very weak. Review stats and speed tiers.','Still lots of gaps. Study the most used Pokémon.','Below average. Focus on your weak sections.','Half right. Decent base, a lot to fix.','Passing, but you are leaving points behind.','Good. A few holes left.','Very good. Strong knowledge of the format.','Almost perfect. One slip.','Perfect. No mistakes.'];
function dailyPool(){const u=USAGES.showdown||{};return P.filter(p=>(u[p.k]||0)>=0.1)}
const DAILY_MIX=[['speed',6],['pokemon+types',8],['abilities',2],['moves',2],['items',1],['natures',1]];
function secQ(sec){const gens=sec==='pokemon+types'?[...G.pokemon.map(g=>['pokemon',g]),...G.types.map(g=>['types',g])]:G[sec].map(g=>[sec,g]);
  for(let t=0;t<40;t++){const [sc,g]=rnd(gens);const q=g();if(q){q.sec=sc;return q}}return null}
function dailyQs(){const seed=parseInt(todayStr().replace(/-/g,''),10);const keep=POOL,kU=U;U=USAGES.showdown||U;POOL=dailyPool();
  try{const out=[],seen=new Set();let i=0;
    DAILY_MIX.forEach(([sec,n])=>{for(let c=0;c<n;c++){let q=null;for(let t=0;t<12;t++){const x=seeded(seed*1000+(i++),()=>secQ(sec));if(x&&!seen.has(qkey(x))){q=x;break}}if(q){seen.add(qkey(q));out.push(q)}}});
    return seeded(seed+7,()=>shuffle(out));
  }finally{POOL=keep;U=kU}}
/* ---- full quizzes ---- */
const MLAB={1:'×1',2:'×2',.5:'×½',0:'×0'};
const SPF={sp_s0:['0=','0 SP'],sp_s32:['32=','32 SP'],sp_s32p:['32+','32 SP +']};
function speedNumQ(p,m){const [sc,l]=SPF[m];return{type:'num',sec:'speed',prompt:`Speed of <b>${esc(p.n)}</b> at ${l}?`,ik:p.k,answer:SCEN[sc].f(p.s),hint:'Level 50, no item. Type the number.',explain:`${esc(p.n)} (base ${p.s}).`}}
function typeQ(a,d,frame){const m=eff(a,d);
  return{sec:'types',prompt:frame?`<span class="tq">${typeStr([a])}<i>attacks</i>${typeStr([d])}</span><small class="tqs">How much damage?</small>`:`<span class="tq">${typeStr([d])}<i>defends against</i>${typeStr([a])}</span><small class="tqs">How much damage does it take?</small>`,opts:[2,1,.5,0].map(v=>opt(`<b>${MLAB[v]}</b>`,v===m)),keepOrder:1,compact:1,explain:`${a} → ${d}: ${MLAB[m]}.`}}
function natureQ(n){
  const ST=['Atk','Def','SpA','SpD','Spe'];
  return{type:'custom',sec:'natures',rb:['nat',n[0]],key:'nat|'+n[0],prompt:`What does <b>${bi('n',n[0])}</b> do?`,
   html:`<p class="note">Tap ▲ on the stat it raises and ▼ on the stat it lowers. Neutral natures change nothing.</p><div class="nboard">${ST.map((x,i)=>`<div class="ncol" data-s="${x}" style="--c:${STATCOL[i+1]}"><b>${SL(x)}</b><button class="na up" data-g="u" data-v="${x}" aria-label="Raises ${SL(x)}">▲</button><button class="na dn" data-g="d" data-v="${x}" aria-label="Lowers ${SL(x)}">▼</button></div>`).join('')}</div><button class="ns neu" id="nNeu" aria-pressed="false">Neutral · no change</button><div class="row" style="margin-top:12px"><button class="btn primary" id="qGoN">Check</button></div>`,
   bind(){const sel={u:null,d:null,z:false};const draw=()=>{$$('#qArea .na').forEach(b=>b.setAttribute('aria-pressed',sel[b.dataset.g]===b.dataset.v));$('#nNeu').setAttribute('aria-pressed',sel.z)};
     $$('#qArea .na').forEach(b=>b.addEventListener('click',()=>{if(QZ.done)return;const g=b.dataset.g,o=g==='u'?'d':'u';sel.z=false;sel[g]=sel[g]===b.dataset.v?null:b.dataset.v;if(sel[o]===sel[g])sel[o]=null;draw()}));
     $('#nNeu').addEventListener('click',()=>{if(QZ.done)return;sel.z=!sel.z;if(sel.z){sel.u=sel.d=null}draw()});
     $('#qGoN').addEventListener('click',()=>{if(QZ.done)return;if(!sel.z&&!(sel.u&&sel.d))return;
       const eu=n[1]||null,ed=n[2]||null,ok=sel.z?!eu:(sel.u===eu&&sel.d===ed);
       $$('#qArea .na').forEach(b=>{const right=(b.dataset.g==='u'&&b.dataset.v===eu)||(b.dataset.g==='d'&&b.dataset.v===ed);const chosen=sel[b.dataset.g]===b.dataset.v;b.classList.toggle('right',right);b.classList.toggle('wrong',chosen&&!right)});
       if(!eu)$('#nNeu').classList.add('right');else if(sel.z)$('#nNeu').classList.add('wrong');
       finishQ(ok,`${n[0]} (${ESN('n',n[0])}): ${natFx(n)}.`)})}};
}
const SPECNAME={sp_s0:'Speed · 0 SP',sp_s32:'Speed · 32 SP',sp_s32p:'Speed · 32 SP +',sp_types:'Type chart · 324',sp_nat:'Natures · 25'};
const SPECM=Object.keys(SPECNAME),FIXEDM=['review','daily','focus',...SPECM];
const SECM=['inf','r20','r50','r100','time'],TRACKM=['daily','r20','r50','r100',...SPECM],POOLM=['inf','r20','r50','r100','time','sp_s0','sp_s32','sp_s32p'];
const RANDN={r20:20,r50:50,r100:100};
const MODENAME={inf:'Endless',r20:'Random 20',r50:'Random 50',r100:'Random 100',time:'60 seconds',review:'Review mistakes',daily:'Daily challenge',focus:'Focus quiz',...SPECNAME};
const histKey=m=>SPF[m]?m+'|'+POOLSEL:m;
const hist=m=>QZ.hist[histKey(m)]||[];
function spark(a,w,hh,big){
  if(!a.length||(!big&&a.length<2))return '';
  const x0=big?30:6,x1=big?w-14:w-6;
  const pts=a.map((e,i)=>[a.length===1?(x0+x1)/2:x0+i*(x1-x0)/(a.length-1),hh-6-(hh-14)*e.pc/100]);
  return `<svg viewBox="0 0 ${w} ${hh}" class="${big?'hchart':'spark'}" aria-hidden="true">${big?[0,50,100].map(v=>`<line x1="30" x2="${w-6}" y1="${hh-6-(hh-14)*v/100}" y2="${hh-6-(hh-14)*v/100}" stroke="rgba(255,255,255,.12)" stroke-dasharray="3 4"/><text x="24" y="${hh-3-(hh-14)*v/100}" text-anchor="end" font-size="9" fill="#8fa0c8">${v}%</text>`).join(''):''}<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#4fe3a2" stroke-width="${big?2.5:2}" stroke-linejoin="round" stroke-linecap="round"/>${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${big?(i===pts.length-1?4.5:3):(i===pts.length-1?2.8:0)}" fill="#4fe3a2"/>${big&&(i===pts.length-1||pts.length<=8)?`<text x="${p[0]}" y="${p[1]-8}" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${a[i].pc}</text>`:''}`).join('')}</svg>`;
}
const fmtD=t=>{const d=new Date(t);return d.getDate()+'/'+(d.getMonth()+1)};
const hyd=q=>{if(q&&q.rb&&q.rb[0]==='nat'){const n=NATS.find(x=>x[0]===q.rb[1]);return n?natureQ(n):null}return q};
function startRun(mode,k){
  clearInterval(QZ.timer);clearTimeout(QZ.adv);
  QZ.mode=mode;QZ.streak=0;QZ.done=false;QZ.focus=mode==='focus'?k:null;QZ.view='play';QZ.kb=false;
  const r={n:0,ok:0,qi:0,wrong:[],total:Infinity,queue:null,left:60,seen:new Set(),rec:0};
  if(RANDN[mode])r.total=RANDN[mode];
  if(mode==='review'){r.queue=shuffle(QZ.missed).map(hyd).filter(Boolean);r.total=r.queue.length}
  if(mode==='daily'){r.queue=dailyQs();r.total=DAILY_N}
  if(mode==='focus'){r.queue=focusQs(k);r.total=8}
  if(SPF[mode]){r.queue=shuffle(POOL).map(p=>speedNumQ(p,mode));r.total=r.queue.length}
  if(mode==='sp_types'){r.queue=shuffle(TYPES.flatMap(a=>TYPES.map(d=>typeQ(a,d,Math.random()<.5))));r.total=r.queue.length}
  if(mode==='sp_nat'){r.queue=shuffle(NATS).map(natureQ);r.total=r.queue.length}
  QZ.run=r;renderQuizUI();
  if(r.total===0){renderResult();return}
  if(mode==='time')QZ.timer=setInterval(()=>{r.left--;const e=$('#qTimer');if(e)e.textContent=r.left+'s';if(r.left<=0){clearInterval(QZ.timer);clearTimeout(QZ.adv);renderResult()}},1000);
  newQ();
}
function startFocus(k){DONE.quiz=1;showTab('quiz');startRun('focus',k)}
function showQMenu(){
  clearInterval(QZ.timer);clearTimeout(QZ.adv);QZ.view='menu';
  $('#qMenu').classList.remove('hide');$('#qPlay').classList.add('hide');
  $('#qMenuPool').appendChild($('#qPoolRow'));renderQMenu();
}
function dAvg(){const v=Object.values(QZ.daily.scores||{});return v.length?Math.round(v.reduce((a,b)=>a+b,0)/(v.length*DAILY_N)*100):null}
function flame(n,avg){return `<span class="flame${n?'':' off'}" title="Daily streak and average score"><i>🔥</i>${n}<small>day${n===1?'':'s'}</small>${avg!==null?`<em>${avg}% avg</em>`:''}</span>`}
function renderQMenu(){
  const d=QZ.daily,t=todayStr(),doneToday=d.scores[t]!==undefined,live=d.last===t||d.last===todayStr(-1)?d.streak:0;
  const nm=QZ.missed.length,np=POOL.length;
  const st=m=>{const a=hist(m);if(!a.length)return '<span class="st">No attempts yet</span>';const l=a[a.length-1].pc,b=Math.max(...a.map(x=>x.pc)),pv=a.length>1?a[a.length-2].pc:null,dl=pv===null?null:l-pv;
    return `<span class="qsc"><small>Last</small><b>${l}%</b>${dl===null?'<em>first try</em>':`<em class="${dl>0?'up':dl<0?'dn':''}">${dl>0?'▲ +'+dl:dl<0?'▼ '+dl:'= same'}</em>`}<i>best ${b}% · ${a.length} ${a.length>1?'tries':'try'}</i>${a.length>1?spark(a.slice(-10),90,26):''}</span>`};
  const T=(m,c,big,title,sub,extra='',cls='')=>`<button class="qt ${cls}" data-m="${m}" style="--c:${c}"><span class="big">${big}</span><b>${title}</b><small>${sub}</small>${extra}</button>`;
  $('#qMenuBody').innerHTML=`
   <div class="qgrp">Daily</div>
   <div class="qtiles">${T('daily','#ffb02e','20',`Daily challenge ${flame(live,dAvg())}`,`${doneToday?`Done today: ${d.scores[t]}/20`:'6 speed · 8 Pokémon and types · 2 abilities · 2 moves · 1 item · 1 nature'}`,st('daily'),'wide')}</div>
   <div class="qgrp">Practice</div>
   <div class="qtiles">
    ${T('inf','#4f7cff','∞','Endless','Pick a section, no end')}
    ${T('time','#ff5a4f','60s','60 seconds','As many as you can')}
    ${T('r20','#35c4e8','20','Random 20','Mixed sections',st('r20'))}
    ${T('r50','#35c4e8','50','Random 50','Mixed sections',st('r50'))}
    ${T('r100','#35c4e8','100','Random 100','Mixed sections',st('r100'))}
    ${T('review','#b58cff',nm,'Review mistakes',nm?'Retry what you missed':'Nothing to review')}
   </div>
   <div class="qgrp">Full quizzes · track your progress</div>
   <div class="qtiles">
    ${T('sp_s0','#ff4fa8',np,'Speed · 0 SP','Every Pokémon in the pool',st('sp_s0'),'wide')}
    ${T('sp_s32','#ff4fa8',np,'Speed · 32 SP','Every Pokémon in the pool',st('sp_s32'),'wide')}
    ${T('sp_s32p','#ff4fa8',np,'Speed · 32 SP +','Every Pokémon in the pool',st('sp_s32p'),'wide')}
    ${T('sp_types','#ff9a4a',324,'Type chart','All 18×18 matchups, random',st('sp_types'),'wide')}
    ${T('sp_nat','#2fd0a0',25,'Natures','All 25 natures',st('sp_nat'),'wide')}
   </div>`;
}
function renderQuizUI(){
  const m=QZ.mode;
  $('#qMenu').classList.add('hide');$('#qPlay').classList.remove('hide');
  $('#qPoolSlot').appendChild($('#qPoolRow'));$('#qPool').value=POOLSEL;
  $('#qPoolRow').classList.toggle('hide',!POOLM.includes(m));
  $('#qTitle').textContent=MODENAME[m]||'';
  $('#qSec').classList.toggle('hide',!SECM.includes(m));
  $('#qSec').innerHTML=SECS.map(([k,l])=>`<button class="gchip" data-s="${k}" aria-pressed="${k===QZ.sec}">${l}</button>`).join('');
  $('.stats',$('#qPlay')).classList.toggle('hide',SPECM.includes(m)||m==='daily');
  $('#qReset').classList.toggle('hide',!SECM.includes(m));
  $('#qBanner').innerHTML=m==='daily'?`<div class="banner">Daily challenge · 20 questions, the same for everyone today ${flame(QZ.daily.last===todayStr()||QZ.daily.last===todayStr(-1)?QZ.daily.streak:0,dAvg())}</div>`
    :m==='focus'?`<div class="banner">Focus quiz: ${esc((BYK[QZ.focus]||{}).n||'')}</div>`
    :SPF[m]?`<div class="banner">${QZ.run.total} Pokémon · pool ${$('#qPool').selectedOptions[0].textContent}. No base Speed shown: recall the number.</div>`
    :SECM.includes(m)&&QZ.sec==='mixed'&&m!=='time'?`<div class="note" style="margin:0 0 8px">Adaptive: sections you miss more often come up more often.</div>`:'';
  qStats();
}
function qStats(){
  const keys=QZ.sec==='mixed'?Object.keys(QZ.stats).filter(k=>k[0]!=='_'):[QZ.sec];
  let ok=0,n=0;keys.forEach(k=>{const s=QZ.stats[k];if(s){ok+=s.ok;n+=s.n}});
  const best=(QZ.stats[QZ.sec==='mixed'?'_all':QZ.sec]||{}).best||0;
  $('#qOk').textContent=ok;$('#qN').textContent=n;$('#qAcc').textContent=n?Math.round(ok/n*100)+'%':'–';$('#qS').textContent=QZ.streak;$('#qB').textContent=best;
}
function freshQ(){
  // random question not asked yet in this run; mistakes are never re-injected here (they go to Review mistakes)
  const r=QZ.run;let q=null;
  for(let t=0;t<40;t++){const c=makeQ();if(!c)continue;q=c;const k=qkey(c);if(!r.seen.has(k)){r.seen.add(k);return c}}
  return q;
}
function newQ(){
  clearTimeout(QZ.adv);const r=QZ.run;
  if(r.queue?r.qi>=r.queue.length:r.n>=r.total){renderResult();return}
  QZ.done=false;
  let q=r.queue?r.queue[r.qi]:freshQ();
  if(!q){renderResult();return}
  q.order=q.keepOrder&&q.opts?q.opts.map((_,i)=>i):null;
  QZ.cur=q;drawQ();
}
function drawQ(){
  const q=QZ.cur,r=QZ.run;
  const prog=r.total===Infinity?(QZ.mode==='time'?`<span id="qTimer" class="timer">${r.left}s</span>`:''):(q.rt?`<span class="chip plain w">Retry</span>`:`<span class="chip plain">Question ${Math.min(r.n+1,r.total)} / ${r.total}</span>`);
  let h=`<div class="qmeta">${prog}${QZ.mode==='time'||SPECM.includes(QZ.mode)?` <span class="chip plain">${r.ok} correct</span>`:''}${q.retry&&!q.rt?' <span class="chip plain w">Retry</span>':''}</div><p class="qq">${q.prompt}</p>`;
  if(q.ik&&BYK[q.ik])h+=q.type==='num'?`<div class="qpr"><img class="qimg" src="${BYK[q.ik].img}" alt=""><div class="qside" id="qSide"></div></div>`:`<img class="qimg" src="${BYK[q.ik].img}" alt="">`;
  if(q.type==='custom'){h+=q.html}
  else if(q.type!=='num'){
    if(!q.order)q.order=shuffle(q.opts.map((_,i)=>i));
    h+=`<div class="opts ${q.compact?'compact':''}">${q.order.map((oi,n)=>{const o=q.opts[oi];const im=o.k&&BYK[o.k]?`<img src="${BYK[o.k].img}" alt="">`:'';return `<button class="opt" data-i="${oi}">${im}<span class="ot"><kbd>${n+1}</kbd>${o.html}</span></button>`}).join('')}</div>`;
  }
  $('#qFb').innerHTML='';$('#qNext').innerHTML='';
  $('#qArea').innerHTML=h;
  $('#qNumRow').classList.toggle('hide',q.type!=='num');
  if(q.type==='custom'&&q.bind)q.bind();
  if(q.type==='num'){
    const i=$('#qIn');i.value='';$('#qHint').textContent=q.hint||'';$('#qGo').textContent='Check';
    const coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
    if(!coarse||QZ.kb)i.focus({preventScroll:true});
  }
}
function numAct(){if(QZ.done)newQ();else answerNum()}
(function(){const i=$('#qIn');
  i.addEventListener('focus',()=>{QZ.kb=true});
  i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();numAct()}});
  const g=$('#qGo');g.addEventListener('mousedown',e=>e.preventDefault());g.addEventListener('click',numAct);
})();
function fbOut(q,ok,msg,t){
  const sd=q.type==='num'?$('#qSide'):null;
  if(sd){const a=q.answer;const sh=x=>String(x||'').replace(/^.*?(\(base)/,'$1');sd.innerHTML=ok?`<div class="fb ok"><b>✓ ${a}</b>${sh(q.explain)}</div>`:`<div class="fb ko"><b>✗ ${a}</b>${msg.replace(/^It was \d+, /,'').replace(/\.\s.*$/,'.')} ${sh(q.explain)}</div>`;return}
  $('#qFb').innerHTML=`<div class="fb ${ok?'ok':'ko'}">${ok?'Correct.':'Wrong.'} ${msg}</div>`;
}
function finishQ(ok,msg){
  const q=QZ.cur,r=QZ.run;QZ.done=true;
  if(r.queue)r.qi++;
  const counted=!q.rt;if(counted)r.n++;
  const s=secStat(q.sec),all=secStat('_all');if(counted)s.n++;
  const k=qkey(q);
  if(ok){if(counted){s.ok++;r.ok++}QZ.streak++;if(QZ.streak>s.best)s.best=QZ.streak;if(QZ.streak>all.best)all.best=QZ.streak;if(QZ.mode==='review')QZ.missed=QZ.missed.filter(x=>qkey(x)!==k)}
  else{
    QZ.streak=0;if(counted)r.wrong.push(q);
    if(!QZ.missed.some(x=>qkey(x)===k)){
      if(q.type==='custom'){if(q.rb)QZ.missed.push({type:'custom',rb:q.rb,key:q.key,sec:q.sec,prompt:q.prompt})}
      else{const c=JSON.parse(JSON.stringify(q));c.order=null;c.retry=0;c.rt=0;QZ.missed.push(c)}
    }
  }
  saveQ();qStats();
  const last=r.queue?r.qi>=r.queue.length:r.n>=r.total;
  if(QZ.mode==='time'){
    fbOut(q,ok,ok?'':msg,'time');
    QZ.adv=setTimeout(()=>{if(r.left>0)newQ()},ok?600:1600);return;
  }
  fbOut(q,ok,msg);
  if(q.type==='num'){$('#qGo').textContent=last?'See result':'Next';if(QZ.kb)$('#qIn').focus({preventScroll:true})}
  else{$('#qNext').innerHTML=`<button class="btn primary" id="qNb">${last?'See result':'Next'}</button>`;$('#qNb').addEventListener('click',newQ);$('#qNb').focus()}
  if(SPECM.includes(QZ.mode)&&ok&&!last)QZ.adv=setTimeout(newQ,550);
}
function answerMC(i){
  if(QZ.done)return;const q=QZ.cur;
  const right=q.opts.findIndex(o=>o.ok);
  $$('#qArea .opt').forEach(b=>{const k=+b.dataset.i;if(k===right)b.classList.add('ok');else if(k===i)b.classList.add('ko')});
  finishQ(i===right,q.explain||'');
}
function answerNum(){
  if(QZ.done)return;const q=QZ.cur,v=parseInt($('#qIn').value,10);if(isNaN(v))return;
  finishQ(v===q.answer,v===q.answer?`${q.answer}. ${q.explain||''}`:`It was ${q.answer}, you said ${v}. ${q.explain||''}`);
}
function recordDaily(score){
  const d=QZ.daily,t=todayStr();if(d.scores[t]!==undefined)return;
  d.streak=d.last===todayStr(-1)?d.streak+1:1;d.last=t;d.best=Math.max(d.best||0,d.streak);d.scores[t]=score;
  const ks=Object.keys(d.scores).sort();while(ks.length>30)delete d.scores[ks.shift()];
  LS.set('vgcDaily',d);
}
function renderResult(){
  clearInterval(QZ.timer);clearTimeout(QZ.adv);
  const r=QZ.run,m=QZ.mode,done=r.total!==Infinity&&r.n>=r.total;
  if(m==='daily'&&done&&!r.rec)recordDaily(r.ok);
  const pc=r.n?Math.round(r.ok/r.n*100):0;
  let hh='';
  if(TRACKM.includes(m)&&done){
    const k=histKey(m);
    if(!r.rec){(QZ.hist[k]=QZ.hist[k]||[]).push({t:Date.now(),ok:r.ok,n:r.n,pc});QZ.hist[k]=QZ.hist[k].slice(-30);saveQ()}
    r.rec=1;
    const a=QZ.hist[k],prev=a.length>1?a[a.length-2].pc:null,dl=prev===null?null:pc-prev;
    hh=`<div class="hist"><h3 class="h">Your progress</h3><div class="hnow"><span>Attempt #${a.length}</span><b>${pc}%</b>${dl===null?'<em>first attempt</em>':`<em class="${dl>0?'up':dl<0?'dn':''}">${dl>0?'▲ +':dl<0?'▼ ':'= '}${dl} vs last</em>`}</div>${spark(a.slice(-12),320,110,1)}<div class="hlist">${a.slice(-6).reverse().map((e,i)=>`<span class="${i===0?'cur':''}"><i>#${a.length-i}</i> ${fmtD(e.t)} <b>${e.pc}%</b> <small>${e.ok}/${e.n}</small></span>`).join('')}</div></div>`;
  }
  const list=r.wrong.slice(0,10).map(q=>q.type==='custom'?`<li>${strip(q.prompt).slice(0,90)}</li>`:`<li>${strip(q.prompt).slice(0,90)} → <b>${esc(strip(q.type==='num'?q.answer:(q.opts.find(o=>o.ok)||{}).html))}</b></li>`).join('');
  const again=['review','daily','focus'].includes(m)?'inf':m;
  $('#qNumRow').classList.add('hide');$('#qFb').innerHTML='';$('#qNext').innerHTML='';
  $('#qArea').innerHTML=`<div class="result"><small>${MODENAME[m]||'Round'}</small><div class="score">${r.ok}<span>/${r.n}</span></div><p class="note">${m==='daily'?`<b>${DAILY_MSG[Math.round(Math.min(DAILY_N,r.ok)/DAILY_N*10)]}</b><br>Streak: ${QZ.daily.streak} day${QZ.daily.streak===1?'':'s'}${QZ.daily.best?` · best ${QZ.daily.best}`:''}`:`${pc}% correct`}${m==='review'&&!r.total?' · no mistakes saved. Nothing to review.':''}</p>
   ${hh}${list?`<h3 class="h">What you missed${r.wrong.length>10?` (first 10 of ${r.wrong.length})`:''}</h3><ul class="misses">${list}</ul>`:''}
   <div class="row" style="margin-top:14px">${['daily','focus','review'].includes(m)?'':`<button class="btn primary" data-m="${again}">Play again</button>`}<button class="btn ${['daily','focus','review'].includes(m)?'primary':''}" data-back="1">Quiz menu</button>${QZ.missed.length&&m!=='review'?`<button class="btn" data-m="review">Review mistakes (${QZ.missed.length})</button>`:''}</div></div>`;
  qStats();
}
$('#qArea').addEventListener('click',e=>{
  const o=e.target.closest('.opt');if(o){answerMC(+o.dataset.i);return}
  const bk=e.target.closest('[data-back]');if(bk){showQMenu();return}
  const b=e.target.closest('[data-m]');if(b)startRun(b.dataset.m);
});
$('#qSec').addEventListener('click',e=>{const b=e.target.closest('.gchip');if(!b)return;QZ.sec=b.dataset.s;startRun(FIXEDM.includes(QZ.mode)?'inf':QZ.mode)});
$('#qMenu').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)startRun(b.dataset.m)});
$('#qBack').addEventListener('click',showQMenu);
let resetArm=0;
$('#qReset').addEventListener('click',e=>{
  if(!resetArm){resetArm=1;e.target.textContent='Sure? Click again';setTimeout(()=>{resetArm=0;e.target.textContent='Reset this section'},3000);return}
  resetArm=0;e.target.textContent='Reset this section';
  (QZ.sec==='mixed'?Object.keys(QZ.stats):[QZ.sec]).forEach(k=>QZ.stats[k]={ok:0,n:0,best:0});QZ.streak=0;saveQ();qStats();
});
document.addEventListener('keydown',e=>{
  if($('#tab-quiz').classList.contains('hide')||e.target.matches('input,select,textarea'))return;
  if(/^[1-9]$/.test(e.key)&&!QZ.done){const b=$$('#qArea .opt')[+e.key-1];if(b)b.click()}
  else if((e.key==='Enter'||e.key===' ')&&QZ.done&&$('#qNb')){e.preventDefault();newQ()}
});


$('#qPool').addEventListener('change',e=>{POOLSEL=e.target.value;try{localStorage.setItem('vgcPool',POOLSEL)}catch(x){}POOL=poolFor(POOLSEL);if(QZ.view==='play'&&POOLM.includes(QZ.mode))startRun(QZ.mode);else if(QZ.view==='menu')renderQMenu()});
/* ---------- HOME ---------- */
const ICONS={"home": "<path d=\"M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>", "dex": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "moves": "<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>", "speed": "<path d=\"M4 18a8 8 0 1 1 16 0\"/><path d=\"M12 18l4-6\"/>", "types": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"2\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"2\"/>", "abilities": "<path d=\"M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z\"/>", "natures": "<path d=\"M5 19c0-9 6-14 15-14 0 9-5 15-14 15\"/><path d=\"M5 19l8-8\"/>", "quiz": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/>", "more": "<circle cx=\"5\" cy=\"12\" r=\"1.3\"/><circle cx=\"12\" cy=\"12\" r=\"1.3\"/><circle cx=\"19\" cy=\"12\" r=\"1.3\"/>"};
ICONS.calc='<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M8 16h2M12 16h2"/>';ICONS.teams='<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c0-3 2.5-5 5-5s5 2 5 5M11 19c0-3 2.5-5 5-5s5 2 5 5"/>';ICONS.items='<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>';
const svg=k=>`<svg viewBox="0 0 24 24">${ICONS[k]}</svg>`;
function renderHome(){
  const tiles=[
   ['dex','Dex',`${BASES.length} Pokémon · ${P.length-BASES.length} Megas`,'#3d8bff','#1b3f9e'],
   ['speed','Speed','Ladder, calculator and tables','#2ea0ff','#0a58a8'],
   ['calc','Damage calc','Showdown-style, ladder sets','#ff7a45','#a2340f'],
   ['teams','Teams','Build or import your teams','#5b8cff','#23308f'],
   ['types','Types','Type chart and team check','#22c7d6','#0c6b86'],
   ['natures','Natures','25 natures and meta spreads','#2fd0a0','#0f6e5c'],
   ['items','Items',`${(window.ITEMS||[]).length} items, EN and ES`,'#e0a72a','#8a5a08'],
   ['abilities','Abilities',`${Object.keys(HOLD).length} abilities`,'#9b7bff','#4a2fa8'],
   ['moves','Moves',`${MV.length} moves in ${GROUPS.length} groups`,'#7b6bff','#352a9c'],
   ['quiz','Quiz','Daily, endless, timed, speed, types, natures and your mistakes','#4f7cff','#2330a0']
  ];
  const secs=SECS.filter(([k])=>k!=='mixed'),stt=QZ.stats,d=QZ.daily,t=todayStr();
  const doneToday=d.scores[t]!==undefined;
  const live=d.last===t||d.last===todayStr(-1)?d.streak:0;
  let tot=0,okc=0;secs.forEach(([k])=>{const x=stt[k];if(x){tot+=x.n;okc+=x.ok}});
  const rows=secs.map(([k,l])=>({k,l,x:stt[k]})).filter(r=>r.x&&r.x.n>0).map(r=>({...r,pc:Math.round(r.x.ok/r.x.n*100)}));
  const weak=rows.filter(r=>r.x.n>=5).sort((a,b)=>a.pc-b.pc).slice(0,3);
  const bars=rows.sort((a,b)=>a.pc-b.pc).map(r=>`<div class="pbar"><span>${r.l}</span><span class="t"><i style="width:${r.pc}%"></i></span><b>${r.pc}%</b></div>`).join('');
  const nm=QZ.missed.length;
  $('#tab-home').innerHTML=`<div class="hello">
    <div class="card daily"><small>Daily challenge ${flame(live,dAvg())}</small><b>${doneToday?`Done today: ${d.scores[t]}/20`:'20 mixed questions'}</b><p class="note" style="margin:6px 0 12px">6 speed · 8 Pokémon and types · 2 abilities · 2 moves · 1 item · 1 nature${d.best?` · best streak ${d.best}`:''}</p><button class="btn primary" data-home="daily">${doneToday?'Play again (no streak change)':'Start today\'s challenge'}</button></div>

  </div><div class="tiles">${tiles.map(([k,t,d,a,b])=>`<button class="tile${k==='quiz'?' wide':''}" data-tab="${k}" style="--t1:${a};--t2:${b}">${svg(k)}<b>${t}</b><span>${d}</span></button>`).join('')}</div><div class="card prog" style="margin-top:14px"><h3 class="h">Review</h3>${tot?`<div class="note" style="margin:0 0 8px">${okc} correct out of ${tot} (${Math.round(okc/tot*100)}%)${weak.length?` · weakest: ${weak.map(w=>`<b>${w.l}</b> ${w.pc}%`).join(', ')}`:''}</div>${bars}`:'<div class="note" style="margin:0 0 8px">No answers yet. Your weak points will show here.</div>'}
      <div class="row" style="margin-top:12px">${nm?`<button class="btn primary" data-home="review">Review mistakes (${nm})</button>`:''}<button class="btn" data-quiz="mixed">Mixed quiz</button></div></div>`;
}
$('#tab-home').addEventListener('click',e=>{
  const t=e.target.closest('.tile');if(t){showTab(t.dataset.tab);return}
  const h=e.target.closest('[data-home]');if(h){DONE.quiz=1;showTab('quiz');startRun(h.dataset.home)}
});

/* ---------- INIT ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-quiz]');if(b){QZ.sec=b.dataset.quiz;DONE.quiz=1;showTab('quiz');startRun('inf')}});
function syncSP(){$$('.spsel-s').forEach(b=>{b.value=SPON?'1':'0'})}
document.addEventListener('change',e=>{const t=e.target;if(!t.classList||!t.classList.contains('spsel-s'))return;
  SPON=t.value==='1';try{localStorage.setItem('vgcSP',SPON?'1':'0')}catch(e){}
  syncSP();renderCards();
  if(!$('#tab-home').classList.contains('hide'))renderHome();
  if(LASTCARD&&!$('#modal').classList.contains('hide'))openCard(LASTCARD.k,LASTCARD.base);
});
syncSP();
$('#pA').innerHTML='<option value="">Any ability</option>'+Object.keys(HOLD).sort().map(k=>`<option>${esc(k)}</option>`).join('');
renderCards();
(function(){const h=location.hash.slice(1);showTab(TABS.includes(h)?h:'home')})();

$('#pSrc').value=SRCK;$('#pOff').value=OFFN;
function applySrc(){U=USAGES[SRCK]||{};POOL=poolFor(POOLSEL);const n=$('#srcNote');if(n)n.textContent=(SRC[SRCK].sample||'')+' · '+(SRC[SRCK].note||'');const f=$('#fOff');if(f)f.style.display=SRCK==='official'?'':'none'}
$('#pSrc').addEventListener('change',e=>{SRCK=e.target.value;applySrc();renderCards()});
$('#pOff').addEventListener('change',e=>{OFFN=e.target.value;try{localStorage.setItem('vgcOff',OFFN)}catch(x){}buildOfficial();applySrc();renderCards()});
applySrc();
(function(){const go=()=>{showTab('home');window.scrollTo({top:0,behavior:'smooth'})};document.querySelectorAll('.dev .rotom,.dev h1').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',go)});const h=document.querySelector('.dev h1');if(h){h.setAttribute('role','link');h.setAttribute('tabindex','0');h.setAttribute('aria-label','Macar Dex, go to home');h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})}})();
/* keep the bottom bar in place on iPhone (keyboard / viewport shifts) */
(function(){
  const tabs=document.getElementById('tabs'),vv=window.visualViewport;if(!tabs)return;
  let raf=0;
  const fix=()=>{raf=0;if(!vv){tabs.style.transform='';return}
    const gap=window.innerHeight-(vv.height+vv.offsetTop);
    const kb=window.innerHeight-vv.height>140&&document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    tabs.classList.toggle('kbopen',!!kb);
    tabs.style.transform=`translateX(-50%) translateY(${gap>1&&!kb?-Math.round(gap):0}px)`;};
  const q=()=>{if(!raf)raf=requestAnimationFrame(fix)};
  if(vv){vv.addEventListener('resize',q);vv.addEventListener('scroll',q)}
  window.addEventListener('resize',q);window.addEventListener('orientationchange',()=>setTimeout(q,300));
  document.addEventListener('focusin',q);
  document.addEventListener('focusout',()=>setTimeout(()=>{window.scrollTo(window.scrollX,window.scrollY);q()},120));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(q,100)});
  window.addEventListener('pageshow',q);q();
})();
