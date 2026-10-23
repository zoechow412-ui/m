(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260923-v43-quote-edit-live-preview-1';

const baseSaveQuote=window.saveQuote;
const baseViewQuote=window.viewQuote;
const baseRenderQuotes=window.renderQuotes;

function qById(id){return (D.quotes||[]).find(x=>x.id===id)}
function invByQuote(id){return (D.invoices||[]).find(x=>x.quotation_id===id)}
function hasPayments(invoiceId){return !!(D.payments||[]).find(x=>x.invoice_id===invoiceId)}
function setGlobal(name,fn){
  window[name]=fn;
  try{ eval(name+'=fn') }catch(_){}
}
function afterEditor(q){
  const h=document.querySelector('.page-head h1');
  const p=document.querySelector('.page-head p');
  if(h)h.textContent=q?'修改訂單／報價':'建立報價';
  if(p)p.textContent=q?'可直接修改工程項目、數量、單價及折扣；右邊 A4 即時預覽。':'左邊輸入資料，右邊 A4 報價單即時更新。';

  const sel=document.getElementById('qproject');
  if(q&&sel){
    sel.value=q.project_id||'NEW';
    if(typeof projectChoiceChanged==='function') projectChoiceChanged();
  }
  const dt=document.getElementById('dtype');
  const dv=document.getElementById('dval');
  if(q&&dt)dt.value=q.discount_type||'percent';
  if(q&&dv)dv.value=Number(q.discount_value||0);

  const saveBtn=Array.from(document.querySelectorAll('.live-controls .btn.green,.editor-pane .btn.green'))
    .find(b=>/儲存報價|儲存正式報價|更新報價/.test(b.textContent||''));
  if(saveBtn)saveBtn.textContent=q?'更新訂單／報價':'儲存報價';

  const title=document.querySelector('.preview-toolbar strong,.preview-toolbar span');
  if(title)title.textContent=q?`${q.quotation_no}｜A4 即時預覽`:'報價單 A4 即時預覽';

  const head=document.querySelector('.page-head>div');
  if(q&&head&&!document.getElementById('ub43-edit-no')){
    head.insertAdjacentHTML('beforeend',`<div id="ub43-edit-no" class="ub43-edit-no">正在修改：<b>${esc(q.quotation_no||'')}</b></div>`);
  }

  document.querySelectorAll('.live-controls input,.live-controls textarea,.live-controls select')
    .forEach(x=>{
      if(x.dataset.ub43Live==='1')return;
      x.dataset.ub43Live='1';
      x.addEventListener('input',()=>typeof updateQuotePreview==='function'&&updateQuotePreview());
      x.addEventListener('change',()=>typeof updateQuotePreview==='function'&&updateQuotePreview());
    });

  if(typeof calcQuote==='function') calcQuote();
  else if(typeof updateQuotePreview==='function') updateQuotePreview();

  requestAnimationFrame(()=>{
    const preview=document.querySelector('.preview-panel,.preview-pane');
    if(preview)preview.classList.add('ub43-preview-on');
    if(typeof scaleAll==='function')scaleAll();
  });
}

async function openEditor(q){
  window.__ub43EditingQuote=q||null;
  if(q){
    tier=q.price_tier||'customer';
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(q.id)+'&select=*&order=sort_order');
    draft=(items||[]).map(x=>({
      description:x.description||'',
      unit:x.unit||'項',
      quantity:Number(x.quantity||0),
      unit_price:Number(x.unit_price||0)
    }));
  }else{
    tier='customer';
    draft=[];
  }

  if(typeof renderQuoteEditor==='function') renderQuoteEditor();
  else if(typeof renderQuoteWorkbench==='function') renderQuoteWorkbench();
  afterEditor(q);
}

const newQuoteV43=function(){
  openEditor(null).catch(e=>alert('開啟報價編輯器失敗：'+(e?.message||e)));
};
setGlobal('newQuote',newQuoteV43);

