'use strict';
// Desktop-only grounded injury poses. The existing recovery countdown is the
// animation clock: hit-stop, cinematic freezes and stopped actors hold the pose.
// No hit event, wall clock or presentation history is needed by guest snapshots.
Object.assign(PX_POSES, {
  hitreel: {planted:true,h:[-29,-78],tilt:-.32,s:[-23,-57],hip:[-4,-29],a:[[4,-44],[19,-28]],b:[[-37,-41],[-47,-26]],l:[[21,-15],[29,0]],r:[[-24,-15],[-31,0]]},
  hitbrace: {planted:true,h:[-4,-57],tilt:.25,s:[-12,-43],hip:[-9,-24],a:[[15,-35],[27,-47]],b:[[-28,-32],[-19,-20]],l:[[20,-12],[29,0]],r:[[-25,-13],[-31,0]]},
  hitrise: {planted:true,h:[-7,-71],tilt:.08,s:[-9,-54],hip:[-6,-31],a:[[14,-40],[23,-54]],b:[[-26,-39],[-16,-51]],l:[[18,-16],[29,0]],r:[[-24,-17],[-31,0]]},
});
const desktopPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='hit'&&f.y>=GROUND)
    return f.stT>10?'hitreel':f.stT>5?'hitbrace':'hitrise';
  return desktopPoseBase(S,f);
};
