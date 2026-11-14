'use strict';
// Original pixel assets, authored here as integer geometry. No filtered cartoon sprites or external assets.
const PX_SCALE = 2, PX_W = 144, PX_H = 128, PX_OX = 64, PX_OY = 120;
const PX_ENABLED = new Set(Array.from({length:15},(_,i)=>i));
const PX_INK = '#111623', PX_LIGHT = '#fff0ca';
const PX_RGB = new Map();
function pxRGB(hex) {
  if (!PX_RGB.has(hex)) {
    let color=hex;
    if(/^#[0-9a-f]{3}$/i.test(color)) color='#'+[...color.slice(1)].map(c=>c+c).join('');
    const rgb=color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    const n=parseInt(color.slice(1),16);
    PX_RGB.set(hex,rgb ? [+rgb[1],+rgb[2],+rgb[3],255] : [n>>16&255,n>>8&255,n&255,255]);
  }
  return PX_RGB.get(hex);
}
class PixelSurface {
  constructor(w, h) { this.w = w; this.h = h; this.data = new Uint8ClampedArray(w * h * 4); }
  dot(x, y, col) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const n = (y * this.w + x) * 4, c = pxRGB(col);
    for (let k = 0; k < 4; k++) this.data[n + k] = c[k];
  }
  rect(x, y, w, h, col) { for (let j = Math.round(y); j < Math.round(y + h); j++) for (let i = Math.round(x); i < Math.round(x + w); i++) this.dot(i, j, col); }
  ellipse(x, y, rx, ry, col) {
    for (let j = Math.floor(y - ry); j <= Math.ceil(y + ry); j++) for (let i = Math.floor(x - rx); i <= Math.ceil(x + rx); i++) {
      if (((i-x)/(rx || 1)) ** 2 + ((j-y)/(ry || 1)) ** 2 <= 1) this.dot(i, j, col);
    }
  }
  line(a, b, col, width = 1) {
    const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (let i = 0; i <= n; i++) { const x = a[0] + dx*i/n, y = a[1] + dy*i/n; if (width <= 1) this.dot(x,y,col); else this.ellipse(x,y,width/2,width/2,col); }
  }
  poly(points, col, outline) {
    const minY = Math.floor(Math.min(...points.map(p => p[1]))), maxY = Math.ceil(Math.max(...points.map(p => p[1])));
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i+1)%points.length], scan = y + 0.5;
        if ((a[1] <= scan && b[1] > scan) || (b[1] <= scan && a[1] > scan)) xs.push(a[0] + (scan-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);
      for (let i = 0; i+1 < xs.length; i += 2) this.rect(Math.ceil(xs[i]), y, Math.ceil(xs[i+1])-Math.ceil(xs[i]), 1, col);
    }
    if (outline) for (let i = 0; i < points.length; i++) this.line(points[i], points[(i+1)%points.length], outline);
  }
  blit(src, x, y, scale = 1, flip = false) {
    x=Math.round(x);y=Math.round(y);const w=Math.round(src.w*scale),h=Math.round(src.h*scale);
    for(let j=Math.max(0,-y);j<Math.min(h,this.h-y);j++) for(let i=Math.max(0,-x);i<Math.min(w,this.w-x);i++) {
      const sx=Math.min(src.w-1,Math.floor(i/scale)),sy=Math.min(src.h-1,Math.floor(j/scale));
      const p=(sy*src.w+(flip?src.w-1-sx:sx))*4;if(!src.data[p+3])continue;
      const q=((y+j)*this.w+x+i)*4;
      this.data[q]=src.data[p];this.data[q+1]=src.data[p+1];this.data[q+2]=src.data[p+2];this.data[q+3]=src.data[p+3];
    }
  }
}

