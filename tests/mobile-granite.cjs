// Real mobile script order, synthetic touch/transport, and generated phone models.
// These checks do not establish native phone motion, touch latency or play.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {context,root}=require('./mobile.cjs');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(out)fs.mkdirSync(out,{recursive:true});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake','desktop-ordinary','desktop-apshot','desktop-piercing','desktop-contract','desktop-blast'];
const source=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
context.prior=Function(source+'\nreturn {step,pose:pxPose,world:pxWorldSurface};')();
context.desktop=Function(source+'\n'+fs.readFileSync(path.join(root,'src/desktop-granite.js'),'utf8')+'\nreturn {pose:pxPose,world:pxWorldSurface};')();
Object.assign(context,{out,writePNG:require('./png.cjs'),previewOnly:process.argv.includes('--preview-only')});
vm.runInContext(`
const granitePose=pxPose;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='granite')),art=CH[ch].arts.findIndex(a=>a.id==='granite'),key='A'+(art+1),bit=BTN[key],m=CH[ch].arts[art];
const ages=[7,8,11,12,14,15,17,18,24,29,30,31,34,35,40];
const expected=['cannonw','granitecoil','granitecoil','graniteaim','graniteaim','granitefire','granitefire','granitebrace','granitebrace','granitebrace','granitebrace','granitewithdraw','granitewithdraw','cannonsettle','cannonsettle'];
let passed=0,failed=0,ticks=0,rasters=0,holds=0,snapshots=0,defaults=0,changed=0;
function audit(name,fn){try{fn();passed++;console.log('PASS mobile Granite Blast:',name);}catch(e){failed++;console.log('FAIL mobile Granite Blast:',name,e.stack);}}
function resetFX(){for(const k of Object.keys(quiet))if(Array.isArray(quiet[k]))FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;FX.clock=0;}
function setup(slot,face,mode='hit',low=false){
 fresh('host',ch);resetFX();G.S=newMatch(ch,ch,144);const S=G.S;S.phase='fight';S.intro=0;S.stage=slot?'gallery':'courtyard';
 const f=S.f[slot],o=S.f[1-slot];f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:220);o.face=mode==='rear'?face:-face;f.ce=100;if(low)f.hp=200;
 if(mode==='rear')f.dis=300;G.last=now;G.acc=0;return {S,f,o};
}
function equalPixels(a,b){assert.equal(a.data.length,b.data.length);assert(a.data.every((v,i)=>v===b.data[i]),'raster differs');rasters++;}
function checkFrame(S,slot){const saved=JSON.stringify(S),f=S.f[slot];assert.equal(pxPose(S,f),desktop.pose(S,f),'phone missing '+desktop.pose(S,f));equalPixels(pxWorldSurface(S,quiet),desktop.world(S,quiet));assert.equal(JSON.stringify(S),saved,'drawing changed sim');}
function host(){netClose();const callbacks={},events=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){if(p.t==='s')events.push(...p.e);}};netWire(conn,'host');callbacks.open();show('none');return {callbacks,events};}

audit('touch/remote beams retain tick-15 release, costs, kickback, damage and recovery',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump'])for(const low of [false,true]){
  const {callbacks,events}=host(),{S,f,o}=setup(slot,face,mode,low),control=JSON.parse(JSON.stringify(S)),seen=new Map();let releases=0;
  if(slot===0){pointer('pointerdown',key);pointer('pointerup',key);}else callbacks.data({t:'in',b:bit<<INPUT_SHIFT});
  if(slot===1&&mode==='guard')pointer('pointerdown','G',2);

  for(let n=0;n<80;n++){
   if(slot===1&&mode==='jump'&&n===6){pointer('pointerdown','U',2);pointer('pointerup','U',2);}
   if(n>0||slot===0)callbacks.data({t:'in',b:slot===0?(mode==='guard'?BTN.G:mode==='jump'&&n===6?BTN.U<<INPUT_SHIFT:0):0});
   const b=[0,0];if(n===0)b[slot]=bit<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===6)b[1-slot]=BTN.U<<INPUT_SHIFT;
   G.acc=1;advance();ticks++;control.ev=[];prior.step(control,b);
   if(control.ev.some(e=>e.k==='beam')){releases++;assert.equal(f.mt,15);assert.equal(f.vx,-face*7);const beam=S.zones.find(z=>z.k==='beam');assert.equal(beam.x,f.x+face*53);assert.equal(beam.y,f.y-74);assert.equal(beam.dur,16);assert.equal(beam.w,30);}
   if(S.zones.some(z=>z.k==='beam'))assert(['granitefire','granitebrace'].includes(pxPose(S,f)),'arms withdraw during live beam');
   control.ev=[];assert.equal(JSON.stringify(S),JSON.stringify(control),'touch/render altered simulation');
   if(n===0){assert.equal(f.cd[art],m.cd);assert(f.ce>=100-m.cost&&f.ce<101-m.cost);}
   if(f.st==='atk'&&ages.includes(f.mt)&&!seen.has(f.mt)){seen.set(f.mt,pxPose(S,f));checkFrame(S,slot);}
  }
  assert.equal(releases,1);assert(events.some(e=>e.k==='beam'));assert.deepEqual(ages.map(t=>seen.get(t)),expected);assert.equal(f.st,'idle');assert.equal(f.hp,low?200:CH[ch].hp);const wanted=mode==='rear'||mode==='jump'?0:115*(mode==='guard'?.25:1);assert(Math.abs(CH[ch].hp-o.hp-wanted)<1e-9,'damage changed');
  if(slot===1&&mode==='guard')pointer('pointerup','G',2);
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
  pxPose=granitePose;const scene=pxWorldSurface(S,quiet),newBody=new PixelSurface(640,360);pxPaintFighter(newBody,S,f,null);equalPixels(hud,mobileHUDSurface(S,labels()));mobileUpdateControls(S);assert.equal(JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes])),views);assert.equal(JSON.stringify(S),saved);
  let count=0;for(let p=0;p<scene.data.length;p+=4)if(scene.data.subarray(p,p+4).some((v,k)=>v!==old.data[p+k])){count++;assert(oldBody.data[p+3]||newBody.data[p+3],'outside body');}
  if(desktop.pose(S,f)!==prior.pose(S,f)){assert(count>150,'no visible body change');changed++;}else assert.equal(count,0);
 }
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,144),f=S.f[slot];S.phase='fight';
  for(let a=0;a<3;a++){startMove(f,'a'+a);const move=moveDef(f);for(let t=0;t<move.su+move.re;t++){f.mt=t;if(move.id==='granite'&&t>=8&&t<35)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
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
  pxPose=kind==='before'?prior.pose:granitePose;
  const strip=new PixelSurface(ages.length*667,395),bodies=new PixelSurface(ages.length*144,150);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
  for(let i=0;i<ages.length;i++){
   const snapshot=samples[i],age=snapshot.f[slot].mt,pose=pxPose(snapshot,snapshot.f[slot]),tag='v144-'+kind+'-granite-p'+(slot+1)+'-t'+age;
   resetFX();const native=pxWorldSurface(snapshot,quiet);native.blit(mobileHUDSurface(snapshot,labels()),0,0);writePNG(out+'/'+tag+'-native.png',native);
   const phone=makePreview(667,375,undefined,ch,100,{key,prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}});writePNG(out+'/'+tag+'-667x375.png',phone);
   if(age===18)for(const [w,h] of [[812,320],[844,390],[390,844]])writePNG(out+'/'+tag+'-'+w+'x'+h+'.png',makePreview(w,h,undefined,ch,100,{key,prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}}));
   strip.blit(phone,i*667,0);pxText(strip,'T '+age+' / '+pose.toUpperCase(),i*667+8,380,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+age,i*144+8,138,PX_LIGHT);
  }
  writePNG(out+'/v144-'+kind+'-granite-p'+(slot+1)+'-phone-strip.png',strip);writePNG(out+'/v144-'+kind+'-granite-p'+(slot+1)+'-bodies.png',bodies);
 }
}
pxPose=granitePose;
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,snapshots,defaults,changed}));
if(failed&&!previewOnly)throw Error('mobile Granite Blast audit failed: '+failed);
`,context);
