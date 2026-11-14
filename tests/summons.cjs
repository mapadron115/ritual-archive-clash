// Original summon animation, actual art timelines, snapshot stability and read-only drawing.
// Generated previews and scripted checks are not human play or live-browser validation.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
const prefix=process.argv[3]||'v18';
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let frames=0,timelines=0;
const empty=()=>new PixelSurface(240,200);
const same=(a,b,msg)=>assert.deepEqual(a.data,b.data,msg);
const draw=e=>{const s=empty();pxSummon(s,{x:240,y:240,face:1,...e});return s;};
const tones=(s,colors)=>{for(const color of colors){const rgb=pxRGB(color);let count=0;for(let i=0;i<s.data.length;i+=4)if(s.data[i+3]&&rgb.every((v,c)=>s.data[i+c]===v))count++;assert(count>=4,'missing broad shade '+color);}};
const layer=S=>{const s=new PixelSurface(640,360);for(const e of S.ents)pxSummon(s,e,S);for(const z of S.zones)if(z.k==='tongue')pxToad(s,z);return s;};
const validate=(s,floor)=>{
  let count=0;for(let y=0;y<s.h;y++)for(let x=0;x<s.w;x++) {
    const a=s.data[(y*s.w+x)*4+3];assert(a===0||a===255,'soft alpha');
    if(a){count++;assert(x>0&&x<s.w-1&&y>0&&y<s.h-1,'clipped summon');if(floor!==undefined)assert(y<=floor,'summon below floor');}
  }assert(count>100);frames++;
};
// Each authored cell is bounded. Both directions are exact mirrors around the simulation root.
for(const k of ['dog','nue'])for(const v of [0,1])for(const bite of [0,9,4])for(const vy of [-10,0,10]) {
  const unique=new Set();
  for(const t of [0,5,10,15]) {
    const e={k,v,bite,t,vx:12,vy},a=draw(e),b=draw({...e,face:-1});
    validate(a,k==='dog'?120:undefined);validate(b,k==='dog'?120:undefined);
    tones(a,k==='dog'?(v?['#393449','#625774','#9484a6']:['#827d98','#c9c5cf','#efdfd7']):['#77523e','#c18b50','#f0cd8c']);
    tones(a,[PX_INK]);
    for(let y=0;y<a.h;y++)for(let x=1;x<a.w;x++) {
      const i=(y*a.w+x)*4,j=(y*a.w+(240-x))*4;
      for(let c=0;c<4;c++)assert.equal(a.data[i+c],b.data[j+c],'directional cell mismatch');
    }
    unique.add(a.data.join(','));
  }
  if(!bite)assert.equal(unique.size,4,'missing four motion phases '+k);
}
const waiting={k:'dog',o:0,x:240,y:240,face:1,t:0},near={f:[{}, {x:275}]};
const waitA=empty(),waitB=empty();pxSummon(waitA,waiting,near);pxSummon(waitB,{...waiting,t:15},near);same(waitA,waitB,'waiting dog runs in place');
assert.notDeepEqual(draw({k:'dog',t:0,bite:9}).data,draw({k:'dog',t:0,bite:4}).data,'bite never releases');
const glideA=draw({k:'nue',t:0,done:1,vx:12,vy:8}),glideB=draw({k:'nue',t:15,done:1,vx:12,vy:8});same(glideA,glideB,'post-contact wings keep flapping');
for(const hitFoe of [false,true])for(const face of [-1,1]) {
  const shapes=new Set();
  for(let t=0;t<16;t++) {
    const z={k:'tongue',x:240,y:240,tx:240+face*180,face,t,dur:16,hitFoe},before=JSON.stringify(z),s=empty();
    pxToad(s,z);validate(s,120);tones(s,[PX_INK,'#4e477c','#8279a8','#bdb2d4']);assert.equal(JSON.stringify(z),before);shapes.add(s.data.join(','));
  }
  assert(shapes.size>8,'tongue animation lacks extension/recoil');
}
// Exercise actual art creation, movement, bite, wing bank, tongue lifetime, dispel and round cleanup.
let sawBite=false,sawWait=false,sawDive=false;
for(const art of ['dogs','nue','toad'])for(const owner of [0,1]) {
  const S=newMatch(3,3,441);S.phase='fight';const f=S.f[owner],foe=S.f[1-owner];f.x=owner?900:380;f.face=owner?-1:1;foe.x=owner?520:760;
  ART[art](S,f,foe);
  if(art==='dogs')assert.equal(S.ents.length,2);
  if(art==='nue')assert(S.ents[0].vy>0);
  if(art==='toad')assert(S.zones.some(z=>z.k==='tongue'));
  const control=JSON.parse(JSON.stringify(S));
  for(let t=0;t<120;t++) {
    if(t%6===0) {
      const before=JSON.stringify(S),a=pxWorldSurface(S,{}),b=pxWorldSurface(JSON.parse(before),{});
      assert.equal(JSON.stringify(S),before,'renderer writes simulation');same(a,b,'serialized snapshot changes animation');
    }
    for(const e of S.ents) {
      if(e.bite>0)sawBite=true;
      if(e.k==='dog'&&Math.abs(S.f[1-e.o].x-e.x)<=46&&!e.bite)sawWait=true;
      if(e.k==='nue'&&e.done)sawDive=true;
    }
    if(t===6) {
      S.hitstop=control.hitstop=3;const frozen=JSON.stringify([S.ents,S.zones]),held=layer(S);
      for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify([S.ents,S.zones]),frozen);same(layer(S),held,'freeze changes summon frame');}
    }
    if(t===12&&art==='dogs') {
      S.stop={o:1-owner,t:4};control.stop={o:1-owner,t:4};const entities=JSON.stringify(S.ents);
      for(let n=0;n<3;n++){step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify(S.ents),entities,'time-stopped summons animate');}
      S.stop=control.stop=null;
    }
    step(S,[0,0]);step(control,[0,0]);assert.equal(JSON.stringify(S),JSON.stringify(control),'drawing changes deterministic outcome');
  }
  if(art==='toad')assert.equal(S.zones.length,0);
  for(const e of S.ents)e.hp=0;upEnts(S);assert.equal(S.ents.length,0);
  newRound(S);assert.equal(S.ents.length,0);assert.equal(S.zones.length,0);timelines++;
}
assert(sawBite&&sawWait&&sawDive,'missing real summon phases');
assert(PX_SUMMONS.size<128,'unbounded animation cache');

