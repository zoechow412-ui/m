(()=>{'use strict';
window.UNIBRIGHT_PROJECT_CENTER_BUILD='20260912-v22-project-center';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function injectProjectCenterCss(){if(document.getElementById('ub-project-center-css'))return;const s=document.createElement('style');s.id='ub-project-center-css';s.textContent=`
.project-row.ub-clickable{cursor:pointer;border-radius:14px;padding-left:8px;padding-right:8px;transition:.15s}.project-row.ub-clickable:hover{background:#f7fafb}.ub-project-center{display:grid;gap:18px}.ub-pc-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.ub-pc-head h1{margin:3px 0 4px;font-size:34px;color:#082b59}.ub-pc-head p{margin:0;color:#71839c}.ub-pc-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.ub-pc-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(320px,.92fr);gap:18px}.ub-pc-card{background:#fff;border:1px solid rgba(8,43,89,.07);border-radius:20px;box-shadow:0 14px 38px rgba(11,44,91,.08);padding:18px}.ub-pc-card h2{margin:0 0 13px;color:#082b59;font-size:21px}.ub-pc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.ub-pc-stat{border-radius:15px;padding:13px;background:#f4f8fa}.ub-pc-stat:nth-child(2){background:#fff5cf}.ub-pc-stat:nth-child(3){background:#e6f7ff}.ub-pc-stat:nth-child(4){background:#e7f8ef}.ub-pc-stat small{display:block;color:#6d8198;font-size:10px}.ub-pc-stat b{display:block;margin-top:5px;font-size:18px;color:#082b59}.ub-pc-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ub-pc-form .full{grid-column:1/-1}.ub-pc-form label{display:block;font-size:11px;font-weight:800;color:#6a7e95;margin-bottom:5px}.ub-pc-form input,.ub-pc-form select,.ub-pc-form textarea{width:100%;border:1px solid #d8e1e6;border-radius:11px;padding:10px 11px;background:#fff;color:#082b59}.ub-pc-form textarea{min-height:76px;resize:vertical}.ub-doc-section{display:grid;gap:10px}.ub-doc-row{display:grid;grid-template-columns:44px 1fr auto;gap:11px;align-items:center;border:1px solid #e4eaed;border-radius:14px;padding:11px 12px}.ub-doc-ico{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;font-weight:900;color:#fff;background:#2e91e8}.ub-doc-row.invoice .ub-doc-ico{background:#df6b6b}.ub-doc-row.receipt .ub-doc-ico{background:#2fb57d}.ub-doc-main{min-width:0}.ub-doc-main b{display:block;color:#082b59;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ub-doc-main small{display:block;color:#71839c;font-size:10px;margin-top:3px}.ub-doc-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.ub-empty{padding:16px;border:1px dashed #d7e0e4;border-radius:12px;color:#71839c;text-align:center}.ub-pc-client{display:grid;gap:6px;color:#536b87;font-size:12px}.ub-pc-client b{color:#082b59}.ub-pc-payment-list{display:grid;gap:9px}.ub-pay-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px;border-radius:13px;background:#f7fafb}.ub-pay-row b{display:block;color:#082b59}.ub-pay-row small{color:#71839c}.ub-pay-due{font-weight:900;color:#a85d18}.ub-pc-save{display:flex;justify-content:flex-end;margin-top:12px}
@media(max-width:900px){.ub-pc-grid{grid-template-columns:1fr}.ub-pc-stats{grid-template-columns:1fr 1fr}.ub-pc-head{display:block}.ub-pc-actions{justify-content:stretch;margin-top:12px}.ub-pc-actions .btn{flex:1}.ub-doc-row{grid-template-columns:42px 1fr}.ub-doc-actions{grid-column:1/-1;justify-content:stretch}.ub-doc-actions .btn{flex:1}.ub-pc-form{grid-template-columns:1fr}.ub-pc-form .full{grid-column:auto}}
`;document.head.appendChild(s)}

function pcProject(id){return D.projects.find(x=>x.id===id)}
function pcClient(id){return clientByProject(id)||{}}
function pcQuotes(id){return D.quotes.filter(x=>x.project_id===id)}
function pcInvoices(id){return D.invoices.filter(x=>x.project_id===id)}
function pcPayments(id){return D.payments.filter(x=>x.project_id===id)}
function pcReceived(id){return pcPayments(id).reduce((a,x)=>a+n(x.amount),0)}
function pcOutstanding(id){return pcInvoices(id).reduce((a,x)=>a+n(x.amount_due),0)}

function pcDocRow(kind,x){
  if(kind==='quote')return `<div class="ub-doc-row quote"><div class="ub-doc-ico">Q</div><div class="ub-doc-main"><b>${esc(x.quotation_no||'')}</b><small>${esc(x.issue_date||'')} · ${hk(x.total)}</small></div><div class="ub-doc-actions"><button class="btn light sm" onclick="viewQuote('${x.id}')">開啟／下載</button>${x.status!=='已轉Invoice'?`<button class="btn green sm" onclick="invoiceWorkbench('${x.id}')">轉 Invoice</button>`:''}</div></div>`;
  if(kind==='invoice')return `<div class="ub-doc-row invoice"><div class="ub-doc-ico">I</div><div class="ub-doc-main"><b>${esc(x.invoice_no||'')}</b><small>${esc(x.status||'')} · 尚欠 ${hk(x.amount_due)}</small></div><div class="ub-doc-actions"><button class="btn light sm" onclick="viewInvoice('${x.id}')">開啟／下載</button>${n(x.amount_due)>0?`<button class="btn green sm" onclick="paymentWorkbench('${x.id}')">登記收款</button>`:''}</div></div>`;
  return `<div class="ub-doc-row receipt"><div class="ub-doc-ico">R</div><div class="ub-doc-main"><b>${esc(x.receipt_no||'')}</b><small>${esc(x.payment_date||'')} · ${hk(x.amount)}</small></div><div class="ub-doc-actions"><button class="btn light sm" onclick="viewReceipt('${x.id}')">開啟／下載</button></div></div>`;
}

window.openProjectCenter=async function(id){
  injectProjectCenterCss();
  const p=pcProject(id);if(!p){toast('搵唔到工程');return}
  const c=pcClient(id),quotes=pcQuotes(id),invoices=pcInvoices(id),payments=pcPayments(id),received=pcReceived(id),due=pcOutstanding(id);
  let recent=[];try{recent=await api('project_progress','?project_id=eq.'+id+'&select=*&order=created_at.desc&limit=6')}catch(_){recent=[]}
  const lastNote=recent.find(x=>x.update_note)?.update_note||'';
  app.innerHTML=`<section class="ub-project-center">
    <div class="ub-pc-head"><div><span class="eyebrow">PROJECT FOLLOW-UP</span><h1>${esc(p.project_name||'工程')}</h1><p>${esc(p.project_no||'')} · ${esc(p.site_address||'')}</p></div><div class="ub-pc-actions"><button class="btn light" onclick="setNav('dashboard')">返回首頁</button><button class="btn" onclick="newQuoteForProject('${id}')">＋ 新報價</button><button class="btn light" onclick="editProject('${id}')">編輯工程資料</button></div></div>
    <div class="ub-pc-stats"><div class="ub-pc-stat"><small>工程進度</small><b>${n(p.progress_percent)}%</b></div><div class="ub-pc-stat"><small>合約金額</small><b>${hk(p.contract_amount)}</b></div><div class="ub-pc-stat"><small>累計已收</small><b>${hk(received)}</b></div><div class="ub-pc-stat"><small>Invoice 尚欠</small><b>${hk(due)}</b></div></div>
    <div class="ub-pc-grid"><div class="ub-pc-card"><h2>更新跟進</h2><div class="ub-pc-form"><div><label>狀態</label><select id="pcStatus">${['報價中','已確認','施工中','待收款','已完成'].map(x=>`<option ${p.status===x?'selected':''}>${x}</option>`).join('')}</select></div><div><label>工程進度 %</label><input id="pcProgress" type="number" min="0" max="100" value="${n(p.progress_percent)}"></div><div class="full"><label>跟進／備註</label><textarea id="pcNote" placeholder="例如：已追客戶訂金、等候防火窗到貨、下星期再跟進…">${esc(lastNote)}</textarea></div></div><div class="ub-pc-save"><button class="btn green" onclick="saveProjectFollowUp('${id}')">儲存更新</button></div></div>
    <div class="ub-pc-card"><h2>客戶／收款跟進</h2><div class="ub-pc-client"><div><b>${esc(c.company_name||'')}</b></div><div>${esc(c.contact_name||'')} ${esc(c.phone||'')}</div><div>${esc(c.email||'')}</div></div><div class="ub-pc-payment-list" style="margin-top:14px">${invoices.length?invoices.map(x=>`<div class="ub-pay-row"><div><b>${esc(x.invoice_no)}</b><small>${esc(x.status||'')}</small></div><div>${n(x.amount_due)>0?`<button class="btn green sm" onclick="paymentWorkbench('${x.id}')">收款 ${hk(x.amount_due)}</button>`:`<span class="ub-pay-due">已收清</span>`}</div></div>`).join(''):'<div class="ub-empty">未有 Invoice。</div>'}</div></div>
    <div class="ub-pc-card"><h2>Quotation｜報價單</h2><div class="ub-doc-section">${quotes.length?quotes.map(x=>pcDocRow('quote',x)).join(''):'<div class="ub-empty">未有報價單。</div>'}</div></div>
    <div class="ub-pc-card"><h2>Invoice｜付款通知</h2><div class="ub-doc-section">${invoices.length?invoices.map(x=>pcDocRow('invoice',x)).join(''):'<div class="ub-empty">未有 Invoice。</div>'}</div></div>
    <div class="ub-pc-card" style="grid-column:1/-1"><h2>Receipt｜收據</h2><div class="ub-doc-section">${payments.length?payments.map(x=>pcDocRow('receipt',x)).join(''):'<div class="ub-empty">未有 Receipt。</div>'}</div></div>
  </section>`;
  window.__currentProjectCenter=id;
}

window.saveProjectFollowUp=async function(id){
  const p=pcProject(id);if(!p)return;
  const progress=Math.max(0,Math.min(100,n(document.getElementById('pcProgress')?.value))),status=document.getElementById('pcStatus')?.value||p.status,note=(document.getElementById('pcNote')?.value||'').trim();
  try{await api('projects','?id=eq.'+id,{method:'PATCH',body:{progress_percent:progress,status}});await api('project_progress','',{method:'POST',body:{project_id:id,progress_percent:progress,status,update_note:note||'更新工程跟進'}});toast('工程跟進已更新');await refreshData();await openProjectCenter(id)}catch(e){alert('更新工程失敗：'+e.message)}
}

window.newQuoteForProject=function(id){
  newQuote();
  setTimeout(()=>{const s=document.getElementById('qproject');if(!s)return;s.value=id;if(typeof projectChoiceChanged==='function')projectChoiceChanged();},0)
}

const originalProjectRow=projectRow;
projectRow=function(p,i=0){
  return `<div class="project-row ub-clickable" onclick="openProjectCenter('${p.id}')"><div class="project-thumb thumb-${i%3+1}"></div><div class="project-main"><b>${esc(p.project_name||'未命名工程')}</b><div class="project-sub">${esc(p.project_no||'')} · ${esc(p.status||'')}</div><div class="progress-row"><div class="bar"><i style="width:${Math.min(100,n(p.progress_percent))}%"></i></div><span class="pct">${n(p.progress_percent)}%</span></div></div><button class="circle-btn" onclick="event.stopPropagation();openProjectCenter('${p.id}')">›</button></div>`
}

injectProjectCenterCss();
})();