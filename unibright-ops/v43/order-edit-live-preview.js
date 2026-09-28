(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260928-v43-live-preview-edit-order-1';
let editingQuote=null;
const baseRenderQuotes=window.renderQuotes||renderQuotes;
const baseRenderQuoteWorkbench=window.renderQuoteWorkbench||renderQuoteWorkbench;
const baseUpdateQuotePreview=window.updateQuotePreview||updateQuotePreview;
const baseViewQuote=window.viewQuote||viewQuote;
const baseNewQuote=window.newQuote||newQuote;

function qById(id){return (D.quotes||[]).find(x=>x.id===id)||null}
function safeCash(v){return typeof hk==='function'?hk(v):('HK$'+Number(v||0).toLocaleString())}
function orderProjectData(q){
  const p=project(q.project_id)||{},c=clientByProject(q.project_id)||{};
  return {...p,company_name:c.company_name,contact_name:c.contact_name,phone:c.phone,email:c.email,client_address:c.address};
}
function addPreviewJump(){
  const head=document.querySelector('.workbench-head');
  if(!head||head.querySelector('.ub43-preview-jump'))return;
  const b=document.createElement('button');
  b.className='btn light ub43-preview-jump';
  b.textContent='即時預覽 ↓';
  b.onclick=()=>document.querySelector('.preview-pane')?.scrollIntoView({behavior:'smooth',block:'start'});
  head.appendChild(b);
}
function decorateEdit(q){
  const h=document.querySelector('.workbench-head h1');
  if(h)h.textContent='修改訂單';
  const p=document.querySelector('.workbench-head p');
  if(p)p.textContent='項目、數量、單價、折扣一改，右邊即時預覽同步更新。';
  const save=document.querySelector('.save-dock .btn.green');
  if(save){save.textContent='儲存訂單修改';save.setAttribute('onclick','saveQuote()')}
  const sel=el('qproject');
  if(sel){sel.value=q.project_id;projectChoiceChanged();sel.disabled=true}
  if(el('dtype'))el('dtype').value=q.discount_type||'percent';
  if(el('dval'))el('dval').value=n(q.discount_value);
  ['tierCustomer','tierTrade'].forEach(id=>{const b=el(id);if(b)b.disabled=true});
  const eb=document.querySelector('.step-blue .step-title small');
  if(eb)eb.textContent='修改現有訂單時保留原本客戶／同行類別';
  addPreviewJump();
  updateQuotePreview();
}
window.editQuoteOrder=async function(id){
  try{
    const q=qById(id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到訂單');
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    editingQuote=q;
    window.__ub43EditingQuoteId=id;
    tier=q.price_tier||'customer';
    draft=(items||[]).map(x=>({description:x.description||'',unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)}));
    baseRenderQuoteWorkbench();
    decorateEdit(q);
  }catch(e){alert('開啟修改訂單失敗：'+String(e?.message||e))}
};

window.newQuote=function(){
  editingQuote=null;
  window.__ub43EditingQuoteId='';
  return baseNewQuote();
};
try{newQuote=window.newQuote}catch(_){}

window.updateQuotePreview=function(){
  if(!editingQuote)return baseUpdateQuotePreview();
  const totals=quoteTotals();
  draft.forEach((x,i)=>{if(el('line'+i))el('line'+i).textContent=safeCash(n(x.quantity)*n(x.unit_price))});
  if(el('editorTotal'))el('editorTotal').textContent=safeCash(totals.t);
  const box=el('quotePreview');
  if(box){
    const q={...editingQuote,subtotal:totals.s,discount_amount:totals.d,total:totals.t,discount_type:totals.type,discount_value:totals.v};
    box.innerHTML=quoteDocumentHTML(q,orderProjectData(editingQuote),draft,true);
    if(typeof window.patchLogo==='function')try{window.patchLogo(box)}catch(_){}
  }
};
try{updateQuotePreview=window.updateQuotePreview}catch(_){}

window.saveQuote=async function(){
  if(!editingQuote){
    const clean=draft.filter(x=>String(x.description||'').trim()&&n(x.quantity)>0);
    if(!clean.length){toast('請加入至少一個工程項目');return}
    try{
      const pid=val('qproject')==='NEW'?await createProjectFromQuote():val('qproject');
      const c=quoteTotals(),no=gen(tier==='trade'?'TQ':'QO');
      const q=await api('quotations','',{method:'POST',body:{quotation_no:no,project_id:pid,issue_date:today(),valid_until:addDays(today(),90),discount_type:c.type,discount_value:c.v,subtotal:c.s,discount_amount:c.d,total:c.t,status:'草稿',price_tier:tier}});
      if(clean.length)await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({quotation_id:q[0].id,sort_order:i+1,description:String(x.description).trim(),unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)}))});
      toast('報價已永久儲存');
      await refreshData();
      await viewQuote(q[0].id);
    }catch(e){alert('儲存報價失敗：'+String(e?.message||e))}
    return;
  }

  const clean=draft.filter(x=>String(x.description||'').trim()&&n(x.quantity)>0);
  if(!clean.length){toast('訂單最少要有一個項目');return}
  const c=quoteTotals(),qid=editingQuote.id;
  try{
    const linked=(D.invoices||[]).find(x=>x.quotation_id===qid);
    if(linked && n(linked.amount_paid)>c.t+.01){
      alert('新總額低過已收款金額，不能儲存。請先調整項目／金額。');
      return;
    }
    await api('quotations','?id=eq.'+encodeURIComponent(qid),{method:'PATCH',body:{
      discount_type:c.type,discount_value:c.v,subtotal:c.s,discount_amount:c.d,total:c.t,price_tier:tier
    }});
    await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(qid),{method:'DELETE'});
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
      quotation_id:qid,sort_order:i+1,description:String(x.description).trim(),unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
    }))});

    if(linked){
      await api('invoices','?id=eq.'+encodeURIComponent(linked.id),{method:'PATCH',body:{
        subtotal:c.s,discount_amount:c.d,total:c.t
      }});
      await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(linked.id),{method:'DELETE'});
      await api('invoice_items','',{method:'POST',body:clean.map((x,i)=>({
        invoice_id:linked.id,sort_order:i+1,description:String(x.description).trim(),unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
      }))});
      try{await api('projects','?id=eq.'+encodeURIComponent(editingQuote.project_id),{method:'PATCH',body:{contract_amount:c.t}})}catch(_){}
    }
    const id=qid;
    editingQuote=null;
    window.__ub43EditingQuoteId='';
    toast(linked?'訂單及 Invoice 項目已更新':'訂單項目已更新');
    await refreshData();
    await viewQuote(id);
  }catch(e){alert('更新訂單失敗：'+String(e?.message||e))}
};
try{saveQuote=window.saveQuote}catch(_){}

