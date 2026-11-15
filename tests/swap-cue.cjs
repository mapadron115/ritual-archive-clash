// Real transfer inputs and native rasters. This is script evidence, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'swap';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const old=n=>require('node:child_process').execFileSync('git',['show','35b4942:src/'+n+'.js'],{cwd:root,encoding:'utf8'});
const oldStep=Function(['sim','fighters','fighters2'].map(old).join('\n')+'\nreturn step;')();
const oldWorld=Function(names.map(n=>n==='pixel-world'?old(n):read(n)).join('\n')+'\nreturn pxWorldSurface;')();
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','previewOnly','oldStep','oldWorld','Math',names.map(n=>baseline&&['pixel-world','render'].includes(n)?old(n):read(n)).join('\n')+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const pixels=s=>new Uint32Array(s.data.buffer,s.data.byteOffset,s.w*s.h);
let timelines=0,ticks=0,frames=0,minVisible=Infinity,events=0;
for(const id of ['boogie','applause','stone','trick','rewind','ovation'])for(const owner of [0,1])for(const dir of [-1,1])for(const mode of (id==='boogie'||id==='trick'?['ground','air','wall']:['ground'])) {
  reset();const ch=CH.findIndex(c=>id==='ovation'?c.dom.kind===id:c.arts.some(a=>a.id===id)),S=newMatch(ch,ch,427);S.phase='fight';S.t=140;
  const f=S.f[owner],o=S.f[1-owner];f.x=dir>0?380:900;o.x=f.x+dir*360;f.face=dir;o.face=-dir;f.gauge=100;
  if(mode==='air'){f.y=GROUND-160;f.st='jump';f.air=1;}
  if(mode==='wall'){f.x=dir>0?LEFT:RIGHT;o.x=dir>0?RIGHT:LEFT;}
  if(id==='rewind')f.hist=Array.from({length:10},()=>[f.x-dir*200,maxHp(f)]);
  const B=JSON.parse(JSON.stringify(S)),art=id==='ovation'?-1:CH[ch].arts.findIndex(a=>a.id===id);
  let fired=false,seen=0;
  for(let tick=0;tick<(id==='ovation'?160:80);tick++) {
    const input=[0,0];if(tick===0||(id==='stone'&&tick===30))input[owner]=(art<0?BTN.DOM:BTN['A'+(art+1)])<<INPUT_SHIFT;
    S.ev=[];B.ev=[];step(S,input);oldStep(B,input);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B),'combat changed');
    for(const e of S.ev)fxEvent(S,e);fxTick();
    if(S.ev.some(e=>e.k==='swap')){fired=true;events+=S.ev.filter(e=>e.k==='swap').length;}
    if(!fired)continue;
    const line=FX.lines.find(l=>l.col==='#ffe9a0'),age=line?line.t:12;
    if(line)seen++;
    if([1,4,8,11,12].includes(age))for(const stage of PX_STAGES) {
      S.stage=B.stage=stage.id;const state=JSON.stringify(S),effects=JSON.stringify(FX);
      const frame=pxWorldSurface(S,FX),plain=pxWorldSurface(S,{...FX,lines:[]}),hud=pxHUDSurface(S,[null,null],FX);frame.blit(hud,0,0);plain.blit(hud,0,0);
      if(!previewOnly) {
        assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
        const snap=pxWorldSurface(JSON.parse(state),JSON.parse(effects));snap.blit(hud,0,0);assert.deepEqual(frame.data,snap.data);
        const body=new PixelSurface(640,360);for(const actor of S.f)pxPaintFighter(body,S,actor,null);
        const a=pixels(frame),b=pixels(plain),c=pixels(body);let visible=0;
        for(let p=0;p<a.length;p++){if(a[p]!==b[p])visible++;if(c[p])assert.equal(a[p],b[p],'transfer line covers a fighter');}
        if(id==='boogie'&&age<=4){assert(visible>=200,'transfer vanishes at native size: '+visible);minVisible=Math.min(minVisible,visible);}
        if(age===12)assert.equal(visible,0);frames++;
      }
      if(output&&[1,4,8,11].includes(age)&&seen<13)writePNG(output+'/'+prefix+'-'+id+'-'+stage.id+'-p'+(owner+1)+'-'+(dir>0?'right':'left')+'-'+mode+'-t'+age+'.png',frame);
    }
    if(age===12&&id!=='ovation')break;
  }
  assert(fired,'no real transfer: '+id);assert(seen>=11);timelines++;
}
if(!previewOnly) {
  let crops=0;const areas=[];
  for(let t=0;t<=12;t++) {
    const l={kind:'swap',x1:400,y1:542,x2:880,y2:542,t,life:12},s=new PixelSurface(640,360);pxSwapCue(s,l);
    let area=0;for(let p=3;p<s.data.length;p+=4){assert(s.data[p]===0||s.data[p]===255);if(s.data[p])area++;}areas.push(area);
    const mirror=new PixelSurface(640,360);pxSwapCue(mirror,{...l,x1:880,x2:400});assert.deepEqual(s.data,mirror.data,'transfer depends on endpoint ordering');
    for(const dy of [-210,0,155])for(const x of [LEFT+.5,640,RIGHT-.5]) {
      const cue={...l,x1:x,x2:x+215.5,y2:l.y1+dy},full=new PixelSurface(1040,760),crop=new PixelSurface(640,360),expected=new PixelSurface(640,360);
      pxSwapCue(full,{...cue,x1:cue.x1+400,x2:cue.x2+400,y1:cue.y1+400,y2:cue.y2+400});expected.blit(full,-200,-200);pxSwapCue(crop,cue);assert.deepEqual(crop.data,expected.data);crops++;
    }
  }
  assert(areas[11]<areas[1]/4,'late cue keeps its full path');assert.equal(areas[12],0);
  for(const dy of [-200,0,200]){const s=new PixelSurface(640,360);pxSwapCue(s,{x1:640,x2:640,y1:450,y2:450+dy,t:1,life:12});if(!dy)assert(s.data.every(v=>!v));}
  reset();const S=newMatch(0,1,427);S.phase='fight';S.t=140;
  for(const kind of ['slash','dash','rain','cuts']){reset();fxEvent(S,{k:kind,x:450,y:500,a:700,b:480});for(const stage of PX_STAGES){S.stage=stage.id;assert.deepEqual(pxWorldSurface(S,FX).data,oldWorld(S,FX).data,'other line changed');}}
  console.log('PASS',crops,'edge/fractional/diagonal crops; hard alpha, endpoint symmetry, contraction/expiry, vertical/zero-distance safety; 12 unrelated line scenes unchanged');
}
console.log(previewOnly?'PREVIEW':'PASS',timelines,'actual transfer timelines;',events,'events;',ticks,'v99 state comparisons;',frames,'native/snapshot checks; minimum early Boogie visibility',minVisible,'pixels');
`)(assert,writePNG,output,prefix,previewOnly,oldStep,oldWorld,math);
