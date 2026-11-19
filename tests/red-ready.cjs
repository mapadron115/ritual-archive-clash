// Actual Reversal Red inputs and exact native rasters. Script-tested, not played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake','desktop-ordinary','desktop-apshot','desktop-piercing','desktop-contract','desktop-blast','desktop-granite','desktop-red','desktop-blue','desktop-flame','desktop-grape','desktop-guided','desktop-applause','desktop-nail','desktop-paper','desktop-gum','desktop-stone','desktop-thunder','desktop-quake-ready','desktop-granite-ready'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const prior=Function(shared+'\nreturn {step,pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface,hud:pxHUDSurface,paint:pxPaintFighter};')();
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-red-ready.js'),'utf8');
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='red')),art=CH[ch].arts.findIndex(a=>a.id==='red'),m=CH[ch].arts[art];
const ages=[1,5,6,11,12,14,15,18,19,24,25,31];
const expected=['redready','redready','redcoil','redcoil','reddrive','reddrive','redrecoil','redrecoil','redrecover','redrecover','redsettle','redsettle'];
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(slot,face,mode='hit',low=false){
 const S=newMatch(ch,ch,145);S.phase='fight';S.t=121;const f=S.f[slot],o=S.f[1-slot];
 f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:mode==='far'?600:mode==='wall'?100:220);o.face=mode==='rear'?face:-face;f.ce=100;if(low)f.hp=200;if(mode==='wall'){o.x=face>0?RIGHT-1:LEFT+1;f.x=o.x-face*100;}
 if(mode==='rear')f.dis=300;return {S,f,o};
}
// Reversal Red launches 50 units forward; its projectile advances 17 on the same tick.
function input(n,slot,mode){const b=[0,0];if(n===0)b[slot]=BTN['A'+(art+1)]<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===0)b[1-slot]=BTN.U<<INPUT_SHIFT;return b;}
function body(S,f,paint=pxPaintFighter){const before=JSON.stringify(S),s=new PixelSurface(640,360);paint(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
group('Reversal Red coils, drives on tick twelve, recoils and recovers from actual inputs',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face),seen=new Map();let releases=0;
  for(let n=0;n<100;n++){S.ev=[];step(S,input(n,slot,'hit'));if(f.st==='atk')seen.set(f.mt,pxPose(S,f));
   if(S.ev.some(e=>e.k==='blast')){releases++;assert.equal(f.mt,12);assert.equal(pxPose(S,f),'reddrive');assert.equal(f.vx,0);}}
  assert.equal(releases,1);ages.forEach((age,i)=>assert.equal(seen.get(age),expected[i]));
 }
});
group('wide soles hold through preparation, release and final guard',()=>{
 for(const name of ['redready','redcoil','reddrive','redrecoil','redrecover','redsettle']){
  const p=PX_POSES[name];assert(p.planted);assert.deepEqual(p.l[1],[30,0]);assert.deepEqual(p.r[1],[-37,0]);
 }
 assert(PX_POSES.redsettle.a[1][1]<PX_POSES.redrecover.a[1][1]);
});
group('the palm drives forty native pixels into the launch lane, then the torso absorbs recoil',()=>{
 const {S,f}=setup(0,1);startMove(f,'a'+art);f.mt=11;const load=PX_POSES[pxPose(S,f)];f.mt=12;const push=PX_POSES[pxPose(S,f)],old=PX_POSES[prior.pose(S,f)];f.mt=15;const recoil=PX_POSES[pxPose(S,f)];
 assert(push.a[1][0]-load.a[1][0]>=40,'no palm drive');assert(push.h[0]-recoil.h[0]>=25,'no recoil silhouette');
 assert(Math.abs(push.a[1][1]*PX_KITS[ch].height+39)<1,'palm misses projectile lane');
 assert.deepEqual(old,push,'reviewed release changed');assert.deepEqual(load.l[1],push.l[1]);assert.deepEqual(push.r[1],recoil.r[1]);
 for(const slot of [0,1])for(const face of [-1,1]){const {S,f}=setup(slot,face);startMove(f,'a'+art);f.mt=12;const s=body(S,f);let touching=0;
  const x=Math.round(f.x/2)+face*34,y=Math.round(f.y/2)-39;
  for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(s.data[((y+dy)*640+x+dx)*4+3])touching++;
  assert(touching>25,'native palm misses launch lane');}
});
group('hit/guard/rear/jump/far/wall preserve projectile, costs, damage, recovery and frozen snapshots',()=>{
 for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump','far','wall'])for(const low of [false,true]){
  const {S,f,o}=setup(slot,face,mode,low),control=JSON.parse(JSON.stringify(S));let releases=0,recovered=false;
  for(let n=0;n<110;n++){
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
   if(S.ev.some(e=>e.k==='blast')){releases++;assert.equal(f.mt,m.su);assert.equal(f.vx,0);const p=S.proj.find(p=>p.k==='red');
    // A target only 100 units away consumes the shot on its launch tick.
    if(mode==='wall'){assert(!p);assert(S.ev.some(e=>e.k==='pop'&&e.a==='red'));}
    else {assert(p);assert.equal(p.x,f.x+face*67);assert.equal(p.y,f.y-78);assert.equal(p.vx,face*17);assert.equal(p.life,25);assert.equal(p.r,26);assert.equal(p.dmg,100);assert.equal(p.chip,.2);}}
  }
  assert.equal(releases,1);assert(recovered);assert.equal(f.hp,low?200:CH[ch].hp);
  const damage=CH[ch].hp-o.hp,wanted=['rear','jump','far'].includes(mode)?0:mode==='wall'?145:mode==='guard'?20:100;
  assert(Math.abs(damage-wanted)<1e-9,'unexpected '+mode+' damage '+damage+' vs '+wanted);
 }
});
group('other moves, early/late startup, interruptions, airborne states, portraits and Domains stay exact',()=>{
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,145),f=S.f[slot];S.phase='fight';
  for(let a=0;a<3;a++){startMove(f,'a'+a);const move=moveDef(f);for(let mt=0;mt<move.su+move.re;mt++){f.mt=mt;if(move.id==='red'&&(mt<6||mt>=25))continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko'])for(const t of [1,7,15,35,60]){f.st=st;f.stT=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,S.f[1-slot]);for(const freeze of [60,40,20,0])for(const t of [1,20,32,40,72]){S.freeze=freeze;S.dom.t=t;f.st='cast';assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(const pose of prior.poses){assert.deepEqual(pxSprite(id,pose,!!slot).data,prior.sprite(id,pose,!!slot).data);defaults++;}
 }
 for(const age of ages)for(const slot of [0,1]){
  const {S,f,o}=setup(slot,1);startMove(f,'a'+art);f.mt=age;f.y=GROUND-50;assert.equal(pxPose(S,f),prior.pose(S,f));f.y=GROUND;f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  hit(S,1-slot,f,o.x,{dmg:32,stun:15});assert.equal(pxPose(S,f),prior.pose(S,f));newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
 }
});
group('all-stage native differences fit the exact body union; projectile effects, HUD, bounds and soles remain intact',()=>{
 for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f}=setup(slot,face);S.stage=stage.id;const times=new Set(ages);
  for(let n=0;n<90&&times.size;n++){
   S.ev=[];step(S,input(n,slot,'hit'));if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
   const before=JSON.stringify(S),a=pxWorldSurface(S,quiet),b=prior.world(S,quiet);assert.equal(JSON.stringify(S),before);rasters+=2;
   assert.deepEqual(pxHUDSurface(S,[null,null],quiet).data,prior.hud(S,[null,null],quiet).data);
   const old=body(S,f,prior.paint),now=body(S,f);let changed=0;
   for(let p=0;p<a.data.length;p+=4){if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(old.data[p+3]||now.data[p+3],'world change outside body');}
    }
   
   const revised=(f.mt<6||f.mt>=25);
   if(!baseline&&revised){assert(changed>150);changedScenes++;
    const s=pxSprite(ch,pxPose(S,f),!!slot),colors=new Set();let bottom=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const p=(y*s.w+x)*4;assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){assert(x>0&&x<s.w-1&&y>0&&y<s.h-1,'sprite cell clipped');assert(y<=PX_OY,'below floor');bottom=Math.max(bottom,y);colors.add(s.data.slice(p,p+3).join(','));}}
    assert.equal(bottom,PX_OY);assert(colors.size<=24);
   }else assert.equal(changed,0);
  }assert.equal(times.size,0);
 }
});
if(output)for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]){
 const {S,f}=setup(slot,face);S.stage=stage;const samples=[],times=new Set(ages),tag='v168-'+(baseline?'before':'after')+'-red-p'+(slot+1);
 let seed=145;const randomBase=Math.random;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
 for(let n=0;n<90&&times.size;n++){S.ev=[];step(S,input(n,slot,'hit'));for(const e of S.ev)fxEvent(S,e);fxTick();if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
  const scene=pxWorldSurface(S),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,FX),0,0);samples.push({scene,t:f.mt,pose:pxPose(S,f)});writePNG(output+'/'+tag+'-t'+f.mt+'.png',scene);
 }Math.random=randomBase;assert.equal(samples.length,ages.length);
 const strip=new PixelSurface(samples.length*640,386),bodies=new PixelSurface(samples.length*144,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,baseline}));if(failed&&!previewOnly)throw Error('red-ready audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
