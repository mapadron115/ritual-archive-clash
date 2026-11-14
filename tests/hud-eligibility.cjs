// Existing setup/cost exceptions through real inputs; raster scripting, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),baseline=process.argv.includes('--baseline');
const output=process.argv[2]?.startsWith('--')?null:process.argv[2],prefix=process.argv[3]||'v60';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'].map(n=>
  (baseline&&n==='pixel-hud'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-hud.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).split('// ---------- boot')[0]).join('\n');
Function('assert','writePNG','output','prefix','baseline','addEventListener','window','document',source+'\n'+`
let layouts=0,ticks=0,timelines=0,states=0;const previews=[];
function fresh(id,owner) {
  const ch=CH.findIndex(c=>c.arts.some(a=>a.id===id)),S=newMatch(ch,ch,451);S.phase='fight';
  S.f[owner].ce=100;S.f[owner].x=owner?850:430;S.f[1-owner].x=owner?570:710;return S;
}
function card(S,owner,n) {
  const before=JSON.stringify(S),effects=JSON.stringify(FX),texts=[],paint=pxText;
  pxText=function(s,text,x,y,col,scale=1){texts.push({text:String(text).toUpperCase(),x,y,w:pxTextWidth(text,scale),h:7*scale});return paint(s,text,x,y,col,scale);};
  let hud;try{hud=pxHUDSurface(S,labels(),{});}finally{pxText=paint;}
  assert.equal(JSON.stringify(S),before,'drawing mutated simulation');assert.equal(JSON.stringify(FX),effects,'drawing mutated FX');
  if(!baseline)assert.deepEqual(pxArtCardState(S,S.f[owner],n),pxArtCardState(JSON.parse(before),JSON.parse(before).f[owner],n),'snapshot eligibility drift');
  for(let i=3;i<hud.data.length;i+=4)assert(hud.data[i]===0||hud.data[i]===255,'soft alpha');
  for(let slot=0;slot<2;slot++)for(let a=0;a<4;a++) {
    const x=(slot?331:14)+a*72,w=a===3?83:67,ink=texts.filter(t=>t.y>=319&&t.x>=x&&t.x<x+w);
    for(const t of ink)assert(t.x>=x+3&&t.x+t.w<=x+w-3&&t.y>=322&&t.y+t.h<=356,'card bounds '+t.text);
    for(let p=0;p<ink.length;p++)for(let q=p+1;q<ink.length;q++) {
      const a=ink[p],b=ink[q];assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'overlapping card text');
    }
  }
  layouts++;const x=(owner?331:14)+n*72;return texts.filter(t=>t.x>=x&&t.x<x+67&&t.y>=319).map(t=>t.text);
}
function expect(S,owner,n,text) {const ink=card(S,owner,n);if(!baseline)assert(ink.includes(text),'expected '+text+', got '+ink);states++;}
function advance(S,B,input=[0,0]) {
  S.ev=[];B.ev=[];step(S,input);step(B,input);assert.equal(JSON.stringify(S),JSON.stringify(B),'HUD changed outcome');
  const before=JSON.stringify(S);if(!baseline)for(let i=0;i<2;i++)for(let n=0;n<3;n++)pxArtCardState(S,S.f[i],n);
  assert.equal(JSON.stringify(S),before);ticks++;
}
function press(S,B,owner,bit) {const input=[0,0];input[owner]=bit<<INPUT_SHIFT;advance(S,B,input);}
function until(S,B,condition,limit=1600) {let t=0;while(!condition()){assert(t++<limit,'timeline stalled');advance(S,B);}}
function capture(S,owner,n,name) {previews.push({S:JSON.parse(JSON.stringify(S)),owner,n,name});}
// Actual setup acquisition, failed presses, consumption and cooldown expiry.
for(const owner of [0,1])for(const id of ['hairpin','resonance','contract','slingshot','rewind']) {
  const S=fresh(id,owner),f=S.f[owner],o=S.f[1-owner],n=CH[f.ch].arts.findIndex(a=>a.id===id),B=JSON.parse(JSON.stringify(S));G.mode='local';
  const missing={hairpin:'NEED NAIL',resonance:'HIT FIRST',contract:'NEED GUM',slingshot:'NEED GUM',rewind:'RECORDING'}[id];
  expect(S,owner,n,missing);capture(S,owner,n,id+'-missing');press(S,B,owner,BTN['A'+(n+1)]);
  assert.equal(f.cd[n],0,'missing setup spent cooldown');assert.equal(f.ce,100,'missing setup spent CE');assert(S.ev.some(e=>e.k==='nope'));
  if(id==='rewind')until(S,B,()=>f.hist.length>6);
  else if(id==='resonance') {
    // Walk into punch range using real movement, then wound the foe.
    const input=[0,0];input[owner]=owner?BTN.L:BTN.R;
    let walk=0;while(Math.abs(o.x-f.x)>=80){assert(walk++<100);advance(S,B,input);}
    press(S,B,owner,BTN.P);until(S,B,()=>o.hurtT>=0);
  } else {
    press(S,B,owner,BTN.A1);until(S,B,()=>id==='hairpin'?o.nails>0:o.gum>0);
  }
  until(S,B,()=>free(f)&&S.hitstop===0);expect(S,owner,n,'CE READY');capture(S,owner,n,id+'-ready');
  press(S,B,owner,BTN['A'+(n+1)]);assert(f.cd[n]>0,'prepared art failed');expect(S,owner,n,'WAIT '+(Math.ceil(f.cd[n]/6)/10).toFixed(1)+'S');
  until(S,B,()=>free(f)&&f.cd[n]===0);
  if(id==='hairpin'||id==='resonance'||id==='contract'||id==='slingshot')expect(S,owner,n,missing);
  if(id==='rewind')expect(S,owner,n,'CE READY');
  timelines++;
}
// A real wound expires at the existing strict four-second boundary; an embedded
// nail remains an alternative. Advancing time here uses the actual step loop.
for(const owner of [0,1]) {
  const S=fresh('resonance',owner),f=S.f[owner],o=S.f[1-owner];f.x=owner?750:530;o.x=owner?680:600;
  const B=JSON.parse(JSON.stringify(S));press(S,B,owner,BTN.P);until(S,B,()=>o.hurtT>=0);
  until(S,B,()=>S.t-o.hurtT===239);expect(S,owner,2,'CE READY');advance(S,B);expect(S,owner,2,'HIT FIRST');
  o.nails=1;B.f[1-owner].nails=1;expect(S,owner,2,'CE READY');timelines++;
}
// Existing HP cost and airborne restrictions, including every air-enabled art,
// checked against real presses rather than changing any eligibility rule.
for(const owner of [0,1]) {
  for(const id of ['redscale','bloodwheel','piercing'])for(const enough of [false,true]) {
    const S=fresh(id,owner),f=S.f[owner],n=CH[f.ch].arts.findIndex(a=>a.id===id),a=CH[f.ch].arts[n];
    f.hp=a.hp+1+(enough?.001:0);const B=JSON.parse(JSON.stringify(S));expect(S,owner,n,enough?'CE READY':'LOW HP');
    if(id==='piercing'&&!enough)capture(S,owner,n,'blood-low-hp');press(S,B,owner,BTN['A'+(n+1)]);
    assert.equal(f.cd[n]>0,enough,'HP boundary command mismatch');timelines++;
  }
  for(const id of ['nail','boogie','blastdash','trick']) {
    const S=fresh(id,owner),f=S.f[owner],n=CH[f.ch].arts.findIndex(a=>a.id===id),a=CH[f.ch].arts[n],B=JSON.parse(JSON.stringify(S));
    press(S,B,owner,BTN.U);expect(S,owner,n,a.air?'CE READY':'LAND FIRST');
    if(id==='nail')capture(S,owner,n,'jump-land-first');press(S,B,owner,BTN['A'+(n+1)]);
    assert.equal(f.cd[n]>0,!!a.air,'air command mismatch');timelines++;
  }
}
// All current builds, modes, slots, HP and air boundary states. The longest
// setup labels still fit the same source-pixel card without removing letters.
for(let ch=0;ch<15;ch++)for(const mode of ['ai','local','watch','host','guest'])for(const owner of [0,1]) {
  const S=newMatch(ch,ch,451),f=S.f[owner];S.phase='fight';G.mode=mode;f.ce=100;
  for(let n=0;n<3;n++)card(S,owner,n);
  f.y=GROUND-1;f.st='jump';
  for(let n=0;n<3;n++) {
    const a=CH[ch].arts[n],setup=ART[a.id+'_can'];
    if(!a.air&&(!setup||setup(S,f,S.f[1-owner])))expect(S,owner,n,'LAND FIRST');else card(S,owner,n);
  }
  f.y=GROUND;f.st='idle';
  for(let n=0;n<3;n++)if(CH[ch].arts[n].hp) {
    const a=CH[ch].arts[n];f.hp=a.hp+1;expect(S,owner,n,'LOW HP');f.hp+=.001;expect(S,owner,n,'CE READY');
  }
}
// Real Garden activation: zero CE does not block its existing free casts.
for(const owner of [0,1]) {
  const S=fresh('dogs',owner),f=S.f[owner];f.ce=0;f.gauge=100;const B=JSON.parse(JSON.stringify(S));G.mode='local';
  press(S,B,owner,BTN.DOM);until(S,B,()=>!S.freeze&&free(f));
  for(let n=0;n<3;n++){expect(S,owner,n,'FREE CE');expect(S,owner,n,'0 CE');}
  for(let n=0;n<3;n++){
    expect(S,1-owner,n,CH[S.f[1-owner].ch].arts[n].cost+' CE');
    assert(!card(S,1-owner,n).includes('FREE CE'),'opponent inherited Garden cost');
  }
  capture(S,owner,1,'garden-free');const ce=f.ce;press(S,B,owner,BTN.A2);assert.equal(f.move,'a1');assert(f.ce>=ce,'Garden spent CE');
  until(S,B,()=>!S.dom&&free(f));f.ce=0;B.f[owner].ce=0;expect(S,owner,1,'NEED '+CH[f.ch].arts[1].cost+' CE');timelines++;
}
// The live stone recast precedes cooldown and CE checks in the existing rules.
for(const owner of [0,1]) {
  const S=fresh('stone',owner),f=S.f[owner],n=1,B=JSON.parse(JSON.stringify(S));G.mode='local';
  press(S,B,owner,BTN.A2);until(S,B,()=>free(f)&&S.proj.some(p=>p.k==='stone'&&p.o===owner));
  f.ce=0;B.f[owner].ce=0;assert(f.cd[n]>0);expect(S,owner,n,'SWAP STONE');expect(S,owner,n,'0 CE');capture(S,owner,n,'stone-swap');
  const old=f.x,cd=f.cd[n];press(S,B,owner,BTN.A2);assert.notEqual(f.x,old);assert(f.cd[n]<cd,'swap reset cooldown');assert(S.ev.some(e=>e.k==='swap'));
  until(S,B,()=>!S.proj.some(p=>p.k==='stone'&&p.o===owner));assert(!card(S,owner,n).includes('SWAP STONE'));timelines++;
}
for(const fixture of previews)for(const stage of PX_STAGES) {
  const {S,owner,n,name}=fixture;S.stage=stage.id;const F={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
  const frame=pxWorldSurface(S,F);frame.blit(pxHUDSurface(S,labels(),F),0,0);
  if(output)writePNG(output+'/'+prefix+'-'+name+'-'+stage.id+'-'+(owner?'right':'left')+'.png',frame);
}
console.log('PASS',baseline?'committed presentation comparison;':'new eligibility;',timelines,'real setup/HP/air/Garden/stone input timelines;',ticks,'parallel-state ticks;',layouts,'read-only bounded alpha/snapshot HUD layouts;',states,baseline?'status samples (new wording not asserted);':'specific statuses;',previews.length*3,'native scenes');
`)(assert,writePNG,output,prefix,baseline,()=>{},{},{getElementById(){return {getContext(){return {};}};}});