const editQuoteV43=async function(id){
  try{
    const q=qById(id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價');
    await openEditor(q);
  }catch(e){alert('開啟修改訂單失敗：'+(e?.message||e))}
};
setGlobal('editQuote',editQuoteV43);

const saveQuoteV43=async function(){
  const q=window.__ub43EditingQuote;
  if(!q){
    window.__ub43EditingQuote=null;
    return baseSaveQuote();
  }

  const clean=draft.filter(x=>String(x.description||'').trim()&&Number(x.quantity||0)>0);
  if(!clean.length){toast('請保留至少一個工程項目');return}

  try{
    const pid=val('qproject')==='NEW'?await createProjectFromQuote():val('qproject');
    const c=quoteTotals();

    await api('quotations','?id=eq.'+encodeURIComponent(q.id),{
      method:'PATCH',
      body:{
        project_id:pid,
        discount_type:c.type,
        discount_value:c.v,
        subtotal:c.s,
        discount_amount:c.d,
        total:c.t,
        price_tier:tier
      }
    });

    await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(q.id),{method:'DELETE'});
    await api('quotation_items','',{
      method:'POST',
      body:clean.map((x,i)=>({
        quotation_id:q.id,
        sort_order:i+1,
        description:String(x.description||'').trim(),
        unit:String(x.unit||'項').trim()||'項',
        quantity:Number(x.quantity||0),
        unit_price:Number(x.unit_price||0)
      }))
    });

    let syncMsg='';
    const linked=invByQuote(q.id);
    if(linked){
      if(hasPayments(linked.id)){
        syncMsg='；此 Invoice 已有收款紀錄，所以未自動改 Invoice 金額';
      }else{
        await api('invoices','?id=eq.'+encodeURIComponent(linked.id),{
          method:'PATCH',
          body:{subtotal:c.s,discount_amount:c.d,total:c.t}
        });
        await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(linked.id),{method:'DELETE'});
        await api('invoice_items','',{
          method:'POST',
          body:clean.map((x,i)=>({
            invoice_id:linked.id,
            sort_order:i+1,
            description:String(x.description||'').trim(),
            unit:String(x.unit||'項').trim()||'項',
            quantity:Number(x.quantity||0),
            unit_price:Number(x.unit_price||0)
          }))
        });
        try{await api('projects','?id=eq.'+encodeURIComponent(pid),{method:'PATCH',body:{contract_amount:c.t}})}catch(_){}
        syncMsg='；未收款 Invoice 項目亦已同步';
      }
    }

    toast('訂單／報價已更新'+syncMsg);
    window.__ub43EditingQuote=null;
    await refreshData();
    await viewQuote(q.id);
  }catch(e){
    alert('更新訂單失敗：'+(e?.message||e));
  }
};
setGlobal('saveQuote',saveQuoteV43);

const viewQuoteV43=async function(id){
  await baseViewQuote(id);
  const actionBox=document.querySelector('.a4-actions,.view-actions,.document-view-head .view-actions');
  if(actionBox&&!actionBox.querySelector('.ub43-edit-btn')){
    const b=document.createElement('button');
    b.className='btn light ub43-edit-btn';
    b.textContent='修改訂單／項目';
    b.onclick=()=>editQuoteV43(id);
    const first=actionBox.querySelector('button');
    if(first&&first.nextSibling)actionBox.insertBefore(b,first.nextSibling); else actionBox.appendChild(b);
  }
};
setGlobal('viewQuote',viewQuoteV43);

const renderQuotesV43=function(){
  baseRenderQuotes();
  const cards=Array.from(document.querySelectorAll('.document-card.quote-card'));
  cards.forEach((card,i)=>{
    const q=(D.quotes||[])[i];
    const box=card.querySelector('.doc-card-actions');
    if(!q||!box||box.querySelector('.ub43-edit-btn'))return;
    const b=document.createElement('button');
    b.className='btn light ub43-edit-btn';
    b.textContent='修改訂單／項目';
    b.onclick=()=>editQuoteV43(q.id);
    box.insertBefore(b,box.firstChild);
  });
};
setGlobal('renderQuotes',renderQuotesV43);

window.UNIBRIGHT_V43_HEALTH=()=>({
  build:window.UNIBRIGHT_V43_BUILD,
  livePreview:typeof renderQuoteEditor==='function',
  editQuote:typeof window.editQuote==='function',
  saveQuote:typeof window.saveQuote==='function'
});
})();