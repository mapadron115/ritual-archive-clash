'use strict';
// Reach toward the remote well, close the hand, then draw it toward the ribs.
// Serialized move age keeps this gesture stable through freezes and snapshots.
Object.assign(PX_POSES, {
  bluereach: {planted:true,h:[10,-78],tilt:.08,s:[5,-62],hip:[-5,-34],a:[[24,-52],[43,-56]],b:[[-23,-46],[-13,-57]],l:[[22,-17],[30,0]],r:[[-29,-18],[-37,0]],palm:true},
  blueset: {planted:true,h:[5,-78],tilt:.04,s:[0,-62],hip:[-7,-34],a:[[22,-49],[39,-55]],b:[[-25,-46],[-15,-57]],l:[[22,-17],[30,0]],r:[[-29,-18],[-37,0]]},
  bluedraw: {planted:true,h:[-17,-76],tilt:-.12,s:[-19,-60],hip:[-10,-33],a:[[1,-39],[-7,-55]],b:[[-31,-45],[-21,-57]],l:[[19,-16],[30,0]],r:[[-30,-18],[-37,0]]},
  bluerecover: {planted:true,h:[-8,-77],tilt:-.04,s:[-11,-61],hip:[-8,-34],a:[[7,-43],[10,-53]],b:[[-27,-45],[-16,-57]],l:[[20,-17],[30,0]],r:[[-29,-18],[-37,0]]},
});
const desktopBluePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='blue'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'bluereach';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'blueset';
      if(elapsed<7)return 'bluedraw';
      if(elapsed<Math.ceil(m.re*.65))return 'bluerecover';
    }
  }
  return desktopBluePoseBase(S,f);
};
