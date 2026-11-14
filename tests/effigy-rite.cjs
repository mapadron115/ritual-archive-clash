// Real Effigy inputs and exact event composites; script/raster evidence, not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','previewOnly','rulesOnly','Math',source+'\n'+`
const ch=CH.findIndex(c=>c.dom.kind==='effigy'),ages=[1,6,9,10,20,23,24,34,37,38,42,50,59,60,65,66];
function begin(owner=0) {
  const S=newMatch(ch,ch,451);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];
  f.x=owner?930:350;o.x=owner?570:710;f.face=owner?-1:1;o.face=-f.face;f.gauge=100;
  const b=[0,0];b[owner]=BTN.DOM;step(S,b);return S;
}
function active(owner,age) {const S=begin(owner);while(S.freeze||S.dom.t<age)step(S,[0,0]);return S;}
function layer(S) {const s=new PixelSurface(640,360);if(typeof pxEffigyRite==='function')pxEffigyRite(s,S);return s;}
function resetFX() {for(const k of ['parts','rings','lines','contacts','dust','stars','puffs','nums','words'])FX[k]=[];FX.banner=FX.impact=FX.bf=null;FX.flash=FX.shake=0;FX.silent=true;}
function scene(owner,age,stage) {
  resetFX();const S=begin(owner);S.stage=stage;
  for(const e of S.ev)fxEvent(S,e);S.ev=[];
  while(S.freeze||S.dom.t<age){step(S,[0,0]);for(const e of S.ev)fxEvent(S,e);S.ev=[];fxTick();}
  const frame=pxWorldSurface(S,FX);frame.blit(pxHUDSurface(S,[null,null]),0,0);return {S,frame};
}
if(!previewOnly) {
  let frames=0,native=0,holds=0,timelines=0,crops=0,minVisible=Infinity;
  if(!rulesOnly) {
    const hashes=new Set();
    for(let age=1;age<=70;age++) {
      const S=active(0,age),before=JSON.stringify(S),s=layer(S);
      assert.equal(JSON.stringify(S),before);assert.deepEqual(layer(JSON.parse(before)).data,s.data);
      assert.deepEqual(layer({...S,t:S.t+1001}).data,s.data,'global clock drives rite');
      let area=0;const colors=new Set();
      for(let p=0;p<s.data.length;p+=4){assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){area++;colors.add(s.data.subarray(p,p+3).join(','));}}
      if(age<66){assert(area>200&&area<5500,'rite area '+age+': '+area);assert(colors.size>=3&&colors.size<=8,'rite palette '+colors.size);hashes.add(Buffer.from(s.data).toString('base64'));}
      else assert.equal(area,0,'rite survives hammer recoil');
      // Body, face and actor tag stay open, regardless of the moving fighter pose.
      const o=S.f[1],x=Math.round(o.x/2),y=Math.round((o.y-70)/2);
      for(let row=y-58;row<y+25;row++)for(let col=x-24;col<=x+24;col++)assert.equal(s.data[(row*640+col)*4+3],0,'rite covers face/body');
      for(let row=319;row<360;row++)assert(s.data.subarray(row*640*4,(row+1)*640*4).every(v=>!v),'rite crosses HUD');
      frames++;
    }
    assert(hashes.size>=15,'rite phases indistinct');
    // Each incoming nail and the hammer must brighten in broad material steps.
    for(const seq of [[1,4,7],[14,18,21],[28,32,35],[42,48,54]]) {
      let previous=0;
      for(const age of seq) {
        const S=active(0,age),s=layer(S),o=S.f[1],x=Math.round(o.x/2),y=Math.round((o.y-70)/2);
        const n=seq[0]===1?0:seq[0]===14?1:2,dx=[-58,58,0][n],dy=[-26,-26,-92][n];
        let value=0,area=0;
        for(let row=y+(seq[0]===42?-165:dy-35);row<y+(seq[0]===42?-106:dy+21);row++)for(let col=x+(seq[0]===42?-45:dx-13);col<x+(seq[0]===42?100:dx+14);col++) {
          const p=(row*640+col)*4;if(s.data[p+3]){value+=s.data[p]+s.data[p+1]+s.data[p+2];area++;}
        }
        assert(area>100,'preparation too small');assert(value/area>previous+15,'preparation fails to brighten '+age);previous=value/area;
      }
    }
    for(const stage of PX_STAGES)for(const owner of [0,1])for(const age of [1,9,10,23,24,37,38,50,59,60]) {
      const {S,frame}=scene(owner,age,stage.id),s=layer(S);let visible=0;
      for(let p=0;p<s.data.length;p+=4)if(s.data[p+3]&&s.data[p]>=200&&s.data[p+1]>=140&&s.data.subarray(p,p+4).every((v,k)=>v===frame.data[p+k]))visible++;
      assert(visible>100,'native world/fighters/contacts/HUD hides rite: '+visible);minVisible=Math.min(minVisible,visible);native++;
    }
    for(const x of [-60,0,640,1280,1340])for(const y of [0,612,720])for(const age of [9,38,59,60]) {
      const S=active(0,age);S.f[1].x=x+.5;S.f[1].y=y+.5;
      const a=layer(S),b=new PixelSurface(1040,760),T=JSON.parse(JSON.stringify(S));T.f[1].x+=400;T.f[1].y+=400;pxEffigyRite(b,T);
      for(let row=0;row<360;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+200)*1040+200)*4,((row+200)*1040+840)*4));crops++;
    }
    for(const owner of [0,1]) {
      const S=begin(owner),s=layer(S);
      for(let k=0;k<60;k++){step(S,[0,0]);assert.equal(S.dom.t,1);assert.deepEqual(layer(S).data,s.data);holds++;}
    }
    const S=active(0,9);
    for(const phase of ['intro','ko','over'])assert(layer({...S,phase}).data.every(v=>!v));
    for(const k of Object.keys(DOMAIN).filter(k=>k!=='effigy'))assert(layer({...S,dom:{...S.dom,k}}).data.every(v=>!v));
    for(const who of [0,1]){const F=JSON.parse(JSON.stringify(S));F.f[who].st='ko';assert(layer(F).data.every(v=>!v));}
    // Drawing is independent of facing; reflect the finished cell around its root.
    const A=active(0,59),B=JSON.parse(JSON.stringify(A));A.f[1].x=640;B.f[1].x=640;B.dom.o=1;B.f.reverse();B.f[0].x=640;
    const a=layer(A),b=layer(B);for(let y=0;y<360;y++)for(let x=120;x<=520;x++)assert.deepEqual(a.data.subarray((y*640+x)*4,(y*640+x)*4+4),b.data.subarray((y*640+640-x)*4,(y*640+640-x)*4+4));
  }
  for(const owner of [0,1])for(const mode of ['front','guard','jump']) {
    const A=begin(owner),B=JSON.parse(JSON.stringify(A));let probes=0;const hits=[],health=A.f[1-owner].hp;
    for(let n=0;n<310;n++) {
      const before=JSON.stringify(A),s=layer(A);
      if([9,10,23,24,37,38,59,60].includes(A.dom?.t)&&!A.hitstop&&!A.freeze) {
        for(const field of ['hitstop','freeze']) {
          const F=JSON.parse(before);F.hitstop=F.freeze=0;F[field]=3;
          for(let k=0;k<3;k++){step(F,[0,0]);assert.equal(F.dom.t,A.dom.t);if(!rulesOnly)assert.deepEqual(layer(F).data,s.data);holds++;}
        }probes++;
      }
      if(n%13===0)pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'render changes state');
      A.ev=[];B.ev=[];const b=[0,0];if(mode==='guard')b[1-owner]=BTN.G;if(mode==='jump'&&!A.freeze&&A.dom?.t===2)b[1-owner]=BTN.J;
      step(A,b);step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B),'drawn timeline diverges');
      if(A.ev.some(e=>e.k==='rain'||e.k==='boom')){hits.push(A.dom.t);if(A.dom.t===60)assert.equal(A.f[1-owner].nails,0,'existing hammer nail cleanup');}
    }
    assert.deepEqual(hits,[10,24,38,60]);assert.equal(probes,8);assert(!A.dom);
    const damage=health-A.f[1-owner].hp;
    assert(Math.abs(damage-(mode==='guard'?106:248.8))<1e-8,'existing damage outcome');
    console.log('Effigy outcome:',owner,mode,damage);timelines++;
  }
  for(const owner of [0,1]) {
    const S=active(owner,9);S.f[1-owner].gauge=100;const b=[0,0];b[1-owner]=BTN.DOM;step(S,b);assert.equal(S.dom,null);if(!rulesOnly)assert(layer(S).data.every(v=>!v));
    newRound(S);if(!rulesOnly)assert(layer(S).data.every(v=>!v));
    const F=active(owner,9);F.stop={o:1-owner,t:3};step(F,[0,0]);assert.equal(F.dom.t,10,'existing Domain advance during time stop');
  }
  console.log('PASS',frames,'ages;',native,'actual event native composites; minimum visible bright area',minVisible,';',crops,'edge crops;',timelines,'real front/guard/jump timelines;',holds,'freeze holds; snapshots, mirrors, cancellation/reset/time stop');
}
if(output)for(const stage of PX_STAGES)for(const owner of [0,1]) {
  const strip=new PixelSurface(1280,2880);
  ages.forEach((age,n)=>{
    const {frame}=scene(owner,age,stage.id);pxOutlinedText(frame,stage.id.toUpperCase()+' / OWNER '+(owner+1)+' / T'+age,12,88,PX_LIGHT);
    const name=prefix+'-'+stage.id+'-'+(owner?'left':'right');writePNG(output+'/'+name+'-t'+age+'.png',frame);strip.blit(frame,n%2*640,Math.floor(n/2)*360);
  });writePNG(output+'/'+prefix+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',strip);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v55',previewOnly,process.argv.includes('--rules-only'),math);
