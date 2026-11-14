// Ground shadows must never paint over either fighter. Raster/script checks, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'shadows';
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>
  baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly',source+'\n'+`
let checks=0,protectedPixels=0,corruptPixels=0,ticks=0;
function check(S,name,save=false) {
  const before=JSON.stringify(S),view=pxWorldSurface(S,{}),bodies=new PixelSurface(640,360);
  // The existing authored sprite rasters are the independent opacity/color oracle.
  for(const f of S.f) {
    if(f.inv>0&&S.t%4<2)continue; // Existing recovery blink intentionally hides the body.
    const scale=f.big>0?1.3:1,flash=S.t-f.hurtT<4?PX_LIGHT:'';
    const {sprite,ox,oy}=pxFighterFrame(f.ch,pxPose(S,f),f.i===1&&S.f[0].ch===f.ch,flash);
    bodies.blit(sprite,Math.round(f.x/2)-(f.face<0?sprite.w-1-ox:ox)*scale,Math.round(f.y/2)-oy*scale,scale,f.face<0);
  }
  for(let y=304;y<=306;y++)for(let x=0;x<640;x++) {
    const p=(y*640+x)*4;if(!bodies.data[p+3])continue;
    protectedPixels++;
    if(!bodies.data.subarray(p,p+4).every((v,k)=>view.data[p+k]===v))corruptPixels++;
  }
  assert.equal(JSON.stringify(S),before,'shadow drawing writes simulation');
  assert.deepEqual(view.data,pxWorldSurface(JSON.parse(before),{}).data,'snapshot changes shadow layering');
  if(output&&save) {view.blit(pxHUDSurface(S,[null,null],{}),0,0);writePNG(output+'/'+prefix+'-'+name+'.png',view);}
  checks++;
}
for(let ch=0;ch<15;ch++)for(const reversed of [false,true]) {
  const S=newMatch(ch,ch,83);S.phase='fight';S.t=120;S.stage=PX_STAGES[ch%3].id;
  S.f[0].x=reversed?686:594;S.f[1].x=reversed?594:686;
  const control=JSON.parse(JSON.stringify(S));
  for(let t=0;t<28;t++) {
    const input=reversed?[BTN.L,BTN.R]:[BTN.R,BTN.L];step(S,input);step(control,input);ticks++;
    check(S,'walk-'+ch+'-'+reversed,t===27&&[0,13,14].includes(ch));
    assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes close walk');
  }
}
// Actual jumping crossings and a real launch/knockdown keep the same simulation.
for(const owner of [0,1])for(const kind of ['jump','knockdown','ko']) {
  const S=newMatch(14,14,83);S.phase='fight';S.t=120;S.f[0].x=610;S.f[1].x=670;
  if(kind!=='jump') {
    if(kind==='ko')S.f[owner].hp=1;
    hit(S,1-owner,S.f[owner],S.f[1-owner].x,{dmg:60,kb:0,lift:14,stun:50});
  }
  const control=JSON.parse(JSON.stringify(S));let airborne=false,grounded=false,crossed=false;
  for(let t=0;t<90;t++) {
    const input=[0,0];
    if(kind==='jump')input[owner]=(t===0?BTN.U:0)|(owner?BTN.L:BTN.R);
    step(S,input);step(control,input);ticks++;
    airborne ||= S.f[owner].y<GROUND;grounded ||= airborne&&S.f[owner].y===GROUND;
    crossed ||= S.f[0].x>S.f[1].x;
    check(S,kind+'-slot'+owner+'-t'+t,kind!=='jump'&&t===70);
    assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes '+kind);
  }
  assert(airborne&&grounded,'missing actual flight/landing '+kind);
  if(kind==='jump')assert(crossed,'jump did not cross opponent');
  else assert.equal(S.f[owner].st,kind==='ko'?'ko':'idle');
}
// Fixed contact arrangements exercise wide resting bodies and the enlarged costume.
for(const stage of PX_STAGES)for(const ch of [0,13,14])for(const face of [-1,1])for(const big of [0,120])for(const state of ['idle','down','ko']) {
  const S=newMatch(ch,ch,83);S.phase=state==='ko'?'ko':'fight';S.phaseT=50;S.winner=state==='ko'?1:-1;S.t=120;S.stage=stage.id;
  S.f[0].x=640;S.f[1].x=640+face*46;S.f[0].face=face;S.f[1].face=-face;
  S.f[0].st=state;S.f[0].stT=22;S.f[0].big=big;
  check(S,stage.id+'-'+ch+'-'+(face>0?'right':'left')+'-'+state+(big?'-big':''),!big&&ch===14);
  const frozen=JSON.parse(JSON.stringify(S));S.hitstop=3;
  for(let n=0;n<3;n++){step(S,[0,0]);assert.equal(pxPose(S,S.f[0]),pxPose(frozen,frozen.f[0]));}
}
console.log('SHADOW AUDIT',checks,'read-only snapshot frames,',ticks,'parallel-state movement/contact ticks,',protectedPixels,'opaque body pixels,',corruptPixels,'overpainted pixels');
if(!previewOnly)assert.equal(corruptPixels,0,'ground shadow paints over a fighter');
`)(assert,writePNG,output,prefix,previewOnly);