// Coordinates are in source pixels relative to the grounded root. Every pose was composed for this project.
// h=head, s=shoulders, hip, a/b=near/far elbow and hand, l/r=near/far knee and foot.
const PX_POSES = {
  idle: {h:[1,-78],s:[-2,-63],hip:[-5,-35],a:[[14,-48],[22,-62]],b:[[-17,-48],[-7,-59]],l:[[13,-18],[22,0]],r:[[-20,-19],[-28,0]]},
  breathe: {h:[1,-77],s:[-2,-62],hip:[-5,-34],a:[[14,-47],[22,-61]],b:[[-17,-47],[-7,-58]],l:[[13,-18],[22,0]],r:[[-20,-19],[-28,0]]},
  guard: {h:[-4,-76],s:[-6,-61],hip:[-6,-33],a:[[13,-55],[12,-78]],b:[[0,-49],[20,-68]],l:[[12,-17],[24,0]],r:[[-23,-18],[-31,0]]},
  // Closed arms absorb a block, recoil, then rebuild the guard within its ten ticks.
  blockhit: {h:[-20,-73],tilt:-.15,s:[-19,-57],hip:[-9,-29],a:[[-1,-55],[-4,-77]],b:[[-7,-47],[6,-66]],l:[[15,-14],[29,0]],r:[[-30,-16],[-39,0]]},
  blockre: {h:[-13,-75],s:[-14,-59],hip:[-8,-31],a:[[9,-48],[18,-68]],b:[[-15,-49],[-6,-72]],l:[[17,-16],[29,0]],r:[[-27,-17],[-36,0]]},
  blocksettle: {h:[-6,-76],s:[-9,-61],hip:[-6,-33],a:[[14,-54],[15,-76]],b:[[-9,-47],[3,-62]],l:[[14,-17],[26,0]],r:[[-24,-18],[-33,0]]},
  // Stun countdown: broken-open arms, folded torso, hanging stagger, braced recovery.
  breakopen: {h:[-22,-78],tilt:-.35,s:[-15,-60],hip:[-3,-29],a:[[17,-68],[31,-83]],b:[[-37,-48],[-46,-63]],l:[[23,-13],[34,0]],r:[[-23,-17],[-34,0]]},
  breakfold: {h:[19,-54],tilt:.45,s:[7,-44],hip:[-11,-27],a:[[30,-29],[37,-15]],b:[[-15,-28],[-10,-11]],l:[[13,-13],[29,0]],r:[[-30,-15],[-39,0]]},
  stunbrace: {h:[-9,-61],tilt:.2,s:[-10,-46],hip:[-8,-25],a:[[16,-34],[24,-20]],b:[[-25,-33],[-18,-48]],l:[[20,-12],[31,0]],r:[[-27,-13],[-36,0]]},
  stunrise: {h:[1,-73],s:[-3,-57],hip:[-6,-31],a:[[17,-42],[25,-52]],b:[[-21,-40],[-11,-54]],l:[[16,-16],[26,0]],r:[[-23,-17],[-32,0]]},
  wind: {h:[-15,-75],s:[-17,-59],hip:[-11,-31],a:[[-31,-48],[-28,-63]],b:[[0,-46],[11,-58]],l:[[8,-15],[22,0]],r:[[-24,-16],[-34,0]]},
  punch: {h:[15,-77],s:[12,-62],hip:[1,-34],a:[[33,-61],[53,-63]],b:[[-3,-45],[11,-52]],l:[[22,-17],[31,0]],r:[[-21,-19],[-32,0]]},
  punch2: {h:[17,-76],s:[13,-61],hip:[2,-34],a:[[8,-44],[26,-49]],b:[[36,-60],[55,-61]],l:[[24,-18],[35,0]],r:[[-19,-21],[-29,0]]},
  hook: {h:[15,-76],s:[10,-60],hip:[1,-33],a:[[28,-57],[35,-83]],b:[[-3,-44],[12,-49]],l:[[27,-18],[35,0]],r:[[-18,-20],[-29,0]]},
  kickw: {h:[-8,-81],s:[-9,-65],hip:[-6,-36],a:[[9,-51],[18,-63]],b:[[-24,-50],[-29,-62]],l:[[15,-48],[1,-24]],r:[[-12,-18],[-15,0]]},
  kick: {h:[-18,-79],s:[-19,-63],hip:[-5,-37],a:[[-2,-48],[11,-59]],b:[[-35,-55],[-30,-69]],l:[[22,-43],[52,-48]],r:[[-13,-18],[-19,0]]},
  jump: {h:[3,-82],s:[0,-66],hip:[-2,-37],a:[[18,-58],[25,-72]],b:[[-20,-57],[-26,-70]],l:[[18,-35],[12,-14]],r:[[-17,-27],[-30,-38]]},
  // Voluntary jumps unfold toward the floor; these never replace attacks or air hits.
  jumpcrest: {h:[8,-73],tilt:.15,s:[1,-58],hip:[-6,-30],a:[[24,-51],[35,-62]],b:[[-24,-50],[-35,-59]],l:[[24,-49],[32,-27]],r:[[-5,-44],[-18,-26]]},
  jumpfall: {h:[-3,-80],s:[-6,-64],hip:[-3,-35],a:[[16,-49],[25,-39]],b:[[-26,-49],[-33,-37]],l:[[14,-20],[20,-2]],r:[[-21,-29],[-32,-19]]},
  jumpbrace: {h:[12,-65],tilt:.18,s:[4,-50],hip:[-5,-26],a:[[25,-34],[34,-20]],b:[[-21,-33],[-27,-20]],l:[[22,-12],[30,-1]],r:[[-27,-17],[-36,-5]]},
  jpunch: {h:[13,-80],s:[11,-64],hip:[1,-36],a:[[32,-61],[50,-61]],b:[[-4,-47],[7,-53]],l:[[20,-34],[17,-14]],r:[[-14,-25],[-30,-36]]},
  jkick: {h:[-13,-82],s:[-14,-65],hip:[-2,-38],a:[[3,-51],[14,-65]],b:[[-29,-58],[-28,-72]],l:[[23,-40],[49,-42]],r:[[-18,-23],[-34,-28]]},
  // Air normals coil in suspension, rather than borrowing a floor-planted wind-up.
  jpunchw: {h:[-9,-77],s:[-12,-61],hip:[-3,-33],a:[[-28,-48],[-32,-66]],b:[[9,-48],[20,-63]],l:[[23,-42],[30,-22]],r:[[-16,-34],[-30,-19]]},
  jpunchload: {h:[-17,-70],tilt:-.12,s:[-20,-54],hip:[-6,-28],a:[[-39,-44],[-39,-62]],b:[[3,-43],[17,-57]],l:[[25,-48],[35,-29]],r:[[-10,-41],[-24,-26]]},
  jpunchsettle: {h:[1,-78],s:[-3,-62],hip:[-4,-34],a:[[15,-46],[23,-61]],b:[[-23,-48],[-19,-66]],l:[[15,-24],[21,-8]],r:[[-22,-33],[-34,-20]]},
  jkickw: {h:[-8,-80],s:[-10,-64],hip:[-4,-35],a:[[9,-50],[19,-66]],b:[[-28,-50],[-36,-64]],l:[[20,-49],[8,-28]],r:[[-19,-32],[-33,-17]]},
  jkickload: {h:[-23,-73],tilt:-.13,s:[-24,-57],hip:[-9,-31],a:[[-2,-46],[12,-59]],b:[[-42,-47],[-45,-63]],l:[[23,-53],[7,-43]],r:[[-23,-33],[-39,-20]]},
  jkicksettle: {h:[-4,-77],s:[-8,-61],hip:[-4,-34],a:[[13,-47],[24,-62]],b:[[-28,-46],[-30,-63]],l:[[22,-30],[31,-11]],r:[[-21,-24],[-34,-9]]},
  hit: {h:[-17,-74],s:[-15,-59],hip:[-2,-32],a:[[1,-44],[15,-52]],b:[[-31,-45],[-37,-57]],l:[[20,-16],[29,0]],r:[[-17,-18],[-26,0]]},
  stun: {h:[6,-69],s:[0,-57],hip:[-5,-31],a:[[15,-42],[11,-26]],b:[[-19,-43],[-23,-28]],l:[[13,-15],[24,0]],r:[[-21,-15],[-29,0]]},
  cast1: {h:[10,-79],s:[6,-63],hip:[-3,-35],a:[[18,-48],[28,-39]],b:[[-16,-49],[-9,-59]],l:[[20,-18],[30,0]],r:[[-24,-19],[-33,0]],palm:true},
  clap: {h:[11,-77],s:[7,-61],hip:[-2,-33],a:[[24,-42],[33,-42]],b:[[20,-51],[33,-42]],l:[[22,-17],[31,0]],r:[[-21,-19],[-30,0]]},
  sign: {h:[2,-79],s:[0,-64],hip:[-4,-35],a:[[16,-51],[11,-66]],b:[[-4,-50],[11,-66]],l:[[13,-18],[23,0]],r:[[-21,-19],[-29,0]]},
  throw: {h:[14,-77],s:[11,-62],hip:[0,-34],a:[[20,-49],[33,-40]],b:[[-8,-52],[-23,-71]],l:[[22,-17],[31,0]],r:[[-22,-19],[-33,0]]},
  bow: {h:[6,-79],s:[3,-64],hip:[-3,-35],a:[[21,-48],[32,-39]],b:[[-15,-59],[-28,-62]],l:[[16,-18],[27,0]],r:[[-24,-19],[-34,0]]},
  win: {h:[0,-82],s:[-2,-66],hip:[-3,-35],a:[[14,-81],[9,-94]],b:[[-20,-50],[-7,-38]],l:[[6,-18],[13,0]],r:[[-14,-19],[-21,0]]},
  // Round winner lowers the guard, lifts a fist, then relaxes from the peak.
  // The original phaseT clock starts only after the KO impact pause.
  winready: {h:[8,-71],tilt:.15,s:[1,-56],hip:[-5,-30],a:[[19,-40],[10,-31]],b:[[-21,-39],[-27,-24]],l:[[14,-15],[23,0]],r:[[-22,-16],[-30,0]]},
  winraise: {h:[-5,-79],tilt:-.12,s:[-5,-63],hip:[-5,-34],a:[[23,-65],[25,-83]],b:[[-23,-47],[-15,-33]],l:[[10,-18],[18,0]],r:[[-19,-19],[-26,0]]},
  winsettle: {h:[4,-79],s:[0,-63],hip:[-2,-34],a:[[21,-65],[18,-79]],b:[[-21,-45],[-25,-29]],l:[[10,-18],[17,0]],r:[[-17,-19],[-24,0]]},
  // Eight steps: the supporting sole stays at the floor as the other knee lifts.
  // Three ticks per cell reduces planted-foot drift; retreats keep the hands up.
  walk0: {h:[6,-79],s:[3,-63],hip:[-2,-34],a:[[15,-47],[24,-57]],b:[[-17,-49],[-12,-63]],l:[[16,-17],[24,0]],r:[[-18,-19],[-8,-2]]},
  walk1: {h:[5,-78],s:[2,-62],hip:[-1,-33],a:[[17,-46],[26,-56]],b:[[-19,-49],[-15,-63]],l:[[12,-16],[16,0]],r:[[-16,-23],[-10,-10]]},
  walk2: {h:[6,-80],s:[3,-64],hip:[0,-35],a:[[15,-48],[25,-59]],b:[[-18,-50],[-13,-64]],l:[[7,-18],[8,0]],r:[[0,-29],[2,-14]]},
  walk3: {h:[7,-80],s:[4,-64],hip:[0,-35],a:[[10,-48],[20,-61]],b:[[-12,-49],[-5,-62]],l:[[0,-18],[0,0]],r:[[18,-26],[19,-6]]},
  walk4: {h:[6,-79],s:[3,-63],hip:[-2,-34],a:[[7,-49],[16,-63]],b:[[-5,-47],[8,-57]],l:[[-18,-19],[-8,-2]],r:[[16,-17],[24,0]]},
  walk5: {h:[5,-78],s:[2,-62],hip:[-1,-33],a:[[5,-49],[13,-63]],b:[[-3,-46],[11,-56]],l:[[-16,-23],[-10,-10]],r:[[12,-16],[16,0]]},
  walk6: {h:[6,-80],s:[3,-64],hip:[0,-35],a:[[6,-50],[15,-64]],b:[[-5,-48],[10,-59]],l:[[0,-29],[2,-14]],r:[[7,-18],[8,0]]},
  walk7: {h:[7,-80],s:[4,-64],hip:[0,-35],a:[[10,-49],[19,-62]],b:[[-10,-48],[2,-61]],l:[[18,-26],[19,-6]],r:[[0,-18],[0,0]]},
  back0: {h:[-11,-77],s:[-10,-61],hip:[-4,-32],a:[[11,-54],[17,-73]],b:[[-12,-48],[0,-62]],l:[[-18,-17],[-24,0]],r:[[9,-20],[0,-3]]},
  back1: {h:[-12,-76],s:[-11,-60],hip:[-5,-31],a:[[10,-53],[16,-72]],b:[[-14,-47],[-2,-61]],l:[[-14,-16],[-18,0]],r:[[11,-24],[2,-10]]},
  back2: {h:[-11,-78],s:[-10,-62],hip:[-5,-33],a:[[11,-55],[17,-74]],b:[[-13,-49],[-1,-63]],l:[[-10,-18],[-12,0]],r:[[-3,-28],[-10,-13]]},
  back3: {h:[-10,-78],s:[-9,-62],hip:[-4,-33],a:[[12,-55],[18,-74]],b:[[-11,-49],[1,-63]],l:[[-5,-18],[-6,0]],r:[[-22,-25],[-22,-6]]},
  back4: {h:[-11,-77],s:[-10,-61],hip:[-4,-32],a:[[11,-54],[17,-73]],b:[[-12,-48],[0,-62]],l:[[9,-20],[0,-3]],r:[[-18,-17],[-24,0]]},
  back5: {h:[-12,-76],s:[-11,-60],hip:[-5,-31],a:[[10,-53],[16,-72]],b:[[-14,-47],[-2,-61]],l:[[11,-24],[2,-10]],r:[[-14,-16],[-18,0]]},
  back6: {h:[-11,-78],s:[-10,-62],hip:[-5,-33],a:[[11,-55],[17,-74]],b:[[-13,-49],[-1,-63]],l:[[-3,-28],[-10,-13]],r:[[-10,-18],[-12,0]]},
  back7: {h:[-10,-78],s:[-9,-62],hip:[-4,-33],a:[[12,-55],[18,-74]],b:[[-11,-49],[1,-63]],l:[[-22,-25],[-22,-6]],r:[[-5,-18],[-6,0]]},
  punchload: {h:[-17,-73],s:[-19,-58],hip:[-12,-30],a:[[-33,-44],[-28,-61]],b:[[2,-45],[15,-57]],l:[[9,-15],[23,0]],r:[[-28,-16],[-35,0]]},
  punchre: {h:[9,-77],s:[7,-62],hip:[-1,-34],a:[[25,-56],[36,-59]],b:[[-8,-47],[5,-57]],l:[[18,-18],[27,0]],r:[[-22,-19],[-31,0]]},
  punch2re: {h:[10,-77],s:[7,-62],hip:[-1,-34],a:[[10,-47],[22,-56]],b:[[24,-55],[38,-58]],l:[[18,-18],[29,0]],r:[[-21,-19],[-30,0]]},
  ready: {h:[3,-78],s:[0,-63],hip:[-4,-35],a:[[17,-49],[25,-62]],b:[[-16,-48],[-4,-59]],l:[[15,-18],[24,0]],r:[[-21,-19],[-29,0]]},
  hookw: {h:[-14,-68],s:[-17,-51],hip:[-12,-28],a:[[-16,-35],[-24,-26]],b:[[3,-44],[15,-56]],l:[[13,-13],[29,0]],r:[[-29,-14],[-37,0]]},
  hookload: {h:[-18,-67],s:[-20,-50],hip:[-14,-27],a:[[-23,-33],[-31,-25]],b:[[1,-44],[14,-55]],l:[[13,-12],[28,0]],r:[[-29,-14],[-38,0]]},
  hookre: {h:[9,-78],s:[5,-63],hip:[-2,-35],a:[[25,-61],[28,-74]],b:[[-10,-48],[4,-56]],l:[[20,-18],[29,0]],r:[[-21,-20],[-30,0]]},
  kickload: {h:[-12,-82],s:[-13,-66],hip:[-5,-38],a:[[5,-52],[17,-65]],b:[[-28,-53],[-29,-66]],l:[[23,-51],[19,-30]],r:[[-12,-19],[-16,0]]},
  kickre: {h:[-14,-81],s:[-15,-65],hip:[-4,-37],a:[[4,-52],[17,-63]],b:[[-30,-52],[-27,-66]],l:[[23,-38],[34,-25]],r:[[-13,-19],[-18,0]]},
  kickplant: {h:[-4,-79],s:[-5,-63],hip:[-3,-35],a:[[13,-48],[23,-61]],b:[[-21,-49],[-18,-61]],l:[[19,-20],[26,-2]],r:[[-18,-19],[-25,0]]},
  jpunchre: {h:[14,-73],tilt:.16,s:[8,-57],hip:[-3,-30],a:[[28,-45],[35,-35]],b:[[-15,-46],[-2,-62]],l:[[24,-47],[34,-26]],r:[[-15,-38],[-30,-23]]},
  jkickre: {h:[-18,-76],s:[-20,-60],hip:[-4,-33],a:[[1,-46],[16,-60]],b:[[-38,-49],[-42,-65]],l:[[29,-51],[15,-35]],r:[[-19,-29],[-36,-16]]},
  castw: {h:[-8,-78],s:[-10,-62],hip:[-6,-34],a:[[5,-47],[2,-58]],b:[[-23,-48],[-13,-59]],l:[[12,-17],[23,0]],r:[[-24,-18],[-33,0]]},
  castload: {h:[-14,-76],s:[-16,-60],hip:[-10,-32],a:[[-6,-45],[-8,-52]],b:[[-29,-46],[-18,-59]],l:[[12,-16],[24,0]],r:[[-28,-17],[-36,0]],palm:true},
  castre: {h:[-5,-79],s:[-8,-63],hip:[-7,-34],a:[[14,-40],[23,-28]],b:[[-24,-48],[-17,-59]],l:[[17,-17],[28,0]],r:[[-27,-18],[-36,0]],palm:true},
  castsettle: {h:[0,-79],s:[-3,-64],hip:[-5,-35],a:[[17,-46],[24,-51]],b:[[-19,-49],[-7,-60]],l:[[14,-18],[24,0]],r:[[-22,-19],[-30,0]]},
  // Speech comes from the head and chest, with a throat brace after the word.
  // Art IDs select this visual family without altering their cast1 combat definitions.
  speechw: {h:[-7,-81],tilt:-.18,s:[-9,-64],hip:[-5,-34],a:[[10,-51],[3,-68]],b:[[-22,-46],[-24,-32]],l:[[12,-18],[23,0]],r:[[-22,-18],[-31,0]]},
  speechload: {h:[-13,-83],tilt:-.3,s:[-13,-65],hip:[-7,-34],a:[[7,-55],[0,-72]],b:[[-28,-43],[-31,-27]],l:[[13,-17],[25,0]],r:[[-25,-18],[-34,0]]},
  speech: {h:[17,-75],tilt:.15,s:[9,-61],hip:[-2,-33],a:[[24,-46],[36,-55]],b:[[-18,-39],[-28,-29]],l:[[22,-17],[32,0]],r:[[-22,-19],[-32,0]],voice:true},
  speechre: {h:[4,-69],tilt:.25,s:[0,-57],hip:[-5,-31],a:[[20,-45],[9,-57]],b:[[-19,-41],[-23,-28]],l:[[16,-16],[26,0]],r:[[-23,-17],[-31,0]]},
  speechsettle: {h:[-2,-77],s:[-5,-62],hip:[-5,-34],a:[[14,-48],[6,-65]],b:[[-19,-45],[-17,-34]],l:[[13,-18],[23,0]],r:[[-21,-19],[-29,0]]},
  // Domain introductions use the existing sixty-tick cinematic countdown.
  // A tall closed seal opens into a wide, sustained frame; Maximums coil low instead.
  domgather: {h:[-6,-81],s:[-8,-65],hip:[-5,-35],a:[[20,-47],[27,-33]],b:[[-25,-48],[-31,-34]],l:[[12,-18],[23,0]],r:[[-23,-19],[-32,0]]},
  domseal: {h:[0,-82],s:[-2,-66],hip:[-4,-36],a:[[18,-62],[8,-84]],b:[[-13,-62],[3,-82]],l:[[10,-19],[20,0]],r:[[-18,-20],[-26,0]]},
  domopen: {h:[4,-82],s:[1,-66],hip:[-3,-35],a:[[29,-61],[45,-73]],b:[[-27,-61],[-40,-72]],l:[[18,-18],[29,0]],r:[[-25,-19],[-35,0]],palm:true},
  domhold: {h:[2,-80],s:[-1,-64],hip:[-4,-34],a:[[26,-49],[42,-57]],b:[[-25,-51],[-38,-59]],l:[[18,-18],[29,0]],r:[[-25,-18],[-35,0]],palm:true},
  domsettle: {h:[0,-79],s:[-3,-63],hip:[-5,-34],a:[[20,-44],[27,-35]],b:[[-22,-47],[-25,-36]],l:[[14,-18],[24,0]],r:[[-23,-18],[-32,0]]},
  maxcoil: {h:[-11,-72],s:[-13,-56],hip:[-8,-28],a:[[13,-36],[1,-44]],b:[[-26,-40],[-7,-48]],l:[[19,-13],[32,0]],r:[[-27,-14],[-38,0]]},
  maxcharge: {h:[-15,-76],s:[-17,-59],hip:[-10,-30],a:[[-5,-42],[-19,-33]],b:[[5,-46],[18,-51]],l:[[18,-14],[32,0]],r:[[-30,-16],[-40,0]]},
  maxopen: {h:[3,-83],s:[0,-67],hip:[-4,-35],a:[[25,-56],[38,-77]],b:[[-27,-55],[-38,-75]],l:[[21,-18],[33,0]],r:[[-25,-19],[-36,0]]},
  ultleap: {h:[-9,-78],tilt:-.15,s:[-7,-63],hip:[2,-35],a:[[15,-60],[10,-83]],b:[[-24,-48],[-32,-60]],l:[[22,-50],[8,-38]],r:[[-15,-22],[-30,-32]]},
  ultdive: {h:[20,-58],tilt:.45,s:[7,-49],hip:[-13,-31],a:[[32,-34],[40,-13]],b:[[-9,-45],[-25,-56]],l:[[-3,-23],[7,-7]],r:[[-31,-39],[-44,-49]]},
  ultimpact: {h:[11,-53],s:[4,-39],hip:[-9,-22],a:[[28,-22],[36,-4]],b:[[-17,-31],[-28,-17]],l:[[14,-11],[29,0]],r:[[-27,-12],[-37,0]]},
  clapw: {h:[-2,-79],s:[-4,-64],hip:[-4,-35],a:[[23,-55],[32,-65]],b:[[-21,-55],[-29,-65]],l:[[13,-18],[23,0]],r:[[-21,-19],[-29,0]]},
  signw: {h:[-2,-80],s:[-3,-65],hip:[-4,-35],a:[[12,-49],[8,-56]],b:[[-12,-49],[-1,-57]],l:[[13,-18],[23,0]],r:[[-21,-19],[-29,0]]},
  throww: {h:[-10,-79],s:[-12,-63],hip:[-6,-35],a:[[-22,-53],[-29,-74]],b:[[7,-50],[21,-60]],l:[[10,-18],[20,0]],r:[[-25,-19],[-34,0]]},
  boww: {h:[-4,-80],s:[-6,-65],hip:[-5,-35],a:[[12,-60],[24,-65]],b:[[-20,-58],[-22,-70]],l:[[11,-18],[21,0]],r:[[-22,-19],[-30,0]]},
  // Art families have their own load, contact and follow-through silhouettes.
  // These are presentation poses inside the existing move windows, never new moves.
  slashw: {h:[-9,-78],s:[-11,-63],hip:[-7,-34],a:[[-17,-62],[-25,-77]],b:[[5,-49],[14,-59]],l:[[11,-17],[23,0]],r:[[-25,-18],[-33,0]]},
  slashload: {h:[-13,-76],s:[-15,-60],hip:[-10,-32],a:[[-25,-67],[-31,-86]],b:[[1,-46],[13,-57]],l:[[12,-16],[25,0]],r:[[-28,-17],[-36,0]]},
  slash: {h:[16,-72],s:[13,-56],hip:[2,-31],a:[[34,-48],[52,-35]],b:[[-8,-48],[-23,-61]],l:[[25,-16],[36,0]],r:[[-19,-19],[-29,0]]},
  slashre: {h:[13,-74],s:[9,-59],hip:[0,-32],a:[[21,-38],[29,-24]],b:[[-10,-47],[1,-56]],l:[[23,-17],[32,0]],r:[[-21,-18],[-31,0]]},
  slashsettle: {h:[4,-77],s:[0,-62],hip:[-4,-34],a:[[15,-43],[25,-48]],b:[[-17,-48],[-6,-59]],l:[[16,-18],[25,0]],r:[[-22,-19],[-30,0]]},
  cannonw: {h:[-8,-76],s:[-11,-59],hip:[-7,-31],a:[[7,-40],[11,-50]],b:[[-20,-41],[-3,-48]],l:[[17,-16],[28,0]],r:[[-26,-16],[-36,0]]},
  cannonload: {h:[-13,-74],s:[-16,-57],hip:[-11,-29],a:[[1,-39],[4,-48]],b:[[-28,-41],[-9,-46]],l:[[15,-14],[29,0]],r:[[-31,-15],[-39,0]]},
  cannon: {h:[11,-77],s:[7,-61],hip:[-3,-32],a:[[16,-46],[28,-35]],b:[[8,-45],[24,-39]],l:[[24,-16],[35,0]],r:[[-24,-18],[-34,0]]},
  cannonre: {h:[-9,-78],s:[-12,-61],hip:[-8,-32],a:[[5,-42],[11,-41]],b:[[-12,-49],[9,-48]],l:[[20,-16],[31,0]],r:[[-29,-17],[-38,0]]},
  cannonsettle: {h:[-4,-76],s:[-7,-60],hip:[-5,-32],a:[[13,-43],[25,-48]],b:[[-19,-44],[-7,-50]],l:[[18,-17],[29,0]],r:[[-24,-18],[-33,0]]},
  clapload: {h:[2,-78],s:[-1,-63],hip:[-4,-35],a:[[24,-49],[30,-50]],b:[[4,-51],[17,-50]],l:[[15,-18],[25,0]],r:[[-22,-19],[-30,0]]},
  clapre: {h:[7,-78],s:[3,-62],hip:[-3,-34],a:[[26,-43],[36,-39]],b:[[11,-60],[28,-66]],l:[[19,-18],[28,0]],r:[[-22,-19],[-30,0]]},
  clapseparate: {h:[2,-78],s:[-2,-63],hip:[-4,-35],a:[[21,-46],[27,-56]],b:[[-18,-49],[-15,-63]],l:[[14,-18],[24,0]],r:[[-21,-19],[-29,0]]},
  signre: {h:[0,-77],s:[-3,-62],hip:[-5,-34],a:[[21,-46],[20,-35]],b:[[-15,-48],[-13,-35]],l:[[12,-18],[22,0]],r:[[-22,-19],[-30,0]]},
  signsettle: {h:[1,-79],s:[-2,-64],hip:[-4,-35],a:[[16,-49],[12,-56]],b:[[-15,-48],[-4,-54]],l:[[12,-18],[22,0]],r:[[-21,-19],[-29,0]]},
  bowdraw: {h:[-3,-80],s:[-4,-65],hip:[-5,-36],a:[[16,-50],[32,-39]],b:[[-22,-57],[-9,-60]],l:[[13,-19],[24,0]],r:[[-24,-19],[-34,0]]},
  bowre: {h:[2,-79],s:[-1,-64],hip:[-4,-35],a:[[23,-45],[29,-29]],b:[[-23,-54],[-31,-62]],l:[[16,-18],[26,0]],r:[[-24,-19],[-33,0]]},
  bowsettle: {h:[0,-79],s:[-3,-64],hip:[-4,-35],a:[[17,-49],[26,-52]],b:[[-21,-49],[-21,-60]],l:[[13,-18],[23,0]],r:[[-22,-19],[-30,0]]},
  throwre: {h:[14,-74],s:[12,-58],hip:[1,-32],a:[[29,-39],[22,-28]],b:[[-11,-47],[-21,-57]],l:[[24,-16],[34,0]],r:[[-21,-19],[-31,0]]},
  throwsettle: {h:[5,-77],s:[2,-62],hip:[-3,-34],a:[[19,-44],[27,-41]],b:[[-16,-48],[-5,-58]],l:[[17,-18],[26,0]],r:[[-22,-19],[-30,0]]},
  hitrecover: {h:[-8,-73],s:[-8,-58],hip:[-3,-32],a:[[9,-43],[18,-49]],b:[[-25,-44],[-24,-54]],l:[[18,-16],[27,0]],r:[[-21,-18],[-29,0]]},
  launch: {h:[-18,-73],s:[-15,-57],hip:[0,-32],a:[[5,-40],[20,-48]],b:[[-32,-42],[-40,-53]],l:[[22,-29],[32,-10]],r:[[-14,-20],[-30,-26]]},
  airarch: {h:[-32,-66],tilt:-.65,s:[-17,-55],hip:[12,-32],a:[[5,-65],[17,-83]],b:[[-37,-38],[-48,-52]],l:[[34,-48],[48,-29]],r:[[-7,-9],[-22,-1]]},
  aircrest: {h:[8,-55],tilt:.55,s:[-4,-46],hip:[-8,-24],a:[[25,-43],[25,-26]],b:[[3,-58],[18,-51]],l:[[23,-50],[31,-30]],r:[[-7,-44],[8,-34]]},
  fall: {h:[11,-62],tilt:.35,s:[0,-50],hip:[-14,-31],a:[[27,-35],[40,-17]],b:[[-8,-30],[-1,-13]],l:[[-1,-20],[9,-1]],r:[[-34,-31],[-38,-12]]},
  fallbrace: {h:[20,-46],tilt:.55,s:[9,-34],hip:[-10,-22],a:[[30,-22],[38,-5]],b:[[10,-14],[17,-3]],l:[[-6,-13],[0,-1]],r:[[-31,-16],[-40,-3]]},
  // Composed curled bodies, raster-rotated only for their horizontal ground contact.
  collapse: {h:[3,-58],s:[-3,-43],hip:[3,-18],a:[[16,-32],[29,-44]],b:[[-18,-30],[-26,-41]],l:[[20,-21],[30,-2]],r:[[-10,-10],[-19,0]]},
  down: {h:[0,-76],s:[-2,-60],hip:[0,-32],a:[[9,-48],[7,-62]],b:[[-13,-43],[-18,-29]],l:[[5,-15],[10,0]],r:[[-8,-18],[-3,-1]]},
  rise1: {h:[-18,-47],s:[-15,-32],hip:[1,-20],a:[[9,-18],[17,-10]],b:[[-27,-20],[-35,-8]],l:[[23,-12],[35,0]],r:[[-8,-9],[-18,0]]},
  rise2: {h:[-7,-64],s:[-8,-48],hip:[-3,-26],a:[[12,-32],[25,-40]],b:[[-23,-32],[-19,-42]],l:[[21,-13],[31,0]],r:[[-22,-13],[-32,0]]},
};
const PX_KITS = [
  {fit:'coat',sl:2,width:9,hair:'sweep',scarf:true,skin:['#986c75','#d49b98','#f6cbc0'],top:['#17253f','#2c4366','#536b8d'],pants:['#141f32','#29354b','#48546b'],hairCol:['#8294ae','#c3d1de','#edf0dc'],accent:'#75d9e8',inner:'#e8d7be'},
  {fit:'gi',sl:1,width:11,hair:'crest',wraps:true,skin:['#85544f','#bd8466','#e5b18b'],top:['#491f35','#8b344d','#be5964'],pants:['#241c30','#403043','#6b4651'],hairCol:['#2c1d30','#603044','#9e4b52'],accent:'#ffab83',inner:'#f5d7af'},
  {fit:'jacket',sl:1,width:12,bulk:1.08,hair:'flat',brace:true,skin:['#563d43','#8b5b47','#bd8861'],top:['#71532c','#bd8d3d','#eed080'],pants:['#1c2d39','#344b58','#647278'],hairCol:['#151e27','#2e3440','#4f5156'],accent:'#f4d988',inner:'#273644'},
  {fit:'hood',sl:2,width:9,height:.94,hair:'bob',charm:true,skin:['#916b6d','#c39b85','#eac5a0'],top:['#2d284c','#51456f','#827398'],pants:['#1e2338','#37354f','#5d526a'],hairCol:['#121b2a','#2b2d40','#494055'],accent:'#b7a0ed',inner:'#2d284c'},
  {fit:'vest',sl:0,width:14,bulk:1.13,hair:'buzz',goggles:true,beard:true,gauntlet:true,skin:['#775a4f','#ad8766','#d7b082'],top:['#283c39','#536c53','#8a9b6b'],pants:['#242d30','#424d46','#6a7462'],hairCol:['#625f61','#9d9a8e','#c8c5a8'],accent:'#f6bd70',inner:'#c2b58c'},
  {fit:'coat',sl:2,width:9,hair:'braid',vials:true,skin:['#a36c7a','#d49aa1','#f0c6bb'],top:['#4a253e','#8e3c55','#c66575'],pants:['#281f36','#483047','#6c485b'],hairCol:['#9f909b','#dad0ce','#f2e9d8'],accent:'#ff8c99',inner:'#382e44'},
  {fit:'jacket',sl:2,width:10,hair:'part',phones:true,skin:['#9d7372','#c99f86','#efd1a8'],top:['#2d3d38','#586b52','#91a17c'],pants:['#232e32','#3a4949','#68746a'],hairCol:['#8c8474','#c1b596','#eee0b8'],accent:'#b6e69a',inner:'#e9d9b2'},
  {fit:'apron',sl:1,width:9,height:.95,hair:'bun',hammer:true,skin:['#956a68','#c8967a','#edbf99'],top:['#283b50','#4a6379','#819ca2'],pants:['#262c39','#454655','#6e6671'],hairCol:['#603c39','#a66846','#dba265'],accent:'#eac186',inner:'#ba966d'},
  {fit:'coat',sl:2,width:11,hair:'tail',clock:true,skin:['#926e57','#c69b70','#ecc390'],top:['#78502f','#bd9046','#e5c578'],pants:['#332f30','#554739','#8b7251'],hairCol:['#2c2930','#554034','#8c6240'],accent:'#fff0b3',inner:'#463a37'},
  {fit:'robe',sl:2,width:12,hair:'long',brace:true,skin:['#875750','#be8768','#e1b08c'],top:['#23443f','#3f7a60','#86b68a'],pants:['#1e2b38','#344757','#617381'],hairCol:['#182936','#314858','#557181'],accent:'#b5edb9',inner:'#e9dcba'},
  {fit:'jacket',sl:2,width:11,hair:'hawk',gauntlet:true,goggles:true,skin:['#946b5f','#c89b7a','#edc59c'],top:['#252c39','#474b54','#77736a'],pants:['#222b37','#3c4652','#606c72'],hairCol:['#241f2c','#45323b','#785245'],accent:'#f7aa63',inner:'#d7874e'},
  {fit:'vest',sl:0,width:9,height:.96,hair:'round',scarf:true,wraps:true,skin:['#aa7d85','#d9b1ad','#f4d8bc'],top:['#807b99','#b8b2ca','#e8dfdf'],pants:['#352b4c','#634365','#95697f'],hairCol:['#293e76','#4b71a4','#8cb1ca'],accent:'#ee97bf',inner:'#635074'},
  {fit:'vest',sl:0,width:10,height:.96,hair:'topknot',shorts:true,wraps:true,skin:['#62474a','#9b6a4e','#c99469'],top:['#1f4b4c','#377d70','#7db197'],pants:['#202f3b','#3f5660','#6c8185'],hairCol:['#23232e','#4b3834','#795343'],accent:'#afdbc4',inner:'#d8cb9e'},
  {fit:'robe',sl:2,width:10,hair:'tail',scarf:true,brace:true,skin:['#a07878','#cfa99a','#eaceb0'],top:['#22444f','#3d7580','#7cb7b5'],pants:['#1b2a3e','#334458','#5f6d7c'],hairCol:['#17202c','#2e3944','#4c5861'],accent:'#b6e7e5',inner:'#a6c7bc'},
  {fit:'vest',sl:0,width:15,bulk:1.2,hair:'bald',beard:true,wraps:true,skin:['#7b6556','#ae9871','#d8c79a'],top:['#334832','#647d44','#a2ab64'],pants:['#352e3b','#5a4650','#8a6e65'],hairCol:['#3a2d35','#624438','#9e7051'],accent:'#d9df87',inner:'#50533a'},
];
// Individually composed idle silhouettes. Poses and visible builds never alter sim.js collision geometry.
const PX_IDLES = [
  {h:[1,-82],s:[-2,-66],hip:[-5,-36],a:[[17,-56],[31,-58]],b:[[-17,-48],[-8,-43]],l:[[11,-19],[20,0]],r:[[-15,-20],[-20,0]]},
  {h:[2,-72],s:[-2,-57],hip:[-3,-29],a:[[20,-44],[29,-55]],b:[[-24,-45],[-22,-60]],l:[[22,-16],[36,0]],r:[[-25,-16],[-36,0]]},
  {h:[-3,-79],s:[-5,-62],hip:[-3,-35],a:[[20,-47],[16,-61]],b:[[-19,-48],[9,-66]],l:[[18,-19],[30,0]],r:[[-21,-20],[-29,0]]},
  {h:[-5,-80],s:[-6,-64],hip:[-4,-33],a:[[12,-50],[8,-62]],b:[[-12,-50],[10,-63]],l:[[8,-18],[15,0]],r:[[-10,-18],[-16,0]]},
  {h:[-7,-73],s:[-10,-57],hip:[-7,-30],a:[[12,-43],[28,-42]],b:[[-28,-43],[-26,-32]],l:[[23,-17],[36,0]],r:[[-27,-17],[-37,0]]},
  {h:[7,-83],s:[4,-67],hip:[-4,-37],a:[[21,-55],[29,-74]],b:[[-17,-50],[-18,-33]],l:[[10,-20],[18,0]],r:[[-12,-20],[-16,0]]},
  {h:[-5,-80],s:[-7,-64],hip:[-4,-34],a:[[13,-56],[8,-77]],b:[[-14,-48],[4,-43]],l:[[12,-19],[23,0]],r:[[-16,-19],[-24,0]]},
  {h:[2,-81],s:[0,-65],hip:[-3,-35],a:[[19,-47],[18,-61]],b:[[-18,-48],[-14,-36]],l:[[9,-20],[16,0]],r:[[-17,-19],[-25,0]]},
  {h:[6,-83],s:[4,-67],hip:[0,-38],a:[[21,-50],[20,-56]],b:[[-14,-51],[3,-63]],l:[[5,-21],[12,0]],r:[[-14,-21],[-21,0]]},
  {h:[-9,-77],s:[-10,-61],hip:[-4,-33],a:[[13,-52],[20,-72]],b:[[-5,-47],[12,-53]],l:[[18,-18],[29,0]],r:[[-20,-19],[-29,0]]},
  {h:[15,-73],s:[10,-58],hip:[0,-31],a:[[29,-44],[40,-43]],b:[[-7,-44],[-17,-58]],l:[[22,-17],[36,0]],r:[[-18,-18],[-27,0]]},
  {h:[-9,-81],s:[-11,-64],hip:[-4,-35],a:[[8,-56],[9,-77]],b:[[-27,-48],[-31,-35]],l:[[12,-20],[22,0]],r:[[-13,-18],[-20,0]]},
  {h:[1,-77],s:[0,-60],hip:[-3,-31],a:[[18,-44],[21,-47]],b:[[-18,-43],[-14,-52]],l:[[17,-16],[28,0]],r:[[-17,-17],[-26,0]]},
  {h:[-1,-83],s:[-4,-67],hip:[-5,-37],a:[[14,-49],[23,-38]],b:[[-17,-51],[-1,-63]],l:[[10,-21],[22,0]],r:[[-19,-20],[-29,0]]},
  {h:[-7,-74],s:[-9,-56],hip:[-5,-27],a:[[17,-39],[27,-25]],b:[[-30,-40],[-33,-28]],l:[[21,-14],[35,0]],r:[[-29,-14],[-39,0]]},
];
const PX_BUILDS = [
  {height:1.04,width:8,bulk:.88},{height:1,width:12,bulk:1.06},{height:1.04,width:13,bulk:1.25},
  {height:.91,width:8,bulk:.84},{height:1.08,width:16,bulk:1.4,belly:17},{height:1.06,width:8,bulk:.82},
  {height:.96,width:10,bulk:.94},{height:.94,width:9,bulk:.94},{height:1.07,width:10,bulk:.98},
  {height:1.02,width:12,bulk:1.15},{height:.99,width:11,bulk:1.15},{height:1,width:8,bulk:.82},
  {height:.9,width:10,bulk:1.08},{height:1.09,width:9,bulk:.88},{height:1.02,width:17,bulk:1.5,belly:20,sl:1,limbDetail:true},
];
PX_KITS.forEach((kit,n)=>Object.assign(kit,PX_BUILDS[n]));
function pixelSprite(ch, pose = 'idle', alt = false, flash = '') {
  const kit = PX_KITS[ch] || PX_KITS[0];
  let p = PX_POSES[pose] || PX_POSES.idle;
  if(pose==='idle' || pose==='breathe') {
    p=PX_IDLES[ch];
    if(pose==='breathe') {
      const shift=point=>[point[0],point[1]+1];
      p={h:shift(p.h),s:shift(p.s),hip:shift(p.hip),a:p.a.map(shift),b:p.b.map(shift),l:[shift(p.l[0]),p.l[1]],r:[shift(p.r[0]),p.r[1]]};
    }
  }
  if(kit.hammer && pose==='win') p=Object.assign({},p,{a:[[14,-70],[9,-82]]});
  // Tilt the face, hair and accessories together around the authored head center.
  // Transform geometry before the integer raster; never resample a rotated sprite.
  let headPart=false;
  const cosine=Math.cos(p.tilt||0),sine=Math.sin(p.tilt||0);
  const s = new PixelSurface(PX_W, PX_H), at = v => {
    if(headPart && p.tilt) {
      const dx=v[0]-p.h[0],dy=v[1]-p.h[1];
      v=[p.h[0]+dx*cosine-dy*sine,p.h[1]+dx*sine+dy*cosine];
    }
    return [PX_OX+v[0], PX_OY+v[1]*(kit.height||1)];
  };
  const top = alt ? ['#655e7c','#b2a8bf','#e8dfde'] : kit.top;
  const pant = alt ? ['#3a3658','#655e7e','#9a91ab'] : kit.pants;
  const skin = kit.skin, hair = kit.hairCol, ac = alt ? '#efb2c7' : kit.accent, w = kit.width;
  const poly = (pts,col,edge=PX_INK) => s.poly(pts.map(at),col,edge);
  const line = (a,b,col,width=1) => s.line(at(a),at(b),col,width);
  const rect = (x,y,r,h,col) => headPart && p.tilt ? poly([[x,y],[x+r,y],[x+r,y+h],[x,y+h]],col,null) : s.rect(PX_OX+x,PX_OY+y*(kit.height||1),r,h*(kit.height||1),col);
  const oval = (a,rx,ry,col) => headPart && p.tilt ? poly(Array.from({length:20},(_,n)=>[a[0]+Math.cos(n*Math.PI/10)*rx,a[1]+Math.sin(n*Math.PI/10)*ry]),col,null) : s.ellipse(...at(a),rx,ry*(kit.height||1),col);
  function limb(a,b,width,colors,far=false) {
    width*=kit.bulk||1;
    line(a,b,PX_INK,width+2); line(a,b,colors[far?0:1],width);
    if(!far) line([a[0]-1,a[1]-1],[b[0]-1,b[1]-1],colors[2],Math.max(1,width-5));
  }
  function shoe(foot,far) {
    const [x,y]=foot;
    poly([[x-5,y-6],[x+3,y-6],[x+5,y-3],[x+10,y-2],[x+10,y],[x-6,y]],far?pant[0]:pant[1]);
    rect(x-5,y-1,15,1,far?top[0]:hair[0]); rect(x+4,y-3,4,1,far?pant[1]:pant[2]);
  }
  // Greta's larger forearms need a proportionate fist and a distinct wrist break.
  function heavyHand(elbow,hand,far) {
    const dx=hand[0]-elbow[0],dy=hand[1]-elbow[1],len=Math.hypot(dx,dy)||1,u=[dx/len,dy/len],v=[-u[1],u[0]];
    const band=(distance,half,col,thickness)=>{
      const c=[hand[0]-u[0]*distance,hand[1]-u[1]*distance];
      line([c[0]-v[0]*half,c[1]-v[1]*half],[c[0]+v[0]*half,c[1]+v[1]*half],col,thickness);
    };
    band(9,6,PX_INK,5);band(9,5,kit.inner,3);band(10,5,far?top[0]:top[2]);
    oval(hand,8,6,PX_INK);oval(hand,7,5,skin[far?0:1]);
    line([hand[0]-4,hand[1]-2],[hand[0]+3,hand[1]-2],skin[far?1:2],2);
    line([hand[0]-3,hand[1]+1],[hand[0]+2,hand[1]+1],skin[0]);
    line([hand[0]-5,hand[1]+1],[hand[0]-3,hand[1]+3],PX_INK);
    // Sleeve hem at the elbow separates the fabric from the bare forearm.
    line([elbow[0]-v[0]*6,elbow[1]-v[1]*6],[elbow[0]+v[0]*6,elbow[1]+v[1]*6],far?top[1]:top[2],2);
  }
  function kneeDetail(knee,far) {
    poly([[knee[0]-5,knee[1]-3],[knee[0]+4,knee[1]-2],[knee[0]+5,knee[1]+2],[knee[0]-3,knee[1]+3]],far?pant[1]:pant[2],null);
    line([knee[0]-4,knee[1]+3],[knee[0]+3,knee[1]+2],pant[0]);
  }
  const hip=p.hip, shoulder=p.s, head=p.h;
  // Far limbs are darker; near limbs get one narrow upper-left highlight cluster.
  // Keep the thick calf contour inside the boot instead of below the walking sole.
  const ankle=foot=>[foot[0],foot[1]-(/^(walk|back)[0-7]$/.test(pose)||pose.startsWith('win')?Math.ceil((9*(kit.bulk||1)+2)/2):4)];
  limb([hip[0]-4,hip[1]],p.r[0],12,pant,true); limb(p.r[0],ankle(p.r[1]),9,kit.shorts?skin:pant,true); shoe(p.r[1],true);
  if(kit.limbDetail)kneeDetail(p.r[0],true);
  limb([shoulder[0]-w*.65,shoulder[1]+2],p.b[0],9,kit.sl?top:skin,true); limb(p.b[0],p.b[1],7,kit.sl===2?top:skin,true);
  oval(p.b[1],4,4,PX_INK); oval(p.b[1],3,3,skin[0]);
  if(kit.limbDetail)heavyHand(p.b[0],p.b[1],true);
  // Hair behind the neck, with a stepped wind-blown shape instead of fine single-pixel noise.
  headPart=true;
  if(['sweep','braid','tail','long'].includes(kit.hair)) {
    poly([[head[0]-10,head[1]-8],[head[0]+2,head[1]-10],[head[0]+6,head[1]+5],[head[0]-1,head[1]+21],[head[0]-12,head[1]+17],[head[0]-8,head[1]+5]],hair[0]);
    if(kit.hair==='braid' || kit.hair==='tail') for(let n=0;n<6;n++) {oval([head[0]-10-n,head[1]+9+n*4],3,3,hair[n%2]);if(n===5)rect(head[0]-18,head[1]+30,5,3,ac);}
  }
  if(kit.fit==='hood') {oval([head[0]-2,head[1]+5],14,19,PX_INK);oval([head[0]-2,head[1]+5],12,17,top[0]);line([head[0]-11,head[1]-5],[head[0]-12,head[1]+14],top[2],2);}
  headPart=false;
  limb([hip[0]+5,hip[1]],p.l[0],12,pant); limb(p.l[0],ankle(p.l[1]),9,kit.shorts?skin:pant); shoe(p.l[1],false);
  if(kit.limbDetail)kneeDetail(p.l[0],false);
  // Torso: fitted long coat, inset warm ivory front, offset cyan clasp.
  const belly=kit.belly||w,mid=(shoulder[1]+hip[1])/2;
  poly([[shoulder[0]-w,shoulder[1]],[shoulder[0]+w,shoulder[1]-1],[hip[0]+belly,mid],[hip[0]+w,hip[1]+4],[hip[0]-w,hip[1]+4],[hip[0]-belly,mid]],top[1]);
  poly([[shoulder[0]-w+1,shoulder[1]+1],[shoulder[0]-3,shoulder[1]+2],[hip[0]-3,hip[1]+3],[hip[0]-w+1,hip[1]+3]],top[0],null);
  poly([[shoulder[0]+2,shoulder[1]+2],[shoulder[0]+7,shoulder[1]+1],[hip[0]+4,hip[1]-4],[hip[0],hip[1]-4]],kit.inner,null);
  line([shoulder[0]-7,shoulder[1]+1],[hip[0]-6,hip[1]-2],top[2]);
  line([shoulder[0]+w-1,shoulder[1]+2],[hip[0]+w-1,hip[1]+1],top[2]);
  if(kit.fit==='coat' || kit.fit==='robe' || kit.fit==='gi') {
    const tail=kit.fit==='coat'?24:kit.fit==='robe'?18:10;
    poly([[hip[0]-w,hip[1]-2],[hip[0]+1,hip[1]],[hip[0]-1,hip[1]+tail-4],[hip[0]-17,hip[1]+tail],[hip[0]-12,hip[1]+10]],top[0]);
    poly([[hip[0]+2,hip[1]],[hip[0]+w,hip[1]-2],[hip[0]+16,hip[1]+tail-6],[hip[0]+4,hip[1]+tail-9]],top[1]);
    line([hip[0]-15,hip[1]+tail-3],[hip[0]-3,hip[1]+tail-7],ac);
  }
  if(kit.fit==='gi' || kit.fit==='robe') {poly([[shoulder[0]-7,shoulder[1]],[shoulder[0]-3,shoulder[1]+8],[hip[0]+6,hip[1]-2],[hip[0]+9,hip[1]-6]],top[2]);}
  if(kit.fit==='apron') {poly([[shoulder[0]-3,shoulder[1]+7],[shoulder[0]+7,shoulder[1]+7],[hip[0]+10,hip[1]+21],[hip[0]-8,hip[1]+21]],kit.inner);rect(hip[0]-3,hip[1]+6,9,8,top[0]);}
  if(kit.fit==='vest') {line([shoulder[0]-6,shoulder[1]+1],[hip[0]-4,hip[1]-6],top[2],2);line([shoulder[0]+6,shoulder[1]+1],[hip[0]+4,hip[1]-6],top[2],2);}
  rect(hip[0]-8,hip[1]-3,17,3,PX_INK); rect(hip[0]+2,hip[1]-3,4,3,ac);
  if(kit.vials) for(let n=0;n<3;n++) {rect(hip[0]-10+n*4,hip[1]+2,3,8,PX_INK);rect(hip[0]-9+n*4,hip[1]+3,1,5,ac);}
  if(kit.clock || kit.charm) {const med=[shoulder[0]+3,shoulder[1]+17];line([shoulder[0]-4,shoulder[1]+4],med,ac);oval(med,4,5,PX_INK);oval(med,3,4,ac);line(med,[med[0]+1,med[1]-3],top[0]);}
  // Face: asymmetric brow, warm nose plane, a two-pixel eye and no borrowed mask or facial marking.
  headPart=true;
  rect(head[0]-2,head[1]+7,6,8,skin[0]); rect(head[0],head[1]+7,4,6,skin[1]);
  poly([[head[0]-7,head[1]-7],[head[0]+5,head[1]-8],[head[0]+9,head[1]-3],[head[0]+9,head[1]+2],[head[0]+12,head[1]+4],[head[0]+8,head[1]+6],[head[0]+6,head[1]+10],[head[0]-2,head[1]+10],[head[0]-7,head[1]+5]],skin[1]);
  poly([[head[0]+1,head[1]-5],[head[0]+7,head[1]-4],[head[0]+7,head[1]+2],[head[0]+10,head[1]+4],[head[0]+5,head[1]+6],[head[0]+2,head[1]+5]],skin[2],null);
  rect(head[0]+3,head[1]-1,5,1,PX_INK); rect(head[0]+4,head[1],4,2,PX_LIGHT); rect(head[0]+6,head[1],2,2,ac); rect(head[0]+7,head[1],1,2,PX_INK);
  rect(head[0]+5,head[1]+7,3,1,skin[0]);
  if(p.voice) {rect(head[0]+6,head[1]+5,5,4,PX_INK);rect(head[0]+6,head[1]+5,4,1,PX_LIGHT);}
  const hx=head[0],hy=head[1];
  const shapes={
    sweep:[[-9,1],[-10,-8],[-5,-12],[5,-12],[11,-8],[6,-5],[-2,-4],[-5,8]],
    crest:[[-8,2],[-10,-8],[-7,-15],[-1,-13],[2,-17],[6,-11],[8,-6],[0,-4],[-4,4]],
    flat:[[-8,5],[-10,-11],[-6,-14],[6,-14],[9,-11],[7,-5],[-2,-5],[-3,4]],
    bob:[[-10,10],[-10,-7],[-5,-12],[5,-12],[9,-7],[6,-2],[0,-4],[-1,11]],
    buzz:[[-8,2],[-9,-7],[-5,-10],[5,-10],[8,-6],[0,-6],[-4,-2]],
    braid:[[-8,5],[-10,-6],[-5,-12],[7,-11],[10,-7],[4,-5],[-2,-3],[-4,6]],
    part:[[-9,6],[-10,-6],[-4,-12],[6,-11],[11,-6],[4,-5],[1,-8],[-3,-1],[-4,6]],
    bun:[[-10,10],[-11,-6],[-5,-12],[6,-11],[8,-6],[2,-2],[-2,-2],[-2,9]],
    tail:[[-9,2],[-11,-6],[-7,-12],[3,-14],[8,-10],[8,-6],[1,-5],[-5,5]],
    long:[[-10,14],[-11,-5],[-6,-12],[5,-13],[9,-8],[5,-6],[-2,-5],[-3,14]],
    hawk:[[-8,2],[-8,-7],[-3,-9],[-1,-17],[4,-14],[7,-7],[5,-4],[-2,-4]],
    round:[[-10,9],[-12,0],[-10,-9],[-4,-13],[6,-12],[11,-6],[5,-4],[-2,-3],[-2,10]],
    topknot:[[-8,5],[-9,-6],[-4,-11],[4,-11],[8,-7],[4,-4],[-1,-4],[-3,5]],
    bald:[[-9,3],[-9,-4],[-6,-7],[-4,-5],[-5,4]],
  };
  poly((shapes[kit.hair]||shapes.sweep).map(([x,y])=>[hx+x,hy+y]),hair[1]);
  if(kit.hair!=='bald') {line([hx-6,hy-8],[hx+2,hy-10],hair[2],2);line([hx-7,hy-6],[hx-6,hy+1],hair[0]);}
  if(kit.hair==='bun' || kit.hair==='topknot') {oval([hx-8,hy-14],5,4,PX_INK);oval([hx-8,hy-14],4,3,hair[1]);line([hx-12,hy-12],[hx-7,hy-12],ac,2);}
  if(kit.beard) {poly([[hx-4,hy+6],[hx+5,hy+8],[hx+9,hy+5],[hx+7,hy+12],[hx-2,hy+12]],hair[0]);line([hx,hy+10],[hx+5,hy+10],hair[1]);}
  if(kit.goggles) {rect(hx-6,hy-2,16,5,PX_INK);rect(hx-3,hy-1,4,2,ac);rect(hx+4,hy-1,5,2,ac);}
  if(kit.phones) {line([hx-9,hy+1],[hx-9,hy-10],top[2],3);line([hx-9,hy-10],[hx+7,hy-10],PX_INK,3);oval([hx-7,hy+2],4,6,PX_INK);oval([hx-7,hy+2],2,4,ac);}
  headPart=false;
  // High collar and an angular scarf tail identify Isolde at a distance.
  poly([[shoulder[0]-7,shoulder[1]-2],[head[0]-3,head[1]+10],[head[0]+5,head[1]+10],[shoulder[0]+8,shoulder[1]-3],[shoulder[0]+3,shoulder[1]+3]],top[0]);
  line([shoulder[0]-3,shoulder[1]],[shoulder[0]+6,shoulder[1]-3],ac,2);
  if(kit.scarf) poly([[shoulder[0]-5,shoulder[1]],[shoulder[0]-21,shoulder[1]+5],[shoulder[0]-29,shoulder[1]+1],[shoulder[0]-16,shoulder[1]+10],[shoulder[0]-5,shoulder[1]+3]],ac);
  limb([shoulder[0]+w*.65,shoulder[1]+3],p.a[0],10,kit.sl?top:skin); limb(p.a[0],p.a[1],8,kit.sl===2?top:skin);
  const hand=p.a[1]; oval(hand,5,4,PX_INK); oval(hand,4,3,skin[1]); rect(hand[0]-2,hand[1]-2,5,1,skin[2]);
  line([hand[0]-5,hand[1]+2],[hand[0]-2,hand[1]+4],ac,2);
  if(kit.wraps || kit.brace) for(let n=0;n<3;n++) line([hand[0]-7+n*2,hand[1]+1],[hand[0]-5+n*2,hand[1]+4],kit.wraps?kit.inner:ac);
  if(kit.limbDetail)heavyHand(p.a[0],hand,false);
  if(kit.gauntlet) {poly([[hand[0]-8,hand[1]-5],[hand[0]+2,hand[1]-6],[hand[0]+5,hand[1]],[hand[0]+1,hand[1]+6],[hand[0]-8,hand[1]+5]],top[2]);rect(hand[0]-6,hand[1]-3,6,2,ac);line([hand[0]-6,hand[1]+3],[hand[0],hand[1]+3],top[0]);}
  if(p.palm) {
    poly([[hand[0]-3,hand[1]+4],[hand[0]-4,hand[1]-3],[hand[0]-2,hand[1]-10],[hand[0]+1,hand[1]-11],[hand[0]+3,hand[1]-5],[hand[0]+6,hand[1]-3],[hand[0]+3,hand[1]+4]],skin[1]);
    line([hand[0]-1,hand[1]-8],[hand[0],hand[1]-2],skin[2],2);
    line([hand[0]+2,hand[1]-4],[hand[0]+2,hand[1]],skin[0]);
  }
  if(kit.hammer) {line([hand[0]+1,hand[1]+8],[hand[0]+1,hand[1]-14],PX_INK,4);line([hand[0]+1,hand[1]+7],[hand[0]+1,hand[1]-12],kit.inner,2);rect(hand[0]-5,hand[1]-18,14,7,PX_INK);rect(hand[0]-4,hand[1]-17,12,4,hair[0]);rect(hand[0]-4,hand[1]-17,12,1,hair[2]);}
  if (flash) {
    const color=pxRGB(flash);
    for(let i=0;i<s.data.length;i+=4) if(s.data[i+3]) {s.data[i]=color[0];s.data[i+1]=color[1];s.data[i+2]=color[2];}
  }
  return s;
}
const PX_SPRITES = new Map(), PX_CANVASES = new WeakMap();
const PX_FONT = {
  A:'01110/10001/10001/11111/10001/10001/10001', B:'11110/10001/10001/11110/10001/10001/11110', C:'01111/10000/10000/10000/10000/10000/01111',
  D:'11110/10001/10001/10001/10001/10001/11110', E:'11111/10000/10000/11110/10000/10000/11111', F:'11111/10000/10000/11110/10000/10000/10000',
  G:'01111/10000/10000/10111/10001/10001/01111', H:'10001/10001/10001/11111/10001/10001/10001', I:'111/010/010/010/010/010/111',
  J:'00111/00010/00010/00010/10010/10010/01100', K:'10001/10010/10100/11000/10100/10010/10001', L:'10000/10000/10000/10000/10000/10000/11111',
  M:'10001/11011/10101/10101/10001/10001/10001', N:'10001/11001/11001/10101/10011/10011/10001', O:'01110/10001/10001/10001/10001/10001/01110',
  P:'11110/10001/10001/11110/10000/10000/10000', Q:'01110/10001/10001/10001/10101/10010/01101', R:'11110/10001/10001/11110/10100/10010/10001',
  S:'01111/10000/10000/01110/00001/00001/11110', T:'11111/00100/00100/00100/00100/00100/00100', U:'10001/10001/10001/10001/10001/10001/01110',
  V:'10001/10001/10001/10001/10001/01010/00100', W:'10001/10001/10001/10101/10101/11011/10001', X:'10001/10001/01010/00100/01010/10001/10001',
  Y:'10001/10001/01010/00100/00100/00100/00100', Z:'11111/00001/00010/00100/01000/10000/11111',
  0:'01110/10001/10011/10101/11001/10001/01110',1:'010/110/010/010/010/010/111',2:'01110/10001/00001/00010/00100/01000/11111',
  3:'11110/00001/00001/01110/00001/00001/11110',4:'10010/10010/10010/11111/00010/00010/00010',5:'11111/10000/10000/11110/00001/00001/11110',
  6:'01110/10000/10000/11110/10001/10001/01110',7:'11111/00001/00010/00100/01000/01000/01000',8:'01110/10001/10001/01110/10001/10001/01110',
  9:'01110/10001/10001/01111/00001/00001/01110', '-':'000/000/000/111/000/000/000', '.':'0/0/0/0/0/1/1',
  ':':'0/1/1/0/1/1/0', '/':'00001/00001/00010/00100/01000/10000/10000', '!':'1/1/1/1/1/0/1', '?':'1110/0001/0001/0010/0100/0000/0100',
  '+':'000/010/010/111/010/010/000', '%':'10001/00010/00010/00100/01000/01000/10001', "'":'1/1/0/0/0/0/0',
  ',':'00/00/00/00/00/01/10', '(':'01/10/10/10/10/10/01', ')':'10/01/01/01/01/01/10',
  '<':'001/010/100/010/001/000/000','>':'100/010/001/010/100/000/000',
  '←':'00000/00100/01000/11111/01000/00100/00000','→':'00000/00100/00010/11111/00010/00100/00000',
  '↑':'00100/01110/10101/00100/00100/00100/00000','↓':'00100/00100/00100/00100/10101/01110/00100',
};
function pxTextWidth(text,scale=1) { return [...String(text).toUpperCase()].reduce((n,ch)=>n+(ch===' '?4:((PX_FONT[ch]||PX_FONT['?']).split('/')[0].length+1))*scale,0)-scale; }
function pxText(s,text,x,y,col=PX_LIGHT,scale=1) {
  for(const ch of String(text).toUpperCase()) {
    if(ch===' ') {x+=4*scale;continue;}
    const rows=(PX_FONT[ch]||PX_FONT['?']).split('/');
    rows.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')s.rect(x+i*scale,y+j*scale,scale,scale,col);}));
    x+=(rows[0].length+1)*scale;
  }
}
function pxSprite(ch, pose, alt = false, flash = '') {
  const key = [ch,pose,alt,flash].join(':');
  if (!PX_SPRITES.has(key)) PX_SPRITES.set(key,pixelSprite(ch,pose,alt,flash));
  return PX_SPRITES.get(key);
}
function pxCanvas(surface) {
  if (!PX_CANVASES.has(surface)) {
    const cv=document.createElement('canvas'); cv.width=surface.w; cv.height=surface.h;
    const c=cv.getContext('2d'), image=c.createImageData(surface.w,surface.h); image.data.set(surface.data); c.putImageData(image,0,0);
    PX_CANVASES.set(surface,cv);
  }
  return PX_CANVASES.get(surface);
}
function pxPose(S,f) {
  if(f.portrait) return 'idle';
  if(f.st === 'atk') {
    const m=moveDef(f);
    if(!m)return f.y<GROUND?'jump':'ready';
    const pose=pxArtPose(m);
    const sequence=PX_ATTACKS[pose] || PX_ATTACKS.cast1;
    if(f.mt<m.su)return sequence[f.mt<Math.ceil(m.su/2)?0:1];
    // Arts fire at startup; only basics have a separate active window. Never imply idle during recovery.
    const contact=m.ac || Math.min(3,Math.ceil(m.re/3)),elapsed=f.mt-m.su;
    if(elapsed<contact)return pose in PX_POSES?pose:'cast1';
    const settle=m.ac ? m.ac+Math.ceil(m.re/2) : Math.ceil(m.re*.65);
    return sequence[elapsed<settle?2:3];
  }
  if(f.st === 'walk') return (f.vx*f.face<0?'back':'walk')+(Math.floor(f.walkT/3)%8);
  if(f.st === 'jump') return f.vy<-6?'jump':f.vy<4?'jumpcrest':f.y>GROUND-70?'jumpbrace':'jumpfall';
  if(f.st === 'block') return f.stT>7?'blockhit':f.stT>3?'blockre':'blocksettle';
  if(f.st === 'stun') return f.stT>45?'breakopen':f.stT>32?'breakfold':f.stT>18?'stun':f.stT>8?'stunbrace':'stunrise';
  if(f.st === 'down') return f.stT>28?'collapse':f.stT>12?'down':f.stT>6?'rise1':'rise2';
  if(f.st === 'ko') return f.y<GROUND ? pxAirHitPose(f) : 'down';
  if(f.st === 'hit') return f.y<GROUND ? pxAirHitPose(f) : f.stT>8?'hit':'hitrecover';
  if(f.st === 'cast') return pxDomainPose(S,f);
  if(f.st === 'idle' && f.y>=GROUND && f.hp>0 && S.winner===f.i && (S.phase==='ko' || S.phase==='over')) {
    if(S.phase==='over' || S.phaseT>=64)return 'winsettle';
    if(S.phaseT>=42)return 'win';
    if(S.phaseT>=30)return 'winraise';
    if(S.phaseT>=18)return 'winready';
  }
  if(f.st === 'idle') return Math.floor(S.t/22)%2 ? 'breathe' : 'idle';
  return PX_POSES[f.st] ? f.st : 'idle';
}
// Velocity is an existing active-physics clock: these poses hold during hit-stop and Domains.
function pxAirHitPose(f) { return f.vy < -7 ? 'launch' : f.vy < -2 ? 'airarch' : f.vy < 3 ? 'aircrest' : f.vy < 9 ? 'fall' : 'fallbrace'; }
function pxDomainPose(S,f) {
  const d=S.dom && S.dom.o===f.i ? S.dom : null,maximum=CH[f.ch].dom.maximum;
  // An expired/interrupted Domain must not borrow a new owner's clock.
  if(!d)return f.stT>10?'domsettle':'ready';
  const t=d.t;
  // Input-driven starts already execute Domain tick 1 before the cinematic freeze.
  if(t<=1 && S.freeze>0) {
    const phase=S.freeze>40?0:S.freeze>20?1:2;
    const load=d.k==='nuclear'||d.k==='bloodsweep'?'cannonload':d.k==='megaphone'?'speechload':d.k==='allout'?'hookload':'maxopen';
    return (maximum?['maxcoil','maxcharge',load]:['domgather','domseal','domopen'])[phase];
  }
  // Charge and release boundaries match the existing DOMAIN definitions. No new clocks/state.
  if(d.k==='nuclear' || d.k==='bloodsweep') {
    const fire=d.k==='nuclear'?72:40;
    return t<fire/2?'cannonw':t<fire?'cannonload':t<fire+5?'cannon':t<fire+13?'cannonre':'cannonsettle';
  }
  if(d.k==='megaphone')return t<12?'speechw':t<24?'speechload':t<29?'speech':t<42?'speechre':'speechsettle';
  if(d.k==='howitzer')return t<46?(f.vy<0?'ultleap':'ultdive'):t<51?'ultimpact':'cannonsettle';
  if(d.k==='allout')return t<12?'hookw':!d.done&&t<40?'hookload':t<40?'punch':t<48?'punchre':'ready';
  if(d.k==='ovation') {
    const phase=(t+13)%14;
    return t>77?'clapseparate':t>73?'clapre':t>71?'clap':phase<3?'clap':phase<7?'clapre':phase<11?'clapseparate':'clapload';
  }
  if(d.k==='effigy') {
    const next=[10,24,38,60].find(n=>t<=n+8);
    if(next===undefined)return 'throwsettle';
    return t<next-4?'throww':t<next?'wind':t<next+3?'throw':t<next+7?'throwre':'throwsettle';
  }
  if(d.k==='web' || d.k==='jce') {
    const last=d.k==='web'?62:56;
    if(t>last+7)return d.k==='web'?'clapseparate':'slashsettle';
    const phase=d.k==='web'?(t+10)%24:t%8;
    return d.k==='web'?(phase<3?'clap':phase<8?'clapre':phase<17?'clapseparate':'clapload'):t<8?'slashload':
      (phase<2&&t>0?'slash':phase<5&&t>0?'slashre':'slashload');
  }
  // These Domains allow movement again after the original twenty cast ticks.
  // Never cover an attack, interruption or guard with a persistent Domain drawing.
  return f.stT>14?(maximum?'maxopen':'domopen'):f.stT>7?'domhold':'domsettle';
}
function pxArtPose(m) {
  if(m.id==='dontmove' || m.id==='blastaway' || m.id==='crushed')return 'speech';
  return m.pose==='slashw'?'slash':m.pose;
}
// Startup pair, recoil, settle. All selection uses existing active simulation clocks.
const PX_ATTACKS = {
  punch:['wind','punchload','punchre','ready'],punch2:['wind','punchload','punch2re','ready'],
  hook:['hookw','hookload','hookre','ready'],kick:['kickw','kickload','kickre','kickplant'],
  jpunch:['jpunchw','jpunchload','jpunchre','jpunchsettle'],jkick:['jkickw','jkickload','jkickre','jkicksettle'],
  cast1:['castw','castload','castre','castsettle'],speech:['speechw','speechload','speechre','speechsettle'],
  clap:['clapw','clapload','clapre','clapseparate'],
  sign:['signw','sign','signre','signsettle'],throw:['throww','wind','throwre','throwsettle'],
  bow:['boww','bowdraw','bowre','bowsettle'],guard:['guard','guard','guard','guard'],
  slash:['slashw','slashload','slashre','slashsettle'],cannon:['cannonw','cannonload','cannonre','cannonsettle'],
  jump:['kickw','jump','jump','jump'],
};
const PX_GROUNDED = new WeakMap();
function pxFighterFrame(ch,pose,alt=false,flash='') {
  const source=pxSprite(ch,pose,alt,flash);
  if(pose!=='down' && pose!=='collapse')return {sprite:source,ox:PX_OX,oy:PX_OY};
  if(!PX_GROUNDED.has(source)) {
    const sprite=new PixelSurface(source.h,source.w);let bottom=0;
    for(let y=0;y<source.h;y++)for(let x=0;x<source.w;x++) {
      const p=(y*source.w+x)*4;if(!source.data[p+3])continue;
      const ry=source.w-1-x,q=(ry*sprite.w+y)*4;bottom=Math.max(bottom,ry);
      for(let n=0;n<4;n++)sprite.data[q+n]=source.data[p+n];
    }
    // Horizontal bodies are centered at the sim root instead of putting the head a body-length behind it.
    PX_GROUNDED.set(source,{sprite,ox:PX_OY-40,oy:bottom});
  }
  return PX_GROUNDED.get(source);
}
function pxDrawFighter(c,S,f,alpha=1) {
  const pose=pxPose(S,f), alt=f.portrait ? !!f.alt : f.i === 1 && S.f[0].ch === f.ch;
  const imp=!f.portrait && FX.impact && FX.impact.t < FX.impact.sil ? FX.impact : null;
  const flash=imp ? (imp.kind === 'black' ? f.i===imp.a ? '#f8edce' : '#ef5260' : PX_INK) : S.t-f.hurtT<4 ? '#fff0ca' : '';
  const {sprite:frame,ox,oy}=pxFighterFrame(f.ch,pose,alt,flash), scale=PX_SCALE*(f.big>0?1.3:1);
  c.save(); c.imageSmoothingEnabled=false; c.globalAlpha*=alpha;
  if(!f.portrait) {c.save();c.fillStyle='#111623';c.globalAlpha*=.35;c.fillRect(Math.round(f.x/2)*2-40,GROUND,80,6);c.restore();}
  if(f.inv>0 && S.t%4<2) c.globalAlpha*=.5;
  c.translate(Math.round(f.x/2)*2,Math.round(f.y/2)*2); c.scale(f.face,1);
  if(f.portrait) {c.translate(-4,156);}
  c.drawImage(pxCanvas(frame),-ox*scale,-oy*scale,frame.w*scale,frame.h*scale);
  c.restore();
}
