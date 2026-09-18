/* Each table owns its page, physics, save namespace, and server RPC family.
   Adding a table never changes the identity or records of an existing table. */
(function(root){
  const tables=Object.freeze([
    Object.freeze({id:'starbound-parlor',name:'Starbound Parlor',href:'game.html',art:'starbound.svg',storageNamespace:'starbound',rpcPrefix:'starbound'}),
    Object.freeze({id:'getaway',name:'Getaway',href:'getaway.html',art:'getaway.svg',storageNamespace:'getaway',rpcPrefix:'getaway'}),
    Object.freeze({id:'elsewhere',name:'Elsewhere',href:'elsewhere.html',art:'elsewhere.svg',storageNamespace:'elsewhere',rpcPrefix:'elsewhere'}),
    Object.freeze({id:'deadwood',name:'Deadwood',href:'deadwood.html',art:'deadwood.svg',storageNamespace:'deadwood',rpcPrefix:'deadwood'}),
    Object.freeze({id:'oldcourse',name:'The Old Course',href:'oldcourse.html',art:'oldcourse.svg',storageNamespace:'oldcourse',rpcPrefix:'oldcourse'})
  ]);
  if(typeof module!=='undefined'&&module.exports)module.exports=tables;
  else root.BUMPERY_TABLES=tables;
})(globalThis);
