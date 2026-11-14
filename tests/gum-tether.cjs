// Attached gum through actual inputs and snapshot rasters. Scripted, never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),baseline=process.argv.includes('--baseline');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','baseline','Math',source+'\n'+`
const pim=CH.findIndex(c=>c.arts[0].id==='gum'),rook=CH.findIndex(c=>c.arts[0].id==='counter');
let timelines=0,ticks=0,rasters=0,holds=0,composites=0,crops=0,minBright=Infinity;const previews=[];
function layer(S){const s=new PixelSurface(640,360);if(typeof pxGumTether==='function')pxGumTether(s,S);return s;}
function count(s){let n=0;for(let p=3;p<s.data.length;p+=4)if(s.data[p])n++;return n;}
function resetFX(){for(const k of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];FX.silent=true;}
function capture(S,name,owner){previews.push({S:JSON.parse(JSON.stringify(S)),F:JSON.parse(JSON.stringify(FX)),name,owner});}
function run(owner,mode){
  resetFX();const S=newMatch(pim,pim,451);if(mode==='vanish')S.f[1-owner]=newFighter(1-owner,rook);
  S.phase='fight';const f=S.f[owner],o=S.f[1-owner];f.x=owner?980:300;o.x=owner?420:860;if(mode==='slingshot')o.x=f.x+(owner?-420:420);f.face=owner?-1:1;o.face=-f.face;f.ce=100;o.ce=100;
  const B=JSON.parse(JSON.stringify(S));let attached=false,follow=false,sawSling=false,cleaned=false,age=0,initialDamage=0,held=false;
  const hp=o.hp;
  for(let n=0;n<440;n++){
    const input=[0,0];if(n===0)input[owner]=BTN.A1<<INPUT_SHIFT;
    if(mode==='guard')input[1-owner]=BTN.G;
    if(attached&&!follow&&free(f)&&free(o)&&!S.hitstop){
      if(mode==='contract')input[owner]=BTN.A2<<INPUT_SHIFT;
      if(mode==='slingshot'||mode==='slingfar')input[owner]=BTN.A3<<INPUT_SHIFT;
      if(mode==='vanish')input[1-owner]=BTN.A2<<INPUT_SHIFT;
      if(mode==='jump')input[1-owner]=BTN.U<<INPUT_SHIFT;
      follow=true;
    }
    const before=JSON.stringify(S),s=layer(S);
    if(!baseline){
      assert.equal(count(s)>0,S.f.some(f=>f.gum>0),'tether disagrees with serialized setup');
      assert.deepEqual(layer(JSON.parse(before)).data,s.data,'guest snapshot changes tether');
      assert.deepEqual(layer({...S,t:S.t+777}).data,s.data,'global clock animates tether');
      for(let p=3;p<s.data.length;p+=4)assert(s.data[p]===0||s.data[p]===255,'soft alpha');rasters++;
    }
    if(n%5===0){pxWorldSurface(S,FX);pxHUDSurface(S,[null,null]);}
    assert.equal(JSON.stringify(S),before,'drawing writes match');
    if(o.gum>0&&!held){
      for(const field of ['hitstop','freeze']){
        const C=JSON.parse(before);C.hitstop=C.freeze=0;C[field]=4;
        for(let k=0;k<4;k++){step(C,[0,0]);assert.equal(C.f[1-owner].gum,o.gum);if(!baseline)assert.deepEqual(layer(C).data,s.data);holds++;}
      }
      // Stop both movement inputs; existing stopped target countdown holds.
      const C=JSON.parse(before);C.hitstop=C.freeze=0;C.stop={o:owner,t:4};
      for(let k=0;k<4;k++){step(C,[0,0]);assert.equal(C.f[1-owner].gum,o.gum);holds++;}
      const K=JSON.parse(before);ko(K,K.f[1-owner]);assert.equal(K.f[1-owner].gum,o.gum,'existing KO setup retention changed');
      if(!baseline)assert(count(layer(K))>0,'KO loses retained setup cue');newRound(K);if(!baseline)assert.equal(count(layer(K)),0,'reset leaves tether');
      held=true;
    }
    S.ev=[];B.ev=[];step(S,input);step(B,input);assert.equal(JSON.stringify(S),JSON.stringify(B),'drawing changes outcome');ticks++;
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(!attached&&o.gum>0){attached=true;initialDamage=hp-o.hp;capture(S,mode+'-attached',owner);}
    if(o.gum>0){age++;if(age===22||age===150||age===298)capture(S,mode+'-age'+age,owner);}
    if(f.sling>0&&!sawSling){sawSling=true;capture(S,mode+'-taut',owner);}
    if(attached&&o.gum===0&&!cleaned){cleaned=true;capture(S,mode+'-cleared',owner);}
  }
  assert(attached&&cleaned&&held,'missing acquisition/cleanup');assert.equal(initialDamage,mode==='guard'?2.25:15,'gum contact damage changed');
  if(mode==='contract') {assert.equal(hp-o.hp,45);assert(Math.abs(f.x-o.x)<120,'contract no longer draws foe in');}
  if(mode==='slingshot'){assert(sawSling);assert.equal(hp-o.hp,95,'sling blow changed');}
  if(mode==='slingfar'){assert(sawSling);assert.equal(hp-o.hp,15,'existing far sling whiff changed');}
  if(['idle','guard','jump','vanish'].includes(mode))assert.equal(hp-o.hp,initialDamage,'unexpected damage');
  // Reset removes setup; KO retains gum in existing state until the next round.
  const C=JSON.parse(JSON.stringify(S));newRound(C);assert.equal(C.f[0].gum+C.f[1].gum,0);if(!baseline)assert.equal(count(layer(C)),0);
  timelines++;
}
for(const owner of [0,1])for(const mode of ['idle','guard','contract','slingshot','slingfar','vanish','jump'])run(owner,mode);
if(!baseline){
  // Fractional, airborne, close and crossed roots use bounded hard-alpha geometry.
  const S=previews.find(p=>p.name==='idle-age22').S;
  for(const dx of [-800,-200,0,300,900])for(const dy of [-450,-100,0,180]){
    const C=JSON.parse(JSON.stringify(S));for(const f of C.f){f.x+=dx+.5;f.y+=dy+.5;}
    const a=layer(C),b=new PixelSurface(840,560),D=JSON.parse(JSON.stringify(C));for(const f of D.f){f.x+=200;f.y+=200;}pxGumTether(b,D);
    for(let y=0;y<360;y++)assert.deepEqual(a.data.subarray(y*640*4,(y+1)*640*4),b.data.subarray(((y+100)*840+100)*4,((y+100)*840+740)*4),'edge clipping');crops++;
  }
  for(const dx of [0,46,100,350,900,-350])for(const dy of [0,-260,180]){
    const C=JSON.parse(JSON.stringify(S));C.f[0].x=640;C.f[1].x=640+dx;C.f[1].y+=dy;
    const a=layer(C);assert(count(a)>80,'missing close/cross/air tether');rasters++;
  }
  // Ground shadows precede the tether; the tether stays behind both bodies.
  for(const p of previews.filter(p=>p.S.f.some(f=>f.gum>0))){
    const C=JSON.parse(JSON.stringify(p.S));C.proj=[];C.zones=[];C.ents=[];
    const expected=new PixelSurface(640,360);expected.data.set(pxBackdrop(Math.floor(C.t/8),C.stage).data);pxDomain(expected,C);
    if(typeof pxFighterShadow==='function')for(const f of C.f)pxFighterShadow(expected,f);
    pxGumTether(expected,C);
    for(const f of C.f)pxPaintFighter(expected,C,f,null);
    assert.deepEqual(pxWorldSurface(C,{}).data,expected.data,'tether paints over fighter');composites++;
    // Count visible pale rose strand material in the real world composite.
    const actual=pxWorldSurface(C,{}),empty=JSON.parse(JSON.stringify(C));for(const f of empty.f)f.gum=0;const old=pxWorldSurface(empty,{});let bright=0;
    for(let q=0;q<actual.data.length;q+=4)if(actual.data[q]>=220&&actual.data[q+1]>=140&&actual.data[q+2]>=180&&actual.data[q]!==old.data[q])bright++;
    if(p.name==='idle-age22')minBright=Math.min(minBright,bright);
  }
  assert(minBright>300,'tether too faint in full scene: '+minBright);
}
if(output){
  for(const owner of [0,1])for(const stage of PX_STAGES){
    const selected=previews.filter(p=>p.owner===owner&&['idle-age22','jump-age22','slingshot-taut','contract-cleared','idle-cleared','slingshot-cleared','vanish-cleared'].includes(p.name));
    const sheet=new PixelSurface(1280,Math.ceil(selected.length/2)*360);
    selected.forEach((p,n)=>{const C=JSON.parse(JSON.stringify(p.S));C.stage=stage.id;const frame=pxWorldSurface(C,p.F);frame.blit(pxHUDSurface(C,[null,null]),0,0);
      writePNG(output+'/'+prefix+'-'+p.name+'-'+stage.id+'-'+(owner?'left':'right')+'.png',frame);sheet.blit(frame,n%2*640,Math.floor(n/2)*360);
    });writePNG(output+'/'+prefix+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',sheet);
  }
}
console.log('PASS',timelines,'real acquisition/guard/contract/slingshot/vanish/jump+expiry timelines;',ticks,'parallel-state ticks;',rasters,'read-only snapshot rasters;',holds,'pause/stop countdown holds;',crops,'edge crops;',composites,'body-order composites; minimum bright strand pixels',baseline?'baseline':minBright);
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v62',baseline,math);
