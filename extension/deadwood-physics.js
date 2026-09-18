(function(root){
'use strict';const Base=typeof module!=='undefined'&&module.exports?require('./getaway-physics.js'):root.Getaway;
class Duel {
 constructor(seed=1){this.seed=seed>>>0;this.phase='intro';this.countdown=3;this.time=0;this.health=1;this.wins=0;this.round=1;this.bonus=0;this.lastReaction=0;this.fireAge=0;this.endTime=0;this.pressed=false;this.reason='TOO SLOW';this.wait=.4;}
 random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
 get window(){return Math.max(.18,.9*Math.pow(.84,this.wins));}
 fail(reason){this.reason=reason;this.health=0;this.phase='crashed';this.endTime=0;}
 step(dt,input){
  if(this.phase==='finished')return;this.time+=dt;const down=Boolean(input.left||input.right),shot=down&&!this.pressed;this.pressed=down;
  if(this.phase==='crashed'){this.endTime+=dt;if(this.endTime>=2.2)this.phase='finished';return;}
  if(this.phase==='victory'){this.endTime+=dt;if(this.endTime>=1.5){this.round++;this.phase='intro';this.countdown=3;}return;}
  if(this.phase==='intro'){if(shot){this.fail('JUMPED THE DRAW');return;}this.countdown=Math.max(0,this.countdown-dt);if(!this.countdown){this.phase='wait';this.wait=.35+this.random()*.9;}return;}
  if(this.phase==='wait'){if(shot){this.fail('JUMPED THE DRAW');return;}this.wait-=dt;if(this.wait<=0){this.phase='fire';this.fireAge=0;}return;}
  if(this.phase==='fire'){this.fireAge+=dt;if(this.fireAge>this.window){this.fail('OUTDRAWN');return;}if(shot){this.lastReaction=this.fireAge;this.bonus+=1500+Math.floor(Math.max(0,this.window-this.fireAge)*40)*25;this.wins++;this.phase='victory';this.endTime=0;}}
 }
}
class Game extends Base.Game{
 step(dt=Base.STEP){const phase=this.chase?.phase;super.step(dt);if(this.chase?.phase==='fire'&&phase!=='fire')this.emit('drawCue');if(this.chase?.phase==='victory'&&phase!=='victory')this.emit('drawWin');}
 captureBall(){if(!super.captureBall())return false;this.chase=new Duel(this.chaseCount*193+71);return true;}
}
const api={...Base,Game,Duel};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Deadwood=api;
})(globalThis);
