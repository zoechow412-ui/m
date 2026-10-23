(()=>{
'use strict';
window.UNIBRIGHT_V38_BUILD='20260914-v38-real-logo-1';
const logoSrc=(()=>{
  const probe=document.querySelector('.brand');
  if(!probe)return '';
  try{
    const bg=getComputedStyle(probe,'::before').backgroundImage||'';
    const m=bg.match(/^url\(["']?(.*?)["']?\)$/);
    return m?m[1]:'';
  }catch(_){return ''}
})();
function mountBrand(){
  const brand=document.querySelector('.brand');
  if(!brand)return;
  let src=logoSrc;
  if(!src){
    const oldImg=brand.querySelector('img');
    if(oldImg&&oldImg.src)src=oldImg.src;
  }
  brand.innerHTML=`<div class="ub38-company-brand">${src?`<img class="ub38-logo" src="${src}" alt="UNIBRIGHT logo">`:''}<div class="ub38-copy"><b>恒輝建築（香港）有限公司</b><span>UNIBRIGHT CONSTRUCTION<br>(H.K.) LIMITED</span></div></div>`;
}
mountBrand();
requestAnimationFrame(mountBrand);
setTimeout(mountBrand,120);
setTimeout(mountBrand,500);
})();
