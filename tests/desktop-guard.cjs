// Actual guard/recovery timelines and native HUD comparisons. Scripted, not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const filter=process.argv.find(a=>a.startsWith('--group='))?.slice(8);
const old=p=>require('node:child_process').execFileSync('git',['show','af40a94:'+p],{cwd:root,encoding:'utf8'});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"?]+)\?v=\d+"><\/script>/g)].map(m=>m[1]);
const nodes=new Map(),events={};
function element(){return {style:{setProperty(){}},children:[],set innerHTML(v){this.children=[];this._html=v;},get innerHTML(){return this._html;},appendChild(c){this.children.push(c);},setAttribute(){},focus(){},getContext(){return {drawImage(){},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};}};}
const document={visibilityState:'visible',createElement:element,getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},querySelectorAll(){return [];}};
const source=read=>files.filter(p=>read!==old||!p.endsWith('/desktop-animation.js')&&!p.endsWith('/desktop-maximum.js')).map(p=>read(p).split('// ---------- boot')[0]).join('\n');
const priorHUD=Function('addEventListener','document','window',source(old)+'\nreturn pxHUDSurface;')(()=>{},document,{});
Function('assert','writePNG','output','baseline','previewOnly','filter','priorHUD','events','addEventListener','document','window',source(baseline?old:p=>fs.readFileSync(path.join(root,p),'utf8'))+'\n'+`
let passed=0,failed=0,checks=0,ticks=0,changed=0,identical=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function group(name,fn){if(filter&&!name.includes(filter))return;try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(ch=0,slot=0){G.mode='local';G.running=true;G.paused=G.over=false;G.S=newMatch(ch,ch,115);G.S.phase='fight';G.S.t=120;G.S.f[0].x=200;G.S.f[1].x=1080;clearInput();FX.silent=true;return {S:G.S,f:G.S.f[slot],o:G.S.f[1-slot],slot};}
function key(slot,name){const binding=slot?BIND.p2:BIND.p1,code=binding[name][0];for(const type of ['keydown','keyup'])for(const fn of events[type]||[])fn({code,preventDefault(){}});return readKeys(binding);}
function advance(ctx,mask=BTN.G){const input=[0,0];input[ctx.slot]=mask;const control=JSON.parse(JSON.stringify(ctx.S));ctx.S.ev=[];control.ev=[];step(control,input);step(ctx.S,input);assert.equal(JSON.stringify(ctx.S),JSON.stringify(control),'presentation changed simulation');ticks++;}
function expect(f){return f.st==='block'?null:!free(f)?'GUARD LOCKED':f.y<GROUND?'LAND TO GUARD':null;}
function inspect(ctx){
  const {S}=ctx,before=JSON.stringify(S),effects=JSON.stringify(FX),rows=[],paint=pxText;
  pxText=function(s,t,x,y,c,z=1){rows.push({t,x,y,w:pxTextWidth(t,z)});return paint(s,t,x,y,c,z);};
  let hud;try{hud=pxHUDSurface(S,labels(),neutral);}finally{pxText=paint;}
  const prior=priorHUD(S,labels(),neutral);let diff=0;
  for(const f of S.f)if(f.st!=='ko'){
    const x=(f.i?373:52)+121,want=expect(f)|| (f.guardHp<35?'GUARD LOW':'GUARD '+Math.ceil(clamp(f.guardHp,0,100))+'%');
    const label=rows.find(r=>r.x===x&&r.y===55);assert.equal(label?.t,want,'guard cue contradicts '+f.st+' y='+f.y);assert(label.w<=80,'guard label exceeds lane');
    const only=new PixelSurface(640,360);pxGuardHUD(only,f,x);
    for(let y=53;y<73;y++)for(let xx=x-2;xx<x+82;xx++){const p=(y*640+xx)*4;assert.deepEqual(hud.data.subarray(p,p+4),only.data.subarray(p,p+4),'another status overlaps guard');}
    // Strength remains exact; a lock must not replace it with recovery progress.
    const width=Math.round(80*clamp(f.guardHp/100,0,1));
    if(expect(f)&&width)assert.deepEqual([...hud.data.subarray((65*640+x+width-1)*4,(65*640+x+width-1)*4+3)],[171,150,115]);
  }
  for(let y=0;y<360;y++)for(let x=0;x<640;x++){
    const p=(y*640+x)*4;if(hud.data[p]===prior.data[p]&&hud.data[p+1]===prior.data[p+1]&&hud.data[p+2]===prior.data[p+2]&&hud.data[p+3]===prior.data[p+3])continue;
    assert(y>=53&&y<73&&((x>=171&&x<255)||(x>=492&&x<576)),'difference escaped guard lanes');diff++;
  }
  if(diff){changed++;assert(diff>=200,'availability change too small at native size');}else identical++;
  assert.equal(JSON.stringify(S),before,'HUD wrote match');assert.equal(JSON.stringify(FX),effects,'HUD wrote effects');
  assert.deepEqual(hud.data,pxHUDSurface(JSON.parse(before),labels(),neutral).data,'guest snapshot needs event history');checks++;return hud;
}
function save(ctx,name){if(output)for(const stage of [PX_STAGES[0],PX_STAGES[1]]){ctx.S.stage=stage.id;const s=pxWorldSurface(ctx.S,neutral);s.blit(pxHUDSurface(ctx.S,labels(),neutral),0,0);writePNG(output+'/'+(baseline?'v115-before-':'v115-after-')+name+'-'+stage.id+'.png',s);}}
group('real punch/kick recovery, chained punches, held guard and every build/slot',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const name of ['P','K']){
    const c=setup(ch,slot);advance(c,key(slot,name));assert.equal(c.f.st,'atk');inspect(c);let chain=0;
    for(let t=0;t<120&&c.f.st==='atk';t++){
      const m=moveDef(c.f);let mask=BTN.G;
      if(name==='P'&&m.next&&c.f.mt===m.su+m.ac){mask|=key(slot,'P');chain++;}
      advance(c,mask);if(c.f.st==='atk'&&[m.su,m.su+(m.ac||0),m.su+(m.ac||0)+m.re-1].includes(c.f.mt))inspect(c);
    }
    if(name==='P')assert.equal(chain,2);assert.equal(c.f.st,'idle');inspect(c);advance(c);assert.equal(c.f.st,'guard');inspect(c);
  }
});
group('all actual art startup/release/recovery states keep guard unavailable',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(let n=0;n<3;n++){
    const c=setup(ch,slot);c.f.ce=100;c.o.nails=3;c.o.gum=300;c.o.hurtT=c.S.t;
    for(let t=0;t<80;t++)advance(c,0);
    advance(c,key(slot,'A'+(n+1)));assert.equal(c.f.st,'atk',CH[ch].arts[n].id+' not started');inspect(c);
    let age=0;while(c.f.st==='atk'&&age++<180){advance(c);if(age%12===0)inspect(c);}
    assert(age<180);inspect(c);advance(c);inspect(c);
  }
  const c=setup(CH.findIndex(ch=>ch.arts[0].id==='rock'));c.f.ce=100;advance(c,key(0,'A1'));
  for(let n=0;n<70;n++){advance(c,BTN.G|BTN.A1);if(n%12===0)inspect(c);}
  assert(c.f.chg>0,'held Rock did not charge');inspect(c);
  for(let n=0;n<60&&c.f.st==='atk';n++)advance(c);assert.equal(c.f.st,'idle');inspect(c);
});
group('all Domain/Maximum casts, held charge, cinematic holds and restoration',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]){
    const c=setup(ch,slot);c.f.gauge=100;advance(c,key(slot,'DOM'));assert.equal(c.f.st,'cast');inspect(c);
    const frozen=c.f.stT;for(let n=0;n<60;n++)advance(c);assert.equal(c.f.stT,frozen);inspect(c);
    let age=0;while(c.f.st==='cast'&&age++<200){advance(c);if(age%12===0)inspect(c);}
    assert(age<200);inspect(c);advance(c);inspect(c);
  }
});
group('jump, air attacks, held guard in air and actual landing',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const attack of [null,'P','K']){
    const c=setup(ch,slot);advance(c,key(slot,'U'));assert(c.f.y<GROUND);inspect(c);
    if(attack){advance(c,key(slot,attack));assert.equal(c.f.st,'atk');inspect(c);}
    for(let n=0;n<120&&(c.f.y<GROUND||c.f.st==='atk');n++){advance(c);if(n%12===0)inspect(c);}
    assert.equal(c.f.y,GROUND);inspect(c);advance(c);assert.equal(c.f.st,'guard');inspect(c);
  }
});
group('break, hit, shock, launch/down and ordinary block remain truthful',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const kind of ['break','block','hit','shock','down']){
    const c=setup(ch,slot);c.o.x=c.f.x+c.f.face*80;
    if(kind==='break'||kind==='block'){advance(c);if(kind==='break')c.f.guardHp=1;}
    hit(c.S,c.o.i,c.f,c.o.x,{dmg:20,kb:0,...(kind==='shock'?{shock:55}:kind==='down'?{lift:8}:{})});inspect(c);
    assert.equal(c.f.st,kind==='break'||kind==='shock'?'stun':kind==='block'?'block':'hit');
    let age=0;while(!free(c.f)&&age++<180){advance(c);if(age%15===0)inspect(c);}
    assert(age<180);inspect(c);advance(c);assert.equal(c.f.st,'guard');inspect(c);
  }
});
group('snapshot, low strength, stacked statuses, pause/time-stop and round cleanup',()=>{
  for(const state of ['idle','walk','guard','block','hit','stun','down','atk','cast','jump'])for(const strength of [0,12,34.99,35,60,100]){
    const c=setup(14);c.f.st=state;c.f.stT=55;c.f.guardHp=strength;if(state==='jump')c.f.y=GROUND-30;
    c.f.zone=120;c.f.nails=3;c.f.res=300;c.S.stop={o:1,t:30};inspect(c);
  }
  for(const pause of ['hitstop','freeze','stop']){
    const c=setup();advance(c,key(0,'K'));if(pause==='stop')c.S.stop={o:1,t:4};else c.S[pause]=4;
    const mt=c.f.mt,before=inspect(c);for(let n=0;n<4;n++){
      advance(c);assert.equal(c.f.mt,mt);const current=inspect(c);
      // The time-stop plaque correctly disappears at t=0; only guard holds.
      for(let y=53;y<73;y++)assert.deepEqual(current.data.subarray((y*640+171)*4,(y*640+255)*4),before.data.subarray((y*640+171)*4,(y*640+255)*4));
    }
    newRound(c.S);inspect(c);
  }
});
// Concrete vulnerability: guard input during a kick/cast/jump cannot block a
// front hit; the same hit after held-guard restoration becomes chip damage.
group('guard label agrees with actual front-hit outcomes',()=>{
  for(const kind of ['kick','cast','air','guard','block']){
    const c=setup();c.o.x=c.f.x+80;
    if(kind==='kick')advance(c,key(0,'K'));
    if(kind==='cast'){c.f.gauge=100;advance(c,key(0,'DOM'));c.S.freeze=0;}
    if(kind==='air')advance(c,key(0,'U'));
    if(kind==='guard'||kind==='block'){advance(c);if(kind==='block')hit(c.S,1,c.f,c.o.x,{dmg:10});}
    prepareGuard(c.f,c.o,BTN.G);const pre=JSON.parse(JSON.stringify(c.S)),hp=c.f.hp;hit(c.S,1,c.f,c.o.x,{dmg:20});
    assert(Math.abs((hp-c.f.hp)-(kind==='guard'||kind==='block'?3:20))<1e-7,'unexpected guard result for '+kind);
    inspect({...c,S:pre});
  }
});
// Save identical real-input states even when baseline assertions fail.
for(const kind of ['kick-recovery','cast-hold','air-guard','break-recovery','guard-restored']){
  const c=setup();
  if(kind==='kick-recovery'){advance(c,key(0,'K'));for(let n=0;n<18;n++)advance(c);}
  if(kind==='cast-hold'){c.f.gauge=100;advance(c,key(0,'DOM'));for(let n=0;n<62;n++)advance(c);}
  if(kind==='air-guard'){advance(c,key(0,'U'));for(let n=0;n<15;n++)advance(c);}
  if(kind==='break-recovery'){c.o.x=c.f.x+80;advance(c);c.f.guardHp=1;hit(c.S,1,c.f,c.o.x,{dmg:20});for(let n=0;n<45;n++)advance(c);}
  if(kind==='guard-restored')advance(c);
  save(c,kind);
}
console.log(passed+' audit groups passed; '+failed+' failed; '+checks+' read-only HUD/snapshot checks; '+ticks+' parallel ticks; '+changed+' changed and '+identical+' identical HUDs. Scripted, not played.');
if(failed&&!previewOnly)throw Error(failed+' desktop guard audit groups failed');
`)(assert,writePNG,output,baseline,previewOnly,filter,priorHUD,events,(name,fn)=>(events[name]??=[]).push(fn),document,{});
