'use strict';
// An underarm stone toss: draw back low, release, lift through and recover.
// Serialized move age holds the same body in freezes and guest snapshots.
Object.assign(PX_POSES, {
  stonegather: {planted:true,h:[-5,-79],s:[-7,-63],hip:[-6,-33],a:[[-24,-43],[-9,-42]],b:[[12,-46],[21,-60]],l:[[18,-18],[28,0]],r:[[-28,-18],[-37,0]]},
  stonecoil: {planted:true,h:[-12,-77],tilt:-.08,s:[-14,-61],hip:[-8,-32],a:[[-30,-40],[-28,-29]],b:[[9,-45],[20,-59]],l:[[17,-17],[28,0]],r:[[-28,-17],[-37,0]]},
  stonetoss: {planted:true,palm:true,h:[7,-76],tilt:.08,s:[1,-60],hip:[-5,-32],a:[[13,-45],[28,-40]],b:[[-26,-45],[-15,-60]],l:[[21,-17],[28,0]],r:[[-29,-18],[-37,0]]},
  stonefollow: {planted:true,palm:true,h:[14,-72],tilt:.14,s:[8,-56],hip:[-2,-30],a:[[29,-46],[40,-57]],b:[[-22,-42],[-12,-57]],l:[[22,-16],[28,0]],r:[[-28,-17],[-37,0]]},
  stonepull: {planted:true,palm:true,h:[5,-76],tilt:.05,s:[0,-60],hip:[-5,-32],a:[[23,-44],[22,-54]],b:[[-25,-45],[-14,-59]],l:[[20,-17],[28,0]],r:[[-28,-18],[-37,0]]},
  stonesettle: {planted:true,h:[-3,-79],s:[-6,-63],hip:[-6,-33],a:[[16,-44],[15,-61]],b:[[-24,-46],[-14,-56]],l:[[18,-18],[28,0]],r:[[-28,-18],[-37,0]]},
});
const desktopStonePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='stone') {
      if(f.mt<Math.ceil(m.su/2))return 'stonegather';
      if(f.mt<m.su)return 'stonecoil';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'stonetoss';
      if(elapsed<6)return 'stonefollow';
      if(elapsed<9)return 'stonepull';
      return 'stonesettle';
    }
  }
  return desktopStonePoseBase(S,f);
};
