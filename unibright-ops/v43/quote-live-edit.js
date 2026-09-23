(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260923-v43-quote-live-edit-1';
window.__ub43EditQuote=null;

function ub43QuoteNo(){return window.__ub43EditQuote?.quotation_no||('PREVIEW-'+today().replaceAll('-',''))}
function ub43ProjectData(){
  const pid=val('qproject');
  if(pid==='NEW') return {
    project_no:val('npno'), project_name:val('npname'), site_address:val('nsite'),
    company_name:val('ncname'), contact_name:val('ncontact'), phone:val('nphone'),
    email:val('nemail'), client_address:val('ncaddr')
  };
  const p=project(pid)||{},c=clientByProject(pid)||{};
  return {...p,company_name:c.company_name,contact_name:c.contact_name,phone:c.phone,email:c.email,client_address:c.address};
}

function ub43Totals(){
  const s=draft.reduce((a,x)=>a+n(x.quantity)*n(x.unit_price),0);
  const type=val('dtype')||window.__ub43EditQuote?.discount_type||'percent';
  const v=n(val('dval'));
  const d=type==='fixed'?Math.min(s,v):s*v/100;
  return {s,d,t:Math.max(0,s-d),type,v};
}

window.updateQuotePreview=updateQuotePreview=function(){
  const t=ub43Totals();
  draft.forEach((x,i)=>{const line=el('line'+i);if(line)line.textContent=hk(n(x.quantity)*n(x.unit_price))});
  if(el('editorTotal'))el('editorTotal').textContent=hk(t.t);
  if(el('qsub'))el('qsub').textContent=hk(t.s);
  if(el('qdisc'))el('qdisc').textContent=hk(t.d);
  if(el('qtotal'))el('qtotal').textContent=hk(t.t);
  const host=el('quotePreview')||el('livePreview');
  if(!host)return;
  const old=window.__ub43EditQuote;
  const q={
    quotation_no:ub43QuoteNo(),
    issue_date:old?.issue_date||today(),
    valid_until:old?.valid_until||addDays(today(),90),
    discount_type:t.type,discount_value:t.v,subtotal:t.s,discount_amount:t.d,total:t.t
  };
  const its=draft.map(x=>({...x,amount:n(x.quantity)*n(x.unit_price)}));
  host.innerHTML=quoteDocumentHTML(q,ub43ProjectData(),its,true);
};

const oldSetTierLive=typeof setTierLive==='function'?setTierLive:null;
window.setTierLive=setTierLive=function(t){
  tier=t;
  if(!window.__ub43EditQuote)draft=[];
  el('tierCustomer')?.classList.toggle('on',t==='customer');
  el('tierTrade')?.classList.toggle('on',t==='trade');
  if(el('catalogTitle'))el('catalogTitle').textContent=t==='customer'?'客戶標準價目':'同行合作價目';
  if(el('planArea'))el('planArea').innerHTML=t==='customer'?planControls():'';
  drawCatalog();drawQuoteItems();updateQuotePreview();
};

function ub43DecorateEditor(editing){
  const head=document.querySelector('.workbench-head h1,.page-head h1');
  const desc=document.querySelector('.workbench-head p,.page-head p');
  if(head)head.textContent=editing?'修改報價':'建立報價';
  if(desc)desc.textContent=editing?'可直接修改工程項目、數量、單位、單價及折扣；右邊即時預覽。':'左邊輸入，右邊正式報價單即時變。';
  const save=[...document.querySelectorAll('button')].find(b=>/儲存正式報價|儲存報價/.test(b.textContent||''));
  if(save)save.textContent=editing?'儲存修改':'儲存正式報價';
  const previewTitle=document.querySelector('.preview-toolbar span,.preview-toolbar strong');
  if(previewTitle)previewTitle.textContent='即時正式預覽';
}

window.newQuote=newQuote=function(){
  window.__ub43EditQuote=null;
  tier='customer';draft=[];
  renderQuoteWorkbench();
  ub43DecorateEditor(false);
  updateQuotePreview();
};

window.editQuote=async function(id){
  try{
    const q=D.quotes.find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價單');
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    window.__ub43EditQuote=q;
    tier=q.price_tier||'customer';
    draft=(items||[]).map(x=>({id:x.id,description:x.description||'',unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)}));
    renderQuoteWorkbench();
    ub43DecorateEditor(true);
    const ps=el('qproject');if(ps){ps.value=q.project_id;projectChoiceChanged()}
    const dt=el('dtype');if(dt)dt.value=q.discount_type||'percent';
    const dv=el('dval');if(dv)dv.value=n(q.discount_value);
    drawQuoteItems();
    updateQuotePreview();
  }catch(e){alert('開啟修改報價失敗：'+String(e?.message||e))}
};

