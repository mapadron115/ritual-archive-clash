'use strict';
// AP Shot compresses between the hands, sights down the wrist, then kicks back.
// Only serialized move age selects the body; simulation and the beam stay intact.
Object.assign(PX_POSES, {
  apcompress: {planted:true,h:[-14,-75],tilt:-.08,s:[-17,-58],hip:[-10,-29],a:[[5,-42],[14,-47]],b:[[-18,-43],[8,-46]],l:[[18,-14],[31,0]],r:[[-30,-15],[-39,0]]},
  apaim: {planted:true,h:[-9,-73],s:[-13,-56],hip:[-9,-29],a:[[7,-38],[23,-37]],b:[[-12,-40],[16,-38]],l:[[19,-14],[31,0]],r:[[-29,-15],[-39,0]]},
  apfire: {planted:true,h:[4,-71],tilt:.08,s:[0,-54],hip:[-6,-28],a:[[11,-38],[27,-37]],b:[[-5,-40],[19,-38]],l:[[21,-13],[31,0]],r:[[-29,-15],[-39,0]]},
  aprecoil: {planted:true,h:[-15,-77],tilt:-.12,s:[-18,-59],hip:[-11,-30],a:[[1,-39],[16,-37]],b:[[-20,-42],[8,-39]],l:[[18,-15],[31,0]],r:[[-31,-16],[-39,0]]},
});
const desktopAPShotPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='apshot'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return f.mt<m.su-3?'apcompress':'apaim';
      const elapsed=f.mt-m.su;
      if(elapsed<Math.min(3,Math.ceil(m.re/3)))return 'apfire';
      if(elapsed<Math.ceil(m.re*.65))return 'aprecoil';
    }
  }
  return desktopAPShotPoseBase(S,f);
};
