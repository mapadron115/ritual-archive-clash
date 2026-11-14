// Projectile identity and presentation-only animation, using real art-created shots.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs');
const source=['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','pixel-hud','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n');
const ctx=vm.createContext({console,assert,previewOnly:process.argv.includes('--preview-only')});
vm.runInContext(source+`\n
const arts=['red','flame','bloodwheel','paper','grape','gum','knives','nail','dismantle','guided','stone','thunderclap','quake'];
const mask=s=>{let out='';for(let n=3;n<s.data.length;n+=4)out+=s.data[n]?'1':'0';return out;};
function projectileSurface(S){const s=new PixelSurface(640,360);for(const p of S.proj)pxProjectile(s,p);return s;}
function shots(art,owner=0,press=false) {
  const ch=CH.findIndex(c=>c.arts.some(a=>a.id===art));assert(ch>=0);
  const S=newMatch(owner?2:ch,owner?ch:2,173);S.phase='fight';const f=S.f[owner];f.x=owner?1040:240;f.face=owner?-1:1;f.ce=100;
  if(press) {
    const input=[0,0];input[owner]=BTN['A'+(CH[ch].arts.findIndex(a=>a.id===art)+1)];step(S,input);
    for(let t=0;t<40&&!S.proj.length;t++)step(S,[0,0]);
  } else ART[art](S,f,S.f[1-owner]);
  assert(S.proj.length,art+' did not fire');return S;
}
if(!previewOnly) {
  const changed=['red','flame','bloodwheel','paper','grape','gum','knives','nail'],identities=new Set();let frames=0,timelines=0,holds=0;
  const trail=pxProjectileTrail;
  try {
    // Isolate actual body painting, so trail rounding cannot hide a wrong body root.
    pxProjectileTrail=()=>{};
    for(const art of changed) {
      const p=shots(art).proj[0],phases=new Set();
      for(const radius of [p.r,6,40])for(let t=0;t<16;t++) {
        const shot={...p,x:160,y:120,r:radius,t},before=JSON.stringify(shot),a=new PixelSurface(160,120),b=new PixelSurface(160,120);
        pxProjectile(a,{...shot,vx:18});pxProjectile(b,{...shot,vx:-18});
        assert.equal(JSON.stringify(shot),before);
        const colors=new Set();let occupied=0;
        for(let y=0;y<a.h;y++)for(let x=0;x<a.w;x++) {
          const n=(y*a.w+x)*4,alpha=a.data[n+3];assert(alpha===0||alpha===255,'soft body alpha');
          if(alpha){occupied++;assert(x>1&&x<158&&y>1&&y<118,art+' body clipped');colors.add(Array.from(a.data.slice(n,n+3)).join(','));}
          const mirror=(y*b.w+160-x)*4;
          if(x>0)assert.deepEqual(a.data.slice(n,n+4),b.data.slice(mirror,mirror+4),art+' body root/mirror');
        }
        assert(occupied>10);assert(colors.size>=(radius===6?2:3)&&colors.size<=6,art+' material tones: r='+radius+' t='+t+' colors='+colors.size);
        if(radius===p.r)phases.add(mask(a));frames+=2;
      }
      if(['red','flame','bloodwheel','paper','gum'].includes(art))assert(phases.size>=3,art+' static flight');
      const normalized=new PixelSurface(160,120);pxProjectile(normalized,{...p,x:160,y:120,r:20,t:0});
      const shape=mask(normalized);assert(!identities.has(shape),art+' duplicates another body silhouette');identities.add(shape);
    }
  } finally {pxProjectileTrail=trail;}
  for(const art of arts)for(const owner of [0,1]) {
    const A=shots(art,owner,true),B=JSON.parse(JSON.stringify(A));let sawDamage=false;
    for(let tick=0;tick<240;tick++) {
      const before=JSON.stringify(A),frame=tick<8||tick%12===0?pxWorldSurface(A,{}):null;
      assert.equal(JSON.stringify(A),before,'render writes simulation');
      if(tick<3)assert.deepEqual(pxWorldSurface(JSON.parse(before),{}).data,frame.data,'snapshot changes projectile');
      if(tick===2) {
        const frozen=projectileSurface(A);
        const H=JSON.parse(before);H.hitstop=3;
        for(let n=0;n<3;n++){step(H,[0,0]);assert.deepEqual(H.proj,A.proj,'hitstop advances shot');assert.deepEqual(projectileSurface(H).data,frozen.data,'hitstop changes projectile drawing');holds++;}
        const F=JSON.parse(before);F.freeze=3;
        for(let n=0;n<3;n++){step(F,[0,0]);assert.deepEqual(F.proj,A.proj,'global freeze advances shot');assert.deepEqual(projectileSurface(F).data,frozen.data,'global freeze changes projectile drawing');holds++;}
        const T=JSON.parse(before);T.stop={o:1-owner,t:3};const projectiles=JSON.stringify(T.proj);
        for(let n=0;n<2;n++){step(T,[0,0]);assert.equal(JSON.stringify(T.proj),projectiles,'time stop advances opposing shot');assert.deepEqual(projectileSurface(T).data,frozen.data,'time stop changes opposing projectile drawing');holds++;}
      }
      step(A,[0,0]);step(B,[0,0]);assert.equal(JSON.stringify(A),JSON.stringify(B),'render changes simulation outcome');
      sawDamage ||= A.f[1-owner].hp<CH[A.f[1-owner].ch].hp;
      A.ev.length=B.ev.length=0;
    }
    // These direct trajectories must make real contact, not merely expire offscreen.
    if(['flame','bloodwheel','paper','gum','knives','nail','dismantle'].includes(art))assert(sawDamage,art+' never contacted');
    assert.equal(A.proj.length,0,art+' leaves a stale projectile');timelines++;
  }
  // Supported snapshots may supply different colors; cache growth must stay bounded.
  for(let n=0;n<280;n++)pxProjectileBody({k:'orb',r:20,col:'#'+(0x500000+n).toString(16),t:n});
  assert(PX_PROJECTILE_BODIES.size<=256);
  const sample=shots('flame').proj[0];assert.strictEqual(pxProjectileBody(sample),pxProjectileBody({...sample,t:3}),'same active phase rebuilt');
  console.log('PASS',frames,'bounded hard-alpha body frames / eight unique silhouettes;',timelines,'actual art-owner timelines / identical simulation outcomes;',holds,'freeze holds; snapshots, contact/expiry, material tones and bounded cache');
}
function preview() {
  const sheet=new PixelSurface(960,arts.length*104+44);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);
  pxText(sheet,'PROJECTILES / REAL ART SAMPLES / FACING RIGHT AND LEFT',12,12,PX_LIGHT,2);
  arts.forEach((art,row)=>{
    pxText(sheet,art.toUpperCase(),12,48+row*104,PX_LIGHT);
    for(const [n,owner,t]of [[0,0,0],[1,0,4],[2,0,8],[3,1,8]]) {
      const p={...shots(art,owner).proj[0],x:150,y:68,t,life:24},cell=new PixelSurface(180,82);cell.rect(0,0,180,82,'#334053');
      pxProjectile(cell,p);sheet.blit(cell,210+n*184,42+row*104);
      pxText(sheet,(owner?'LEFT':'RIGHT')+' / T'+t,218+n*184,127+row*104,PX_LIGHT);
    }
  });
  globalThis.bodies=sheet;
  const silhouettes=new PixelSurface(960,8*112+44);silhouettes.rect(0,0,960,silhouettes.h,'#c6c2b3');
  pxText(silhouettes,'EIGHT BODY SILHOUETTES / T0 T4 T8 / RIGHT THEN LEFT',12,12,PX_INK,2);
  ['red','flame','bloodwheel','paper','grape','gum','knives','nail'].forEach((art,row)=>{
    pxText(silhouettes,art.toUpperCase(),12,60+row*112,PX_INK);
    for(const [n,t,face]of [[0,0,1],[1,4,1],[2,8,1],[3,8,-1]]) {
      const p={...shots(art).proj[0],t},body=pxProjectileBody(p),s=new PixelSurface(body.sprite.w,body.sprite.h);s.data.set(body.sprite.data);
      for(let j=0;j<s.data.length;j+=4)if(s.data[j+3]){s.data[j]=17;s.data[j+1]=22;s.data[j+2]=35;}
      silhouettes.blit(s,210+n*180-body.ox*2,96+row*112-body.oy*2,2,face<0);
    }
  });globalThis.silhouettes=silhouettes;
  const sceneSheet=new PixelSurface(1280,1080);sceneSheet.rect(0,0,1280,1080,PX_INK);
  for(const [i,art,ch,owner]of [[0,'flame',1,0],[1,'red',0,1],[2,'bloodwheel',5,0],[3,'paper',12,1],[4,'grape',4,0],[5,'gum',11,1]]) {
    const S=newMatch(owner?2:ch,owner?ch:2,173);S.phase='fight';S.stage=PX_STAGES[i%3].id;S.t=140;
    const f=S.f[owner],o=S.f[1-owner];f.x=owner?980:300;o.x=owner?240:1040;f.face=owner?-1:1;
    ART[art](S,f,o);for(let tick=0;tick<12;tick++){upProj(S);S.t++;}
    const frame=pxWorldSurface(S,{});frame.blit(pxHUDSurface(S,[null,null]),0,0);pxOutlinedText(frame,art.toUpperCase()+' / '+(owner?'FACING LEFT':'FACING RIGHT'),12,88,PX_LIGHT);
    sceneSheet.blit(frame,i%2*640,Math.floor(i/2)*360);
  }
  globalThis.scenes=sceneSheet;
}
preview();
`,ctx);
if(process.argv[2]&&!process.argv[2].startsWith('--'))for(const [suffix,key]of [['projectile-bodies','bodies'],['projectile-scenes','scenes'],['projectile-silhouettes','silhouettes']])writePNG(path.join(process.argv[2],(process.argv[3]||'v42')+'-'+suffix+'.png'),ctx[key]);
