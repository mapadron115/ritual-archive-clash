// Real input-driven Nuclear Shell; renderer evidence, not browser motion or play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const output=process.argv.find(a=>a.startsWith('--out='))?.slice(6);
const names=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render','desktop-animation'];
const shared=names.map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const prior=Function(shared+'\nreturn {pose:pxPose,sprite:pxSprite,poses:Object.keys(PX_POSES),world:pxWorldSurface};')();
const adapter=baseline?'':fs.readFileSync(path.join(root,'src/desktop-maximum.js'),'utf8');
Function('assert','prior','writePNG','output','baseline','previewOnly',shared+'\n'+adapter+'\n'+`
let passed=0,failed=0,ticks=0,rasters=0,holds=0,defaults=0,changedScenes=0,identicalScenes=0;
const neutral={parts:[],rings:[],lines:[],contacts:[],dust:[],ghosts:[],stars:[],puffs:[],nums:[],words:[],flash:0};
function group(name,fn){try{fn();passed++;console.log('PASS',name);}catch(e){failed++;console.log('FAIL',name+':',e.message);}}
function setup(slot,face,ch=4){const S=newMatch(ch,ch,123);S.phase='fight';S.t=120;const f=S.f[slot],o=S.f[1-slot];f.x=face>0?360:920;f.face=face;o.x=f.x+face*380;o.face=-face;f.gauge=100;return {S,f,o};}
function overlap(a,b){let common=0,union=0;for(let p=3;p<a.data.length;p+=4){common+=!!a.data[p]&&!!b.data[p];union+=!!a.data[p]||!!b.data[p];}return common/union;}
function body(S,f){const before=JSON.stringify(S),s=new PixelSurface(640,360);pxPaintFighter(s,S,f,null);assert.equal(JSON.stringify(S),before);rasters++;return s;}
function advance(S,t,slot){const input=[0,0];if(t===0)input[slot]=BTN.DOM<<INPUT_SHIFT;S.ev=[];step(S,input);}

group('late charge visibly coils then braces before the actual tick-72 shot',()=>{
  for(const slot of [0,1])for(const face of [-1,1]) {
    const {S,f}=setup(slot,face),poses=new Map();let fired=0;
    for(let t=0;t<190;t++){advance(S,t,slot);if(!S.dom)break;
      if(!S.freeze&&[35,36,59,60,71,72,77,85].includes(S.dom.t))poses.set(S.dom.t,pxPose(S,f));
      if(S.ev.some(e=>e.k==='nuke')){fired++;assert.equal(S.dom.t,72);assert.equal(pxPose(S,f),'cannon');}
    }
    assert.equal(fired,1);assert.equal(poses.get(35),'cannonw');
    assert.notEqual(poses.get(59),poses.get(60),'body holds one pose through the final 36 charge ticks');
    assert.equal(poses.get(36),'nuclearcoil');assert.equal(poses.get(59),'nuclearcoil');
    assert.equal(poses.get(60),'nuclearbrace');assert.equal(poses.get(71),'nuclearbrace');
    assert.equal(poses.get(72),'cannon');assert.equal(poses.get(77),'cannonre');assert.equal(poses.get(85),'cannonsettle');
    for(const pair of [['cannonw','nuclearcoil'],['nuclearcoil','nuclearbrace'],['nuclearbrace','cannon']])
      assert(overlap(pxSprite(4,pair[0],!!slot),pxSprite(4,pair[1],!!slot))<.72,'indistinct '+pair);
  }
});

group('parallel real timelines preserve costs, damage, hit or block and frozen snapshots',()=>{
  for(const slot of [0,1])for(const face of [-1,1])for(const guarding of [false,true]) {
    const {S,f,o}=setup(slot,face),control=JSON.parse(JSON.stringify(S));let shots=0;
    for(let t=0;t<200;t++) {
      const input=[0,0];if(t===0)input[slot]=BTN.DOM<<INPUT_SHIFT;if(guarding)input[1-slot]=BTN.G;
      S.ev=[];control.ev=[];step(S,input);step(control,input);ticks++;
      const before=JSON.stringify(S);assert.equal(before,JSON.stringify(control));if(t===0){assert.equal(f.gauge,0);assert.equal(f.domUsed,1);}
      if(S.dom&&f.st==='cast') {
        const pose=pxPose(S,f),a=body(S,f),snapshot=JSON.parse(before);snapshot.ev=[];
        assert.equal(pxPose(snapshot,snapshot.f[slot]),pose);assert.deepEqual(body(snapshot,snapshot.f[slot]).data,a.data);
        if(!S.freeze&&[36,60,71].includes(S.dom.t))for(const pause of ['hitstop','freeze']) {
          S[pause]=control[pause]=3;
          const dt=S.dom.t;
          for(let k=0;k<3;k++){step(S,[0,0]);step(control,[0,0]);assert.equal(S.dom.t,dt);assert.equal(pxPose(S,f),pose);assert.equal(JSON.stringify(S),JSON.stringify(control));holds++;}
        }
      }
      if(S.ev.some(e=>e.k==='nuke')){shots++;assert.equal(S.dom.t,72);assert.equal(f.armor,0);}
      if(!S.dom&&t>0)break;
    }
    assert.equal(shots,1);assert.equal(f.domUsed,1);assert.equal(CH[o.ch].hp-o.hp,guarding?116:290);
    assert.equal(JSON.stringify(S),JSON.stringify(control));
  }
});

group('other Domains, all arts, interruptions and all old sprites remain exact',()=>{
  for(let ch=0;ch<15;ch++)for(const slot of [0,1]) {
    const {S,f,o}=setup(slot,1,ch);startDomain(S,f,o);
    for(const freeze of [60,40,20,0])for(const t of [1,12,35,36,59,60,71,72,77,85,99]) {
      S.freeze=freeze;S.dom.t=t;f.st='cast';
      const allout=ch===12&&t>=12&&t<40&&!S.dom.done;
      const voice=ch===6&&t>=12&&t<24;
      if(!allout&&!voice&&(ch!==4||t<36||t>=72||t<=1&&freeze>0)){assert.equal(pxPose(S,f),prior.pose(S,f),'unrelated Domain changed');defaults++;}
    }
    for(const st of ['idle','walk','jump','guard','block','hit','down','stun','ko']) {
      f.st=st;f.stT=20;assert.equal(pxPose(S,f),prior.pose(S,f),'cast covers interruption');defaults++;
    }
    for(let n=0;n<3;n++){startMove(f,'a'+n);const m=moveDef(f);for(let mt=0;mt<m.su+m.re;mt++){f.mt=mt;assert.equal(pxPose(S,f),prior.pose(S,f));defaults++;}}
    f.st='cast';S.dom={o:1-slot,k:'nuclear',t:60};assert.equal(pxPose(S,f),prior.pose(S,f));
    f.portrait=true;assert.equal(pxPose(S,f),'idle');f.portrait=false;newRound(S);assert.equal(pxPose(S,S.f[slot]),prior.pose(S,S.f[slot]));
    if(!previewOnly)for(const pose of prior.poses){assert.deepEqual(pxSprite(ch,pose,!!slot).data,prior.sprite(ch,pose,!!slot).data);defaults++;}
  }
  for(const slot of [0,1]){const {S,f,o}=setup(slot,1);startDomain(S,f,o);S.freeze=0;S.dom.t=60;o.gauge=100;startDomain(S,o,f);assert.equal(S.dom,null);assert.equal(pxPose(S,f),prior.pose(S,f));}
});

group('native scene changes stay within the late-charge fighter; soles and bounds hold',()=>{
  for(const slot of [0,1])for(const face of [-1,1]) {
    const {S,f}=setup(slot,face);S.stage=slot?'gallery':'courtyard';const seen=new Set();
    for(let t=0;t<190;t++){advance(S,t,slot);if(!S.dom)break;
      if(S.freeze||![1,35,36,59,60,71,72,77,85].includes(S.dom.t)||seen.has(S.dom.t))continue;seen.add(S.dom.t);
      const before=JSON.stringify(S),a=pxWorldSurface(S,neutral),b=prior.world(S,neutral);assert.equal(JSON.stringify(S),before);rasters+=2;let changed=0;
      // The old unplanted cannonload has calf pixels up to three rows below its
      // sole. Their removal belongs to this body; the new body must end at floor.
      for(let y=0;y<360;y++)for(let x=0;x<640;x++){const p=(y*640+x)*4;if(a.data.subarray(p,p+4).some((v,k)=>v!==b.data[p+k])){changed++;assert(Math.abs(x-f.x/2)<72&&y>=f.y/2-128&&y<=f.y/2+3,'difference outside body '+x+','+y);}}
      if(!baseline&&S.dom.t>=36&&S.dom.t<72){assert(changed>500,'change too small at native size');changedScenes++;}else{assert.equal(changed,0);identicalScenes++;}
      const bdy=body(S,f);if(!baseline&&S.dom.t>=36&&S.dom.t<72)for(let y=0;y<360;y++)for(let x=0;x<640;x++)if(bdy.data[(y*640+x)*4+3])assert(y<=GROUND/2&&y>185&&Math.abs(x-f.x/2)<70,'body clipped or below floor');
    }
    assert.equal(seen.size,9);
  }
});

if(output)for(const [slot,face,stage] of [[0,1,'courtyard'],[1,-1,'gallery']]) {
  const {S,f}=setup(slot,face);S.stage=stage;const samples=[],times=new Set([35,36,59,60,71,72,77,85]);
  const tag='v123-'+(baseline?'before':'after')+'-nuclear-p'+(slot+1)+'-'+stage;
  for(let t=0;t<190;t++){advance(S,t,slot);if(!S.dom)break;
    if(S.freeze||!times.has(S.dom.t))continue;times.delete(S.dom.t);
    const scene=pxWorldSurface(S,neutral),labels=[{P:'J',K:'K',G:'S',A1:'U',A2:'I',A3:'O',DOM:'L',move:'A/D',U:'W'},null];labels.other='Computer';scene.blit(pxHUDSurface(S,labels,neutral),0,0);
    const pose=pxPose(S,f);samples.push({scene,t:S.dom.t,pose});writePNG(output+'/'+tag+'-t'+S.dom.t+'.png',scene);
  }
  assert.equal(samples.length,8);
  const strip=new PixelSurface(5120,386);strip.rect(0,0,strip.w,strip.h,PX_INK);
  const bodies=new PixelSurface(1152,154);bodies.rect(0,0,bodies.w,bodies.h,'#28364a');
  samples.forEach(({scene,t,pose},i)=>{strip.blit(scene,i*640,0);pxText(strip,'T '+t+' / '+pose.toUpperCase(),i*640+12,369,PX_LIGHT);bodies.blit(pxSprite(4,pose,!!slot),i*144,0,1,face<0);pxText(bodies,'T '+t,i*144+8,138,PX_LIGHT);});
  writePNG(output+'/'+tag+'-strip.png',strip);writePNG(output+'/'+tag+'-bodies.png',bodies);
}
console.log(JSON.stringify({passed,failed,ticks,rasters,holds,defaults,changedScenes,identicalScenes,baseline}));
if(failed&&!previewOnly)throw Error('maximum-body audit failed: '+failed);
`)(assert,prior,writePNG,output,baseline,previewOnly);

