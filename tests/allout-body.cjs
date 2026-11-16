// Input-driven Maximum load/rush audit. Native renderer stills, never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const maximum=fs.readFileSync(path.join(root,'src/desktop-maximum.js'),'utf8');
// Keep Nuclear Shell's approved adapter, omitting only this version's allout branch.
const old=maximum.replace(/  if\(d&&d.o===f.i&&d.k==='allout'[^\n]*\n    return [^\n]*\n/,'');
const prior=Function(shared+'\n'+old+'\nreturn {pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface};')();
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+(baseline?old:maximum)+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(slot,face,distance=500){const S=newMatch(12,12,125);S.phase='fight';S.t=120;const f=S.f[slot],o=S.f[1-slot];f.x=face>0?100:1180;f.face=face;o.x=f.x+face*distance;o.face=-face;f.gauge=100;return {S,f,o};}
function input(n,slot,guard){const b=[0,0];if(n===0)b[slot]=BTN.DOM<<INPUT_SHIFT;if(guard)b[1-slot]=BTN.G;return b;}
function body(S,f){const before=JSON.stringify(S),s=new PixelSurface(640,360);pxPaintFighter(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
function overlap(a,b){let common=0,union=0;for(let p=3;p<a.data.length;p+=4){common+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}return common/union;}

group('real load and travelling rush use distinct bodies before unchanged contact',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face),poses=new Map();let shot=0;
  for(let n=0;n<145;n++){S.ev=[];step(S,input(n,slot));if(!S.dom)break;if(!S.freeze)poses.set(S.dom.t,pxPose(S,f));if(S.ev.some(e=>e.k==='nuke')){shot++;assert.equal(S.dom.t,35);assert.equal(pxPose(S,f),'punch');}}
  assert.equal(shot,1);assert.notEqual(poses.get(23),poses.get(24),'one static crouch covers charge and rush');
  assert.equal(poses.get(11),'hookw');assert.equal(poses.get(12),'alloutcoil');assert.equal(poses.get(23),'alloutcoil');assert.equal(poses.get(24),'alloutdrive');assert.equal(poses.get(34),'alloutdrive');assert.equal(poses.get(35),'punch');assert.equal(poses.get(40),'punchre');assert.equal(poses.get(48),'ready');
  for(const [a,b] of [['hookw','alloutcoil'],['alloutcoil','alloutdrive'],['alloutdrive','punch']])assert(overlap(pxSprite(12,a,!!slot),pxSprite(12,b,!!slot))<.72,'indistinct '+a+'/'+b);
 }
});

group('close, travelling, guarded and whiff timelines preserve full state and frozen snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const distance of [90,500,950])for(const guard of [false,true]){
  const {S,f,o}=setup(slot,face,distance),control=JSON.parse(JSON.stringify(S));let shot=0;
  for(let n=0;n<150;n++){
   S.ev=[];control.ev=[];const b=input(n,slot,guard);step(S,b);step(control,b);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
   if(n===0){assert.equal(f.gauge,0);assert.equal(f.domUsed,1);}
   if(S.dom&&f.st==='cast'){
    const pose=pxPose(S,f),a=body(S,f),snapshot=JSON.parse(JSON.stringify(S));snapshot.ev=[];assert.equal(pxPose(snapshot,snapshot.f[slot]),pose);assert.deepEqual(body(snapshot,snapshot.f[slot]).data,a.data);
    if(!S.freeze&&[12,23,24,34].includes(S.dom.t))for(const pause of ['hitstop','freeze']){
     S[pause]=control[pause]=3;const dt=S.dom.t;
     for(let k=0;k<3;k++){step(S,[0,0]);step(control,[0,0]);assert.equal(S.dom.t,dt);assert.equal(pxPose(S,f),pose);assert.equal(JSON.stringify(S),JSON.stringify(control));holds++;}
    }
   }
   if(S.ev.some(e=>e.k==='nuke')){shot++;assert.equal(S.dom.t,distance===90?24:35);assert.equal(pxPose(S,f),'punch');assert.equal(f.ce,0);assert.equal(f.armor,0);}
   if(!S.dom&&n>0)break;
  }
  assert.equal(shot,distance===950?0:1);assert.equal(CH[o.ch].hp-o.hp,distance===950?0:guard?120:300);assert.equal(f.armor,0);
 }
});

