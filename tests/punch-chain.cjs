// Actual three-press chains and the second punch's presentation. No human play claim.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let timelines=0,silhouettes=0,contacts=0;const samples=new Map();
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const [first,second]of [['wind','punch2w'],['punchload','punch2load'],['punch2w','punch2load']]) {
  const a=pxSprite(ch,first,alt),b=pxSprite(ch,second,alt);let both=0,union=0;
  for(let p=3;p<a.data.length;p+=4){both+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}
  assert(both/union<.87,'indistinct punch loads '+ch+' '+first+' '+second);silhouettes++;
}
for(let ch=0;ch<15;ch++)for(let owner=0;owner<2;owner++)for(const face of [-1,1])for(const scenario of ['whiff','hit','block'])for(const third of [false,true]) {
  const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;S.stage=['courtyard','gallery','observatory'][ch%3];
  const f=S.f[owner],o=S.f[1-owner];f.x=640;o.x=f.x+face*(scenario==='whiff'?500:48);f.face=face;o.face=-face;
  const control=JSON.parse(JSON.stringify(S)),seen=new Set(),paused=new Set(),hits=new Set();let ticks=0,sentSecond=false,sentThird=false;
  while(ticks<300) {
    const pulse=ticks===0 || !sentSecond&&f.move==='p1'&&f.mt===6 || third&&!sentThird&&f.move==='p2'&&f.mt===6;
    if(pulse&&f.move==='p1')sentSecond=true;if(pulse&&f.move==='p2')sentThird=true;
    const inp=owner?[scenario==='block'?BTN.G:0,pulse?BTN.P<<INPUT_SHIFT:0]:[pulse?BTN.P<<INPUT_SHIFT:0,scenario==='block'?BTN.G:0];
    S.ev=[];control.ev=[];
    step(S,inp);step(control,inp);assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes chain outcome');
    const move=f.move,pose=pxPose(S,f);
    for(const e of S.ev)if(e.k===(scenario==='block'?'block':'hit')&&move==='p2') {hits.add(move);contacts++;}
    if(move==='p2') {
      const m=BASIC.p2,elapsed=f.mt-m.su;
      assert.equal(pose,f.mt<2?'punch2w':f.mt<4?'punch2load':elapsed<3?'punch2':elapsed<8?'punch2re':'ready','second-punch boundary');
      seen.add(pose);
      if(!paused.has(pose)) {
        const before=JSON.stringify(S),clone=JSON.parse(before);assert.equal(pxPose(clone,clone.f[owner]),pose);
        pxWorldSurface(S,{});assert.equal(JSON.stringify(S),before,'drawing mutates chain');
        if(owner===0&&face===1&&scenario==='hit'&&!third)samples.set(ch+':'+pose,clone);
        paused.add(pose);const mt=f.mt;
        for(const pause of ['hitstop','freeze','stop']) {
          if(pause==='stop'){S.stop={o:1-owner,t:3};control.stop={...S.stop};}else S[pause]=control[pause]=3;
          for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);}
        }
      }
    }
    ticks++;
    if(ticks>1&&f.st==='idle')break;
  }
  assert(ticks<300);assert(sentSecond);assert(seen.has('punch2w'));assert(seen.has('punch2load'));assert(seen.has('punch2'));
  if(third)assert(sentThird);else for(const p of ['punch2re','ready'])assert(seen.has(p));
  if(scenario!=='whiff')assert(hits.has('p2'),'missing actual second-punch '+scenario+' '+ch+' '+owner+' '+face);
  // A held punch after recovery does not restart the combo.
  step(S,owner?[0,BTN.P]:[BTN.P,0]);for(let n=0;n<50;n++)step(S,owner?[0,BTN.P]:[BTN.P,0]);assert.notEqual(f.st,'atk');
  newRound(S);assert(!['punch2w','punch2load'].includes(pxPose(S,S.f[owner])));timelines++;
}
globalThis.sheet=new PixelSurface(1440,1360);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V29 / SECOND PUNCH: FAR FIST LOAD, NEAR HAND GUARD',18,16,PX_LIGHT,2);
for(let row=0;row<5;row++)['punch2w','punch2load','punch2','punch2re','ready'].forEach((pose,n)=>{
  const ch=[0,14,7,4,11][row],x=n*288,y=48+row*260,f=pxFighterFrame(ch,pose,row%2===1);
  sheet.rect(x+4,y,280,253,'#28364a');sheet.rect(x+5,y+218,278,1,'#576075');
  sheet.blit(f.sprite,x+144-f.ox*2,y+218-f.oy*2,2);
  pxText(sheet,CH[ch].name+' / FACING RIGHT >',x+10,y+231,PX_LIGHT);pxText(sheet,pose,x+10,y+244,'#b4c2ce');
});
globalThis.flat=new PixelSurface(1500,1210);flat.rect(0,0,flat.w,flat.h,'#d1d5d1');
pxText(flat,'V29 / FIFTEEN FIRST VS SECOND PUNCH LOADS',18,16,PX_INK,2);
for(let ch=0;ch<15;ch++) {
  const x=ch%3*500,y=48+Math.floor(ch/3)*230;pxText(flat,CH[ch].name,x+5,y,PX_INK);
  [['wind','punchload','punch'],['punch2w','punch2load','punch2']].forEach((poses,row)=>poses.forEach((pose,n)=>{
    const f=pxFighterFrame(ch,pose,false,PX_INK);flat.blit(f.sprite,x+n*160+72-f.ox,y+105+row*108-f.oy);
  }));
}
globalThis.scene=new PixelSurface(1280,720);
for(const [n,ch,pose]of [[0,0,'punch2load'],[1,14,'punch2load'],[2,7,'punch2'],[3,4,'punch2re']]) {
  const S=samples.get(ch+':'+pose);assert(S,'missing actual scene '+ch+' '+pose);const view=pxWorldSurface(S,{});
  pxOutlinedText(view,CH[ch].name+' / '+pose,12,16,PX_LIGHT);pxOutlinedText(view,'ACTUAL PUNCH INPUTS / ORIGINAL TIMING',12,30,'#b4c2ce');
  scene.blit(view,n%2*640,Math.floor(n/2)*360);
}
console.log('PASS',timelines,'actual whiff/hit/block chains, both slots/facings, optional third press;',silhouettes,'costume load silhouettes;',contacts,'second-punch contacts; phase boundaries, freezes, snapshots, read-only drawing, rematch and identical outcomes');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v29-punch-phases.png','sheet'],['v29-punch-silhouettes.png','flat'],['v29-punch-scene.png','scene']])writePNG(path.join(process.argv[2],name),ctx[key]);
