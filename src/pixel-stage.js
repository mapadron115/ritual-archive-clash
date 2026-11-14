'use strict';
// Original Archive Courtyard. These are native pixel layers, shared by the game and review previews.
let PX_STAGE = null;
function pxStage() {
  if(PX_STAGE) return PX_STAGE;
  const sky=new PixelSurface(640,360),cloud=new PixelSurface(160,65),far=new PixelSurface(700,360),town=new PixelSurface(700,360),arena=new PixelSurface(700,360),fore=new PixelSurface(800,360),vig=new PixelSurface(640,360);
  const bands=['#171d36','#232846','#353251','#49405f','#624a6c','#825975','#a36b7b','#be837f','#d99e87','#e5b58f','#edc79a','#edc79a'];
  bands.forEach((col,n)=>sky.rect(0,n*30,640,30,col));
  sky.ellipse(482,117,35,35,'#deb794');sky.ellipse(482,117,31,31,'#f6ddb0');
  for(const [y,x,w] of [[97,420,95],[112,471,90],[138,445,100]]) {sky.rect(x,y,w,3,bands[Math.floor(y/30)]);}
  for(let n=0;n<36;n++) {const x=(n*139+27)%640,y=(n*47+11)%110;sky.dot(x,y,n%3?'#a49aa9':'#d2c5bc');if(n%7===0){sky.dot(x+1,y,'#a49aa9');sky.dot(x,y+1,'#a49aa9');}}
  cloud.poly([[2,36],[14,36],[14,30],[30,30],[30,21],[48,21],[48,16],[69,16],[69,22],[91,22],[91,29],[115,29],[115,35],[140,35],[140,41],[154,41],[154,47],[2,47]],'#b5848e');
  cloud.rect(27,31,62,4,'#d4a098');cloud.rect(46,23,23,4,'#d4a098');cloud.rect(6,45,143,3,'#936c83');
  far.poly([[0,225],[0,203],[25,195],[52,199],[78,174],[99,182],[130,153],[157,176],[180,172],[222,202],[249,191],[285,200],[309,179],[340,196],[365,192],[402,157],[425,168],[451,153],[474,177],[501,173],[537,201],[567,187],[596,194],[633,169],[664,182],[700,170],[700,360],[0,360]],'#766786');
  far.poly([[0,228],[42,211],[85,218],[117,197],[149,213],[190,207],[227,233],[274,218],[309,226],[351,207],[397,222],[439,206],[471,221],[520,213],[561,229],[610,207],[660,218],[700,201],[700,360],[0,360]],'#695d79');
  // Distant wings of the archive: quiet silhouettes, warm windows and angular copper roofs.
  function arch(s,x,y,w,h,frame,glass) {
    s.rect(x,y+Math.floor(w/2),w,h-Math.floor(w/2),frame);s.ellipse(x+w/2,y+w/2,w/2,w/2,frame);
    s.rect(x+2,y+w/2,w-4,h-w/2-2,glass);s.ellipse(x+w/2,y+w/2,(w-4)/2,(w-4)/2,glass);
    s.rect(x+w/2,y+2,1,h-4,frame);s.rect(x+1,y+h/2,w-2,1,frame);
  }
  for(let n=0;n<9;n++) {
    const x=n*88-20,y=225-(n%3)*12;
    town.rect(x,y,83,65,'#615065');town.rect(x,y,4,65,'#463f57');
    town.poly([[x-6,y],[x+12,y-15],[x+58,y-15],[x+89,y],[x+89,y+4],[x-6,y+4]],'#4c435c');
    town.line([x+12,y-15],[x+58,y-15],'#ac7f78');
    arch(town,x+16,y+15,12,24,'#403b53','#cda18c');arch(town,x+52,y+15,12,24,'#403b53','#a0807e');
  }
  // Broad central library and two unequal side towers keep the silhouette original and asymmetrical.
  town.rect(173,159,355,124,'#8e7774');town.rect(173,159,355,9,'#b09581');
  town.poly([[159,159],[184,136],[495,136],[541,159],[541,166],[159,166]],'#354c59','#263447');
  for(let x=188;x<496;x+=15) town.line([x,138],[x-12,158],'#537278');
  town.line([184,136],[495,136],'#98a18c',2);town.rect(158,164,384,3,'#bdac8b');
  for(let row=0;row<12;row++) {
    const y=172+row*9;town.line([178,y],[522,y],'#7d696d');
    for(let x=179+(row%2)*17;x<521;x+=34) town.line([x,y],[x,y+8],'#7d696d');
  }
  for(const x of [191,247,433,489]) {
    town.rect(x-3,171,17,110,'#695b64');town.rect(x,171,8,110,'#a28a7b');town.rect(x,171,2,110,'#bba38b');
    town.rect(x-5,170,21,5,'#bba38b');town.rect(x-5,276,21,7,'#544f61');
  }
  arch(town,278,184,145,100,'#514858','#31384b');
  arch(town,287,193,127,91,'#84777a','#2b3447');
  // A recessed book gate and the archive's four-leaf compass seal, not a borrowed insignia.
  town.rect(303,218,95,66,'#334456');
  for(let x=307;x<398;x+=8) {town.rect(x,222,2,60,'#4b5b67');town.rect(x+3,222,1,60,'#263647');}
  town.rect(348,218,3,66,'#8f8a7b');town.rect(342,253,3,8,'#d3b181');town.rect(356,253,3,8,'#d3b181');
  for(const x of [212,456]) {arch(town,x,183,23,43,'#4a485a','#c4a589');town.rect(x+4,203,15,2,'#edcb9e');}
  town.poly([[350,146],[366,164],[350,182],[334,164]],'#b8a88b','#263447');
  town.poly([[350,151],[360,164],[350,177],[340,164]],'#405766');
  town.line([350,154],[350,174],'#e0c49b');town.line([343,164],[357,164],'#e0c49b');
  function tower(x,y,w,h) {
    town.rect(x,y,w,h,'#776672');town.rect(x,y,6,h,'#504b61');town.rect(x+w-4,y,4,h,'#a0887e');
    town.rect(x-3,y-7,w+6,8,'#334859');town.rect(x-3,y-7,w+6,2,'#83918a');
    for(let j=0;j<3;j++) {town.rect(x+j*(w-8)/2,y-15,8,10,'#5f5b6c');town.rect(x+j*(w-8)/2,y-15,8,2,'#a0887e');}
    arch(town,x+w/2-8,y+12,16,33,'#403e55','#c4a589');
    town.rect(x+7,y+55,w-14,3,'#9a817b');
  }
  tower(83,153,56,131);tower(553,177,68,107);
  // Front rail and broad flagstones. The fighting plane remains at exactly GROUND/2.
  arena.rect(0,281,700,6,'#323347');arena.rect(0,282,700,2,'#c6b295');
  for(let x=9;x<700;x+=49) {arena.rect(x,267,8,16,'#4e4b58');arena.rect(x+1,268,3,15,'#9d8579');arena.rect(x-2,265,12,4,'#b6a18a');}
  arena.rect(0,287,700,48,'#b69f82');arena.rect(0,287,700,4,'#ccb89a');
  for(const y of [298,314,334]) arena.rect(0,y,700,1,'#877c74');
  for(let n=-7;n<10;n++) {arena.line([350+n*52,291],[350+n*73,335],'#8d8075');arena.line([351+n*52,291],[351+n*73,335],'#c2ae8f');}
  // Sparse chips and grass at the back edge keep the ground from competing with feet.
  for(let n=0;n<30;n++) {const x=(n*127+25)%700,y=291+(n*17)%38;arena.rect(x,y,2+n%3,1,n%2?'#cbb699':'#9a8c7b');}
  arena.ellipse(350,309,112,12,'#a7957d');arena.ellipse(350,308,110,10,'#b9a485');
  arena.line([301,308],[350,301],'#8f7e70');arena.line([350,301],[399,308],'#8f7e70');arena.line([399,308],[350,315],'#8f7e70');arena.line([350,315],[301,308],'#8f7e70');
  arena.rect(0,335,700,25,'#4a4351');arena.rect(0,335,700,2,'#ead2a6');arena.rect(0,338,700,5,'#77605b');
  for(let x=0;x<700;x+=38) {arena.rect(x+3,344,30,11,'#373b4d');arena.rect(x+3,344,30,1,'#8e7365');}
  for(const x of [95,605]) {
    arena.rect(x-4,149,8,133,'#252b3d');arena.rect(x-2,150,3,129,'#82715f');arena.rect(x-17,155,47,4,'#252b3d');arena.rect(x-16,155,45,1,'#b39a73');
    arena.rect(x-8,277,17,8,'#3c3d4b');arena.rect(x-7,278,15,2,'#b7a083');
    const lx=x+(x<350?-12:13);arena.line([lx,159],[lx,173],'#252b3d');
    arena.poly([[lx-5,173],[lx+5,173],[lx+8,180],[lx+5,193],[lx-5,193],[lx-8,180]],'#d39564','#252b3d');
    arena.rect(lx-3,177,6,12,'#f5d5a0');arena.rect(lx-6,173,12,3,'#252b3d');arena.rect(lx-5,192,10,2,'#252b3d');
  }
  // Foreground cut silhouettes only touch the image corners.
  for(const side of [0,1]) for(let n=0;n<18;n++) {
    const x=side?800-n*5:n*5,y=358-(n%5)*3;
    fore.poly([[x,y+4],[x-4,y-10-n%7],[x+1,y-5],[x+4,y-18-n%11],[x+7,y+4]],'#1c2938');
  }
  PX_STAGE={sky,cloud,far,town,arena,fore,vig};return PX_STAGE;
}
const PX_LIFE = new Map();
function pxStageLife(frame) {
  frame%=8;if(PX_LIFE.has(frame))return PX_LIFE.get(frame);
  const s=new PixelSurface(640,360);
  for(const [x,base,light] of [[77,'#365f7f','#75c9d9'],[547,'#824856','#df9a88']]) {
    for(let j=0;j<62;j++) {
      const wave=Math.round(Math.sin(frame*Math.PI/4+j*.08)*2*j/62),w=j>50?32-Math.round((j-50)/2):32;
      s.rect(x+wave,160+j,w,1,PX_INK);s.rect(x+wave+1,160+j,w-2,1,base);
      s.rect(x+wave+4,160+j,2,1,light);
    }
    const wx=Math.round(Math.sin(frame*Math.PI/4+1.8));
    s.poly([[x+16+wx,175],[x+23+wx,186],[x+16+wx,197],[x+9+wx,186]],light);
    s.line([x+16+wx,178],[x+16+wx,194],base);
  }
  PX_LIFE.set(frame,s);return s;
}
function pxMakeBG() {
  const source=pxStage(),out={foreM:160};
  for(const key of Object.keys(source)) {
    const src=source[key],cv=document.createElement('canvas');cv.width=src.w*2;cv.height=src.h*2;
    const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(pxCanvas(src),0,0,cv.width,cv.height);out[key]=cv;
  }
  return out;
}
