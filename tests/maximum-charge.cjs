// Nuclear Shell's prefire pressure: actual inputs and native rasters, never play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','rulesOnly',source+'\n'+`
const ch=CH.findIndex(c=>c.dom.kind==='nuclear'),ages=[1,24,48,71,72,85];
function begin(owner=0,mode='front') {
  const foe=mode==='swap'?CH.findIndex(c=>c.arts[0].id==='boogie'):ch;
  const S=newMatch(owner?foe:ch,owner?ch:foe,451);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];
  f.x=owner?900:380;o.x=owner?570:710;f.face=owner?-1:1;o.face=-f.face;f.gauge=100;
  const b=[0,0];b[owner]=BTN.DOM;step(S,b);return S;
}
function active(owner,age) {const S=begin(owner);while(S.freeze||S.dom.t<age)step(S,[0,0]);return S;}
function layer(S,f=S.f[S.dom?.o||0]) {const s=new PixelSurface(640,360);if(typeof pxMaximumCharge==='function')pxMaximumCharge(s,S,f);return s;}
if(!previewOnly) {
  let frames=0,crops=0,timelines=0,holds=0,native=0,minBright=Infinity;const signatures=new Set();
  if(!rulesOnly) {
    for(let age=1;age<72;age++) {
      const S=active(0,age);S.f[0].x=640;const before=JSON.stringify(S),s=layer(S),m=layer(S,{...S.f[0],face:-1});
      assert.equal(JSON.stringify(S),before,'cue writes match');assert.deepEqual(layer({...S,t:S.t+1001}).data,s.data,'global clock drives pressure');
      assert.deepEqual(layer(JSON.parse(before)).data,s.data,'snapshot changes cue');
      let area=0,bright=0;const colors=new Set();
      for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
        const p=(y*640+x)*4,a=s.data[p+3];assert(a===0||a===255,'soft alpha');
        if(a){area++;colors.add(s.data.slice(p,p+3).join(','));assert(x>=329&&x<=380&&y>=235&&y<=292,'pressure escapes forward hand lane');if(s.data[p]>210&&s.data[p+1]>190)bright++;}
        if(x>0)assert.deepEqual(s.data.subarray(p,p+4),m.data.subarray((y*640+640-x)*4,(y*640+640-x)*4+4),'facing mismatch');
      }
      assert(area>=250&&area<1200,'missing/excessive pressure: '+area);assert(bright>=80,'prefire pressure too faint: '+bright);
      assert.equal(s.data[((306-45)*640+348)*4+3],0,'collar center is filled');
      assert(colors.size>=4&&colors.size<=6,'flat/noisy material');signatures.add(Buffer.from(s.data).toString('base64'));frames++;
    }
    assert(signatures.size>=6,'prefire progress stays static');
    for(const stage of PX_STAGES)for(const owner of [0,1])for(const age of [1,24,48,71]) {
      const S=active(owner,age);S.stage=stage.id;const s=layer(S),frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);let bright=0;
      for(let p=0;p<s.data.length;p+=4)if(s.data[p+3]&&s.data[p]>210&&s.data[p+1]>190&&s.data.subarray(p,p+4).every((v,k)=>v===frame.data[p+k]))bright++;
      assert(bright>=80,'native world/fighter/HUD hides pressure: '+bright);minBright=Math.min(minBright,bright);native++;
    }
    const S=active(0,48),f=S.f[0];
    for(const x of [-60,0,640,1280,1340])for(const y of [0,612,720])for(const face of [-1,1]) {
      const a=new PixelSurface(640,360),b=new PixelSurface(840,560),q={...f,x:x+.5,y:y+.5,face};pxMaximumCharge(a,S,q);pxMaximumCharge(b,S,{...q,x:q.x+200,y:q.y+200});
      for(let row=0;row<360;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+100)*840+100)*4,((row+100)*840+740)*4),'edge crop');crops++;
    }
    for(const A of [{...S,dom:null},{...S,dom:{...S.dom,k:'bloodsweep'}},{...S,dom:{...S.dom,o:1}},{...S,dom:{...S.dom,t:72}},{...S,dom:{...S.dom,t:100}}])assert(layer(A,f).data.every(v=>!v),'stale/unrelated charge');
    for(const st of ['idle','hit','stun','down','ko','atk'])assert(layer(S,{...f,st}).data.every(v=>!v),'interrupted fighter charges');
    for(const owner of [0,1]) {
      const A=begin(owner),s=layer(A);assert.equal(A.freeze,60);assert(s.data.some(v=>v));
      for(let k=0;k<60;k++){step(A,[0,0]);assert.equal(A.dom.t,1);assert.deepEqual(layer(A).data,s.data,'cinematic countdown advances pressure');holds++;}
    }
  }
  for(const owner of [0,1])for(const mode of ['front','guard','swap']) {
    const A=begin(owner,mode),B=JSON.parse(JSON.stringify(A));let fired=false,probed=false,seen=false;
    const initial=A.f[1-owner].hp;
    for(let n=0;n<240;n++) {
      const before=JSON.stringify(A),f=A.f[owner],s=layer(A,f);
      if(A.dom?.t===48&&!probed) {
        for(const field of ['hitstop','freeze']) {
          const F=JSON.parse(before);F.hitstop=F.freeze=0;F[field]=3;
          for(let k=0;k<3;k++){step(F,[0,0]);assert.equal(F.dom.t,48);if(!rulesOnly)assert.deepEqual(layer(F).data,s.data,'paused pressure moves');holds++;}
        }
        const F=JSON.parse(before);F.freeze=F.hitstop=0;F.stop={o:1-owner,t:3};step(F,[0,0]);assert.equal(F.dom.t,49,'existing time-stop Domain advance changed');probed=true;
      }
      if(A.dom?.t>1&&A.dom.t<72) {seen=true;if(!rulesOnly)assert(s.data.some(v=>v),'missing held charge');}
      if(A.dom?.t===72) {fired=true;assert(A.ev.some(e=>e.k==='nuke'));assert(A.zones.some(z=>z.k==='beam'&&z.t===0));}
      if(!rulesOnly&&(!A.dom||A.dom.t>=72))assert(s.data.every(v=>!v),'pressure remains after firing');
      if(n%11===0)pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'painting writes state');
      const b=[0,0];if(mode==='guard')b[1-owner]=BTN.G;if(mode==='swap'&&!A.freeze&&A.dom?.t===12)b[1-owner]=BTN.A1;step(A,b);step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B),'painting changes outcome');
    }
    assert(seen&&fired&&probed&&!A.dom,'incomplete charge/fire/expiry');const damage=initial-A.f[1-owner].hp;
    if(mode==='front')assert.equal(damage,290,'front damage changed');if(mode==='swap')assert.equal(damage,0,'swap escape changed');if(mode==='guard')assert(damage>0&&damage<290,'guard changed');timelines++;
  }
  // Actual cancellation by a second Maximum, then a round reset, clear the cue.
  for(const owner of [0,1]) {
    const S=active(owner,48),other=S.f[1-owner];other.gauge=100;const b=[0,0];b[1-owner]=BTN.DOM;step(S,b);assert.equal(S.dom,null);if(!rulesOnly)assert(layer(S,S.f[owner]).data.every(v=>!v));
    newRound(S);if(!rulesOnly)assert(layer(S,S.f[owner]).data.every(v=>!v));
  }
  console.log('PASS',frames,'prefire ages / hard alpha, materials, forward lane, exact mirrors, progress, snapshots;',native,'native composites;',crops,'edge crops;',timelines,'real front/guard/swap timelines / tick-72 release, unchanged outcomes;',holds,'freeze holds; cancellation/reset and existing time-stop advance');
  if(native)console.log('Minimum visible bright pixels in native composites:',minBright);
}
if(output) {
  for(const stage of PX_STAGES)for(const owner of [0,1]) {
    const strip=new PixelSurface(1280,1080);
    ages.forEach((age,n)=>{
      const S=active(owner,age);S.stage=stage.id;const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);
      pxOutlinedText(frame,stage.id.toUpperCase()+' / FACING '+(owner?'LEFT':'RIGHT')+' / T'+age,12,88,PX_LIGHT);
      const name=prefix+'-'+stage.id+'-'+(owner?'left':'right');writePNG(output+'/'+name+'-t'+age+'.png',frame);strip.blit(frame,n%2*640,Math.floor(n/2)*360);
    });writePNG(output+'/'+prefix+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',strip);
  }
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v51',previewOnly,process.argv.includes('--rules-only'));
