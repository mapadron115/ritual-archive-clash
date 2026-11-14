// Tiny PNG writer for exact, dependency-free previews of the game's own integer raster assets.
const fs = require('node:fs');
const zlib = require('node:zlib');
function crc32(b) { let c=0xffffffff; for(const v of b) { c^=v; for(let n=0;n<8;n++) c=(c>>>1)^((c&1)?0xedb88320:0); } return (c^0xffffffff)>>>0; }
function chunk(type,data) { const name=Buffer.from(type), size=Buffer.alloc(4), crc=Buffer.alloc(4); size.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name,data]))); return Buffer.concat([size,name,data,crc]); }
module.exports = function writePNG(file,s) {
  const head=Buffer.alloc(13); head.writeUInt32BE(s.w,0);head.writeUInt32BE(s.h,4);head[8]=8;head[9]=6;
  const rows=Buffer.alloc((s.w*4+1)*s.h);
  for(let y=0;y<s.h;y++) Buffer.from(s.data.buffer,s.data.byteOffset+y*s.w*4,s.w*4).copy(rows,y*(s.w*4+1)+1);
  fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]));
};
