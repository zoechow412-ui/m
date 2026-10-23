(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260924-v43-quote-edit-live-preview-1';

const by43=id=>document.getElementById(id);
const q43=()=>window.__ub43EditingQuote||null;

function party43(projectId){
  try{return partyFor(projectId)}catch(_){}
  const p=(D.projects||[]).find(x=>x.id===projectId)||{};
  const c=typeof clientByProject==='function'?clientByProject(projectId)||{}:{};
  return {...p,company_name:c.company_name,contact_name:c.contact_name,phone:c.phone,email:c.email,client_address:c.address};
}
function totals43(){
  const s=(draft||[]).reduce((a,x)=>a+n(x.quantity)*n(x.unit_price),0);
  const type=(by43('dtype')?.value||'percent');
  const dv=n(by43('dval')?.value||0);
  const d=type==='fixed'?Math.min(s,dv):s*dv/100;
  return {s,d,t:Math.max(0,s-d),type,dv};
}
function liveParty43(){
  const v=by43('qproject')?.value;
  if(v&&v!=='NEW')return party43(v);
  return {
    project_no:by43('npno')?.value||'',
    project_name:by43('npname')?.value||'',
    site_address:by43('nsite')?.value||'',
    company_name:by43('ncname')?.value||'',
    contact_name:by43('ncontact')?.value||'',
    phone:by43('nphone')?.value||'',
    email:by43('nemail')?.value||'',
    client_address:by43('ncaddr')?.value||''
  };
}
function preview43(){
  const host=by43('livePreview')||by43('quotePreview');
  if(!host)return;
  const t=totals43(), editing=q43();
  const q={
    quotation_no:editing?.quotation_no||('PREVIEW-'+today().replaceAll('-','')),
    issue_date:editing?.issue_date||today(),
    valid_until:editing?.valid_until||addDays(today(),90),
    discount_type:t.type,
    discount_value:t.dv,
    subtotal:t.s,
    discount_amount:t.d,
    total:t.t
  };
  const its=(draft||[]).map(x=>({...x,amount:n(x.quantity)*n(x.unit_price)}));
  let html='';
  try{
    if(typeof quoteDoc==='function')html=quoteDoc(q,liveParty43(),its);
    else if(typeof quoteDocumentHTML==='function')html=quoteDocumentHTML(q,liveParty43(),its,true);
  }catch(e){ console.error('quote preview',e); }
  if(!html)return;
  if(host.id==='livePreview'){
    host.innerHTML='<div class="a4-scale-box">'+html+'</div>';
    try{scaleStage(host)}catch(_){}
  }else{
    host.innerHTML=html;
  }
  const t1=by43('qsub'),t2=by43('qdisc'),t3=by43('qtotal'),t4=by43('editorTotal');
  if(t1)t1.textContent=hk(t.s); if(t2)t2.textContent=hk(t.d); if(t3)t3.textContent=hk(t.t); if(t4)t4.textContent=hk(t.t);
}
window.updateQuotePreview=preview43;

function bind43(){
  document.querySelectorAll('.live-controls input,.live-controls textarea,.live-controls select,.editor-pane input,.editor-pane textarea,.editor-pane select').forEach(x=>{
    if(x.dataset.ub43Bound)return;
    x.dataset.ub43Bound='1';
    x.addEventListener('input',preview43);
    x.addEventListener('change',preview43);
  });
}
function renderEditor43(){
  if(typeof renderQuoteEditor==='function'){
    renderQuoteEditor();
    bind43();
    preview43();
    return;
  }
  if(typeof renderQuoteWorkbench==='function'){
    renderQuoteWorkbench();
    bind43();
    preview43();
  }
}
window.newQuote=function(){
  window.__ub43EditingQuote=null;
  tier='customer';
  draft=[];
  renderEditor43();
};

window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價');
    const its=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    window.__ub43EditingQuote=q;
    tier=q.price_tier||'customer';
    draft=(its||[]).map(x=>({id:x.id,description:x.description||'',unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)}));
    renderEditor43();

    const sel=by43('qproject');
    if(sel){sel.value=q.project_id; try{projectChoiceChanged()}catch(_){}}
    const dtype=by43('dtype'), dval=by43('dval');
    if(dtype)dtype.value=q.discount_type||'percent';
    if(dval)dval.value=n(q.discount_value);
    const h=document.querySelector('.page-head h1,.workbench-head h1');
    if(h)h.textContent='修改報價';
    const p=document.querySelector('.page-head p,.workbench-head p');
    if(p)p.textContent='可修改工程項目、數量、單位、單價及折扣，右邊即時預覽。';
    const saveBtn=[...document.querySelectorAll('button')].find(b=>/儲存報價|儲存正式報價/.test(b.textContent||''));
    if(saveBtn)saveBtn.textContent='儲存修改';
    bind43(); preview43();
  }catch(e){alert('開啟修改失敗：'+String(e?.message||e))}
};

