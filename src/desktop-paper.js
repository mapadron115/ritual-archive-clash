'use strict';
// Gather an open palm, drive it into the existing orb lane, then follow through.
// Serialized move age keeps the body stable in freezes and guest snapshots.
Object.assign(PX_POSES, {
  papergather: {planted:true,palm:true,h:[-13,-74],tilt:-.1,s:[-14,-57],hip:[-9,-29],a:[[-34,-44],[-19,-42]],b:[[9,-45],[18,-59]],l:[[20,-15],[31,0]],r:[[-29,-16],[-38,0]]},
  paperdrive: {planted:true,palm:true,h:[9,-73],tilt:.1,s:[4,-56],hip:[-4,-29],a:[[18,-43],[28,-42]],b:[[-24,-43],[-12,-56]],l:[[23,-14],[31,0]],r:[[-28,-16],[-38,0]]},
  paperfollow: {planted:true,palm:true,h:[16,-68],tilt:.17,s:[11,-51],hip:[-1,-27],a:[[24,-41],[36,-42]],b:[[-19,-37],[-10,-51]],l:[[24,-13],[31,0]],r:[[-27,-15],[-38,0]]},
  paperpull: {planted:true,palm:true,h:[6,-72],tilt:.08,s:[1,-55],hip:[-5,-29],a:[[14,-39],[12,-44]],b:[[-24,-42],[-12,-55]],l:[[22,-15],[31,0]],r:[[-28,-16],[-38,0]]},
  papersettle: {planted:true,h:[-3,-76],s:[-5,-59],hip:[-6,-31],a:[[13,-43],[9,-61]],b:[[-23,-43],[-12,-54]],l:[[20,-16],[31,0]],r:[[-29,-17],[-38,0]]},
});
const desktopPaperPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='paper'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'papergather';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'paperdrive';
      if(elapsed<7)return 'paperfollow';
      if(elapsed<11)return 'paperpull';
      return 'papersettle';
    }
  }
  return desktopPaperPoseBase(S,f);
};
