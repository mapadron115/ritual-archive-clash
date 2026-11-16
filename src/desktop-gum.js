'use strict';
// A low wrist coil and forward flick for the existing strand, then a return.
// Serialized move age holds the same body in freezes and guest snapshots.
Object.assign(PX_POSES, {
  gumcoil: {planted:true,h:[-12,-77],tilt:-.08,s:[-14,-61],hip:[-8,-32],a:[[-29,-43],[-15,-50]],b:[[9,-45],[20,-59]],l:[[17,-17],[28,0]],r:[[-28,-17],[-37,0]]},
  gumflick: {planted:true,palm:true,h:[7,-76],tilt:.08,s:[1,-60],hip:[-5,-32],a:[[17,-43],[30,-39]],b:[[-26,-45],[-15,-60]],l:[[21,-17],[28,0]],r:[[-29,-18],[-37,0]]},
  gumfollow: {planted:true,palm:true,h:[14,-72],tilt:.14,s:[8,-56],hip:[-2,-30],a:[[29,-41],[44,-39]],b:[[-22,-42],[-12,-57]],l:[[22,-16],[28,0]],r:[[-28,-17],[-37,0]]},
  gumpull: {planted:true,palm:true,h:[5,-76],tilt:.05,s:[0,-60],hip:[-5,-32],a:[[20,-40],[14,-47]],b:[[-25,-45],[-14,-59]],l:[[20,-17],[28,0]],r:[[-28,-18],[-37,0]]},
  gumsettle: {planted:true,h:[-3,-79],s:[-6,-63],hip:[-6,-33],a:[[16,-44],[15,-61]],b:[[-24,-46],[-14,-56]],l:[[18,-18],[28,0]],r:[[-28,-18],[-37,0]]},
});
const desktopGumPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='gum'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'gumcoil';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'gumflick';
      if(elapsed<6)return 'gumfollow';
      if(elapsed<9)return 'gumpull';
      return 'gumsettle';
    }
  }
  return desktopGumPoseBase(S,f);
};
