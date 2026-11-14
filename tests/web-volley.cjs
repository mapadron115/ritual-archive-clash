// Real Web inputs, unchanged simulation, native composites. This is not play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const math=Object.create(Math);math.random=()=>.5;
Function('assert','writePNG','output','prefix','previewOnly','rulesOnly','Math',source+'\n'+`
const ch=CH.findIndex(c=>c.dom.kind==='web'),ages=[1,10,13,14,18,20,32,37,38,44,61,62,67,68];
function begin(owner=0,mode='front') {
  const S=newMatch(ch,ch,451);S.phase='fight';const f=S.f[owner],o=S.f[1-owner];
  f.x=owner?930:350;o.x=owner?570:710;f.face=owner?-1:1;o.face=-f.face;f.gauge=100;
  const b=[0,0];b[owner]=BTN.DOM;step(S,b);return S;
}
function active(owner,age) {const S=begin(owner);while(S.freeze||S.dom.t<age)step(S,[0,0]);return S;}
function layer(S) {const s=new PixelSurface(640,360);if(typeof pxWebVolley==='function')pxWebVolley(s,S);return s;}
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
    for(let age=1;age<=72;age++) {
      const S=active(0,age),before=JSON.stringify(S),s=layer(S);
      assert.equal(JSON.stringify(S),before);assert.deepEqual(layer(JSON.parse(before)).data,s.data);
      assert.deepEqual(layer({...S,t:S.t+1001}).data,s.data,'global clock drives web');
      let area=0;const colors=new Set();
      for(let p=0;p<s.data.length;p+=4){assert(s.data[p+3]===0||s.data[p+3]===255);if(s.data[p+3]){area++;colors.add(s.data.subarray(p,p+3).join(','));}}
      if(age<68){assert(area>1100&&area<4500,'web area '+area);assert(colors.size>=3&&colors.size<=4,'web palette');hashes.add(Buffer.from(s.data).toString('base64'));}
      else assert.equal(area,0,'web survives last snap');
      // A clear center remains throughout warning and recoil; sprites paint above it.
      const o=S.f[1];assert.equal(s.data[(Math.round((o.y-70)/2)*640+Math.round(o.x/2))*4+3],0);
      frames++;
    }
    assert(hashes.size>=12,'volley phases indistinct');
    for(const seq of [[1,6,10],[20,26,32],[44,50,56]]) {
      let previous=0;
      for(const age of seq){const s=layer(active(0,age));let value=0,area=0;for(let p=0;p<s.data.length;p+=4)if(s.data[p+3]){value+=s.data[p]+s.data[p+1]+s.data[p+2];area++;}assert(value/area>previous+20,'strands do not brighten broadly');previous=value/area;}
    }
    // Grounded warning stays below the face and above the HUD deck.
    for(const age of [1,13]){const s=layer(active(0,age));for(let y=0;y<360;y++)if(y<220||y>=319)assert(s.data.subarray(y*640*4,(y+1)*640*4).every(v=>!v),'web crosses face/HUD lane');}
    for(const stage of PX_STAGES)for(const owner of [0,1])for(const age of [1,13,14,37,38,61,62]) {
      const {S,frame}=scene(owner,age,stage.id),s=layer(S);let visible=0;
      for(let p=0;p<s.data.length;p+=4)if(s.data[p+3]&&s.data[p]>=220&&s.data[p+1]>=150&&s.data.subarray(p,p+4).every((v,k)=>v===frame.data[p+k]))visible++;
      assert(visible>180,'native world/fighters/contacts/HUD hides web: '+visible);minVisible=Math.min(minVisible,visible);native++;
    }
    // Test integer-origin clipping at fractional positions and offscreen edges.
    for(const x of [-60,0,640,1280,1340])for(const y of [0,612,720])for(const age of [13,14,38]) {
      const S=active(0,age);S.f[1].x=x+.5;S.f[1].y=y+.5;
      const a=layer(S),b=new PixelSurface(840,560),T=JSON.parse(JSON.stringify(S));T.f[1].x+=200;T.f[1].y+=200;pxWebVolley(b,T);
      for(let row=0;row<360;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+100)*840+100)*4,((row+100)*840+740)*4));crops++;
    }
    for(const owner of [0,1]) {
      const S=begin(owner),s=layer(S);
      for(let k=0;k<60;k++){step(S,[0,0]);assert.equal(S.dom.t,1);assert.deepEqual(layer(S).data,s.data);holds++;}
    }
    // The cue must not persist in unrelated Domains or after KO/phase changes.
    const S=active(0,13);
    for(const phase of ['intro','ko','over'])assert(layer({...S,phase}).data.every(v=>!v));
    for(const k of Object.keys(DOMAIN).filter(k=>k!=='web'))assert(layer({...S,dom:{...S.dom,k}}).data.every(v=>!v));
  }
  for(const owner of [0,1])for(const mode of ['front','guard','jump']) {
    const A=begin(owner),B=JSON.parse(JSON.stringify(A));let probes=0;const hits=[],health=A.f[1-owner].hp;
    for(let n=0;n<280;n++) {
      const before=JSON.stringify(A),s=layer(A);
      if([13,14,37,38,61,62].includes(A.dom?.t)&&!A.hitstop&&!A.freeze) {
        for(const field of ['hitstop','freeze']) {
          const F=JSON.parse(before);F.hitstop=F.freeze=0;F[field]=3;
          for(let k=0;k<3;k++){step(F,[0,0]);assert.equal(F.dom.t,A.dom.t);if(!rulesOnly)assert.deepEqual(layer(F).data,s.data);holds++;}
        }probes++;
      }
      if(n%13===0)pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'render changes state');
      A.ev=[];B.ev=[];const b=[0,0];if(mode==='guard')b[1-owner]=BTN.G;if(mode==='jump'&&!A.freeze&&A.dom?.t===2)b[1-owner]=BTN.J;
      step(A,b);step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B),'drawn timeline diverges');
      if(A.ev.some(e=>e.k==='slash')){hits.push(A.dom.t);assert([14,38,62].includes(A.dom.t));}
    }
    assert.deepEqual(hits,[14,38,62]);assert.equal(probes,6);assert(!A.dom);
    const damage=health-A.f[1-owner].hp;assert(damage>0);if(mode==='guard')assert.equal(damage,96);else assert(Math.abs(damage-211.2)<1e-8);
    console.log('Web outcome:',owner,mode,damage);timelines++;
  }
  for(const owner of [0,1]) {
    const S=active(owner,13);S.f[1-owner].gauge=100;const b=[0,0];b[1-owner]=BTN.DOM;step(S,b);assert.equal(S.dom,null);if(!rulesOnly)assert(layer(S).data.every(v=>!v));
    newRound(S);if(!rulesOnly)assert(layer(S).data.every(v=>!v));
    const F=active(owner,13);F.stop={o:1-owner,t:3};step(F,[0,0]);assert.equal(F.dom.t,14,'existing Domain advance during time stop');
  }
  console.log('PASS',frames,'ages;',native,'actual event native composites; minimum visible bright area',minVisible,';',crops,'edge crops;',timelines,'real front/guard/jump timelines;',holds,'freeze holds; read-only snapshots, cancellation/reset/time stop');
}
if(output)for(const stage of PX_STAGES)for(const owner of [0,1]) {
  const strip=new PixelSurface(1280,2520);
  ages.forEach((age,n)=>{
    const {frame}=scene(owner,age,stage.id);pxOutlinedText(frame,stage.id.toUpperCase()+' / OWNER '+(owner+1)+' / T'+age,12,88,PX_LIGHT);
    const name=prefix+'-'+stage.id+'-'+(owner?'left':'right');writePNG(output+'/'+name+'-t'+age+'.png',frame);strip.blit(frame,n%2*640,Math.floor(n/2)*360);
  });writePNG(output+'/'+prefix+'-'+stage.id+'-'+(owner?'left':'right')+'-lifecycle.png',strip);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v54',previewOnly,process.argv.includes('--rules-only'),math);
