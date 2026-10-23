(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260923-v43-quote-preview-edit-items-1';
const baseRenderQuoteEditor=window.renderQuoteEditor;
const baseSaveQuote=window.saveQuote;
const baseViewQuote=window.viewQuote;
const baseSetTier=window.setTier;
const get=(id)=>document.getElementById(id);
const num=(v)=>Number(v||0);
const cloneItems=(a)=>(a||[]).map(x=>({description:x.description||'',unit:x.unit||'項',quantity:num(x.quantity)||0,unit_price:num(x.unit_price)||0}));
function totals(){
  const s=(draft||[]).reduce((a,x)=>a+num(x.quantity)*num(x.unit_price),0);
  const type=(get('dtype')?.value||'percent');
  const v=Math.max(0,num(get('dval')?.value));
  const d=type==='fixed'?Math.min(s,v):Math.min(s,s*v/100);
  return {s,d,t:Math.max(0,s-d),type,v};
}
function forcePreview(){
  const panel=document.querySelector('.preview-panel');
  const host=get('livePreview');
  if(panel){panel.style.display='block';panel.style.visibility='visible';panel.style.opacity='1'}
  if(host){
    host.style.display='block';
    host.style.visibility='visible';
    host.style.opacity='1';
    host.style.minHeight='620px';
    try{ if(typeof window.updateQuotePreview==='function') window.updateQuotePreview(); }catch(_){}
  }
}
function patchEditorForExisting(){
  const st=window.__ub43QuoteEdit;
  if(!st)return;
  const q=st.q;
  const sel=get('qproject');
  if(sel){sel.value=q.project_id;try{projectChoiceChanged()}catch(_){}}
  const dt=get('dtype'); if(dt)dt.value=q.discount_type||'percent';
  const dv=get('dval'); if(dv)dv.value=num(q.discount_value);
  const h=document.querySelector('.page-head h1'); if(h)h.textContent='修改報價';
  const p=document.querySelector('.page-head p'); if(p)p.textContent='可直接修改工程項目、數量、單位、單價及折扣；右邊即時預覽。';
  const save=[...document.querySelectorAll('button')].find(b=>/儲存報價|儲存正式報價/.test(b.textContent||''));
  if(save)save.textContent='儲存修改';
  const back=document.querySelector('.page-head button.btn.light');
  if(back){back.textContent='返回報價';back.setAttribute('onclick',`viewQuote('${q.id}')`)}
  try{ if(typeof calcQuote==='function')calcQuote(); else if(typeof window.updateQuotePreview==='function')window.updateQuotePreview(); }catch(_){}
  forcePreview();
}
window.renderQuoteEditor=function(){
  if(typeof baseRenderQuoteEditor!=='function')return;
  const st=window.__ub43QuoteEdit;
  if(st && Array.isArray(st.items)) draft=cloneItems(st.items);
  baseRenderQuoteEditor();
  requestAnimationFrame(()=>{patchEditorForExisting();forcePreview()});
  setTimeout(()=>{patchEditorForExisting();forcePreview()},80);
};
try{renderQuoteEditor=window.renderQuoteEditor}catch(_){}
window.setTier=function(t){
  const st=window.__ub43QuoteEdit;
  if(st){
    st.items=cloneItems(draft);
    tier=t;
    st.q.price_tier=t;
    window.renderQuoteEditor();
    return;
  }
  if(typeof baseSetTier==='function')return baseSetTier(t);
};
try{setTier=window.setTier}catch(_){}
window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價');
    const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
    window.__ub43QuoteEdit={id,q,items:cloneItems(items)};
    tier=q.price_tier||'customer';
    draft=cloneItems(items);
    window.renderQuoteEditor();
  }catch(e){alert('開啟修改報價失敗：'+String(e?.message||e))}
};
window.cancelQuoteEdit=function(){window.__ub43QuoteEdit=null;};
window.saveQuote=async function(){
  const st=window.__ub43QuoteEdit;
  if(!st){
    return typeof baseSaveQuote==='function'?baseSaveQuote():undefined;
  }
  const clean=(draft||[]).filter(x=>String(x.description||'').trim()&&num(x.quantity)>0);
  if(!clean.length){toast('請保留至少一個工程項目');return}
  try{
    const c=totals();
    const projectId=get('qproject')?.value||st.q.project_id;
    await api('quotations','?id=eq.'+encodeURIComponent(st.id),{method:'PATCH',body:{
      project_id:projectId,
      discount_type:c.type,
      discount_value:c.v,
      subtotal:c.s,
      discount_amount:c.d,
      total:c.t,
      price_tier:tier
    }});
    await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(st.id),{method:'DELETE'});
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
      quotation_id:st.id,
      sort_order:i+1,
      description:String(x.description||'').trim(),
      unit:String(x.unit||'項').trim()||'項',
      quantity:num(x.quantity),
      unit_price:num(x.unit_price)
    }))});
    const linked=(D.invoices||[]).find(x=>x.quotation_id===st.id);
    window.__ub43QuoteEdit=null;
    toast(linked?'報價項目已更新；已建立嘅 Invoice 保持原資料':'報價及工程項目已更新');
    await refreshData();
    await window.viewQuote(st.id);
  }catch(e){alert('修改報價失敗：'+String(e?.message||e))}
};
try{saveQuote=window.saveQuote}catch(_){}
window.viewQuote=async function(id){
  await baseViewQuote(id);
  const host=document.querySelector('.a4-actions,.view-actions');
  if(host && !host.querySelector('.ub43-edit-quote')){
    const b=document.createElement('button');
    b.className='btn light ub43-edit-quote';
    b.textContent='修改報價／項目';
    b.onclick=()=>window.editQuote(id);
    const first=host.querySelector('button');
    if(first?.nextSibling)host.insertBefore(b,first.nextSibling);else host.appendChild(b);
  }
};
try{viewQuote=window.viewQuote}catch(_){}
document.addEventListener('input',e=>{
  if(e.target.closest?.('.live-controls'))requestAnimationFrame(forcePreview);
},true);
document.addEventListener('change',e=>{
  if(e.target.closest?.('.live-controls'))requestAnimationFrame(forcePreview);
},true);
})();