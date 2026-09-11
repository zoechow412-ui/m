(()=>{
'use strict';
window.UNIBRIGHT_BUILD='20260911-flowfix-pdf-v1';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const errText=e=>String(e?.message||e||'');
const is23514=e=>/23514|check constraint|projects_status_check/i.test(errText(e));
const cleanName=s=>String(s||'UNIBRIGHT').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim();

async function ensureHtml2Pdf(){
  if(window.html2pdf)return window.html2pdf;
  await new Promise((resolve,reject)=>{
    const old=document.querySelector('script[data-ub-pdf]');
    if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return;}
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.async=true;s.dataset.ubPdf='1';s.onload=resolve;s.onerror=()=>reject(new Error('PDF engine 載入失敗'));
    document.head.appendChild(s);
  });
  if(!window.html2pdf)throw new Error('PDF engine 未能啟動');
  return window.html2pdf;
}

async function imgToDataURL(url){
  const r=await fetch(url,{mode:'cors',cache:'force-cache'});
  if(!r.ok)throw new Error('Logo 載入失敗');
  const b=await r.blob();
  return await new Promise((resolve,reject)=>{const fr=new FileReader();fr.onload=()=>resolve(fr.result);fr.onerror=reject;fr.readAsDataURL(b)});
}
async function prepareClone(paper){
  const clone=paper.cloneNode(true);
  clone.style.transform='none';clone.style.transformOrigin='top left';clone.style.margin='0';clone.style.boxShadow='none';
  clone.style.width='794px';clone.style.minHeight='1123px';clone.style.background='#fff';
  const imgs=[...clone.querySelectorAll('img')];
  await Promise.all(imgs.map(async img=>{try{if(img.src&&!img.src.startsWith('data:'))img.src=await imgToDataURL(img.src);if(img.decode)await img.decode()}catch(_){}}));
  const wrap=document.createElement('div');
  wrap.id='ub-pdf-render';
  Object.assign(wrap.style,{position:'fixed',left:'-10000px',top:'0',width:'794px',background:'#fff',zIndex:'-1'});
  wrap.appendChild(clone);document.body.appendChild(wrap);
  return{wrap,clone};
}
function currentDocName(){
  const paper=document.querySelector('.a4-sheet');
  const title=paper?.querySelector('.a4-title b')?.textContent?.trim()||'DOCUMENT';
  const text=paper?.innerText||'';
  const m=text.match(/(?:QO|TQ|INV|RCP|RC)[A-Z0-9\/-]*/i);
  const ref=m?.[0]||new Date().toISOString().slice(0,10);
  return cleanName(`UNIBRIGHT_${title}_${ref}`)+'.pdf';
}
window.exportCurrentPDF=async function(filename){
  const paper=document.querySelector('.a4-sheet');
  if(!paper){toast?.('未有可匯出文件');return false;}
  let holder;
  try{
    await ensureHtml2Pdf();
    toast?.('正在製作 PDF…');
    const prep=await prepareClone(paper);holder=prep.wrap;
    const name=filename||currentDocName();
    await window.html2pdf().set({
      margin:0,
      filename:name,
      image:{type:'jpeg',quality:0.99},
      html2canvas:{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#ffffff',logging:false,scrollX:0,scrollY:0},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true},
      pagebreak:{mode:['avoid-all','css','legacy']}
    }).from(prep.clone).save();
    toast?.('PDF 已匯出');
    return true;
  }catch(e){
    console.error('PDF export failed',e);
    alert('PDF 匯出失敗：'+errText(e));
    return false;
  }finally{holder?.remove()}
};

window.printCurrentA4=function(){
  const paper=document.querySelector('.a4-sheet');
  if(!paper){window.print();return;}
  const css='https://cdn.jsdelivr.net/gh/zoechow412-ui/m@efa6db81b0c1da38c1abef143c9080365fd60f6c/unibright-ops/v7/a4.css';
  const w=window.open('','_blank');
  if(!w){alert('瀏覽器阻擋咗列印視窗，請允許彈出視窗。');return;}
  w.document.open();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UNIBRIGHT</title><link rel="stylesheet" href="${css}"><style>body{margin:0;background:#fff}.a4-sheet{transform:none!important;box-shadow:none!important;margin:0!important}</style></head><body>${paper.outerHTML}<script>window.onload=()=>setTimeout(()=>{window.focus();window.print()},350)<\/script></body></html>`);
  w.document.close();
};
window.printA4=()=>window.exportCurrentPDF();

async function safeUpdateProjectContract(projectId,total){
  try{await api('projects','?id=eq.'+projectId,{method:'PATCH',body:{contract_amount:n(total)}});}
  catch(e){if(!is23514(e))throw e;console.warn('Project constraint is legacy-invalid; invoice preserved without touching project row.',e)}
}
async function ensureInvoiceFinancials(invoice){
  if(!invoice?.id)return invoice;
  const pays=await api('payments','?invoice_id=eq.'+invoice.id+'&select=amount');
  const paid=pays.reduce((a,x)=>a+n(x.amount),0),due=Math.max(0,n(invoice.total)-paid);
  if(Math.abs(n(invoice.amount_paid)-paid)>.009||Math.abs(n(invoice.amount_due)-due)>.009){
    const status=due<=.009?'已付款':paid>0?'部分付款':'未付款';
    try{
      const rows=await api('invoices','?id=eq.'+invoice.id,{method:'PATCH',body:{amount_paid:paid,amount_due:due,status}});
      return rows[0]||{...invoice,amount_paid:paid,amount_due:due,status};
    }catch(e){console.warn('Invoice financial repair skipped',e)}
  }
  return {...invoice,amount_paid:paid,amount_due:due};
}
async function ensureInvoiceItems(invoiceId,items){
  const existing=await api('invoice_items','?invoice_id=eq.'+invoiceId+'&select=id&limit=1');
  if(existing.length||!items?.length)return;
  await api('invoice_items','',{method:'POST',body:items.map((x,i)=>({invoice_id:invoiceId,sort_order:i+1,description:x.description,unit:x.unit,quantity:x.quantity,unit_price:x.unit_price,amount:x.amount??n(x.quantity)*n(x.unit_price)}))});
}

let quoteBusy=false;
window.saveQuote=async function(){
  if(quoteBusy)return;quoteBusy=true;
  const btn=document.querySelector('button[onclick*="saveQuote"]');if(btn)btn.disabled=true;
  try{
    const clean=draft.filter(x=>String(x.description||'').trim()&&n(x.quantity)>0);
    if(!clean.length){toast('請加入至少一個工程項目');return;}
    const pid=v('qproject')==='NEW'?await createProjectFromQuote():v('qproject');
    const s=clean.reduce((a,x)=>a+n(x.quantity)*n(x.unit_price),0),type=v('dtype')||'percent',dv=n(v('dval')),d=type==='fixed'?Math.min(s,dv):s*dv/100,total=Math.max(0,s-d);
    const no=gen(tier==='trade'?'TQ':'QO');
    const rows=await api('quotations','',{method:'POST',body:{quotation_no:no,project_id:pid,issue_date:today(),valid_until:addDays(today(),90),discount_type:type,discount_value:dv,subtotal:s,discount_amount:d,total,status:'草稿',price_tier:tier}});
    const q=rows[0];
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({quotation_id:q.id,sort_order:i+1,description:x.description,unit:x.unit,quantity:x.quantity,unit_price:x.unit_price,amount:n(x.quantity)*n(x.unit_price)}))});
    await refreshData();toast('報價已儲存，正在匯出 PDF');await viewQuote(q.id);await sleep(250);await exportCurrentPDF(`UNIBRIGHT_Quotation_${cleanName(no)}.pdf`);
  }catch(e){alert('儲存報價失敗：'+errText(e))}
  finally{quoteBusy=false;if(btn)btn.disabled=false;relabelActions()}
};

