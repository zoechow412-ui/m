(()=>{
  'use strict';
  window.UNIBRIGHT_V45_INVOICE='20260924-pdf-reference-1';
  const escapeValue=v=>typeof window.esc==='function'?window.esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const amount=v=>typeof window.hk==='function'?window.hk(v):'HK$'+Number(v||0).toLocaleString('en-HK',{minimumFractionDigits:2,maximumFractionDigits:2});
  const number=v=>typeof window.n==='function'?window.n(v):Number(v||0);
  function logoSource(){
    try{
      if(typeof window.formalHeader==='function'){
        const box=document.createElement('div');
        box.innerHTML=window.formalHeader('','');
        const image=box.querySelector('.ub-safe-logo, img');
        const src=image?.getAttribute('src')||image?.src||'';
        if(src)return src;
      }
    }catch(_){ }
    return window.UNIBRIGHT_LOGO||'';
  }
  function invoiceReference(x,p,items,q,deposit){
    const due=number(x.total)*number(deposit)/100;
    const rows=(items||[]).length?(items||[]).map((item,i)=>`<tr><td>${i+1}. ${escapeValue(item.description||'—')}</td><td>${escapeValue(item.unit||'項')}</td><td>${number(item.quantity)}</td><td>${amount(item.unit_price)}</td><td>${amount(number(item.quantity)*number(item.unit_price))}</td></tr>`).join(''):'<tr><td colspan="5">工程項目會即時顯示喺度</td></tr>';
    const src=logoSource();
    return `<article class="a4-sheet invoice-reference-sheet" id="printArea"><div class="invoice-ref-head"><div class="invoice-ref-logo"><img src="${escapeValue(src)}" alt="恆輝建築（香港）有限公司"><div class="invoice-ref-logo-copy"><b>恆輝建築（香港）有限公司</b><span>UNIBRIGHT CONSTRUCTION (H.K.) LIMITED</span></div></div><div class="invoice-ref-title"><b>INVOICE</b><span>發票</span></div></div><div class="invoice-ref-meta"><div class="label">Invoice No.</div><div>${escapeValue(x.invoice_no||'PREVIEW-'+(typeof today==='function'?today():''))}</div><div class="label">Invoice Date</div><div>${escapeValue(x.issue_date||'')}</div><div class="label">Ref. Quotation</div><div>${escapeValue(q?.quotation_no||'')}</div><div class="label">Project Ref.</div><div>${escapeValue(p.project_no||'')}</div></div><div class="invoice-ref-party"><div><div class="title">BILL TO｜付款客戶</div><div class="body"><b>${escapeValue(p.company_name||'—')}</b><br>${escapeValue(p.client_address||'')}<br>${escapeValue(p.email||'')}</div></div><div><div class="title">PROJECT｜工程資料</div><div class="body"><b>${escapeValue(p.project_name||'—')}</b><br>${escapeValue(p.site_address||'')}<br>聯絡人：${escapeValue(p.contact_name||'')} ${escapeValue(p.phone||'')}</div></div></div><table class="invoice-ref-items"><colgroup><col style="width:54%"><col style="width:10%"><col style="width:10%"><col style="width:13%"><col style="width:13%"></colgroup><thead><tr><th>施工項目</th><th>單位</th><th>數量</th><th>單價</th><th>金額</th></tr></thead><tbody>${rows}</tbody></table><div class="invoice-ref-summary"><table><tr><td>小計 Subtotal</td><td>${amount(x.subtotal)}</td></tr><tr><td>折扣 Discount (${number(x.subtotal)?Math.round(number(x.discount_amount)/number(x.subtotal)*100):0}%)</td><td>${amount(x.discount_amount)}</td></tr><tr><td>合約總額 Total</td><td>${amount(x.total)}</td></tr><tr class="deposit"><td>本期應付 ${number(deposit)}% Deposit</td><td>${amount(due)}</td></tr></table></div><div class="invoice-ref-section-title">付款資料 PAYMENT DETAILS</div><div class="invoice-ref-payment"><div class="label">銀行轉帳／支票</div><div>中國工商銀行（亞洲）有限公司 720502009151</div><div class="label">轉數快 FPS</div><div>120437801</div><div class="label">付款條款</div><div>收取訂金${number(deposit)}%（HKD ${amount(due).replace('HK$','')}），完工7天內收取尾數。</div></div><div class="invoice-ref-sign"><div><div class="sig-head">FOR AND BEHALF OF<br><br>UNIBRIGHT CONSTRUCTION (HK) LIMITED</div><div class="sig-line"></div><div>Authorized Signature</div></div><div><div class="sig-head">客戶確認／簽署</div><div class="sig-line"></div><div>Signature <span class="date">Date</span></div></div></div></article>`;
  }
  function party(pid){
    const projectValue=typeof project==='function'?(project(pid)||{}):{};
    const clientValue=typeof clientByProject==='function'?(clientByProject(pid)||{}):{};
    return {project_id:pid,project_no:projectValue.project_no||'',project_name:projectValue.project_name||'',site_address:projectValue.site_address||'',company_name:clientValue.company_name||'',contact_name:clientValue.contact_name||'',phone:clientValue.phone||'',email:clientValue.email||'',client_address:clientValue.address||''};
  }
  function referenceStage(html){return `<div class="preview-stage" id="docStage"><div class="a4-scale-box">${html}</div></div>`}
  function referenceActions(id){return `<div class="a4-actions no-print"><button class="btn light" onclick="setNav('invoice')">返回</button><button class="btn gold" onclick="printA4()">列印／PDF</button>${id?`<button class="btn green" onclick="paymentForm('${id}')">登記收款</button>`:''}</div>`}
  async function viewInvoiceReference(id){
    try{
      const current=(D.invoices||[]).find(y=>y.id===id)||(await api('invoices','?id=eq.'+id+'&select=*'))[0];
      const items=await api('invoice_items','?invoice_id=eq.'+id+'&select=*&order=sort_order');
      const details=party(current.project_id);
      const quotation=current.quotation_id?((D.quotes||[]).find(y=>y.id===current.quotation_id)||(await api('quotations','?id=eq.'+current.quotation_id+'&select=*'))[0]):null;
      const match=String(current.notes||'').match(/DEPOSIT_PERCENT=([0-9.]+)/);
      const deposit=match?number(match[1]):50;
      app.innerHTML=`<div class="document-view-head"><div><span class="eyebrow">FORMAL INVOICE</span><h1>${escapeValue(current.invoice_no||'')}</h1><p>${escapeValue(details.project_name||'')} · 尚欠 ${amount(current.amount_due)}</p></div><div class="view-actions">${referenceActions(id)}</div></div><div class="single-preview">${referenceStage(invoiceReference(current,details,items,quotation,deposit))}</div>`;
      requestAnimationFrame(()=>document.querySelectorAll('.preview-stage').forEach(stage=>window.scaleStage(stage)));
    }catch(error){alert('開啟 Invoice 失敗：'+error.message)}
  }
  window.viewInvoice=viewInvoiceReference;
  try{viewInvoice=viewInvoiceReference}catch(_){ }
  window.updateInvoicePreview=function(){
    const context=window.__invoiceCtx;if(!context)return;
    const deposit=Math.max(0,Math.min(100,number(typeof v==='function'?v('depositPct'):document.getElementById('depositPct')?.value||50)));
    const current={invoice_no:'PREVIEW-'+(typeof today==='function'?today():''),issue_date:typeof v==='function'?(v('invoiceDate')||today()):today(),due_date:typeof v==='function'?v('invoiceDue'):'',subtotal:context.q.subtotal,discount_amount:context.q.discount_amount,total:context.q.total};
    const host=document.getElementById('invoicePreview');
    const payable=document.getElementById('depositAmount');
    if(payable)payable.textContent=amount(number(context.q.total)*deposit/100);
    if(host){host.innerHTML=`<div class="a4-scale-box">${invoiceReference(current,context.p,context.its,context.q,deposit)}</div>`;window.scaleStage(host)}
  };
  try{updateInvoicePreview=window.updateInvoicePreview}catch(_){ }
  window.invoiceDoc=invoiceReference;
  try{invoiceDoc=invoiceReference}catch(_){ }
  const previousScale=window.scaleStage;
  window.scaleStage=function(stage){
    const paper=stage?.querySelector?.('.invoice-reference-sheet');
    if(!paper){if(typeof previousScale==='function')return previousScale(stage);return}
    paper.style.transform='none';
    const width=Math.max(280,stage.clientWidth-40),scale=Math.min(1,width/842);
    paper.style.transform=`scale(${scale})`;
    paper.style.transformOrigin='top left';
    const box=paper.parentElement;
    if(box){box.style.width=(842*scale)+'px';box.style.height=(891*scale)+'px'}
  };
  const previousPrint=window.printA4;
  window.printA4=function(){
    const paper=document.querySelector('.invoice-reference-sheet');
    if(!paper){if(typeof previousPrint==='function')return previousPrint();return window.print()}
    const popup=window.open('','_blank');
    if(!popup)return window.print();
    const css=new URL('v45/invoice-reference.css',window.location.href).href;
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="zh-HK"><head><meta charset="utf-8"><title>UNIBRIGHT Invoice</title><link rel="stylesheet" href="${css}"></head><body>${paper.outerHTML}<script>window.onload=()=>setTimeout(()=>{window.focus();window.print()},250)<\/script></body></html>`);
    popup.document.close();
  };
})();