group('other Domains, interruption, portraits, ordinary Rock and old sprite pixels stay exact',()=>{
 for(let ch=0;ch<15;ch++)for(const slot of [0,1]){
  const S=newMatch(ch,ch,125),f=S.f[slot],o=S.f[1-slot];S.phase='fight';f.gauge=100;startDomain(S,f,o);
  for(const freeze of [60,40,20,0])for(const t of [1,11,12,23,24,34,35,39,40,48])for(const done of [0,1]){
   S.freeze=freeze;S.dom.t=t;S.dom.done=done;f.st='cast';if(ch!==12||t<12||t>=40||done){assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  }
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko']){f.st=st;f.stT=20;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(let n=0;n<3;n++){startMove(f,'a'+n);const m=moveDef(f);for(let mt=0;mt<m.su+m.re;mt++){f.mt=mt;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  f.st='cast';S.dom={o:1-slot,k:'allout',t:24};assert.equal(pxPose(S,f),prior.pose(S,f));S.dom=null;assert.equal(pxPose(S,f),prior.pose(S,f));f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  if(!previewOnly)for(const pose of prior.poses){assert.deepEqual(pxSprite(ch,pose,!!slot).data,prior.sprite(ch,pose,!!slot).data);defaults++;}
 }
 for(const slot of [0,1]){const {S,f,o}=setup(slot,1);startDomain(S,f,o);S.freeze=0;S.dom.t=24;o.gauge=100;startDomain(S,o,f);assert.equal(S.dom,null);assert.equal(pxPose(S,f),prior.pose(S,f));}
});

group('native world changes stay inside the charging or travelling body, above the floor',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);S.stage=slot?'gallery':'courtyard';const seen=new Set();
  for(let n=0;n<145;n++){
   S.ev=[];step(S,input(n,slot));if(!S.dom)break;const t=S.dom.t;
   if(S.freeze||![11,12,23,24,30,34,35,40,48].includes(t)||seen.has(t))continue;seen.add(t);
   const before=JSON.stringify(S),a=pxWorldSurface(S,neutral),b=prior.world(S,neutral);assert.equal(JSON.stringify(S),before);rasters+=2;let changed=0;
   for(let y=0;y<360;y++)for(let x=0;x<640;x++){const p=(y*640+x)*4;if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(Math.abs(x-f.x/2)<72&&y>=f.y/2-128&&y<=f.y/2+3,'outside body '+x+','+y);}}
   if(!baseline&&t>=12&&t<35){assert(changed>500,'tiny body change');changedScenes++;const sprite=body(S,f);for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(sprite.data[(y*640+x)*4+3])assert(y<=GROUND/2&&y>185&&Math.abs(x-f.x/2)<71,'clipped or below floor');}else assert.equal(changed,0);
  }
  assert.equal(seen.size,9);
 }
});

if(output)for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]){
 const {S,f}=setup(slot,face);S.stage=stage;const samples=[],times=new Set([11,12,23,24,30,34,35,40]);const tag='v125-'+(baseline?'before':'after')+'-allout-p'+(slot+1)+'-'+stage;
 for(let n=0;n<145;n++){S.ev=[];step(S,input(n,slot));if(!S.dom)break;if(S.freeze||!times.has(S.dom.t))continue;times.delete(S.dom.t);
  const scene=pxWorldSurface(S,neutral),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,neutral),0,0);samples.push({scene,t:S.dom.t,pose:pxPose(S,f)});writePNG(output+'/'+tag+'-t'+S.dom.t+'.png',scene);
 }
 const strip=new PixelSurface(5120,386),bodies=new PixelSurface(1152,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(12,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});
 writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,baseline}));if(failed&&!previewOnly)throw Error('allout-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
