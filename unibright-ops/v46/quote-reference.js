(()=>{
  'use strict';
  window.UNIBRIGHT_V46_QUOTATION='20260924-quotation-reference-1';
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
  function party(pid){
    const projectValue=typeof project==='function'?(project(pid)||{}):{};
    const clientValue=typeof clientByProject==='function'?(clientByProject(pid)||{}):{};
    return {project_id:pid,project_no:projectValue.project_no||'',project_name:projectValue.project_name||'',site_address:projectValue.site_address||'',company_name:clientValue.company_name||'',contact_name:clientValue.contact_name||'',phone:clientValue.phone||'',email:clientValue.email||'',client_address:clientValue.address||''};
  }
  function itemRows(items){
    return (items||[]).length?(items||[]).map((item,i)=>`<tr><td>${i+1}. ${escapeValue(item.description||'—')}</td><td>${escapeValue(item.unit||'項')}</td><td>${number(item.quantity)}</td><td>${amount(item.unit_price)}</td><td>${amount(number(item.quantity)*number(item.unit_price))}</td></tr>`).join(''):'<tr><td colspan="5">工程項目會即時顯示喺度</td></tr>';
  }
  function quoteReference(q,p,items,preview=false){
    const discountLabel=q.discount_type==='percent'&&number(q.discount_value)?` (${number(q.discount_value)}%)`:'';
    const src=logoSource();
    const tier=q.price_tier==='trade'?'同行合作報價':'工程報價';
    return `<article class="a4-sheet invoice-reference-sheet quote-reference-sheet" id="printArea"><div class="invoice-ref-head"><div class="invoice-ref-logo"><img src="${escapeValue(src)}" alt="恆輝建築（香港）有限公司"><div class="invoice-ref-logo-copy"><b>恆輝建築（香港）有限公司</b><span>UNIBRIGHT CONSTRUCTION (H.K.) LIMITED</span></div></div><div class="invoice-ref-title"><b>QUOTATION</b><span>報價單</span></div></div><div class="invoice-ref-meta"><div class="label">Quotation No.</div><div>${escapeValue(q.quotation_no||'PREVIEW')}</div><div class="label">Issue Date</div><div>${escapeValue(q.issue_date||'')}</div><div class="label">Project Ref.</div><div>${escapeValue(p.project_no||'')}</div><div class="label">Valid Until</div><div>${escapeValue(q.valid_until||'')}</div></div><div class="quote-ref-kind">${escapeValue(tier)}</div><div class="invoice-ref-party"><div><div class="title">BILL TO｜付款客戶</div><div class="body"><b>${escapeValue(p.company_name||'—')}</b><br>${escapeValue(p.client_address||'')}<br>${escapeValue(p.email||'')}</div></div><div><div class="title">PROJECT｜工程資料</div><div class="body"><b>${escapeValue(p.site_address||p.project_name||'—')}</b><br>聯絡人：${escapeValue(p.contact_name||'')}<br>電話：${escapeValue(p.phone||'')}</div></div></div><table class="invoice-ref-items"><colgroup><col style="width:41%"><col style="width:9%"><col style="width:8%"><col style="width:21%"><col style="width:21%"></colgroup><thead><tr><th>施工項目</th><th>單位</th><th>數量</th><th>單價</th><th>金額</th></tr></thead><tbody>${itemRows(items)}</tbody></table><div class="invoice-ref-summary"><table><tr><td>小計 Subtotal</td><td>${amount(q.subtotal)}</td></tr><tr><td>折扣 Discount${escapeValue(discountLabel)}</td><td>${amount(q.discount_amount)}</td></tr><tr class="deposit"><td>合約總額 Total</td><td>${amount(q.total)}</td></tr></table></div><div class="invoice-ref-section-title">付款資料 PAYMENT DETAILS</div><div class="invoice-ref-payment"><div class="label">銀行轉帳／支票</div><div>中國工商銀行（亞洲）有限公司 720502009151</div><div class="label">轉數快 FPS</div><div>120437801</div><div class="label">付款條款</div><div>收取訂金50%（HKD ${amount(number(q.total)*.5).replace('HK$','')}），完工7天內收取尾數。</div></div><div class="invoice-ref-sign"><div><div class="sig-head">FOR AND BEHALF OF<br><br>UNIBRIGHT CONSTRUCTION (HK) LIMITED</div><div class="sig-line"></div><div>Authorized Signature</div></div><div><div class="sig-head">客戶確認／簽署</div><div class="sig-line"></div><div>Signature <span class="date">Date</span></div></div></div></article>`;
  }
  window.quoteDocumentHTML=quoteReference;
  try{quoteDocumentHTML=quoteReference}catch(_){ }
  async function viewQuoteReference(id){
    try{
      const current=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+id+'&select=*'))[0];
      const items=await api('quotation_items','?quotation_id=eq.'+id+'&select=*&order=sort_order');
      const details=party(current.project_id);
      const actions=`<button class="btn light" onclick="setNav('quotation')">返回</button><button class="btn light" onclick="editQuote('${id}')">修改訂單／項目</button><button class="btn gold" onclick="printA4()">列印／PDF</button>${current.status!=='已轉Invoice'?`<button class="btn green" onclick="invoiceWorkbench('${id}')">轉 Invoice</button>`:''}`;
      app.innerHTML=`<div class="document-view-head"><div><span class="eyebrow">FORMAL QUOTATION</span><h1>${escapeValue(current.quotation_no||'')}</h1><p>${escapeValue(details.project_name||'')} · ${amount(current.total)}</p></div><div class="view-actions">${actions}</div></div><div class="single-preview"><div class="preview-stage" id="docStage"><div class="a4-scale-box">${quoteReference(current,details,items,false)}</div></div></div>`;
      requestAnimationFrame(()=>document.querySelectorAll('.preview-stage').forEach(stage=>window.scaleStage(stage)));
    }catch(error){alert('開啟報價失敗：'+error.message)}
  }
  window.viewQuote=viewQuoteReference;
  try{viewQuote=viewQuoteReference}catch(_){ }
})();
