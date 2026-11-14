// Actual two-press chains and native scenes. Script/raster evidence, never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'straight-punch-wake';
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const previewCh=process.argv.includes('--heavy')?14:0;
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const oldWorld=require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'});
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
// Keep the absence-of-wake reference useful after this version becomes HEAD.
const oldFrame=Function(names.map(n=>n==='pixel-world'?oldWorld:read(n)).join('\n')+'\nif(typeof pxStraightPunchWake===\'function\')pxStraightPunchWake=()=>{};return S=>pxWorldSurface(S,{});')();
const source=names.map(n=>baseline&&n==='pixel-world'?oldWorld:read(n)).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','oldFrame','previewCh',source+'\n'+`
const controls=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
let timelines=0,ticks=0,rasters=0,holds=0,contacts=0,minVisible=Infinity;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const dir of [-1,1])for(const kind of ['whiff','hit','block']) {
  if(previewOnly&&(ch!==previewCh||dir!==(owner?-1:1)))continue;
  if(output){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.silent=true;}
  const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;S.stage=PX_STAGES[ch%3].id;
  const f=S.f[owner],o=S.f[1-owner];f.x=dir>0?540:740;o.x=f.x+dir*(kind==='whiff'?300:48);f.face=dir;o.face=-dir;
  const B=JSON.parse(JSON.stringify(S)),seen=new Set(),connected=new Set();let second=false;
  for(let n=0;n<100;n++) {
    const pulse=n===0||!second&&f.move==='p1'&&f.mt===10;
    if(pulse&&f.move==='p1')second=true;
    const input=[0,0];input[owner]=pulse?BTN.P<<INPUT_SHIFT:0;input[1-owner]=kind==='block'?BTN.G:0;
    S.ev=[];B.ev=[];step(S,input);step(B,input);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B));
    if(output){for(const e of S.ev)fxEvent(S,e);fxTick();}
    if(S.ev.some(e=>e.k===(kind==='block'?'block':'hit'))){connected.add(f.move);contacts++;}
    if(['p1','p2'].includes(f.move)&&!seen.has(f.move+':'+f.mt)) {
      seen.add(f.move+':'+f.mt);const active=f.mt>=4&&f.mt<7;
      if(active||[1,3,7,10,14].includes(f.mt)) {
        const before=JSON.stringify(S),frame=pxWorldSurface(S,{}),old=oldFrame(S),snap=pxWorldSurface(JSON.parse(before),{});
        if(!previewOnly) {
          assert.equal(JSON.stringify(S),before,'renderer mutates punch');assert.deepEqual(frame.data,snap.data);rasters++;
          let visible=0;for(let p=0;p<frame.data.length;p+=4)if(!frame.data.subarray(p,p+4).every((v,k)=>v===old.data[p+k]))visible++;
          if(active&&kind==='whiff'){assert(visible>=300,'straight punch lacks a native-size wake: '+[ch,owner,dir,f.move,f.mt,visible]);minVisible=Math.min(minVisible,visible);}
          if(!active)assert.deepEqual(frame.data,old.data,'wake leaked into windup/recovery');
          const body=new PixelSurface(640,360);
          for(const actor of S.f) {
            const fr=pxFighterFrame(ch,pxPose(S,actor),actor.i===1),scale=actor.big>0?1.3:1;
            body.blit(fr.sprite,Math.round(actor.x/2)-(actor.face<0?fr.sprite.w-1-fr.ox:fr.ox)*scale,Math.round(actor.y/2)-fr.oy*scale,scale,actor.face<0);
          }
          for(let p=0;p<body.data.length;p+=4)if(body.data[p+3])assert.deepEqual(frame.data.subarray(p,p+4),old.data.subarray(p,p+4),'wake painted over a body');
          if(active&&ch===0&&kind==='whiff')for(const freeze of ['hitstop','freeze','stop']) {
            const F=JSON.parse(before),mt=f.mt;
            if(freeze==='stop')F.stop={o:1-owner,t:3};else F[freeze]=3;
            const held=new PixelSurface(144,128);pxStraightPunchWake(held,{...F.f[owner],x:128,y:240});
            for(let t=0;t<3;t++){step(F,[0,0]);assert.equal(F.f[owner].mt,mt);const wake=new PixelSurface(144,128);pxStraightPunchWake(wake,{...F.f[owner],x:128,y:240});assert.deepEqual(wake.data,held.data);holds++;}
          }
        }
        if(output&&ch===previewCh&&dir===(owner?-1:1)&&[3,4,6,7].includes(f.mt))for(const stage of PX_STAGES) {
          const view=pxWorldSurface({...S,stage:stage.id},FX);view.blit(pxHUDSurface(S,controls,FX),0,0);
          writePNG(output+'/'+prefix+'-'+f.move+'-'+kind+'-'+stage.id+'-'+(dir>0?'right':'left')+'-t'+f.mt+'.png',view);
        }
      }
    }
    if(n>1&&second&&f.st==='idle')break;
  }
  assert.equal(connected.size,kind==='whiff'?0:2);assert.equal(f.mt,16);for(const move of ['p1','p2'])for(let t=4;t<7;t++)assert(seen.has(move+':'+t));timelines++;
}
if(!previewOnly) {
  for(let ch=0;ch<15;ch++)for(const big of [0,60])for(const move of ['p1','p2'])for(const age of [4,5,6]) {
    const f=newFighter(0,ch);Object.assign(f,{x:640,y:GROUND,st:'atk',move,mt:age,big});
    const a=new PixelSurface(640,360),b=new PixelSurface(640,360);pxStraightPunchWake(a,f);pxStraightPunchWake(b,{...f,face:-1});
    for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
      const p=(y*640+x)*4,q=(y*640+640-x)*4;
      if(x>0&&!big)for(let k=0;k<4;k++)assert.equal(a.data[p+k],b.data[q+k],'root reflection');
      if(a.data[p+3])assert(y<GROUND/2&&a.data[p+3]===255,'wake below floor or soft alpha');
    }
    for(const st of ['idle','hit','stun','down','ko','cast']){const s=new PixelSurface(144,128);pxStraightPunchWake(s,{...f,x:128,y:240,st});assert(s.data.every(v=>v===0));}
  }
  const S=newMatch(14,14,947);S.phase='fight';S.t=120;
  Object.assign(S.f[0],{st:'atk',move:'p1',mt:4,face:1});
  for(const move of ['p1','p2'])for(const x of [60,60.5,640,1219.5,1220])for(const dir of [-1,1]) {
    const cell=new PixelSurface(200,128),actual=new PixelSurface(640,360),expected=new PixelSurface(640,360);
    pxStraightPunchWake(cell,{...S.f[0],move,x:200,y:240,face:dir});pxStraightPunchWake(actual,{...S.f[0],move,x,face:dir});
    expected.blit(cell,Math.round(x/2)-100,GROUND/2-120);assert.deepEqual(actual.data,expected.data,'edge/fractional root');
  }
  for(const move of ['p3','k','jp','jk','a0','a1','a2']) {
    const cell=new PixelSurface(144,128);pxStraightPunchWake(cell,{...S.f[0],x:128,y:240,move});assert(cell.data.every(v=>v===0),'wake leaked into another move');
  }
  for(const kind of ['white','black']) {
    const fx={impact:{kind,t:0,sil:4,a:0}},actual=pxWorldSurface(S,fx);
    const reference=new PixelSurface(640,360);reference.rect(0,0,640,360,kind==='black'?'#111623':'#f8edce');
    for(const f of S.f)pxPaintFighter(reference,S,f,fx.impact);
    assert.deepEqual(actual.data,reference.data,'wake spoils the existing impact silhouette');
  }
  S.f[0].inv=5;assert.deepEqual(pxWorldSurface(S,{}).data,oldFrame(S).data,'wake survives an invisible recovery blink');
  console.log('PASS',timelines,'real two-punch whiff/hit/block chains;',ticks,'parallel-state ticks;',rasters,'native frames/snapshots;',holds,'freeze holds;',contacts,'contacts; minimum visible wake',minVisible,'pixels; unchanged windup/recovery and both bodies, reflections, giant bounds, hard alpha/floor bounds, 20 edge crops and interruption cleanup');
}
`)(assert,writePNG,output,prefix,previewOnly,oldFrame,previewCh);
