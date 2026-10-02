(()=>{
 'use strict';
 window.UNIBRIGHT_WORKFLOW_BUILD='20261002-1';
 const enc=encodeURIComponent;
 const button=(label,action)=>`<button class="btn light" onclick="${action}">${label}</button>`;
 const partyForProject=id=>{const p=project(id)||{},c=clientByProject(id)||{};return {...p,company_name:c.company_name,contact_name:c.contact_name,phone:c.phone,email:c.email,client_address:c.address}};
 window.paymentForm=id=>window.paymentWorkbench(id);
 const originalPayment=window.paymentWorkbench;
 window.paymentWorkbench=async id=>{await originalPayment(id);const input=el('payAmount');if(input)input.step='0.01';};
 const oldReceiptPreview=window.updateReceiptPreview;
 window.updateReceiptPreview=function(){oldReceiptPreview();const host=el('receiptPreview');if(host){const paper=host.querySelector('.a4-sheet');if(paper&&!host.querySelector('.a4-scale-box')){const box=document.createElement('div');box.className='a4-scale-box';paper.replaceWith(box);box.appendChild(paper);}window.scaleStage(host)}};
 window.receiptDocumentHTML=function(pay,iv,p,cumulative,balance){
   const box=document.createElement('div');
   box.innerHTML=window.invoiceDoc({...iv,invoice_no:pay.receipt_no,issue_date:pay.payment_date},p,[],null,0);
   const sheet=box.querySelector('article');sheet.classList.add('receipt-reference-sheet');
   sheet.querySelector('.invoice-ref-title').innerHTML='<b>RECEIPT</b><span>收據</span>';
   sheet.querySelector('.invoice-ref-meta').innerHTML=`<div class="label">Receipt No.</div><div>${esc(pay.receipt_no)}</div><div class="label">Receipt Date</div><div>${esc(pay.payment_date)}</div><div class="label">Ref. Invoice</div><div>${esc(iv.invoice_no)}</div><div class="label">Project Ref.</div><div>${esc(p.project_no)}</div>`;
   sheet.querySelector('.invoice-ref-items').innerHTML=`<thead><tr><th>收款項目</th><th>付款方式</th><th>參考編號</th><th>金額</th></tr></thead><tbody><tr><td>收取 Invoice ${esc(iv.invoice_no)} 款項</td><td>${esc(pay.method)}</td><td>${esc(pay.reference_no||'—')}</td><td>${hk(pay.amount)}</td></tr></tbody>`;
   sheet.querySelector('.invoice-ref-summary').innerHTML=`<table><tr class="deposit"><td>本次收款</td><td>${hk(pay.amount)}</td></tr><tr><td>累計已收</td><td>${hk(cumulative)}</td></tr><tr><td>尚欠</td><td>${hk(balance)}</td></tr></table>`;
   sheet.querySelector('.invoice-ref-section-title').textContent='收款備註 PAYMENT REMARKS';
   sheet.querySelector('.invoice-ref-payment').innerHTML=`<div class="label">備註</div><div>${esc(pay.remarks||'—')}</div>`;
   return sheet.outerHTML;
 };
 window.viewReceipt=async id=>{
   try{const pay=(await api('payments','?id=eq.'+enc(id)+'&select=*'))[0];if(!pay)throw Error('收據不存在');
     const iv=(await api('invoices','?id=eq.'+enc(pay.invoice_id)+'&select=*'))[0];
     const payments=await api('payments','?invoice_id=eq.'+enc(pay.invoice_id)+'&select=amount');
     const paid=payments.reduce((s,x)=>s+n(x.amount),0),p=partyForProject(pay.project_id);
     app.innerHTML=`<div class="document-view-head"><div><h1>${esc(pay.receipt_no)}</h1><p>${esc(p.project_name)}</p></div><div class="view-actions">${button('返回工程',`projectHub('${pay.project_id}')`)}${button('修改收款／收據',`editReceipt('${id}')`)}${button('列印／PDF','exportCurrentPDF()')}</div></div><div class="preview-stage"><div class="a4-scale-box">${receiptDocumentHTML(pay,iv,p,paid,Math.max(0,n(iv.total)-paid))}</div></div>`;
     document.querySelectorAll('.preview-stage').forEach(window.scaleStage);
   }catch(e){alert('開啟收據失敗：'+e.message)}
 };
 let savingPayment=false;
 window.savePayment=async id=>{
   if(savingPayment)return;
   const a=Number(val('payAmount'));if(!Number.isFinite(a)||a<=0){toast('請輸入有效收款金額');return;}
   savingPayment=true;let saved=null;
   const saveButton=app.querySelector('[onclick^="savePayment"]');if(saveButton){saveButton.disabled=true;saveButton.textContent='正在儲存收款…'}
   try{
     const iv=(await api('invoices','?id=eq.'+enc(id)+'&select=*'))[0];if(!iv)throw Error('搵唔到 Invoice');
     const ctx=window.__paymentContext;if(!ctx||ctx.x.id!==id)throw Error('收款頁資料不一致，請重新開啟 Invoice');
     const receiptNo=ctx.receiptNo||(ctx.receiptNo=gen('RCP'));
     // Reuse receipt number on retry after an uncertain network result.
     saved=(await api('payments','?receipt_no=eq.'+enc(receiptNo)+'&select=*'))[0];
     if(!saved){if(a>n(iv.amount_due)+.001)throw Error('收款超過尚欠金額，請重新核對');saved=(await api('payments','',{method:'POST',body:{project_id:iv.project_id,invoice_id:id,receipt_no:receiptNo,payment_date:val('payDate')||today(),amount:Math.round(a*100)/100,method:val('payMethod'),reference_no:val('payRef').trim(),remarks:val('payRemarks').trim()}}))[0];}
     if(!saved?.id)throw Error('資料庫未確認收款，請勿重複提交');
     await refreshData();await projectHub(iv.project_id);toast('收款已入帳；工程總數及 Receipt 已更新');
   }catch(e){alert((saved?'收款已儲存，但畫面更新失敗；請重新開啟工程，勿重複登記。':'收款未完成：')+e.message)}
   finally{savingPayment=false;if(saveButton?.isConnected){saveButton.disabled=false;saveButton.textContent='確認收款＋出 Receipt'}}
 };
 window.newProjectQuote=id=>{newQuote();el('qproject').value=id;ub44ProjectChanged()};
 window.editProjectInfo=id=>showProjectForm(project(id));
 window.editProject=id=>window.projectHub(id);
 window.projectHub=async id=>{
   const p=project(id);if(!p){toast('搵唔到工程');return;}
   tab='projects';const qs=D.quotes.filter(x=>x.project_id===id),ivs=D.invoices.filter(x=>x.project_id===id),pays=D.payments.filter(x=>x.project_id===id);
   const received=pays.reduce((s,x)=>s+n(x.amount),0);
   const cards=(rows,html)=>rows.length?rows.map(html).join(''):'<p class="muted">未有記錄</p>';
   app.innerHTML=`<div class="page-head"><div><h1>${esc(p.project_name)}</h1><p>${esc(p.project_no)} · ${esc(p.site_address||'')}</p></div>${button('返回工程列表',"setNav('projects')")}</div><div class="form-card"><div class="finance"><span>合約額<b>${hk(p.contract_amount)}</b></span><span>已收款<b>${hk(received)}</b></span><span>合約尚欠<b>${hk(Math.max(0,n(p.contract_amount)-received))}</b></span></div><div class="view-actions">${button('修改工程／客戶資料',`editProjectInfo('${id}')`)}${button('新增報價／工程細項',`newProjectQuote('${id}')`)}</div></div><section class="form-card"><h2>報價及工程細項</h2>${cards(qs,q=>`<div class="ub48-row"><div><b>${esc(q.quotation_no)}</b><p>${hk(q.total)}</p></div><div class="view-actions">${button('修改工程細項',`editQuote('${q.id}')`)}${button('報價／PDF',`viewQuote('${q.id}')`)}${ivs.some(iv=>iv.quotation_id===q.id)?'':button('生成 Invoice',`invoiceWorkbench('${q.id}')`)}</div></div>`)}</section><section class="form-card"><h2>Invoice 及收款</h2>${cards(ivs,iv=>`<div class="ub48-row"><div><b>${esc(iv.invoice_no)}</b><p>總額 ${hk(iv.total)} · 已收 ${hk(iv.amount_paid)} · 尚欠 ${hk(iv.amount_due)}</p></div><div class="view-actions">${button('Invoice／PDF',`viewInvoice('${iv.id}')`)}${button('修改 Invoice',`editInvoice('${iv.id}')`)}${n(iv.amount_due)>0?button('登記收款／生成 Receipt',`paymentWorkbench('${iv.id}')`):'<span>已收清</span>'}</div></div>`)}</section><section class="form-card"><h2>Receipt 收據</h2>${cards(pays,pay=>`<div class="ub48-row"><div><b>${esc(pay.receipt_no)}</b><p>${esc(pay.payment_date)} · ${hk(pay.amount)}</p></div><div class="view-actions">${button('Receipt／PDF',`viewReceipt('${pay.id}')`)}${button('修改收款／收據',`editReceipt('${pay.id}')`)}</div></div>`)}</section>`;
 };
 let invoiceEdit=null,receiptEdit=null,documentSaving=false;
 const field=(label,id,value,type='text')=>`<label class="ub44-field">${label}<input id="${id}" type="${type}" step="any" value="${esc(value??'')}"></label>`;
 window.editInvoice=async id=>{
   try{const iv=(await api('invoices','?id=eq.'+enc(id)+'&select=*'))[0];if(!iv)throw Error('Invoice 不存在');
     invoiceEdit={iv,items:await api('invoice_items','?invoice_id=eq.'+enc(id)+'&select=*&order=sort_order')};
     app.innerHTML=`<div class="page-head"><h1>修改 Invoice</h1>${button('返回工程',`projectHub('${iv.project_id}')`)}</div><div class="document-workbench"><section class="editor-pane"><div class="form-card">${field('Invoice 編號','editInvNo',iv.invoice_no)}${field('日期','editInvDate',iv.issue_date,'date')}${field('到期日','editInvDue',iv.due_date,'date')}${field('訂金百分比','editInvDeposit',parseDeposit(iv),'number')}${field('折扣金額 HK$','editInvDiscount',iv.discount_amount,'number')}<div id="editInvItems"></div>${button('新增工程細項','addInvoiceItem()')}<p id="invoiceEditTotal"></p>${button('儲存 Invoice','saveEditedInvoice()')}</div></section><aside class="preview-pane"><div class="preview-toolbar">即時正式預覽</div><div id="editInvPreview" class="preview-stage"></div></aside></div>`;
     ['editInvNo','editInvDate','editInvDue','editInvDeposit','editInvDiscount'].forEach(k=>el(k).addEventListener('input',updateEditedInvoicePreview));drawInvoiceItems();
   }catch(e){alert('開啟 Invoice 修改失敗：'+e.message)}
 };
 window.drawInvoiceItems=()=>{el('editInvItems').innerHTML=invoiceEdit.items.map((x,i)=>`<div class="step-card"><b>工程細項 ${i+1}</b>${button('移除',`removeInvoiceItem(${i})`)}<label class="ub44-field">名稱及描述<textarea oninput="updateInvoiceItem(${i},'description',this.value)">${esc(x.description)}</textarea></label>${['unit','quantity','unit_price'].map((k,j)=>`<label class="ub44-field">${['單位','數量','單價'][j]}<input type="${j?'number':'text'}" step="any" value="${esc(x[k])}" oninput="updateInvoiceItem(${i},'${k}',this.value)"></label>`).join('')}</div>`).join('');updateEditedInvoicePreview()};
 window.updateInvoiceItem=(i,k,v)=>{invoiceEdit.items[i][k]=k==='quantity'||k==='unit_price'?Number(v):v;updateEditedInvoicePreview()};
 window.addInvoiceItem=()=>{invoiceEdit.items.push({description:'',unit:'項',quantity:1,unit_price:0});drawInvoiceItems()};
 window.removeInvoiceItem=i=>{invoiceEdit.items.splice(i,1);drawInvoiceItems()};
 function editedInvoice(){const subtotal=Math.round(invoiceEdit.items.reduce((s,x)=>s+n(x.quantity)*n(x.unit_price),0)*100)/100,discount=Number(val('editInvDiscount'));return {...invoiceEdit.iv,invoice_no:val('editInvNo'),issue_date:val('editInvDate'),due_date:val('editInvDue'),subtotal,discount_amount:discount,total:Math.round((subtotal-discount)*100)/100,notes:String(invoiceEdit.iv.notes||'').replace(/DEPOSIT_PERCENT=[0-9.]+;?\s*/,'')};}
 window.updateEditedInvoicePreview=()=>{const iv=editedInvoice();el('invoiceEditTotal').textContent='總額 '+hk(iv.total);const host=el('editInvPreview');host.innerHTML='<div class="a4-scale-box">'+invoiceDoc(iv,partyForProject(iv.project_id),invoiceEdit.items,D.quotes.find(q=>q.id===iv.quotation_id),Number(val('editInvDeposit'))||0)+'</div>';scaleStage(host)};
 window.saveEditedInvoice=async()=>{
   if(documentSaving)return;documentSaving=true;
   try{const iv=editedInvoice(),dp=Number(val('editInvDeposit'));
     if(!iv.invoice_no.trim()||!iv.issue_date||!invoiceEdit.items.length||invoiceEdit.items.some(x=>!x.description.trim()||!Number.isFinite(x.quantity)||x.quantity<=0||!Number.isFinite(x.unit_price)||x.unit_price<0)||!Number.isFinite(iv.total)||iv.discount_amount<0||iv.total<0||!Number.isFinite(dp)||dp<0||dp>100)throw Error('請核對項目、數量、單價、折扣及日期');
     const current=(await api('invoices','?id=eq.'+enc(iv.id)+'&select=*'))[0];if(iv.total<n(current.amount_paid))throw Error('Invoice 總額不可少於已收款');
     const existing=await api('invoice_items','?invoice_id=eq.'+enc(iv.id)+'&select=id');
     for(const [i,x] of invoiceEdit.items.entries()){
       const body={invoice_id:iv.id,sort_order:i+1,description:x.description,unit:x.unit,quantity:x.quantity,unit_price:x.unit_price};
       const rows=await api('invoice_items',x.id?'?id=eq.'+enc(x.id)+'&invoice_id=eq.'+enc(iv.id):'',{method:x.id?'PATCH':'POST',body});if(!rows[0]?.id)throw Error('項目未能儲存');x.id=rows[0].id;
     }
     for(const x of existing)if(!invoiceEdit.items.some(y=>y.id===x.id))await api('invoice_items','?id=eq.'+enc(x.id)+'&invoice_id=eq.'+enc(iv.id),{method:'DELETE'});
     await api('invoices','?id=eq.'+enc(iv.id),{method:'PATCH',body:{invoice_no:iv.invoice_no,issue_date:iv.issue_date,due_date:iv.due_date||null,subtotal:iv.subtotal,discount_amount:iv.discount_amount,total:iv.total,notes:'DEPOSIT_PERCENT='+dp+'; '+iv.notes}});
     await refreshData();await viewInvoice(iv.id);toast('Invoice 已更新；原報價及其他 Invoice 保留不變');
   }catch(e){alert('Invoice 修改未完成：'+e.message)}finally{documentSaving=false}
 };
 window.editReceipt=async id=>{
   try{receiptEdit=(await api('payments','?id=eq.'+enc(id)+'&select=*'))[0];if(!receiptEdit)throw Error('收據不存在');const p=receiptEdit;
     app.innerHTML=`<div class="page-head"><h1>修改收款／Receipt</h1>${button('返回工程',`projectHub('${p.project_id}')`)}</div><div class="form-card"><p>修改金額會同步已收款、Invoice 尚欠及工程收款總數。</p>${field('收據編號','erNo',p.receipt_no)}${field('收款日期','erDate',p.payment_date,'date')}${field('收款金額','erAmount',p.amount,'number')}${field('付款方式','erMethod',p.method)}${field('參考編號','erRef',p.reference_no)}${field('備註','erNote',p.remarks)}${button('儲存收款修改','saveEditedReceipt()')}</div>`;
   }catch(e){alert('開啟收據修改失敗：'+e.message)}
 };
 window.saveEditedReceipt=async()=>{
   if(documentSaving)return;documentSaving=true;
   try{const p=receiptEdit,a=Number(val('erAmount'));if(!Number.isFinite(a)||a<=0||!val('erNo').trim()||!val('erDate'))throw Error('請核對金額、編號及日期');
     const iv=(await api('invoices','?id=eq.'+enc(p.invoice_id)+'&select=*'))[0],all=await api('payments','?invoice_id=eq.'+enc(p.invoice_id)+'&select=id,amount');
     if(all.filter(x=>x.id!==p.id).reduce((s,x)=>s+n(x.amount),0)+a>n(iv.total)+.001)throw Error('累計收款不可超過 Invoice 總額');
     const rows=await api('payments','?id=eq.'+enc(p.id),{method:'PATCH',body:{receipt_no:val('erNo').trim(),payment_date:val('erDate'),amount:Math.round(a*100)/100,method:val('erMethod'),reference_no:val('erRef'),remarks:val('erNote')}});if(!rows[0]?.id)throw Error('資料庫未確認修改');
     await refreshData();await projectHub(p.project_id);toast('收款、收據及總數已同步更新');
   }catch(e){alert('收款修改未完成：'+e.message)}finally{documentSaving=false}
 };
 const originalViewInvoice=window.viewInvoice;
 window.viewInvoice=async id=>{await originalViewInvoice(id);const iv=D.invoices.find(x=>x.id===id),actions=app.querySelector('.a4-actions');if(iv&&actions){actions.insertAdjacentHTML('beforeend',button('修改 Invoice',`editInvoice('${id}')`)+button('返回工程',`projectHub('${iv.project_id}')`));if(n(iv.amount_due)<=0)actions.querySelector('[onclick^="paymentForm"]')?.remove()}};
 const originalProjects=window.renderProjects;
 window.renderProjects=()=>{originalProjects();app.querySelectorAll('[onclick^="editProject("]').forEach(b=>b.textContent='開啟工程／單據');const head=app.querySelector('.page-head');if(head)head.insertAdjacentHTML('beforeend',button('新增工程','newProject()'))};
 const previousGo=window.UB33.go;
 window.UB33.go=name=>previousGo(name==='documents'?'projects':name);
 function cleanNavigation(){document.querySelectorAll('[data-nav="documents"]').forEach(b=>b.remove());app.querySelectorAll('[onclick]').forEach(b=>{if((b.getAttribute('onclick')||'').includes("UB33.go('documents')"))b.remove()})}
 new MutationObserver(cleanNavigation).observe(document.body,{childList:true,subtree:true});cleanNavigation();
 const style=document.createElement('style');style.textContent='.ub48-row{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid #e4ebef}.ub48-row .view-actions{flex-wrap:wrap}.receipt-reference-sheet .invoice-ref-items th:first-child{text-align:left!important}@media(max-width:800px){.ub48-row{align-items:flex-start;flex-direction:column}}';document.head.appendChild(style);
})();