globalThis.sheet=new PixelSurface(1280,1280);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);
pxText(sheet,'SUMMONS / NAVY CONTOURS, THREE TONES AND SEPARATE PAWS',18,16,PX_LIGHT,2);
const rows=[['LIGHT HOUND',[0,5,10,15].map(t=>({k:'dog',t}))],['DARK HOUND',[0,5,10,15].map(t=>({k:'dog',v:1,t,face:-1}))],['BITE / RELEASE / WAIT / BOUND',[{k:'dog',bite:9},{k:'dog',bite:4},{k:'dog',o:0},{k:'dog',t:15}]],['NUE / WING STROKES',[0,5,10,15].map(t=>({k:'nue',t,vx:12,vy:0}))],['NUE / DIVE AND BANK',[-10,0,10,10].map((vy,n)=>({k:'nue',t:5,vx:12,vy,face:n%2?-1:1,done:n===3}))]];
rows.forEach(([title,states],row)=>{
  pxText(sheet,title,18,48+row*210,'#b4c2ce');
  states.forEach((e,n)=>{
    const cell=new PixelSurface(160,96);cell.rect(0,0,160,96,'#28364a');
    const S=row===2&&n===2?{f:[{}, {x:180}]}:undefined;
    pxSummon(cell,{x:160,y:e.k==='nue'?96:164,face:1,t:0,...e},S);sheet.blit(cell,n*320,62+row*210,2);
  });
});
pxText(sheet,'TOAD / CROUCH, EXTEND, RECOIL AND RECOVER',18,1110,'#b4c2ce');
[0,5,11,15].forEach((t,n)=>{
  const cell=new PixelSurface(160,65);cell.rect(0,0,160,65,'#28364a');
  pxToad(cell,{x:80,y:110,tx:280,t,dur:16,face:1,hitFoe:false});sheet.blit(cell,n*320,1130,2);
});
const demo=newMatch(3,3,431);demo.phase='fight';demo.stage='gallery';demo.t=60;demo.f[0].x=260;demo.f[1].x=1000;
demo.ents=[{k:'dog',o:0,x:430,y:GROUND,face:1,t:15},{k:'dog',o:0,x:590,y:GROUND,face:1,t:5,v:1},{k:'nue',o:0,x:740,y:380,face:1,t:5,vx:11,vy:6}];
globalThis.scene=pxWorldSurface(demo,{});
console.log('PASS',frames,'bounded hard-alpha summon frames; exact directional cells; four-phase bounds/wings, bite/release/wait, dive/bank and toad extension/recoil;',timelines,'actual art/owner timelines; freeze/time-stop, JSON stability, cleanup and read-only deterministic rendering');
`,ctx);
if(process.argv[2])for(const [name,key]of [['summon-phases.png','sheet'],['summon-scene.png','scene']])writePNG(path.join(process.argv[2],prefix+'-'+name),ctx[key]);
