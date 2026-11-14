// Beam identity and actual input timelines. Exact raster evidence, not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','timing','performance',source+'\n'+`
const cases=['granite','piercing','apshot','nuclear','bloodsweep'];
function begin(id,owner=0) {
  const maximum=['nuclear','bloodsweep'].includes(id),ch=CH.findIndex(c=>maximum?c.dom.kind===id:c.arts.some(a=>a.id===id));assert(ch>=0);
  const S=newMatch(owner?2:ch,owner?ch:2,193);S.phase='fight';
  const f=S.f[owner],o=S.f[1-owner];f.x=owner?980:300;o.x=owner?300:980;f.face=owner?-1:1;f.ce=100;f.gauge=100;
  const input=[0,0];input[owner]=maximum?BTN.DOM:BTN['A'+(CH[ch].arts.findIndex(a=>a.id===id)+1)];
  step(S,input);return S;
}
function active(id,owner=0) {
  const S=begin(id,owner);for(let n=0;n<220&&!S.zones.some(z=>z.k==='beam');n++)step(S,[0,0]);
  assert(S.zones.some(z=>z.k==='beam'),id+' never fired');return S;
}
function layer(S) {const s=new PixelSurface(640,360);for(const z of S.zones)if(z.k==='beam')pxZone(s,S,z);return s;}
function mask(s) {let h=2166136261;for(let p=3;p<s.data.length;p+=4)h=Math.imul(h^(s.data[p]?1:0),16777619);return h;}
if(!previewOnly) {
  let frames=0,timelines=0,holds=0;const shapes=new Set();
  for(const id of cases) {
    const S=active(id),zone=S.zones.find(z=>z.k==='beam');
    for(let t=0;t<zone.dur;t++) {
      const z={...zone,x:320,y:160,t,face:1},before=JSON.stringify(z),a=new PixelSurface(320,160),b=new PixelSurface(320,160);
      pxZone(a,S,z);pxZone(b,S,{...z,face:-1});assert.equal(JSON.stringify(z),before,'paint writes zone');
      let count=0;const colors=new Set();
      for(let y=0;y<a.h;y++)for(let x=1;x<a.w;x++) {
        const p=(y*a.w+x)*4,q=(y*b.w+320-x)*4,alpha=a.data[p+3];
        assert(alpha===0||alpha===255,'soft beam alpha');
        assert.deepEqual(a.data.slice(p,p+4),b.data.slice(q,q+4),'beam mirror '+id+' T'+t);
        if(alpha) {count++;colors.add(Array.from(a.data.slice(p,p+3)).join(','));assert(x>=160,'beam behind its origin');}
      }
      assert(count>100,'missing beam');assert(colors.size<=6,'too many material colors');
      if(t<2)assert(colors.size>=4,id+' flat material');
      const snapshot=JSON.parse(before),copy=new PixelSurface(320,160);pxZone(copy,{...S,t:S.t+1000},snapshot);
      assert.deepEqual(copy.data,a.data,'beam uses global clock or nonserialized history');frames+=2;
    }
    if(['granite','piercing','apshot'].includes(id)) {
      const phases=new Set();
      for(const t of [0,2,4,6]) {
        const s=new PixelSurface(320,160);pxZone(s,S,{...zone,x:40,y:160,w:30/(1-t/zone.dur),t});phases.add(Buffer.from(s.data).toString('base64'));
      }
      assert(phases.size>=3,id+' missing active-age detail');
      const s=new PixelSurface(320,160);pxZone(s,S,{...zone,x:40,y:160,w:30,t:0});assert(!shapes.has(mask(s)),id+' repeats another beam silhouette');shapes.add(mask(s));
    }
    if(['granite','nuclear'].includes(id))for(let t=0;t<zone.dur;t++) {
      const s=new PixelSurface(320,160);pxZone(s,S,{...zone,x:40,y:160,w:30/(1-t/zone.dur),cone:0,t});
      // A rib travels six pixels every two active ticks through a 48-pixel cell,
      // including the former four-position reset and the eight-position seam.
      const u=(Math.floor(t/2)*6)%48,p=(80*320+20+48+u)*4;
      assert.deepEqual(Array.from(s.data.slice(p,p+4)),pxRGB('#ffd599'),'cannon rib jumps backward at T'+t);
    }
    // Offscreen roots and wide cones are clipped safely on every edge.
    for(const x of [-1500,-40,40,1240,1400,2700])for(const face of [-1,1])for(const y of [-40,0,700,760]) {
      const s=new PixelSurface(640,360),padded=new PixelSurface(672,392);
      pxZone(s,S,{...zone,x,y,face});pxZone(padded,S,{...zone,x:x+32,y:y+32,face});
      for(let row=0;row<360;row++)assert.deepEqual(s.data.subarray(row*640*4,(row+1)*640*4),padded.data.subarray(((row+16)*672+16)*4,((row+16)*672+656)*4),'clipping changes visible beam');
    }
    for(const owner of [0,1]) {
      const A=begin(id,owner),B=JSON.parse(JSON.stringify(A));let saw=false,damaged=false,checked=false;
      for(let tick=0;tick<260;tick++) {
        const before=JSON.stringify(A),z=A.zones.find(z=>z.k==='beam');
        if(z) {
          saw=true;const raster=layer(A);assert.equal(JSON.stringify(A),before,'render mutates match');
          assert.deepEqual(layer(JSON.parse(before)).data,raster.data,'snapshot changes beam');
          if(!checked) {
            for(const field of ['hitstop','freeze']) {
              const F=JSON.parse(before);F[field]=3;
              for(let n=0;n<3;n++){step(F,[0,0]);assert.deepEqual(F.zones,A.zones,field+' advances beam');assert.deepEqual(layer(F).data,raster.data,field+' changes beam frame');holds++;}
            }
            // Existing zones keep advancing during time stop (unlike projectiles).
            const T=JSON.parse(before);T.hitstop=T.freeze=0;T.stop={o:1-owner,t:3};step(T,[0,0]);
            const next=T.zones.find(q=>q.k==='beam');assert(next&&next.t===z.t+1,'existing time-stop zone clock changed');checked=true;
          }
        }
        if(tick%20===0) {pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'world mutates match');}
        damaged ||= A.f[1-owner].hp<CH[A.f[1-owner].ch].hp;
        step(A,[0,0]);step(B,[0,0]);assert.equal(JSON.stringify(A),JSON.stringify(B),'painting changes outcome');
      }
      assert(saw&&damaged,id+' input must fire and contact');assert(!A.zones.some(z=>z.k==='beam'),id+' stale beam');timelines++;
    }
  }
  console.log('PASS',frames,'hard-alpha beam frames / exact mirrors; three material silhouettes / active-age phases;',timelines,'real input-owner timelines / contact, expiry, snapshots, identical outcomes;',holds,'freeze holds; existing time-stop zone advance retained');
}
if(timing)for(const id of cases) {
  const S=active(id),z=S.zones.find(z=>z.k==='beam');S.stage='gallery';
  for(let n=0;n<40;n++){z.t=n%z.dur;pxWorldSurface(S,{});}
  const times=[];
  for(let n=0;n<240;n++){z.t=n%z.dur;const start=performance.now();pxWorldSurface(S,{});times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);console.log(JSON.stringify({id,frames:240,medianMs:+times[120].toFixed(3),p95Ms:+times[228].toFixed(3)}));
}
if(output) {
  const sheet=new PixelSurface(1280,5*142+36);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);
  pxText(sheet,'BEAMS / ACTUAL ATTACK ZONES / T0 T4 T8 / LEFT T4',12,10,PX_LIGHT,2);
  cases.forEach((id,row)=>{
    const S=active(id),z=S.zones.find(z=>z.k==='beam');pxText(sheet,id.toUpperCase(),12,48+row*142,PX_LIGHT);
    for(const [col,t,face]of [[0,0,1],[1,4,1],[2,8,1],[3,4,-1]]) {
      const cell=new PixelSurface(266,112);cell.rect(0,0,266,112,'#334053');
      pxZone(cell,S,{...z,x:face>0?12:518,y:112,t,face});sheet.blit(cell,196+col*270,38+row*142);
      pxText(sheet,(face>0?'RIGHT':'LEFT')+' / T'+t,202+col*270,155+row*142,PX_LIGHT);
    }
  });writePNG(output+'/'+prefix+'-beam-bodies.png',sheet);
  const scenes=new PixelSurface(1280,1080);scenes.rect(0,0,1280,1080,PX_INK);
  for(let i=0;i<6;i++) {
    const id=cases[i%5],owner=i%2,S=active(id,owner);S.stage=PX_STAGES[i%3].id;
    const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);
    pxOutlinedText(frame,id.toUpperCase()+' / FACING '+(owner?'LEFT':'RIGHT'),12,88,PX_LIGHT);
    scenes.blit(frame,i%2*640,Math.floor(i/2)*360);
  }writePNG(output+'/'+prefix+'-beam-scenes.png',scenes);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v44',process.argv.includes('--preview-only'),process.argv.includes('--timing'),require('node:perf_hooks').performance);
