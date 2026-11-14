// Actual contact events and composited world/HUD scenes. Script checks, not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','ai','render','main'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8').split('// ---------- boot')[0]).join('\n');
// Use ordinary V8 Math for the all-roster raster matrix; runtime.cjs covers DOM boot.
Function('assert','addEventListener','window','document',source+'\n'+`
function resetFX(){
  for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];
  FX.banner=FX.impact=FX.bf=null;FX.shake=FX.flash=0;FX.nope=[0,0];FX.silent=true;
}
function composite(S){const view=pxWorldSurface(S);view.blit(pxHUDSurface(S,labels()),0,0);return view;}
function encounter(ch,owner,face,kind,stage='gallery',edge=false,airAt=0,giant=false) {
  resetFX();G.mode='local';
  const S=newMatch(ch,ch,kind==='blackflash'?12345:1000);S.phase='fight';S.t=120;S.stage=stage;
  const f=S.f[owner],o=S.f[1-owner];f.x=edge?(face>0?LEFT:RIGHT):(face>0?580:700);o.x=f.x+face*70;f.face=face;o.face=-face;
  if(giant)f.big=o.big=360;
  if(airAt)for(let t=0;t<airAt;t++){S.ev=[];step(S,t===0?[BTN.U,BTN.U]:[0,0]);}
  if(kind==='break')o.guardHp=1;
  const guard=kind==='block'||kind==='break';
  let found=false;
  for(let t=0;t<60;t++) {
    const input=[0,0];input[owner]=t===0?(kind==='heavy'?BTN.K:BTN.P)<<INPUT_SHIFT:0;input[1-owner]=guard?BTN.G:0;
    S.ev=[];step(S,input);
    for(const e of S.ev){const before=JSON.stringify(S);fxEvent(S,e);assert.equal(JSON.stringify(S),before,'event mutated simulation');if(e.k===(kind==='heavy'||kind==='blackflash'?'hit':kind))found=true;}
    if(found){fxTick();return S;} // Same event/tick ordering as main.js.
    fxTick();
  }
  assert.fail('contact not reached '+kind);
}
let timelines=0,checks=0,values=0;
function clearValues(S) {
  for(const mode of ['local','watch']){G.mode=mode;checkValues(S);}
}
function checkValues(S) {
  const before=JSON.stringify(S),effects=JSON.stringify(FX),layout=pxDamageLayout(S,FX.nums,FX);
  assert.equal(layout.length,FX.nums.length,'a damage value was hidden');
  assert.deepEqual(layout,pxDamageLayout(JSON.parse(before),JSON.parse(effects).nums,JSON.parse(effects)),'snapshot layout changed');
  const bodies=new PixelSurface(640,360),hud=pxHUDSurface(S,labels()),world=pxWorldSurface(S);
  for(const f of S.f)pxPaintFighter(bodies,S,f,null);
  for(const p of layout) {
    assert.equal(p.size,p.n.bf?3:2,'normal damage must use the larger size');
    const glyph=new PixelSurface(p.w,p.h);pxText(glyph,p.n.txt,1,1,PX_LIGHT,p.size);
    const fill=pxRGB(p.n.bf?'#ff7585':p.n.big?'#ffe3a4':PX_LIGHT),edge=pxRGB(PX_INK);
    // Check the final world raster, including every diagonal around a glyph.
    for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++) {
      let around=false;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
        const xx=x+dx,yy=y+dy;
        if(xx>=0&&xx<p.w&&yy>=0&&yy<p.h&&glyph.data[(yy*p.w+xx)*4+3])around=true;
      }
      const at=(y*p.w+x)*4;
      if(around)assert.deepEqual(Array.from(world.data.slice(((p.y+y)*640+p.x+x)*4,((p.y+y)*640+p.x+x)*4+4)),glyph.data[at+3]?fill:edge,'final value lacks its bright fill / full one-pixel outline');
    }
    assert(p.x>=4&&p.x+p.w<=636&&p.y>=90&&p.y+p.h<=302,'value left the gameplay lane');
    for(let y=p.y;y<p.y+p.h;y++)for(let x=p.x;x<p.x+p.w;x++) {
      const at=(y*640+x)*4+3;
      assert.equal(bodies.data[at],0,'damage overlaps actual fighter pixels');
      for(const [dx,dy]of [[0,0],[-5,-5],[-5,5],[5,-5],[5,5]]) {
        const xx=x+dx,yy=y+dy;
        if(xx>=0&&xx<640)assert.equal(hud.data[(yy*640+xx)*4+3],0,'shaken damage overlaps actual HUD/tag/banner pixels');
      }
    }
    for(const q of layout)if(p!==q)assert(p.x+p.w<=q.x||q.x+q.w<=p.x||p.y+p.h<=q.y||q.y+q.h<=p.y,'damage values overlap');
    values++;
  }
  assert.equal(JSON.stringify(S),before,'drawing mutated simulation');
  assert.equal(JSON.stringify(FX),effects,'drawing mutated effects');checks++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const face of [-1,1])for(const kind of ['hit','block','break','heavy','blackflash']) {
  const S=encounter(ch,owner,face,kind,['courtyard','gallery','observatory'][ch%3]),control=JSON.parse(JSON.stringify(S));
  assert.equal(FX.contacts[0].dir,face);
  if(kind==='block'||kind==='break')assert.equal(FX.nums.length,0,'guard contact gained a damage number');
  else {assert.equal(FX.nums.length,1);assert.equal(FX.nums[0].txt,Math.round(S.ev.find(e=>e.k==='hit').a));}
  if(kind==='blackflash'){assert(FX.bf);assert(FX.nums[0].bf);}
  for(let t=0;t<61;t++) {
    if([0,3,12,24,39,59,60].includes(t))clearValues(S);
    S.ev=[];control.ev=[];step(S,[0,0]);step(control,[0,0]);
    assert.equal(JSON.stringify(S),JSON.stringify(control),'presentation changed actual outcome');
    for(const e of S.ev)fxEvent(S,e);fxTick();
  }
  assert.equal(FX.nums.length,0,'damage did not expire');timelines++;
}
// Real jump and attack inputs at ascent/crest, plus arena edges and enlarged builds.
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const face of [-1,1]) {
  for(const airAt of [8,15])clearValues(encounter(ch,owner,face,'hit','gallery',false,airAt));
  clearValues(encounter(ch,owner,face,'hit','courtyard',true));
  clearValues(encounter(ch,owner,face,'heavy','observatory',false,0,true));
}
// Ordinary first hits can happen while FIGHT remains up. Larger and small banners
// also share the space with air contacts; use actual event handlers for each.
for(const airAt of [0,8,15])for(const event of [{k:'fight'},{k:'domain',a:0},{k:'break',x:650,y:542},{k:'ko'}]) {
  const S=encounter(0,0,1,'hit','gallery',false,airAt);fxEvent(S,event);clearValues(S);
}
// Eight live damage events at once, including trades, retain every value.
for(const ch of [0,7,14]) {
  const S=encounter(ch,0,1,'hit');
  for(let t=0;t<8;t++) {
    S.ev=[];const owner=t%2;hit(S,owner,S.f[1-owner],S.f[owner].x,{dmg:24,kb:0});
    for(const e of S.ev)fxEvent(S,e);fxTick();clearValues(S);
  }
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const face of [-1,1]) {
  const S=encounter(ch,owner,face,'hit'),victim=S.f[1-owner];victim.hp=1;S.ev=[];
  hit(S,owner,victim,S.f[owner].x,{dmg:60,kb:4});assert.equal(victim.st,'ko');
  for(const e of S.ev)fxEvent(S,e);fxTick();clearValues(S);
  for(let t=0;t<32;t++){S.ev=[];step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();}
  clearValues(S);
}
globalThis.audit=new PixelSurface(1280,1128);audit.rect(0,0,audit.w,audit.h,PX_INK);
for(const [n,ch,owner,face,kind]of [[0,0,0,1,'hit'],[1,0,1,-1,'block'],[2,14,0,1,'heavy'],[3,14,1,-1,'break'],[4,0,0,1,'blackflash'],[5,7,1,-1,'hit']]) {
  const S=encounter(ch,owner,face,kind,['courtyard','gallery','observatory'][n%3]);
  const x=n%2*640,y=Math.floor(n/2)*376;
  audit.blit(composite(S),x,y+16);pxText(audit,CH[ch].name+' / '+kind+' / P'+(owner+1)+(face>0?' > RIGHT':' < LEFT'),x+8,y+4,PX_LIGHT);
}
globalThis.followup=new PixelSurface(1280,752);followup.rect(0,0,followup.w,followup.h,PX_INK);
for(const [n,kind,airAt]of [[0,'hit',0],[1,'block',0],[2,'blackflash',15],[3,'heavy',0]]) {
  const S=encounter(n===3?14:0,n%2,n%2?-1:1,kind,'gallery',false,airAt);
  for(let t=0;t<3;t++){S.ev=[];step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();}
  const x=n%2*640,y=Math.floor(n/2)*376;followup.blit(composite(S),x,y+16);pxText(followup,kind+' / EXPANSION / '+(airAt?'ACTUAL AIR INPUT':'ACTUAL GROUND INPUT'),x+8,y+4,PX_LIGHT);
}
console.log('PASS',timelines,'actual ground hit/block/break/kick/Black Flash timelines,',checks,'read-only layout/raster/snapshot checks,',values,'unhidden values clear of body/HUD pixels and each other; jumps, edges, giants, banners, trades, 60 actual KOs, expiry and identical outcomes');
`)(assert,()=>{},{},{getElementById(){return {getContext(){return {};}};}});
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'v37-contact-audit.png'),globalThis.audit);
if(process.argv[2])writePNG(path.join(process.argv[2],(process.argv[3]?.match(/^(v\d+)-/)?.[1]||'preview')+'-contact-expansion.png'),globalThis.followup);
