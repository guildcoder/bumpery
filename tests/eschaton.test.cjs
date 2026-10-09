const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game,routes,sample,STEP}=require('../extension/eschaton-physics.js');
const play=()=>{const g=new Game();g.start();g.launch();return g;};
const tick=(g,t)=>{for(let i=0;i<Math.ceil(t/STEP);i++)g.step();};
test('upward shots enter each ramp, gain height, and return with one reward',()=>{
 for(let i=0;i<3;i++){const g=play();g.bankCount=1;const [x,y]=routes[i].points[0];g.ball={x,y:y+15,vx:0,vy:-500,r:10};g.step();assert.equal(g.ball.route.index,i);tick(g,routes[i].duration/2);assert.ok(g.ball.z>.4);tick(g,routes[i].duration/2+.05);assert.equal(g.ball.route,undefined);assert.equal(g.rampCounts[i],1);assert.equal(g.rampLights[i],true);assert.equal(g.ball.z,0);assert.ok(g.ball.vy>0);}
});
test('closed World Breaker rejects entry; button banks unlock it and escalate per world',()=>{
 const g=play();assert.equal(g.enterRamp(g.ball,2),false);for(let i=0;i<6;i++)g.hitTarget(i);assert.equal(g.thirdGate,true);g.worlds=1;assert.equal(g.banksRequired,3);assert.equal(g.thirdGate,false);for(let bank=0;bank<2;bank++)for(let i=0;i<6;i++)g.hitTarget(i);assert.equal(g.thirdGate,true);
});
test('three distinct ramp completions arm the core; capture pays once and ejects into multiball',()=>{
 const g=play();g.hitPortal();assert.equal(g.worlds,0);g.rampLights.fill(true);g.hitPortal();assert.equal(g.worlds,1);const paid=g.score;g.hitPortal();assert.equal(g.score,paid);const b=g.ball;tick(g,1);assert.equal(b.x,296);assert.equal(b.y,205);assert.equal(g.special,false);tick(g,1.3);assert.equal(b.holdUntil,undefined);assert.equal(g.special,true);assert.equal(g.balls.length,3);assert.ok(g.modeUntil-g.time>34);const until=g.modeUntil;g.startMode();assert.equal(g.modeUntil,until);
});
test('bridge traffic passes over ground balls, and tilt cannot award ramp progress',()=>{
 const g=play();g.enterRamp(g.ball,0);tick(g,1.5);const a=g.ball,b={id:99,x:a.x,y:a.y,z:0,vx:40,vy:10,r:10};g.balls.push(b);g.collideBalls();assert.equal(b.vx,40);assert.equal(b.x,a.x);g.balls=[a];g.tilted=true;tick(g,1.6);assert.equal(g.rampLights[0],false);assert.equal(g.score,0);
});
test('all ramp meshes and ball samples are finite and stay inside the cabinet',()=>{
 for(let r=0;r<3;r++)for(let t=0;t<=1;t+=.005){const [x,y,z]=sample(r,t);assert.ok(Number.isFinite(x+y+z));assert.ok(x>65&&x<510);assert.ok(y>80&&y<850);assert.ok(z>=-.05&&z<2);}
});
test('all launch strengths and long free play remain finite with reachable ramps',()=>{
 const visits=new Set();for(let run=0;run<20;run++){const g=play();g.charge=(run%5)/4;g.ball.vy=-(1430+g.charge*400);for(let i=0;i<240*100&&g.state!=='over';i++){if(g.state==='loaded')g.launch();g.input.left=(i+run*19)%199<65;g.input.right=(i+run*37)%173<59;g.step();for(const b of g.balls){assert.ok(Number.isFinite(b.x+b.y+b.vx+b.vy));if(b.route)visits.add(b.route.index);}assert.ok(g.balls.length<=3);assert.equal(g.score%25,0);}}assert.ok(visits.has(0));assert.ok(visits.has(1));
});

test('Eschaton page, modules and artwork ship in the offline cache',()=>{const fs=require('node:fs'),sw=fs.readFileSync('extension/sw.js','utf8'),build=fs.readFileSync('tools/build-site.cjs','utf8');for(const f of ['eschaton.html','eschaton.svg','eschaton-physics.js','eschaton-art.js','eschaton-game.js','eschaton-3d.js']){assert.ok(sw.includes('./'+f));assert.ok(build.includes(f));}assert.ok(!fs.readFileSync('extension/eschaton-game.js','utf8').includes("if(document.body.dataset.table"));});