window.saveQuote=saveQuote=async function(){
  const clean=draft.filter(x=>String(x.description||'').trim()&&n(x.quantity)>0);
  if(!clean.length){toast('請加入至少一個工程項目');return}
  try{
    const c=ub43Totals();
    const editing=window.__ub43EditQuote;
    if(editing){
      const pid=val('qproject')||editing.project_id;
      await api('quotations','?id=eq.'+encodeURIComponent(editing.id),{method:'PATCH',body:{
        project_id:pid,discount_type:c.type,discount_value:c.v,subtotal:c.s,discount_amount:c.d,total:c.t,price_tier:tier
      }});
      await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(editing.id),{method:'DELETE'});
      await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
        quotation_id:editing.id,sort_order:i+1,description:String(x.description).trim(),unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
      }))});

      const linked=await api('invoices','?quotation_id=eq.'+encodeURIComponent(editing.id)+'&select=*');
      let syncNote='';
      for(const iv of linked||[]){
        const paid=(D.payments||[]).some(p=>p.invoice_id===iv.id);
        if(paid){
          syncNote='；已收款 Invoice 保持原資料';
          continue;
        }
        await api('invoices','?id=eq.'+encodeURIComponent(iv.id),{method:'PATCH',body:{subtotal:c.s,discount_amount:c.d,total:c.t}});
        await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(iv.id),{method:'DELETE'});
        await api('invoice_items','',{method:'POST',body:clean.map((x,i)=>({
          invoice_id:iv.id,sort_order:i+1,description:String(x.description).trim(),unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
        }))});
        try{await api('projects','?id=eq.'+encodeURIComponent(pid),{method:'PATCH',body:{contract_amount:c.t}})}catch(_){}
        syncNote='；未收款 Invoice 已同步';
      }
      toast('報價及工程項目已更新'+syncNote);
      window.__ub43EditQuote=null;
      await refreshData();
      await viewQuote(editing.id);
      return;
    }

    const pid=val('qproject')==='NEW'?await createProjectFromQuote():val('qproject');
    const no=gen(tier==='trade'?'TQ':'QO');
    const rows=await api('quotations','',{method:'POST',body:{
      quotation_no:no,project_id:pid,issue_date:today(),valid_until:addDays(today(),90),
      discount_type:c.type,discount_value:c.v,subtotal:c.s,discount_amount:c.d,total:c.t,status:'草稿',price_tier:tier
    }});
    const q=rows[0];
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
      quotation_id:q.id,sort_order:i+1,description:String(x.description).trim(),unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
    }))});
    toast('報價已儲存');
    await refreshData();
    await viewQuote(q.id);
  }catch(e){alert((window.__ub43EditQuote?'更新':'儲存')+'報價失敗：'+String(e?.message||e))}
};

window.renderQuotes=renderQuotes=function(){
  app.innerHTML=`<div class="page-head"><div><h1>報價單</h1><p>可即時預覽、修改工程項目，再轉 Invoice。</p></div><button class="btn" onclick="newQuote()">＋ 新報價</button></div><div class="document-cards">${D.quotes.map(q=>{const p=project(q.project_id);return `<div class="document-card quote-card"><div class="doc-icon">Q</div><div class="doc-card-main"><span class="doc-type">${q.price_tier==='trade'?'同行價':'客戶價'}</span><h3>${esc(q.quotation_no)}</h3><p>${esc(p?.project_name||'')} · ${esc(q.issue_date||'')}</p><strong>${hk(q.total)}</strong></div><div class="doc-card-actions"><button class="btn light" onclick="editQuote('${q.id}')">修改報價</button><button class="btn light" onclick="viewQuote('${q.id}')">預覽／PDF</button>${q.status!=='已轉Invoice'?`<button class="btn green" onclick="invoiceWorkbench('${q.id}')">轉 Invoice</button>`:''}</div></div>`}).join('')||'<div class="empty-state">未有報價單。</div>'}</div>`;
};

window.viewQuote=viewQuote=async function(id){
  try{
    const q=D.quotes.find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    const p0=project(q.project_id)||{},c=clientByProject(q.project_id)||{},p={...p0,company_name:c.company_name,contact_name:c.contact_name,phone:c.phone,email:c.email,client_address:c.address};
    tier=q.price_tier||'customer';
    app.innerHTML=`<div class="document-view-head"><div><span class="eyebrow">FORMAL DOCUMENT</span><h1>${esc(q.quotation_no)}</h1><p>${esc(p.project_name||'')} · ${hk(q.total)}</p></div><div class="view-actions"><button class="btn light" onclick="setNav('quotation')">返回</button><button class="btn light" onclick="editQuote('${id}')">修改報價／項目</button><button class="btn gold" onclick="window.print()">列印／PDF</button>${q.status!=='已轉Invoice'?`<button class="btn green" onclick="invoiceWorkbench('${id}')">轉 Invoice</button>`:''}</div></div><div class="single-preview">${quoteDocumentHTML(q,p,items)}</div>`;
  }catch(e){alert('開啟報價失敗：'+String(e?.message||e))}
};

window.UNIBRIGHT_V43_HEALTH=()=>({
  build:window.UNIBRIGHT_V43_BUILD,
  livePreview:typeof updateQuotePreview==='function',
  editQuote:typeof window.editQuote==='function',
  saveQuote:typeof saveQuote==='function'
});
})();