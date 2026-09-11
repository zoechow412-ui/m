(()=>{
'use strict';
window.UNIBRIGHT_BUILD='20260911-flowfix-pdf-v3';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const clean=s=>String(s||'UNIBRIGHT').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim();
async function ensureItems(invoiceId,items){
  const exists=await api('invoice_items','?invoice_id=eq.'+invoiceId+'&select=id&limit=1');
  if(exists.length||!items?.length)return;
  await api('invoice_items','',{method:'POST',body:items.map((x,i)=>({invoice_id:invoiceId,sort_order:i+1,description:x.description,unit:x.unit,quantity:x.quantity,unit_price:x.unit_price}))});
}
window.convertInvoice=async function(qid){
  const btn=document.querySelector('button[onclick*="convertInvoice"]');
  if(btn?.dataset.busy==='1')return;
  if(btn){btn.dataset.busy='1';btn.disabled=true;}
  try{
    const ctx=window.__invoiceCtx||{};
    const q=ctx.q||D.quotes.find(x=>x.id===qid)||(await api('quotations','?id=eq.'+qid+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價單');
    const items=ctx.its||await api('quotation_items','?quotation_id=eq.'+qid+'&select=*&order=sort_order');
    const existing=await api('invoices','?quotation_id=eq.'+qid+'&select=*&order=created_at.desc&limit=1');
    let invoice;
    if(existing.length){
      invoice=existing[0];
      await ensureItems(invoice.id,items);
      try{await api('quotations','?id=eq.'+qid,{method:'PATCH',body:{status:'已轉Invoice'}})}catch(_){ }
      toast('已搵返原有 Invoice，唔會重複開單');
    }else{
      const dp=Math.max(0,Math.min(100,n(v('depositPct')||50)));
      const no=gen('INV');
      const rows=await api('invoices','',{method:'POST',body:{
        invoice_no:no,
        project_id:q.project_id,
        quotation_id:qid,
        issue_date:v('invoiceDate')||today(),
        due_date:v('invoiceDue')||addDays(today(),7),
        subtotal:n(q.subtotal),
        discount_amount:n(q.discount_amount),
        total:n(q.total),
        amount_paid:0,
        status:'未付款',
        notes:'DEPOSIT_PERCENT='+dp
      }});
      invoice=rows[0];
      if(!invoice)throw new Error('Invoice 建立失敗');
      await ensureItems(invoice.id,items);
      await api('quotations','?id=eq.'+qid,{method:'PATCH',body:{status:'已轉Invoice'}});
      try{await api('projects','?id=eq.'+q.project_id,{method:'PATCH',body:{contract_amount:n(q.total)}})}catch(e){console.warn('Project contract update skipped',e)}
      toast('Invoice 已建立，正在下載 PDF');
    }
    await refreshData();
    await viewInvoice(invoice.id);
    await wait(300);
    if(typeof exportCurrentPDF==='function')await exportCurrentPDF(`UNIBRIGHT_Invoice_${clean(invoice.invoice_no)}.pdf`);
  }catch(e){
    console.error(e);
    alert('建立 Invoice 失敗：'+String(e?.message||e));
  }finally{
    if(btn){btn.dataset.busy='0';btn.disabled=false;}
  }
};
})();