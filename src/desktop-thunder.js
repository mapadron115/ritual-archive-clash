'use strict';
// Keep Thunder Clap's wide footing through preparation and guard recovery.
// The reviewed open/close/pull and the simulation's release stay unchanged.
Object.assign(PX_POSES, {
  thunderready: {planted:true,h:[-7,-76],s:[-9,-59],hip:[-8,-30],a:[[22,-47],[29,-59]],b:[[-27,-48],[-32,-60]],l:[[19,-15],[32,0]],r:[[-28,-17],[-38,0]]},
  thundersettle: {planted:true,h:[-2,-75],s:[-6,-58],hip:[-8,-30],a:[[23,-43],[25,-58]],b:[[-25,-44],[-18,-58]],l:[[20,-15],[32,0]],r:[[-28,-17],[-38,0]]},
});
const desktopThunderPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='thunderclap') {
      if(f.mt<Math.ceil(m.su/2))return 'thunderready';
      if(f.mt>=m.su+Math.ceil(m.re*.65))return 'thundersettle';
    }
  }
  return desktopThunderPoseBase(S,f);
};