window.saveQuote=async function(){
  const clean=(draft||[]).filter(x=>String(x.description||'').trim()&&n(x.quantity)>0);
  if(!clean.length){toast('請加入至少一個工程項目');return}
  try{
    const editing=q43();
    let pid=by43('qproject')?.value||'';
    if(pid==='NEW'){
      if(editing) pid=editing.project_id;
      else pid=await createProjectFromQuote();
    }
    const t=totals43();

    if(editing){
      await api('quotations','?id=eq.'+encodeURIComponent(editing.id),{method:'PATCH',body:{
        project_id:pid,
        discount_type:t.type,
        discount_value:t.dv,
        subtotal:t.s,
        discount_amount:t.d,
        total:t.t,
        price_tier:tier
      }});
      await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(editing.id),{method:'DELETE'});
      await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
        quotation_id:editing.id,sort_order:i+1,description:String(x.description).trim(),
        unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
      }))});

      const linked=(D.invoices||[]).filter(x=>x.quotation_id===editing.id);
      for(const iv of linked){
        await api('invoices','?id=eq.'+encodeURIComponent(iv.id),{method:'PATCH',body:{
          subtotal:t.s,discount_amount:t.d,total:t.t
        }});
        await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(iv.id),{method:'DELETE'});
        await api('invoice_items','',{method:'POST',body:clean.map((x,i)=>({
          invoice_id:iv.id,sort_order:i+1,description:String(x.description).trim(),
          unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
        }))});
      }
      if(linked.length){
        try{await api('projects','?id=eq.'+encodeURIComponent(pid),{method:'PATCH',body:{contract_amount:t.t}})}catch(_){}
      }
      window.__ub43EditingQuote=null;
      toast('報價及工程項目已更新');
      await refreshData();
      await viewQuote(editing.id);
      return;
    }

    const no=gen(tier==='trade'?'TQ':'QO');
    const rows=await api('quotations','',{method:'POST',body:{
      quotation_no:no,project_id:pid,issue_date:today(),valid_until:addDays(today(),90),
      discount_type:t.type,discount_value:t.dv,subtotal:t.s,discount_amount:t.d,total:t.t,
      status:'草稿',price_tier:tier
    }});
    const q=rows[0];
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
      quotation_id:q.id,sort_order:i+1,description:String(x.description).trim(),
      unit:x.unit||'項',quantity:n(x.quantity),unit_price:n(x.unit_price)
    }))});
    toast('報價已儲存');
    await refreshData();
    await viewQuote(q.id);
  }catch(e){alert('儲存報價失敗：'+String(e?.message||e))}
};

const oldView=window.viewQuote||((typeof viewQuote==='function')?viewQuote:null);
window.viewQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    const its=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    const p=party43(q.project_id);
    tier=q.price_tier||'customer';
    let doc='';
    if(typeof quoteDoc==='function')doc=quoteDoc(q,p,its);
    else if(typeof quoteDocumentHTML==='function')doc=quoteDocumentHTML(q,p,its);
    const staged=(typeof stage==='function')?stage(doc):doc;
    const canInvoice=q.status!=='已轉Invoice';
    app.innerHTML='<div class="single-preview">'+staged+'</div>'+
      '<div class="a4-actions no-print">'+
      '<button class="btn light" onclick="setNav(\'quotation\')">返回</button>'+
      '<button class="btn light" onclick="editQuote(\''+id+'\')">修改報價／項目</button>'+
      '<button class="btn gold" onclick="'+(typeof printA4==='function'?'printA4()':'window.print()')+'">列印 / PDF</button>'+
      (canInvoice?'<button class="btn green" onclick="'+(typeof convertForm==='function'?'convertForm':'invoiceWorkbench')+'(\''+id+'\')">轉 Invoice</button>':'')+
      '</div>';
    try{scaleAll()}catch(_){}
  }catch(e){
    if(oldView)return oldView(id);
    alert('開啟報價失敗：'+String(e?.message||e));
  }
};
try{viewQuote=window.viewQuote}catch(_){}

const oldRenderQuotes=(typeof renderQuotes==='function')?renderQuotes:null;
window.renderQuotes=function(){
  if(!oldRenderQuotes)return;
  oldRenderQuotes();
  document.querySelectorAll('.document-card.quote-card').forEach(card=>{
    if(card.querySelector('.ub43-edit'))return;
    const preview=[...card.querySelectorAll('button')].find(b=>/預覽/.test(b.textContent||''));
    const m=(preview?.getAttribute('onclick')||'').match(/viewQuote\('([^']+)'\)/);
    if(!m)return;
    const b=document.createElement('button');
    b.className='btn light ub43-edit';
    b.textContent='修改';
    b.setAttribute('onclick',"editQuote('"+m[1]+"')");
    const actions=card.querySelector('.doc-card-actions');
    if(actions)actions.insertBefore(b,actions.firstChild);
  });
};
try{renderQuotes=window.renderQuotes}catch(_){}

setTimeout(()=>{
  if((typeof tab!=='undefined'&&tab==='quotation')&&document.querySelector('.document-card.quote-card'))window.renderQuotes();
},300);
})();