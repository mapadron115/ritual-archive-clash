// Actual AP Shot inputs and exact native rasters. Script-tested, not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake','desktop-ordinary'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const prior=Function(shared+'\nreturn {step,pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface,hud:pxHUDSurface,paint:pxPaintFighter};')();
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-apshot.js'),'utf8');
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='apshot')),art=CH[ch].arts.findIndex(a=>a.id==='apshot'),m=CH[ch].arts[art];
const ages=[6,7,10,11,13,14,16,17,25,26,31];
const expected=['clapw','apcompress','apcompress','apaim','apaim','apfire','apfire','aprecoil','aprecoil','clapseparate','clapseparate'];
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(slot,face,mode='hit',sweat=0){
 const S=newMatch(ch,ch,135);S.phase='fight';S.t=121;const f=S.f[slot],o=S.f[1-slot];
 f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:220);o.face=mode==='rear'?face:-face;f.ce=100;f.res=sweat;
 if(mode==='rear')f.dis=300;return {S,f,o};
}
function input(n,slot,mode){const b=[0,0];if(n===0)b[slot]=BTN['A'+(art+1)]<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===6)b[1-slot]=BTN.U<<INPUT_SHIFT;return b;}
function body(S,f,paint=pxPaintFighter){const before=JSON.stringify(S),s=new PixelSurface(640,360);paint(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
group('AP Shot compresses, aims, fires and recoils on the real tick-14 beam timeline',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face),seen=new Map();let releases=0;
  for(let n=0;n<80;n++){S.ev=[];step(S,input(n,slot,'hit'));if(f.st==='atk')seen.set(f.mt,pxPose(S,f));
   if(S.ev.some(e=>e.k==='beam')){releases++;assert.equal(f.mt,14);assert.equal(pxPose(S,f),'apfire');assert.equal(S.zones.filter(z=>z.k==='beam').length,1);}}
  assert.equal(releases,1);ages.forEach((age,i)=>assert.equal(seen.get(age),expected[i]));
 }
});
group('the shooting forearm follows the beam lane and the supporting hand stays at its wrist',()=>{
 const s=setup(0,1);startMove(s.f,'a'+art);s.f.mt=m.su;
 const old=PX_POSES[prior.pose(s.S,s.f)],p=PX_POSES[pxPose(s.S,s.f)],height=PX_KITS[ch].height;
 const error=Math.abs(p.a[1][1]*height+37),oldError=Math.abs(old.a[1][1]*height+37);
 assert(error<1,'shot hand misses the existing beam lane');assert(error<oldError-3);
 assert(Math.abs(p.a[0][1]-p.a[1][1])<=2,'shooting forearm is not horizontal');
 assert(Math.hypot(p.b[1][0]-p.a[1][0],p.b[1][1]-p.a[1][1])<=10,'support hand left the wrist');
 // Native skin/gauntlet pixels must meet the beam's centerline, in both directions/costumes.
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);startMove(f,'a'+art);f.mt=m.su;const b=body(S,f),x=Math.round(f.x/2),y=Math.round(f.y/2)-37;
  let touching=0;for(let u=23;u<=30;u++)if(b.data[(y*b.w+x+face*u)*4+3])touching++;
  assert(touching>=5,'native shooting hand floats away from beam');
 }
});
group('hit/guard/rear/jump and full sweat preserve costs, damage, release, recovery and frozen snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump'])for(const sweat of [0,6]){
  const {S,f,o}=setup(slot,face,mode,sweat),control=JSON.parse(JSON.stringify(S));let releases=0,recovered=false;
  for(let n=0;n<100;n++){
   S.ev=[];control.ev=[];const b=input(n,slot,mode);step(S,b);prior.step(control,b);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
   if(n===0){assert.equal(f.cd[art],m.cd);assert(f.ce>=100-m.cost&&f.ce<101-m.cost);}
   if(f.st==='atk'&&ages.includes(f.mt)){
    const snap=JSON.parse(JSON.stringify(S));snap.ev=[];const pose=pxPose(S,f);assert.equal(pxPose(snap,snap.f[slot]),pose);assert.deepEqual(body(S,f).data,body(snap,snap.f[slot]).data);
    if(!S.hitstop)for(const pause of ['freeze','hitstop','stop']){
     const frozen=JSON.parse(JSON.stringify(S)),ref=JSON.parse(JSON.stringify(S));if(pause==='stop'){frozen.stop={o:1-slot,t:3};ref.stop={o:1-slot,t:3};}else frozen[pause]=ref[pause]=3;
     for(let k=0;k<3;k++){step(frozen,[0,0]);prior.step(ref,[0,0]);assert.equal(frozen.f[slot].mt,f.mt);assert.equal(pxPose(frozen,frozen.f[slot]),pose);assert.equal(JSON.stringify(frozen),JSON.stringify(ref));holds++;}
    }
   }
   if(n>40&&f.st==='idle')recovered=true;
   if(S.ev.some(e=>e.k==='beam')){releases++;assert.equal(f.mt,m.su);assert.equal(f.res,0);const z=S.zones.find(z=>z.k==='beam');assert.equal(z.dur,12);assert.equal(z.w,12);assert.equal(z.x,f.x+f.face*46);assert.equal(z.y,f.y-74);}
  }
  assert.equal(releases,1);assert(recovered);assert.equal(f.hp,CH[ch].hp);
  const damage=CH[ch].hp-o.hp,wanted=mode==='rear'||mode==='jump'?0:85*(1+sweat*.08)*(mode==='guard'?.33:1);
  assert(Math.abs(damage-wanted)<1e-9,'unexpected damage '+damage+' vs '+wanted);
 }
});
group('other moves, early/late startup, interruptions, airborne states, portraits and Domains stay exact',()=>{
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,135),f=S.f[slot];S.phase='fight';
  for(let a=0;a<3;a++){startMove(f,'a'+a);const move=moveDef(f);for(let mt=0;mt<move.su+move.re;mt++){f.mt=mt;if(move.id==='apshot'&&mt>=7&&mt<26)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko'])for(const t of [1,7,15,35,60]){f.st=st;f.stT=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,S.f[1-slot]);for(const freeze of [60,40,20,0])for(const t of [1,20,32,40,72]){S.freeze=freeze;S.dom.t=t;f.st='cast';assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(const pose of prior.poses){assert.deepEqual(pxSprite(id,pose,!!slot).data,prior.sprite(id,pose,!!slot).data);defaults++;}
 }
 for(const age of ages)for(const slot of [0,1]){
  const {S,f,o}=setup(slot,1);startMove(f,'a'+art);f.mt=age;f.y=GROUND-50;assert.equal(pxPose(S,f),prior.pose(S,f));f.y=GROUND;f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  hit(S,1-slot,f,o.x,{dmg:32,stun:15});assert.equal(pxPose(S,f),prior.pose(S,f));newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
 }
});
group('all-stage native differences fit the exact body union; beam, HUD, bounds and soles remain intact',()=>{
 for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);S.stage=stage.id;const times=new Set(ages);
  for(let n=0;n<90&&times.size;n++){
   S.ev=[];step(S,input(n,slot,'hit'));if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
   const before=JSON.stringify(S),a=pxWorldSurface(S,quiet),b=prior.world(S,quiet);assert.equal(JSON.stringify(S),before);rasters+=2;
   assert.deepEqual(pxHUDSurface(S,[null,null],quiet).data,prior.hud(S,[null,null],quiet).data);
   const old=body(S,f,prior.paint),now=body(S,f);let changed=0,beamPixels=0;
   for(let p=0;p<a.data.length;p+=4){if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(old.data[p+3]||now.data[p+3],'world change outside body');}
    if(a.data[p]===255&&a.data[p+1]===138&&a.data[p+2]===42)beamPixels++;}
   if(S.zones.some(z=>z.k==='beam'))assert(beamPixels>100,'compressed beam lost');
   const revised=f.mt>=7&&f.mt<26;
   if(!baseline&&revised){assert(changed>150);changedScenes++;
    const s=pxSprite(ch,pxPose(S,f),!!slot),colors=new Set();let bottom=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const p=(y*s.w+x)*4;assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){assert(x>0&&x<s.w-1&&y>0&&y<s.h-1,'sprite cell clipped');assert(y<=PX_OY,'below floor');bottom=Math.max(bottom,y);colors.add(s.data.slice(p,p+3).join(','));}}
    assert.equal(bottom,PX_OY);assert(colors.size<=24);
   }else assert.equal(changed,0);
  }assert.equal(times.size,0);
 }
});
if(output)for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]){
 const {S,f}=setup(slot,face);S.stage=stage;const samples=[],times=new Set(ages),tag='v135-'+(baseline?'before':'after')+'-apshot-p'+(slot+1);
 let seed=135;const randomBase=Math.random;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
 for(let n=0;n<90&&times.size;n++){S.ev=[];step(S,input(n,slot,'hit'));for(const e of S.ev)fxEvent(S,e);fxTick();if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
  const scene=pxWorldSurface(S),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,FX),0,0);samples.push({scene,t:f.mt,pose:pxPose(S,f)});writePNG(output+'/'+tag+'-t'+f.mt+'.png',scene);
 }Math.random=randomBase;assert.equal(samples.length,ages.length);
 const strip=new PixelSurface(samples.length*640,386),bodies=new PixelSurface(samples.length*144,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,baseline}));if(failed&&!previewOnly)throw Error('apshot-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
