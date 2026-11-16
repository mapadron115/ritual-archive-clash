// Real mobile script order, synthetic touch/transport, and generated phone models.
// These checks do not establish native phone motion, touch latency or play.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {context,root}=require('./mobile.cjs');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(out)fs.mkdirSync(out,{recursive:true});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake','desktop-ordinary','desktop-apshot','desktop-piercing','desktop-blast','desktop-granite','desktop-red','desktop-blue','desktop-flame'];
const source=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
context.prior=Function(source+'\nreturn {step,pose:pxPose,world:pxWorldSurface};')();
context.desktop=Function(source+'\n'+fs.readFileSync(path.join(root,'src/desktop-contract.js'),'utf8')+'\nreturn {pose:pxPose,world:pxWorldSurface};')();
Object.assign(context,{out,writePNG:require('./png.cjs'),previewOnly:process.argv.includes('--preview-only')});
vm.runInContext(`
const contractPose=pxPose;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='contract')),art=CH[ch].arts.findIndex(a=>a.id==='contract'),key='A'+(art+1),bit=BTN[key],m=CH[ch].arts[art];
const ages=[2,3,5,6,8,9,12,14,15,16,19];
const expected=['signw','contractreach','contractreach','contractpull','contractpull','contractbrace','contractbrace','contractbrace','contractbrace','signsettle','signsettle'];
let passed=0,failed=0,ticks=0,rasters=0,holds=0,snapshots=0,defaults=0,changed=0;
function audit(name,fn){try{fn();passed++;console.log('PASS mobile Contract:',name);}catch(e){failed++;console.log('FAIL mobile Contract:',name,e.stack);}}
function resetFX(){for(const k of Object.keys(quiet))if(Array.isArray(quiet[k]))FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;FX.clock=0;}
function setup(slot,face,mode='hit',low=false){
 fresh('host',ch);resetFX();G.S=newMatch(ch,ch,140);const S=G.S;S.phase='fight';S.intro=0;S.stage=slot?'gallery':'courtyard';
 const f=S.f[slot],o=S.f[1-slot];f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:mode==='far'?600:220);o.face=mode==='rear'?face:-face;f.ce=100;o.gum=100;
 if(low)f.hp=200;if(mode==='rear')f.dis=300;G.last=now;G.acc=0;return {S,f,o};
}
function equalPixels(a,b){assert.equal(a.data.length,b.data.length);assert(a.data.every((v,i)=>v===b.data[i]),'raster differs');rasters++;}
function checkFrame(S,slot){const saved=JSON.stringify(S),f=S.f[slot];assert.equal(pxPose(S,f),desktop.pose(S,f),'phone missing '+desktop.pose(S,f));equalPixels(pxWorldSurface(S,quiet),desktop.world(S,quiet));assert.equal(JSON.stringify(S),saved,'drawing changed sim');}
function host(){netClose();const callbacks={},events=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){if(p.t==='s')events.push(...p.e);}};netWire(conn,'host');callbacks.open();show('none');return {callbacks,events};}

audit('touch/remote casts retain costs, tick-six grab, strand, damage and recovery',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump','far'])for(const low of [false,true]){
  const {callbacks,events}=host(),{S,f,o}=setup(slot,face,mode,low),control=JSON.parse(JSON.stringify(S)),seen=new Map();let releases=0,dragged=false,distance=null;
  if(slot===0){pointer('pointerdown',key);pointer('pointerup',key);}else callbacks.data({t:'in',b:bit<<INPUT_SHIFT});
  if(slot===1&&mode==='guard')pointer('pointerdown','G',2);
  if(slot===1&&mode==='jump'){pointer('pointerdown','U',2);pointer('pointerup','U',2);}
  for(let n=0;n<80;n++){
   if(n>0||slot===0)callbacks.data({t:'in',b:slot===0?(mode==='guard'?BTN.G:mode==='jump'&&n===0?BTN.U<<INPUT_SHIFT:0):0});
   const b=[0,0];if(n===0)b[slot]=bit<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===0)b[1-slot]=BTN.U<<INPUT_SHIFT;
   G.acc=1;advance();ticks++;control.ev=[];prior.step(control,b);
   if(control.ev.some(e=>e.k==='summon')){releases++;assert.equal(f.mt,6);assert.equal(o.gum,0);assert.equal(o.grab,slot===0?11:12);assert.equal(o.grabX,clamp(f.x+face*74,LEFT,RIGHT));}
   control.ev=[];assert.equal(JSON.stringify(S),JSON.stringify(control),'touch/render altered simulation');
   if(n===0){assert.equal(f.cd[art],m.cd);assert(f.ce>=100-m.cost&&f.ce<101-m.cost);}
   if(f.st==='atk'&&ages.includes(f.mt)&&!seen.has(f.mt)){seen.set(f.mt,pxPose(S,f));checkFrame(S,slot);}
   if(o.grab>0){const d=Math.abs(o.x-o.grabX);if(distance!==null&&d<distance-20)dragged=true;if(distance===null)distance=d;}
  }
  assert.equal(releases,1);assert(events.some(e=>e.k==='summon'));assert.deepEqual(ages.map(t=>seen.get(t)),expected);assert(dragged);assert.equal(f.st,'idle');assert.equal(f.hp,low?200:CH[ch].hp);assert.equal(CH[ch].hp-o.hp,30);
  if(slot===1&&mode==='guard')pointer('pointerup','G',2);
 }
});

audit('real Gum touch/remote attachment enables Contract; missing strand and Infinity stay fair',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const guard of [false,true]){
  const {callbacks}=host(),{S,f,o}=setup(slot,face);o.gum=0;const control=JSON.parse(JSON.stringify(S));let attached=false,pulled=false;
  if(guard&&slot===1)pointer('pointerdown','G',2);
  for(let n=0;n<100;n++){
   const attack=n===0?BTN.A1:n===40?bit:0;
   if(n===40)assert(o.gum>0,'Gum never attached');
   if(slot===0&&attack){const k=n===0?'A1':key;pointer('pointerdown',k);pointer('pointerup',k);}
   callbacks.data({t:'in',b:slot===1?attack<<INPUT_SHIFT:guard?BTN.G:0});
   const b=[0,0];b[slot]=attack<<INPUT_SHIFT;if(guard)b[1-slot]=BTN.G;control.ev=[];prior.step(control,b);G.acc=1;advance();ticks++;
   if(n<40&&o.gum>0)attached=true;
   if(control.ev.some(e=>e.k==='summon')){pulled=true;assert.equal(pxPose(S,f),'contractpull');assert.equal(o.gum,0);checkFrame(S,slot);}
   control.ev=[];assert.equal(JSON.stringify(S),JSON.stringify(control));
  }
  assert(attached&&pulled);assert.equal(CH[ch].hp-o.hp,30+15*(guard?.15:1));assert.equal(f.st,'idle');if(guard&&slot===1)pointer('pointerup','G',2);
 }
 for(const mode of ['missing','infinity'])for(const slot of [0,1]){
  const {callbacks}=host(),{S,f,o}=setup(slot,1);if(mode==='missing')o.gum=0;else o.inf=100;const control=JSON.parse(JSON.stringify(S));
  if(slot===0){pointer('pointerdown',key);pointer('pointerup',key);}else callbacks.data({t:'in',b:bit<<INPUT_SHIFT});
  for(let n=0;n<40;n++){if(n>0||slot===0)callbacks.data({t:'in',b:0});const b=[0,0];if(n===0)b[slot]=bit<<INPUT_SHIFT;control.ev=[];prior.step(control,b);G.acc=1;advance();ticks++;control.ev=[];assert.equal(JSON.stringify(S),JSON.stringify(control));}
  assert.equal(o.hp,CH[ch].hp);if(mode==='missing'){assert.equal(f.ce,100);assert.equal(f.cd[art],0);}else{assert.equal(o.gum,0);assert.equal(o.grab,0);assert(f.ce<100);}
 }
});

audit('serialized bodies hold through freezes and event-free guest snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const age of ages){
  const {S,f}=setup(slot,face);startMove(f,'a'+art);f.mt=age;checkFrame(S,slot);assert.equal(pxPose(S,f),expected[ages.indexOf(age)]);const pose=pxPose(S,f);
  for(const pause of ['hitstop','freeze','stop']){const frozen=JSON.parse(JSON.stringify(S));if(pause==='stop')frozen.stop={o:1-slot,t:3};else frozen[pause]=3;for(let n=0;n<3;n++){step(frozen,[0,0]);assert.equal(frozen.f[slot].mt,age);assert.equal(pxPose(frozen,frozen.f[slot]),pose);holds++;}}
  netClose();const callbacks={},sent=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){sent.push(p);}};netWire(conn,'guest');callbacks.open();fresh('guest',ch);
  const snap=JSON.parse(JSON.stringify(S));snap.ev=[];callbacks.data({t:'s',s:snap,e:[]});const before=JSON.stringify(snap);G.last=now;G.acc=0;advance();assert.equal(G.S,snap);assert.equal(JSON.stringify(snap),before);checkFrame(snap,slot);snapshots++;
  pointer('pointerdown',key);pointer('pointerup',key);advance();assert.equal(sent.filter(p=>p.t==='in').at(-1).b,bit<<INPUT_SHIFT);
 }
});

audit('all-stage changes stay inside bodies; phone HUD/controls and other poses stay exact',()=>{
 for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1])for(const age of ages){
  const {S,f}=setup(slot,face);S.stage=stage.id;startMove(f,'a'+art);f.mt=age;const saved=JSON.stringify(S);
  pxPose=prior.pose;const old=pxWorldSurface(S,quiet),hud=mobileHUDSurface(S,labels()),oldBody=new PixelSurface(640,360);pxPaintFighter(oldBody,S,f,null);mobileUpdateControls(S);const views=JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes]));
  pxPose=contractPose;const scene=pxWorldSurface(S,quiet),newBody=new PixelSurface(640,360);pxPaintFighter(newBody,S,f,null);equalPixels(hud,mobileHUDSurface(S,labels()));mobileUpdateControls(S);assert.equal(JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes])),views);assert.equal(JSON.stringify(S),saved);
  let count=0;for(let p=0;p<scene.data.length;p+=4)if(scene.data.subarray(p,p+4).some((v,k)=>v!==old.data[p+k])){count++;assert(oldBody.data[p+3]||newBody.data[p+3],'outside body');}
  if(desktop.pose(S,f)!==prior.pose(S,f)){assert(count>150,'no visible body change');changed++;}else assert.equal(count,0);
 }
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,140),f=S.f[slot];S.phase='fight';
  for(let a=0;a<3;a++){startMove(f,'a'+a);const move=moveDef(f);for(let t=0;t<move.su+move.re;t++){f.mt=t;if(move.id==='contract'&&t>=3&&t<16)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','stun','down','ko']){f.st=st;f.stT=15;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,S.f[1-slot]);S.freeze=0;f.st='cast';for(const age of [1,12,20,32,40,60,72]){S.dom.t=age;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.portrait=true;assert.equal(pxPose(S,f),'idle');
 }
});

if(out)for(const [slot,face] of [[0,1],[1,-1]]){
 const {S,f}=setup(slot,face),samples=[];
 for(let n=0;n<80&&samples.length<ages.length;n++){const b=[0,0];if(n===0)b[slot]=bit<<INPUT_SHIFT;S.ev=[];step(S,b);if(f.st==='atk'&&ages.includes(f.mt)&&!samples.some(s=>s.f[slot].mt===f.mt))samples.push(JSON.parse(JSON.stringify(S)));}
 assert.equal(samples.length,ages.length);
 for(const kind of ['before','after']){
  pxPose=kind==='before'?prior.pose:contractPose;
  const strip=new PixelSurface(ages.length*667,395),bodies=new PixelSurface(ages.length*144,150);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
  for(let i=0;i<ages.length;i++){
   const snapshot=samples[i],age=snapshot.f[slot].mt,pose=pxPose(snapshot,snapshot.f[slot]),tag='v140-'+kind+'-contract-p'+(slot+1)+'-t'+age;
   resetFX();const native=pxWorldSurface(snapshot,quiet);native.blit(mobileHUDSurface(snapshot,labels()),0,0);writePNG(out+'/'+tag+'-native.png',native);
   const phone=makePreview(667,375,undefined,ch,100,{key,prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}});writePNG(out+'/'+tag+'-667x375.png',phone);
   if(age===6)for(const [w,h] of [[812,320],[844,390],[390,844]])writePNG(out+'/'+tag+'-'+w+'x'+h+'.png',makePreview(w,h,undefined,ch,100,{key,prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}}));
   strip.blit(phone,i*667,0);pxText(strip,'T '+age+' / '+pose.toUpperCase(),i*667+8,380,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+age,i*144+8,138,PX_LIGHT);
  }
  writePNG(out+'/v140-'+kind+'-contract-p'+(slot+1)+'-phone-strip.png',strip);writePNG(out+'/v140-'+kind+'-contract-p'+(slot+1)+'-bodies.png',bodies);
 }
}
pxPose=contractPose;
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,snapshots,defaults,changed}));
if(failed&&!previewOnly)throw Error('mobile Contract audit failed: '+failed);
`,context);
