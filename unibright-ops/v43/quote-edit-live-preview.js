(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260924-v43-quote-edit-live-preview-1';

const $id=id=>document.getElementById(id);
const num=v=>Number(v||0);

function calcTotals(){
  const subtotal=(Array.isArray(draft)?draft:[]).reduce((s,x)=>s+num(x.quantity)*num(x.unit_price),0);
  const type=$id('dtype')?.value||'percent';
  const value=num($id('dval')?.value);
  const discount=type==='fixed'?Math.min(subtotal,value):subtotal*value/100;
  return {subtotal,discount,total:Math.max(0,subtotal-discount),type,value};
}

function forceLiveEditor(){
  if(typeof renderQuoteEditor==='function'){
    try{renderQuoteWorkbench=renderQuoteEditor}catch(_){}
    try{window.renderQuoteWorkbench=renderQuoteEditor}catch(_){}
    return renderQuoteEditor;
  }
  return typeof renderQuoteWorkbench==='function'?renderQuoteWorkbench:null;
}

const originalSaveQuote=window.saveQuote||saveQuote;
const originalViewQuote=window.viewQuote||viewQuote;
const originalRenderQuotes=window.renderQuotes||renderQuotes;

window.newQuote=function(){
  window.__editingQuoteId='';
  window.__editingQuoteNumber='';
  tier='customer';
  draft=[];
  const editor=forceLiveEditor();
  if(editor)editor();
  requestAnimationFrame(()=>{try{updateQuotePreview()}catch(_){}});
};
try{newQuote=window.newQuote}catch(_){}

window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價');
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    window.__editingQuoteId=id;
    window.__editingQuoteNumber=q.quotation_no||'';
    tier=q.price_tier||'customer';
    draft=items.map(x=>({
      description:x.description||'',
      unit:x.unit||'項',
      quantity:num(x.quantity),
      unit_price:num(x.unit_price)
    }));

    const editor=forceLiveEditor();
    if(!editor)throw new Error('報價編輯器未載入');
    editor();

    const projectSel=$id('qproject');
    if(projectSel){
      [...projectSel.options].forEach(o=>{if(o.value==='NEW')o.remove()});
      projectSel.value=q.project_id||'';
      projectSel.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if($id('dtype'))$id('dtype').value=q.discount_type||'percent';
    if($id('dval'))$id('dval').value=num(q.discount_value);

    document.querySelectorAll('.segmented button').forEach(b=>{b.disabled=true;b.title='修改現有報價時保留原本報價類別'});
    const h1=document.querySelector('.page-head h1');
    const p=document.querySelector('.page-head p');
    if(h1)h1.textContent='修改報價 '+(q.quotation_no||'');
    if(p)p.textContent='左邊可修改工程項目、單位、數量、單價及折扣；右邊即時預覽。';
    const saveBtn=[...document.querySelectorAll('.form-actions .btn.green')].find(b=>/儲存報價/.test(b.textContent||''));
    if(saveBtn)saveBtn.textContent='儲存修改';

    try{drawQuoteItems()}catch(_){}
    try{calcQuote()}catch(_){try{updateQuotePreview()}catch(__){}}
  }catch(e){
    alert('開啟修改報價失敗：'+String(e?.message||e));
  }
};
try{editQuote=window.editQuote}catch(_){}

window.saveQuote=async function(){
  const editId=window.__editingQuoteId;
  if(!editId)return originalSaveQuote();

  const clean=(Array.isArray(draft)?draft:[]).filter(x=>String(x.description||'').trim()&&num(x.quantity)>0);
  if(!clean.length){toast('請保留至少一個工程項目');return}
  const pid=$id('qproject')?.value||'';
  if(!pid||pid==='NEW'){toast('請選擇工程項目');return}

  try{
    const t=calcTotals();
    await api('quotations','?id=eq.'+encodeURIComponent(editId),{
      method:'PATCH',
      body:{
        project_id:pid,
        price_tier:tier,
        discount_type:t.type,
        discount_value:t.value,
        subtotal:t.subtotal,
        discount_amount:t.discount,
        total:t.total
      }
    });

    await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(editId),{method:'DELETE'});
    await api('quotation_items','',{
      method:'POST',
      body:clean.map((x,i)=>({
        quotation_id:editId,
        sort_order:i+1,
        description:String(x.description||'').trim(),
        unit:String(x.unit||'項').trim()||'項',
        quantity:num(x.quantity),
        unit_price:num(x.unit_price)
      }))
    });

    const linked=(D.invoices||[]).find(x=>x.quotation_id===editId);
    if(linked){
      await api('invoices','?id=eq.'+encodeURIComponent(linked.id),{
        method:'PATCH',
        body:{project_id:pid,subtotal:t.subtotal,discount_amount:t.discount,total:t.total}
      });
      await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(linked.id),{method:'DELETE'});
      await api('invoice_items','',{
        method:'POST',
        body:clean.map((x,i)=>({
          invoice_id:linked.id,
          sort_order:i+1,
          description:String(x.description||'').trim(),
          unit:String(x.unit||'項').trim()||'項',
          quantity:num(x.quantity),
          unit_price:num(x.unit_price)
        }))
      });
      try{await api('projects','?id=eq.'+encodeURIComponent(pid),{method:'PATCH',body:{contract_amount:t.total}})}catch(_){}
    }

    toast('報價及工程項目已更新');
    window.__editingQuoteId='';
    window.__editingQuoteNumber='';
    await refreshData();
    await viewQuote(editId);
  }catch(e){
    alert('修改報價失敗：'+String(e?.message||e));
  }
};
try{saveQuote=window.saveQuote}catch(_){}

window.renderQuotes=function(){
  originalRenderQuotes();
  const cards=[...document.querySelectorAll('.document-card.quote-card')];
  cards.forEach((card,i)=>{
    const q=(D.quotes||[])[i];
    const actions=card.querySelector('.doc-card-actions');
    if(!q||!actions||actions.querySelector('.ub43-edit-quote'))return;
    const b=document.createElement('button');
    b.className='btn light ub43-edit-quote';
    b.textContent='修改訂單';
    b.onclick=()=>window.editQuote(q.id);
    actions.insertBefore(b,actions.firstChild);
  });
};
try{renderQuotes=window.renderQuotes}catch(_){}

window.viewQuote=async function(id){
  await originalViewQuote(id);
  const bar=document.querySelector('.a4-actions,.view-actions');
  if(bar&&!bar.querySelector('.ub43-edit-quote')){
    const b=document.createElement('button');
    b.className='btn light ub43-edit-quote';
    b.textContent='修改訂單';
    b.onclick=()=>window.editQuote(id);
    const first=bar.querySelector('button');
    if(first&&first.nextSibling)bar.insertBefore(b,first.nextSibling);else bar.appendChild(b);
  }
};
try{viewQuote=window.viewQuote}catch(_){}

forceLiveEditor();
})();