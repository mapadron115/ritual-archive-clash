// Actual walking/reversal timelines and world-space support-foot drift. Script checks, not play.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,contacts=0,plants=0,maxDrift=0;const scenes=[];
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const family of ['walk','back'])for(let n=0;n<8;n++) {
  const pose=family+n,p=PX_POSES[pose],f=pxFighterFrame(ch,pose,alt);let bottom=-1;
  assert.equal(Math.max(p.l[1][1],p.r[1][1]),0,'no supporting sole '+pose);
  assert(Math.min(p.l[1][1],p.r[1][1])<0,'no lifted swing foot '+pose);
  for(let y=0;y<f.sprite.h;y++)for(let x=0;x<f.sprite.w;x++)if(f.sprite.data[(y*f.sprite.w+x)*4+3])bottom=y;
  assert.equal(bottom-f.oy,0,'sole floats/sinks '+ch+' '+pose);contacts++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const travel of [1,-1]) {
  const S=newMatch(ch,ch,811);S.phase='fight';S.stage=['courtyard','gallery','observatory'][ch%3];S.t=120;
  const f=S.f[owner],face=owner?-1:1;f.x=640;S.f[1-owner].x=owner?40:1240;
  const control=JSON.parse(JSON.stringify(S)),seen=new Set();let prev=null;
  const key=travel*face>0?BTN.R:BTN.L,input=owner?[0,key]:[key,0];
  for(let tick=0;tick<27;tick++) {
    step(S,input);step(control,input);assert.equal(f.st,'walk');assert.equal(f.face,face);
    const before=JSON.stringify(S),pose=pxPose(S,f),p=PX_POSES[pose],phase=Math.floor(f.walkT/3)%8;
    assert.equal(pose,(travel===1?'walk':'back')+phase);seen.add(pose);
    const foot=phase<4?'l':'r',world=Math.round(f.x/2)+f.face*p[foot][1][0];
    if(prev&&prev.pose!==pose&&prev.foot===foot&&f.walkT-prev.clock===3) {
      const drift=Math.abs(world-prev.world);maxDrift=Math.max(maxDrift,drift);
      assert(drift<=2,'support drifts over two native pixels at a frame boundary '+ch+' '+pose+' '+drift);plants++;
    }
    if(!prev||prev.pose!==pose)prev={pose,foot,world,clock:f.walkT};
    const snap=JSON.parse(before);assert.equal(pxPose(snap,snap.f[owner]),pose,'snapshot changes stride');
    if(tick%6===0)pxWorldSurface(S,{});
    assert.equal(JSON.stringify(S),before,'drawing mutates walking state');
    assert.equal(JSON.stringify(S),JSON.stringify(control),'rendered walk diverges');
    if(tick===12) {
      if([0,4,14].includes(ch)&&owner===0)scenes.push(JSON.parse(before));
      const clock=f.walkT,x=f.x;
      for(const pause of ['hitstop','freeze','stop']) {
        if(pause==='stop'){S.stop={o:1-owner,t:3};control.stop={o:1-owner,t:3};}
        else S[pause]=control[pause]=3;
        for(let n=0;n<3;n++){step(S,input);step(control,input);assert.equal(f.walkT,clock);assert.equal(f.x,x);assert.equal(pxPose(S,f),pose);}
      }
    }
  }
  assert.equal(seen.size,8,'missing stride phases');
  // Reversal and crossing the opponent use current facing/velocity, no stale visual history.
  const reverse=key===BTN.R?BTN.L:BTN.R,rev=owner?[0,reverse]:[reverse,0];
  step(S,rev);step(control,rev);assert(pxPose(S,f).startsWith(travel===1?'back':'walk'));
  const oldFace=f.face;S.f[1-owner].x=control.f[1-owner].x=f.x-oldFace*200;
  step(S,rev);step(control,rev);assert.equal(f.face,-oldFace);assert(pxPose(S,f).startsWith(travel===1?'walk':'back'));
  assert.equal(JSON.stringify(S),JSON.stringify(control));
  const attack=owner?[0,BTN.P]:[BTN.P,0];step(S,attack);assert.equal(f.st,'atk');assert(!/^(walk|back)/.test(pxPose(S,f)));
  newRound(S);assert.equal(S.f[owner].st,'idle');timelines++;
}
// Advance/retreat masks must differ as shapes, not just by colored near/far limbs.
for(let ch=0;ch<15;ch++)for(let n=0;n<8;n++) {
  const a=pxSprite(ch,'walk'+n),b=pxSprite(ch,'back'+n);let union=0,both=0;
  for(let p=3;p<a.data.length;p+=4){union+=!!a.data[p]||!!b.data[p];both+=!!a.data[p]&&!!b.data[p];}
  assert(both/union<.85,'advance/retreat silhouette too similar '+ch+' '+n);
}
globalThis.sheet=new PixelSurface(1728,1040);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
globalThis.flat=new PixelSurface(1728,1040);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
for(const [surface,color]of [[sheet,PX_LIGHT],[flat,PX_INK]])pxText(surface,'V25 / GROUNDED ADVANCE AND GUARDED RETREAT',18,16,color,2);
for(let row=0;row<6;row++)for(let n=0;n<8;n++) {
  const ch=[0,0,4,4,14,14][row],pose=(row%2?'back':'walk')+n,x=n*216,y=48+row*164;
  for(const [s,col]of [[sheet,''],[flat,PX_INK]]) {
    const f=pxFighterFrame(ch,pose,row>=4,col);s.rect(x+3,y+142,210,1,col||'#576075');
    s.blit(f.sprite,x+105-f.ox,y+142-f.oy,1);
    pxText(s,CH[ch].name+' / '+pose,x+7,y+151,col||PX_LIGHT);
  }
}
globalThis.scene=new PixelSurface(1280,1080);
scenes.forEach((S,n)=>{
  const f=S.f[0],frame=pxWorldSurface(S,{});pxOutlinedText(frame,CH[f.ch].name+' / '+pxPose(S,f),12,16,PX_LIGHT);
  pxOutlinedText(frame,'ACTUAL WALK INPUT / EXISTING CLOCK AND VELOCITY',12,30,'#b4c2ce');
  scene.blit(frame,n%2*640,Math.floor(n/2)*360);
});
console.log('PASS',timelines,'real walk/reversal/crossing timelines;',contacts,'grounded main/mirror frames;',plants,'support boundaries, max drift',maxDrift.toFixed(2),'native pixels; distinct advance/retreat masks, freeze/time-stop/snapshots, attack/rematch and unchanged outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v25-footwork-phases.png','sheet'],['v25-footwork-silhouettes.png','flat'],['v25-footwork-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
