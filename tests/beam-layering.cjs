// Real beam inputs and native scene comparisons. Script evidence, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,prefix=process.argv[3]||'beam';
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const read=n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8');
const old=n=>require('node:child_process').execFileSync('git',['show','04be1ca:src/'+n+'.js'],{cwd:root,encoding:'utf8'});
const oldStep=Function(['sim','fighters','fighters2'].map(old).join('\n')+'\nreturn step;')();
const oldWorld=Function(names.map(n=>n==='pixel-world'?old(n):read(n)).join('\n')+'\nreturn pxWorldSurface;')();
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','previewOnly','oldStep','oldWorld','Math',names.map(n=>baseline&&n==='pixel-world'?old(n):read(n)).join('\n')+'\n'+`
function reset(){for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];FX.nope=[0,0];FX.impact=FX.bf=FX.banner=null;FX.shake=FX.flash=0;FX.silent=true;}
const pixels=s=>new Uint32Array(s.data.buffer,s.data.byteOffset,s.w*s.h);
let timelines=0,ticks=0,frames=0,revealed=0,minLane=Infinity;
for(const id of ['granite','piercing','apshot','nuclear','bloodsweep'])for(const owner of [0,1])for(const dir of [-1,1])for(const mode of ['hit','guard','wall']) {
  reset();const maximum=['nuclear','bloodsweep'].includes(id),ch=CH.findIndex(c=>maximum?c.dom.kind===id:c.arts.some(a=>a.id===id));
  const S=newMatch(ch,ch,193);S.phase='fight';S.t=140;const f=S.f[owner],o=S.f[1-owner];
  f.x=dir>0?300:980;o.x=f.x+dir*520;f.face=dir;o.face=-dir;f.gauge=100;
  if(mode==='wall')o.x=dir>0?RIGHT:LEFT;
  const B=JSON.parse(JSON.stringify(S)),initial=o.hp;let fired=false,ended=false;const seen=new Set();
  for(let tick=0;tick<220;tick++) {
    const input=[0,0];if(tick===0)input[owner]=(maximum?BTN.DOM:BTN['A'+(CH[ch].arts.findIndex(a=>a.id===id)+1)])<<INPUT_SHIFT;
    if(mode==='guard')input[1-owner]=BTN.G;
    S.ev=[];B.ev=[];step(S,input);oldStep(B,input);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(B),'combat changed');
    for(const e of S.ev)fxEvent(S,e);fxTick();
    const z=S.zones.find(z=>z.k==='beam');if(z)fired=true;
    if(z&&!seen.has(z.t)&&[1,4,8,z.dur-1].includes(z.t)) {
      seen.add(z.t);
      for(const stage of PX_STAGES) {
        S.stage=B.stage=stage.id;const state=JSON.stringify(S),effects=JSON.stringify(FX);
        const frame=pxWorldSurface(S,FX),plain=pxWorldSurface({...S,zones:S.zones.filter(q=>q.k!=='beam')},FX),before=oldWorld(S,FX);
        if(!previewOnly) {
          assert.equal(JSON.stringify(S),state);assert.equal(JSON.stringify(FX),effects);
          assert.deepEqual(pxWorldSurface(JSON.parse(state),JSON.parse(effects)).data,frame.data,'snapshot differs');
          const body=new PixelSurface(640,360),impact=FX.impact&&FX.impact.t<FX.impact.sil?FX.impact:null;
          for(const actor of S.f)pxPaintFighter(body,S,actor,impact);
          const a=pixels(frame),b=pixels(plain),c=pixels(body),d=pixels(before);let visible=0,uncovered=0;
          for(let p=0;p<a.length;p++) {
            if(c[p]){assert.equal(a[p],b[p],id+' beam hides a fighter');if(a[p]!==d[p])uncovered++;}
            else assert.equal(a[p],d[p],'changed pixels outside bodies');
            if(a[p]!==b[p])visible++;
          }
          assert(visible>100,'beam lane disappears');minLane=Math.min(minLane,visible);revealed+=uncovered;frames++;
        }
        if(output&&((owner===0&&dir===1&&mode==='hit')||(owner===1&&dir===-1&&mode==='guard'))) {
          frame.blit(pxHUDSurface(S,[null,null],FX),0,0);
          writePNG(output+'/'+prefix+'-'+id+'-'+stage.id+'-p'+(owner+1)+'-'+(dir>0?'right':'left')+'-'+mode+'-t'+z.t+'.png',frame);
        }
      }
    }
    if(fired&&!z){ended=true;break;}
  }
  assert(fired&&ended,'incomplete beam lifecycle');assert.equal(seen.size,4,'missing sampled age');
  assert(o.hp<initial,'expected real contact');timelines++;
}
if(!previewOnly) {
  assert(revealed>10000,'no reproduced occlusion');
  reset();const S=newMatch(0,1,193);S.phase='fight';S.t=140;
  for(const k of ['hit','block','swap','slash','dash','cuts'])for(const stage of PX_STAGES){reset();S.stage=stage.id;fxEvent(S,{k,x:450,y:500,a:700,b:480});assert.deepEqual(pxWorldSurface(S,FX).data,oldWorld(S,FX).data,'unrelated scene changed');}
  console.log('PASS 18 non-beam scenes unchanged');
}
console.log(previewOnly?'PREVIEW':'PASS',timelines,'real beam timelines;',ticks,'v100 state comparisons;',frames,'native/snapshot checks;',revealed,'revealed body pixels; minimum visible lane',minLane);
`)(assert,writePNG,output,prefix,previewOnly,oldStep,oldWorld,math);
