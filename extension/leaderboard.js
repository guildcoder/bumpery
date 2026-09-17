(function(root){
  'use strict';
  const get=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
  const put=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
  class Leaderboard {
    constructor(config={}){this.url=(config.supabaseUrl||'').replace(/\/$/,'');this.key=config.supabasePublishableKey||'';this.rpcPrefix=config.rpcPrefix||'starbound';this.storageNamespace=config.storageNamespace||'starbound';if(!/^[a-z][a-z0-9_]*$/.test(this.rpcPrefix)||!/^[a-z][a-z0-9_-]*$/.test(this.storageNamespace))throw Error('Invalid table configuration.');this.sessionKey=this.storageNamespace+'.session';this.session=get(this.sessionKey);this.authPromise=null;}
    get configured(){return /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(this.url)&&Boolean(this.key);}
    async request(path,body,token){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
      try{
        const headers={'Content-Type':'application/json',apikey:this.key};if(token)headers.Authorization='Bearer '+token;
        const response=await fetch(this.url+path,{method:'POST',headers,body:JSON.stringify(body),signal:controller.signal,cache:'no-store'});
        const data=await response.json();if(!response.ok){const error=new Error(data.message||data.msg||data.error_description||'The observatory is unavailable.');error.status=response.status;throw error;}return data;
      }catch(error){if(error.name==='AbortError')throw Error('Connection timed out. Try again.');throw error;}finally{clearTimeout(timer);}
    }
    async authenticate(){
      if(this.session?.access_token&&this.session.expires_at>Date.now()/1000+60)return this.session.access_token;
      if(this.authPromise)return this.authPromise;
      this.authPromise=(async()=>{
        let result;
        if(this.session?.refresh_token){
          // Do not silently change player identities on a refresh failure.
          result=await this.request('/auth/v1/token?grant_type=refresh_token',{refresh_token:this.session.refresh_token});
        }else result=await this.request('/auth/v1/signup',{});
        if(!result.access_token)throw Error('The leaderboard could not create a player session.');
        this.session={access_token:result.access_token,refresh_token:result.refresh_token,expires_at:result.expires_at||Date.now()/1000+result.expires_in};
        put(this.sessionKey,this.session);return result.access_token;
      })();try{return await this.authPromise;}finally{this.authPromise=null;}
    }
    async begin(){if(!this.configured)return null;const token=await this.authenticate();return this.request('/rest/v1/rpc/'+this.rpcPrefix+'_start_run',{},token);}
    async top(){if(!this.configured)throw Error('The global leaderboard is not connected yet. Your personal best stays on this device.');return this.request('/rest/v1/rpc/'+this.rpcPrefix+'_leaderboard',{});}
    async submit(run,nickname){
      if(!run?.id)throw Error('This voyage started offline and cannot be posted. Start a new voyage while online.');
      const name=nickname.trim();if(!/^[A-Za-z0-9 _-]{2,16}$/.test(name))throw Error('Use 2–16 letters, numbers, spaces, underscores or hyphens.');
      const token=await this.authenticate();return this.request('/rest/v1/rpc/'+this.rpcPrefix+'_submit_score',{p_run_id:run.id,p_nickname:name,p_score:run.score,p_seconds:run.seconds},token);
    }
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={Leaderboard};return;}
  root.StarboundLeaderboard=Leaderboard;
})(globalThis);
