// Reuse the actual HTML/DOM/main-loop harness initialization, without unrelated long suites.
const fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync(__dirname+'/runtime.cjs','utf8');
const context=Function('require','__dirname',harness.slice(0,harness.indexOf('vm.runInContext(`'))+'\nreturn context;')(require,__dirname);
vm.runInContext(`
const normalAI=aiInput,stonePaintBase=pxPaintFighter;
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
// Imbued Stone coils low and flicks along the original strand lane.
aiInput=()=>0;const stonePaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='stone')stonePaints.push({t:f.mt,pose:pxPose(S,f)});return stonePaintBase(s,S,f,impact);};
const stoneCh=CH.findIndex(c=>c.arts.some(a=>a.id==='stone'));
for(const mode of ['ai','local','host']) {
 G.mode=mode;G.pick=[stoneCh,stoneCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
 const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;stonePaints.length=0;
 const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A2[0];
 events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
 for(let n=1;n<=24;n++)frame(1000+n*17);
 for(const [a,b,pose] of [[1,4,'stonegather'],[4,8,'stonecoil'],[8,11,'stonetoss'],[11,14,'stonefollow'],[14,17,'stonepull'],[17,20,'stonesettle']])
  assert(stonePaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Imbued Stone missed '+pose);
 assert.equal(G.S.f[slot].hp,CH[stoneCh].hp);toMenu();
}
G.mode='guest';const stoneConn=mockConnection();netWire(stoneConn,'guest');stoneConn.events.open();G.pick=[stoneCh,stoneCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[2,'stonegather'],[3,'stonegather'],[4,'stonecoil'],[7,'stonecoil'],[8,'stonetoss'],[10,'stonetoss'],[11,'stonefollow'],[13,'stonefollow'],[14,'stonepull'],[16,'stonepull'],[17,'stonesettle'],[19,'stonesettle']]) {
 const snapshot=newMatch(stoneCh,stoneCh,161);snapshot.phase='fight';startMove(snapshot.f[owner],'a1');snapshot.f[owner].mt=mt;snapshot.ev=[];
 stonePaints.length=0;stoneConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
 assert(stonePaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=stonePaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();

console.log('PASS Imbued Stone through actual AI/local/host keyboard frames and 24 event-free guest snapshots');
`,context);
