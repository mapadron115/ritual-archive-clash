// Direction checks against actual world painting, independent of the preview sheet's flip flag.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),writePNG=require('./png.cjs'),ctx=vm.createContext({console,assert});
vm.runInContext(['sim','fighters','fighters2','pixel','pixel-stage','pixel-domain','pixel-world','render'].map(n=>fs.readFileSync(path.join(root,'src',n+'.js'),'utf8')).join('\n'),ctx);
vm.runInContext(`
let directions=0;
function painted(ch,alt,face,move,mt) {
  const S=newMatch(ch,ch,931);S.phase='fight';S.t=120;
  const f=S.f[alt?1:0];f.x=320;f.y=410;f.face=face;f.st='atk';f.move=move;f.mt=mt;
  const view=new PixelSurface(320,250),before=JSON.stringify(S);pxPaintFighter(view,S,f,null);
  assert.equal(JSON.stringify(S),before);return view;
}
for(let ch=0;ch<15;ch++)for(const alt of [false,true])for(const face of [-1,1])for(const move of ['jp','jk']) {
  const m=BASIC[move],pose=move==='jp'?'jpunch':'jkick',view=painted(ch,alt,face,move,m.su);
  const sprite=pxSprite(ch,pose,alt),height=PX_KITS[ch].height;
  // Check the complete actual painter against the expected facing around the simulation root.
  // In particular, a negative facing must reflect around root x=160, not the cell center.
  for(let y=0;y<sprite.h;y++)for(let x=0;x<sprite.w;x++) {
    const src=(y*sprite.w+x)*4,wx=160+face*(x-64),wy=205+y-120,dst=(wy*view.w+wx)*4;
    assert.deepEqual(view.data.slice(dst,dst+4),sprite.data.slice(src,src+4),'world flip/origin '+ch+' '+alt+' '+face+' '+move);
  }
  // The active fist must show skin/gauntlet well in front of the face; the active boot must
  // show trouser/boot pixels well in front of the hip. Check raster pixels, not joint values.
  const kit=PX_KITS[ch],top=alt?['#655e7c','#b2a8bf','#e8dfde']:kit.top;
  const colors=move==='jp'?[...kit.skin,...(kit.gauntlet?top:[])]:alt?['#3a3658','#655e7e','#9a91ab']:kit.pants;
  const rgb=new Set(colors.map(c=>pxRGB(c).slice(0,3).join(',')));
  const [upper,bottom]=move==='jp'?[-66,-56]:[-49,-38];let front=0,rear=0;
  for(let dy=Math.floor(upper*height);dy<=Math.ceil(bottom*height);dy++)for(let dx=44;dx<=62;dx++) {
    for(const dir of [1,-1]) {
      const p=((205+dy)*view.w+160+face*dx*dir)*4;
      if(view.data[p+3]&&rgb.has(view.data.slice(p,p+3).join(','))) {if(dir===1)front++;else rear++;}
    }
  }
  assert(front>=8,'missing forward contact '+ch+' '+alt+' '+face+' '+move);
  assert(front>rear+7,'contact reads behind facing '+ch+' '+alt+' '+face+' '+move);directions++;
}
globalThis.sheet=new PixelSurface(1280,1090);sheet.rect(0,0,sheet.w,sheet.h,'#171f30');
pxText(sheet,'V29 / GRETA AIR CONTACTS FOLLOW HER FACE',18,14,PX_LIGHT,2);
pxText(sheet,'BOTH COSTUMES / BOTH DIRECTIONS / ACTUAL WORLD PAINTER',18,35,'#b4c2ce');
for(let row=0;row<4;row++) {
  const alt=row>=2,face=row%2?-1:1;
  [['jp',0],['jp',4],['jk',0],['jk',7]].forEach(([move,mt],n)=>{
    const x=n*320,y=55+row*258,view=painted(14,alt,face,move,mt);
    sheet.rect(x+3,y,314,252,'#28364a');sheet.blit(view,x,y);
    pxText(sheet,(alt?'MIRROR':'MAIN')+' / FACING '+(face>0?'RIGHT >':'< LEFT'),x+12,y+225,PX_LIGHT);
    pxText(sheet,(move==='jp'?'PUNCH':'KICK')+' / '+(mt?'CONTACT':'WIND-UP'),x+12,y+239,'#b4c2ce');
  });
}
console.log('PASS',directions,'air contacts across fifteen builds, both costumes and both facings; complete actual world-painter flip/origin and forward fist/boot raster checks; read-only painting');
`,ctx);
if(process.argv[2])writePNG(path.join(process.argv[2],'v29-air-facing.png'),ctx.sheet);
