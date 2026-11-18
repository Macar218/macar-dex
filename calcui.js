/* ---------- DAMAGE CALC (Smogon engine, Champions = gen 0) + ITEMS + FIELD GUIDE ---------- */
let SC=null,CG=null;
const IT=window.ITEMS||[],ITBY=Object.fromEntries(IT.map(x=>[x.n,x])),CSETS=window.CSETS||{};
const ICATS=['Damage','Survival','Berry','Speed','Field','Utility','Mega Stone'];
const ICOL={'Damage':'#e2490d','Survival':'#52b869','Berry':'#d94f8a','Speed':'#e556a8','Field':'#4f86ec','Utility':'#9a3fa5','Mega Stone':'#e0a72a'};
const ST6=['hp','atk','def','spa','spd','spe'];
const NATL=n=>{const x=NATS.find(z=>z[0]===n);return x&&x[1]?`${n} (+${SL(x[1])} −${SL(x[2])})`:`${n} (neutral)`};
const baseKeyOf=p=>p.m?(BKEY[p.k]||p.k.replace(/mega[xyz]?$/,'')):p.k;
const formsOf=p=>{const b=BYK[baseKeyOf(p)];return b?[b,...(MEGAS[b.k]||[])]:[p]};
const calcName=p=>p.n==='Aegislash'?'Aegislash-Both':p.n;
const WEATHER_AB={'Drought':'Sun','Drizzle':'Rain','Sand Stream':'Sand','Snow Warning':'Snow'};
const TERRAIN_AB={'Electric Surge':'Electric','Grassy Surge':'Grassy','Psychic Surge':'Psychic','Misty Surge':'Misty'};
const ABON=['Flash Fire','Stakeout','Electromorphosis','Slow Start','Unburden','Plus','Minus','Protosynthesis','Quark Drive','Flower Gift'];
const STATUS=[['','Healthy'],['brn','Burned'],['par','Paralyzed'],['psn','Poisoned'],['tox','Badly poisoned'],['slp','Asleep'],['frz','Frozen']];

function loadSmog(){
  return new Promise((res,rej)=>{
    if(window.calc&&window.calc.Generations&&window.calc.Pokemon)return res();
    const t=document.getElementById('smogSrc'),s=document.createElement('script');
    if(t){s.textContent=t.textContent;document.head.appendChild(s);res();return}
    s.src='smogcalc.js';s.onload=()=>res();s.onerror=()=>rej(new Error('load'));document.head.appendChild(s);
  });
}

/* ---- state ---- */
const CSIDE=()=>({k:'',nat:'Hardy',ab:'',abOn:false,item:'',sp:[0,0,0,0,0,0],bo:[0,0,0,0,0,0],hp:100,st:'',af:0,mv:[{n:'',crit:false,hits:0},{n:'',crit:false,hits:0},{n:'',crit:false,hits:0},{n:'',crit:false,hits:0}],pre:0});
const CFIELD=()=>({gt:'Doubles',w:'',t:'',tr:false,grav:false,magic:false,wonder:false,s:[{},{}]});
let CS=null;
function saveCS(){try{localStorage.setItem('vgcCalc',JSON.stringify(CS))}catch(e){}}
function presetsOf(k){
  const p=BYK[k],c=CSETS[k],L=[];
  if(c&&c.s&&c.s.length)c.s.forEach((s,i)=>L.push({lab:`Ladder #${i+1}: ${s[0]} ${s[1].join('/')} · ${s[2]}%`,nat:s[0],sp:s[1].slice(),item:c.i[0]?c.i[0][0]:''}));
  const phys=p.b[1]>=p.b[3];
  L.push({lab:'Generic attacker: '+(phys?'Adamant 2/32/0/0/0/32':'Modest 2/0/0/32/0/32'),nat:phys?'Adamant':'Modest',sp:phys?[2,32,0,0,0,32]:[2,0,0,32,0,32],item:''});
  L.push({lab:'Generic bulky: '+(phys?'Brave':'Quiet')+' 32 HP / 32 '+(phys?'Atk':'SpA')+' / 2 Def',nat:phys?'Brave':'Quiet',sp:phys?[32,32,2,0,0,0]:[32,0,2,32,0,0],item:''});
  L.push({lab:'Blank: Hardy, 0 SP',nat:'Hardy',sp:[0,0,0,0,0,0],item:''});
  return L;
}
function learnOf(p){
  const ids=(window.LEARN||{})[baseKeyOf(p)];
  const L=ids&&ids.length?ids.map(i=>MV[i]).filter(Boolean):MV.slice();
  return L.filter(m=>CG.moves.get(SC.toID(m.n))).sort((a,b)=>a.n.localeCompare(b.n));
}
function guessMoves(p){
  const L=learnOf(p).filter(m=>m.c!=='T'&&m.p>0);const phys=p.b[1]>=p.b[3];
  const sc=m=>m.p*(p.t.includes(m.t)?1.5:1)*((m.c==='P')===phys?1:.55)*(m.a&&m.a<100?m.a/100:1);
  const out=[],types=new Set();
  L.sort((a,b)=>sc(b)-sc(a)).forEach(m=>{if(out.length<4&&!types.has(m.t)){out.push(m.n);types.add(m.t)}});
  L.forEach(m=>{if(out.length<4&&!out.includes(m.n))out.push(m.n)});
  return out;
}
function setSpecies(i,k,keepPreset){
  const s=CS.p[i],p=BYK[k];if(!p)return;
  s.k=k;s.bo=[0,0,0,0,0,0];s.hp=100;s.st='';s.af=0;s.abOn=false;
  const set=(window.SETS||{})[k]||(window.SETS||{})[baseKeyOf(p)];
  s.ab=set&&set.a&&set.a.length&&p.a.includes(set.a[0][0])?set.a[0][0]:p.a[0];
  let mv=set&&set.m?set.m.map(x=>x[0]).filter(n=>CG.moves.get(SC.toID(n))).slice(0,4):[];
  if(mv.length<4)guessMoves(p).forEach(n=>{if(mv.length<4&&!mv.includes(n))mv.push(n)});
  s.mv=[0,1,2,3].map(j=>({n:mv[j]||'',crit:false,hits:0}));
  applyPreset(i,keepPreset?s.pre:0);
}
function applyPreset(i,ix){
  const s=CS.p[i],p=BYK[s.k],L=presetsOf(s.k),pr=L[Math.min(ix,L.length-1)];
  s.pre=Math.min(ix,L.length-1);s.nat=pr.nat;s.sp=pr.sp.slice();
  s.item=p.m&&p.i?p.i:(pr.item||(L[0].item||''));
  autoField(s.ab);
}
function autoField(ab){if(WEATHER_AB[ab])CS.f.w=WEATHER_AB[ab];if(TERRAIN_AB[ab])CS.f.t=TERRAIN_AB[ab]}

/* ---- engine objects ---- */
function mkPoke(i){
  const s=CS.p[i],p=BYK[s.k];
  const evs={},boosts={};ST6.forEach((t,j)=>{evs[t]=s.sp[j];if(j)boosts[t]=s.bo[j]});
  const o={level:50,nature:s.nat,ability:s.ab,abilityOn:s.abOn,item:s.item||undefined,evs,boosts,status:s.st||'',alliesFainted:s.af||0};
  const pk=new SC.Pokemon(CG,calcName(p),o);
  if(s.hp<100){pk.originalCurHP=Math.max(1,Math.floor(pk.maxHP()*s.hp/100))}
  return pk;
}
function sideObj(i){const x=CS.f.s[i]||{};return {isReflect:!!x.ref,isLightScreen:!!x.ls,isAuroraVeil:!!x.veil,isHelpingHand:!!x.hh,isFriendGuard:!!x.fg,isTailwind:!!x.tw,isBattery:!!x.bat,isPowerSpot:!!x.ps,isSteelySpirit:!!x.ss,isFlowerGift:!!x.fgift,isSR:!!x.sr,spikes:+x.spk||0,isSeeded:!!x.seed,isSaltCured:!!x.salt,isProtected:!!x.prot}}
function mkField(a){
  const f=CS.f;
  return new SC.Field({gameType:f.gt,weather:f.w||undefined,terrain:f.t||undefined,isGravity:f.grav,isMagicRoom:f.magic,isWonderRoom:f.wonder,attackerSide:sideObj(a),defenderSide:sideObj(1-a)});
}
function finalSpeed(i,pk){
  const s=CS.p[i];let v=pk.rawStats.spe;const b=s.bo[5];v=Math.floor(v*(b>=0?(2+b)/2:2/(2-b)));
  const it=s.item,ab=s.ab,w=CS.f.w,t=CS.f.t;
  if(it==='Choice Scarf')v=Math.floor(v*1.5);if(it==='Iron Ball')v=Math.floor(v/2);
  if((ab==='Swift Swim'&&w==='Rain')||(ab==='Chlorophyll'&&w==='Sun')||(ab==='Sand Rush'&&w==='Sand')||(ab==='Slush Rush'&&w==='Snow')||(ab==='Surge Surfer'&&t==='Electric')||(ab==='Unburden'&&s.abOn))v*=2;
  if(ab==='Quick Feet'&&s.st)v=Math.floor(v*1.5);else if(s.st==='par')v=Math.floor(v/2);
  if(CS.f.s[i]&&CS.f.s[i].tw)v*=2;
  return v;
}

