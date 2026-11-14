const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
globalThis.roster=new PixelSurface(1440,960);roster.rect(0,0,1440,960,'#171f30');
globalThis.silhouettes=new PixelSurface(1440,960);silhouettes.rect(0,0,1440,960,'#d4ccb5');
pxText(roster,'RITUAL ARCHIVE: CLASH / FIFTEEN STANCES AND BUILDS',20,18,PX_LIGHT,2);
pxText(silhouettes,'SILHOUETTE REVIEW / NO COLOR OR SURFACE DETAIL',20,18,PX_INK,2);
const hashes=new Set(),heights=[],areas=[];
CH.forEach((c,n)=>{
  const source=pxSprite(n,'idle'),ink=pxSprite(n,'idle',false,PX_INK),x=(n%5)*288,y=Math.floor(n/5)*300+50;
  let hash='',minY=PX_H,maxY=0,count=0;
  for(let p=3;p<ink.data.length;p+=4){hash+=ink.data[p]?'1':'0';if(ink.data[p]){minY=Math.min(minY,Math.floor(p/4/PX_W));maxY=Math.max(maxY,Math.floor(p/4/PX_W));count++;}}
  assert(!hashes.has(hash),'duplicate black silhouette '+c.name);hashes.add(hash);heights.push(maxY-minY+1);areas.push(count);
  assert.notEqual(JSON.stringify(PX_IDLES[n]),JSON.stringify(PX_IDLES[(n+1)%15]));
  roster.rect(x+4,y+4,280,290,'#202c40');silhouettes.rect(x+4,y+4,280,290,'#e4dcc4');
  roster.blit(source,x,y+4,2);silhouettes.blit(ink,x,y+4,2);
  pxText(roster,c.name,x+15,y+264,PX_LIGHT,2);pxText(roster,c.tech,x+15,y+285,PX_KITS[n].accent);
  pxText(silhouettes,c.name,x+15,y+264,PX_INK,2);pxText(silhouettes,'HEIGHT '+heights[n]+' / AREA '+count,x+15,y+285,'#756c65');
});
assert(Math.max(...heights)-Math.min(...heights)>=20,'height variety');
assert(Math.max(...areas)/Math.min(...areas)>1.5,'weight variety');
console.log(JSON.stringify({status:'passed',uniqueSilhouettes:hashes.size,heightRange:[Math.min(...heights),Math.max(...heights)],areaRange:[Math.min(...areas),Math.max(...areas)]}));
`,ctx);
if(process.argv[2]) {writePNG(path.join(process.argv[2],'v7-roster-stances.png'),ctx.roster);writePNG(path.join(process.argv[2],'v7-black-silhouettes.png'),ctx.silhouettes);}
