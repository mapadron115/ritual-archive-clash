// Actual Nail Projectile inputs and native raster comparisons; script-tested, not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake','desktop-ordinary','desktop-apshot','desktop-piercing','desktop-contract','desktop-blast','desktop-granite','desktop-red','desktop-blue','desktop-flame','desktop-grape','desktop-guided','desktop-applause'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const prior=Function(shared+'\nreturn {step,pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface,hud:pxHUDSurface,paint:pxPaintFighter};')();
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-nail.js'),'utf8');
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='nail')),art=CH[ch].arts.findIndex(a=>a.id==='nail'),m=CH[ch].arts[art];
const ages=[2,4,5,8,9,11,12,14,15,17,18,20];
const expected=['throww','throww','nailraise','nailraise','naildrive','naildrive','nailfollow','nailfollow','nailpull','nailpull','nailsettle','nailsettle'];
const bytes=s=>Buffer.from(s.data.buffer,s.data.byteOffset,s.data.byteLength);
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.stack);}}
function setup(slot,face,mode='hit',low=false){
 const S=newMatch(ch,ch,157);S.phase='fight';S.t=121;const f=S.f[slot],o=S.f[1-slot];
 f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:mode==='far'?800:mode==='wall'?100:220);o.face=mode==='rear'?face:-face;f.ce=100;if(low)f.hp=200;
 if(mode==='wall'){o.x=face>0?RIGHT-1:LEFT+1;f.x=o.x-face*100;}if(mode==='rear')f.dis=300;return {S,f,o};
}
function input(n,slot,mode){const b=[0,0];if(n===0)b[slot]=BTN.A1<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===0)b[1-slot]=BTN.U<<INPUT_SHIFT;return b;}
function body(S,f,paint=pxPaintFighter){const before=JSON.stringify(S),s=new PixelSurface(640,360);paint(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
group('actual inputs raise the hammer, drive on the two-nail release, follow through and return',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face),seen=new Map();let releases=0;
  for(let n=0;n<85;n++){S.ev=[];step(S,input(n,slot,'hit'));if(f.st==='atk')seen.set(f.mt,pxPose(S,f));
   if(S.ev.some(e=>e.k==='whoosh')){releases++;assert.equal(f.mt,9);assert.equal(S.proj.length,2);assert.equal(pxPose(S,f),'naildrive');}}
  assert.equal(releases,1);ages.forEach((age,i)=>assert.equal(seen.get(age),expected[i]));
 }
});
group('hammer load clears the face, the drive crosses forward and down, the hand withdraws',()=>{
 const {S,f}=setup(0,1);startMove(f,'a0');const [load,drive,follow,pull,settle]=[5,9,12,15,18].map(mt=>{f.mt=mt;return PX_POSES[pxPose(S,f)];});
 assert(load.a[1][0]<load.h[0]-18,'hammer load covers face');assert(load.a[1][1]<load.h[1],'no raised hammer');
 assert(drive.a[1][0]-load.a[1][0]>=55,'no forward hammer drive');assert(drive.a[1][1]-load.a[1][1]>=24,'no downward strike');
 assert(follow.a[1][1]>drive.a[1][1]+12,'no follow-through');assert(pull.a[1][0]<follow.a[1][0]-15,'no withdrawal');assert(settle.h[1]<follow.h[1]-5,'no rise');
 for(const p of [drive,follow,pull,settle]){assert.deepEqual(p.l[1],load.l[1]);assert.deepEqual(p.r[1],load.r[1]);}
});
group('hit/guard/rear/jump/far/wall/infinity preserve exact two-nail trajectories, costs, damage and frozen snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','guard','rear','jump','far','wall','infinity'])for(const low of [false,true]){
  const {S,f,o}=setup(slot,face,mode,low);if(mode==='infinity')o.inf=108;
  const control=JSON.parse(JSON.stringify(S));let releases=0,recovered=false;
  for(let n=0;n<100;n++){
   S.ev=[];control.ev=[];const b=input(n,slot,mode);step(S,b);prior.step(control,b);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
   if(n===0){assert.equal(f.cd[art],50);assert(f.ce>=88&&f.ce<89);}
   if(S.ev.some(e=>e.k==='whoosh')){releases++;assert.equal(f.mt,9);assert.equal(S.proj.length+S.ev.filter(e=>['hit','block','inf'].includes(e.k)).length,2);for(const p of S.proj){assert.equal(p.k,'nail');assert.equal(p.vx,face*21);assert.equal(Math.abs(p.vy),.6);assert.equal(p.dmg,24);assert.equal(p.nail,1);}}
   if(f.st==='atk'&&ages.includes(f.mt)){
    const snap=JSON.parse(JSON.stringify(S));snap.ev=[];assert.equal(pxPose(snap,snap.f[slot]),pxPose(S,f));assert.deepEqual(bytes(body(S,f)),bytes(body(snap,snap.f[slot])));
    if(!S.hitstop)for(const pause of ['freeze','hitstop','stop']){
     const frozen=JSON.parse(JSON.stringify(S)),ref=JSON.parse(JSON.stringify(S));if(pause==='stop'){frozen.stop={o:1-slot,t:3};ref.stop={o:1-slot,t:3};}else frozen[pause]=ref[pause]=3;
     for(let k=0;k<3;k++){step(frozen,[0,0]);prior.step(ref,[0,0]);assert.equal(frozen.f[slot].mt,f.mt);assert.equal(pxPose(frozen,frozen.f[slot]),pxPose(S,f));assert.equal(JSON.stringify(frozen),JSON.stringify(ref));holds++;}
    }
   }
   if(n>30&&f.st==='idle')recovered=true;
  }
  assert.equal(releases,1);assert(recovered);assert.equal(f.hp,low?200:CH[ch].hp);
  if(mode==='hit'){assert(Math.abs(o.hp-(CH[ch].hp-45.12))<1e-9,'hit damage slot '+slot+' facing '+face);assert.equal(o.nails,2,'embedded nails slot '+slot+' facing '+face);}if(mode==='rear'||mode==='infinity')assert.equal(o.hp,CH[ch].hp);
 }
});
group('all other moves, initial wind-up, interruptions, airborne states, portraits and Domains stay exact',()=>{
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,157),f=S.f[slot];S.phase='fight';
  for(let a=0;a<3;a++){startMove(f,'a'+a);const move=moveDef(f);for(let mt=0;mt<move.su+move.re;mt++){f.mt=mt;if(move.id==='nail'&&mt>=5)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko'])for(const t of [1,7,15,35,60]){f.st=st;f.stT=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,S.f[1-slot]);for(const freeze of [60,40,20,0])for(const t of [1,20,32,40,72]){S.freeze=freeze;S.dom.t=t;f.st='cast';assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(const pose of prior.poses){assert.deepEqual(bytes(pxSprite(id,pose,!!slot)),bytes(prior.sprite(id,pose,!!slot)));defaults++;}
 }
 for(const age of ages)for(const slot of [0,1]){
  const {S,f,o}=setup(slot,1);startMove(f,'a0');f.mt=age;f.y=GROUND-50;assert.equal(pxPose(S,f),prior.pose(S,f));f.y=GROUND;f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  hit(S,1-slot,f,o.x,{dmg:32,stun:15});assert.equal(pxPose(S,f),prior.pose(S,f));newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
 }
});
group('native scenes on every stage change only inside the body; HUD, hard alpha, hammer and soles stay intact',()=>{
 for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);S.stage=stage.id;const times=new Set(ages);
  for(let n=0;n<85&&times.size;n++){
   S.ev=[];step(S,input(n,slot,'hit'));if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
   const before=JSON.stringify(S),a=pxWorldSurface(S,quiet),b=prior.world(S,quiet);assert.equal(JSON.stringify(S),before);rasters+=2;
   assert.deepEqual(bytes(pxHUDSurface(S,[null,null],quiet)),bytes(prior.hud(S,[null,null],quiet)));
   const old=body(S,f,prior.paint),now=body(S,f);let changed=0;
   for(let p=0;p<a.data.length;p+=4)if(a.data[p]!==b.data[p]||a.data[p+1]!==b.data[p+1]||a.data[p+2]!==b.data[p+2]||a.data[p+3]!==b.data[p+3]){changed++;assert(old.data[p+3]||now.data[p+3],'world change outside body');}
   if(!baseline&&f.mt>=5){assert(changed>150);changedScenes++;
    const s=pxSprite(ch,pxPose(S,f),!!slot),colors=new Set();let bottom=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const p=(y*s.w+x)*4;assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){assert(x>0&&x<s.w-1&&y>0&&y<s.h-1,'sprite cell clipped');assert(y<=PX_OY,'below floor');bottom=Math.max(bottom,y);colors.add(s.data.slice(p,p+3).join(','));}}
    assert.equal(bottom,PX_OY);assert(colors.size<=24);
   }else assert.equal(changed,0);
  }assert.equal(times.size,0);
 }
});
if(output)for(const [slot,face,stage,mode] of [[0,1,'courtyard','hit'],[1,-1,'gallery','hit'],[0,1,'observatory','far'],[1,-1,'courtyard','far']]){
 const {S,f}=setup(slot,face,mode);S.stage=stage;const samples=[],times=new Set(ages),tag='v157-'+(baseline?'before':'after')+'-nail-p'+(slot+1)+(mode==='far'?'-whiff':'');
 let seed=157;const randomBase=Math.random;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
 for(let n=0;n<85&&times.size;n++){S.ev=[];step(S,input(n,slot,mode));for(const e of S.ev)fxEvent(S,e);fxTick();if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
  const scene=pxWorldSurface(S),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,FX),0,0);samples.push({scene,t:f.mt,pose:pxPose(S,f),face:f.face});writePNG(output+'/'+tag+'-t'+f.mt+'.png',scene);
 }Math.random=randomBase;assert.equal(samples.length,ages.length);
 const strip=new PixelSurface(samples.length*640,386),bodies=new PixelSurface(samples.length*144,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose,face:liveFace},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,liveFace<0);pxText(bodies,'T '+t+' / '+(liveFace>0?'RIGHT':'LEFT'),i*144+8,138,PX_LIGHT);});writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,baseline}));if(failed&&!previewOnly)throw Error('nail-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
