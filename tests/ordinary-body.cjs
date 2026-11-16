// Actual ordinary-art input timelines and native raster comparisons; not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation','desktop-maximum','desktop-convergence','desktop-quake'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const prior=Function(shared+'\nreturn {step,pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface,hud:pxHUDSurface,paint:pxPaintFighter};')();
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-ordinary.js'),'utf8');
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0;
const quiet={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
const ch=CH.findIndex(c=>c.arts.some(a=>a.id==='quake'));
const ages={quake:[9,10,19,20,23,35,41],thunderclap:[5,6,11,12,14,15,22,23,27]};
const expected={quake:['hookw','quakeopen','quakeopen','quakeimpact','quakepull','quakerise','quakerise'],thunderclap:['clapw','thunderopen','thunderopen','thunderclose','thunderclose','thunderpull','thunderpull','clapseparate','clapseparate']};
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(id,slot,face,mode='hit'){
 const art=CH[ch].arts.findIndex(a=>a.id===id),S=newMatch(ch,ch,133);S.phase='fight';S.t=120;
 const f=S.f[slot],o=S.f[1-slot];f.x=face>0?420:860;f.face=face;o.x=f.x+face*(mode==='rear'?-220:220);o.face=mode==='rear'?face:-face;f.ce=100;
 if(mode==='rear')f.dis=300;return {S,f,o,art,m:CH[ch].arts[art]};
}
function input(n,slot,art,mode,id){const b=[0,0];if(n===0)b[slot]=BTN['A'+(art+1)]<<INPUT_SHIFT;if(mode==='guard')b[1-slot]=BTN.G;if(mode==='jump'&&n===(id==='quake'?14:4))b[1-slot]=BTN.U<<INPUT_SHIFT;return b;}
function body(S,f,paint=pxPaintFighter){const before=JSON.stringify(S),s=new PixelSurface(640,360);paint(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
for(const id of ['quake','thunderclap'])group(id+' selects the new anticipation/contact bodies on its actual release timeline',()=>{
 for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f,art,m}=setup(id,slot,face),seen=new Map();let releases=0;
  for(let n=0;n<90;n++){S.ev=[];step(S,input(n,slot,art,'hit',id));if(f.st==='atk')seen.set(f.mt,pxPose(S,f));
   if(S.ev.some(e=>id==='quake'?e.k==='thud'&&e.x===f.x:e.k==='clap')){releases++;assert.equal(f.mt,m.su);assert.equal(pxPose(S,f),id==='quake'?'quakeimpact':'thunderclose');assert.equal(S.proj.filter(p=>p.k==='wave').length,id==='quake'?2:1);}}
  assert.equal(releases,1);ages[id].forEach((age,i)=>assert.equal(seen.get(age),expected[id][i]));
 }
});
group('raised Quake fist exposes the native face/hair; Thunder Clap has wide then joined palms',()=>{
 // A reference moves only the near arm below the head, preserving all head pixels.
 // Compare the actual native face/hair crop, rather than just joint coordinates.
 const current=baseline?'quakecoil':'quakeopen',p=PX_POSES[current];
 PX_POSES.quakehead={...p,a:[[20,-38],[34,-46]]};
 const ref=pxSprite(ch,'quakehead'),old=prior.sprite(ch,'quakecoil'),now=pxSprite(ch,current);
 const headColors=new Set([...PX_KITS[ch].skin,...PX_KITS[ch].hairCol,PX_LIGHT].map(c=>pxRGB(c).slice(0,3).join(',')));
 let oldVisible=0,visible=0,count=0;
 for(let y=PX_OY-91;y<=PX_OY-69;y++)for(let x=PX_OX-27;x<=PX_OX-5;x++){
  const at=(y*ref.w+x)*4;if(!ref.data[at+3]||!headColors.has(ref.data.slice(at,at+3).join(',')))continue;count++;
  if(ref.data.subarray(at,at+4).every((v,k)=>v===old.data[at+k]))oldVisible++;
  if(ref.data.subarray(at,at+4).every((v,k)=>v===now.data[at+k]))visible++;
 }
 console.log(JSON.stringify({facePixels:count,oldVisible,visible}));assert(visible/count>.98,'raised arm still covers head');assert(visible>oldVisible+80,'face visibility did not improve');
 delete PX_POSES.quakehead;
 const open=PX_POSES.thunderopen,closed=PX_POSES.thunderclose;
 assert(open.a[1][0]-open.b[1][0]>80);assert.deepEqual(closed.a[1],closed.b[1]);
});
group('real hit/rear/guard/jump input preserves simulation, cost, cooldown and release; snapshots hold',()=>{
 for(const id of ['quake','thunderclap'])for(const slot of [0,1])for(const face of [-1,1])for(const mode of ['hit','rear','guard','jump']){
  const {S,f,o,art,m}=setup(id,slot,face,mode),control=JSON.parse(JSON.stringify(S));let releases=0,recovered=false;
  for(let n=0;n<100;n++){
   S.ev=[];control.ev=[];const b=input(n,slot,art,mode,id);step(S,b);prior.step(control,b);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
   if(n===0){assert.equal(f.cd[art],m.cd);assert(f.ce>=100-m.cost&&f.ce<101-m.cost);}
   if(f.st==='atk'&&ages[id].includes(f.mt)){
    const snap=JSON.parse(JSON.stringify(S));snap.ev=[];const pose=pxPose(S,f);assert.equal(pxPose(snap,snap.f[slot]),pose);assert.deepEqual(body(S,f).data,body(snap,snap.f[slot]).data);
    if(!S.hitstop)for(const pause of ['freeze','hitstop','stop']){
     const frozen=JSON.parse(JSON.stringify(S)),ref=JSON.parse(JSON.stringify(S));if(pause==='stop'){frozen.stop={o:1-slot,t:3};ref.stop={o:1-slot,t:3};}else frozen[pause]=ref[pause]=3;
     for(let k=0;k<3;k++){step(frozen,[0,0]);prior.step(ref,[0,0]);assert.equal(frozen.f[slot].mt,f.mt);assert.equal(pxPose(frozen,frozen.f[slot]),pose);assert.equal(JSON.stringify(frozen),JSON.stringify(ref));holds++;}
    }
   }else if(f.mt>=m.su+m.re)recovered=true;
   if(S.ev.some(e=>id==='quake'?e.k==='thud'&&e.x===f.x:e.k==='clap')){releases++;assert.equal(f.mt,m.su);}
  }
  assert.equal(releases,1);assert(recovered);assert.equal(f.hp,CH[ch].hp);
  const damage=CH[ch].hp-o.hp;assert.equal(damage,CH[ch].hp-control.f[1-slot].hp);
  if(id==='quake')assert.equal(damage,mode==='guard'?12:mode==='jump'?0:80);
  else assert.equal(damage,mode==='guard'?11.25:mode==='rear'||mode==='jump'?0:75);
 }
});
group('unrelated moves, interruptions, airborne states, portraits, Domains and old sprites stay exact',()=>{
 for(let id=0;id<15;id++)for(const slot of [0,1]){
  const S=newMatch(id,id,133),f=S.f[slot];S.phase='fight';
  for(let a=0;a<3;a++){startMove(f,'a'+a);const m=moveDef(f);for(let mt=0;mt<m.su+m.re;mt++){f.mt=mt;if(m.id==='quake'&&mt>=10&&mt<20||m.id==='thunderclap'&&mt>=6&&mt<23)continue;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
  for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko'])for(const t of [1,7,15,35,60]){f.st=st;f.stT=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  f.gauge=100;startDomain(S,f,S.f[1-slot]);for(const freeze of [60,40,20,0])for(const t of [1,20,32,40,72]){S.freeze=freeze;S.dom.t=t;f.st='cast';assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}
  for(const pose of prior.poses){assert.deepEqual(pxSprite(id,pose,!!slot).data,prior.sprite(id,pose,!!slot).data);defaults++;}
 }
 for(const id of ['quake','thunderclap'])for(const age of ages[id])for(const slot of [0,1]){
  const {S,f,o,art}=setup(id,slot,1);startMove(f,'a'+art);f.mt=age;f.y=GROUND-50;assert.equal(pxPose(S,f),prior.pose(S,f));f.y=GROUND;f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;
  hit(S,1-slot,f,o.x,{dmg:32,stun:15});assert.equal(pxPose(S,f),prior.pose(S,f));newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
 }
});
group('native world changes fit exact old/new bodies across stages; HUD and floor remain exact',()=>{
 for(const id of ['quake','thunderclap'])for(const stage of PX_STAGES)for(const slot of [0,1])for(const face of [-1,1]){
  const {S,f,art}=setup(id,slot,face);S.stage=stage.id;const times=new Set(ages[id]);
  for(let n=0;n<90&&times.size;n++){
   S.ev=[];step(S,input(n,slot,art,'hit',id));if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
   const before=JSON.stringify(S),a=pxWorldSurface(S,quiet),b=prior.world(S,quiet);assert.equal(JSON.stringify(S),before);rasters+=2;
   assert.deepEqual(pxHUDSurface(S,[null,null],quiet).data,prior.hud(S,[null,null],quiet).data);
   const old=body(S,f,prior.paint),now=body(S,f);let changed=0;
   for(let p=0;p<a.data.length;p+=4)if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(old.data[p+3]||now.data[p+3],'world change outside body');}
   const revised=id==='quake'?f.mt>=10&&f.mt<20:f.mt>=6&&f.mt<23;
   if(!baseline&&revised){assert(changed>150);changedScenes++;
    const s=pxSprite(ch,pxPose(S,f),!!slot),colors=new Set();let bottom=0;
    for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++){const p=(y*s.w+x)*4;assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){assert(x>0&&x<s.w-1&&y>0&&y<s.h-1,'sprite cell clipped');assert(y<=PX_OY,'below floor');bottom=Math.max(bottom,y);colors.add(s.data.slice(p,p+3).join(','));}}
    assert.equal(bottom,PX_OY);assert(colors.size<=24);
   }else assert.equal(changed,0);
  }assert.equal(times.size,0);
 }
});
if(output)for(const id of ['quake','thunderclap'])for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]){
 const {S,f,art}=setup(id,slot,face);S.stage=stage;const samples=[],times=new Set(ages[id]);const tag='v133-'+(baseline?'before':'after')+'-'+id+'-p'+(slot+1);
 let seed=133;const randomBase=Math.random;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
 for(let n=0;n<90&&times.size;n++){S.ev=[];step(S,input(n,slot,art,'hit',id));for(const e of S.ev)fxEvent(S,e);fxTick();if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
  const scene=pxWorldSurface(S),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,FX),0,0);samples.push({scene,t:f.mt,pose:pxPose(S,f)});writePNG(output+'/'+tag+'-t'+f.mt+'.png',scene);
 }Math.random=randomBase;assert.equal(samples.length,ages[id].length);
 const strip=new PixelSurface(samples.length*640,386),bodies=new PixelSurface(samples.length*144,154);strip.rect(0,0,strip.w,strip.h,PX_INK);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
 samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(ch,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,baseline}));if(failed&&!previewOnly)throw Error('ordinary-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
