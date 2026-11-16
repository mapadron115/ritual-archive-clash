// Input-driven ordinary ground strike; generated native stills, not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-quake.js'),'utf8');
const prior=Function(shared+'\nreturn {step,pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface,hud:pxHUDSurface,paint:pxPaintFighter};')();
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0,wavePixels=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='quake')),art=CH[ch].arts.findIndex(a=>a.id==='quake'),m=CH[ch].arts[art];
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(slot,face,mode='hit'){
 const S=newMatch(ch,ch,131);S.phase='fight';S.t=120;const f=S.f[slot],o=S.f[1-slot];
 f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:220);o.face=mode==='rear'?face:-face;f.ce=100;
 if(mode==='rear')f.dis=300;return {S,f,o};
}
function input(n,slot,mode){const b=[0,0];if(n===0)b[slot]=BTN['A'+(art+1)]<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===14)b[1-slot]=BTN.U<<INPUT_SHIFT;return b;}
function body(S,f){const before=JSON.stringify(S),s=new PixelSurface(640,360);pxPaintFighter(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
function overlap(a,b){let common=0,union=0;for(let p=3;p<a.data.length;p+=4){common+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}return common/union;}
group('Gamma Quake raises the fist then strikes DOWN on the actual wave tick',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face),poses=new Map();let releases=0;
  for(let n=0;n<85;n++){S.ev=[];step(S,input(n,slot,'hit'));if(f.st==='atk')poses.set(f.mt,pxPose(S,f));if(S.ev.some(e=>e.k==='thud'&&e.x===f.x)){releases++;assert.equal(f.mt,20);assert.equal(pxPose(S,f),'quakeimpact','the wave still fires from an upward hook');assert.equal(S.proj.filter(p=>p.k==='wave').length,2);}}
  assert.equal(releases,1);
  for(const [t,pose] of [[9,'hookw'],[10,'quakecoil'],[19,'quakecoil'],[20,'quakeimpact'],[22,'quakeimpact'],[23,'quakepull'],[34,'quakepull'],[35,'quakerise'],[41,'quakerise']])assert.equal(poses.get(t),pose);
  for(const [a,b] of [['quakecoil','quakeimpact'],['quakeimpact','quakepull'],['quakepull','quakerise']])assert(overlap(pxSprite(ch,a,!!slot),pxSprite(ch,b,!!slot))<.8,'body barely moves '+a+' '+b);
 }
});
group('hit, rear hit, guard and jump preserve costs, release, full simulation and frozen snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump']){
  const {S,f,o}=setup(slot,face,mode),control=JSON.parse(JSON.stringify(S));let releases=0,recovered=false;
  for(let n=0;n<100;n++){
   S.ev=[];control.ev=[];const b=input(n,slot,mode);step(S,b);prior.step(control,b);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
   if(n===0){assert.equal(f.cd[art],300);assert(f.ce>=65&&f.ce<66);}
   if(f.st==='atk'){
    const pose=pxPose(S,f),snap=JSON.parse(JSON.stringify(S));snap.ev=[];assert.equal(pxPose(snap,snap.f[slot]),pose);
    if([10,19,20,22,23,34,35,41].includes(f.mt)){
     assert.deepEqual(body(S,f).data,body(snap,snap.f[slot]).data);
     // Only inject holds where normal hit-stop is absent; do not replace a real pause.
     if(!S.hitstop)for(const pause of ['freeze','hitstop','stop']){
      const frozen=JSON.parse(JSON.stringify(S)),reference=JSON.parse(JSON.stringify(S));
      if(pause==='stop'){frozen.stop={o:1-slot,t:3};reference.stop={...frozen.stop};}else frozen[pause]=reference[pause]=3;
      const mt=f.mt;
      for(let k=0;k<3;k++){step(frozen,[0,0]);prior.step(reference,[0,0]);assert.equal(frozen.f[slot].mt,mt);assert.equal(pxPose(frozen,frozen.f[slot]),pose);assert.equal(JSON.stringify(frozen),JSON.stringify(reference));holds++;}
     }
    }
   } else if(f.mt>=42)recovered=true;
   if(S.ev.some(e=>e.k==='thud'&&e.x===f.x)){releases++;assert.equal(f.mt,20);}
  }
  assert.equal(releases,1);assert(recovered);assert.equal(f.hp,CH[ch].hp);assert.equal(CH[ch].hp-o.hp,mode==='guard'?12:mode==='jump'?0:80);
 }
});
group('other arts, Domains, interruption, airborne states, portraits and old sprites stay exact',()=>{
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,131),f=S.f[slot],o=S.f[1-slot];S.phase='fight';
  for(let n=0;n<3;n++){startMove(f,'a'+n);const move=moveDef(f);for(let mt=0;mt<move.su+move.re;mt++){f.mt=mt;if(move.id==='quake'&&mt>=10)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko'])for(const t of [1,7,15,35,60]){f.st=st;f.stT=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,o);for(const freeze of [60,40,20,0])for(const t of [1,20,32,40,72]){S.freeze=freeze;S.dom.t=t;f.st='cast';assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  if(!previewOnly)for(const pose of prior.poses){assert.deepEqual(pxSprite(id,pose,!!slot).data,prior.sprite(id,pose,!!slot).data);defaults++;}
 }
 for(const mt of [10,19,20,23,35])for(const slot of [0,1]){
  const {S,f,o}=setup(slot,1);startMove(f,'a'+art);f.mt=mt;f.y=GROUND-50;assert.equal(pxPose(S,f),prior.pose(S,f));f.y=GROUND;f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  hit(S,1-slot,f,o.x,{dmg:32,stun:15});assert.equal(pxPose(S,f),prior.pose(S,f));newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
 }
});
group('native changes stay in the body, preserve HUD/waves, and meet the floor without clipping',()=>{
 for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);S.stage=stage.id;const times=new Set([9,10,19,20,22,23,34,35,41]);
  for(let n=0;n<85&&times.size;n++){
   S.ev=[];step(S,input(n,slot,'hit'));if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
   const before=JSON.stringify(S),a=pxWorldSurface(S,neutral),b=prior.world(S,neutral);assert.equal(JSON.stringify(S),before);rasters+=2;let changed=0;
   assert.deepEqual(pxHUDSurface(S,[null,null],neutral).data,prior.hud(S,[null,null],neutral).data);
   // Check the exact body union: this also permits erasing the old ready
   // pose's one-pixel calf overhang, while the NEW sprite must meet the floor.
   const oldBody=new PixelSurface(640,360),newBody=body(S,f);prior.paint(oldBody,S,f,null);
   for(let y=0;y<360;y++)for(let x=0;x<640;x++){const p=(y*640+x)*4;if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(oldBody.data[p+3]||newBody.data[p+3],'outside body '+x+','+y);}}
   if(!baseline&&f.mt>=10){assert(changed>500,'tiny change at native size');changedScenes++;}else assert.equal(changed,0);
   if(!baseline&&f.mt>=10){
    const s=pxSprite(ch,pxPose(S,f),!!slot),colors=new Set();let bottom=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const p=(y*s.w+x)*4;assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){assert(x>0&&x<s.w-1&&y>0&&y<s.h-1,'cell clipping');assert(y<=PX_OY,'below floor');bottom=Math.max(bottom,y);colors.add(s.data.slice(p,p+3).join(','));}}
    assert.equal(bottom,PX_OY,'floating feet');assert(colors.size<=24);
   }
   if(f.mt===23){const waves=new PixelSurface(640,360);for(const p of S.proj)if(p.k==='wave')pxProjectile(waves,p,S);for(let p=0;p<waves.data.length;p+=4)if(waves.data[p+3]&&waves.data.subarray(p,p+4).every((v,k)=>v===a.data[p+k]))wavePixels++;}
  }
  assert.equal(times.size,0);
 }
 assert(wavePixels>300,'travelling ground waves hidden');
});
if(output)for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]){
 const {S,f}=setup(slot,face);S.stage=stage;const samples=[],times=new Set([9,10,19,20,23,35,41]);const tag='v131-'+(baseline?'before':'after')+'-quake-p'+(slot+1)+'-'+stage;
 let fxSeed=131;const randomBase=Math.random;Math.random=()=>((fxSeed=(fxSeed*1664525+1013904223)>>>0)/4294967296);
 FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
 for(let n=0;n<85&&times.size;n++){S.ev=[];step(S,input(n,slot,'hit'));for(const e of S.ev)fxEvent(S,e);fxTick();if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
  const scene=pxWorldSurface(S),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,FX),0,0);samples.push({scene,t:f.mt,pose:pxPose(S,f)});writePNG(output+'/'+tag+'-t'+f.mt+'.png',scene);
 }
 Math.random=randomBase;assert.equal(samples.length,7);
 const strip=new PixelSurface(4480,386),bodies=new PixelSurface(1008,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});
 writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,wavePixels,baseline}));if(failed&&!previewOnly)throw Error('quake-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
