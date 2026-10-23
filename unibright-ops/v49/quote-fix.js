(()=>{
'use strict';
window.UNIBRIGHT_V49_BUILD='20261016-v49-quote-preview-items-1';

function scaleQuotePreview(host){
  host=host||document.getElementById('quotePreview');
  if(!host)return;
  const paper=host.querySelector('.invoice-reference-sheet,.a4-sheet,.formal-document');
  if(!paper)return;
  let box=paper.closest('.a4-scale-box');
  if(!box){
    box=document.createElement('div');
    box.className='a4-scale-box';
    paper.replaceWith(box);
    box.appendChild(paper);
  }
  paper.style.transform='none';
  paper.style.zoom='1';
  paper.style.margin='0';
  const isRef=paper.classList.contains('invoice-reference-sheet');
  const baseW=isRef?842:794;
  const measuredH=Math.max(isRef?891:1123,paper.scrollHeight||0,paper.offsetHeight||0);
  const available=Math.max(280,(host.clientWidth||baseW)-28);
  const s=Math.min(1,available/baseW);
  paper.style.width=baseW+'px';
  paper.style.transform='scale('+s+')';
  paper.style.transformOrigin='top left';
  box.style.width=Math.round(baseW*s)+'px';
  box.style.height=Math.round(measuredH*s)+'px';
  box.style.margin='0 auto';
  box.style.overflow='visible';
  host.style.minHeight=Math.max(480,Math.round(Math.min(measuredH,1123)*s)+28)+'px';
}

window.ub49ScaleQuotePreview=scaleQuotePreview;

const originalUpdate=window.ub44UpdatePreview||window.updateQuotePreview;
if(typeof originalUpdate==='function'){
  const patched=function(){
    const out=originalUpdate.apply(this,arguments);
    requestAnimationFrame(()=>scaleQuotePreview());
    setTimeout(()=>scaleQuotePreview(),80);
    return out;
  };
  window.ub44UpdatePreview=patched;
  window.updateQuotePreview=patched;
  try{updateQuotePreview=patched}catch(_){}
}

const originalEdit=window.editQuote;
if(typeof originalEdit==='function'){
  window.editQuote=async function(id){
    const out=await originalEdit(id);
    requestAnimationFrame(()=>scaleQuotePreview());
    setTimeout(()=>scaleQuotePreview(),120);
    return out;
  };
  try{editQuote=window.editQuote}catch(_){}
}

const originalRenderQuotes=window.renderQuotes;
if(typeof originalRenderQuotes==='function'){
  window.renderQuotes=function(){
    originalRenderQuotes();
    document.querySelectorAll('.quote-card').forEach(card=>{
      const has=[...card.querySelectorAll('button')].some(b=>/修改訂單|修改.*項目/.test(b.textContent||''));
      if(!has){
        const preview=[...card.querySelectorAll('button')].find(b=>/預覽|PDF/.test(b.textContent||''));
        const id=(preview?.getAttribute('onclick')||'').match(/viewQuote\(['"]([^'"]+)/)?.[1];
        if(id){
          const btn=document.createElement('button');
          btn.className='btn light';
          btn.textContent='修改訂單／項目';
          btn.onclick=()=>window.editQuote(id);
          preview?.parentElement?.insertBefore(btn,preview);
        }
      }
    });
  };
  try{renderQuotes=window.renderQuotes}catch(_){}
}

window.addEventListener('resize',()=>scaleQuotePreview());
setTimeout(()=>scaleQuotePreview(),250);
window.UNIBRIGHT_V49_HEALTH=()=>({
  build:window.UNIBRIGHT_V49_BUILD,
  livePreview:!!document.getElementById('quotePreview'),
  editQuote:typeof window.editQuote==='function',
  itemEditor:typeof window.ub44DrawItems==='function'
});
})();
