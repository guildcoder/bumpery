/* Each table owns its page, physics, save namespace, and server RPC family.
   Adding a table never changes the identity or records of an existing table. */
(function(root){
  const tables=Object.freeze([
    Object.freeze({id:'starbound-parlor',name:'Starbound Parlor',href:'game.html',art:'starbound.svg',storageNamespace:'starbound',rpcPrefix:'starbound'}),
    Object.freeze({id:'getaway',name:'Getaway',href:'getaway.html',art:'getaway.svg',storageNamespace:'getaway',rpcPrefix:'getaway'}),
    Object.freeze({id:'elsewhere',name:'Elsewhere',href:'elsewhere.html',art:'elsewhere.svg',storageNamespace:'elsewhere',rpcPrefix:'elsewhere'}),
    Object.freeze({id:'deadwood',name:'Deadwood',href:'deadwood.html',art:'deadwood.svg',storageNamespace:'deadwood',rpcPrefix:'deadwood'}),
    Object.freeze({id:'oldcourse',name:'The Old Course',href:'oldcourse.html',art:'oldcourse.svg',storageNamespace:'oldcourse',rpcPrefix:'oldcourse'}),
    Object.freeze({id:'neonroyale',name:'Neon Royale',href:'neonroyale.html',art:'neonroyale.svg',storageNamespace:'neonroyale',rpcPrefix:'neonroyale'}),
    Object.freeze({id:'undertow',name:'Undertow',href:'undertow.html',art:'undertow.svg',storageNamespace:'undertow',rpcPrefix:'undertow'}),
    Object.freeze({id:'sugarrush',name:'Sugar Rush',href:'sugarrush.html',art:'sugarrush.svg',storageNamespace:'sugarrush',rpcPrefix:'sugarrush'}),
    Object.freeze({id:'dragonfire',name:'Dragonfire',href:'dragonfire.html',art:'dragonfire.svg',storageNamespace:'dragonfire',rpcPrefix:'dragonfire'})
  ]);
  if(typeof module!=='undefined'&&module.exports)module.exports=tables;
  else root.BUMPERY_TABLES=tables;
})(globalThis);
