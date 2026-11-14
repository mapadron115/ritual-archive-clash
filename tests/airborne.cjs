// Real launch/landing events and presentation-only dust. Scripted, never human play.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
FX.silent=true;
const S=newMatch(0,14,777);S.phase='fight';S.f[0].x=450;S.f[1].x=750;
const f=S.f[1];hit(S,0,f,450,{dmg:60,kb:0,lift:14,stun:50});
const poses=new Set(),events=new Set();let ticks=0;
while(ticks++<180 && f.st!=='idle') {
  const pose=pxPose(S,f);poses.add(pose);
  if(f.y<GROUND && !S.hitstop) {
    const vy=f.vy;S.hitstop=3;
    for(let n=0;n<3;n++){step(S,[0,0]);assert.equal(f.vy,vy);assert.equal(pxPose(S,f),pose);}
  }
  step(S,[0,0]);for(const e of S.ev){events.add(e.k);fxEvent(S,e);}S.ev=[];
  const before=JSON.stringify(S);pxWorldSurface(S);assert.equal(JSON.stringify(S),before);fxTick();
}
for(const p of ['launch','airarch','aircrest','fall','fallbrace','collapse','down','rise1','rise2'])assert(poses.has(p),'missing actual phase '+p);
assert(events.has('land')&&events.has('thud'));assert.equal(f.st,'idle');
FX.dust=[];const J=newMatch(0,1,100);J.phase='fight';step(J,[BTN.U,0]);
for(let n=0;n<70;n++){for(const e of J.ev)fxEvent(J,e);J.ev=[];step(J,[0,0]);}
assert(FX.dust.some(p=>p.kind==='jump'));assert(FX.dust.some(p=>p.kind==='land'));
FX.dust=[];fxEvent(S,{k:'land',x:700,y:GROUND});fxEvent(S,{k:'thud',x:700,y:GROUND});
assert.equal(FX.dust.length,1);assert.equal(FX.dust[0].kind,'thud');
for(let n=0;n<24;n++)fxTick();assert.equal(FX.dust.length,0);
for(let n=0;n<40;n++)groundDust({k:'jump',x:n*20});assert.equal(FX.dust.length,32);FX.dust=[];
let frames=0;
for(const kind of ['jump','land','thud']) {
  const hashes=new Set(),life=kind==='thud'?24:kind==='land'?18:12;
  for(let t=0;t<life;t++) {
    const c=new PixelSurface(192,96);pxDust(c,{x:192,y:160,kind,t});let occupied=0;
    for(let y=0;y<c.h;y++)for(let x=0;x<c.w;x++) {
      const a=c.data[(y*c.w+x)*4+3];assert(a===0||a===255);
      if(a){occupied++;assert(x>0&&x<c.w-1&&y>0&&y<=80,'dust clipped or below floor');}
    }
    assert(occupied>0);hashes.add(c.data.join(','));frames++;
  }
  assert(hashes.size>4,'dust has no evolving phases');
}
globalThis.sheet=new PixelSurface(1440,930);sheet.rect(0,0,1440,930,PX_INK);
pxText(sheet,'V14 / AIR HIT: LAUNCH, ARCH, CREST, FALL, BRACE',18,16,PX_LIGHT,2);
for(let row=0;row<3;row++)['launch','airarch','aircrest','fall','fallbrace'].forEach((pose,n)=>{
  const x=n*288,y=45+row*285,ch=[0,7,14][row],frame=pxFighterFrame(ch,pose,row===1);
  sheet.rect(x+3,y,282,275,'#28364a');sheet.blit(frame.sprite,x+144-frame.ox*2,y+245-frame.oy*2,2);
  pxText(sheet,CH[ch].name+' / '+pose,x+10,y+258,PX_LIGHT);
});
globalThis.dustSheet=new PixelSurface(1280,690);dustSheet.rect(0,0,1280,690,PX_INK);
pxText(dustSheet,'V14 / TAKEOFF, LANDING AND BODY IMPACT',18,16,PX_LIGHT,2);
['jump','land','thud'].forEach((kind,row)=>[0,3,6,10,16].forEach((t,n)=>{
  const x=n*256,y=45+row*210;dustSheet.rect(x+3,y,250,200,'#28364a');
  dustSheet.rect(x+4,y+158,248,1,'#817b72');
  if(t<(kind==='jump'?12:kind==='land'?18:24))pxDust(dustSheet,{x:(x+128)*2,y:(y+158)*2,kind,t});
  pxText(dustSheet,kind.toUpperCase()+' / T'+t,x+12,y+180,PX_LIGHT);
}));
console.log('PASS actual airborne timeline, freeze-held poses, real jump/land/thud, coalescing, expiry, cap;',frames,'bounded hard-alpha dust frames; read-only rendering');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v14-airborne-frames.png','sheet'],['v14-floor-dust.png','dustSheet']])writePNG(path.join(process.argv[2],name),ctx[key]);
