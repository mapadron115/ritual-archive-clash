// Rock charge presentation: exact rasters and actual button timelines, not human play.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const baseline=process.argv.includes('--baseline'),previewOnly=process.argv.includes('--preview-only');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>baseline&&n==='pixel-world'?require('node:child_process').execFileSync('git',['show','HEAD:src/pixel-world.js'],{cwd:root,encoding:'utf8'}):fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
Function('assert','writePNG','output','prefix','previewOnly','rulesOnly','timing','performance',source+'\n'+`
const ch=CH.findIndex(c=>c.arts[0].id==='rock'),ages=[1,24,25,49,50,74,75];
function begin(owner=0,near=false) {
  const S=newMatch(ch,ch,192);S.phase='fight';
  S.f[owner].x=owner?900:380;S.f[1-owner].x=owner?(near?730:250):(near?550:1030);
  S.f[owner].face=owner?-1:1;S.f[1-owner].face=owner?1:-1;
  const b=[0,0];b[owner]=BTN.A1;step(S,b);return S;
}
function active(owner=0,age=25) {
  const S=begin(owner);const b=[0,0];b[owner]=BTN.A1;
  for(let n=0;n<120&&S.f[owner].chg<age;n++)step(S,b);
  assert.equal(S.f[owner].chg,age);return S;
}
function cue(S,f) {
  if(typeof pxChargeCue==='function'){const s=new PixelSurface(640,360);pxChargeCue(s,f);return s;}
  // Before-only extraction: the existing cue is the last fighter layer.
  const a=new PixelSurface(640,360),b=new PixelSurface(640,360);pxPaintFighter(a,S,f,null);pxPaintFighter(b,S,{...f,chg:0},null);
  for(let n=0;n<a.data.length;n+=4)if(a.data.subarray(n,n+4).every((v,k)=>v===b.data[n+k]))a.data.fill(0,n,n+4);
  return a;
}
function hash(s){return Buffer.from(s.data).toString('base64');}
if(!previewOnly) {
  let frames=0,crops=0,timelines=0,holds=0,interruptions=0;
  if(!rulesOnly) {
    const S=active(),f={...S.f[0],x:640,y:612,face:1},tiers=new Set();
    for(let age=1;age<=75;age++) {
      f.chg=age;const before=JSON.stringify(f),s=cue(S,f);assert.equal(JSON.stringify(f),before,'cue writes fighter');
      assert.deepEqual(cue({...S,t:S.t+1001},f).data,s.data,'cue uses global clock');
      assert.deepEqual(cue(JSON.parse(JSON.stringify(S)),JSON.parse(before)).data,s.data,'snapshot changes cue');
      const m=cue(S,{...f,face:-1}),colors=new Set();let area=0;
      for(let y=0;y<360;y++)for(let x=0;x<640;x++) {
        const p=(y*640+x)*4,a=s.data[p+3];assert(a===0||a===255,'soft alpha');
        if(a){area++;colors.add(s.data.slice(p,p+3).join(','));assert(x>=315&&x<=359&&y>=240&&y<=283,'cue outside hand lane');}
        if(x>0)assert.deepEqual(s.data.subarray(p,p+4),m.data.subarray((y*640+640-x)*4,(y*640+640-x)*4+4),'cue facing mismatch');
      }
      assert(area>120&&area<800,'missing/excessive charge');assert(colors.size>=4&&colors.size<=6,'flat/noisy charge');
      for(let tier=1;tier<=3;tier++) {
        const p=((250+(tier-1)*10)*640+354)*4;
        assert.deepEqual(Array.from(s.data.slice(p,p+3)),age>=tier*25?[224,241,207]:[40,83,70],'tier lamp lies at '+age+'/'+tier);
        // A whole 6-by-5 face must light, rather than a near-invisible glint.
        for(let ly=-2;ly<=2;ly++)for(let lx=-3;lx<=2;lx++) {
          const q=p+(ly*640+lx)*4,v=s.data.subarray(q,q+3);
          assert(age>=tier*25?v[0]>=155&&v[1]>=215:v[0]===40&&v[1]===83,'lamp face too small/incorrect');
        }
      }
      if([1,25,50,75].includes(age))tiers.add(hash(s));frames++;
    }
    assert.equal(tiers.size,4,'strength tiers indistinct');
    for(const age of [25,50,75]) {
      const a=cue(S,{...f,chg:age-1}),b=cue(S,{...f,chg:age});let changed=0,gain=0,count=0;
      for(let y=250;y<=272;y++)for(let x=323;x<=346;x++) {
        const p=(y*640+x)*4;if(!a.data[p+3])continue;
        assert.equal(a.data[p+3],b.data[p+3],'tier changes cuff silhouette');
        const light=s=>.2126*s.data[p]+.7152*s.data[p+1]+.0722*s.data[p+2];
        const delta=light(b)-light(a);assert(delta>=0,'cuff dims as charge rises');
        gain+=delta;count++;if(delta>0)changed++;
      }
      assert(changed>=200&&gain/count>15,'tier lacks a broad native-size value change: '+age+' / '+changed+' pixels / '+gain/count+' mean gain');
    }
    assert.equal(cue(S,f).data[(261*640+334)*4+3],0,'cuff covers hand center');
    for(const age of [24,25,49,50,74,75])for(const x of [-31,0,640,1280,1311])for(const y of [0,612,720])for(const face of [-1,1]) {
      const a=new PixelSurface(640,360),b=new PixelSurface(840,560),q={...f,x:x+.5,y:y+.5,face,chg:age};
      pxChargeCue(a,q);pxChargeCue(b,{...q,x:q.x+200,y:q.y+200});
      for(let row=0;row<360;row++)assert.deepEqual(a.data.subarray(row*640*4,(row+1)*640*4),b.data.subarray(((row+100)*840+100)*4,((row+100)*840+740)*4),'fractional edge crop');crops++;
    }
    for(const q of [{...f,chg:0},{...f,mt:13},{...f,mt:14},{...f,st:'idle',move:null},{...f,st:'hit',move:null},{...f,st:'cast',move:null},{...f,move:'a1'},{...f,move:'p1'}]) {
      assert(cue(S,q).data.every(v=>v===0),'stale charge cue');
      const a=new PixelSurface(640,360),b=new PixelSurface(640,360);pxPaintFighter(a,S,q,null);pxPaintFighter(b,S,{...q,chg:0},null);assert.deepEqual(a.data,b.data,'fighter layer retains stale cue');
    }
  }
  for(const owner of [0,1])for(const release of [0,24,25,49,50,74,75])for(const mode of ['whiff','hit','guard']) {
    const A=begin(owner,mode!=='whiff'),B=JSON.parse(JSON.stringify(A));let fired=false,probed=false,firstCharge=false;
    const initial=A.f[1-owner].hp;let damage=0;
    for(let n=0;n<240;n++) {
      const f=A.f[owner],before=JSON.stringify(A),s=rulesOnly?null:cue(A,f);
      if(f.chg>0&&!firstCharge)firstCharge=true;
      if(!rulesOnly&&firstCharge&&!(f.st==='atk'&&f.move==='a0'&&f.mt<13))assert(s.data.every(v=>v===0),'charge persists after release/recovery');
      if(f.chg===25&&!probed) {
        if(!rulesOnly)assert(s.data.some(v=>v),'blank freeze probe');
        for(const field of ['hitstop','freeze']) {
          const F=JSON.parse(before);F.hitstop=F.freeze=0;F[field]=3;
          for(let k=0;k<3;k++){step(F,[0,0]);assert.equal(F.f[owner].chg,25);if(!rulesOnly)assert.deepEqual(cue(F,F.f[owner]).data,s.data,'cue moves during pause');holds++;}
        }
        const F=JSON.parse(before);F.hitstop=F.freeze=0;F.stop={o:1-owner,t:3};step(F,[0,0]);assert.equal(F.f[owner].chg,25);if(!rulesOnly)assert.deepEqual(cue(F,F.f[owner]).data,s.data,'time-stopped charge moves');holds++;
        probed=true;
      }
      if(n%9===0)pxWorldSurface(A,{});assert.equal(JSON.stringify(A),before,'drawing changes simulation');
      const b=[0,0];if(!fired&&f.chg<release)b[owner]=BTN.A1;if(mode==='guard')b[1-owner]=BTN.G;
      step(A,b);step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B),'rendered and control outcomes differ');
      if(A.ev.some(e=>e.k==='boom'))fired=true;
      damage=initial-A.f[1-owner].hp;
      if(fired&&A.f[owner].st==='idle'&&n>140)break;
    }
    assert(fired,'charge never released');assert.equal(A.f[owner].chg,release,'charge amount changed');
    if(mode==='whiff')assert.equal(damage,0);
    else if(mode==='hit')assert(Math.abs(damage-[80,120,160,200][Math.min(3,Math.floor(release/25))]*CH[ch].melee)<1e-7,'tier damage changed');
    else assert(damage>0&&damage<[80,120,160,200][Math.min(3,Math.floor(release/25))]*CH[ch].melee,'guard no longer reduces damage');
    if(!rulesOnly)assert(cue(A,A.f[owner]).data.every(v=>v===0),'idle keeps charge');timelines++;
  }
  for(const owner of [0,1])for(const age of [1,25,50,75]) {
    const S=active(owner,age),f=S.f[owner];
    hit(S,1-owner,f,S.f[1-owner].x,{dmg:5,shock:12,noCounter:1});
    assert.equal(f.st,'stun');assert.equal(f.chg,age,'interruption clears stored charge under existing rules');
    if(!rulesOnly)assert(cue(S,f).data.every(v=>v===0),'interrupted charge remains visible');interruptions++;
    newRound(S);assert.equal(S.f[owner].chg,0);
  }
  for(const owner of [0,1])for(const age of [1,25,50]) {
    const A=active(owner,age),f=A.f[owner],o=A.f[1-owner];o.x=f.x+f.face*80;o.face=-f.face;
    const B=JSON.parse(JSON.stringify(A)),hp=f.hp;let interrupted=false;
    for(let n=0;n<12;n++) {
      const b=[0,0];b[owner]=BTN.A1;if(n===0)b[1-owner]=BTN.P;
      pxWorldSurface(A,{});step(A,b);step(B,b);assert.equal(JSON.stringify(A),JSON.stringify(B));
      if(f.hp<hp){interrupted=true;assert.notEqual(f.st,'atk');if(!rulesOnly)assert(cue(A,f).data.every(v=>v===0),'real punch leaves charge cue');break;}
    }
    assert(interrupted,'punch failed to interrupt real charge');interruptions++;
  }
  if(!rulesOnly)console.log('PASS',frames,'charge ages / four strength tiers, 6x5 lit faces / broad cuff value steps, clear center, exact mirrors, hard alpha, active clock, snapshots;',crops,'fractional edge crops');
  console.log('PASS',timelines,'real release/whiff/hit/guard timelines;',holds,'freeze/time-stop state holds'+(rulesOnly?'':' and rasters')+';',interruptions,'shock/punch interruptions, eight round resets / unchanged outcomes');
}
if(timing) {
  const S=active(0,1),f=S.f[0];S.stage='gallery';
  for(let n=0;n<40;n++){f.chg=1+n%75;pxWorldSurface(S,{});}
  const times=[];for(let n=0;n<240;n++){f.chg=1+n%75;const start=performance.now();pxWorldSurface(S,{});times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);console.log(JSON.stringify({frames:240,medianMs:+times[120].toFixed(3),p95Ms:+times[228].toFixed(3)}));
}
if(output) {
  const sheet=new PixelSurface(1400,450);sheet.rect(0,0,1400,450,PX_INK);pxText(sheet,'ROCK / EXISTING CHARGE TIERS / FACING RIGHT AND LEFT',12,12,PX_LIGHT,2);
  for(const owner of [0,1])ages.forEach((age,col)=>{
    const S=active(owner,age),f={...S.f[owner],x:192,y:240};const cell=new PixelSurface(192,132);cell.rect(0,0,192,132,'#334053');pxPaintFighter(cell,S,f,null);sheet.blit(cell,col*200,48+owner*194);
    pxText(sheet,'CHG '+age+' / TIER '+Math.floor(age/25),col*200+6,187+owner*194,PX_LIGHT);pxText(sheet,owner?'LEFT / ALT':'RIGHT / MAIN',col*200+6,201+owner*194,'#8ed9e1');
  });writePNG(output+'/'+prefix+'-charge-phases.png',sheet);
  const scenes=new PixelSurface(1280,1080);scenes.rect(0,0,1280,1080,PX_INK);
  for(let i=0;i<6;i++) {
    const owner=i%2,S=active(owner,[24,50,75][Math.floor(i/2)]);S.stage=PX_STAGES[Math.floor(i/2)].id;
    const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);pxOutlinedText(frame,'CHARGE '+S.f[owner].chg+' / FACING '+(owner?'LEFT':'RIGHT'),12,88,PX_LIGHT);
    scenes.blit(frame,i%2*640,Math.floor(i/2)*360);
  }writePNG(output+'/'+prefix+'-charge-scenes.png',scenes);
  // Same stage/costume across all four tiers, with separate 640x360 native
  // frames so review never depends on scaling a large contact sheet to fit.
  for(const stage of PX_STAGES)for(const owner of [0,1]) {
    const compare=new PixelSurface(1280,720),side=owner?'left':'right';
    [24,25,50,75].forEach((age,i)=>{
      const S=active(owner,age);S.stage=stage.id;
      const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);
      pxOutlinedText(frame,'ROCK / TIER '+Math.floor(age/25)+' / '+side.toUpperCase(),12,88,PX_LIGHT);
      compare.blit(frame,i%2*640,Math.floor(i/2)*360);
      writePNG(output+'/'+prefix+'-'+stage.id+'-'+side+'-tier'+Math.floor(age/25)+'.png',frame);
    });writePNG(output+'/'+prefix+'-'+stage.id+'-'+side+'-tiers.png',compare);
  }
  const states=new PixelSurface(1000,210);states.rect(0,0,1000,210,PX_INK);pxText(states,'CHARGED - RELEASE - RECOVERY - IDLE - INTERRUPTED',10,10,PX_LIGHT,2);
  const S=active(0,50),samples=[JSON.parse(JSON.stringify(S))];
  for(let n=0;n<3;n++){while(n===0?S.f[0].mt<14:n===1?S.f[0].mt<20:S.f[0].st!=='idle')step(S,[0,0]);samples.push(JSON.parse(JSON.stringify(S)));}
  const H=active(0,50);hit(H,1,H.f[0],H.f[1].x,{dmg:5,shock:12,noCounter:1});samples.push(H);
  samples.forEach((S,i)=>{const cell=new PixelSurface(192,132);cell.rect(0,0,192,132,'#334053');pxPaintFighter(cell,S,{...S.f[0],x:192,y:240},null);states.blit(cell,i*200,40);pxText(states,['CHARGED','RELEASE','RECOVERY','IDLE','SHOCK BYPASS'][i],i*200+5,183,PX_LIGHT);});writePNG(output+'/'+prefix+'-charge-lifecycle.png',states);
}
`)(assert,writePNG,process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:null,process.argv[3]||'v49',previewOnly,process.argv.includes('--rules-only'),process.argv.includes('--timing'),require('node:perf_hooks').performance);
