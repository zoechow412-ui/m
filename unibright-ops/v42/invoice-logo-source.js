(()=>{
'use strict';
window.UNIBRIGHT_V42_BUILD='20260914-v42-invoice-logo-source-1';
function invoiceLogoSrc(){
  try{
    if(typeof window.formalHeader==='function'){
      const box=document.createElement('div');
      box.innerHTML=window.formalHeader('','');
      const img=box.querySelector('.ub-safe-logo, img');
      if(img){
        const src=img.getAttribute('src')||img.src||'';
        if(src&&src.startsWith('data:image/')) return src;
      }
    }
  }catch(_){ }
  return '';
}
function mountInvoiceBrand(){
  const brand=document.querySelector('.brand');
  if(!brand)return;
  const src=invoiceLogoSrc();
  if(!src)return;
  brand.innerHTML=`<div class="ub42-brand"><img class="ub42-logo" src="${src}" alt="UNIBRIGHT"><div class="ub42-copy"><b>恆輝建築（香港）有限公司</b><span>UNIBRIGHT CONSTRUCTION (H.K.) LIMITED</span></div></div>`;
}
mountInvoiceBrand();
requestAnimationFrame(mountInvoiceBrand);
setTimeout(mountInvoiceBrand,420);
setTimeout(mountInvoiceBrand,900);
})();