window.renderQuotes=function(){
  app.innerHTML=`<div class="page-head"><div><h1>報價單</h1><p>可以即時預覽，亦可以重新修改每個工程項目、數量、單價及折扣。</p></div><button class="btn" onclick="newQuote()">＋ 新報價</button></div><div class="document-cards">${(D.quotes||[]).map(q=>{const p=project(q.project_id);return `<div class="document-card quote-card"><div class="doc-icon">Q</div><div class="doc-card-main"><span class="doc-type">${q.price_tier==='trade'?'同行價':'客戶價'}</span><h3>${esc(q.quotation_no)}</h3><p>${esc(p?.project_name||'')} · ${esc(q.issue_date||'')}</p><strong>${safeCash(q.total)}</strong></div><div class="doc-card-actions"><button class="btn light" onclick="viewQuote('${q.id}')">預覽／PDF</button><button class="btn ub43-edit-btn" onclick="editQuoteOrder('${q.id}')">修改訂單</button>${q.status!=='已轉Invoice'?`<button class="btn green" onclick="invoiceWorkbench('${q.id}')">轉 Invoice</button>`:''}</div></div>`}).join('')||'<div class="empty-state">未有報價單。</div>'}</div>`;
};
try{renderQuotes=window.renderQuotes}catch(_){}

window.viewQuote=async function(id){
  await baseViewQuote(id);
  const actions=document.querySelector('.document-view-head .view-actions');
  if(actions&&!actions.querySelector('.ub43-edit-btn')){
    const b=document.createElement('button');
    b.className='btn ub43-edit-btn';
    b.textContent='修改訂單／項目';
    b.onclick=()=>window.editQuoteOrder(id);
    actions.insertBefore(b,actions.querySelector('.btn.green')||null);
  }
};
try{viewQuote=window.viewQuote}catch(_){}

window.UNIBRIGHT_ORDER_EDIT_HEALTH=()=>({
  build:window.UNIBRIGHT_V43_BUILD,
  livePreview:!!document.querySelector('#quotePreview,.preview-pane'),
  editQuoteOrder:typeof window.editQuoteOrder==='function',
  editing:window.__ub43EditingQuoteId||null
});
})();