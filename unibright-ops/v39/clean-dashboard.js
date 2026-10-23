(()=>{
'use strict';
window.UNIBRIGHT_V39_BUILD='20260914-v39-clean-brand-1';
function cleanup(){
  const promo=document.querySelector('.ub34-brand');
  if(promo)promo.remove();
  const bottom=document.querySelector('.ub34-bottom');
  if(bottom)bottom.classList.add('ub39-bottom2');
}
const prev=window.renderDashboard;
if(typeof prev==='function'){
  window.renderDashboard=function(){prev();requestAnimationFrame(cleanup);setTimeout(cleanup,380)};
  try{renderDashboard=window.renderDashboard}catch(_){ }
}
cleanup();
setTimeout(cleanup,420);
})();
