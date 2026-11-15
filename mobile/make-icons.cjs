// Original CLASH wordmark, using the game's own bitmap font and palette.
// Run: node mobile/make-icons.cjs. No downloads or image dependencies.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const writePNG=require('../tests/png.cjs');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/pixel.js'),'utf8'),context);
const {PixelSurface,pxText,pxTextWidth}=vm.runInContext('({PixelSurface,pxText,pxTextWidth})',context);
function mark(maskable=false) {
  const n=maskable?96:64,s=new PixelSurface(n,n),x=Math.floor((n-pxTextWidth('CLASH',2))/2),y=n/2-7;
  s.rect(0,0,n,n,'#070f1c');
  // Stepped plate and rails, with no rounded/filter-generated edges.
  const left=maskable?18:2,right=n-left;
  s.rect(left+4,y-13,right-left-8,42,'#536577');
  s.rect(left,y-9,right-left,34,'#536577');
  s.rect(left+2,y-7,right-left-4,30,'#263346');
  s.rect(left+6,y-11,right-left-12,38,'#263346');
  s.rect(left+8,y-9,right-left-16,2,'#a7c8da');
  s.rect(left+8,y+22,right-left-16,2,'#d5a567');
  pxText(s,'CLASH',x+1,y+2,'#070f1c',2);
  pxText(s,'CLASH',x,y,'#f1e5cd',2);
  return s;
}
function scale(src,n) {const out=new PixelSurface(n,n);out.blit(src,0,0,n/src.w);return out;}
function icons() {
  const normal=mark();return new Map([32,180,192,512].map(n=>['clash-'+n+'.png',scale(normal,n)]).concat([['clash-maskable-512.png',scale(mark(true),512)]]));
}
if(require.main===module) {
  const dir=path.join(__dirname,'icons');fs.mkdirSync(dir,{recursive:true});
  for(const [name,s] of icons())writePNG(path.join(dir,name),s);
  console.log('Wrote five original CLASH pixel icons.');
}
module.exports={icons,mark,scale};
