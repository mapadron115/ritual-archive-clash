// Standing Ovation's actual input timeline and native composites; not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only'),rulesOnly=process.argv.includes('--rules-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','previewOnly','rulesOnly','Math',source+'\n'+`
const ch=CH.findIndex(c=>c.dom.kind==='ovation'),ages=[1,4,5,9,14,15,18,19,23,28,29,57,70,71,74,75];
function begin(owner=0,mode='front') {
  const S=newMatch(ch,ch,451);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];
  f.x=owner?930:350;o.x=owner?570:710;f.face=owner?-1:1;o.face=-f.face;f.gauge=100;
  const b=[0,0];b[owner]=BTN.DOM;if(mode==='guard')b[1-owner]=BTN.G;step(S,b);return S;
}
function active(owner,age) {const S=begin(owner);while(S.dom&&(S.freeze||S.hitstop||S.dom.t<age))step(S,[0,0]);return S;}
function layer(S) {const s=new PixelSurface(640,360);if(typeof pxOvationRhythm==='function')pxOvationRhythm(s,S);return s;}
function resetFX() {for(const k of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.silent=true;}
function scene(owner,age,stage) {
  resetFX();const S=begin(owner);S.stage=stage;for(const e of S.ev)fxEvent(S,e);S.ev=[];
  while(S.dom&&(S.freeze||S.hitstop||S.dom.t<age)){step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);S.ev=[];fxTick();}
  const frame=pxWorldSurface(S,FX);frame.blit(pxHUDSurface(S,[null,null]),0,0);return {S,frame};
}
if(!previewOnly) {
  let frames=0,native=0,holds=0,timelines=0,crops=0,minVisible=Infinity;
  if(!rulesOnly) {
    const hashes=new Set();
    for(let age=1;age<=97;age++) {
      const S=active(0,age),before=JSON.stringify(S),s=layer(S);
      assert.equal(JSON.stringify(S),before);assert.deepEqual(layer(JSON.parse(before)).data,s.data);
      assert.deepEqual(layer({...S,t:S.t+1001}).data,s.data,'global clock drives rhythm');
      let area=0;const colors=new Set();
      for(let p=0;p<s.data.length;p+=4){assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){area++;colors.add(s.data.subarray(p,p+3).join(','));}}
      if(age<75){assert(area>500&&area<4000,'rhythm area '+age+': '+area);assert(colors.size>=3&&colors.size<=7);hashes.add(Buffer.from(s.data).toString('base64'));}
      else assert.equal(area,0,'cue outlives last recoil');
      const o=S.f[1],x=Math.round(o.x/2),y=Math.round((o.y-70)/2);
      for(let row=y-65;row<y+30;row++)for(let col=x-24;col<=x+24;col++)assert.equal(s.data[(row*640+col)*4+3],0,'cue covers face/body');
      for(let row=319;row<360;row++)assert(s.data.subarray(row*640*4,(row+1)*640*4).every(v=>!v),'cue crosses HUD');frames++;
    }
    assert(hashes.size>=10,'rhythm phases indistinct');
    for(const age of [1,14,15,28,29,42,43,56,57,70,71]) {
      const S=active(0,age),s=layer(S),root=Math.round(S.f[1].x/2),sum=[0,0];
      for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
        const p=(y*640+x)*4;if(s.data[p+3])sum[x<root?0:1]+=s.data[p]+s.data[p+1]+s.data[p+2];
      }
      const beat=Math.floor((age-1)/14),snap=(age-1)%14<4,side=(beat+(snap?0:1))%2?-1:1;
      assert(sum[side<0?0:1]>sum[side<0?1:0]*1.15,'bright side disagrees with next/current swap');
    }
    for(const seq of [[5,9,13],[19,23,27],[61,65,69]]) {
      let previous=0;
      for(const age of seq) {
        const s=layer(active(0,age));let value=0,area=0;
        for(let p=0;p<s.data.length;p+=4)if(s.data[p+3]){value+=s.data[p]+s.data[p+1]+s.data[p+2];area++;}
        assert(value/area>previous+25,'broad material fails to brighten '+age);previous=value/area;
      }
    }
    for(const stage of PX_STAGES)for(const owner of [0,1])for(const age of [1,5,14,15,19,28,29,57,70,71,74]) {
      const {S,frame}=scene(owner,age,stage.id),s=layer(S);let visible=0;
      for(let p=0;p<s.data.length;p+=4)if(s.data[p+3]&&s.data[p]>=200&&s.data[p+1]>=150&&s.data.subarray(p,p+4).every((v,k)=>v===frame.data[p+k]))visible++;
      assert(visible>150,'native world/fighters/contacts/HUD hides rhythm: '+visible);minVisible=Math.min(minVisible,visible);native++;
    }
    for(const x of [-60,0,640,1280,1340])for(const y of [0,612,720])for(const age of [1,14,15,70]) {
      const S=active(0,age);S.f[1].x=x+.5;S.f[1].y=y+.5;
      const a=layer(S),b=new PixelSurface(1040,760),T=JSON.parse(JSON.stringify(S));T.f[1].x+=400;T.f[1].y+=400;pxOvationRhythm(b,T);
      for(let row=0;row<360;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+200)*1040+200)*4,((row+200)*1040+840)*4));crops++;
    }
    const S=active(0,14);
    for(const phase of ['intro','ko','over'])assert(layer({...S,phase}).data.every(v=>!v));
    for(const k of Object.keys(DOMAIN).filter(k=>k!=='ovation'))assert(layer({...S,dom:{...S.dom,k}}).data.every(v=>!v));
    for(const who of [0,1]){const F=JSON.parse(JSON.stringify(S));F.f[who].st='ko';assert(layer(F).data.every(v=>!v));}
    // Actor slot does not choose the attack side: the actual six swaps alternate it.
    const A=active(0,14),B=JSON.parse(JSON.stringify(A));A.f[1].x=640;B.f[1].x=640;B.dom.o=1;B.f.reverse();B.f[0].x=640;
    assert.deepEqual(layer(A).data,layer(B).data);
    for(const age of [14,28]) {
      const A=active(0,age),B=active(0,age+14);A.f[1].x=B.f[1].x=640;A.f[1].y=B.f[1].y=612;
      const a=layer(A),b=layer(B);for(let y=0;y<360;y++)for(let x=120;x<=520;x++)assert.deepEqual(a.data.subarray((y*640+x)*4,(y*640+x)*4+4),b.data.subarray((y*640+640-x)*4,(y*640+640-x)*4+4),'alternating root reflection');
    }
  }
  for(const owner of [0,1])for(const mode of ['front','guard','jump']) {
    const A=begin(owner,mode),B=JSON.parse(JSON.stringify(A));let probes=0;const hits=[],sides=[],health=maxHp(A.f[1-owner]);
    for(let n=0;n<400;n++) {
      const before=JSON.stringify(A),s=layer(A);
      if([14,15,28,29,70,71].includes(A.dom?.t)&&!A.hitstop&&!A.freeze) {
        for(const field of ['hitstop','freeze']) {
          const F=JSON.parse(before);F.hitstop=F.freeze=0;F[field]=3;
          for(let k=0;k<3;k++){step(F,[0,0]);assert.equal(F.dom.t,A.dom.t);if(!rulesOnly)assert.deepEqual(layer(F).data,s.data);holds++;}
        }probes++;
      }
      if(n%19===0)pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'render changes state');
      // Record initial tick-1 events too; the first clap is immediate and must stay so.
      if(n===0&&A.ev.some(e=>e.k==='clap')){hits.push(1);sides.push(Math.sign(A.f[owner].x-A.f[1-owner].x));}
      A.ev=[];B.ev=[];const b=[0,0];if(mode==='guard')b[1-owner]=BTN.G;if(mode==='jump'&&!A.freeze&&A.dom?.t===2)b[1-owner]=BTN.J;
      step(A,b);step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B),'drawn timeline diverges');
      if(A.ev.some(e=>e.k==='clap')){hits.push(A.dom.t);sides.push(Math.sign(A.f[owner].x-A.f[1-owner].x));}
    }
    assert.deepEqual(hits,[1,15,29,43,57,71]);assert.deepEqual(sides,[1,-1,1,-1,1,-1]);assert.equal(probes,6);assert(!A.dom);
    const damage=health-A.f[1-owner].hp;console.log('Ovation full six-hit outcome:',owner,mode,damage);timelines++;
    assert(Math.abs(damage-(mode==='guard'?92:160.4))<1e-8,'existing six-hit damage outcome');
  }
  for(const owner of [0,1]) {
    const S=begin(owner),s=layer(S);for(let k=0;k<60;k++){step(S,[0,0]);assert.equal(S.dom.t,1);if(!rulesOnly)assert.deepEqual(layer(S).data,s.data);holds++;}
    const C=begin(owner,'guard'),g=[0,0];g[1-owner]=BTN.G;
    while(C.freeze||C.hitstop||C.dom.t<14)step(C,g);
    C.f[1-owner].gauge=100;const b=[0,0];b[1-owner]=BTN.DOM;step(C,b);assert.equal(C.dom,null);if(!rulesOnly)assert(layer(C).data.every(v=>!v));
    newRound(C);if(!rulesOnly)assert(layer(C).data.every(v=>!v));
    const F=active(owner,14);F.stop={o:1-owner,t:3};step(F,[0,0]);assert.equal(F.dom.t,15,'existing Domain advance during time stop');
  }
  console.log('PASS',frames,'ages;',native,'native composites; minimum visible bright area',minVisible,';',crops,'edge crops;',timelines,'real input timelines;',holds,'freeze holds; snapshots, alternating sides, cancellation/reset/time stop');
}
if(output)for(const stage of PX_STAGES)for(const owner of [0,1]) {
  const strip=new PixelSurface(1280,2880);
  ages.forEach((age,n)=>{
    const {frame}=scene(owner,age,stage.id);pxOutlinedText(frame,stage.id.toUpperCase()+' / OWNER '+(owner+1)+' / T'+age,12,88,PX_LIGHT);
    const name=prefix+'-'+stage.id+'-'+(owner?'left':'right');writePNG(output+'/'+name+'-t'+age+'.png',frame);strip.blit(frame,n%2*640,Math.floor(n/2)*360);
  });writePNG(output+'/'+prefix+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',strip);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v57',previewOnly,rulesOnly,math);
