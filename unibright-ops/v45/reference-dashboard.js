(()=>{
  'use strict';
  window.UNIBRIGHT_V45_DASHBOARD='20260924-reference-dashboard-1';
  const previous=window.renderDashboard;
  function applyReference(){
    const heading=document.querySelector('.ub33-hero-copy h1');
    if(heading)heading.textContent='你好，歡迎使用';
    const oldBooking=document.querySelector('.ub34-booking');
    if(oldBooking&&!oldBooking.classList.contains('ub45-quick-panel')){
      oldBooking.classList.add('ub45-quick-panel');
      oldBooking.innerHTML=`<div class="ub33-panel-head"><h3><span class="ub33-title-ico teal">◉</span>快捷操作</h3><button onclick="UB33.go('calendar')">自訂 →</button></div><div class="ub45-quick-grid"><button onclick="newProject()"><span class="qico">＋</span>新增工程</button><button onclick="newQuote()"><span class="qico">▤</span>新增報價</button><button onclick="UB33.go('invoice')"><span class="qico">▣</span>新增 Invoice</button><button onclick="UB33.go('receipt')"><span class="qico">$</span>新增收據</button></div>`;
    }
  }
  if(typeof previous==='function'){
    window.renderDashboard=function(){
      previous();
      requestAnimationFrame(applyReference);
      setTimeout(applyReference,120);
    };
    try{renderDashboard=window.renderDashboard}catch(_){ }
  }
  requestAnimationFrame(applyReference);
})();
