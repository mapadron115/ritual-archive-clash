// Deployment/asset audit, not a browser installation or native layout test.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),zlib=require('node:zlib'),vm=require('node:vm');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'mobile/index.html'),'utf8');
const {icons,mark,scale}=require('../mobile/make-icons.cjs'),writePNG=require('./png.cjs');
const links=[...html.matchAll(/<link\b([^>]+)>/g)].map(m=>Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]])));
const manifestLink=links.find(l=>l.rel==='manifest');assert(manifestLink);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'mobile',manifestLink.href.split('?')[0]),'utf8'));
assert.equal(manifest.display,'standalone');assert.equal(manifest.orientation,'landscape');assert.equal(manifest.prefer_related_applications,false);
assert.equal(manifest.name,'Ritual Archive: Clash Mobile');assert.equal(manifest.short_name,'Clash Mobile');
assert(html.includes('name="apple-mobile-web-app-capable" content="yes"'));assert(html.includes('name="mobile-web-app-capable" content="yes"'));
assert.equal(manifest.theme_color,'#070f1c');assert.equal(manifest.background_color,manifest.theme_color);
// Relative launch, identity and scope must work on GitHub project hosting
// and a local root. Installing must never send a player to the desktop game.
for(const base of ['https://example.test/ritual-archive-clash/mobile/','http://localhost:8000/mobile/']) {
  const url=new URL(manifestLink.href,base),scope=new URL(manifest.scope,url);
  assert.equal(scope.href,base);assert.equal(new URL(manifest.start_url,url).href,base);assert.equal(new URL(manifest.id,url).href,base);
  for(const icon of manifest.icons)assert(new URL(icon.src,url).pathname.startsWith(new URL(base).pathname+'icons/'));
}
const version=manifestLink.href.split('?v=')[1];assert(version);
for(const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"?]+)\?v=([^"]+)"/g)) {
  assert.equal(m[2],version);assert(fs.existsSync(path.resolve(root,'mobile',m[1])),m[1]+' missing');
}
const wanted=icons();
function decode(file) {
  const b=fs.readFileSync(file);assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const w=b.readUInt32BE(16),h=b.readUInt32BE(20);assert.equal(b[24],8);assert.equal(b[25],6);
  const chunks=[];for(let p=8;p<b.length;){const len=b.readUInt32BE(p);if(b.toString('ascii',p+4,p+8)==='IDAT')chunks.push(b.subarray(p+8,p+8+len));p+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(chunks)),data=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++){assert.equal(raw[y*(w*4+1)],0);raw.copy(data,y*w*4,y*(w*4+1)+1,(y+1)*(w*4+1));}return {w,h,data};
}
for(const [name,expected] of wanted) {
  const actual=decode(path.join(root,'mobile/icons',name));assert.equal(actual.w,expected.w);assert.equal(actual.h,expected.h);
  assert.deepEqual(actual.data,Buffer.from(expected.data));
  for(let i=3;i<actual.data.length;i+=4)assert.equal(actual.data[i],255);
}
for(const icon of manifest.icons) {
  assert.equal(icon.type,'image/png');assert.equal(icon.src.split('?v=')[1],version);
  const actual=decode(path.join(root,'mobile',icon.src.split('?')[0]));assert.equal(icon.sizes,actual.w+'x'+actual.h);
}
for(const size of [192,512])assert(manifest.icons.some(i=>i.sizes===size+'x'+size&&i.purpose==='any'));
assert(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose==='maskable'));
const apple=links.find(l=>l.rel==='apple-touch-icon'),favicon=links.find(l=>l.rel==='icon');
assert.equal(decode(path.join(root,'mobile',apple.href.split('?')[0])).w,180);assert.equal(favicon.sizes,'32x32');
// Android's guaranteed safe circle must retain every part of the mark/plate.
const masked=wanted.get('clash-maskable-512.png');
for(let y=0;y<masked.h;y++)for(let x=0;x<masked.w;x++) {
  const p=(y*masked.w+x)*4;if(masked.data[p]===7&&masked.data[p+1]===15&&masked.data[p+2]===28)continue;
  assert(Math.hypot(x+.5-masked.w/2,y+.5-masked.h/2)<=masked.w*.4,'mask clips the mark');
}
assert(/<details id="installHelp">\s*<summary>Add to home screen<\/summary>/.test(html));
for(const instruction of ['Safari','Share','Add to Home Screen','Open as Web App','Android','Install app','Internet is required'])assert(html.includes(instruction));
const desktop=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(!desktop.includes('rel="manifest"'));assert(!desktop.includes('installHelp'));
console.log('PASS mobile install assets: nested-host mobile launch/id/scope, standalone/landscape, versioned local resources, exact reproducible PNGs, 32/180/192/512 sizes, opaque pixels and mask-safe artwork, native installation guide; desktop has no manifest');