/* ---- rendering ---- */
const copt=(v,l,sel)=>`<option value="${esc(v)}"${sel?' selected':''}>${esc(l)}</option>`;
function itemOptions(s,p){
  const forms=formsOf(p).filter(f=>f.m&&f.i).map(f=>f.i);
  let h=copt('','(no item)',!s.item);
  const cats=ICATS.filter(c=>c!=='Mega Stone');
  if(forms.length)h+=`<optgroup label="Mega Stone">${forms.map(n=>copt(n,n+(ITBY[n]&&ITBY[n].es?' · '+ITBY[n].es:''),s.item===n)).join('')}</optgroup>`;
  cats.forEach(c=>{h+=`<optgroup label="${c}">${IT.filter(x=>x.cat===c).map(x=>copt(x.n,x.n+(x.es?' · '+x.es:''),s.item===x.n)).join('')}</optgroup>`});
  if(s.item&&!IT.some(x=>x.n===s.item&&x.cat!=='Mega Stone')&&!forms.includes(s.item))h+=`<optgroup label="Other Mega Stones">${copt(s.item,s.item,true)}</optgroup>`;
  return h;
}
const QSP=[['32 Atk · 32 Spe',[2,32,0,0,0,32]],['32 SpA · 32 Spe',[2,0,0,32,0,32]],['32 HP · 32 Atk',[32,32,2,0,0,0]],['32 HP · 32 SpA',[32,0,2,32,0,0]],['Bulky Def',[32,0,32,0,2,0]],['Bulky SpD',[32,0,2,0,32,0]],['Clear',[0,0,0,0,0,0]]];
const QBO=[['Intimidated −1 Atk',s=>{s.bo[1]=-1}],['−2 Atk',s=>{s.bo[1]=-2}],['+1 Atk',s=>{s.bo[1]=1}],['+1 SpA',s=>{s.bo[3]=1}],['+1 Def',s=>{s.bo[2]=1}],['+1 SpD',s=>{s.bo[4]=1}],['Reset',s=>{s.bo=[0,0,0,0,0,0]}]];
/* ---- Showdown import / export ---- */
const SPLAB={hp:0,atk:1,def:2,spa:3,spd:4,spe:5};
const sid=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]/g,'');
function parsePaste(txt){
  const blocks=String(txt||'').replace(/\r/g,'').split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean);
  const out=[],bad=[];
  blocks.forEach(b=>{
    const L=b.split('\n').map(x=>x.trim()).filter(Boolean);if(!L.length)return;
    let head=L[0],item='';const at=head.lastIndexOf(' @ ');if(at>=0){item=head.slice(at+3).trim();head=head.slice(0,at).trim()}
    head=head.replace(/\s*\((M|F)\)\s*$/,'').trim();
    const m=head.match(/\(([^()]+)\)\s*$/);let sp=m?m[1]:head;
    let k=sid(sp);if(!BYK[k]){const alt=P.find(p=>sid(p.n)===k||sid(p.n).startsWith(k));k=alt?alt.k:''}
    if(!k){bad.push(sp);return}
    const it=Object.values(ITBY).find(x=>sid(x.n)===sid(item));item=it?it.n:'';
    if(it&&it.mega){const mk=sid(it.mega);if(BYK[mk]&&baseKeyOf(BYK[mk])===baseKeyOf(BYK[k]))k=mk}
    const o={k,item,ab:'',nat:'',sp:null,mv:[]};
    L.slice(1).forEach(l=>{
      let x;
      if((x=l.match(/^Ability:\s*(.+)$/i)))o.ab=x[1].trim();
      else if((x=l.match(/^(EVs|SPs|Stat Points):\s*(.+)$/i))){const v=[0,0,0,0,0,0];x[2].split('/').forEach(t=>{const y=t.trim().match(/^(\d+)\s+(\w+)/);if(y){const j=SPLAB[sid(y[2])];if(j!==undefined)v[j]=+y[1]}});if(v.some(n=>n>32))for(let j=0;j<6;j++)v[j]=Math.min(32,Math.round(v[j]/8));o.sp=v}
      else if((x=l.match(/^(\w+)\s+Nature/i)))o.nat=x[1][0].toUpperCase()+x[1].slice(1).toLowerCase();
      else if((x=l.match(/^[-~]\s*(.+)$/))){const n=x[1].replace(/\s*\[.*\]\s*$/,'').trim();const mm=MV.find(z=>sid(z.n)===sid(n));if(mm&&o.mv.length<4)o.mv.push(mm.n)}
    });
    out.push(o);
  });
  return {sets:out,bad};
}
function applySet(i,o){
  setSpecies(i,o.k);const s=CS.p[i],p=BYK[o.k];
  if(o.item)s.item=o.item;
  if(o.ab&&p.a.some(a=>sid(a)===sid(o.ab)))s.ab=p.a.find(a=>sid(a)===sid(o.ab));
  if(o.nat&&NATS.some(n=>n[0]===o.nat))s.nat=o.nat;
  if(o.sp)s.sp=o.sp.slice();
  if(o.mv&&o.mv.length)s.mv=[0,1,2,3].map(j=>({n:o.mv[j]||'',crit:false,hits:0}));
  s.pre=-1;autoField(s.ab);
}
function exportSet(i){
  const s=CS.p[i],p=BYK[s.k],b=p.m?BYK[baseKeyOf(p)]:p;
  const sp=ST6.map((t,j)=>s.sp[j]?`${s.sp[j]} ${['HP','Atk','Def','SpA','SpD','Spe'][j]}`:'').filter(Boolean).join(' / ');
  return `${(b||p).n}${s.item?' @ '+s.item:''}\nAbility: ${s.ab}\nLevel: 50\n${sp?'EVs: '+sp+'\n':''}${s.nat} Nature\n${s.mv.filter(m=>m.n).map(m=>'- '+m.n).join('\n')}`;
}
/* ---- saved teams ---- */
function teamsLoad(){
  let t=null;try{t=JSON.parse(localStorage.getItem('vgcTeams')||'null')}catch(e){}
  if(!Array.isArray(t)){t=[];try{const old=JSON.parse(localStorage.getItem('vgcTeam')||'[]');if(old.length)t.push({id:'t'+Date.now(),name:'My team',sets:old,up:Date.now()})}catch(e){}teamsSave(t)}
  return t;
}
function teamsSave(t){try{localStorage.setItem('vgcTeams',JSON.stringify(t))}catch(e){}}
function teamActiveId(){let a='';try{a=localStorage.getItem('vgcTeamA')||''}catch(e){}const t=teamsLoad();return t.some(x=>x.id===a)?a:(t[0]?t[0].id:'')}
function teamSetActive(id){try{localStorage.setItem('vgcTeamA',id)}catch(e){}}
function loadTeam(){const t=teamsLoad(),a=teamActiveId();const x=t.find(z=>z.id===a);return x?x.sets:[]}
function teamAdd(name,sets){const t=teamsLoad();const id='t'+Date.now()+Math.floor(Math.random()*1000);t.push({id,name:name||('Team '+(t.length+1)),sets:sets.slice(0,6),up:Date.now()});teamsSave(t);teamSetActive(id);return id}
function saveTeam(sets,name){return teamAdd(name,sets)}
function splitTeams(txt){
  const L=String(txt||'').replace(/\r/g,'').split('\n'),out=[];let cur=null;
  L.forEach(l=>{const m=l.match(/^===\s*(?:\[[^\]]*\]\s*)?(.*?)\s*===\s*$/);if(m){cur={name:m[1]||'',txt:''};out.push(cur)}else{if(!cur){cur={name:'',txt:''};out.push(cur)}cur.txt+=l+'\n'}});
  return out.filter(x=>x.txt.trim());
}
function teamText(tm){return tm.sets.map(o=>exportObj(o)).join('\n\n')}
function exportObj(o){
  const p=BYK[o.k];if(!p)return '';const b=p.m?BYK[baseKeyOf(p)]:p;
  const sp=(o.sp||[0,0,0,0,0,0]).map((v,j)=>v?`${v} ${['HP','Atk','Def','SpA','SpD','Spe'][j]}`:'').filter(Boolean).join(' / ');
  const ab=p.m&&b&&o.ab&&!b.a.includes(o.ab)?b.a[0]:o.ab;
  return `${(b||p).n}${o.item?' @ '+o.item:''}\n${ab?'Ability: '+ab+'\n':''}Level: 50\n${sp?'EVs: '+sp+'\n':''}${o.nat?o.nat+' Nature\n':''}${(o.mv||[]).filter(Boolean).map(m=>'- '+m).join('\n')}`;
}
function openImport(i){
  LASTCARD=null;
  $('#modalBox').style.setProperty('--tc','var(--accent)');
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="mbody" style="padding-top:18px"><h2 style="margin:0 0 6px">Import from Showdown</h2>
   <p class="note" style="margin:0 0 10px">Paste one set, or a whole team (sets separated by a blank line). Species, item, ability, nature, EVs/SP and moves are read. A Mega Stone loads the Mega form. EVs over 32 are converted to SP (÷8).</p>
   <textarea id="impTxt" rows="12" spellcheck="false" style="width:100%;font-family:var(--mono);font-size:13px;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px" placeholder="Garchomp @ Choice Scarf&#10;Ability: Rough Skin&#10;Level: 50&#10;EVs: 2 HP / 32 Atk / 32 Spe&#10;Adamant Nature&#10;- Earthquake&#10;- Dragon Claw&#10;- Rock Slide&#10;- Stomping Tantrum"></textarea>
   <div class="cbtns" style="margin-top:10px"><button class="btn primary" data-impgo="0">Load into Pokémon 1</button><button class="btn primary" data-impgo="1">Load into Pokémon 2</button><button class="btn" data-impgo="team">Save as new team</button></div>
   <p class="note" id="impMsg" style="margin-top:8px"></p></div>`;
  $('#modal').classList.remove('hide');$('#impTxt').focus();
}
function openExport(i){
  const t=exportSet(i);LASTCARD=null;
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="mbody" style="padding-top:18px"><h2 style="margin:0 0 6px">Export set</h2><p class="note" style="margin:0 0 10px">Showdown format. Copy it into the Showdown teambuilder or a note.</p>
   <textarea id="expTxt" rows="9" readonly style="width:100%;font-family:var(--mono);font-size:13px;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px">${esc(t)}</textarea>
   <div class="cbtns" style="margin-top:10px"><button class="btn primary" id="expCopy">Copy</button></div><p class="note" id="expMsg"></p></div>`;
  $('#modal').classList.remove('hide');
  $('#expCopy').addEventListener('click',()=>{const ta=$('#expTxt');ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}
    if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>{$('#expMsg').textContent='Copied.'}).catch(()=>{$('#expMsg').textContent=ok?'Copied.':'Select the text and copy it by hand.'});else $('#expMsg').textContent=ok?'Copied.':'Select the text and copy it by hand.'});
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-impgo]');if(!g)return;
  const r=parsePaste($('#impTxt').value);
  if(!r.sets.length){$('#impMsg').textContent='Nothing recognised. '+(r.bad.length?'Unknown: '+r.bad.join(', '):'Paste a Showdown set.');return}
  const warn=r.bad.length?`Loaded. Not recognised (skipped): ${r.bad.join(', ')}.`:'';
  if(g.dataset.impgo==='team'){const parts=splitTeams($('#impTxt').value);if(parts.length>1)parts.forEach(pt=>{const rr=parsePaste(pt.txt);if(rr.sets.length)teamAdd(pt.name,rr.sets)});else saveTeam(r.sets.slice(0,6));renderPick();if(DONE.teams)renderTeams();if(warn)$('#impMsg').textContent=warn;else $('#modal').classList.add('hide');return}
  const i=+g.dataset.impgo;applySet(i,r.sets[0]);if(r.sets.length>1){saveTeam(r.sets.slice(0,6));if(DONE.teams)renderTeams()}
  CSEL=[i,0];renderCalcAll();renderPick();if(warn)$('#impMsg').textContent=warn;else $('#modal').classList.add('hide');
});
/* ---- quick pick bar ---- */
function renderPick(){
  const el=$('#cPick');if(!el)return;const t=CS.tgt||0,team=loadTeam(),TL=teamsLoad(),aid=teamActiveId();
  const top=[...P].sort((a,b)=>uOf(b)-uOf(a)).slice(0,12);
  el.innerHTML=`<div class="cq" style="margin:0 0 8px"><span>Load into</span><button type="button" class="gchip" data-tgt="0" aria-pressed="${t===0}">Pokémon 1</button><button type="button" class="gchip" data-tgt="1" aria-pressed="${t===1}">Pokémon 2</button></div>
   <div class="cprow"><span class="cpl">Team</span>${TL.length?`<select class="ctsel" data-tsel>${TL.map(x=>copt(x.id,x.name,x.id===aid)).join('')}</select>`:''}${team.map((o,j)=>BYK[o.k]?`<button type="button" class="cpk" data-team="${j}" title="${esc(BYK[o.k].n)}"><img src="${BYK[o.k].img}" alt="${esc(BYK[o.k].n)}"></button>`:'').join('')}<button type="button" class="gchip" data-imp="team">${TL.length?'+ Import team':'Paste your team'}</button>${TL.length?'<button type="button" class="gchip" data-goteams="1">Manage</button>':''}</div>
   <div class="cprow"><span class="cpl">Meta top 12</span>${top.map(p=>`<button type="button" class="cpk" data-meta="${p.k}" title="${esc(p.n)} · ${fmtU(uOf(p))}"><img src="${p.img}" alt="${esc(p.n)}"></button>`).join('')}</div>`;
}
function panelHTML(i){
  const s=CS.p[i],p=BYK[s.k],fs=formsOf(p),L=presetsOf(s.k),lm=learnOf(p);
  const ul=(window.CSETS&&CSETS[s.k])?'':'<p class="note" style="margin:4px 0 0">No ladder data for this form: generic set.</p>';
  const mvOpts=cur=>copt('','(none)',!cur)+(cur&&!lm.some(m=>m.n===cur)?copt(cur,cur,true):'')+lm.map(m=>copt(m.n,m.n,m.n===cur)).join('');
  return `<div class="cph"><span class="cside">Pokémon ${i+1}</span>
   <div class="cpick"><img src="${p.img}" alt=""><div class="cps"><input type="text" class="cpq" data-i="${i}" value="${esc(p.n)}" aria-label="Pokémon ${i+1}" autocomplete="off" spellcheck="false"><div class="cpsug hide"></div></div></div>
   <div class="cpt">${tpills(p.t)}</div></div>
   ${fs.length>1?`<div class="ftabs cforms">${fs.map(f=>`<button class="${f.m?'mg':'bs'}" data-form="${f.k}" aria-pressed="${f.k===s.k}">${f.m?'✦ ':''}${megaLbl(f)}</button>`).join('')}</div>`:''}
   <div class="cf"><label>Set</label><select data-c="pre">${s.pre<0?copt(-1,'Custom (edited or imported)',true):''}${L.map((x,j)=>copt(j,x.lab,j===s.pre)).join('')}</select><div class="cbtns"><button type="button" class="gchip" data-imp="${i}">Import set</button><button type="button" class="gchip" data-exp="${i}">Export set</button><button type="button" class="gchip" data-save="${i}">Save to team</button></div>${ul}</div>
   <div class="cf2"><div class="cf"><label>Nature</label><select data-c="nat">${NATS.map(n=>copt(n[0],NATL(n[0])+(ESN('n',n[0])?' · '+ESN('n',n[0]):''),n[0]===s.nat)).join('')}</select></div>
   <div class="cf"><label>Ability</label><select data-c="ab">${p.a.map(a=>copt(a,a+(ESN('a',a)&&ESN('a',a)!==a?' · '+ESN('a',a):''),a===s.ab)).join('')}</select>${ABON.includes(s.ab)?`<label class="chk"><input type="checkbox" data-c="abOn"${s.abOn?' checked':''}> Ability active</label>`:''}</div></div>
   <div class="cf"><label>Item</label><div class="citem"><img data-iimg src="${(ITBY[s.item]||{}).img||''}" alt=""${s.item&&ITBY[s.item]?'':' style="visibility:hidden"'}><select data-c="item">${itemOptions(s,p)}</select></div></div>
   <table class="cst"><thead><tr><th></th><th>Base</th><th>SP</th><th>Boost</th><th>Stat</th></tr></thead><tbody>
   ${STATS.map((t,j)=>`<tr><th style="color:${STATCOL[j]}">${t}</th><td>${p.b[j]}</td><td><input type="number" inputmode="numeric" min="0" max="32" data-sp="${j}" value="${s.sp[j]}"></td><td>${j?`<select data-bo="${j}">${[6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6].map(v=>copt(v,(v>0?'+':'')+v,v===s.bo[j])).join('')}</select>`:''}</td><td class="cfin" data-fin="${j}"></td></tr>`).join('')}
   </tbody></table>
   <div class="csptot" data-sptot></div>
   <div class="cq"><span>Quick SP</span>${QSP.map(([l],j)=>`<button type="button" class="gchip" data-qsp="${j}">${l}</button>`).join('')}</div>
   <div class="cq"><span>Boosts</span>${QBO.map(([l],j)=>`<button type="button" class="gchip" data-qbo="${j}">${l}</button>`).join('')}</div>
   <div class="cf2"><div class="cf"><label>Current HP %</label><input type="number" inputmode="numeric" min="1" max="100" data-c="hp" value="${s.hp}"><span class="note" data-hpv></span></div>
   <div class="cf"><label>Status</label><select data-c="st">${STATUS.map(([v,l])=>copt(v,l,v===s.st)).join('')}</select></div></div>
   ${s.ab==='Supreme Overlord'||s.mv.some(m=>m.n==='Last Respects')?`<div class="cf"><label>Allies fainted</label><select data-c="af">${[0,1,2,3,4,5].map(v=>copt(v,v,v===s.af)).join('')}</select></div>`:''}
   <div class="cmvs">${s.mv.map((m,j)=>{const mm=m.n?CG.moves.get(SC.toID(m.n)):null;const mh=mm&&Array.isArray(mm.multihit);const dm=MV.find(x=>x.n===m.n);
     return `<div class="cmv"><select data-mv="${j}">${mvOpts(m.n)}</select>${dm?`<span class="tp" style="background:${TCOL[dm.t]}">${dm.t}</span><small>${dm.c==='T'?'Status':(dm.c==='P'?'Phys':'Spec')} ${dm.p||''}</small>`:''}${dm&&dm.c!=='T'?`<label class="chk"><input type="checkbox" data-crit="${j}"${m.crit?' checked':''}> Crit</label>`:''}${mh?`<select data-hits="${j}">${[2,3,4,5].map(v=>copt(v,v+' hits',(m.hits||(mm.multihit[0]===2&&mm.multihit[1]===5?3:mm.multihit[1]))===v)).join('')}</select>`:''}</div>`}).join('')}</div>
   ${p.m?'':''}`;
}
function fieldHTML(){
  const f=CS.f,ck=(k,l,on)=>`<label class="chk"><input type="checkbox" data-ff="${k}"${on?' checked':''}> ${l}</label>`;
  const sel=(k,arr,cur)=>`<select data-ff="${k}">${arr.map(([v,l])=>copt(v,l,v===cur)).join('')}</select>`;
  const SIDE=[['ref','Reflect'],['ls','Light Screen'],['veil','Aurora Veil'],['hh','Helping Hand'],['fg','Friend Guard'],['tw','Tailwind'],['bat','Battery'],['ps','Power Spot'],['ss','Steely Spirit'],['fgift','Flower Gift'],['prot','Protect'],['sr','Stealth Rock'],['seed','Leech Seed'],['salt','Salt Cure']];
  const side=i=>`<div class="cfs"><h4>${esc(BYK[CS.p[i].k].n)}'s side</h4><div class="cchk">${SIDE.map(([k,l])=>`<label class="chk"><input type="checkbox" data-fs="${i}:${k}"${CS.f.s[i][k]?' checked':''}> ${l}</label>`).join('')}</div></div>`;
  return `<h3 class="h" style="margin-top:0">Field</h3>
   <div class="cf"><label>Format</label>${sel('gt',[['Doubles','Doubles'],['Singles','Singles']],f.gt)}</div>
   <div class="cf"><label>Weather</label>${sel('w',[['','None'],['Sun','Sun'],['Rain','Rain'],['Sand','Sand'],['Snow','Snow']],f.w)}</div>
   <div class="cf"><label>Terrain</label>${sel('t',[['','None'],['Electric','Electric'],['Grassy','Grassy'],['Psychic','Psychic'],['Misty','Misty']],f.t)}</div>
   <div class="cchk">${ck('tr','Trick Room',f.tr)}${ck('grav','Gravity',f.grav)}${ck('magic','Magic Room',f.magic)}${ck('wonder','Wonder Room',f.wonder)}</div>
   ${side(0)}${side(1)}
   <button class="btn" id="cSwap" type="button" style="width:100%;margin-top:10px">⇄ Swap Pokémon</button>
   <button class="btn" id="cReset" type="button" style="width:100%;margin-top:8px">Clear field</button>`;
}
function renderPanel(i){$('#cP'+(i+1)).innerHTML=panelHTML(i)}
function renderSeg(){
  const el=$('#cSeg');if(!el)return;const sg=CS.seg||'0';
  const b=(v,i)=>{const p=BYK[CS.p[i].k];return `<button type="button" data-seg="${v}" aria-pressed="${sg===v}"><img src="${p.img}" alt=""><span><small>P${i+1}</small>${esc(p.n)}</span></button>`};
  el.innerHTML=b('0',0)+`<button type="button" data-seg="f" aria-pressed="${sg==='f'}" class="cfseg"><span><small>Field</small>${esc([CS.f.gt==='Singles'?'Singles':'Doubles',CS.f.w,CS.f.t?CS.f.t+' T.':''].filter(Boolean).join(' · '))}</span></button>`+b('1',1);
  $('.cgrid').dataset.seg=sg;
}
function renderCalcAll(){renderPanel(0);renderPanel(1);$('#cField').innerHTML=fieldHTML();renderSeg();recalc()}

