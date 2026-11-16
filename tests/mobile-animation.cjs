// Approved fighter adapter through the actual mobile HTML/pointer/main loop.
// Phone images are layout models, never browser screenshots or played motion.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {context,root,html}=require('./mobile.cjs'),png=require('./png.cjs');
const baseline=process.argv.includes('--animation-baseline'),previewOnly=process.argv.includes('--preview-only');
const out=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
if(out)fs.mkdirSync(out,{recursive:true});
const files=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation'];
context.desktop=Function(files.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n')+'\nreturn {pose:pxPose,world:pxWorldSurface};')();
Object.assign(context,{out,writePNG:png,animationBaseline:baseline,previewOnly});
assert(!html.includes('desktop-feedback.js'),'desktop HUD/input adapter must stay separate');
vm.runInContext(`
const mobileAnimationPose=pxPose;
const mobileOriginalPose=typeof desktopPoseBase==='function'?desktopPoseBase:pxPose;
let animationPassed=0,animationFailed=0,animationTicks=0,animationRasters=0,animationHolds=0,animationDefaults=0;
function audit(name,fn){try{fn();animationPassed++;console.log('PASS mobile animation:',name);}catch(e){animationFailed++;console.log('FAIL mobile animation:',name,e.message);}}
function samePixels(a,b){assert.equal(a.data.length,b.data.length);assert(a.data.every((v,i)=>v===b.data[i]),'raster differs');animationRasters++;}
function resetFX(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;FX.clock=0;}
function paintPose(S,slot){const body=new PixelSurface(640,360);pxPaintFighter(body,S,S.f[slot],null);return body;}
function parity(S,slot){const saved=JSON.stringify(S),f=S.f[slot],pose=pxPose(S,f);assert.equal(pose,desktop.pose(S,f),'phone lacks approved '+desktop.pose(S,f));
  const snap=JSON.parse(saved);snap.ev=[];assert.equal(pxPose(snap,snap.f[slot]),pose);samePixels(paintPose(S,slot),paintPose(snap,slot));
  assert.equal(JSON.stringify(S),saved,'renderer changed simulation');
}
audit('touch jab gives every build a snap, brace and rise in both facings',()=>{
  for(let ch=0;ch<15;ch++)for(const face of [-1,1]){
    fresh('host',ch);resetFX();G.S.seed=119;G.S.f[1]=newFighter(1,ch);const [a,b]=G.S.f;a.x=640;b.x=a.x+face*65;a.face=face;b.face=-face;
    pointer('pointerdown','P');pointer('pointerup','P');G.last=now;G.acc=0;
    const poses=new Set();let connected=false;
    for(let t=0;t<65;t++){advance();animationTicks++;if(b.st==='hit'){connected=true;poses.add(pxPose(G.S,b));parity(G.S,1);}if(connected&&b.st!=='hit')break;}
    assert(connected);assert.deepEqual([...poses],['hitreel','hitbrace','hitrise']);
  }
});
audit('three actual touch summons coil and lift exactly on tick twelve',()=>{
  for(let n=0;n<3;n++)for(const face of [-1,1]){
    fresh('host',3);resetFX();const f=G.S.f[0];f.x=640;f.face=face;G.S.f[1].x=f.x+face*400;
    pointer('pointerdown','A'+(n+1));pointer('pointerup','A'+(n+1));G.last=now;G.acc=0;let release=false;const seen=new Set();
    for(let t=0;t<60;t++){advance();animationTicks++;if(f.st==='atk'){seen.add(pxPose(G.S,f));parity(G.S,0);if(f.mt===12){assert.equal(pxPose(G.S,f),'summonseal');assert(n===2?G.S.zones.some(s=>s.k==='tongue'&&s.o===0):G.S.ents.some(s=>s.o===0));release=true;}}else if(release)break;}
    assert(release);assert.equal(seen.size,5);assert(seen.has('summoncoil'));assert.equal(f.st,'idle');
  }
});
audit('both slots hold through freezes and paint guest snapshots without events',()=>{
  for(const slot of [0,1])for(const state of ['hit','summon']){
    fresh('host',state==='hit'?14:3);resetFX();const S=G.S;S.f[slot]=newFighter(slot,state==='hit'?14:3);const f=S.f[slot];
    if(state==='hit'){f.st='hit';f.stT=15;}else {startMove(f,'a0');f.mt=12;}
    const expected=state==='hit'?'hitreel':'summonseal';assert.equal(pxPose(S,f),expected);
    for(const pause of ['hitstop','freeze','stop']){const copy=JSON.parse(JSON.stringify(S));if(pause==='stop')copy.stop={o:1-slot,t:3};else copy[pause]=3;
      const clock=state==='hit'?copy.f[slot].stT:copy.f[slot].mt;for(let t=0;t<3;t++){step(copy,[0,0]);assert.equal(state==='hit'?copy.f[slot].stT:copy.f[slot].mt,clock);assert.equal(pxPose(copy,copy.f[slot]),expected);parity(copy,slot);animationHolds++;}}
    netClose();const callbacks={},packets=[],conn={open:true,on(k,fn){callbacks[k]=fn;},send(p){packets.push(JSON.parse(JSON.stringify(p)));}};netWire(conn,'guest');callbacks.open();fresh('guest',state==='hit'?14:3);
    const snap=JSON.parse(JSON.stringify(S));snap.ev=[];callbacks.data({t:'s',s:snap,e:[]});const saved=JSON.stringify(snap);G.last=now;G.acc=0;advance();assert.equal(G.S,snap);assert.equal(JSON.stringify(G.S),saved);assert.equal(pxPose(G.S,G.S.f[slot]),expected);
    pointer('pointerdown','A1');pointer('pointerup','A1');advance();assert.equal(packets.filter(p=>p.t==='in').at(-1).b,BTN.A1<<INPUT_SHIFT);
  }
});
audit('native world matches desktop; changes stay inside the reacting body',()=>{
  const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const t of [15,8,3]){
    const S=newMatch(ch,ch,120);S.phase='fight';S.t=120;S.stage=slot?'gallery':'courtyard';const f=S.f[slot];f.st='hit';f.stT=t;
    pxPose=mobileOriginalPose;const before=pxWorldSurface(S,neutral);pxPose=mobileAnimationPose;const after=pxWorldSurface(S,neutral);samePixels(after,desktop.world(S,neutral));
    // The legacy hit's calf pixels reach up to three rows below the floor on
    // larger builds. Removing those pixels is part of loading planted poses.
    const body=paintPose(S,slot);assert(body.data.subarray((GROUND/2+1)*640*4).every(v=>v===0),'new calf below floor');
    let changes=0;for(let y=0;y<360;y++)for(let x=0;x<640;x++){const p=(y*640+x)*4;if(after.data.subarray(p,p+4).some((v,k)=>v!==before.data[p+k])){changes++;assert(Math.abs(x-f.x/2)<72&&y>=f.y/2-128&&y<=f.y/2+3,'changed outside body');}}
    assert(changes>200,'missing visible hit change');
  }
});
audit('unrelated art/state poses, phone HUD and controls stay exact',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]){
    fresh('host',ch);resetFX();const S=G.S;S.f[slot]=newFighter(slot,ch);const f=S.f[slot];
    for(const st of ['idle','walk','jump','guard','block','stun','down','ko','cast'])for(const t of [1,7,15,35]){f.st=st;f.stT=t;f.mt=t;assert.equal(pxPose(S,f),mobileOriginalPose(S,f));animationDefaults++;}
    for(let n=0;n<3;n++){startMove(f,'a'+n);const m=moveDef(f);for(let t=0;t<m.su+m.re;t++){f.mt=t;if(ch===3&&t>=6&&t<15)continue;assert.equal(pxPose(S,f),mobileOriginalPose(S,f));animationDefaults++;}}
    f.st='hit';f.y=GROUND-70;f.vy=-5;assert.equal(pxPose(S,f),mobileOriginalPose(S,f));f.y=GROUND;f.portrait=true;assert.equal(pxPose(S,f),'idle');delete f.portrait;
    const before=JSON.stringify(S);pxPose=mobileOriginalPose;const hud=mobileHUDSurface(S,labels());mobileUpdateControls(S);const view=JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes,MOBILE.views.get(b.dataset.input)?.status.textContent]));
    pxPose=mobileAnimationPose;samePixels(hud,mobileHUDSurface(S,labels()));mobileUpdateControls(S);assert.equal(JSON.stringify(buttons.map(b=>[b.dataset,b.style,b.attributes,MOBILE.views.get(b.dataset.input)?.status.textContent])),view);assert.equal(JSON.stringify(S),before);
  }
});
// Produce native scenes and phone-size models from matching snapshots, toggling
// only the approved pose selector. Fixed presentation clock keeps pairs fair.
if(out){
  const sets=[{name:'hit',ch:0,slot:1,times:[15,11,10,6,5,1]},...['dogs','nue','toad'].map((name,n)=>({name,ch:3,slot:0,n,times:[1,6,11,12,14,20]}))];
  for(const set of sets){const states=[];fresh('host',set.ch);resetFX();const S=G.S;S.stage=set.slot?'gallery':'courtyard';S.f[set.slot]=newFighter(set.slot,set.ch);const f=S.f[set.slot];f.x=set.slot?760:480;S.f[1-set.slot].x=set.slot?690:920;
    if(set.name==='hit')hit(S,0,f,S.f[0].x,{dmg:32,stun:15,kb:0});else startMove(f,'a'+set.n);
    for(let t=0;t<100&&states.length<6;t++){S.ev=[];step(S,[0,0]);const clock=set.name==='hit'?f.stT:f.mt;if(set.times.includes(clock)&&!states.some(s=>s.clock===clock)&&f.st===(set.name==='hit'?'hit':'atk'))states.push({clock,S:JSON.parse(JSON.stringify(S))});}
    assert.equal(states.length,6,'missed preview samples');
    for(const kind of ['before','after']){pxPose=kind==='before'?mobileOriginalPose:mobileAnimationPose;const strip=new PixelSurface(6*640,380);strip.rect(0,0,strip.w,strip.h,PX_INK);
      const phoneStrips=[[667,375],[844,390]].map(([w,h])=>({w,h,s:new PixelSurface(6*w,h+20)}));
      for(const [i,sample] of states.entries()){resetFX();G.S=sample.S;G.mode='host';const scene=pxWorldSurface(G.S);scene.blit(mobileHUDSurface(G.S,labels()),0,0);writePNG(out+'/v120-'+kind+'-'+set.name+'-t'+sample.clock+'.png',scene);strip.blit(scene,i*640,0);pxText(strip,set.name.toUpperCase()+' '+sample.clock+' / '+pxPose(G.S,G.S.f[set.slot]).toUpperCase(),i*640+8,367,PX_LIGHT);
        for(const {w,h,s} of phoneStrips){const model=makePreview(w,h,undefined,set.ch,100,{key:'G',prepare(S){Object.assign(S,JSON.parse(JSON.stringify(sample.S)));resetFX();},run(){}});writePNG(out+'/v120-'+kind+'-'+set.name+'-t'+sample.clock+'-'+w+'x'+h+'.png',model);s.blit(model,i*w,0);pxText(s,set.name.toUpperCase()+' '+sample.clock,i*w+8,h+5,PX_LIGHT);}
      }writePNG(out+'/v120-'+kind+'-'+set.name+'-native-strip.png',strip);for(const {w,h,s} of phoneStrips)writePNG(out+'/v120-'+kind+'-'+set.name+'-'+w+'x'+h+'-strip.png',s);
    }
  }
  pxPose=mobileAnimationPose;writePNG(out+'/v120-portrait-390x844.png',makePreview(390,844));
}
pxPose=mobileAnimationPose;
console.log(JSON.stringify({passed:animationPassed,failed:animationFailed,ticks:animationTicks,rasters:animationRasters,holds:animationHolds,defaults:animationDefaults,baseline:animationBaseline}));
if(animationFailed&&!previewOnly)throw Error('mobile animation audit failed: '+animationFailed);
`,context);
