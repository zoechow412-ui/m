(()=>{
'use strict';
window.UNIBRIGHT_V51_BUILD='20261016-v51-db-recovery-1';
const originalRefresh=typeof refreshData==='function'?refreshData:null;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const transient=e=>/load failed|failed to fetch|network|fetch|timeout/i.test(String(e?.message||e||''));

if(originalRefresh){
  const retryRefresh=async()=>{
    const delays=[0,1000,2000,4000,7000,10000,15000];
    let last;
    for(let i=0;i<delays.length;i++){
      if(delays[i])await pause(delays[i]);
      try{return await originalRefresh()}
      catch(e){last=e;if(!transient(e))throw e}
    }
    throw last||new Error('資料庫暫時未能連線');
  };
  window.refreshData=retryRefresh;
  try{refreshData=retryRefresh}catch(_){}
}

window.load=async function(){
  if(window.__ubLoading)return;
  window.__ubLoading=true;
  window.__ubDataReady=false;
  if(app)app.innerHTML='<div class="loading-card"><div class="loader"></div><b>正在連接工程資料…</b><p style="margin:8px 0 0;color:#718096;font-size:12px">資料庫啟動中會自動重試，毋須重複按掣</p></div>';
  try{
    if(document.readyState==='loading')await new Promise(resolve=>document.addEventListener('DOMContentLoaded',resolve,{once:true}));
    await refreshData();
    window.__ubDataReady=true;
    render();
  }catch(e){
    if(app)app.innerHTML='<div class="empty-state"><b>資料庫暫時未能連線</b><p>'+esc(String(e?.message||e))+'</p><button class="btn" onclick="load()">立即重試</button></div>';
  }finally{window.__ubLoading=false}
};
try{load=window.load}catch(_){}

let checks=0;
function recover(){
  checks++;
  if(window.__ubDataReady)return;
  if(!window.__ubLoading)window.load();
  if(checks<12&&!window.__ubDataReady)setTimeout(recover,5000);
}
setTimeout(recover,600);
window.addEventListener('online',()=>{if(!window.__ubDataReady)window.load()});
})();