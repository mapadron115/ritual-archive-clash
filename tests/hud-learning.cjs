// First-ten-second HUD audit and readiness transitions. Scripted, never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8').split('// ---------- boot')[0]).join('\n');
Function('assert','addEventListener','window','document',source+'\n'+`
let checks=0,casts=0,domains=0;
function inspect(S,mode) {
  G.mode=mode;const before=JSON.stringify(S),effects=JSON.stringify(FX),texts=[],paint=pxText;
  pxText=function(s,text,x,y,col,scale=1){texts.push({text:String(text).toUpperCase(),x,y,w:pxTextWidth(text,scale),h:7*scale});return paint(s,text,x,y,col,scale);};
  let hud;try{hud=pxHUDSurface(S,labels());}finally{pxText=paint;}
  assert.equal(JSON.stringify(S),before,'HUD changed simulation');assert.equal(JSON.stringify(FX),effects,'HUD changed FX');
  for(let i=3;i<hud.data.length;i+=4)assert(hud.data[i]===0||hud.data[i]===255,'soft HUD alpha');
  const cards=[];
  for(let slot=0;slot<2;slot++)for(let n=0;n<4;n++) {
    const x=(slot?331:14)+n*72,w=n===3?83:67;
    const ink=texts.filter(t=>t.y>=319&&t.x>=x&&t.x<x+w);
    assert(ink.length>=3,'missing card content');
    for(const t of ink)assert(t.x>=x+3&&t.x+t.w<=x+w-3&&t.y>=322&&t.y+t.h<=356,'card text escaped bounds: '+t.text);
    for(let a=0;a<ink.length;a++)for(let b=a+1;b<ink.length;b++) {
      const p=ink[a],q=ink[b];assert(p.x+p.w<=q.x||q.x+q.w<=p.x||p.y+p.h<=q.y||q.y+q.h<=p.y,'card text overlap: '+p.text+' / '+q.text);
    }
    cards.push(ink.map(t=>t.text));
  }
  for(let slot=0;slot<2;slot++) {
    assert(texts.some(t=>t.text==='CE '+Math.floor(S.f[slot].ce)+'/100'));
    const lab=labels()[slot];
    if(lab)assert(texts.some(t=>t.text.includes('PUNCH '+lab.P)&&t.text.includes('KICK '+lab.K)&&t.w<=299),'missing complete basic actions');
  }
  checks++;return cards;
}
// Exact thresholds and longest footer strings for every build, slot, mode and snapshot.
for(let ch=0;ch<15;ch++)for(const mode of ['ai','local','watch','host','guest'])for(let owner=0;owner<2;owner++) {
  const S=newMatch(ch,ch,1000);S.phase='fight';S.t=100;const f=S.f[owner];
  const initial=inspect(S,mode)[owner*4+3];assert(initial.includes('OR 30% HP'));
  f.gauge=99.999;let card=inspect(S,mode)[owner*4+3];assert(card.includes((CH[ch].dom.maximum?'MAXIMUM':'DOMAIN')+' 99%'));assert(!domReady(f));
  f.gauge=GAUGE_MAX;card=inspect(S,mode)[owner*4+3];assert(card.includes('FULL READY'));assert(domReady(f));
  f.gauge=0;f.hp=maxHp(f)*DOM_HP+.001;assert(!domReady(f));assert(inspect(S,mode)[owner*4+3].includes('OR 30% HP'));
  f.hp=maxHp(f)*DOM_HP;assert(domReady(f));assert(inspect(S,mode)[owner*4+3].includes('HP READY'));
  f.domUsed=1;f.gauge=100;assert(!domReady(f));assert(inspect(S,mode)[owner*4+3].includes('USED 1/1'));
  f.ce=0;f.cd=[0,0,0];const low=inspect(S,mode);
  for(let n=0;n<3;n++)assert(low[owner*4+n].includes('NEED '+CH[ch].arts[n].cost+' CE'));
  f.ce=100;f.cd=CH[ch].arts.map(a=>a.cd);inspect(S,mode);
  f.cd=[1,1,1];const last=inspect(S,mode);for(let n=0;n<3;n++)assert(last[owner*4+n].includes('WAIT 0.1S'));
  const snap=JSON.parse(JSON.stringify(S));assert.deepEqual(inspect(S,mode),inspect(snap,mode));
}
// Real art presses and active cooldown expiry, not a duplicate timing implementation.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(let n=0;n<3;n++) {
  const S=newMatch(ch,(ch+1)%15,1000);S.phase='fight';S.t=100;const f=S.f[owner],o=S.f[1-owner];
  // Both slots use this build; seed the existing setup requirements, without changing rules.
  f.ch=ch;f.hp=f.ghost=maxHp(f);f.ce=100;f.hist=Array.from({length:10},()=>[f.x,f.y]);o.nails=3;o.gum=120;o.hurtT=S.t;
  const a=CH[ch].arts[n],input=[0,0];input[owner]=BTN['A'+(n+1)]<<INPUT_SHIFT;
  step(S,input);assert(f.cd[n]>0,'actual art did not begin: '+a.name);assert.equal(f.ce,100-a.cost);
  assert(inspect(S,'local')[owner*4+n].some(t=>t.startsWith('WAIT ')));
  let ticks=0;while(f.cd[n]>1){S.ev=[];step(S,[0,0]);assert(++ticks<5000,'cooldown stalled');}
  assert(inspect(S,'local')[owner*4+n].includes('WAIT 0.1S'));step(S,[0,0]);
  assert.equal(f.cd[n],0);
  const expired=inspect(S,'local')[owner*4+n];assert(!expired.some(t=>t.startsWith('WAIT ')),'expired cooldown still shown');
  // Consumed/expired setup must no longer advertise CE READY merely because its
  // cooldown finished. Dedicated real setup transitions are in hud-eligibility.
  if(a.id==='hairpin')assert(expired.includes('NEED NAIL'));
  else if(a.id==='resonance')assert(expired.includes(o.nails>0?'CE READY':'HIT FIRST'));
  else if(a.id==='contract'||a.id==='slingshot')assert(expired.includes('NEED GUM'));
  else assert(expired.includes('CE READY'));casts++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const low of [false,true]) {
  const S=newMatch(ch,ch,1000);S.phase='fight';const f=S.f[owner];
  if(low)f.hp=maxHp(f)*DOM_HP;else f.gauge=100;
  assert(inspect(S,'local')[owner*4+3].includes(low?'HP READY':'FULL READY'));
  assert(startDomain(S,f,S.f[1-owner]));assert(inspect(S,'local')[owner*4+3].includes('USED 1/1'));
  newRound(S);assert.equal(S.f[owner].domUsed,0);assert(inspect(S,'local')[owner*4+3].includes('OR 30% HP'));domains++;
}
const scenes=[
  ['OPENING / SOLO KEYS','ai',0,0],
  ['AFTER AN ART / COOLDOWN','ai',0,1],
  ['LOW CE / ALL ARTS','local',7,2],
  ['FULL GAUGE / DOMAIN','guest',0,3],
  ['LOW HP / MAXIMUM','host',14,4],
  ['USED THIS ROUND / WATCH','watch',14,5]
];
globalThis.audit=new PixelSurface(1280,1128);audit.rect(0,0,audit.w,audit.h,PX_INK);
for(let n=0;n<scenes.length;n++) {
  const [title,mode,ch,kind]=scenes[n],S=newMatch(ch,ch,1000);G.mode=mode;
  S.phase='fight';S.t=100;S.stage=['courtyard','gallery','observatory'][n%3];
  if(kind===1) {step(S,[BTN.A1<<INPUT_SHIFT,0]);assert(S.f[0].cd[0]>0);}
  if(kind===2)S.f.forEach(f=>f.ce=0);
  if(kind===3)S.f.forEach(f=>f.gauge=100);
  if(kind===4)S.f.forEach(f=>f.hp=maxHp(f)*DOM_HP);
  if(kind===5)S.f.forEach(f=>{f.gauge=100;assert(startDomain(S,f,S.f[1-f.i]));});
  const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
  const frame=pxWorldSurface(S,neutral);frame.blit(pxHUDSurface(S,labels(),neutral),0,0);
  const x=n%2*640,y=Math.floor(n/2)*376;pxText(audit,title,x+8,y+4,PX_LIGHT);audit.blit(frame,x,y+16);
}
console.log('PASS',checks,'read-only HUD layout/alpha/snapshot states across all builds/slots/five modes;',casts,'actual art inputs/cooldown expiries;',domains,'actual full-gauge/low-health Domain uses and round resets; six composite fixtures');
`)(assert,()=>{},{},{getElementById(){return {getContext(){return {};}};}});
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'preview-hud-audit.png'),globalThis.audit);