let CR=[[],[]],CSEL=[0,0];
function recalc(){
  saveCS();
  let P1,P2;
  try{P1=mkPoke(0);P2=mkPoke(1)}catch(e){$('#cMain').textContent='Error: '+e.message;return}
  const PK=[P1,P2];
  // derived numbers in panels
  [0,1].forEach(i=>{
    const s=CS.p[i],pk=PK[i],root=$('#cP'+(i+1));
    ST6.forEach((t,j)=>{const c=root.querySelector(`[data-fin="${j}"]`);if(c){let v=pk.rawStats[t];if(j&&s.bo[j]){const b=s.bo[j];v=Math.floor(v*(b>=0?(2+b)/2:2/(2-b)))}c.textContent=v;const n=NATS.find(z=>z[0]===s.nat);c.className='cfin'+(n&&n[1]&&j?(SL(n[1])===STATS[j]?' up':SL(n[2])===STATS[j]?' dn':''):'')}});
    const tot=s.sp.reduce((a,b)=>a+b,0),el=root.querySelector('[data-sptot]');if(el){el.textContent=`SP used: ${tot} / 66`+(tot>66?' — over the limit':'');el.classList.toggle('bad',tot>66||s.sp.some(x=>x>32))}
    const hv=root.querySelector('[data-hpv]');if(hv)hv.textContent=`${pk.originalCurHP} / ${pk.maxHP()} HP`;
  });
  // results
  CR=[[],[]];
  [0,1].forEach(a=>{
    const att=PK[a],def=PK[1-a],fld=mkField(a);
    CS.p[a].mv.forEach((m,j)=>{
      if(!m.n){CR[a][j]=null;return}
      try{
        const mm=CG.moves.get(SC.toID(m.n));const o={isCrit:m.crit};if(mm&&Array.isArray(mm.multihit))o.hits=m.hits||(mm.multihit[0]===2&&mm.multihit[1]===5?3:mm.multihit[1]);
        const r=SC.calculate(CG,att,def,new SC.Move(CG,m.n,o),fld);CR[a][j]=r;
      }catch(e){CR[a][j]={err:e.message}}
    });
  });
  const nm=i=>esc(BYK[CS.p[i].k].n);
  $('#cM1h').innerHTML=`${nm(0)} → ${nm(1)}`;$('#cM2h').innerHTML=`${nm(1)} → ${nm(0)}`;
  const btn=(a,j)=>{const m=CS.p[a].mv[j],r=CR[a][j];if(!m.n)return '';let pct='—';
    const dmv=MV.find(x=>x.n===m.n);if(r&&!r.err){const mx=Array.isArray(r.damage)?Math.max(...r.damage.flat()):r.damage;if(mx>0){try{pct=r.moveDesc().split(' (')[0]}catch(e){pct='?'}}else pct=dmv&&dmv.c==='T'?'Status':'0%'}
    const dm=MV.find(x=>x.n===m.n);return `<button class="cmb" data-sel="${a}:${j}" aria-pressed="${CSEL[0]===a&&CSEL[1]===j}" style="--c:${dm?TCOL[dm.t]:'var(--line)'}"><b>${esc(m.n)}</b><span>${esc(pct)}</span></button>`};
  $('#cM1').innerHTML=[0,1,2,3].map(j=>btn(0,j)).join('');$('#cM2').innerHTML=[0,1,2,3].map(j=>btn(1,j)).join('');
  if(!CS.p[CSEL[0]].mv[CSEL[1]].n){const f=[0,1].flatMap(a=>[0,1,2,3].map(j=>[a,j])).find(([a,j])=>CS.p[a].mv[j].n);if(f)CSEL=f}
  const r=CR[CSEL[0]][CSEL[1]];
  if(!r){$('#cMain').innerHTML='<span class="note">Pick a move.</span>';$('#cRolls').textContent=''}
  else if(r.err){$('#cMain').innerHTML=`<span class="note">Could not calculate: ${esc(r.err)}</span>`;$('#cRolls').textContent=''}
  else{
    let full='';try{full=r.fullDesc()}catch(e){full=CS.p[CSEL[0]].mv[CSEL[1]].n+': no damage'}
    const mx=Array.isArray(r.damage)?Math.max(...r.damage.flat()):r.damage;
    const ko=full.split(' -- ')[1]||'';
    const [mn,mxx]=(()=>{try{return r.range()}catch(e){return[0,0]}})();const hp=r.defender.maxHP();
    const pc=v=>Math.floor(v/hp*1000)/10;
    $('#cMain').innerHTML=mx>0?`<div class="cbig"><b>${pc(mn)} – ${pc(mxx)}%</b><span>${mn}–${mxx} HP</span>${ko?`<em class="${/OHKO/.test(ko)?'ko1':/2HKO/.test(ko)?'ko2':''}">${esc(ko)}</em>`:''}</div><p class="cdesc">${esc(full.split(' -- ')[0])}</p>`:`<div class="cbig"><b>No damage</b></div><p class="cdesc">${esc(full)}</p>`;
    const rolls=Array.isArray(r.damage)?(Array.isArray(r.damage[0])?r.damage.map(x=>x.join(', ')).join(' | '):r.damage.join(', ')):String(r.damage);
    $('#cRolls').textContent=rolls;
  }
  {const sel=CS.p[CSEL[0]].mv[CSEL[1]],rr=CR[CSEL[0]][CSEL[1]];let t='';
   if(sel&&sel.n&&rr&&!rr.err){try{const fd=rr.fullDesc();const m=fd.match(/\(([\d.]+ - [\d.]+%)\)/);const ko=fd.split(' -- ')[1]||'';t=`<b>${esc(sel.n)}</b> ${m?m[1]:'0%'}${ko?` · <em>${esc(ko)}</em>`:''}`}catch(e){}}
   $('#cMini').innerHTML=t?`<span>${esc(BYK[CS.p[CSEL[0]].k].n)} → ${esc(BYK[CS.p[1-CSEL[0]].k].n)}</span>${t}`:'';}
  // speed
  const s1=finalSpeed(0,P1),s2=finalSpeed(1,P2),tr=CS.f.tr;
  const first=s1===s2?-1:((s1>s2)!==tr?0:1);
  $('#cSpd').innerHTML=`<span>Speed: <b>${nm(0)}</b> ${s1} · <b>${nm(1)}</b> ${s2}${tr?' · Trick Room':''}</span><span class="${first<0?'':'ok'}">${first<0?'Speed tie (random)':nm(first)+' moves first'} <small>(same priority)</small></span>`;
}

