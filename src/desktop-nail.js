'use strict';
// Raise the hammer clear of the face, strike on the existing two-nail release,
// then follow through and recover. Serialized move age survives paused snapshots.
Object.assign(PX_POSES, {
  nailraise: {planted:true,h:[-9,-76],tilt:-.1,s:[-11,-59],hip:[-8,-31],a:[[-30,-62],[-31,-88]],b:[[15,-48],[28,-64]],l:[[19,-16],[30,0]],r:[[-28,-17],[-37,0]]},
  naildrive: {planted:true,h:[10,-72],tilt:.12,s:[5,-56],hip:[-3,-30],a:[[24,-62],[34,-59]],b:[[18,-46],[25,-55]],l:[[23,-15],[30,0]],r:[[-27,-16],[-37,0]]},
  nailfollow: {planted:true,h:[15,-67],tilt:.2,s:[10,-51],hip:[-2,-28],a:[[29,-44],[41,-37]],b:[[-17,-38],[-7,-48]],l:[[24,-14],[30,0]],r:[[-27,-15],[-37,0]]},
  nailpull: {planted:true,h:[6,-71],tilt:.1,s:[1,-55],hip:[-5,-30],a:[[17,-38],[19,-48]],b:[[-24,-41],[-13,-50]],l:[[22,-15],[30,0]],r:[[-28,-16],[-37,0]]},
  nailsettle: {planted:true,h:[-3,-76],s:[-5,-60],hip:[-6,-32],a:[[11,-43],[6,-61]],b:[[-21,-43],[-12,-52]],l:[[20,-16],[30,0]],r:[[-28,-17],[-37,0]]},
});
const desktopNailPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='nail'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'nailraise';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'naildrive';
      if(elapsed<6)return 'nailfollow';
      if(elapsed<9)return 'nailpull';
      return 'nailsettle';
    }
  }
  return desktopNailPoseBase(S,f);
};
