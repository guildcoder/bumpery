(function(root){
'use strict';
const E=typeof module!=='undefined'&&module.exports?require('./expansion-physics.js'):root.Expansion;
const routes=[
 {name:'VOID BRIDGE',color:'#8ee6ec',duration:2.9,points:[[148,638,0],[126,532,.2],[116,406,.7],[152,285,1.05],[250,256,1.1],[358,314,1.1],[445,425,.8],[454,592,.38],[402,737,0]]},
 {name:'ORBIT SPIRAL',color:'#ed8aff',duration:3.4,points:[[444,607,0],[467,490,.35],[461,350,.85],[407,202,1.35],[308,157,1.5],[213,207,1.5],[219,329,1.5],[322,398,1.3],[390,455,.9],[374,557,.45],[332,718,0]]},
 {name:'WORLD BREAKER',color:'#ffc977',duration:2.5,points:[[290,526,0],[287,449,.35],[278,363,.9],[305,299,1.8],[381,340,1.85],[414,455,1.6],[316,525,1.3],[224,577,.9],[202,687,.35],[235,770,0]]}
];
// Catmull-Rom samples are shared by simulation and the rendered ramp mesh.
function sample(index,t){const p=routes[index].points,s=Math.max(0,Math.min(.999999,t))*(p.length-1),i=Math.floor(s),u=s-i;return [0,1,2].map(k=>{const a=p[Math.max(0,i-1)][k],b=p[i][k],c=p[i+1][k],d=p[Math.min(p.length-1,i+2)][k];return .5*((2*b)+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u);});}
const cfg={name:'Eschaton',mode:'ANNIHILATION',duration:35,color:'#cb88ff',accent:'#83eee0',bg:'#130d25',bumps:[[181,351],[410,290],[335,435]],guide:'Complete the six reactor buttons to open World Breaker. Shoot all three elevated ramps, then the central core to consume a world. Annihilation releases three balls for 35 seconds of double scoring and ramp jackpots. World Breaker needs one bank for the first world, two more for the second, three more for the third, and so on. Cyan: left bridge. Violet: right spiral. Gold: centre ramp. Shoot upward into the illuminated mouths.'};
class Game extends E.Game{
 constructor(onEvent){super('neonroyale',onEvent);this.id='eschaton';this.cfg=cfg;this.bumpers=cfg.bumps.map(([x,y],i)=>({x,y,r:i===2?35:32}));}
 resetProgress(){super.resetProgress();this.worlds=0;this.rampLights=[false,false,false];this.rampCounts=[0,0,0];this.coreUntil=0;}
 get banksRequired(){return (this.worlds+1)*(this.worlds+2)/2;}
 get thirdGate(){return this.bankCount>=this.banksRequired;}
 get coreReady(){return this.rampLights.every(Boolean)&&!this.special;}
 get objective(){return this.coreUntil>this.time?`WORLD ${this.worlds} · CORE COLLAPSE`:this.special?`ANNIHILATION · ${Math.ceil(this.modeUntil-this.time)}s · RAMP JACKPOTS`:this.coreReady?'CORE OPEN · SHOOT THE CENTRE':!this.thirdGate?`REACTOR BUTTONS · ${this.targetLights.filter(Boolean).length}/6 · BANK ${this.bankCount}/${this.banksRequired}`:`RAMPS ${this.rampLights.filter(Boolean).length}/3 · COMPLETE THE CIRCUIT`;}
 hitTarget(i){super.hitTarget(i);}
 enterRamp(b,index){if(this.tilted||b.route||b.holdUntil||this.time<(b.routeCooldown||0)||index===2&&!this.thirdGate)return false;b.route={index,start:this.time};b.vx=b.vy=0;b.shooter=false;this.emit('rampEnter',{index,name:routes[index].name});return true;}
 hitPortal(){if(!this.coreReady||this.tilted||this.ball.holdUntil)return;const b=this.ball;this.rampLights.fill(false);this.worlds++;this.addScore(15000*this.worlds,296,205);b.x=296;b.y=205;b.vx=b.vy=0;b.holdUntil=this.time+2.2;this.coreUntil=b.holdUntil;this.emit('worldConsumed',{world:this.worlds});}
 startMode(){if(!super.startMode())return false;while(this.balls.length<3){const i=this.balls.length;this.balls.push({id:++this.nextBallId,x:230+i*60,y:95,vx:i%2?160:-160,vy:220,r:10,shooter:false});}return true;}
 integrateBall(dt){const b=this.ball;
  if(b.holdUntil){b.vx=b.vy=0;b.z=.08;if(this.time>=b.holdUntil){delete b.holdUntil;b.x=296;b.y=405;b.vx=95;b.vy=550;b.routeCooldown=this.time+1;if(!this.tilted)this.startMode();}return;}
  if(b.route){const {index,start}=b.route,t=(this.time-start)/routes[index].duration,[x,y,z]=sample(index,t);b.x=x;b.y=y;b.z=z;b.vx=b.vy=0;if(t>=1){delete b.route;b.z=0;b.vx=index===0?-180:140;b.vy=500;b.routeCooldown=this.time+1;if(!this.tilted){this.rampLights[index]=true;this.rampCounts[index]++;}this.addScore(this.special?5000:1500,x,y);this.emit('rampComplete',{index,name:routes[index].name});}return;}
  b.z=0;
  for(let i=0;i<routes.length;i++){const [x,y]=routes[i].points[0];if(Math.hypot(b.x-x,b.y-y)<27&&b.vy<-80){if(this.enterRamp(b,i))return;if(i===2&&!this.thirdGate){this.segment({x:x-24,y:y-9},{x:x+24,y:y-9},5,.85);if(this.hitAllowed('gateBuzz',.6))this.emit('gateClosed');}}}
  super.integrateBall(dt);
 }
 collideBalls(){// Balls on bridges pass over ground-level traffic rather than colliding through decks.
  for(let i=0;i<this.balls.length;i++)for(let j=i+1;j<this.balls.length;j++){const a=this.balls[i],b=this.balls[j];if(a.route||b.route||a.holdUntil||b.holdUntil||Math.abs((a.z||0)-(b.z||0))>.15)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>=min)continue;const nx=d>1e-6?dx/d:1,ny=d>1e-6?dy/d:0,over=(min-d)/2+.01;a.x-=nx*over;a.y-=ny*over;b.x+=nx*over;b.y+=ny*over;const speed=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(speed<0){a.vx+=speed*.94*nx;a.vy+=speed*.94*ny;b.vx-=speed*.94*nx;b.vy-=speed*.94*ny;}}
 }
 endModes(){super.endModes();}
}
const api={Game,cfg,routes,sample,STEP:E.STEP};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Eschaton=api;
})(globalThis);
