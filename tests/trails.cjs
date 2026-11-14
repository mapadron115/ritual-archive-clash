// Velocity-aligned, age/lifetime phased projectile wakes. No simulation history or new state.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
const kinds=['cut','knife','nail','wave','stone','shell','pellet','red','flame','orb','gum'];let frames=0;
const count=s=>{let n=0;for(let i=3;i<s.data.length;i+=4)if(s.data[i])n++;return n;};
for(const k of kinds)for(const [vx,vy]of [[18,0],[-18,0],[8,-15],[-8,15],[0,15]]) {
  let early,full,late;
  for(const [t,life]of [[0,30],[1,30],[6,30],[12,30],[12,2],[12,0]]) {
    const p={k,x:160,y:160,vx,vy,r:16,t,life},before=JSON.stringify(p),s=new PixelSurface(160,160);pxProjectileTrail(s,p);
    assert.equal(JSON.stringify(p),before);const occupied=count(s);let extent=0;
    if(t===0||life===0)assert.equal(occupied,0,'trail before birth or after expiry');else assert(occupied>0);
    for(let y=0;y<160;y++)for(let x=0;x<160;x++) {
      const a=s.data[(y*160+x)*4+3];assert(a===0||a===255,'soft alpha');
      if(a){assert(x>10&&x<150&&y>10&&y<150,'clipped wake');
        extent=Math.max(extent,(x-80)**2+(y-80)**2);
        const projection=(x-80)*vx+(y-80)*vy;assert(projection<120,'wake leads the projectile');}
    }
    if(t===1)early=extent;if(t===6)full=extent;if(life===2)late=extent;frames++;
  }
  assert(full>early,k+' wake does not grow from birth');assert(full>late,k+' wake does not taper at expiry');
}
const still=new PixelSurface(160,160);pxProjectileTrail(still,{k:'stone',x:160,y:160,vx:0,vy:0,t:12,life:30});assert.equal(count(still),0);
// Every real projectile art, including two owners/directions and serialization between renders.
let timelines=0;
for(const art of ['red','dismantle','flame','stone','grape','guided','bloodwheel','nail','knives','gum','paper','thunderclap','quake'])for(const owner of [0,1]) {
  assert(ART[art],art+' is missing');
  const S=newMatch(0,1,1234);S.phase='fight';const f=S.f[owner];f.x=owner?1040:240;f.face=owner?-1:1;
  ART[art](S,f,S.f[1-owner]);assert(S.proj.length,art+' has no projectiles');
  for(let n=0;n<8;n++)upProj(S);
  const before=JSON.stringify(S),a=pxWorldSurface(S,{}),b=pxWorldSurface(JSON.parse(before),{});
  assert.equal(JSON.stringify(S),before,'render writes simulation');assert.deepEqual(a.data,b.data,'transport changes visual');
  S.hitstop=3;const shots=JSON.stringify(S.proj);step(S,[0,0]);assert.equal(JSON.stringify(S.proj),shots);
  assert.deepEqual(pxWorldSurface(S,{}).data,a.data,'frozen projectile changes frame');timelines++;
}
// Ground pebble uses the same projectile drawing without a wake.
const pebble=new PixelSurface(200,160);pxZone(pebble,{},{k:'pebble',x:160,y:160,t:20});assert(count(pebble)>0);
function sheetFor(list,title) {
  const sheet=new PixelSurface(1280,list.length*144+50);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);pxText(sheet,title,16,14,PX_LIGHT,2);
  list.forEach((k,row)=>[[1,30],[6,30],[12,30],[12,2]].forEach(([t,life],n)=>{
    const cell=new PixelSurface(160,60);cell.rect(0,0,160,60,'#28364a');
    pxProjectile(cell,{k,x:200,y:60,vx:row%2?-18:18,vy:row%2?4:-4,r:k==='wave'?28:16,t,life,spin:k==='orb'});
    sheet.blit(cell,n*320,40+row*144,2);pxText(sheet,k.toUpperCase()+' / T'+t+' LIFE '+life,n*320+12,166+row*144,PX_LIGHT);
  }));return sheet;
}
globalThis.energy=sheetFor(['cut','wave','red','flame','orb'],'V15 / ENERGY WAKES: BIRTH, FLIGHT, PHASE, EXPIRY');
globalThis.physical=sheetFor(['knife','nail','stone','shell','pellet','gum'],'V15 / BLADES, CHIPS, EXHAUST AND BEADS');
const S=newMatch(10,11,555);S.phase='fight';S.stage='gallery';S.t=160;S.f[0].x=300;S.f[1].x=1000;
S.proj=[{k:'shell',x:610,y:440,vx:12,vy:-4,r:16,t:20,life:80},{k:'gum',x:790,y:530,vx:-21,vy:0,r:12,t:10,life:30},{k:'flame',x:450,y:320,vx:13,vy:0,r:22,t:14,life:90}];
globalThis.gameplay=pxWorldSurface(S,{});
console.log('PASS',frames,'bounded hard-alpha directional trail frames;',timelines,'real art/owner timelines; growth/taper, stationary/expired absence, frozen and serialized stability, non-mutation');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v15-energy-trails.png','energy'],['v15-physical-trails.png','physical'],['v15-trail-scene.png','gameplay']])writePNG(path.join(process.argv[2],name),ctx[key]);
