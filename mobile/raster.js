'use strict';
// Mobile-only row fills and native-size blits. Preserve shared rounding,
// clipping and RGBA bytes; leave scaled copies unchanged. Word views follow
// backing byte arrays weakly, so transient surfaces are freed.
(() => {
  const views=new WeakMap(),colours=new Map();
  PixelSurface.prototype.rect=function(x,y,w,h,col) {
    const left=Math.max(0,Math.round(x)),right=Math.min(this.w,Math.round(x+w));
    const top=Math.max(0,Math.round(y)),bottom=Math.min(this.h,Math.round(y+h));
    if(!(right>left&&bottom>top))return;
    let pixels=views.get(this.data);
    if(!pixels){pixels=new Uint32Array(this.data.buffer,this.data.byteOffset,this.data.length/4);views.set(this.data,pixels);}
    let colour=colours.get(col);
    if(colour===undefined){
      // Reading the same four bytes as a native word works on either endian.
      colour=new Uint32Array(new Uint8ClampedArray(pxRGB(col)).buffer)[0];
      colours.set(col,colour);
    }
    for(let row=top*this.w;row<bottom*this.w;row+=this.w)pixels.fill(colour,row+left,row+right);
  };
  // Most stage, Domain, fighter and shake copies use native-size cells.
  // Copy words in their existing traversal order; alpha zero skips a pixel,
  // any other alpha replaces all four bytes, exactly as the shared blitter.
  const scaledBlit=PixelSurface.prototype.blit;
  const alphaMask=new Uint32Array(new Uint8Array([0,0,0,255]).buffer)[0];
  function words(data) {
    let pixels=views.get(data);
    if(!pixels){pixels=new Uint32Array(data.buffer,data.byteOffset,data.length/4);views.set(data,pixels);}
    return pixels;
  }
  PixelSurface.prototype.blit=function(src,x,y,scale=1,flip=false) {
    if(scale!==1||((src.data.byteOffset|this.data.byteOffset|src.data.length|this.data.length)&3)!==0)
      return scaledBlit.call(this,src,x,y,scale,flip);
    x=Math.round(x);y=Math.round(y);
    const left=Math.max(0,-x),right=Math.min(src.w,this.w-x);
    const top=Math.max(0,-y),bottom=Math.min(src.h,this.h-y);
    if(!(right>left&&bottom>top))return;
    const source=words(src.data),target=words(this.data),step=flip?-1:1;
    for(let j=top;j<bottom;j++) {
      let p=j*src.w+(flip?src.w-1-left:left),q=(y+j)*this.w+x+left;
      for(let i=left;i<right;i++,p+=step,q++) {
        const colour=source[p];if(colour&alphaMask)target[q]=colour;
      }
    }
  };
})();
