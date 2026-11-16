'use strict';
// Contract reaches along its existing strand, then pulls the fist into the ribs.
// Only serialized move age selects the body; the grab stays in simulation.
Object.assign(PX_POSES, {
  contractreach: {planted:true,h:[10,-75],tilt:.12,s:[5,-59],hip:[-5,-31],a:[[25,-45],[42,-42]],b:[[-20,-43],[-7,-52]],l:[[22,-16],[30,0]],r:[[-27,-17],[-36,0]]},
  contractpull: {planted:true,h:[-19,-73],tilt:-.18,s:[-20,-56],hip:[-12,-28],a:[[-25,-40],[-5,-43]],b:[[-36,-43],[-25,-56]],l:[[18,-14],[30,0]],r:[[-31,-15],[-36,0]]},
  contractbrace: {planted:true,h:[-10,-69],tilt:.1,s:[-13,-53],hip:[-10,-27],a:[[-12,-37],[0,-46]],b:[[-29,-40],[-18,-54]],l:[[20,-13],[30,0]],r:[[-29,-14],[-36,0]]},
});
const desktopContractPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='contract'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'contractreach';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'contractpull';
      if(elapsed<Math.ceil(m.re*.65))return 'contractbrace';
    }
  }
  return desktopContractPoseBase(S,f);
};