/* ---- search box ---- */
function sugFor(q){
  q=q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const L=[...P].filter(p=>!q||p.n.toLowerCase().includes(q)).sort((a,b)=>{const as=a.n.toLowerCase().startsWith(q),bs=b.n.toLowerCase().startsWith(q);return (bs-as)||(uTot(b)-uTot(a))||a.n.localeCompare(b.n)});
  return L.slice(0,40);
}
function showSug(inp){
  const box=inp.nextElementSibling,L=sugFor(inp.dataset.typed?inp.value:'');
  box.innerHTML=L.map(p=>`<button type="button" data-pk="${p.k}"><img src="${p.img}" alt="" loading="lazy">${esc(p.n)}${uOf(p)>=.1?`<small>${fmtU(uOf(p))}</small>`:''}</button>`).join('')||'<p class="note" style="padding:8px">No match.</p>';
  box.classList.remove('hide');
}

/* ---- events ---- */
function bindCalc(){
  const app=$('#calcApp');
  app.addEventListener('focusin',e=>{const q=e.target.closest('.cpq');if(q){q.dataset.typed='';q.select();showSug(q)}});
  app.addEventListener('input',e=>{
    const t=e.target;
    if(t.classList.contains('cpq')){t.dataset.typed='1';showSug(t);return}
    const pan=t.closest('.cpan');
    if(pan){
      const i=pan.id==='cP1'?0:1,s=CS.p[i];
      if(t.dataset.sp!==undefined){let v=parseInt(t.value,10);if(isNaN(v))v=0;v=Math.max(0,Math.min(32,v));s.sp[+t.dataset.sp]=v;s.pre=-1;recalc();return}
      if(t.dataset.c==='hp'){let v=parseInt(t.value,10);if(isNaN(v))return;s.hp=Math.max(1,Math.min(100,v));recalc();return}
    }
  });
  app.addEventListener('change',e=>{
    const t=e.target,pan=t.closest('.cpan');
    if(pan){
      const i=pan.id==='cP1'?0:1,s=CS.p[i];
      if(t.dataset.c==='pre'){if(+t.value<0)return;applyPreset(i,+t.value);renderPanel(i);$('#cField').innerHTML=fieldHTML();recalc();return}
      if(t.dataset.c==='nat'){s.nat=t.value;recalc();return}
      if(t.dataset.c==='ab'){s.ab=t.value;s.abOn=false;autoField(s.ab);renderPanel(i);$('#cField').innerHTML=fieldHTML();recalc();return}
      if(t.dataset.c==='abOn'){s.abOn=t.checked;recalc();return}
      if(t.dataset.c==='item'){s.item=t.value;const im=pan.querySelector('[data-iimg]');if(im){const x=ITBY[s.item];im.src=x&&x.img||'';im.style.visibility=x?'visible':'hidden'}recalc();return}
      if(t.dataset.c==='st'){s.st=t.value;recalc();return}
      if(t.dataset.c==='af'){s.af=+t.value;recalc();return}
      if(t.dataset.c==='hp'){t.value=s.hp;return}
      if(t.dataset.sp!==undefined){t.value=s.sp[+t.dataset.sp];return}
      if(t.dataset.bo!==undefined){s.bo[+t.dataset.bo]=+t.value;recalc();return}
      if(t.dataset.mv!==undefined){const j=+t.dataset.mv;s.mv[j]={n:t.value,crit:false,hits:0};CSEL=[i,j];renderPanel(i);recalc();return}
      if(t.dataset.crit!==undefined){s.mv[+t.dataset.crit].crit=t.checked;CSEL=[i,+t.dataset.crit];recalc();return}
      if(t.dataset.hits!==undefined){s.mv[+t.dataset.hits].hits=+t.value;recalc();return}
    }
    if(t.dataset.tsel!==undefined){teamSetActive(t.value);renderPick();return}
    if(t.dataset.ff){const k=t.dataset.ff;CS.f[k]=t.type==='checkbox'?t.checked:t.value;renderSeg();recalc();return}
    if(t.dataset.fs){const [i,k]=t.dataset.fs.split(':');CS.f.s[+i][k]=t.checked;recalc();return}
  });
  app.addEventListener('mousedown',e=>{if(e.target.closest('.cpsug'))e.preventDefault()});
  app.addEventListener('click',e=>{
    const pk=e.target.closest('[data-pk]');
    if(pk){const box=pk.closest('.cps'),i=+box.querySelector('.cpq').dataset.i;setSpecies(i,pk.dataset.pk);CSEL=[i,0];renderCalcAll();return}
    const fm=e.target.closest('[data-form]');
    if(fm){const i=fm.closest('.cpan').id==='cP1'?0:1;setSpecies(i,fm.dataset.form);renderCalcAll();return}
    const gt=e.target.closest('[data-goteams]');if(gt){showTab('teams');return}
    const sv=e.target.closest('[data-save]');if(sv){const i=+sv.dataset.save,s=CS.p[i];const o={k:s.k,item:s.item,ab:s.ab,nat:s.nat,sp:s.sp.slice(),mv:s.mv.map(m=>m.n).filter(Boolean)};const T=teamsLoad();let tm=T.find(x=>x.id===teamActiveId());
      if(!tm||tm.sets.length>=6){teamAdd('',[o]);sv.textContent='Saved in a new team'}else{tm.sets.push(o);tm.up=Date.now();teamsSave(T);sv.textContent='Saved in '+tm.name}renderPick();if(DONE.teams)renderTeams();setTimeout(()=>{sv.textContent='Save to team'},1800);return}
    const im=e.target.closest('[data-imp]');if(im){openImport(im.dataset.imp);return}
    const ex=e.target.closest('[data-exp]');if(ex){openExport(+ex.dataset.exp);return}
    const tg=e.target.closest('[data-tgt]');if(tg){CS.tgt=+tg.dataset.tgt;saveCS();renderPick();return}
    const tm=e.target.closest('[data-team]');if(tm){const o=loadTeam()[+tm.dataset.team];if(o){const i=CS.tgt||0;applySet(i,o);CSEL=[i,0];renderCalcAll()}return}
    const mt=e.target.closest('[data-meta]');if(mt){const i=CS.tgt||0;setSpecies(i,mt.dataset.meta);CSEL=[i,0];renderCalcAll();return}
    const qs=e.target.closest('[data-qsp]');if(qs){const i=qs.closest('.cpan').id==='cP1'?0:1;CS.p[i].sp=QSP[+qs.dataset.qsp][1].slice();CS.p[i].pre=-1;renderPanel(i);recalc();return}
    const qb=e.target.closest('[data-qbo]');if(qb){const i=qb.closest('.cpan').id==='cP1'?0:1;QBO[+qb.dataset.qbo][1](CS.p[i]);renderPanel(i);recalc();return}
    const sg=e.target.closest('[data-seg]');if(sg){CS.seg=sg.dataset.seg;if(CS.seg!=='f'){CS.tgt=+CS.seg;renderPick()}renderSeg();saveCS();const top=$('#cSeg').getBoundingClientRect().top+window.scrollY-6;if(window.scrollY>top)window.scrollTo({top,behavior:'smooth'});return}
    const sb=e.target.closest('[data-sel]');
    if(sb){CSEL=sb.dataset.sel.split(':').map(Number);recalc();return}
    if(e.target.closest('#cSwap')){CS.p.reverse();CS.f.s.reverse();CSEL=[1-CSEL[0],CSEL[1]];renderCalcAll();return}
    if(e.target.closest('#cReset')){CS.f=CFIELD();renderCalcAll();return}
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.cps'))$$('.cpsug').forEach(b=>b.classList.add('hide'))});
  app.addEventListener('focusout',e=>{const q=e.target.closest('.cpq');if(q)setTimeout(()=>{q.nextElementSibling.classList.add('hide');const i=+q.dataset.i;q.value=BYK[CS.p[i].k].n},150)});
  app.addEventListener('keydown',e=>{const q=e.target.closest('.cpq');if(q&&e.key==='Enter'){e.preventDefault();const f=q.nextElementSibling.querySelector('[data-pk]');if(f)f.click()}});
}

function miniWatch(){
  const bar=$('#cMini'),res=$('#cRes');
  const upd=()=>{const on=!$('#tab-calc').classList.contains('hide');const r=res.getBoundingClientRect();const show=on&&r.bottom<60&&bar.innerHTML;const d=$('#tabs').getBoundingClientRect();bar.style.bottom=(window.innerHeight-d.top+8)+'px';bar.classList.toggle('hide',!show)};
  window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);document.addEventListener('click',()=>setTimeout(upd,50));
  bar.addEventListener('click',()=>res.scrollIntoView({behavior:'smooth',block:'start'}));upd();
}
async function initCalc(){
  try{await loadSmog()}catch(e){$('#calcLoad').textContent='Could not load the calculator engine. Check your connection and reload.';DONE.calc=0;return}
  SC=window.calc;CG=SC.Generations.get(0);
  try{CS=JSON.parse(localStorage.getItem('vgcCalc')||'null')}catch(e){CS=null}
  if(!CS||!CS.p||!BYK[CS.p[0].k]||!BYK[CS.p[1].k]){
    CS={p:[CSIDE(),CSIDE()],f:CFIELD()};
    const top=[...P].filter(p=>!p.m).sort((a,b)=>uOf(b)-uOf(a));
    setSpecies(0,(top[0]||P[0]).k);setSpecies(1,(BYK.incineroar?'incineroar':(top[1]||P[1]).k));
  }
  if(!CS.f||!CS.f.s)CS.f=CFIELD();
  $('#calcLoad').classList.add('hide');$('#calcApp').classList.remove('hide');
  if(CS.tgt===undefined)CS.tgt=1;
  bindCalc();renderCalcAll();renderPick();miniWatch();
}
function calcOpen(k){
  // open a Pokémon from elsewhere in the app as Pokémon 1
  const go=()=>{setSpecies(0,k);CSEL=[0,0];renderCalcAll()};
  $('#modal').classList.add('hide');
  if(DONE.calc&&SC){showTab('calc');go()}else{window.__calcPending=k;showTab('calc')}
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-calc]');if(b){e.preventDefault();calcOpen(b.dataset.calc)}});
{const _ic=initCalc;window.initCalc=async function(){await _ic();if(window.__calcSet&&SC){applySet(0,window.__calcSet);window.__calcSet=null;CSEL=[0,0];renderCalcAll();renderPick()}if(window.__calcPending&&SC){const k=window.__calcPending;window.__calcPending=null;setSpecies(0,k);CSEL=[0,0];renderCalcAll()}}}

/* ---------- ITEMS ---------- */
$('#iCat').innerHTML=['All',...ICATS].map(c=>`<option>${c}</option>`).join('');
function renderItems(){
  const q=$('#iQ').value.trim().toLowerCase(),c=$('#iCat').value;
  const L=IT.filter(x=>(c==='All'?x.cat!=='Mega Stone':x.cat===c)&&(!q||hasQ('i',x.n,q)||(x.u||[]).some(([k])=>BYK[k]&&BYK[k].n.toLowerCase().includes(q))||(x.mega&&x.mega.toLowerCase().includes(q))))
    .sort((a,b)=>((b.u&&b.u.length?b.u.reduce((s,u)=>s+u[1]*uOf(BYK[u[0]]||{}),0):0)-(a.u&&a.u.length?a.u.reduce((s,u)=>s+u[1]*uOf(BYK[u[0]]||{}),0):0))||a.n.localeCompare(b.n));
  $('#iCount').textContent=L.length+' items · sorted by how much the ladder uses them'+(c==='All'?` · ${IT.filter(x=>x.cat==='Mega Stone').length} Mega Stones hidden (pick the Mega Stone category)`:'');
  const compact=!$('#iMons').checked;$('#iGrid').classList.toggle('compact',compact);
  $('#iGrid').innerHTML=L.map(x=>{const us=compact?'':(x.u||[]).slice(0,12).map(([k,pc])=>BYK[k]?`<span class="chip"><img src="${BYK[k].img}" alt="">${esc(BYK[k].n)} <small>${pc}%</small></span>`:'').join('');
    return `<div class="ab" data-it="${esc(x.n)}" role="button" tabindex="0" style="--c:${ICOL[x.cat]}"><h4><span class="ih"><img class="iimg" src="${x.img||''}" alt="" loading="lazy"><span>${bi('i',x.n)}</span></span><span class="cat">${x.cat}</span></h4><p>${dsc('i',x.n,x.d)}</p><div class="abn">${compact?((x.u||[]).length?`${x.u.length} Pokémon on the ladder · tap for details`:'Not seen on the ladder top sets · tap for details'):(us?`<div class="chips">${us}</div>`:'Not seen on the ladder top sets')}</div></div>`}).join('')||'<p class="note">No results.</p>';
}
$('#iQ').addEventListener('input',deb(renderItems));$('#iMons').addEventListener('change',renderItems);$('#iCat').addEventListener('input',renderItems);
$('#iGrid').addEventListener('click',e=>{const a=e.target.closest('[data-it]');if(a)openItem(a.dataset.it)});
$('#iGrid').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset&&e.target.dataset.it){e.preventDefault();openItem(e.target.dataset.it)}});
function openItem(n){
  const x=ITBY[n];if(!x)return;
  const us=(x.u||[]).filter(([k])=>BYK[k]);
  LASTCARD=null;
  $('#modalBox').style.setProperty('--tc',ICOL[x.cat]);
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="hero" style="padding:20px 18px 14px">${x.img?`<img class="iimgb" src="${x.img}" alt="">`:''}<div><h2>${bi('i',x.n)}</h2><div style="margin-top:8px"><span class="cp" style="--c:${ICOL[x.cat]}">${x.cat}</span></div></div></div>
   <div class="mbody"><div class="mdesc">${dsc('i',x.n,x.d)}</div>
   ${x.mega&&BYK[SC_key(x.mega)]?`<h3 class="h">Mega Evolves into</h3><div class="lgrid" style="margin-bottom:16px"><button class="lr" data-k="${SC_key(x.mega)}"><img src="${BYK[SC_key(x.mega)].img}" alt=""><span>${esc(x.mega)}</span></button></div>`:''}
   <h3 class="h">Who uses it on the ladder ${us.length?`(${us.length})`:''} <small style="font-weight:400;color:var(--muted)">· % of that Pokémon's sets</small></h3>
   ${us.length?`<div class="lgrid">${us.map(([k,pc])=>`<button class="lr" data-k="${k}"><img src="${BYK[k].img}" alt="" loading="lazy"><span>${esc(BYK[k].n)}</span><small>${pc}%</small></button>`).join('')}</div>`:'<p class="note">Not in the top 3 items of any ladder Pokémon.</p>'}
   </div>`;
  $('#modal').classList.remove('hide');$('#mClose').focus();$('#modalBox').scrollTop=0;
}
function SC_key(name){return name.toLowerCase().replace(/[^a-z0-9]/g,'')}

/* ---------- TEAMS TAB ---------- */
let TDEL='',TREN='';
function renderTeams(){
  if(TEDIT){renderBuilder();return}
  $('#tTools').classList.remove('hide');
  const T=teamsLoad(),aid=teamActiveId();
  $('#tCount').textContent=T.length?`${T.length} team${T.length>1?'s':''} saved on this device`:'';
  $('#tList').innerHTML=T.length?[...T].sort((a,b)=>(b.up||0)-(a.up||0)).map(tm=>{
    const slots=tm.sets.map(o=>{const p=BYK[o.k];if(!p)return '';const it=ITBY[o.item];
      return `<div class="tslot"><div class="tsh"><img src="${p.img}" alt=""><div><b>${esc(p.n)}</b>${it?`<span class="tit"><img src="${it.img}" alt="">${esc(it.n)}</span>`:''}</div></div>
       <div class="tsm">${o.ab?`<span class="tab">${esc(o.ab)}</span>`:''}${o.nat?`<span>${esc(o.nat)}</span>`:''}${o.sp?`<span class="mono">${o.sp.join('/')}</span>`:''}</div>
       <div class="tmv">${(o.mv||[]).map(m=>{const d=MV.find(x=>x.n===m);return `<span style="--c:${d?TCOL[d.t]:'var(--line)'}">${esc(m)}</span>`}).join('')}</div></div>`}).join('');
    return `<div class="card tcard${tm.id===aid?' act':''}" data-tid="${tm.id}">
      <div class="thead">${TREN===tm.id?`<input type="text" class="tname" value="${esc(tm.name)}" data-tren="${tm.id}" maxlength="40">`:`<h3>${esc(tm.name)}</h3>`}${tm.id===aid?'<span class="cp" style="--c:var(--accent)">In calc</span>':''}
       <div class="tsp">${tm.sets.map(o=>BYK[o.k]?`<img src="${BYK[o.k].img}" alt="${esc(BYK[o.k].n)}" title="${esc(BYK[o.k].n)}">`:'').join('')}</div></div>
      <div class="tslots">${slots||'<p class="note">Empty team.</p>'}</div>
      <div class="cbtns"><button class="btn primary" data-tedit="${tm.id}">Edit</button><button class="btn" data-tuse="${tm.id}">Use in calc</button><button class="btn" data-texp="${tm.id}">Export</button>${TREN===tm.id?`<button class="btn" data-tok="${tm.id}">Save name</button>`:`<button class="btn" data-tren2="${tm.id}">Rename</button>`}<button class="btn" data-tdup="${tm.id}">Duplicate</button><button class="btn${TDEL===tm.id?' danger':''}" data-tdel="${tm.id}">${TDEL===tm.id?'Tap again to delete':'Delete'}</button></div>
    </div>`}).join(''):'<div class="card note" style="padding:16px">No teams yet. Tap <b>Import team(s)</b> and paste a team from the Showdown teambuilder (Import/Export). A full Showdown backup imports every team with its name.</div>';
  if(TREN){const inp=$(`[data-tren="${TREN}"]`);if(inp){inp.focus();inp.select()}}
}
function openTeamImport(){
  LASTCARD=null;$('#modalBox').style.setProperty('--tc','var(--accent)');
  $('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="mbody" style="padding-top:18px"><h2 style="margin:0 0 6px">Import team(s)</h2>
   <p class="note" style="margin:0 0 10px">Paste a team from the Showdown teambuilder (Import/Export button). A full backup with <code>=== [format] Name ===</code> lines imports every team with its name. Up to 6 Pokémon per team.</p>
   <div class="field" style="margin-bottom:8px"><label for="tiName">Team name (single team)</label><input type="text" id="tiName" placeholder="e.g. Sun with Mega Charizard Y" maxlength="40"></div>
   <textarea id="tiTxt" rows="12" spellcheck="false" style="width:100%;font-family:var(--mono);font-size:13px;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px"></textarea>
   <div class="cbtns" style="margin-top:10px"><button class="btn primary" id="tiGo">Save</button></div><p class="note" id="tiMsg" style="margin-top:8px"></p></div>`;
  $('#modal').classList.remove('hide');$('#tiTxt').focus();
  $('#tiGo').addEventListener('click',()=>{
    const parts=splitTeams($('#tiTxt').value);let n=0,bad=[];
    parts.forEach((pt,ix)=>{const r=parsePaste(pt.txt);bad=bad.concat(r.bad);if(r.sets.length){teamAdd(pt.name||(parts.length===1?$('#tiName').value.trim():'')||'',r.sets);n++}});
    if(!n){$('#tiMsg').textContent='Nothing recognised.'+(bad.length?' Unknown: '+bad.join(', '):'');return}
    renderTeams();if(DONE.calc&&SC)renderPick();
    if(bad.length)$('#tiMsg').textContent=`Saved ${n} team${n>1?'s':''}. Not recognised (skipped): ${bad.join(', ')}.`;else $('#modal').classList.add('hide');
  });
}
function openTextModal(title,txt,note){
  LASTCARD=null;$('#modalBox').innerHTML=`<button class="btn x" id="mClose">Close</button>
   <div class="mbody" style="padding-top:18px"><h2 style="margin:0 0 6px">${esc(title)}</h2><p class="note" style="margin:0 0 10px">${note}</p>
   <textarea id="expTxt" rows="14" readonly style="width:100%;font-family:var(--mono);font-size:13px;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px">${esc(txt)}</textarea>
   <div class="cbtns" style="margin-top:10px"><button class="btn primary" id="expCopy">Copy</button></div><p class="note" id="expMsg"></p></div>`;
  $('#modal').classList.remove('hide');
  $('#expCopy').addEventListener('click',()=>{const ta=$('#expTxt');ta.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}
    const done=m=>{$('#expMsg').textContent=m};if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>done('Copied.')).catch(()=>done(ok?'Copied.':'Select the text and copy it by hand.'));else done(ok?'Copied.':'Select the text and copy it by hand.')});
}
$('#tImp').addEventListener('click',openTeamImport);
$('#tExpAll').addEventListener('click',()=>{const T=teamsLoad();if(!T.length)return;openTextModal('Backup of all teams',T.map(tm=>`=== [gen9championsvgc2026regmc] ${tm.name} ===\n\n${teamText(tm)}`).join('\n\n\n'),'Showdown backup format. Paste it into the Showdown teambuilder (Backup/Restore) or into Import team(s) on another device.')});
$('#tList').addEventListener('click',e=>{
  if(TEDIT)return;
  const b=e.target.closest('button');if(!b)return;const T=teamsLoad();if(b.dataset.tedit){TEDIT=b.dataset.tedit;TOPEN=0;renderTeams();window.scrollTo(0,0);return}
  const id=b.dataset.tuse||b.dataset.texp||b.dataset.tren2||b.dataset.tok||b.dataset.tdup||b.dataset.tdel;const tm=T.find(x=>x.id===id);if(!tm)return;
  if(b.dataset.tuse){teamSetActive(id);if(DONE.calc&&SC){const o=tm.sets[0];showTab('calc');renderPick()}else showTab('calc');return}
  if(b.dataset.texp){openTextModal(tm.name,teamText(tm),'Showdown format. Paste it into the Showdown teambuilder (Import from text).');return}
  if(b.dataset.tren2){TREN=id;TDEL='';renderTeams();return}
  if(b.dataset.tok){const v=($(`[data-tren="${id}"]`)||{}).value;if(v&&v.trim()){tm.name=v.trim();tm.up=Date.now();teamsSave(T)}TREN='';renderTeams();if(DONE.calc&&SC)renderPick();return}
  if(b.dataset.tdup){teamAdd(tm.name+' (copy)',JSON.parse(JSON.stringify(tm.sets)));renderTeams();if(DONE.calc&&SC)renderPick();return}
  if(b.dataset.tdel){if(TDEL!==id){TDEL=id;renderTeams();return}const N=T.filter(x=>x.id!==id);teamsSave(N);TDEL='';if(teamActiveId()===id&&N[0])teamSetActive(N[0].id);renderTeams();if(DONE.calc&&SC)renderPick();return}
});
$('#tList').addEventListener('keydown',e=>{const t=e.target.closest('[data-tren]');if(t&&e.key==='Enter'){e.preventDefault();$(`[data-tok="${t.dataset.tren}"]`).click()}});

