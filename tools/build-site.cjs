const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=path.resolve(__dirname,'../extension'),output=path.resolve(__dirname,'../dist');
fs.mkdirSync(output,{recursive:true});
const files=['index.html','lobby.css','lobby.js','tables.js','starbound.svg','getaway.html','getaway.css','getaway-physics.js','getaway-renderer.js','getaway-game.js','getaway.svg','game.html','game.css','layout.css','config.js','leaderboard.js','physics.js','renderer.js','showtime.js','game.js','pwa.js','icon.svg','app.webmanifest','sw.js'];
for(const file of files)fs.copyFileSync(path.join(source,file),path.join(output,file));
fs.cpSync(path.join(source,'icons'),path.join(output,'icons'),{recursive:true});
fs.writeFileSync(path.join(output,'.nojekyll'),'');
const url=process.env.SUPABASE_URL||'',key=process.env.SUPABASE_PUBLISHABLE_KEY||'';
if(Boolean(url)!==Boolean(key))throw Error('Set both SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
if(url){if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw Error('Expected a Supabase HTTPS project URL.');if(key.startsWith('sb_secret_'))throw Error('A secret key must never be included in this website.');
  if(key.startsWith('eyJ')){let claims;try{claims=JSON.parse(Buffer.from(key.split('.')[1],'base64url'));}catch{throw Error('Invalid public API key.');}if(claims.role!=='anon')throw Error('Only a public anon or publishable key may be shipped.');}
  else if(!key.startsWith('sb_publishable_'))throw Error('Expected a public publishable key.');
  fs.writeFileSync(path.join(output,'config.js'),'globalThis.STARBOUND_CONFIG = Object.freeze('+JSON.stringify({supabaseUrl:url,supabasePublishableKey:key})+');\n');
}
const hash=crypto.createHash('sha256');for(const f of files.filter(f=>f!=='sw.js'))hash.update(fs.readFileSync(path.join(output,f)));
for(const f of fs.readdirSync(path.join(output,'icons')).sort())hash.update(fs.readFileSync(path.join(output,'icons',f)));
const version=hash.digest('hex').slice(0,16);fs.writeFileSync(path.join(output,'sw.js'),fs.readFileSync(path.join(source,'sw.js'),'utf8').replace('__BUILD_VERSION__',version));
console.log(`Built GitHub Pages site (${version}). Public leaderboard settings ${url?'supplied by environment':'copied from extension/config.js'}.`);
