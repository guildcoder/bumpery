const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Game,configs,STEP}=require('../extension/expansion-physics.js');
const play=id=>{const g=new Game(id);g.start();g.launch();return g;};
for(const id of Object.keys(configs)){
 test(id+' launches, remains finite, and keeps scores in leaderboard increments',()=>{
  for(const power of [0,.5,1]){const g=play(id);g.ball.vy=-(1430+power*400);let clears=false;
   for(let i=0;i<240*30&&g.state!=='over';i++){if(g.state==='loaded')g.launch();g.input.left=i%199<50;g.input.right=i%173<45;g.step();clears ||= g.ball.x<510&&g.ball.y<300;assert.ok(g.balls.length<=3);for(const b of g.balls)assert.ok(Number.isFinite(b.x+b.y+b.vx+b.vy));}
   assert.ok(clears);assert.equal(g.score%25,0);
  }
 });
 test(id+' mode expires, cannot extend itself, and tilt cancels it',()=>{
  const g=play(id);assert.equal(g.startMode(),true);const end=g.modeUntil;assert.equal(g.startMode(),false);assert.equal(g.modeUntil,end);g.time=end-STEP/2;g.step();assert.equal(g.special,false);g.startMode();g.tilt=2.5;g.nudge();assert.equal(g.special,false);assert.equal(g.startMode(),false);assert.equal(g.activateHyperspeed(),false);assert.equal(g.activateMeteorShower(),false);
 });
}
test('three distinct lamps gate modes; Sugar Rush requires six distinct targets',()=>{
 for(const id of Object.keys(configs)){const g=play(id);g.hitPortal();assert.equal(g.special,false);g.lit.fill(true);g.hitPortal();assert.equal(g.special,id!=='sugarrush');}
 const g=play('sugarrush');for(let i=0;i<10;i++)g.hitTarget(0);assert.equal(g.special,false);for(let i=1;i<6;i++)g.hitTarget(i);assert.equal(g.special,true);assert.equal(g.balls.length,3);
});
test('three-ball modes save early drains, then end when last ball is lost',()=>{
 for(const id of ['sugarrush','neonroyale']){const g=play(id);g.startMode();g.saveUntil=g.time+5;g.balls.forEach(b=>{b.x=300;b.y=1010;b.vx=0;b.vy=100;});g.step();assert.equal(g.balls.length,3);assert.equal(g.ballNumber,1);g.time=g.saveUntil+1;g.balls.forEach(b=>{b.x=300;b.y=1120;b.vy=100;});g.step();assert.equal(g.ballNumber,2);assert.equal(g.balls.length,1);assert.equal(g.special,false);}
});
test('Undertow reduces falling acceleration and adds a sideways current',()=>{
 const normal=play('undertow'),water=play('undertow');water.startMode();for(const g of [normal,water]){g.time=1;g.ball={x:300,y:700,vx:0,vy:0,r:10};g.step();}assert.ok(water.ball.vy<normal.ball.vy);assert.ok(water.ball.vx>0);
});
test('Dragonfire rewards six bumper hits and makes the next dragon harder',()=>{
 const g=play('dragonfire');g.startMode();for(let i=0;i<6;i++){const c=g.bumpers[0];g.time+=.2;g.ball={x:c.x,y:c.y+c.r+9,vx:0,vy:-100,r:10};g.step();}assert.equal(g.dragons,1);assert.equal(g.special,false);assert.ok(g.score>=12000);g.startMode();assert.equal(g.dragonHP,8);
});
