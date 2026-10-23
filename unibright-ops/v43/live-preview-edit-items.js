(()=>{
window.UNIBRIGHT_V43_BUILD='20260924-v43-live-preview-edit-items-1';

const $=id=>document.getElementById(id);
const num=v=>Number(v||0);
const enc=v=>encodeURIComponent(String(v||''));
const editId=()=>window.__ub43EditQuoteId||'';
const editQuoteObj=()=>window.__ub43EditQuote||null;

function totals(){
  const s=(draft||[]).reduce((a,x)=>a+num(x.quantity)*num(x.unit_price),0);
  const type=$('dtype')?.value||'percent';
  const dv=Math.max(0,num($('dval')?.value));
  const d=type==='fixed'?Math.min(s,dv):Math.min(s,s*dv/100);
  return {s,d,t:Math.max(0,s-d),type,dv};
}

function injectCss(){
  if(document.getElementById('ub43-css')) return;
  const s=document.createElement('style');
  s.id='ub43-css';
  s.textContent=`
    .ub43-edit-note{margin:0 0 12px;padding:11px 13px;border-radius:12px;background:#eef8ff;border:1px solid #cfe8fa;color:#0b2c5b;font-size:12px;font-weight:700}
    .ub43-preview-jump{display:none}
    .ub43-edit-btn{background:#eef8ff!important;color:#0b2c5b!important;border:1px solid #cbddea!important}
    .ub43-sync-note{display:block;margin-top:7px;font-size:11px;color:#6d7d8d}
    @media(max-width:1100px){
      .ub43-preview-jump{display:inline-flex!important;align-items:center;justify-content:center}
      .live-workbench .preview-panel{display:block!important;visibility:visible!important;opacity:1!important}
    }
  `;
  document.head.appendChild(s);
}
injectCss();

const basePreview=window.updateQuotePreview;
window.updateQuotePreview=function(){
  if(typeof basePreview==='function') basePreview();
  const q=editQuoteObj();
  if(!q) return;
  requestAnimationFrame(()=>{
    const host=$('livePreview');
    const rows=host?.querySelectorAll('.a4-meta tr');
    if(rows?.[0]?.children?.[1]) rows[0].children[1].textContent=q.quotation_no||'';
    if(rows?.[2]?.children?.[3]) rows[2].children[3].textContent=q.issue_date||'';
    if(rows?.[3]?.children?.[3]) rows[3].children[3].textContent=q.valid_until||'';
  });
};
try{updateQuotePreview=window.updateQuotePreview}catch(_){}

const baseNewQuote=window.newQuote||newQuote;
window.newQuote=function(){
  window.__ub43EditQuoteId='';
  window.__ub43EditQuote=null;
  tier='customer';
  draft=[];
  if(typeof renderQuoteEditor==='function'){
    renderQuoteEditor();
    requestAnimationFrame(()=>window.updateQuotePreview());
  }else if(typeof baseNewQuote==='function'){
    baseNewQuote();
  }
};
try{newQuote=window.newQuote}catch(_){}
try{renderQuoteWorkbench=renderQuoteEditor}catch(_){}

window.jumpQuotePreview=function(){
  const p=document.querySelector('.preview-panel');
  if(p) p.scrollIntoView({behavior:'smooth',block:'start'});
};

window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+enc(id)+'&select=*'))[0];
    if(!q) throw new Error('搵唔到報價');
    const its=await api('quotation_items','?quotation_id=eq.'+enc(id)+'&select=*&order=sort_order');
    window.__ub43EditQuoteId=id;
    window.__ub43EditQuote=q;
    tier=q.price_tier||'customer';
    draft=(its||[]).map(x=>({
      id:x.id,
      description:x.description||'',
      unit:x.unit||'項',
      quantity:num(x.quantity),
      unit_price:num(x.unit_price)
    }));
    renderQuoteEditor();

    const h=document.querySelector('.page-head h1');
    const p=document.querySelector('.page-head p');
    if(h) h.textContent='修改報價／訂單';
    if(p) p.textContent='工程項目、數量、單價同折扣都可以修改，右邊即時預覽會同步更新。';

    const back=document.querySelector('.page-head .btn.light');
    if(back){back.setAttribute('onclick',`viewQuote('${id}')`);back.textContent='返回訂單';}

    const controls=document.querySelector('.live-controls');
    if(controls){
      controls.insertAdjacentHTML('afterbegin',`<div class="ub43-edit-note">正在修改：<b>${q.quotation_no||''}</b><span class="ub43-sync-note">修改項目後，正式報價內容會直接更新。</span></div>`);
    }

    const seg=document.querySelectorAll('.segmented button');
    seg.forEach(b=>{b.disabled=true;b.title='修改現有訂單時保留原本報價類別';b.style.opacity='.65';b.style.cursor='not-allowed'});

    const qp=$('qproject');
    if(qp){
      qp.value=q.project_id||'';
      qp.disabled=true;
      if(typeof projectChoiceChanged==='function') projectChoiceChanged();
    }

    if($('dtype')) $('dtype').value=q.discount_type||'percent';
    if($('dval')) $('dval').value=num(q.discount_value);

    const save=[...document.querySelectorAll('.form-actions button,.live-card button')].find(b=>/儲存報價|儲存正式報價/.test(b.textContent||''));
    if(save){
      save.textContent='儲存修改';
      save.setAttribute('onclick',`saveEditedQuote('${id}')`);
    }

    const headActions=document.querySelector('.page-head');
    if(headActions&&!headActions.querySelector('.ub43-preview-jump')){
      const j=document.createElement('button');
      j.className='btn light ub43-preview-jump';
      j.textContent='即時預覽 ↓';
      j.onclick=window.jumpQuotePreview;
      headActions.appendChild(j);
    }

    if(typeof drawQuoteItems==='function') drawQuoteItems();
    if($('dtype')) $('dtype').value=q.discount_type||'percent';
    if($('dval')) $('dval').value=num(q.discount_value);
    window.updateQuotePreview();
  }catch(e){
    alert('開啟修改失敗：'+String(e?.message||e));
  }
};

