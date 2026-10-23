(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260924-v43-quote-edit-live-preview-2';
const originalSaveQuote=window.saveQuote;
const originalViewQuote=window.viewQuote;
const originalRenderQuotes=window.renderQuotes;

function editingQuote(){
  const id=window.__editingQuoteId;
  return id?((D.quotes||[]).find(x=>x.id===id)||window.__editingQuoteData||null):null;
}

function relabelEditor(){
  if(!window.__editingQuoteId)return;
  const h=document.querySelector('.workbench-head h1');
  const p=document.querySelector('.workbench-head p');
  const eye=document.querySelector('.workbench-head .eyebrow');
  const save=document.querySelector('.save-dock .btn.green');
  if(h)h.textContent='修改訂單／報價';
  if(p)p.textContent='左邊可直接修改項目、單位、數量、單價及折扣；右邊同步即時預覽。';
  if(eye)eye.textContent='EDIT QUOTATION';
  if(save)save.textContent='儲存修改';
}

window.newQuote=function(){
  window.__editingQuoteId='';
  window.__editingQuoteData=null;
  tier='customer';
  draft=[];
  renderQuoteWorkbench();
};
try{newQuote=window.newQuote}catch(_){}

window.updateQuotePreview=function(){
  const totals=quoteTotals();
  draft.forEach((x,i)=>{if(el('line'+i))el('line'+i).textContent=hk(n(x.quantity)*n(x.unit_price))});
  if(el('editorTotal'))el('editorTotal').textContent=hk(totals.t);
  const box=el('quotePreview');
  if(!box)return;
  const q=editingQuote();
  box.innerHTML=quoteDocumentHTML({
    quotation_no:q?.quotation_no||('PREVIEW-'+today().replaceAll('-','')),
    issue_date:q?.issue_date||today(),
    valid_until:q?.valid_until||addDays(today(),90),
    discount_amount:totals.d,
    total:totals.t,
    subtotal:totals.s
  },liveProjectData(),draft,true);
};
try{updateQuotePreview=window.updateQuotePreview}catch(_){}

window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價');
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    window.__editingQuoteId=id;
    window.__editingQuoteData=q;
    tier=q.price_tier||'customer';
    draft=(items||[]).map(x=>({
      description:x.description||'',
      unit:x.unit||'項',
      quantity:n(x.quantity),
      unit_price:n(x.unit_price)
    }));
    renderQuoteWorkbench();
    if(el('qproject')){
      el('qproject').value=q.project_id||'NEW';
      projectChoiceChanged();
    }
    if(el('dtype'))el('dtype').value=q.discount_type||'percent';
    if(el('dval'))el('dval').value=n(q.discount_value);
    relabelEditor();
    drawQuoteItems();
    updateQuotePreview();
  }catch(e){
    alert('開啟修改報價失敗：'+String(e?.message||e));
  }
};
try{editQuote=window.editQuote}catch(_){}

window.saveQuote=async function(){
  const id=window.__editingQuoteId;
  if(!id)return originalSaveQuote();
  const q=editingQuote();
  const clean=draft.filter(x=>String(x.description||'').trim()&&n(x.quantity)>0);
  if(!clean.length){toast('請加入至少一個工程項目');return}
  try{
    const pid=val('qproject')==='NEW'?await createProjectFromQuote():val('qproject');
    const c=quoteTotals();
    await api('quotations','?id=eq.'+encodeURIComponent(id),{
      method:'PATCH',
      body:{
        project_id:pid,
        issue_date:q?.issue_date||today(),
        valid_until:q?.valid_until||addDays(today(),90),
        discount_type:c.type,
        discount_value:c.v,
        subtotal:c.s,
        discount_amount:c.d,
        total:c.t,
        price_tier:tier
      }
    });
    await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id),{method:'DELETE'});
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
      quotation_id:id,
      sort_order:i+1,
      description:String(x.description||'').trim(),
      unit:String(x.unit||'項').trim()||'項',
      quantity:n(x.quantity),
      unit_price:n(x.unit_price)
    }))});

    const inv=(D.invoices||[]).find(x=>x.quotation_id===id);
    if(inv){
      await api('invoices','?id=eq.'+encodeURIComponent(inv.id),{
        method:'PATCH',
        body:{project_id:pid,subtotal:c.s,discount_amount:c.d,total:c.t}
      });
      await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(inv.id),{method:'DELETE'});
      if(clean.length)await api('invoice_items','',{method:'POST',body:clean.map((x,i)=>({
        invoice_id:inv.id,
        sort_order:i+1,
        description:String(x.description||'').trim(),
        unit:String(x.unit||'項').trim()||'項',
        quantity:n(x.quantity),
        unit_price:n(x.unit_price)
      }))});
      try{await api('projects','?id=eq.'+encodeURIComponent(pid),{method:'PATCH',body:{contract_amount:c.t}})}catch(_){}
    }

    toast(inv?'訂單、項目及 Invoice 已同步更新':'訂單及項目已更新');
    window.__editingQuoteId='';
    window.__editingQuoteData=null;
    await refreshData();
    await viewQuote(id);
  }catch(e){
    alert('儲存修改失敗：'+String(e?.message||e));
  }
};
try{saveQuote=window.saveQuote}catch(_){}

window.viewQuote=async function(id){
  await originalViewQuote(id);
  const actions=document.querySelector('.document-view-head .view-actions');
  if(actions&&!actions.querySelector('.ub43-edit-quote')){
    const b=document.createElement('button');
    b.className='btn light ub43-edit-quote';
    b.textContent='修改訂單／項目';
    b.onclick=()=>window.editQuote(id);
    const inv=actions.querySelector('.btn.green');
    if(inv)actions.insertBefore(b,inv);else actions.appendChild(b);
  }
};
try{viewQuote=window.viewQuote}catch(_){}

window.renderQuotes=function(){
  originalRenderQuotes();
  const cards=[...document.querySelectorAll('.document-card.quote-card')];
  cards.forEach((card,i)=>{
    const q=(D.quotes||[])[i],actions=card.querySelector('.doc-card-actions');
    if(!q||!actions||actions.querySelector('.ub43-edit-quote'))return;
    const b=document.createElement('button');
    b.className='btn light ub43-edit-quote';
    b.textContent='修改項目';
    b.onclick=()=>window.editQuote(q.id);
    actions.insertBefore(b,actions.firstChild);
  });
};
try{renderQuotes=window.renderQuotes}catch(_){}

window.UNIBRIGHT_QUOTE_EDIT_HEALTH=()=>({
  build:window.UNIBRIGHT_V43_BUILD,
  editQuote:typeof window.editQuote==='function',
  livePreview:typeof window.updateQuotePreview==='function',
  invoiceSync:true
});
})();