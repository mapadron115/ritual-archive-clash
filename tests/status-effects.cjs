// Exact status rasters and actual input timelines, never human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','timing','performance',source+'\n'+`
const counterCh=CH.findIndex(c=>c.arts.some(a=>a.id==='counter'));
const cases=[{id:'infinity',field:'inf',ch:0,dur:108},{id:'counter',field:'counter',ch:counterCh,dur:26},{id:'absolute',field:'abs',ch:counterCh,dur:300},{id:'zone',field:'zone',ch:2,dur:480}];
// Seed 1972 makes the first close punch a Black Flash; prove the event below.
function begin(c,owner=0,close=false) {
  const S=newMatch(owner?2:c.ch,owner?c.ch:2,1972);S.phase='fight';
  const f=S.f[owner],o=S.f[1-owner];f.x=owner?900:380;o.x=close?(owner?820:460):(owner?380:900);f.face=owner?-1:1;f.ce=100;f.gauge=100;
  const inp=[0,0];inp[owner]=c.id==='absolute'?BTN.DOM:c.id==='zone'?BTN.P:BTN['A'+(CH[c.ch].arts.findIndex(a=>a.id===c.id)+1)];step(S,inp);return S;
}
function active(c,owner=0) {const S=begin(c,owner,c.id==='zone');for(let n=0;n<120&&!S.f[owner][c.field];n++)step(S,[0,0]);assert(S.f[owner][c.field],c.id+' not activated');return S;}
function fixture(c,age,face=1) {
  const S=newMatch(c.ch,c.ch,8);S.phase='fight';S.t=age;const f=S.f[0];f.x=160;f.y=240;f.face=face;
  f.st='guard';
  f[c.field]=c.id==='absolute'?2:c.dur-age;
  if(c.id==='absolute')S.dom={k:'absolute',o:0,t:age+1,dur:300};return S;
}
function fighter(S,owner=0) {const s=new PixelSurface(160,132);pxPaintFighter(s,S,{...S.f[owner],x:160,y:240},null);return s;}
function layer(S,c,owner=0,center=false) {const s=new PixelSurface(160,132);pxStatusEffect(s,S,center?{...S.f[owner],x:160,y:240}:S.f[owner],c.id);return s;}
function inkAt(s,x,y){return s.data[(y*s.w+x)*4+3];}
if(!previewOnly) {
  let frames=0,clipping=0,timelines=0,holds=0;const masks=[];
  for(const c of cases) {
    const phases=new Set();
    for(let age=0;age<c.dur;age++) {
      const S=fixture(c,age),before=JSON.stringify(S),s=layer(S,c),mirror=layer(fixture(c,age,-1),c),colors=new Set();let area=0;
      assert.equal(JSON.stringify(S),before,'status writes state');
      assert.deepEqual(layer({...S,t:S.t+901},c).data,s.data,'status uses scenery clock');
      assert.deepEqual(layer(JSON.parse(before),c).data,s.data,'snapshot changes status');
      for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++) {
        const a=inkAt(s,x,y);assert(a===0||a===255,'soft alpha');
        if(a){area++;colors.add(s.data.slice((y*s.w+x)*4,(y*s.w+x)*4+3).join(','));assert(x>=36&&x<=124&&y>=3&&y<=120,'status outside envelope or below floor');}
        if(x>0)assert.deepEqual(s.data.subarray((y*s.w+x)*4,(y*s.w+x)*4+4),mirror.data.subarray((y*s.w+160-x)*4,(y*s.w+160-x)*4+4),'inexact status mirror');
      }
      assert(area>100&&area<2000,'missing or excessive overlay');assert(colors.size>=3&&colors.size<=6,'missing material shading');
      if(c.id==='infinity')for(let y=35;y<=100;y++)for(let x=58;x<=102;x++)assert.equal(inkAt(s,x,y),0,'Infinity covers center');
      if(age<24)phases.add(Buffer.from(s.data).toString('base64'));frames+=2;
    }
    assert(phases.size>=2,'static status '+c.id);
    const S=fixture(c,0);masks.push(Buffer.from(layer(S,c).data.filter((v,i)=>i%4===3)).toString('base64'));
    S.f[0][c.field]=0;assert(layer(S,c).data.every(v=>v===0),'expired status drawn');
    // Exact translation and clipping of fractional snapshot roots on all edges.
    for(const age of [0,4,16,c.dur-1])for(const face of [-1,1])for(const x of [-30,0,160,320,350])for(const y of [-30,0,240,264,300]) {
      const S=fixture(c,age,face);S.f[0].x=x+.5;S.f[0].y=y+.5;
      const a=layer(S,c),b=new PixelSurface(360,332),f={...S.f[0],x:S.f[0].x+200,y:S.f[0].y+200};pxStatusEffect(b,S,f,c.id);
      for(let row=0;row<a.h;row++)assert.deepEqual(a.data.subarray(row*160*4,(row+1)*160*4),b.data.subarray(((row+100)*360+100)*4,((row+100)*360+260)*4),'edge crop mismatch');clipping++;
    }
    for(const owner of [0,1]) {
      const A=active(c,owner),B=JSON.parse(JSON.stringify(A));let saw=false,expired=false;
      if(c.id==='zone')assert(A.ev.some(e=>e.k==='blackflash'),'Zone fixture lacks real Black Flash');
      for(let tick=0;tick<650;tick++) {
        const f=A.f[owner],before=JSON.stringify(A);
        if(f[c.field]>0) {
          saw=true;const raster=layer(A,c,owner,true);assert(raster.data.some(v=>v),'blank freeze fixture');
          if(tick===0) {
            for(const field of ['hitstop','freeze']) {
              const F=JSON.parse(before);F[field]=3;
              for(let n=0;n<3;n++){step(F,[0,0]);assert.equal(F.f[owner][c.field],f[c.field]);assert.deepEqual(layer(F,c,owner,true).data,raster.data,field+' animates status');holds++;}
            }
            const F=JSON.parse(before);F.hitstop=F.freeze=0;F.stop={o:1-owner,t:3};step(F,[0,0]);
            if(c.id!=='absolute'){assert.equal(F.f[owner][c.field],f[c.field]);assert.deepEqual(layer(F,c,owner,true).data,raster.data,'time-stopped status advances');}
            else assert.equal(F.dom.t,A.dom.t+1,'existing Domain advance during time stop changed');
            const clean=JSON.parse(before);clean.f[owner][c.field]=0;assert.notDeepEqual(fighter(A,owner).data,fighter(clean,owner).data,'world fighter does not route status');
          }
        } else if(saw)expired=true;
        if(tick%19===0){pxWorldSurface(A,{});assert.deepEqual(fighter(A,owner).data,fighter(JSON.parse(before),owner).data);}
        assert.equal(JSON.stringify(A),before,'painting mutates real timeline');
        step(A,[0,0]);step(B,[0,0]);assert.equal(JSON.stringify(A),JSON.stringify(B),'rendering changes outcome');
      }
      assert(saw&&expired,'status never activated/expired '+c.id);timelines++;
    }
  }
  assert.equal(new Set(masks).size,4,'status silhouettes repeat');
  // Actual art/punch contact: immunity, one-use return, persistent return and cancellation.
  for(const owner of [0,1])for(const c of cases.slice(0,3)) {
    const A=active(c,owner);A.freeze=A.hitstop=0;const f=A.f[owner],o=A.f[1-owner];
    f.x=owner?700:580;o.x=owner?620:660;f.face=owner?-1:1;o.face=-f.face;
    const hp=f.hp,otherHp=o.hp,input=[0,0];input[1-owner]=BTN.P;step(A,input);
    for(let n=0;n<12;n++)step(A,[0,0]);
    assert.equal(f.hp,hp,'defense failed');
    if(c.id==='infinity'){assert.equal(o.hp,otherHp);assert(A.ev.some(e=>e.k==='inf'));}
    else {assert(o.hp<otherHp,'counter failed to return blow');assert(A.ev.some(e=>e.k==='counter'));if(c.id==='counter')assert.equal(f.counter,0,'brief counter not spent');}
    if(c.id==='infinity') {const C=active(c,owner);C.freeze=C.hitstop=0;for(let n=0;n<12;n++)step(C,[0,0]);const inp=[0,0];inp[owner]=BTN.P;step(C,inp);assert.equal(C.f[owner].inf,0,'attacking no longer cancels Infinity');}
    timelines++;
  }
  const c=cases[2],S=fixture(c,12),f=S.f[0],ready=layer(S,c);
  for(const st of ['hit','stun']) {f.st=st;const suspended=layer(S,c);assert.notDeepEqual(suspended.data,ready.data);assert.equal(inkAt(suspended,107,70),0,'suspended counter keeps solid boss');}
  f.st='guard';S.dom.o=1;const unrelated=layer(S,c);S.dom.t+=10;assert.deepEqual(layer(S,c).data,unrelated.data,'other owner Domain drives status');
  // A bypassing shock really suspends Absolute Counter; it resumes after recovery.
  for(const owner of [0,1]) {
    const A=active(c,owner);A.freeze=A.hitstop=0;const f=A.f[owner],o=A.f[1-owner];
    hit(A,1-owner,f,o.x,{dmg:5,shock:3,noCounter:1});assert.equal(f.st,'stun');assert(f.abs>0);
    assert.equal(inkAt(layer(A,c,owner,true),80+f.face*27,70),0);
    for(let n=0;n<10&&f.st==='stun';n++)step(A,[0,0]);assert.equal(f.st,'idle');assert(f.abs>0);
    assert.equal(inkAt(layer(A,c,owner,true),80+f.face*27,70),255);
  }
  newRound(S);for(const c of cases)assert(layer(S,c).data.every(v=>v===0),'rematch leaves status');
  console.log('PASS',frames,'hard-alpha status frames / materials, clear center, exact mirrors, active clocks, snapshots;',clipping,'edge crops;',timelines,'actual input/expiry/contact timelines / unchanged outcomes;',holds,'freeze holds; suspended Maximum and resets');
}
if(timing)for(const c of cases) {
  const S=active(c),f=S.f[0];S.stage='gallery';
  for(let n=0;n<40;n++)pxWorldSurface(S,{});
  const times=[];for(let n=0;n<240;n++) {f[c.field]=c.id==='absolute'?2:c.dur-n%c.dur;if(c.id==='absolute')S.dom.t=n+1;
    const start=performance.now();pxWorldSurface(S,{});times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);console.log(JSON.stringify({id:c.id,frames:240,medianMs:+times[120].toFixed(3),p95Ms:+times[228].toFixed(3)}));
}
if(output) {
  const sheet=new PixelSurface(1000,680);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);pxText(sheet,'STATUS EFFECTS / COUNTDOWN OR OWN DOMAIN AGE',12,12,PX_LIGHT,2);
  cases.forEach((c,row)=>{[0,4,8,16,c.dur-1].forEach((age,col)=>{
    const S=fixture(c,age),cell=new PixelSurface(192,132);cell.rect(0,0,192,132,'#334053');pxPaintFighter(cell,S,S.f[0],null);sheet.blit(cell,col*200,40+row*160);
    pxText(sheet,c.id.toUpperCase()+' / AGE '+age,col*200+6,176+row*160,PX_LIGHT);
  });});writePNG(output+'/'+prefix+'-status-phases.png',sheet);
  const scenes=new PixelSurface(1280,1080);scenes.rect(0,0,1280,1080,PX_INK);
  for(let i=0;i<6;i++) {
    const c=cases[[0,1,2,3,0,2][i]],owner=i%2,S=active(c,owner);S.stage=PX_STAGES[Math.floor(i/2)].id;
    if(c.id==='zone')for(let n=0;n<100&&S.f[owner].zone>460;n++)step(S,[0,0]);
    const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);pxOutlinedText(frame,c.id.toUpperCase()+' / FACING '+(owner?'LEFT':'RIGHT'),12,88,PX_LIGHT);
    scenes.blit(frame,i%2*640,Math.floor(i/2)*360);
  }writePNG(output+'/'+prefix+'-status-scenes.png',scenes);
  const states=new PixelSurface(600,350);states.rect(0,0,600,350,PX_INK);
  pxText(states,'MAXIMUM / READY - SHOCK - RECOVERED',10,10,PX_LIGHT,2);
  for(const owner of [0,1]) {
    const S=active(cases[2],owner);S.freeze=S.hitstop=0;const f=S.f[owner],o=S.f[1-owner];
    for(let n=0;n<3;n++) {
      if(n===1)hit(S,1-owner,f,o.x,{dmg:5,shock:3,noCounter:1});
      if(n===2)for(let tick=0;tick<10&&f.st==='stun';tick++)step(S,[0,0]);
      const cell=new PixelSurface(192,132);cell.rect(0,0,192,132,'#334053');pxPaintFighter(cell,S,{...f,x:192,y:240},null);states.blit(cell,n*200,38+owner*154);
      pxText(states,['READY','SHOCK BYPASS','RECOVERED'][n]+' / '+(owner?'LEFT':'RIGHT'),n*200+5,174+owner*154,PX_LIGHT);
    }
  }writePNG(output+'/'+prefix+'-status-suspension.png',states);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v46',previewOnly,process.argv.includes('--timing'),require('node:perf_hooks').performance);