/* ---------- TEAM BUILDER ---------- */
let TEDIT='',TOPEN=0;
function tLearn(p){const ids=(window.LEARN||{})[baseKeyOf(p)];return (ids&&ids.length?ids.map(i=>MV[i]).filter(Boolean):MV.slice()).sort((a,b)=>a.n.localeCompare(b.n))}
function defaultSet(k){
  const p=BYK[k],set=(window.SETS||{})[k]||(window.SETS||{})[baseKeyOf(p)],cs=CSETS[k];
  const ab=set&&set.a&&set.a.length&&p.a.includes(set.a[0][0])?set.a[0][0]:p.a[0];
  const L=tLearn(p),ln=new Set(L.map(m=>m.n));
  let mv=set&&set.m?set.m.map(x=>x[0]).filter(n=>ln.has(n)).slice(0,4):[];
  if(mv.length<4){const phys=p.b[1]>=p.b[3];const sc=m=>m.p*(p.t.includes(m.t)?1.5:1)*((m.c==='P')===phys?1:.55);L.filter(m=>m.c!=='T'&&m.p>0).sort((a,b)=>sc(b)-sc(a)).forEach(m=>{if(mv.length<4&&!mv.includes(m.n))mv.push(m.n)})}
  const phys=p.b[1]>=p.b[3];
  const nat=cs&&cs.s[0]?cs.s[0][0]:(phys?'Adamant':'Modest'),sp=cs&&cs.s[0]?cs.s[0][1].slice():(phys?[2,32,0,0,0,32]:[2,0,0,32,0,32]);
  const item=p.m&&p.i?p.i:(cs&&cs.i[0]?cs.i[0][0]:'');
  return {k,item,ab,nat,sp,mv,lad:!!cs};
}
function tbGet(){const T=teamsLoad();return {T,tm:T.find(x=>x.id===TEDIT)}}
function tbSave(T,tm){tm.up=Date.now();teamsSave(T)}
function natMul(nat,j){const n=NATS.find(z=>z[0]===nat);if(!n||!n[1]||!j)return 1;return SL(n[1])===STATS[j]?1.1:SL(n[2])===STATS[j]?.9:1}
function slotHTML(o,j,open){
  const p=BYK[o.k],it=ITBY[o.item];
  const head=`<div class="tbh" data-topen="${j}"><img src="${p.img}" alt=""><div class="tbn"><b>${esc(p.n)}</b><span>${it?`<img src="${it.img}" alt="">${esc(it.n)}`:'No item'} · ${esc(o.ab||'')}</span></div>
    <div class="tbact"><button type="button" class="gchip" data-tup="${j}" aria-label="Move up"${j?'':' disabled'}>▲</button><button type="button" class="gchip" data-tdn="${j}" aria-label="Move down">▼</button><button type="button" class="gchip" data-trm="${j}" aria-label="Remove">✕</button></div></div>`;
  if(!open)return `<div class="tbslot">${head}<div class="tbmini">${(o.mv||[]).filter(Boolean).map(m=>{const d=MV.find(x=>x.n===m);return `<span style="--c:${d?TCOL[d.t]:'var(--line)'}">${esc(m)}</span>`}).join('')}</div></div>`;
  const fs=formsOf(p),L=tLearn(p),tot=o.sp.reduce((a,b)=>a+b,0);
  const mvOpts=cur=>copt('','(none)',!cur)+(cur&&!L.some(m=>m.n===cur)?copt(cur,cur,true):'')+L.map(m=>copt(m.n,m.n,m.n===cur)).join('');
  return `<div class="tbslot open">${head}<div class="tbbody">
    <div class="cps"><input type="text" class="tbq" value="${esc(p.n)}" aria-label="Pokémon" autocomplete="off" spellcheck="false"><div class="cpsug hide"></div></div>
    ${fs.length>1?`<div class="ftabs cforms">${fs.map(f=>`<button type="button" class="${f.m?'mg':'bs'}" data-tform="${f.k}" aria-pressed="${f.k===o.k}">${f.m?'✦ ':''}${megaLbl(f)}</button>`).join('')}</div>`:''}
    <div class="cbtns" style="margin:4px 0 10px"><button type="button" class="gchip" data-tlad="1">${CSETS[o.k]?'Load ladder set':'Load generic set'}</button><button type="button" class="gchip" data-tcalc="${j}">Open in calc</button></div>
    <div class="tbg">
     <div class="cf"><label>Ability</label><select data-tf="ab">${p.a.map(a=>copt(a,a+(ESN('a',a)&&ESN('a',a)!==a?' · '+ESN('a',a):''),a===o.ab)).join('')}</select></div>
     <div class="cf"><label>Item</label><div class="citem"><img src="${it?it.img:''}" alt=""${it?'':' style="visibility:hidden"'} data-timg><select data-tf="item">${itemOptions(o,p)}</select></div></div>
     <div class="cf"><label>Nature</label><select data-tf="nat">${NATS.map(n=>copt(n[0],NATL(n[0])+(ESN('n',n[0])?' · '+ESN('n',n[0]):''),n[0]===o.nat)).join('')}</select></div>
    </div>
    <table class="cst"><thead><tr><th></th><th>Base</th><th>SP</th><th>Stat</th></tr></thead><tbody>
     ${STATS.map((t,k)=>`<tr><th style="color:${STATCOL[k]}">${t}</th><td>${p.b[k]}</td><td><input type="number" inputmode="numeric" min="0" max="32" data-tsp="${k}" value="${o.sp[k]}"></td><td class="cfin${natMul(o.nat,k)>1?' up':natMul(o.nat,k)<1?' dn':''}" data-tfin="${k}">${stat50(p,k,o.sp[k],natMul(o.nat,k))}</td></tr>`).join('')}
    </tbody></table>
    <div class="csptot${tot>66?' bad':''}" data-ttot>SP used: ${tot} / 66${tot>66?' — over the limit':''}</div>
    <div class="cq"><span>Quick SP</span>${QSP.map(([l],q)=>`<button type="button" class="gchip" data-tqsp="${q}">${l}</button>`).join('')}</div>
    <div class="tbmv">${[0,1,2,3].map(m=>{const cur=(o.mv||[])[m]||'';const d=MV.find(x=>x.n===cur);return `<div class="cmv"><select data-tmv="${m}">${mvOpts(cur)}</select>${d?`<span class="tp" style="background:${TCOL[d.t]}">${d.t}</span><small>${d.c==='T'?'Status':(d.c==='P'?'Phys':'Spec')} ${d.p||''}</small>`:''}</div>`}).join('')}</div>
  </div></div>`;
}
function renderBuilder(){
  const {tm}=tbGet();if(!tm){TEDIT='';renderTeams();return}
  $('#tTools').classList.add('hide');$('#tCount').textContent='';
  if(TOPEN>=tm.sets.length)TOPEN=tm.sets.length-1;
  $('#tList').innerHTML=`<div class="card tbuild">
    <div class="tbtop"><button type="button" class="btn" data-tdone="1">← Done</button><input type="text" class="tname" data-tbname value="${esc(tm.name)}" maxlength="40" aria-label="Team name"><span class="note">${tm.sets.length}/6 · saved automatically</span></div>
    <div class="tbsp">${tm.sets.map((o,j)=>BYK[o.k]?`<button type="button" class="cpk${j===TOPEN?' on':''}" data-topen="${j}" title="${esc(BYK[o.k].n)}"><img src="${BYK[o.k].img}" alt="${esc(BYK[o.k].n)}"></button>`:'').join('')}</div>
    ${tm.sets.map((o,j)=>BYK[o.k]?slotHTML(o,j,j===TOPEN):'').join('')}
    ${tm.sets.length<6?`<div class="tbadd"><div class="cps"><input type="text" class="tbq" data-tadd="1" placeholder="+ Add a Pokémon (search)" autocomplete="off" spellcheck="false"><div class="cpsug hide"></div></div><p class="note" style="margin:6px 0 0">New Pokémon start with their most used ladder set. Change anything.</p></div>`:''}
    <div class="cbtns" style="margin-top:12px"><button type="button" class="btn primary" data-tdone="1">Done</button><button type="button" class="btn" data-tbuse="1">Use in calc</button><button type="button" class="btn" data-tbexp="1">Export</button></div>
  </div>`;
}
function tbShowSug(inp){
  const box=inp.nextElementSibling,L=sugFor(inp.dataset.typed?inp.value:'');
  box.innerHTML=L.map(p=>`<button type="button" data-tpk="${p.k}"><img src="${p.img}" alt="" loading="lazy">${esc(p.n)}${uOf(p)>=.1?`<small>${fmtU(uOf(p))}</small>`:''}</button>`).join('')||'<p class="note" style="padding:8px">No match.</p>';
  box.classList.remove('hide');
}
(function(){
  const root=$('#tList');
  root.addEventListener('focusin',e=>{const q=e.target.closest('.tbq');if(q&&TEDIT){q.dataset.typed='';if(!q.dataset.tadd)q.select();tbShowSug(q)}});
  root.addEventListener('mousedown',e=>{if(e.target.closest('.cpsug'))e.preventDefault()});
  root.addEventListener('focusout',e=>{const q=e.target.closest('.tbq');if(q)setTimeout(()=>{const b=q.nextElementSibling;if(b)b.classList.add('hide')},150)});
  root.addEventListener('keydown',e=>{const q=e.target.closest('.tbq');if(q&&e.key==='Enter'){e.preventDefault();const f=q.nextElementSibling.querySelector('[data-tpk]');if(f)f.click()}});
  root.addEventListener('input',e=>{
    if(!TEDIT)return;const t=e.target;
    if(t.classList.contains('tbq')){t.dataset.typed='1';tbShowSug(t);return}
    if(t.dataset.tbname!==undefined){const {T,tm}=tbGet();tm.name=t.value.trim()||tm.name;tbSave(T,tm);return}
    if(t.dataset.tsp!==undefined){const {T,tm}=tbGet(),o=tm.sets[TOPEN],k=+t.dataset.tsp;let v=parseInt(t.value,10);if(isNaN(v))v=0;o.sp[k]=Math.max(0,Math.min(32,v));tbSave(T,tm);
      const p=BYK[o.k],tot=o.sp.reduce((a,b)=>a+b,0),sl=t.closest('.tbslot');sl.querySelector(`[data-tfin="${k}"]`).textContent=stat50(p,k,o.sp[k],natMul(o.nat,k));const el=sl.querySelector('[data-ttot]');el.textContent=`SP used: ${tot} / 66`+(tot>66?' — over the limit':'');el.classList.toggle('bad',tot>66);return}
  });
  root.addEventListener('change',e=>{
    if(!TEDIT)return;const t=e.target;const {T,tm}=tbGet();if(!tm)return;const o=tm.sets[TOPEN];
    if(t.dataset.tsp!==undefined){t.value=o.sp[+t.dataset.tsp];return}
    if(t.dataset.tf){o[t.dataset.tf]=t.value;tbSave(T,tm);renderBuilder();return}
    if(t.dataset.tmv!==undefined){o.mv=o.mv||[];o.mv[+t.dataset.tmv]=t.value;o.mv=[0,1,2,3].map(m=>o.mv[m]||'');tbSave(T,tm);renderBuilder();return}
  });
  root.addEventListener('click',e=>{
    if(!TEDIT)return;const {T,tm}=tbGet();if(!tm)return;
    const pk=e.target.closest('[data-tpk]');
    if(pk){const inp=pk.closest('.cps').querySelector('.tbq');const ns=defaultSet(pk.dataset.tpk);delete ns.lad;
      if(inp.dataset.tadd){if(tm.sets.length<6){tm.sets.push(ns);TOPEN=tm.sets.length-1}}else tm.sets[TOPEN]=ns;
      tbSave(T,tm);renderBuilder();return}
    const fm=e.target.closest('[data-tform]');if(fm){const ns=defaultSet(fm.dataset.tform);delete ns.lad;tm.sets[TOPEN]=ns;tbSave(T,tm);renderBuilder();return}
    const op=e.target.closest('[data-topen]');if(op&&!e.target.closest('.tbact')){const j=+op.dataset.topen;TOPEN=TOPEN===j&&op.classList.contains('tbh')?-1:j;renderBuilder();return}
    const up=e.target.closest('[data-tup]');if(up){const j=+up.dataset.tup;if(j>0){[tm.sets[j-1],tm.sets[j]]=[tm.sets[j],tm.sets[j-1]];if(TOPEN===j)TOPEN=j-1;tbSave(T,tm);renderBuilder()}return}
    const dn=e.target.closest('[data-tdn]');if(dn){const j=+dn.dataset.tdn;if(j<tm.sets.length-1){[tm.sets[j+1],tm.sets[j]]=[tm.sets[j],tm.sets[j+1]];if(TOPEN===j)TOPEN=j+1;tbSave(T,tm);renderBuilder()}return}
    const rm=e.target.closest('[data-trm]');if(rm){const j=+rm.dataset.trm;if(rm.dataset.sure!=='1'){rm.dataset.sure='1';rm.textContent='Remove?';rm.classList.add('danger');setTimeout(()=>{if(rm.isConnected){rm.dataset.sure='';rm.textContent='✕';rm.classList.remove('danger')}},2500);return}tm.sets.splice(j,1);if(TOPEN>=j)TOPEN=Math.max(0,TOPEN-1);tbSave(T,tm);renderBuilder();return}
    if(e.target.closest('[data-tlad]')){const o=tm.sets[TOPEN],ns=defaultSet(o.k);delete ns.lad;tm.sets[TOPEN]=ns;tbSave(T,tm);renderBuilder();return}
    const qs=e.target.closest('[data-tqsp]');if(qs){tm.sets[TOPEN].sp=QSP[+qs.dataset.tqsp][1].slice();tbSave(T,tm);renderBuilder();return}
    const tc=e.target.closest('[data-tcalc]');if(tc){const o=tm.sets[+tc.dataset.tcalc];teamSetActive(tm.id);TEDIT='';renderTeams();window.__calcSet=o;showTab('calc');if(DONE.calc&&SC){applySet(0,o);CSEL=[0,0];renderCalcAll();renderPick();window.__calcSet=null}return}
    if(e.target.closest('[data-tbuse]')){teamSetActive(tm.id);TEDIT='';renderTeams();showTab('calc');if(DONE.calc&&SC)renderPick();return}
    if(e.target.closest('[data-tbexp]')){openTextModal(tm.name,teamText(tm),'Showdown format. Paste it into the Showdown teambuilder (Import from text).');return}
    if(e.target.closest('[data-tdone]')){if(!tm.sets.length){teamsSave(T.filter(x=>x.id!==tm.id))}TEDIT='';renderTeams();if(DONE.calc&&SC)renderPick();return}
  });
})();
$('#tNew').addEventListener('click',()=>{const T=teamsLoad();const id=teamAdd('Team '+(T.length+1),[]);TEDIT=id;TOPEN=0;renderTeams();setTimeout(()=>{const a=$('[data-tadd]');if(a)a.focus()},50)});