// Optional exact icon and illustrative title models for coordinator review.
// These are generated rasters, not screenshots or CSS measurements.
const output=process.argv.slice(2).find(a=>a.startsWith('--out='))?.slice(6);
if(output) {
  const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(root,'src/pixel.js'),'utf8'),context);
  const {PixelSurface,pxText,pxTextWidth}=vm.runInContext('({PixelSurface,pxText,pxTextWidth})',context);
  function text(s,t,x,y,max,col='#f1e5cd') {
    let line='',top=y;for(const word of t.toUpperCase().split(' ')){if(line&&pxTextWidth(line+' '+word)>max){pxText(s,line,x,top,col);top+=11;line=word;}else line+=(line?' ':'')+word;}
    if(line){pxText(s,line,x,top,col);top+=11;}return top;
  }
  const sheet=new PixelSurface(630,300);sheet.rect(0,0,630,300,'#101927');
  sheet.blit(wanted.get('clash-192.png'),12,20);sheet.blit(scale(mark(),48),220,20);sheet.blit(scale(mark(),32),280,20);
  const circle=scale(mark(true),192);for(let y=0;y<192;y++)for(let x=0;x<192;x++)if(Math.hypot(x+.5-96,y+.5-96)>96)circle.data[(y*192+x)*4+3]=0;
  sheet.blit(circle,410,20);text(sheet,'192 / actual icon',12,230,192);text(sheet,'48 / 32',220,90,160);text(sheet,'round mask model',410,230,200);
  writePNG(path.join(output,'v110-icons.png'),sheet);
  const help=[...html.matchAll(/<details id="installHelp">([\s\S]*?)<\/details>/g)][0][1];
  const paragraphs=[...help.matchAll(/<p>([^<]+)<\/p>/g)].map(m=>m[1]);
  const titleSource=fs.readFileSync(path.join(root,'src/main.js'),'utf8').match(/function titleMark\(\) \{[\s\S]+?\n\}/)[0];
  vm.runInContext(titleSource,context);const title=vm.runInContext('titleMark()',context);
  for(const [w,h] of [[667,375],[844,390],[390,844]]) {
    for(const state of h>w?['after']:['before','after','guide']) {
      const before=state==='before';
      const s=new PixelSurface(w,h);s.rect(0,0,w,h,'#101927');
      if(h>w){text(s,'Turn your phone sideways',32,h/2,w-64);}
      else if(state==='guide') {
        const x=20,max=w-40;let y=16;
        // Expanded guide view shows the new content, with the existing title
        // collapsed here for clarity. It does not claim to model scroll height.
        y=text(s,'Ritual Archive: Clash / Mobile',x,y,max);y+=14;
        s.rect(x,y,max,48,'#263346');text(s,'- Add to home screen',x+10,y+20,max-20);y+=62;for(const p of paragraphs)y=text(s,p,x,y,max,'#c1cbd7')+16;
      } else {
        // Illustrative title composition; browser fonts/auto margins differ.
        const top=before?54:30;s.blit(title,(w-title.w)/2,top);
        const centered=(t,y)=>text(s,t,(w-pxTextWidth(t.toUpperCase()))/2,y,w-40,'#c1cbd7');
        centered('Mobile / touch to fight',top+90);
        const bw=150,gap=8,start=(w-3*bw-2*gap)/2;
        for(const [i,t] of ['Fight the CPU','Online friend','Watch CPU'].entries()) {const x=start+i*(bw+gap);s.rect(x,top+115,bw,48,'#263346');text(s,t,x+(bw-pxTextWidth(t.toUpperCase()))/2,top+135,bw);}
        centered('Isolde Varn vs Karasu Dain',top+178);centered('Archive Courtyard',top+199);
        if(!before) {const bw=Math.min(560,w-40),x=(w-bw)/2;s.rect(x,top+223,bw,48,'#263346');text(s,'+ Add to home screen',x+10,top+243,bw-20);}
      }
      text(s,(before?'V109':'V110')+' / generated '+(state==='guide'?'guide':'title')+' model, not browser layout',12,h-16,w-24,'#68768a');
      writePNG(path.join(output,'v110-'+state+'-install-'+w+'x'+h+'.png'),s);
    }
  }
}
