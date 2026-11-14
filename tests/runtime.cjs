// Executes the real HTML script order and main loop with a memory canvas / small DOM shell.
// This is integration scripting, not a real-browser or human-play test.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const writePNG=require('./png.cjs'),root=path.join(__dirname,'..');
class Canvas {
  constructor(w=300,h=150){this.width=w;this.height=h;this.buffer=null;this.context=new Context(this);}
  getContext(){return this.context;}
  setAttribute(){}
  pixels(){if(!this.buffer||this.buffer.length!==this.width*this.height*4)this.buffer=new Uint8ClampedArray(this.width*this.height*4);return this.buffer;}
}
class Context {
  constructor(canvas){this.canvas=canvas;this.imageSmoothingEnabled=true;}
  save(){} restore(){}
  createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
  putImageData(image,x,y){const out=this.canvas.pixels();for(let j=0;j<image.height;j++)out.set(image.data.subarray(j*image.width*4,(j+1)*image.width*4),((y+j)*this.canvas.width+x)*4);}
  drawImage(image,x,y,w=image.width,h=image.height){
    const out=this.canvas.pixels(),src=image.pixels();
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){
      const a=(Math.floor(j*image.height/h)*image.width+Math.floor(i*image.width/w))*4,b=((y+j)*this.canvas.width+x+i)*4;
      if(src[a+3])for(let k=0;k<4;k++)out[b+k]=src[a+k];
    }
  }
}
const nodes=new Map(),events={};
const element=id=>({id,style:{setProperty(){}},children:[],_html:'',set innerHTML(value){this._html=value;this.children=[];},get innerHTML(){return this._html;},textContent:'',attributes:{},setAttribute(key,value){this.attributes[key]=value;},appendChild(child){this.children.push(child);}});
const cv=new Canvas(1280,720);nodes.set('cv',cv);
for(const id of ['title','select','online','pause','over'])nodes.set(id,element(id));
const document={visibilityState:'visible',getElementById(id){if(!nodes.has(id))nodes.set(id,element(id));return nodes.get(id);},querySelectorAll(){return ['title','select','online','pause','over'].map(id=>nodes.get(id));},createElement(tag){return tag==='canvas'?new Canvas():element(tag);},head:element('head')};
const context=vm.createContext({console,assert,document,window:{},setTimeout(){},requestAnimationFrame(){},addEventListener(name,fn){events[name]=fn;}});
context.events=events;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"?]+)\?v=(\d+)"><\/script>/g)];
assert.equal(scripts.length,10);assert.equal(new Set(scripts.map(m=>m[2])).size,1);
for(const m of scripts)vm.runInContext(fs.readFileSync(path.join(root,m[1]),'utf8'),context,{filename:m[1]});
vm.runInContext(`
assert.equal($('title').style.display,'flex');
pickMode('ai');assert.equal($('col0').children.length,15);assert.equal($('col1').children.length,15);
assert.equal($('stageChoices').children.length,3);
$('stageChoices').children[1].onclick();assert.equal(G.stage,'gallery');assert.equal($('stageChoices').children[1].attributes['aria-pressed'],'true');
assert($('selBasics').innerHTML.includes('Black Flash'));
startFight();for(let n=0;n<101;n++){step(G.S,[0,0]);G.S.ev.length=0;}
assert.equal(G.S.stage,'gallery');
frame(17);frame(34);
const key=code=>({code,repeat:false,preventDefault(){}});
events.keydown(key('KeyJ'));events.keyup(key('KeyJ'));frame(51);
assert.equal(G.S.f[0].move,'p1');
togglePause();assert.equal($('pause').style.display,'flex');togglePause();
FX.rings.push({x:10,y:10,r:20,vr:2,t:0,life:20,col:'#fff'});FX.shake=12;startFight();assert.equal(G.S.stage,'gallery');
assert.equal(FX.rings.length,0);assert.equal(FX.shake,0);
// Serialized host choice, guest menu restrictions, rematch and old-message fallback.
const sent=[],wire={};const conn={open:true,send(m){sent.push(JSON.parse(JSON.stringify(m)));},on(name,fn){wire[name]=fn;}};
G.running=false;netWire(conn,'host');wire.open();
$('stageChoices').children[2].onclick();assert.equal(sent.at(-1).stage,'observatory');
wire.data({t:'stage',stage:'gallery'});assert.equal(G.stage,'observatory','guest cannot change host stage');
startFight();const hostStart=sent.findLast(m=>m.t==='start');assert.equal(hostStart.stage,'observatory');
G.running=false;G.stage='courtyard';netWire(conn,'guest');wire.open();wire.data({t:'stage',stage:'gallery'});
assert.equal(G.stage,'gallery');assert($('stageChoices').children.every(b=>b.disabled));
wire.data(hostStart);assert.equal(G.S.stage,'observatory');newRound(G.S);assert.equal(G.S.stage,'observatory');
wire.data({t:'start',p:[0,1]});assert.equal(G.S.stage,'courtyard','old host message defaults safely');
wire.data({t:'stage',stage:'missing-stage'});assert.equal(G.stage,'courtyard');
G.stage='observatory';G.mode='local';startFight();
G.S.phase='fight';G.S.t=130;G.S.f[0].ch=0;G.S.f[1].ch=14;G.S.f[0].x=400;G.S.f[1].x=880;
frame(68);assert.equal(G.S.f[0].hp,1000);
console.log('PASS real script order, title, fighter/stage selection, start, input-to-frame, pause/resume, rematch, host/guest stage messages and composite canvas presentation');
`,context);
for(let i=3;i<cv.pixels().length;i+=4)assert.equal(cv.pixels()[i],255);
if(process.argv[2])writePNG(path.join(process.argv[2],process.argv[3]||'runtime-frame.png'),{w:cv.width,h:cv.height,data:cv.pixels()});
