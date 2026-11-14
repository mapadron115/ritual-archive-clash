// Presentation-only event lifecycle, real contact direction and exact pixel previews.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
FX.silent=true;
let frames=0;
for(const kind of ['hit','block','break'])for(const dir of [-1,1]) {
  const S=newMatch(0,14,731);S.phase='fight';const f=S.f[dir===1?1:0],by=1-f.i;
  if(kind!=='hit'){f.st='guard';f.guardHp=kind==='break'?1:100;}
  hit(S,by,f,f.x-dir*90,{dmg:40,kb:4});
  const e=S.ev.find(e=>e.k===kind);assert(e,'real '+kind+' event missing');
  const before=JSON.stringify(S);FX.contacts=[];fxEvent(S,e);
  assert.equal(FX.contacts[0].dir,dir);assert.equal(JSON.stringify(S),before);
  const hashes=new Set();
  for(let t=0;t<FX.contacts[0].life;t++) {
    const a=new PixelSurface(160,160),b=new PixelSurface(160,160);
    const c={...FX.contacts[0],x:160,y:160,t,dir:1};pxContact(a,c);pxContact(b,{...c,dir:-1});
    let occupied=0;
    for(let y=0;y<160;y++)for(let x=1;x<160;x++) {
      const i=(y*160+x)*4,j=(y*160+160-x)*4;
      assert(a.data[i+3]===0||a.data[i+3]===255,'soft alpha');
      if(a.data[i+3]){occupied++;assert(x>5&&x<155&&y>5&&y<155,'clipped contact');}
      for(let k=0;k<4;k++)assert.equal(a.data[i+k],b.data[j+k],'asymmetric direction');
    }
    assert(occupied>0);hashes.add(a.data.join(','));frames++;
  }
  assert(hashes.size>5,'missing evolving phases');
  const life=FX.contacts[0].life;for(let t=0;t<life;t++)fxTick();assert.equal(FX.contacts.length,0);
}
const S=newMatch(0,14,731);S.phase='fight';
for(let n=0;n<100;n++)contact(S,{x:600,y:540,b:1,a:32},'hit');assert.equal(FX.contacts.length,48);
FX.contacts=[];
globalThis.sheet=new PixelSurface(1280,768);sheet.rect(0,0,sheet.w,sheet.h,PX_INK);
pxText(sheet,'V12 / CONTACT, EXPANSION AND FRAGMENTS',16,14,PX_LIGHT,2);
const times=[0,2,4,7,10];
['hit','block','break'].forEach((kind,row)=>times.forEach((t,col)=>{
  const cell=new PixelSurface(128,112);cell.rect(0,0,128,112,'#28364a');
  pxContact(cell,{x:128,y:100,dir:row===1?-1:1,kind,t,heavy:kind==='break',life:18});
  sheet.blit(cell,col*256,40+row*240,2);pxText(sheet,kind.toUpperCase()+' / T'+t,col*256+12,248+row*240,PX_LIGHT);
}));
S.stage='gallery';S.f[0].x=560;S.f[1].x=710;S.f[0].st='atk';S.f[0].move='k';S.f[0].mt=11;S.f[1].st='hit';
S.t=130;S.f[1].hurtT=120;
globalThis.gameplay=pxWorldSurface(S,{contacts:[{x:710,y:542,dir:1,kind:'hit',t:3,life:14,heavy:true}]});
console.log('PASS',frames,'hard-alpha contact frames; exact mirrored directions; actual hit/block/break events; phases, bounds, expiry, cap and read-only state');
`,ctx);
if(process.argv[2])for(const [name,key]of [['v12-contact-phases.png','sheet'],['v12-contact-gameplay.png','gameplay']])writePNG(path.join(process.argv[2],name),ctx[key]);
