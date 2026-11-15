// Actual grounded hit timelines and native scene strips. Scripted, never played.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const old=p=>require('node:child_process').execFileSync('git',['show','0ecd0d7:'+p],{cwd:root,encoding:'utf8'});
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'];
const source=read=>names.map(n=>read('src/'+n+'.js')).join('\n');
const prior=Function(source(old)+'\nreturn {pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),paint:pxPaintFighter,world:pxWorldSurface};')();
const extra=path.join(root,'src/desktop-animation.js');
const code=source(baseline?old:p=>fs.readFileSync(path.join(root,p),'utf8'))+
  (!baseline&&fs.existsSync(extra)?'\n'+fs.readFileSync(extra,'utf8'):'');
Function('assert','prior','writePNG','output','baseline','previewOnly',code+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(ch,slot,face){const S=newMatch(ch,ch,117);S.phase='fight';S.t=120;const f=S.f[slot],o=S.f[1-slot];f.x=640;f.face=face;o.x=f.x+face*100;o.face=-face;return {S,f,o};}
function overlap(a,b){let common=0,union=0;for(let p=3;p<a.data.length;p+=4){common+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}return common/union;}
function paint(S,f){const before=JSON.stringify(S),s=new PixelSurface(640,360);pxPaintFighter(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
group('ordinary jab shows a head snap, folded brace and rising return',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const face of [-1,1]) {
    const {S,f,o}=setup(ch,slot,face);o.x=f.x+face*60;
    const poses=new Set();let connected=false;
    for(let n=0;n<65;n++) {
      const input=[0,0];if(n===0)input[o.i]=BTN.P<<INPUT_SHIFT;
      S.ev=[];step(S,input);ticks++;
      if(S.ev.some(e=>e.k==='hit'))connected=true;
      if(f.st==='hit')poses.add(pxPose(S,f));
      if(connected&&f.st!=='hit')break;
    }
    assert(connected,'jab failed to connect');
    assert.equal(poses.size,3,'jab recovery has only '+poses.size+' poses: '+[...poses]);
    const [reel,brace,rise]=[...poses].map(p=>pxSprite(ch,p,!!slot));
    assert(overlap(reel,brace)<.65,'head snap and brace remain one stiff silhouette');
    assert(overlap(brace,rise)<.8,'brace does not rise');
  }
});
group('all builds/costumes/facings: damage, recovery, snapshots and freeze-held poses',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1])for(const face of [-1,1])for(const stun of [8,15,16,22,40]) {
    const {S,f,o}=setup(ch,slot,face);hit(S,o.i,f,o.x,{dmg:32,kb:3,stun});
    const control=JSON.parse(JSON.stringify(S)),hp=f.hp;let active=0,frames=0;
    while(f.st==='hit'&&frames++<120) {
      const pose=pxPose(S,f),snap=JSON.parse(JSON.stringify(S));snap.ev=[];
      assert.equal(pxPose(snap,snap.f[slot]),pose,'snapshot needs event history');
      if(!previewOnly&&[stun,10,5,1].includes(f.stT)) {
        const body=paint(S,f),other=paint(snap,snap.f[slot]);assert.deepEqual(body.data,other.data);
        let count=0;for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(body.data[(y*640+x)*4+3]){count++;assert(y<=GROUND/2,'calf below floor');assert(x>250&&x<390&&y>175,'clipped reaction');}assert(count>500);
      }
      if(f.stT===stun&&!S.hitstop&&active===0) {
        for(const pause of ['hitstop','freeze','stop']) {
          if(pause==='stop'){S.stop={o:o.i,t:3};control.stop={...S.stop};}else S[pause]=control[pause]=3;
          for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(pxPose(S,f),pose);assert.equal(f.stT,stun);holds++;}
        }
      }
      if(!S.hitstop&&!S.freeze&&!(S.stop&&S.stop.t>0&&S.stop.o!==slot))active++;
      step(S,[0,0]);step(control,[0,0]);ticks++;assert.equal(JSON.stringify(S),JSON.stringify(control));
    }
    assert.equal(f.st,'idle');assert.equal(active,stun);assert.equal(f.hp,hp);
    assert.equal(pxPose(S,f),prior.pose(S,f),'reaction leaked after recovery');
  }
});
group('non-ground-hit states and shared/mobile sprite defaults remain exact',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]) {
    const {S,f}=setup(ch,slot,slot?-1:1);
    for(const st of ['idle','walk','jump','block','stun','down','ko','guard','cast','atk'])for(const t of [1,7,15,35,60]) {
      f.st=st;f.stT=t;f.mt=t;f.move='p1';assert.equal(pxPose(S,f),prior.pose(S,f));
    }
    for(const vy of [-15,-5,0,6,12]){f.st='hit';f.y=GROUND-50;f.vy=vy;assert.equal(pxPose(S,f),prior.pose(S,f));}
    f.portrait=true;f.st='hit';f.y=GROUND;assert.equal(pxPose(S,f),prior.pose(S,f));
    if(!previewOnly)for(const pose of prior.poses){assert.deepEqual(pxSprite(ch,pose,!!slot).data,prior.sprite(ch,pose,!!slot).data,'existing/mobile sprite changed '+ch+' '+pose);defaults++;}
  }
});
// Native scenes use an actual jab/kick into the real simulation, including hit FX.
if(output)for(const move of ['p1','k'])for(const slot of [0,1])for(const stage of ['courtyard','gallery']) {
  const {S,f,o}=setup(slot?14:0,slot,slot?-1:1);S.stage=stage;o.x=f.x+f.face*70;startMove(o,move);
  FX.silent=true;for(const k of ['parts','rings','lines','contacts','dust','ghosts','stars','puffs','nums','words'])FX[k]=[];
  FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.nope=[0,0];
  const samples=[],times=new Set(move==='p1'?[14,11,10,6,5,1]:[21,16,10,6,5,1]);let connected=false;
  for(let n=0;n<100;n++) {
    S.ev=[];step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);fxTick();
    if(S.ev.some(e=>e.k==='hit'))connected=true;
    if(connected&&!S.hitstop&&f.st==='hit'&&times.has(f.stT)) {
      times.delete(f.stT);const scene=pxWorldSurface(S);const labs=[{P:'F',K:'G',G:'S',A1:'R',A2:'T',A3:'Y',DOM:'H',move:'A/D',U:'W'},null];labs.other='Computer';scene.blit(pxHUDSurface(S,labs,FX),0,0);
      const name='v117-'+(baseline?'before':'after')+'-'+move+'-p'+(slot+1)+'-'+stage+'-remaining'+f.stT;
      writePNG(output+'/'+name+'.png',scene);samples.push({scene,t:f.stT,pose:pxPose(S,f)});
    }
    if(connected&&f.st!=='hit')break;
  }
  assert.equal(samples.length,6,'preview missed timeline');
  const strip=new PixelSurface(640*6,386);strip.rect(0,0,strip.w,strip.h,PX_INK);
  samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'REMAINING '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);});
  writePNG(output+'/v117-'+(baseline?'before':'after')+'-'+move+'-p'+(slot+1)+'-'+stage+'-strip.png',strip);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,baseline}));
if(failed&&!previewOnly)throw Error('ground-hit audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);
