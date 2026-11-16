// Actual mobile HTML, touch/main-loop casts and guest snapshots. Bitmap models
// show phone-size readability; they are not browser screenshots or played motion.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {context,root,html}=require('./mobile.cjs');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(out)fs.mkdirSync(out,{recursive:true});
const shared=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation'];
const source=shared.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n')+'\n'+fs.readFileSync(path.join(root,'src/desktop-quake.js'),'utf8');
const convergence=fs.readFileSync(path.join(root,'src/desktop-convergence.js'),'utf8');
context.prior=Function(source+'\n'+convergence+'\nreturn {pose:pxPose,domain:pxDomainPose,world:pxWorldSurface};')();
context.desktop=Function(source+'\n'+fs.readFileSync(path.join(root,'src/desktop-maximum.js'),'utf8')+'\n'+convergence+'\nreturn {pose:pxPose,world:pxWorldSurface};')();
Object.assign(context,{out,writePNG:require('./png.cjs'),previewOnly:process.argv.includes('--preview-only')});
vm.runInContext(`
const maximumPose=pxDomainPose;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const cases=[
 {name:'nuclear',ch:4,distance:380,times:[35,36,59,60,71,72],poses:['cannonw','nuclearcoil','nuclearcoil','nuclearbrace','nuclearbrace','cannon'],shot:72,damage:290},
 {name:'allout',ch:12,distance:500,times:[11,12,23,24,34,35],poses:['hookw','alloutcoil','alloutcoil','alloutdrive','alloutdrive','punch'],shot:35,damage:300},
 {name:'voice',ch:6,distance:380,times:[11,12,19,20,23,24],poses:['speechw','voiceinhale','voiceinhale','voicebrace','voicebrace','speech'],shot:24,damage:230}
];
let passed=0,failed=0,ticks=0,rasters=0,holds=0,snapshots=0,defaults=0,changed=0;
function audit(name,fn){try{fn();passed++;console.log('PASS mobile Maximum:',name);}catch(e){failed++;console.log('FAIL mobile Maximum:',name,e.message);}}
function resetFX(){for(const k of Object.keys(quiet))if(Array.isArray(quiet[k]))FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;FX.clock=0;}
function setup(c,slot,face){fresh('host',c.ch);resetFX();G.S=newMatch(c.ch,c.ch,128);const S=G.S;S.phase='fight';S.intro=0;S.stage=slot?'gallery':'courtyard';const f=S.f[slot],o=S.f[1-slot];f.x=face>0?100:1180;f.face=face;o.x=f.x+face*c.distance;o.face=-face;f.gauge=GAUGE_MAX;G.last=now;G.acc=0;return S;}
function equalPixels(a,b){assert.equal(a.data.length,b.data.length);assert(a.data.every((v,i)=>v===b.data[i]),'raster differs');rasters++;}
function checkFrame(S,slot){const saved=JSON.stringify(S),f=S.f[slot];assert.equal(pxPose(S,f),desktop.pose(S,f),'phone missing '+desktop.pose(S,f));equalPixels(pxWorldSurface(S,quiet),desktop.world(S,quiet));assert.equal(JSON.stringify(S),saved,'drawing changed sim');}

for(const c of cases)audit(c.name+': touch/remote cast reaches new poses and the exact release tick',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const guard of [false,true]){
  netClose();const callbacks={},events=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){if(p.t==='s')events.push(...p.e);}};netWire(conn,'host');callbacks.open();show('none');
  const S=setup(c,slot,face),f=S.f[slot],o=S.f[1-slot];const seen=new Map();let shots=0;
  const controls=[0,0];if(guard)controls[1-slot]=BTN.G;
  if(slot===0){pointer('pointerdown','DOM');pointer('pointerup','DOM');}else callbacks.data({t:'in',b:BTN.DOM<<INPUT_SHIFT});
  if(guard&&slot===1)pointer('pointerdown','G',2);
  const control=JSON.parse(JSON.stringify(S));
  for(let n=0;n<230;n++){
   // Host's guest watchdog is kept alive with the same held guard/zero packets.
   if(n>0||slot===0)callbacks.data({t:'in',b:slot===0&&guard?BTN.G:0});
   G.acc=1;advance();ticks++;control.ev=[];const b=controls.slice();if(n===0)b[slot]=BTN.DOM<<INPUT_SHIFT;step(control,b);
   if(control.ev.some(e=>e.k==='nuke')){shots++;assert.equal(S.dom.t,c.shot);if(c.ch===12)assert.equal(f.ce,0);}control.ev=[];
   assert.equal(JSON.stringify(S),JSON.stringify(control),'render/input altered simulation');
   if(S.dom&&!S.freeze&&c.times.includes(S.dom.t)&&!seen.has(S.dom.t)){seen.set(S.dom.t,pxPose(S,f));checkFrame(S,slot);}
   if(!S.dom&&n>0)break;
  }
  assert.equal(shots,1);assert(events.some(e=>e.k==='nuke'),'host omitted release event');assert.deepEqual(c.times.map(t=>seen.get(t)),c.poses);assert.equal(f.domUsed,1);assert.equal(CH[o.ch].hp-o.hp,guard?c.damage*.4:c.damage);
  if(c.ch===6)assert.equal(f.hp,CH[f.ch].hp-40);
 }
});

audit('both slots/facings hold frozen ages and draw event-free guest packets',()=>{
 for(const c of cases)for(const slot of [0,1])for(const face of [-1,1])for(const age of c.times.slice(1,5)){
  const S=setup(c,slot,face),f=S.f[slot];startDomain(S,f,S.f[1-slot]);S.freeze=0;S.dom.t=age;f.st='cast';
  checkFrame(S,slot);const pose=pxPose(S,f);
  for(const pause of ['hitstop','freeze']){const frozen=JSON.parse(JSON.stringify(S));frozen[pause]=3;for(let n=0;n<3;n++){step(frozen,[0,0]);assert.equal(frozen.dom.t,age);assert.equal(pxPose(frozen,frozen.f[slot]),pose);holds++;}}
  netClose();const callbacks={},sent=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){sent.push(p);}};netWire(conn,'guest');callbacks.open();fresh('guest',c.ch);
  const snap=JSON.parse(JSON.stringify(S));snap.ev=[];callbacks.data({t:'s',s:snap,e:[]});const before=JSON.stringify(snap);G.last=now;G.acc=0;advance();assert.equal(G.S,snap);assert.equal(JSON.stringify(snap),before);checkFrame(snap,slot);snapshots++;
  pointer('pointerdown','DOM');pointer('pointerup','DOM');advance();assert.equal(sent.filter(p=>p.t==='in').at(-1).b,BTN.DOM<<INPUT_SHIFT);
 }
});

audit('body-only scene changes, exact phone HUD/controls and unrelated states',()=>{
 for(const c of cases)for(const slot of [0,1])for(const face of [-1,1])for(const age of c.times){
  const S=setup(c,slot,face),f=S.f[slot];startDomain(S,f,S.f[1-slot]);S.freeze=0;S.dom.t=age;f.st='cast';
  const before=JSON.stringify(S);pxDomainPose=prior.domain;const old=pxWorldSurface(S,quiet),hud=mobileHUDSurface(S,labels());mobileUpdateControls(S);const views=JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes]));
  pxDomainPose=maximumPose;const scene=pxWorldSurface(S,quiet);equalPixels(hud,mobileHUDSurface(S,labels()));mobileUpdateControls(S);assert.equal(JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes])),views);assert.equal(JSON.stringify(S),before);
  let count=0;for(let y=0;y<360;y++)for(let x=0;x<640;x++){const p=(y*640+x)*4;if(scene.data.subarray(p,p+4).some((v,k)=>v!==old.data[p+k])){count++;assert(Math.abs(x-f.x/2)<72&&y>=f.y/2-128&&y<=f.y/2+3,'changed outside body');}}
  if(desktop.pose(S,f)!==prior.pose(S,f)){assert(count>500,'no visible body change');changed++;}else assert.equal(count,0);
 }
 for(let ch=0;ch<15;ch++)for(const slot of [0,1]){
  const S=newMatch(ch,ch,128),f=S.f[slot];S.phase='fight';f.gauge=100;startDomain(S,f,S.f[1-slot]);S.freeze=0;
  for(const age of [1,11,12,20,23,24,35,36,59,60,71,72,99]){S.dom.t=age;f.st='cast';if(desktop.pose(S,f)===prior.pose(S,f)){assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','stun','down','ko']){f.st=st;f.stT=15;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(let n=0;n<3;n++){startMove(f,'a'+n);const m=moveDef(f);for(let t=0;t<m.su+m.re;t++){f.mt=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  f.st='cast';f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;S.dom=null;assert.equal(pxPose(S,f),prior.pose(S,f));
 }
});

if(out)for(const c of cases)for(const [slot,face] of [[0,1],[1,-1]]){
 const S=setup(c,slot,face),f=S.f[slot],samples=[];
 if(c.ch!==12){f.x=slot?800:480;S.f[1-slot].x=f.x+face*c.distance;}
 for(let n=0;n<230&&samples.length<c.times.length;n++){const b=[0,0];if(n===0)b[slot]=BTN.DOM<<INPUT_SHIFT;S.ev=[];step(S,b);if(S.dom&&!S.freeze&&c.times.includes(S.dom.t)&&!samples.some(s=>s.dom.t===S.dom.t))samples.push(JSON.parse(JSON.stringify(S)));}
 assert.equal(samples.length,c.times.length);
 for(const kind of ['before','after']){
  pxDomainPose=kind==='before'?prior.domain:maximumPose;
  const strip=new PixelSurface(6*667,395),bodies=new PixelSurface(6*144,150);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
  for(let i=0;i<c.times.length;i++){
   const snapshot=samples[i],pose=pxPose(snapshot,snapshot.f[slot]),tag='v128-'+kind+'-'+c.name+'-p'+(slot+1)+'-t'+snapshot.dom.t;
   resetFX();const native=pxWorldSurface(snapshot,quiet);native.blit(mobileHUDSurface(snapshot,labels()),0,0);writePNG(out+'/'+tag+'-native.png',native);
   const phone=makePreview(667,375,undefined,c.ch,100,{key:'DOM',prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}});
   writePNG(out+'/'+tag+'-667x375.png',phone);strip.blit(phone,i*667,0);pxText(strip,'T '+snapshot.dom.t+' / '+pose.toUpperCase(),i*667+8,380,PX_LIGHT);
   bodies.blit(pxSprite(c.ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+snapshot.dom.t,i*144+8,138,PX_LIGHT);
  }
  writePNG(out+'/v128-'+kind+'-'+c.name+'-p'+(slot+1)+'-phone-strip.png',strip);writePNG(out+'/v128-'+kind+'-'+c.name+'-p'+(slot+1)+'-bodies.png',bodies);
 }
}
pxDomainPose=maximumPose;
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,snapshots,defaults,changed}));
if(failed&&!previewOnly)throw Error('mobile Maximum audit failed: '+failed);
`,context);
