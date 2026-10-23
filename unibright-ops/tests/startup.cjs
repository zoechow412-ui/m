const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('v6/app.js','utf8');
const loadSource=source.split('\n').find(line=>line.startsWith('async function load()'));
let ready,release,fetches=0,renders=0;
const ctx={document:{readyState:'loading',addEventListener:(name,fn)=>{assert.equal(name,'DOMContentLoaded');ready=fn}},app:{innerHTML:''},esc:String,render:()=>renders++,refreshData:async()=>{fetches++;await new Promise(r=>release=r)}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(loadSource,ctx);
(async()=>{
 const loading=ctx.load();await ctx.load();assert.equal(fetches,0);assert.equal(renders,0);
 ready();await Promise.resolve();assert.equal(fetches,1);assert.equal(ctx.__ubDataReady,false);
 release();await loading;assert.equal(renders,1);assert.equal(ctx.__ubDataReady,true);assert.equal(ctx.__ubLoading,false);
 ctx.document.readyState='complete';ctx.refreshData=async()=>{throw Error('offline')};await ctx.load();assert.equal(ctx.__ubLoading,false);assert.equal(ctx.__ubDataReady,false);assert.match(ctx.app.innerHTML,/重新載入/);
 ctx.refreshData=async()=>{};await ctx.load();assert.equal(ctx.__ubDataReady,true);assert.equal(renders,2);
 for(const file of ['v27/reference-dashboard.js','v33/pixel-reference.js','v34/exact-dashboard.js'])assert.ok(fs.readFileSync('index.html','utf8').includes('/'+file+'?v=20260930'));
 console.log('PASS: module readiness, one initial load, error recovery, local startup modules');
})().catch(e=>{console.error(e);process.exitCode=1});
