const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
const ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let frames=0;
for(const ch of PX_ENABLED) for(const pose of Object.keys(PX_POSES)) for(const alt of [false,true]) {
  const s=pxSprite(ch,pose,alt), colors=new Set();let count=0;
  for(let i=0;i<s.data.length;i+=4) {
    assert(s.data[i+3]===0 || s.data[i+3]===255,'soft alpha');
    if(s.data[i+3]) {count++;colors.add(s.data.slice(i,i+3).join(','));
      const x=(i/4)%s.w,y=Math.floor(i/4/s.w);assert(x>0 && x<s.w-1 && y>0 && y<s.h-1,'clipped '+ch+' '+pose);}
  }
  assert(count>800);assert(colors.size<=24);frames++;
}
console.log('PASS',frames,'opaque, bounded, limited-palette fighter frames');
globalThis.sheet=new PixelSurface(1024,780);sheet.rect(0,0,1024,780,'#171f30');
pxText(sheet,'RITUAL ARCHIVE: CLASH',28,20,'#f3e3ba',3);
pxText(sheet,'ISOLDE VARN / PIXEL STYLE STUDY',28,54,'#75d9e8',2);
pxText(sheet,'ORIGINAL INTEGER RASTER - 2X SOURCE PIXELS',28,78,'#9aa8be',1);
const poses=['idle','guard','wind','punch','punch2','hook','kick','jump','jpunch','cast1','hit','walk0'];
poses.forEach((pose,n)=>{
  const x=(n%4)*248+16,y=Math.floor(n/4)*220+106;
  sheet.rect(x,y,240,210,'#202c40');sheet.rect(x,y+193,240,1,'#43516b');
  sheet.blit(pxSprite(0,pose),x+8,y-5,2);
  pxText(sheet,pose,x+12,y+199,'#b5c6d3',1);
});
globalThis.mirror=new PixelSurface(768,300);mirror.rect(0,0,768,300,'#202c40');
pxText(mirror,'ISOLDE / TWO DISTINCT COSTUMES',24,18,'#f3e3ba',2);
for(let i=0;i<2;i++) {mirror.blit(pxSprite(0,'idle',!!i),70+i*380,58,2,!!i);pxText(mirror,i?'P2 / PEARL + ROSE':'P1 / NAVY + CYAN',42+i*380,275,'#b5c6d3',2);}
globalThis.roster=new PixelSurface(1280,960);roster.rect(0,0,1280,960,'#171f30');
pxText(roster,'RITUAL ARCHIVE: CLASH / FIFTEEN ORIGINAL FIGHTERS',20,18,'#f3e3ba',2);
CH.forEach((c,n)=>{
  const x=(n%5)*256,y=Math.floor(n/5)*300+50;
  roster.rect(x+8,y+8,240,290,'#202c40');roster.rect(x+8,y+248,240,1,'#43516b');
  roster.blit(pxSprite(n,'idle'),x+4,y+37,2);
  pxText(roster,c.name,x+16,y+263,'#f3e3ba',2);
  pxText(roster,c.tech,x+16,y+283,PX_KITS[n].accent,1);
});
`,ctx);
const folder=process.argv[2];
if(folder) {
  if(process.argv.includes('--roster')) writePNG(path.join(folder,'v3-roster.png'),ctx.roster);
  else {writePNG(path.join(folder,'v2-isolde-poses.png'),ctx.sheet);writePNG(path.join(folder,'v2-isolde-mirror.png'),ctx.mirror);}
  console.log('Preview PNGs written to',folder);
}
