// Input-driven Convergence bodies; native stills, never observed motion/play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const shared=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-convergence.js'),'utf8');
const prior=Function(shared+'\nreturn {pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface,hud:pxHUDSurface,charge:pxConvergenceCharge};')();
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0,chargeScenes=0,minBright=Infinity;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.dom.kind==='bloodsweep');
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(slot,face,mode='front'){
 const foe=mode==='swap'?CH.findIndex(c=>c.arts[0].id==='boogie'):ch;
 const S=newMatch(slot?foe:ch,slot?ch:foe,129);S.phase='fight';S.t=120;
 const f=S.f[slot],o=S.f[1-slot];f.x=face>0?380:900;f.face=face;o.x=f.x+face*(mode==='rear'?-260:330);o.face=-face;f.gauge=100;if(mode==='rear')f.dis=300;return {S,f,o};
}
function input(n,slot,mode,S){const b=[0,0];if(n===0)b[slot]=BTN.DOM<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='swap'&&!S.freeze&&S.dom?.t===12)b[1-slot]=BTN.A1<<INPUT_SHIFT;return b;}
function body(S,f){const before=JSON.stringify(S),s=new PixelSurface(640,360);pxPaintFighter(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
function overlap(a,b){let common=0,union=0;for(let p=3;p<a.data.length;p+=4){common+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}return common/union;}
group('late charge folds and aims before the existing tick-40 beam',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face),poses=new Map();let shots=0;
  for(let n=0;n<160;n++){S.ev=[];step(S,input(n,slot,'front',S));if(!S.dom)break;if(!S.freeze)poses.set(S.dom.t,pxPose(S,f));if(S.ev.some(e=>e.k==='nuke')){shots++;assert.equal(S.dom.t,40);assert.equal(pxPose(S,f),'cannon');}}
  assert.equal(shots,1);assert.notEqual(poses.get(31),poses.get(32),'twenty late-charge ticks still hold one body');
  for(const [t,pose] of [[19,'cannonw'],[20,'convergencefold'],[31,'convergencefold'],[32,'convergenceaim'],[39,'convergenceaim'],[40,'cannon'],[45,'cannonre'],[53,'cannonsettle']])assert.equal(poses.get(t),pose);
  for(const [a,b] of [['cannonw','convergencefold'],['convergencefold','convergenceaim'],['convergenceaim','cannon']])assert(overlap(pxSprite(ch,a,!!slot),pxSprite(ch,b,!!slot))<.75,'indistinct '+a+'/'+b);
  for(const pose of ['convergencefold','convergenceaim']){
   const sprite=pxSprite(ch,pose,!!slot),colors=new Set();
   for(let y=0;y<sprite.h;y++)for(let x=0;x<sprite.w;x++){const p=(y*sprite.w+x)*4,alpha=sprite.data[p+3];assert(alpha===0||alpha===255,'soft alpha');if(alpha){assert(x>0&&x<sprite.w-1&&y>0&&y<sprite.h-1,'cell clipping');colors.add(sprite.data.slice(p,p+3).join(','));}}
   assert(colors.size<=24,'palette expanded');
  }
 }
});
group('hit, guard, rear miss and swap retain outcomes, costs and frozen snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['front','guard','rear','swap']){
  const {S,f,o}=setup(slot,face,mode),control=JSON.parse(JSON.stringify(S));let shots=0;
  for(let n=0;n<190;n++){
   S.ev=[];control.ev=[];const b=input(n,slot,mode,S);step(S,b);step(control,b);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
   if(n===0){assert.equal(f.gauge,0);assert.equal(f.domUsed,1);}
   if(S.dom&&f.st==='cast'){
    const pose=pxPose(S,f),a=body(S,f),snapshot=JSON.parse(JSON.stringify(S));snapshot.ev=[];assert.equal(pxPose(snapshot,snapshot.f[slot]),pose);assert.deepEqual(body(snapshot,snapshot.f[slot]).data,a.data);
    if(!S.freeze&&[20,31,32,39].includes(S.dom.t))for(const pause of ['hitstop','freeze']){
     S[pause]=control[pause]=3;const dt=S.dom.t;
     for(let k=0;k<3;k++){step(S,[0,0]);step(control,[0,0]);assert.equal(S.dom.t,dt);assert.equal(pxPose(S,f),pose);assert.equal(JSON.stringify(S),JSON.stringify(control));holds++;}
    }
   }
   if(S.ev.some(e=>e.k==='nuke')){shots++;assert.equal(S.dom.t,40);assert.equal(pxPose(S,f),'cannon');assert(S.zones.some(z=>z.k==='beam'&&z.t===0));}
   if(!S.dom&&n>0)break;
  }
  assert.equal(shots,1);assert.equal(CH[o.ch].hp-o.hp,mode==='front'?240:mode==='guard'?96:0);assert.equal(f.hp,CH[f.ch].hp);
 }
});
group('other Domains, ordinary arts, interruptions and previous sprites stay exact',()=>{
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,129),f=S.f[slot],o=S.f[1-slot];S.phase='fight';f.gauge=100;startDomain(S,f,o);
  for(const freeze of [60,40,20,0])for(const t of [1,19,20,31,32,39,40,45,53,65,70]){
   S.freeze=freeze;S.dom.t=t;f.st='cast';if(id!==ch||t<20||t>=40){assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  }
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko']){f.st=st;f.stT=20;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(let n=0;n<3;n++){startMove(f,'a'+n);const m=moveDef(f);for(let mt=0;mt<m.su+m.re;mt++){f.mt=mt;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  f.st='cast';S.dom={o:1-slot,k:'bloodsweep',t:32};assert.equal(pxPose(S,f),prior.pose(S,f));S.dom=null;assert.equal(pxPose(S,f),prior.pose(S,f));f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
  if(!previewOnly)for(const pose of prior.poses){assert.deepEqual(pxSprite(id,pose,!!slot).data,prior.sprite(id,pose,!!slot).data);defaults++;}
 }
 for(const slot of [0,1]){const {S,f,o}=setup(slot,1);startDomain(S,f,o);S.freeze=0;S.dom.t=32;o.gauge=100;startDomain(S,o,f);assert.equal(S.dom,null);assert.equal(pxPose(S,f),prior.pose(S,f));}
});
group('native differences stay within body; HUD, floor and sprite bounds hold',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);S.stage=slot?'gallery':'courtyard';const seen=new Set();
  for(let n=0;n<170;n++){
   S.ev=[];step(S,input(n,slot,'front',S));if(!S.dom)break;const t=S.dom.t;
   if(S.freeze||![19,20,31,32,39,40,45,53].includes(t)||seen.has(t))continue;seen.add(t);
   const before=JSON.stringify(S),a=pxWorldSurface(S,neutral),b=prior.world(S,neutral);assert.equal(JSON.stringify(S),before);rasters+=2;let changed=0;
   assert.deepEqual(pxHUDSurface(S,[null,null],neutral).data,prior.hud(S,[null,null],neutral).data);
   for(let y=0;y<360;y++)for(let x=0;x<640;x++){const p=(y*640+x)*4;if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(Math.abs(x-f.x/2)<72&&y>=f.y/2-128&&y<=f.y/2+3,'outside body '+x+','+y);}}
   if(!baseline&&t>=20&&t<40){assert(changed>500,'tiny body change');changedScenes++;const sprite=new PixelSurface(640,360);sprite.blit(pxSprite(ch,pxPose(S,f),!!slot),Math.round(f.x/2)-(f.face<0?79:64),Math.round(f.y/2)-120,1,f.face<0);rasters++;for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(sprite.data[(y*640+x)*4+3])assert(y<=GROUND/2&&y>185&&Math.abs(x-f.x/2)<71,'clipped or below floor '+x+','+y+' at '+t);}else assert.equal(changed,0);
  }
  assert.equal(seen.size,8);
 }
});
group('unchanged gathering blood stays visible around both late-charge bodies',()=>{
 for(const stage of PX_STAGES)for(const slot of [0,1])for(const age of [20,31,32,39]){
  const {S,f}=setup(slot,slot?-1:1);S.stage=stage.id;
  for(let n=0;n<170;n++){S.ev=[];step(S,input(n,slot,'front',S));if(!S.freeze&&S.dom?.t===age)break;}
  assert.equal(S.dom.t,age);const a=new PixelSurface(640,360),b=new PixelSurface(640,360),before=JSON.stringify(S);
  pxConvergenceCharge(a,S,f);prior.charge(b,S,f);assert.deepEqual(a.data,b.data);
  const world=pxWorldSurface(S,neutral);world.blit(pxHUDSurface(S,[null,null],neutral),0,0);let bright=0;
  for(let p=0;p<a.data.length;p+=4)if(a.data[p+3]&&a.data[p]>230&&a.data[p+1]>160&&a.data.subarray(p,p+4).every((v,k)=>v===world.data[p+k]))bright++;
  assert(bright>=60,'body hides gathering blood: '+bright);assert.equal(JSON.stringify(S),before);minBright=Math.min(minBright,bright);chargeScenes++;rasters++;
 }
});
if(output)for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]){
 const {S,f}=setup(slot,face);S.stage=stage;const samples=[],times=new Set([19,20,31,32,39,40,45,53]);const tag='v129-'+(baseline?'before':'after')+'-convergence-p'+(slot+1)+'-'+stage;
 for(let n=0;n<170;n++){S.ev=[];step(S,input(n,slot,'front',S));if(!S.dom)break;if(S.freeze||!times.has(S.dom.t))continue;times.delete(S.dom.t);
  const scene=pxWorldSurface(S,neutral),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,neutral),0,0);samples.push({scene,t:S.dom.t,pose:pxPose(S,f)});writePNG(output+'/'+tag+'-t'+S.dom.t+'.png',scene);
 }
 const strip=new PixelSurface(5120,386),bodies=new PixelSurface(1152,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});
 writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,chargeScenes,minBright,baseline}));if(failed&&!previewOnly)throw Error('convergence-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
