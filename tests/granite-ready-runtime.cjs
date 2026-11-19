// Reuse the actual HTML/DOM/main-loop harness initialization, without unrelated long suites.
const fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync(__dirname+'/runtime.cjs','utf8');
const context=Function('require','__dirname',harness.slice(0,harness.indexOf('vm.runInContext(`'))+'\nreturn context;')(require,__dirname);
vm.runInContext(`
const normalAI=aiInput,maximumPaintBase=pxPaintFighter;
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
// Granite Blast stays braced until the cannon beam has finished.
aiInput=()=>0;const granitePaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='granite')granitePaints.push({t:f.mt,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
const graniteCh=CH.findIndex(c=>c.arts.some(a=>a.id==='granite'));
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[graniteCh,graniteCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;granitePaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A1[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=100;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[1,8,'graniteready'],[8,12,'granitecoil'],[12,15,'graniteaim'],[15,18,'granitefire'],[18,31,'granitebrace'],[31,35,'granitewithdraw'],[35,41,'granitesettle']])
    assert(granitePaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Granite Blast missed '+pose);
  assert.equal(G.S.f[slot].hp,CH[graniteCh].hp);assert.equal(G.S.f[1-slot].hp,CH[graniteCh].hp-115);toMenu();
}
G.mode='guest';const graniteConn=mockConnection();netWire(graniteConn,'guest');graniteConn.events.open();G.pick=[graniteCh,graniteCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[1,'graniteready'],[7,'graniteready'],[8,'granitecoil'],[11,'granitecoil'],[12,'graniteaim'],[14,'graniteaim'],[15,'granitefire'],[17,'granitefire'],[18,'granitebrace'],[24,'granitebrace'],[29,'granitebrace'],[30,'granitebrace'],[31,'granitewithdraw'],[34,'granitewithdraw'],[35,'granitesettle'],[40,'granitesettle']]) {
  const snapshot=newMatch(graniteCh,graniteCh,143);snapshot.phase='fight';startMove(snapshot.f[owner],'a0');snapshot.f[owner].mt=mt;snapshot.ev=[];
  granitePaints.length=0;graniteConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(granitePaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Granite Blast coil/aim/fire/brace/withdraw through AI/local/host keys and thirty-two event-free guest snapshots');

`,context);
