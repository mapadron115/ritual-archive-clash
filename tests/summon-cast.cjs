// Input-driven summon anticipation/release, exact native rasters and snapshots.
// Scripted renderer evidence; no browser motion or human play claim.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const old=p=>require('node:child_process').execFileSync('git',['show','5b13f98:'+p],{cwd:root,encoding:'utf8'});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation'];
const source=read=>names.map(n=>read('src/'+n+'.js')).join('\n');
const prior=Function(source(old)+'\nreturn {pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface};')();
Function('assert','prior','writePNG','output','baseline','previewOnly',source(baseline?old:p=>fs.readFileSync(path.join(root,p),'utf8'))+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0,identicalScenes=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(n,slot,face){const S=newMatch(3,3,119);S.phase='fight';S.t=120;const f=S.f[slot],o=S.f[1-slot];f.x=face>0?360:920;f.face=face;o.x=f.x+face*380;o.face=-face;f.ce=100;return {S,f,o,n};}
function overlap(a,b){let common=0,union=0;for(let p=3;p<a.data.length;p+=4){common+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}return common/union;}
function paint(S,f){const before=JSON.stringify(S),s=new PixelSurface(640,360);pxPaintFighter(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
group('summons visibly leave the loaded seal on the actual summon tick',()=>{
  for(let n=0;n<3;n++)for(const slot of [0,1])for(const face of [-1,1]) {
    const {S,f}=setup(n,slot,face),m=CH[3].arts[n];let load,release,event;
    for(let t=0;t<18;t++) {
      S.ev=[];const input=[0,0];if(t===0)input[slot]=BTN['A'+(n+1)]<<INPUT_SHIFT;step(S,input);
      if(f.mt===m.su-1)load=pxPose(S,f);
      if(S.ev.some(e=>e.k==='summon')){release=pxPose(S,f);event=f.mt;break;}
    }
    assert.equal(event,12,'summon timing changed');assert(load&&release);
    assert.notEqual(load,release,'load and summon release use the same '+release+' body');
    assert(overlap(pxSprite(3,load,!!slot),pxSprite(3,release,!!slot))<.7,'seal barely unfolds');
    assert.equal(load,'summoncoil');assert.equal(release,'summonseal');
  }
});
group('real inputs keep costs, summon results, recovery and freeze-held snapshots',()=>{
  for(let n=0;n<3;n++)for(const slot of [0,1])for(const face of [-1,1]) {
    const {S,f}=setup(n,slot,face),control=JSON.parse(JSON.stringify(S)),m=CH[3].arts[n];let fired=0,started=false;
    const seen=new Set();
    for(let t=0;t<85;t++) {
      const input=[0,0];if(t===0)input[slot]=BTN['A'+(n+1)]<<INPUT_SHIFT;
      S.ev=[];control.ev=[];step(S,input);step(control,input);ticks++;
      assert.equal(JSON.stringify(S),JSON.stringify(control));
      if(S.ev.some(e=>e.k==='cast'))started=true;
      if(S.ev.some(e=>e.k==='summon')){fired++;assert.equal(f.mt,m.su);}
      if(f.st==='atk') {
        const pose=pxPose(S,f);seen.add(pose);
        const snap=JSON.parse(JSON.stringify(S));snap.ev=[];assert.equal(pxPose(snap,snap.f[slot]),pose);
        const a=paint(S,f),b=paint(snap,snap.f[slot]);assert.deepEqual(a.data,b.data);
        for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(a.data[(y*640+x)*4+3])assert(y<=GROUND/2&&y>185&&x>80&&x<540,'clipped/floating/below-floor body');
        if([m.su-1,m.su].includes(f.mt))for(const pause of ['hitstop','freeze','stop']) {
          if(pause==='stop'){S.stop={o:1-slot,t:3};control.stop={...S.stop};}else S[pause]=control[pause]=3;
          const mt=f.mt;
          for(let k=0;k<3;k++){step(S,[0,0]);step(control,[0,0]);assert.equal(f.mt,mt);assert.equal(pxPose(S,f),pose);assert.equal(JSON.stringify(S),JSON.stringify(control));holds++;}
        }
      }else if(started){assert.equal(f.mt,m.su+m.re);break;}
    }
    assert(started);assert.equal(fired,1);assert.equal(f.st,'idle');
    assert.equal(seen.size,5,'expected gather/coil/seal/recoil/settle');
  }
});
group('interruption, other arts, Domain casts, portraits and old sprite defaults remain exact',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]) {
    const S=newMatch(ch,ch,119);S.phase='fight';const f=S.f[slot];
    for(let n=0;n<3;n++) {startMove(f,'a'+n);const m=moveDef(f);
      for(let mt=0;mt<m.su+m.re;mt++) {f.mt=mt;
        if(ch===3&&mt>=6&&mt<15)continue;
        assert.equal(pxPose(S,f),prior.pose(S,f),'unrelated art phase changed '+ch+' '+n+' '+mt);defaults++;
      }
    }
    for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko','cast'])for(const t of [1,7,15,35,60]) {
      f.st=st;f.stT=t;f.mt=t;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;
    }
    f.portrait=true;f.st='atk';f.move='a0';f.mt=11;assert.equal(pxPose(S,f),'idle');
    if(!previewOnly)for(const pose of prior.poses){assert.deepEqual(pxSprite(ch,pose,!!slot).data,prior.sprite(ch,pose,!!slot).data,'old/mobile sprite changed');defaults++;}
  }
  for(const n of [0,1,2])for(const mt of [6,11,12,14]) {
    const {S,f,o}=setup(n,0,1);startMove(f,'a'+n);f.mt=mt;hit(S,1,f,o.x,{dmg:32,stun:15});
    assert.equal(pxPose(S,f),prior.pose(S,f),'summon pose survives interruption');
    newRound(S);assert.equal(pxPose(S,S.f[0]),prior.pose(S,S.f[0]));
  }
});
group('native world differences stay inside the summoner at coil/release only',()=>{
  for(let n=0;n<3;n++)for(const slot of [0,1])for(const face of [-1,1]) {
    const {S,f}=setup(n,slot,face);S.stage=slot?'gallery':'courtyard';
    const times=new Set([1,6,11,12,14,15,16,CH[3].arts[n].su+CH[3].arts[n].re-1]);
    for(let t=0;t<85&&times.size;t++) {
      S.ev=[];const input=[0,0];if(t===0)input[slot]=BTN['A'+(n+1)]<<INPUT_SHIFT;step(S,input);
      if(f.st!=='atk'||!times.has(f.mt))continue;times.delete(f.mt);
      const before=JSON.stringify(S),a=pxWorldSurface(S,neutral),b=prior.world(S,neutral);assert.equal(JSON.stringify(S),before);rasters+=2;
      let changed=0;
      for(let y=0;y<360;y++)for(let x=0;x<640;x++) {const p=(y*640+x)*4;
        if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])) {
          changed++;assert(Math.abs(x-f.x/2)<72&&y>=f.y/2-128&&y<=f.y/2,'difference outside summon body');
        }
      }
      if(!baseline&&f.mt>=6&&f.mt<15){assert(changed>200,'change does not read at native size');changedScenes++;}
      else {assert.equal(changed,0,'unrelated frame changed');identicalScenes++;}
    }
    assert.equal(times.size,0);
  }
});
if(output)for(const [n,slot,stage] of [[0,0,'courtyard'],[1,0,'courtyard'],[2,0,'courtyard'],[0,1,'gallery']]) {
  const randomBase=Math.random;let fxSeed=119+n*10+slot;Math.random=()=>((fxSeed=(fxSeed*1664525+1013904223)>>>0)/4294967296);
  const {S,f}=setup(n,slot,slot?-1:1);S.stage=stage;const m=CH[3].arts[n],samples=[],times=new Set([1,6,11,12,16,m.su+m.re-1]);
  FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];
  FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
  const tag='v119-'+(baseline?'before':'after')+'-'+m.id+'-p'+(slot+1)+'-'+stage;
  for(let t=0;t<85;t++) {
    S.ev=[];const input=[0,0];if(t===0)input[slot]=BTN['A'+(n+1)]<<INPUT_SHIFT;step(S,input);for(const e of S.ev)fxEvent(S,e);fxTick();
    if(f.st==='atk'&&times.has(f.mt)) {
      times.delete(f.mt);const scene=pxWorldSurface(S);const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';scene.blit(pxHUDSurface(S,labs,FX),0,0);
      writePNG(output+'/'+tag+'-t'+f.mt+'.png',scene);samples.push({scene,t:f.mt,pose:pxPose(S,f)});
    }
    if(!times.size)break;
  }
  assert.equal(samples.length,6);
  const strip=new PixelSurface(3840,386);strip.rect(0,0,strip.w,strip.h,PX_INK);
  const bodies=new PixelSurface(864,154);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
  samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(3,pose,!!slot),i*144,0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});
  writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
  Math.random=randomBase;
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,identicalScenes,baseline}));
if(failed&&!previewOnly)throw Error('summon-cast audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
