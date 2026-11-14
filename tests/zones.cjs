// Lingering-effect raster audit and actual input timelines. Not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','timing','performance',source+'\n'+`
const cases=[{id:'blue',kind:'blue',ages:[0,18,42,48,54,59]},{id:'jcut',kind:'mark',ages:[0,10,21,22,27,33]}];
function begin(id,owner=0) {
  const ch=CH.findIndex(c=>c.arts.some(a=>a.id===id)),S=newMatch(owner?2:ch,owner?ch:2,193);
  S.phase='fight';const f=S.f[owner],o=S.f[1-owner];f.x=owner?980:300;o.x=owner?480:800;f.face=owner?-1:1;f.ce=100;
  const input=[0,0];input[owner]=BTN['A'+(CH[ch].arts.findIndex(a=>a.id===id)+1)];step(S,input);
  return S;
}
function active(id,owner=0) {const S=begin(id,owner);for(let n=0;n<100&&!S.zones.length;n++)step(S,[0,0]);assert(S.zones.length,id+' never created zone');return S;}
function layer(S) {const s=new PixelSurface(640,360);for(const z of S.zones)pxZone(s,S,z);return s;}
if(!previewOnly) {
  let frames=0,timelines=0,holds=0;
  for(const c of cases) {
    const S=active(c.id),z=S.zones[0];assert.equal(z.k,c.kind);
    const phases=new Set();
    for(let t=0;t<z.dur;t++) {
      const state=JSON.parse(JSON.stringify(S));state.zones[0]={...z,x:640,y:360,t};
      const before=JSON.stringify(state),s=layer(state);assert.equal(JSON.stringify(state),before,'painting writes state');
      assert.deepEqual(layer({...state,t:state.t+991}).data,s.data,'effect uses global clock');
      assert.deepEqual(layer(JSON.parse(before)).data,s.data,'snapshot parity');
      let area=0,minX=640,maxX=0,minY=360,maxY=0;const colors=new Set();
      for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++) {
        const p=(y*s.w+x)*4;assert(s.data[p+3]===0||s.data[p+3]===255,'soft alpha');
        if(s.data[p+3]) {area++;colors.add(s.data.slice(p,p+3).join(','));minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
      }
      assert(area>=12,'missing zone '+c.id+' T'+t);assert(colors.size>=3&&colors.size<=7,'flat/noisy zone');
      assert(minX>=238&&maxX<=402&&minY>=98&&maxY<=262,'zone beyond authored envelope');
      if(c.kind==='mark'&&t<z.delay) {
        // Warning brackets keep a generous transparent center for the defender.
        for(let y=165;y<=195;y++)for(let x=305;x<=335;x++)assert.equal(s.data[(y*s.w+x)*4+3],0,'warning covers center');
      }
      if(c.kind==='blue'&&t>=48)assert.equal(s.data[(180*s.w+320)*4+3],0,'spent attraction still has a solid core');
      if(c.kind==='blue'&&t<48)assert.equal(s.data[(180*s.w+320)*4+3],255,'active attraction missing its core');
      if(c.kind==='mark'&&t>=z.delay)assert.equal(s.data[(180*s.w+320)*4+3],255,'cut did not open at its existing delay');
      if(c.ages.includes(t))phases.add(Buffer.from(s.data).toString('base64'));frames++;
    }
    assert.equal(phases.size,c.ages.length,'missing warning/contact/decay phases');
    // Edge and fractional snapshot positions must match a padded render crop.
    for(const x of [-70,0,61,1219,1280,1350])for(const y of [-40,0,611,720,770])for(const t of c.ages) {
      const a=new PixelSurface(640,360),b=new PixelSurface(840,560),q={...z,x:x+.5,y:y+.5,t};
      pxZone(a,S,q);pxZone(b,S,{...q,x:q.x+200,y:q.y+200});
      for(let row=0;row<a.h;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+100)*840+100)*4,((row+100)*840+740)*4),'edge/fractional clipping');
    }
    for(const owner of [0,1])for(const escape of [false,true]) {
      const A=begin(c.id,owner),B=JSON.parse(JSON.stringify(A));let saw=false,damaged=false,pulled=false,checked=false,impactAge=false;
      for(let tick=0;tick<180;tick++) {
        const before=JSON.stringify(A),z=A.zones.find(z=>z.k===c.kind);
        if(z) {
          saw=true;const raster=layer(A);assert.equal(JSON.stringify(A),before,'layer mutates match');
          assert.deepEqual(layer(JSON.parse(before)).data,raster.data,'network snapshot changes zone');
          if(!checked) {
            for(const field of ['hitstop','freeze']) {
              const F=JSON.parse(before);F[field]=3;
              for(let n=0;n<3;n++){step(F,[0,0]);assert.deepEqual(F.zones,A.zones,field+' advances zone');assert.deepEqual(layer(F).data,raster.data,field+' changes art');holds++;}
            }
            const T=JSON.parse(before);T.hitstop=T.freeze=0;T.stop={o:1-owner,t:3};step(T,[0,0]);
            assert.equal(T.zones[0].t,z.t+1,'existing time-stop zone advance changed');checked=true;
          }
          if(z.t===(c.kind==='blue'?48:z.delay))impactAge=true;
        }
        pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'world writes match');
        damaged ||= A.f[1-owner].hp<maxHp(A.f[1-owner]);
        const x=A.f[1-owner].x,age=z&&z.t,inputs=[0,0];
        // Move away only after the zone exists: it must remain at its original position.
        if(escape&&saw)inputs[1-owner]=owner?BTN.L:BTN.R;
        step(A,inputs);step(B,inputs);assert.equal(JSON.stringify(A),JSON.stringify(B),'painting changes outcome');
        if(!escape&&c.kind==='blue'&&age<47&&Math.abs(A.f[1-owner].x-x)>0)pulled=true;
      }
      assert(saw&&impactAge,'missing zone or exact detonation age');assert(!A.zones.length,'stale zone');
      assert.equal(damaged,!escape,'existing contact/escape behavior');
      if(c.kind==='blue'&&!escape)assert(pulled,'attraction no longer pulls');timelines++;
    }
  }
  console.log('PASS',frames,'hard-alpha zone ages / clear warning center, spent core, materials, phases, clipping, snapshots;',timelines,'real input/contact/escape timelines / identical outcomes;',holds,'freeze holds; existing time-stop advance retained');
}
if(timing)for(const c of cases) {
  const S=active(c.id),z=S.zones[0];S.stage='gallery';
  for(let n=0;n<40;n++){z.t=n%z.dur;pxWorldSurface(S,{});}
  const times=[];for(let n=0;n<240;n++){z.t=n%z.dur;const start=performance.now();pxWorldSurface(S,{});times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);console.log(JSON.stringify({id:c.id,frames:240,medianMs:+times[120].toFixed(3),p95Ms:+times[228].toFixed(3)}));
}
if(output) {
  const sheet=new PixelSurface(1200,440);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);
  pxText(sheet,'LINGERING ZONES / ACTUAL MOVE ZONES / ACTIVE AGES',12,12,PX_LIGHT,2);
  cases.forEach((c,row)=>{const S=active(c.id),z=S.zones[0];c.ages.forEach((t,col)=>{
    const cell=new PixelSurface(196,176);cell.rect(0,0,cell.w,cell.h,'#334053');
    pxZone(cell,S,{...z,x:196,y:176,t});sheet.blit(cell,col*200,44+row*198);
    pxText(sheet,c.id.toUpperCase()+' / T'+t,col*200+8,224+row*198,PX_LIGHT);
  });});writePNG(output+'/'+prefix+'-zone-phases.png',sheet);
  const scenes=new PixelSurface(1280,1080);scenes.rect(0,0,1280,1080,PX_INK);
  for(let i=0;i<6;i++) {
    const c=cases[i%2],owner=i%2,S=active(c.id,owner),age=c.ages[[1,2,3][Math.floor(i/2)]];
    // Advance real simulation through warning/impact; never manufacture a contact state.
    for(let tick=0;tick<150&&S.zones[0]&&S.zones[0].t<age;tick++)step(S,[0,0]);
    S.stage=PX_STAGES[Math.floor(i/2)].id;const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);
    pxOutlinedText(frame,c.id.toUpperCase()+' / FACING '+(owner?'LEFT':'RIGHT')+' / T'+(S.zones[0]?.t??'EXPIRED'),12,88,PX_LIGHT);
    scenes.blit(frame,i%2*640,Math.floor(i/2)*360);
  }writePNG(output+'/'+prefix+'-zone-scenes.png',scenes);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v45',previewOnly,process.argv.includes('--timing'),require('node:perf_hooks').performance);
