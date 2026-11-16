// Reviewed AP Shot / Piercing Blood bodies through real mobile HTML and input.
// Phone exports are renderer/layout models, not browser screenshots or play.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {context,root}=require('./mobile.cjs');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(out)fs.mkdirSync(out,{recursive:true});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake','desktop-ordinary','desktop-contract','desktop-blast','desktop-granite','desktop-red','desktop-blue','desktop-flame','desktop-grape','desktop-guided'];
const source=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
context.prior=Function(source+'\nreturn {pose:pxPose,world:pxWorldSurface};')();
context.desktop=Function(source+'\n'+['desktop-apshot','desktop-piercing'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n')+'\nreturn {pose:pxPose,world:pxWorldSurface};')();
Object.assign(context,{out,writePNG:require('./png.cjs'),previewOnly:process.argv.includes('--preview-only')});
vm.runInContext(`
const beamPose=pxPose;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const cases=[
 {id:'apshot',times:[6,7,10,11,13,14,16,17,25,26,31],poses:['clapw','apcompress','apcompress','apaim','apaim','apfire','apfire','aprecoil','aprecoil','clapseparate','clapseparate'],jump:6,duration:12,width:12,cost:25},
 {id:'piercing',times:[12,13,19,20,25,26,28,29,38,39,40,44,45,49],poses:['clapw','bloodgather','bloodgather','bloodaim','bloodaim','bloodstream','bloodstream','bloodstream','bloodstream','bloodstream','bloodwithdraw','bloodwithdraw','clapseparate','clapseparate'],jump:18,duration:14,width:18,cost:30}
];
for(const c of cases)c.ch=CH.findIndex(f=>f.arts.some(a=>a.id===c.id));
let passed=0,failed=0,ticks=0,rasters=0,holds=0,snapshots=0,defaults=0,changed=0;
function audit(name,fn){try{fn();passed++;console.log('PASS mobile beam bodies:',name);}catch(e){failed++;console.log('FAIL mobile beam bodies:',name,e.message);}}
function resetFX(){for(const k of Object.keys(quiet))if(Array.isArray(quiet[k]))FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;FX.clock=0;}
function setup(c,slot,face,mode='hit',enhanced=false){
 fresh('host',c.ch);resetFX();G.S=newMatch(c.ch,c.ch,138);const S=G.S;S.phase='fight';S.intro=0;S.stage=slot?'gallery':'courtyard';
 const f=S.f[slot],o=S.f[1-slot];f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:220);o.face=mode==='rear'?face:-face;f.ce=100;
 if(enhanced){if(c.id==='apshot')f.res=6;else f.hp=200;}if(mode==='rear')f.dis=300;G.last=now;G.acc=0;
 const art=CH[c.ch].arts.findIndex(a=>a.id===c.id),key='A'+(art+1);return {S,f,o,art,key,bit:BTN[key],m:CH[c.ch].arts[art]};
}
function equalPixels(a,b){assert.equal(a.data.length,b.data.length);assert(a.data.every((v,i)=>v===b.data[i]),'raster differs');rasters++;}
function checkFrame(S,slot){const saved=JSON.stringify(S),f=S.f[slot];assert.equal(pxPose(S,f),desktop.pose(S,f),'phone missing '+desktop.pose(S,f));equalPixels(pxWorldSurface(S,quiet),desktop.world(S,quiet));assert.equal(JSON.stringify(S),saved,'drawing changed sim');}

audit('touch/remote casts retain beams, HP/CE, hit/rear/guard/jump, sweat and recovery',()=>{
 for(const c of cases)for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump'])for(const enhanced of [false,true]){
  netClose();const callbacks={},events=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){if(p.t==='s')events.push(...p.e);}};netWire(conn,'host');callbacks.open();show('none');
  const {S,f,o,art,key,bit,m}=setup(c,slot,face,mode,enhanced),control=JSON.parse(JSON.stringify(S)),seen=new Map(),startHP=f.hp;let shots=0;
  if(slot===0){pointer('pointerdown',key);pointer('pointerup',key);}else callbacks.data({t:'in',b:bit<<INPUT_SHIFT});
  if(mode==='guard'&&slot===1)pointer('pointerdown','G',2);
  for(let n=0;n<100;n++){
   const held=slot===0&&mode==='guard'?BTN.G:slot===0&&mode==='jump'&&n===c.jump?BTN.U<<INPUT_SHIFT:0;
   if(n>0||slot===0)callbacks.data({t:'in',b:held});
   if(slot===1&&mode==='jump'&&n===c.jump){pointer('pointerdown','U',2);pointer('pointerup','U',2);}
   const b=[0,0];if(n===0)b[slot]=bit<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===c.jump)b[1-slot]=BTN.U<<INPUT_SHIFT;
   G.acc=1;advance();ticks++;control.ev=[];step(control,b);
   if(control.ev.some(e=>e.k==='beam')){
    shots++;assert.equal(f.mt,m.su);const z=S.zones.find(z=>z.k==='beam');assert(z);assert.equal(z.dur,c.duration);assert.equal(z.w,c.width);assert.equal(z.x,f.x+f.face*46);assert.equal(z.y,f.y-74);if(c.id==='apshot')assert.equal(f.res,0);
   }
   control.ev=[];assert.equal(JSON.stringify(S),JSON.stringify(control),'touch/render altered simulation');
   if(n===0){assert.equal(f.cd[art],m.cd);assert.equal(m.cost,c.cost);assert(f.ce>=100-m.cost&&f.ce<101-m.cost);if(c.id==='piercing')assert.equal(f.hp,startHP-30);}
   if(f.st==='atk'&&c.times.includes(f.mt)&&!seen.has(f.mt)){seen.set(f.mt,pxPose(S,f));checkFrame(S,slot);}
   if(c.id==='piercing'&&S.zones.some(z=>z.k==='beam'))assert.equal(pxPose(S,f),'bloodstream','feed ended before beam');
  }
  assert.equal(shots,1);assert(events.some(e=>e.k==='beam'),'missing host release');assert.deepEqual(c.times.map(t=>seen.get(t)),c.poses);assert.notEqual(f.st,'atk');assert.equal(f.hp,startHP-(c.id==='piercing'?30:0));
  const damage=mode==='rear'||mode==='jump'?0:(c.id==='apshot'?85*(enhanced?1.48:1)*(mode==='guard'?.33:1):150*(mode==='guard'?.25:1));assert(Math.abs(CH[c.ch].hp-o.hp-damage)<1e-9,'damage changed');
  if(mode==='guard'&&slot===1)pointer('pointerup','G',2);
 }
});

audit('serialized ages hold through freezes and event-free guest packets',()=>{
 for(const c of cases)for(const slot of [0,1])for(const face of [-1,1])for(const age of c.times){
  const {S,f,art,key,bit}=setup(c,slot,face);startMove(f,'a'+art);f.mt=age;checkFrame(S,slot);const pose=pxPose(S,f);
  for(const pause of ['hitstop','freeze','stop']){const frozen=JSON.parse(JSON.stringify(S));if(pause==='stop')frozen.stop={o:1-slot,t:3};else frozen[pause]=3;for(let n=0;n<3;n++){step(frozen,[0,0]);assert.equal(frozen.f[slot].mt,age);assert.equal(pxPose(frozen,frozen.f[slot]),pose);holds++;}}
  netClose();const callbacks={},sent=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){sent.push(p);}};netWire(conn,'guest');callbacks.open();fresh('guest',c.ch);
  const snap=JSON.parse(JSON.stringify(S));snap.ev=[];callbacks.data({t:'s',s:snap,e:[]});const before=JSON.stringify(snap);G.last=now;G.acc=0;advance();assert.equal(G.S,snap);assert.equal(JSON.stringify(snap),before);checkFrame(snap,slot);snapshots++;
  pointer('pointerdown',key);pointer('pointerup',key);advance();assert.equal(sent.filter(p=>p.t==='in').at(-1).b,bit<<INPUT_SHIFT);
 }
});

audit('all-stage differences stay inside bodies; phone HUD/controls and other poses stay exact',()=>{
 for(const c of cases)for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1])for(const age of c.times){
  const {S,f,art}=setup(c,slot,face);S.stage=stage.id;startMove(f,'a'+art);f.mt=age;const before=JSON.stringify(S);
  pxPose=prior.pose;const old=pxWorldSurface(S,quiet),hud=mobileHUDSurface(S,labels()),oldBody=new PixelSurface(640,360);pxPaintFighter(oldBody,S,f,null);mobileUpdateControls(S);const views=JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes]));
  pxPose=beamPose;const scene=pxWorldSurface(S,quiet),newBody=new PixelSurface(640,360);pxPaintFighter(newBody,S,f,null);equalPixels(hud,mobileHUDSurface(S,labels()));mobileUpdateControls(S);assert.equal(JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes])),views);assert.equal(JSON.stringify(S),before);
  let count=0;for(let p=0;p<scene.data.length;p+=4)if(scene.data.subarray(p,p+4).some((v,k)=>v!==old.data[p+k])){count++;assert(oldBody.data[p+3]||newBody.data[p+3],'outside body');}
  if(desktop.pose(S,f)!==prior.pose(S,f)){assert(count>150,'no visible body change');changed++;}else assert.equal(count,0);
 }
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,138),f=S.f[slot];S.phase='fight';
  for(let n=0;n<3;n++){startMove(f,'a'+n);const m=moveDef(f);for(let t=0;t<m.su+m.re;t++){f.mt=t;if(m.id==='apshot'&&t>=7&&t<26||m.id==='piercing'&&t>=13&&t<45)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','stun','down','ko']){f.st=st;f.stT=15;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,S.f[1-slot]);S.freeze=0;f.st='cast';for(const age of [1,12,20,32,40,60,72]){S.dom.t=age;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.portrait=true;assert.equal(pxPose(S,f),'idle');
 }
});

if(out)for(const c of cases)for(const [slot,face] of [[0,1],[1,-1]]){
 const {S,f,art,key,bit}=setup(c,slot,face),samples=[];
 for(let n=0;n<100&&samples.length<c.times.length;n++){const b=[0,0];if(n===0)b[slot]=bit<<INPUT_SHIFT;S.ev=[];step(S,b);if(f.st==='atk'&&c.times.includes(f.mt)&&!samples.some(s=>s.f[slot].mt===f.mt))samples.push(JSON.parse(JSON.stringify(S)));}
 assert.equal(samples.length,c.times.length);
 for(const kind of ['before','after']){
  pxPose=kind==='before'?prior.pose:beamPose;
  const strip=new PixelSurface(c.times.length*667,395),bodies=new PixelSurface(c.times.length*144,150);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
  for(let i=0;i<c.times.length;i++){
   const snapshot=samples[i],age=snapshot.f[slot].mt,pose=pxPose(snapshot,snapshot.f[slot]),tag='v138-'+kind+'-'+c.id+'-p'+(slot+1)+'-t'+age;
   resetFX();const native=pxWorldSurface(snapshot,quiet);native.blit(mobileHUDSurface(snapshot,labels()),0,0);writePNG(out+'/'+tag+'-native.png',native);
   const phone=makePreview(667,375,undefined,c.ch,100,{key,prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}});writePNG(out+'/'+tag+'-667x375.png',phone);
   if(age===(c.id==='apshot'?14:29))for(const [w,h] of [[844,390],[390,844]])writePNG(out+'/'+tag+'-'+w+'x'+h+'.png',makePreview(w,h,undefined,c.ch,100,{key,prepare(s){Object.assign(s,JSON.parse(JSON.stringify(snapshot)));resetFX();},run(){}}));
   strip.blit(phone,i*667,0);pxText(strip,'T '+age+' / '+pose.toUpperCase(),i*667+8,380,PX_LIGHT);bodies.blit(pxSprite(c.ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+age+' / '+(face<0?'LEFT':'RIGHT'),i*144+8,138,PX_LIGHT);
  }
  writePNG(out+'/v138-'+kind+'-'+c.id+'-p'+(slot+1)+'-phone-strip.png',strip);writePNG(out+'/v138-'+kind+'-'+c.id+'-p'+(slot+1)+'-bodies.png',bodies);
 }
}
pxPose=beamPose;
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,snapshots,defaults,changed}));
if(failed&&!previewOnly)throw Error('mobile beam body audit failed: '+failed);
`,context);
