/* Pure simulation, shared by the browser and dependency-free Node tests. */
(function (root) {
  'use strict';
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const STEP = 1 / 240;
  const outline = [[44,1060],[44,210],[58,148],[92,100],[147,66],[211,48],[389,48],[452,66],[506,104],[548,163],[574,233],[574,1060]];
  const rails = [];
  const line = (a,b,kind='rail') => rails.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},kind});
  for(let i=1;i<outline.length;i++) line(outline[i-1],outline[i]);
  line([526,260],[526,1060]); // Shooter lane
  line([65,733],[65,936]); line([65,936],[126,1000]);
  line([103,805],[103,867]); line([103,867],[177,929]);
  line([502,733],[502,936]); line([502,936],[441,1000]);
  line([464,805],[464,867]); line([464,867],[411,929]);
  const slings = [[[128,755],[176,878],[126,846]],[[460,755],[410,878],[461,846]]];
  for (const triangle of slings) for(let i=0;i<3;i++) line(triangle[i],triangle[(i+1)%3],'sling');
  const bumpers = [{x:215,y:284,r:34,hue:'#79c5c1'},{x:379,y:300,r:34,hue:'#ddaa67'},{x:300,y:420,r:37,hue:'#8daccf'}];
  const beacons = [{x:185,y:141,r:14},{x:296,y:112,r:14},{x:405,y:149,r:14}];
  const observatory = {x:296,y:205,r:24};
  const targets = [{x:80,y:365,r:12},{x:80,y:422,r:12},{x:80,y:479,r:12},{x:490,y:389,r:12},{x:490,y:446,r:12},{x:490,y:503,r:12}];
  function closest(x,y,a,b) {
    const dx=b.x-a.x,dy=b.y-a.y;
    const t=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
    return {x:a.x+dx*t,y:a.y+dy*t,t};
  }
  class Game {
    constructor(onEvent=()=>{}) {
      this.onEvent=onEvent; this.time=0; this.state='ready'; this.score=0; this.ballNumber=1;
      this.multiplier=1; this.lit=[false,false,false]; this.flippers=[{x:183,y:928,angle:.43,omega:0,side:1},{x:405,y:928,angle:Math.PI-.43,omega:0,side:-1}];
      this.input={left:false,right:false,launch:false};this.nextBallId=0;this.ball={x:550,y:974,vx:0,vy:0,r:10};
      this.events=[];this.cooldowns={};this.charge=0;this.saveUntil=0;this.tilt=0;this.tilted=false;this.nudgeAt=-10;this.launchCount=0;
      this.resetProgress();
    }
    // Collision helpers address the ball currently being integrated. Outside a step,
    // ball remains the primary ball for single-ball consumers and test fixtures.
    get ball(){return this._activeBall||this.balls[0]||this._lastBall;}
    set ball(value){value.id??=++this.nextBallId;value.shooter??=value.x>530;this.balls=[value];this._lastBall=value;}
    get hyperspeed(){return this.hyperUntil>this.time&&!this.tilted;}
    get hyperBanksRequired(){return this.hyperActivations+1;}
    resetProgress(){this.hyperActivations=0;this.hyperBanks=0;this.meteorUntil=0;this.level=1;this.targetLights=Array(6).fill(false);this.hyperUntil=0;this.hyperDuration=0;this.meteorShower=false;this.nextMeteorAt=0;this.meteorIndex=0;this.comboShots=[];this.comboUntil=0;this.skillShotUntil=0;}
    endModes(){this.meteorUntil=0;this.hyperUntil=0;this.meteorShower=false;this.nextMeteorAt=0;this.comboShots=[];this.comboUntil=0;this.skillShotUntil=0;}
    activateHyperspeed(){
      if(this.state!=='playing'||this.tilted||this.hyperspeed)return false;
      this.hyperDuration=15+Math.min(this.level-1,2)*5;this.hyperUntil=this.time+this.hyperDuration;
      this.hyperActivations++;this.hyperBanks=0;this.targetLights.fill(false);this.emit('hyperspeed',{duration:this.hyperDuration});return true;
    }
    hitMeteorTarget(index){
      if(this.state!=='playing'||this.tilted||this.hyperspeed||this.targetLights[index])return;
      this.targetLights[index]=true;
      if(this.targetLights.every(Boolean)){
        this.hyperBanks++;this.targetLights.fill(false);
        if(this.hyperBanks>=this.hyperBanksRequired)this.activateHyperspeed();
        else this.emit('hyperProgress',{completed:this.hyperBanks,required:this.hyperBanksRequired});
      }
    }
    activateMeteorShower(){
      if(this.state!=='playing'||this.tilted||this.meteorShower||this.balls.length>1)return false;
      this.meteorShower=true;this.meteorUntil=this.time+35;this.nextMeteorAt=this.time+.65;this.saveUntil=0;this.emit('meteorStart');return true;
    }
    spawnMeteor(){
      if(!this.meteorShower||this.time>=this.meteorUntil||!this.balls.length||this.balls.length>=5||this.tilted)return false;
      const lanes=[250,345,135,450],index=this.meteorIndex++;
      const ball={id:++this.nextBallId,x:lanes[index%lanes.length],y:88,vx:index%2?110:-110,vy:260,r:10,shooter:false,meteor:true};
      this.balls.push(ball);this.emit('meteorDrop',{x:ball.x,y:ball.y,count:this.balls.length});return true;
    }
    recordShot(key){
      if(this.tilted)return;
      if(this.time>this.comboUntil)this.comboShots=[];
      if(this.comboShots.includes(key))return;
      this.comboShots.push(key);this.comboUntil=this.time+4;
      if(this.comboShots.length>=3){const count=this.comboShots.length;this.addScore(count*250,294,555);this.emit('combo',{count});if(count===6){this.addScore(2500,294,555);this.emit('superCombo');this.comboShots=[];}}
    }
    emit(type,data={}) {this.onEvent({type,...data});}
    start() {
      this.score=0;this.ballNumber=1;this.multiplier=1;this.lit=[false,false,false];this.time=0;this.cooldowns={};this.input={left:false,right:false,launch:false};
      this.launchCount=0;this.nudgeAt=-10;this._activeBall=null;this.resetProgress();this.loadBall();this.emit('start');
    }
    loadBall(saved=false) {
      this.endModes();this.ball={x:550,y:974,vx:0,vy:0,r:10};this.state='loaded';this.charge=0;this.tilt=0;this.tilted=false;
      this.isSavedBall=saved;this.saveUntil=0;this.emit(saved?'save':'loaded');
    }
    launch() {
      if(this.state!=='loaded')return;
      this.skillShotUntil=this.charge>=.8?this.time+5:0;
      this.ball.vy=-(1430+this.charge*400);this.ball.vx=0;this.ball.shooter=true;this.state='playing';
      this.saveUntil=this.isSavedBall?0:this.time+10;this.launchCount++;this.charge=0;this.emit('launch');
    }
    addScore(points,x,y) {if(this.tilted)return; const value=points*this.multiplier;this.score+=value;this.emit('score',{value,x,y});}
    nudge() {
      if(this.state!=='playing'||this.tilted||this.time-this.nudgeAt<.45)return;
      this.nudgeAt=this.time;this.tilt+=1;for(const b of this.balls){b.vy-=180;b.vx+=(b.x<294?90:-90);}
      if(this.tilt>=2.75){this.tilted=true;this.saveUntil=0;this.endModes();this.emit('tilt');}else this.emit('nudge',{danger:this.tilt>1.7});
    }
    drain() {
      this.endModes();
      if(this.time<this.saveUntil&&!this.tilted){this.loadBall(true);return;}
      if(!this.tilted)this.addScore(250*this.lit.filter(Boolean).length,294,850);
      if(this.ballNumber>=3){this.state='over';this.balls=[];this.emit('over');return;}
      this.ballNumber++;this.loadBall();
    }
    hitAllowed(key,delay=.1) {if((this.cooldowns[key]||0)>this.time)return false;this.cooldowns[key]=this.time+delay;return true;}
    rescueBall(ball){
      ball.x=294+(ball.id%3-1)*36;ball.y=940;ball.vx=(ball.id%2?1:-1)*900;ball.vy=-4300;ball.shooter=false;
      if(this.hitAllowed('shield',.18))this.emit('shield',{x:ball.x,y:985});
    }
    circle(c,restitution,kick=0,key='',points=0) {
      const b=this.ball,dx=b.x-c.x,dy=b.y-c.y,dist=Math.hypot(dx,dy),min=b.r+c.r;
      if(dist>=min)return false;
      const nx=dist>1e-6?dx/dist:0,ny=dist>1e-6?dy/dist:-1;
      b.x=c.x+nx*(min+.05);b.y=c.y+ny*(min+.05);
      const speed=b.vx*nx+b.vy*ny;
      if(speed<0){const impulse=-(1+restitution)*speed;b.vx+=impulse*nx;b.vy+=impulse*ny;}
      if(key&&this.hitAllowed(key+':'+b.id,.16)) {
        if(!this.tilted&&kick){const outward=b.vx*nx+b.vy*ny;const extra=Math.max(0,kick-outward);b.vx+=nx*extra;b.vy+=ny*extra;}
        this.addScore(points,c.x,c.y);this.recordShot(key);this.emit('hit',{x:c.x,y:c.y,kind:key});return true;
      }
      return false;
    }
    segment(a,b,r=5,restitution=.78,velocity=null,sling=false,key='') {
      const ball=this.ball,p=closest(ball.x,ball.y,a,b),dx=ball.x-p.x,dy=ball.y-p.y,dist=Math.hypot(dx,dy),min=ball.r+r;
      if(dist>=min)return;
      let nx=dx/(dist||1),ny=dy/(dist||1);
      if(dist<.00001){const length=Math.hypot(b.x-a.x,b.y-a.y);nx=(b.y-a.y)/length;ny=-(b.x-a.x)/length;}
      ball.x=p.x+nx*(min+.08);ball.y=p.y+ny*(min+.08);
      const surface=velocity?velocity(p):{x:0,y:0};
      const relative=(ball.vx-surface.x)*nx+(ball.vy-surface.y)*ny;
      if(relative<0) {
        const impulse=-(1+restitution)*relative;
        ball.vx+=impulse*nx;ball.vy+=impulse*ny;
        if(sling&&!this.tilted&&this.hitAllowed(key+':'+ball.id,.18)) {
          const extra=Math.max(0,430-(ball.vx*nx+ball.vy*ny));ball.vx+=nx*extra;ball.vy+=ny*extra;
          this.addScore(75,p.x,p.y);this.emit('hit',{x:p.x,y:p.y,kind:'sling'});
        } else if(velocity&&Math.abs(relative)>120&&this.hitAllowed('flip',.05))this.emit('flipHit');
      }
    }
    step(dt=STEP) {
      if(this.state==='ready'||this.state==='over')return;
      // Keep public stepping safe even if a caller passes a render-frame delta.
      if(dt>STEP+1e-9){let left=Math.min(dt,.1);while(left>1e-9){const part=Math.min(left,STEP);this.step(part);left-=part;}return;}
      const wasHyper=this.hyperspeed;
      this.time+=dt;this.tilt=Math.max(0,this.tilt-dt*.12);
      if(wasHyper&&!this.hyperspeed){for(const b of this.balls){const speed=Math.hypot(b.vx,b.vy);if(speed>1500){b.vx*=1500/speed;b.vy*=1500/speed;}}this.emit('hyperspeedEnd');}
      if(this.time>this.comboUntil)this.comboShots=[];
      if(this.meteorShower&&this.time>=this.meteorUntil){this.meteorShower=false;this.nextMeteorAt=0;this.emit('meteorExpired');}
      this.flippers.forEach((f,i)=>{
        const pressed=(i===0?this.input.left:this.input.right)&&!this.tilted;
        const target=i===0?(pressed?-.48:.43):(pressed?Math.PI+.48:Math.PI-.43);
        const old=f.angle;f.angle+=clamp(target-f.angle,-22*dt,22*dt);f.omega=(f.angle-old)/dt;
      });
      if(this.state==='loaded'){if(this.input.launch)this.charge=clamp(this.charge+dt*.85,0,1);return;}
      const drained=[];
      for(const b of this.balls){
        this._activeBall=b;
        // High-speed modes use smaller collision steps, not merely a larger velocity.
        const steps=Math.max(1,Math.ceil(Math.max(Math.hypot(b.vx,b.vy),this.hyperspeed?5200:0)*dt/6));
        for(let i=0;i<steps;i++){
          this.integrateBall(dt/steps);
          if(this.state==='loaded')break;
          if(b.y>1100||b.x<-30||b.x>630||b.y<-40){if(this.hyperspeed)this.rescueBall(b);else{drained.push(b);break;}}
        }
      }
      this._activeBall=null;
      this.balls=this.balls.filter(b=>!drained.includes(b));
      if(!this.balls.length){const ended=this.meteorShower;this.meteorShower=false;if(ended)this.emit('meteorEnd');this.drain();return;}
      this._lastBall=this.balls[0];
      // Resolve all drains before replenishment: losing the last ball ends the shower.
      if(this.meteorShower&&this.time>=this.nextMeteorAt){if(this.balls.length<5)this.spawnMeteor();this.nextMeteorAt=this.time+2.25;}
      this.collideBalls();
    }
    collideBalls(){
      for(let i=0;i<this.balls.length;i++)for(let j=i+1;j<this.balls.length;j++){
        const a=this.balls[i],b=this.balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>=min)continue;
        const nx=d>1e-6?dx/d:1,ny=d>1e-6?dy/d:0,overlap=(min-d)/2+.01;
        a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
        const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(speed<0){const impulse=-speed*.94;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
      }
    }
    integrateBall(dt){
      const b=this.ball;b.vy+=820*dt;const damping=Math.exp(-.055*dt);b.vx*=damping;b.vy*=damping;
      const speed=Math.hypot(b.vx,b.vy),limit=this.hyperspeed?5200:2100;
      if(this.hyperspeed&&speed<3800){if(speed<1){b.vx=700;b.vy=-4300;}else{b.vx*=4300/speed;b.vy*=4300/speed;}}
      else if(speed>limit){b.vx*=limit/speed;b.vy*=limit/speed;}
      b.x+=b.vx*dt;b.y+=b.vy*dt;
      // Once the launch clears the lane, the curved guide sends it into the upper orbit.
      if(b.x>524&&b.y<246&&b.vy<0){b.vx=this.hyperspeed?-1900:-450;b.vy=Math.min(b.vy,-580);}
      if(b.x<510)b.shooter=false;
      rails.forEach((r,i)=>this.segment(r.a,r.b,r.kind==='sling'?7:5,r.kind==='sling'?.85:.8,null,r.kind==='sling','rail'+i));
      bumpers.forEach((c,i)=>this.circle(c,.94,780,'bumper'+i,100));
      targets.forEach((c,i)=>{if(this.circle(c,.9,480,'target'+i,200))this.hitMeteorTarget(i);});
      beacons.forEach((c,i)=>{
        if(this.circle(c,.9,280,'beacon'+i,350)&&!this.tilted){this.lit[i]=true;this.emit('beacon',{index:i,all:this.lit.every(Boolean)});if(this.skillShotUntil>this.time){this.skillShotUntil=0;this.addScore(1000,c.x,c.y);this.emit('skillShot');}}
      });
      if(this.circle(observatory,.8,380,'observatory',100)&&!this.tilted&&this.lit.every(Boolean)){
        this.addScore(10000,observatory.x,observatory.y);this.lit=[false,false,false];this.multiplier=Math.min(this.multiplier+1,5);this.level++;this.emit('jackpot',{level:this.level});this.activateMeteorShower();
      }
      for(const f of this.flippers){
        const tip={x:f.x+Math.cos(f.angle)*91,y:f.y+Math.sin(f.angle)*91};
        this.segment(f,tip,12,.68,p=>({x:-f.omega*(p.y-f.y),y:f.omega*(p.x-f.x)}));
      }
      // A failed plunge returns to the spring without consuming a ball.
      if(this.hyperspeed&&b.y>985){this.rescueBall(b);return;}
      if(b.x>536&&b.y>974&&b.vy>0){
        if(this.balls.length>1||this.meteorShower){b.y=950;b.vy=-1500;b.vx=0;}
        else{this.state='loaded';b.y=974;b.vx=0;b.vy=0;this.charge=0;this.emit('loaded');}
      }
    }
  }
  const api={Game,STEP,rails,outline,slings,bumpers,beacons,targets,observatory,closest};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Pinball=api;
})(typeof globalThis!=='undefined'?globalThis:this);