window.saveEditedQuote=async function(id){
  const clean=(draft||[]).filter(x=>String(x.description||'').trim()&&num(x.quantity)>0);
  if(!clean.length){toast('請保留至少一個工程項目');return}
  const q=editQuoteObj()||(D.quotes||[]).find(x=>x.id===id);
  if(!q){toast('搵唔到報價');return}
  try{
    const t=totals();
    await api('quotations','?id=eq.'+enc(id),{
      method:'PATCH',
      body:{
        discount_type:t.type,
        discount_value:t.dv,
        subtotal:t.s,
        discount_amount:t.d,
        total:t.t,
        price_tier:tier
      }
    });

    await api('quotation_items','?quotation_id=eq.'+enc(id),{method:'DELETE'});
    await api('quotation_items','',{
      method:'POST',
      body:clean.map((x,i)=>({
        quotation_id:id,
        sort_order:i+1,
        description:String(x.description||'').trim(),
        unit:String(x.unit||'項').trim()||'項',
        quantity:num(x.quantity),
        unit_price:num(x.unit_price)
      }))
    });

    const linked=(D.invoices||[]).filter(x=>x.quotation_id===id);
    for(const iv of linked){
      await api('invoices','?id=eq.'+enc(iv.id),{
        method:'PATCH',
        body:{subtotal:t.s,discount_amount:t.d,total:t.t}
      });
      await api('invoice_items','?invoice_id=eq.'+enc(iv.id),{method:'DELETE'});
      if(clean.length){
        await api('invoice_items','',{
          method:'POST',
          body:clean.map((x,i)=>({
            invoice_id:iv.id,
            sort_order:i+1,
            description:String(x.description||'').trim(),
            unit:String(x.unit||'項').trim()||'項',
            quantity:num(x.quantity),
            unit_price:num(x.unit_price)
          }))
        });
      }
    }

    if(linked.length&&q.project_id){
      try{await api('projects','?id=eq.'+enc(q.project_id),{method:'PATCH',body:{contract_amount:t.t}})}catch(_){}
    }

    toast(linked.length?'報價項目已更新，相關 Invoice 已同步':'報價及工程項目已更新');
    window.__ub43EditQuoteId='';
    window.__ub43EditQuote=null;
    await refreshData();
    await viewQuote(id);
  }catch(e){
    alert('儲存修改失敗：'+String(e?.message||e));
  }
};

const baseViewQuote=window.viewQuote||viewQuote;
window.viewQuote=async function(id){
  window.__ub43EditQuoteId='';
  window.__ub43EditQuote=null;
  await baseViewQuote(id);
  const bar=document.querySelector('.a4-actions');
  if(bar&&!bar.querySelector('.ub43-edit-btn')){
    const b=document.createElement('button');
    b.className='btn light ub43-edit-btn';
    b.textContent='修改訂單／項目';
    b.onclick=()=>window.editQuote(id);
    const print=[...bar.querySelectorAll('button')].find(x=>/列印|PDF/.test(x.textContent||''));
    if(print&&print.nextSibling) bar.insertBefore(b,print.nextSibling);
    else bar.appendChild(b);
  }
};
try{viewQuote=window.viewQuote}catch(_){}

const baseRenderQuotes=window.renderQuotes||renderQuotes;
window.renderQuotes=function(){
  baseRenderQuotes();
  const cards=[...document.querySelectorAll('.document-card.quote-card')];
  cards.forEach((card,i)=>{
    const q=(D.quotes||[])[i];
    const actions=card.querySelector('.doc-card-actions');
    if(!q||!actions||actions.querySelector('.ub43-edit-btn')) return;
    const b=document.createElement('button');
    b.className='btn light ub43-edit-btn';
    b.textContent='修改項目';
    b.onclick=()=>window.editQuote(q.id);
    actions.insertBefore(b,actions.firstChild);
  });
};
try{renderQuotes=window.renderQuotes}catch(_){}

window.UNIBRIGHT_V43_HEALTH=()=>({
  build:window.UNIBRIGHT_V43_BUILD,
  livePreview:typeof window.updateQuotePreview==='function',
  editQuote:typeof window.editQuote==='function',
  saveEditedQuote:typeof window.saveEditedQuote==='function'
});
})();