let invoiceBusy=false;
window.convertInvoice=async function(qid){
  if(invoiceBusy)return;invoiceBusy=true;
  const btn=document.querySelector('button[onclick*="convertInvoice"]');if(btn)btn.disabled=true;
  try{
    const ctx=window.__invoiceCtx||{},q=ctx.q||D.quotes.find(x=>x.id===qid)||(await api('quotations','?id=eq.'+qid+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價單');
    const its=ctx.its||await api('quotation_items','?quotation_id=eq.'+qid+'&select=*&order=sort_order');
    let existing=await api('invoices','?quotation_id=eq.'+qid+'&select=*&order=created_at.desc&limit=1');
    let iv;
    if(existing.length){
      iv=await ensureInvoiceFinancials(existing[0]);
      await ensureInvoiceItems(iv.id,its);
      try{await api('quotations','?id=eq.'+qid,{method:'PATCH',body:{status:'已轉Invoice'}})}catch(_){}
      toast('已搵返之前建立嘅 Invoice，冇重複開單');
    }else{
      const dp=Math.max(0,Math.min(100,n(v('depositPct')||50))),no=gen('INV');
      const rows=await api('invoices','',{method:'POST',body:{invoice_no:no,project_id:q.project_id,quotation_id:qid,issue_date:v('invoiceDate')||today(),due_date:v('invoiceDue')||addDays(today(),7),subtotal:n(q.subtotal),discount_amount:n(q.discount_amount),total:n(q.total),amount_paid:0,amount_due:n(q.total),status:'未付款',notes:'DEPOSIT_PERCENT='+dp}});
      iv=rows[0];
      await ensureInvoiceItems(iv.id,its);
      await api('quotations','?id=eq.'+qid,{method:'PATCH',body:{status:'已轉Invoice'}});
      await safeUpdateProjectContract(q.project_id,q.total);
      iv=await ensureInvoiceFinancials(iv);
      toast('Invoice 已建立，正在匯出 PDF');
    }
    await refreshData();await viewInvoice(iv.id);await sleep(250);await exportCurrentPDF(`UNIBRIGHT_Invoice_${cleanName(iv.invoice_no)}.pdf`);
  }catch(e){alert('建立 Invoice 失敗：'+errText(e))}
  finally{invoiceBusy=false;if(btn)btn.disabled=false;relabelActions()}
};

let paymentBusy=false;
window.savePayment=async function(id){
  if(paymentBusy)return;paymentBusy=true;
  const btn=document.querySelector('button[onclick*="savePayment"]');if(btn)btn.disabled=true;
  try{
    let x=D.invoices.find(y=>y.id===id)||(await api('invoices','?id=eq.'+id+'&select=*'))[0];
    if(!x)throw new Error('搵唔到 Invoice');
    x=await ensureInvoiceFinancials(x);
    const a=n(v('payAmount'));
    if(a<=0||a>n(x.amount_due)+.01){toast('收款金額不正確');return;}
    const rno=gen('RCP');
    const rows=await api('payments','',{method:'POST',body:{project_id:x.project_id,invoice_id:id,receipt_no:rno,payment_date:v('payDate')||today(),amount:a,method:v('payMethod')||'FPS 轉數快',reference_no:v('payRef').trim(),remarks:v('payRemarks').trim()}});
    const pay=rows[0];
    await ensureInvoiceFinancials(x);
    await refreshData();toast('收款已登記，正在匯出 Receipt PDF');
    if(pay?.id){await viewReceipt(pay.id);await sleep(250);await exportCurrentPDF(`UNIBRIGHT_Receipt_${cleanName(pay.receipt_no||rno)}.pdf`)}
    else{tab='receipt';render()}
  }catch(e){alert('收款失敗：'+errText(e))}
  finally{paymentBusy=false;if(btn)btn.disabled=false;relabelActions()}
};

const originalPaymentForm=window.paymentForm;
if(typeof originalPaymentForm==='function')window.paymentForm=async function(id){
  try{
    const inv=D.invoices.find(x=>x.id===id)||(await api('invoices','?id=eq.'+id+'&select=*'))[0];
    await ensureInvoiceFinancials(inv);await refreshData();
  }catch(e){console.warn(e)}
  return originalPaymentForm(id);
};

function relabelActions(){
  document.querySelectorAll('button').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    const txt=(b.textContent||'').trim();
    if(/printA4\(|window\.print\(/.test(oc)||/列印\s*\/\s*PDF|列印／PDF/.test(txt)){
      b.textContent='下載 PDF';
      b.setAttribute('onclick','exportCurrentPDF()');
      b.classList.add('ub-pdf-button');
      const parent=b.parentElement;
      if(parent&&!parent.querySelector('.ub-print-button')){
        const p=document.createElement('button');p.className='btn light sm ub-print-button';p.type='button';p.textContent='列印';p.onclick=printCurrentA4;parent.appendChild(p);
      }
    }
    if(/saveQuote\(/.test(oc))b.textContent='儲存報價並下載 PDF';
    if(/convertInvoice\(/.test(oc))b.textContent='建立 Invoice 並下載 PDF';
    if(/savePayment\(/.test(oc))b.textContent='確認收款並下載 Receipt PDF';
  });
}
const mo=new MutationObserver(()=>relabelActions());
mo.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(relabelActions,100);

window.UNIBRIGHT_HEALTH=()=>({build:window.UNIBRIGHT_BUILD,html2pdf:!!window.html2pdf,quote:typeof window.saveQuote==='function',invoice:typeof window.convertInvoice==='function',receipt:typeof window.savePayment==='function',pdf:typeof window.exportCurrentPDF==='function'});
})();