/* ---------- WEATHER & TERRAIN GUIDE (Abilities tab) ---------- */
const FIELDG=[
 ['Weather','Sun','Sol','#e2571f','Fire moves ×1.5, Water moves ×0.5. Solar Beam needs no charge. Boosts Chlorophyll (Speed ×2) and Solar Power. Lasts 5 turns, 8 with Heat Rock.','Movimientos Fuego ×1,5 y Agua ×0,5. Rayo Solar no necesita cargar. Activa Clorofila (Velocidad ×2) y Poder Solar. Dura 5 turnos, 8 con Roca Calor.','Drought, Sunny Day'],
 ['Weather','Rain','Lluvia','#3f7fe0','Water moves ×1.5, Fire moves ×0.5. Thunder and Hurricane never miss. Boosts Swift Swim (Speed ×2). Lasts 5 turns, 8 with Damp Rock.','Movimientos Agua ×1,5 y Fuego ×0,5. Trueno y Vendaval no fallan. Activa Nado Rápido (Velocidad ×2). Dura 5 turnos, 8 con Roca Lluvia.','Drizzle, Rain Dance'],
 ['Weather','Sand','Arena','#b8913f','Rock types get Sp. Def ×1.5. Non Rock/Ground/Steel lose 1/16 HP each turn. Boosts Sand Rush (Speed ×2). Lasts 5 turns, 8 with Smooth Rock.','El tipo Roca tiene Def. Esp. ×1,5. Los que no son Roca, Tierra o Acero pierden 1/16 de PS por turno. Activa Ímpetu Arena (Velocidad ×2). Dura 5 turnos, 8 con Roca Suave.','Sand Stream, Sandstorm'],
 ['Weather','Snow','Nieve','#4fb5b8','Ice types get Defense ×1.5. Blizzard never misses. Aurora Veil can be used. Boosts Slush Rush (Speed ×2). Lasts 5 turns, 8 with Icy Rock.','El tipo Hielo tiene Defensa ×1,5. Ventisca no falla. Permite usar Velo Aurora. Activa Quitanieves (Velocidad ×2). Dura 5 turnos, 8 con Roca Helada.','Snow Warning, Snowscape'],
 ['Terrain','Electric Terrain','Campo Eléctrico','#d9a406','Grounded Pokémon: Electric moves ×1.3 and they cannot fall asleep. Boosts Surge Surfer (Speed ×2). Lasts 5 turns, 8 with Terrain Extender.','Pokémon en el suelo: movimientos Eléctrico ×1,3 y no pueden dormirse. Activa Surcavientos (Velocidad ×2). Dura 5 turnos, 8 con Cubresuelos.','Electric Surge, Electric Terrain'],
 ['Terrain','Grassy Terrain','Campo de Hierba','#4aa33a','Grounded Pokémon: Grass moves ×1.3 and heal 1/16 HP each turn. Earthquake and Bulldoze do half damage. Grassy Glide gets +1 priority.','Pokémon en el suelo: movimientos Planta ×1,3 y recuperan 1/16 de PS por turno. Terremoto y Terratemblor hacen la mitad. Fitoimpulso gana +1 de prioridad.','Grassy Surge, Grassy Terrain'],
 ['Terrain','Psychic Terrain','Campo Psíquico','#e04f84','Grounded Pokémon: Psychic moves ×1.3 and they are protected from priority moves. Expanding Force hits both foes with more power.','Pokémon en el suelo: movimientos Psíquico ×1,3 y no les afectan los movimientos con prioridad. Vasto Impacto golpea a ambos rivales con más potencia.','Psychic Surge, Psychic Terrain'],
 ['Terrain','Misty Terrain','Campo de Niebla','#e9a0d6','Grounded Pokémon: Dragon moves against them do half damage and they cannot get a status condition or be confused.','Pokémon en el suelo: reciben la mitad de daño de movimientos Dragón y no pueden sufrir problemas de estado ni confusión.','Misty Surge, Misty Terrain'],
 ['Room','Trick Room','Espacio Raro','#9a3fa5','For 5 turns, slower Pokémon move first within the same priority.','Durante 5 turnos, los Pokémon más lentos se mueven primero dentro de la misma prioridad.','Trick Room'],
 ['Room','Tailwind','Viento Afín','#7d8fe0','Doubles the Speed of your side for 4 turns (the turn it is used counts).','Duplica la Velocidad de tu lado durante 4 turnos (cuenta el turno en que se usa).','Tailwind'],
 ['Room','Gravity','Gravedad','#6b6f8a','For 5 turns, every Pokémon is grounded (Ground moves hit Flying types and Levitate) and accuracy is ×5/3.','Durante 5 turnos, todos tocan el suelo (Tierra afecta a Volador y Levitación) y la precisión es ×5/3.','Gravity'],
];
function fieldGuideHTML(){
  const g=t=>FIELDG.filter(x=>x[0]===t).map(([_,n,es,col,en,esd,src])=>`<div class="fgi" style="--c:${col}"><h4>${esc(n)}<span class="es">${esc(es)}</span></h4><p>${DL==='es'?esc(esd):DL==='en'?esc(en):`<span class="en">${esc(en)}</span><span class="esd">${esc(esd)}</span>`}</p><small>${esc(src)}</small></div>`).join('');
  return `<details class="card fguide"><summary><b>Weather, terrain and field effects</b> <span class="note">· what each one does</span></summary>
   <h4 class="fgh">Weather</h4><div class="fgg">${g('Weather')}</div><h4 class="fgh">Terrain <small>(only Pokémon touching the ground)</small></h4><div class="fgg">${g('Terrain')}</div><h4 class="fgh">Speed and field</h4><div class="fgg">${g('Room')}</div></details>`;
}
function renderFieldGuide(){
  let el=$('#fGuide');
  if(!el){el=document.createElement('div');el.id='fGuide';const t=$('#tab-abilities .toolbar');t.parentNode.insertBefore(el,t)}
  const open=el.querySelector('details')&&el.querySelector('details').open;
  el.innerHTML=fieldGuideHTML();if(open)el.querySelector('details').open=true;
}
renderFieldGuide();
document.addEventListener('click',e=>{if(e.target.closest('[data-dl]'))renderFieldGuide()});

/* late init if the page opened directly on these tabs */
if(!$('#tab-calc').classList.contains('hide')){DONE.calc=0;ensure('calc')}
if(!$('#tab-items').classList.contains('hide')){DONE.items=0;ensure('items')}
if(!$('#tab-teams').classList.contains('hide')){DONE.teams=0;ensure('teams')}
