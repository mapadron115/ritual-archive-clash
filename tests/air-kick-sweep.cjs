// Input-driven jumping kicks and native-size scenes. Script evidence, never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'air-kick';
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const oldWorld=require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'});
const source=names.map(n=>baseline&&n==='pixel-world'?oldWorld:read(n)).join('\n');
// Suppression makes the visibility assertion useful after this version is committed.
const plain=Function(source+'\nif(typeof pxAirKickSweep===\'function\')pxAirKickSweep=()=>{};return S=>pxWorldSurface(S,{});')();
const seededMath=Object.create(Math);seededMath.random=()=>{seededMath.seed=(Math.imul(seededMath.seed,1664525)+1013904223)>>>0;return seededMath.seed/4294967296;};
Function('assert','writePNG','output','prefix','previewOnly','plain','Math',source+'\n'+`
const controls=[{move:'AD',U:'W',G:'S',P:'F',K:'G'},{move:'<>',U:'^',G:'V',P:'1',K:'2'}];
const changed=(a,b)=>{let n=0;for(let p=0;p<a.data.length;p+=4)if(!a.data.subarray(p,p+4).every((v,k)=>v===b.data[p+k]))n++;return n;};
function reset(){Math.seed=42;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.flash=FX.shake=0;FX.silent=true;}
let timelines=0,ticks=0,rasters=0,holds=0,contacts=0,minVisible=Infinity;
for(let ch=0;ch<15;ch++)for(const owner of [0,1])for(const dir of [-1,1])for(const [kind,delay] of [['whiff',0],['whiff',15],['whiff',29],['hit',25],['block',25]]) {
  if(previewOnly&&(ch!==0&&ch!==14||dir!==(owner?-1:1)))continue;
  reset();const S=newMatch(ch,ch,947);S.phase='fight';S.t=120;S.stage=PX_STAGES[ch%3].id;
  const f=S.f[owner],o=S.f[1-owner];f.x=dir>0?540:740;o.x=f.x+dir*(kind==='whiff'?300:60);f.face=dir;o.face=-dir;
  const B=JSON.parse(JSON.stringify(S)),seen=new Set();let connected=false;
  for(let n=0;n<100;n++) {
    const input=[0,0];input[owner]=n===0?BTN.U<<INPUT_SHIFT:n===delay+1?BTN.K<<INPUT_SHIFT:0;input[1-owner]=kind==='block'?BTN.G:0;
    S.ev=[];B.ev=[];step(S,input);step(B,input);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B));
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(S.ev.some(e=>e.k===(kind==='block'?'block':'hit'))){connected=true;contacts++;}
    if(f.move==='jk'&&!seen.has(f.mt)) {
      seen.add(f.mt);const active=f.st==='atk'&&f.y<GROUND&&f.mt>=BASIC.jk.su&&f.mt<BASIC.jk.su+BASIC.jk.ac;
      if(active||[0,5,14,18,22].includes(f.mt)) {
        const state=JSON.stringify(S),effects=JSON.stringify(FX),frame=pxWorldSurface(S,{}),old=plain(S);
        if(!previewOnly) {
          const visible=changed(frame,old);
          if(active&&kind==='whiff'&&delay===0&&f.mt<10){assert(visible>=180,'air kick lacks a visible boot sweep: '+[ch,owner,dir,f.mt,visible]);minVisible=Math.min(minVisible,visible);}
          if(!active)assert.deepEqual(frame.data,old.data,'sweep survives windup, recovery or landing');
          assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
          assert.deepEqual(frame.data,pxWorldSurface(JSON.parse(state),{}).data);rasters++;
          const bodies=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(bodies,S,actor,null);
          for(let p=0;p<bodies.data.length;p+=4)if(bodies.data[p+3])assert.deepEqual(frame.data.subarray(p,p+4),old.data.subarray(p,p+4),'sweep covers fighter');
          if(active&&ch===0&&kind==='whiff'&&delay===0)for(const freeze of ['hitstop','freeze','stop']) {
            const F=JSON.parse(state),held=new PixelSurface(200,160);pxAirKickSweep(held,{...f,x:200,y:280});
            if(freeze==='stop')F.stop={o:1-owner,t:3};else F[freeze]=3;
            for(let t=0;t<3;t++){step(F,[0,0]);assert.equal(F.f[owner].mt,f.mt);assert.equal(F.f[owner].y,f.y);const wake=new PixelSurface(200,160);pxAirKickSweep(wake,{...F.f[owner],x:200,y:280});assert.deepEqual(wake.data,held.data);holds++;}
          }
        }
        if(output&&(ch===0||ch===14)&&dir===(owner?-1:1)&&delay!==29&&[0,5,6,8,11,13,14].includes(f.mt))for(const stage of PX_STAGES) {
          const view=pxWorldSurface({...S,stage:stage.id},FX);view.blit(pxHUDSurface(S,controls,FX),0,0);
          writePNG(output+'/'+prefix+'-ch'+ch+'-'+kind+'-d'+delay+'-'+stage.id+'-'+(dir>0?'right':'left')+'-t'+f.mt+'.png',view);
        }
      }
    }
    if(n>delay+2&&f.st==='idle')break;
  }
  assert.equal(connected,kind!=='whiff');assert.equal(f.y,GROUND);assert.equal(f.st,'idle');
  const end=pxWorldSurface(S,{});if(!previewOnly)assert.deepEqual(end.data,plain(S).data,'sweep retained after landing');timelines++;
}
if(!previewOnly){
  let shapes=0;
  for(let ch=0;ch<15;ch++)for(const big of [0,60])for(let age=6;age<14;age++) {
    const f=newFighter(0,ch);Object.assign(f,{x:640,y:480,st:'atk',move:'jk',mt:age,big});
    const a=new PixelSurface(640,360),b=new PixelSurface(640,360);pxAirKickSweep(a,f);pxAirKickSweep(b,{...f,face:-1});
    for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
      const p=(y*640+x)*4,q=(y*640+640-x)*4;
      if(x>0&&!big)for(let k=0;k<4;k++)assert.equal(a.data[p+k],b.data[q+k],'root reflection');
      if(a.data[p+3])assert(y>150&&y<240&&a.data[p+3]===255,'sweep reaches face/root or soft alpha');
    }
    for(const st of ['idle','hit','stun','down','ko','cast','jump']){const s=new PixelSurface(144,128);pxAirKickSweep(s,{...f,x:128,y:240,st});assert(s.data.every(v=>v===0),'interruption leaves sweep');}
    for(const move of ['p1','p2','p3','k','jp','a0','a1','a2']){const s=new PixelSurface(144,128);pxAirKickSweep(s,{...f,x:128,y:240,move});assert(s.data.every(v=>v===0),'sweep leaks into other move');}
    const grounded=new PixelSurface(144,128);pxAirKickSweep(grounded,{...f,y:GROUND});assert(grounded.data.every(v=>v===0));shapes++;
  }
  const S=newMatch(14,14,947);S.phase='fight';S.t=120;Object.assign(S.f[0],{st:'atk',move:'jk',mt:6,y:480,face:1});
  for(let ch=0;ch<15;ch++) {
    let previous=Infinity;
    for(let age=9;age<14;age++) {
      const cell=new PixelSurface(144,128);pxAirKickSweep(cell,{...S.f[0],ch,x:128,y:240,mt:age});
      let area=0;for(let p=3;p<cell.data.length;p+=4)area+=!!cell.data[p];
      assert(area<previous,'late sweep does not contract toward boot');previous=area;
    }
  }
  for(const big of [0,60])for(const x of [60,60.5,640,1219.5,1220])for(const dir of [-1,1]) {
    const cell=new PixelSurface(200,160),actual=new PixelSurface(640,360),expected=new PixelSurface(640,360);
    const f={...S.f[0],x,face:dir,big};pxAirKickSweep(cell,{...f,x:200,y:280});pxAirKickSweep(actual,f);
    expected.blit(cell,Math.round(x/2)-100,Math.round(f.y/2)-140);assert.deepEqual(actual.data,expected.data,'fractional/edge crop');
  }
  for(const kind of ['white','black']) {
    const impact={kind,t:0,sil:4,a:0},actual=pxWorldSurface(S,{impact}),reference=new PixelSurface(640,360);
    reference.rect(0,0,640,360,kind==='black'?'#111623':'#f8edce');for(const f of S.f)pxPaintFighter(reference,S,f,impact);
    assert.deepEqual(actual.data,reference.data,'sweep spoils impact silhouette');
  }
  console.log('PASS',timelines,'real early/crest/late/hit/block jumping-kick timelines;',ticks,'parallel-state ticks;',rasters,'native frame/snapshot checks;',contacts,'contacts;',holds,'freeze holds;',shapes,'normal/enlarged hard-alpha shapes; minimum first-half whiff sweep',minVisible,'pixels; both bodies intact, 20 fractional/edge crops, interruption, landing and impact silhouettes');
}
`)(assert,writePNG,output,prefix,previewOnly,plain,seededMath);
