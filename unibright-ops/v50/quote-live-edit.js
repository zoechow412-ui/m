(()=>{
'use strict';
window.UNIBRIGHT_V50_BUILD='20261016-v50-quote-live-edit-1';

const $=id=>document.getElementById(id);
const num=v=>Number(v||0);
const enc=v=>encodeURIComponent(String(v||''));
const safe=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>typeof hk==='function'?hk(v):'HK$'+num(v).toLocaleString('en-HK',{minimumFractionDigits:2,maximumFractionDigits:2});

function quoteTotals50(){
  const s=(draft||[]).reduce((a,x)=>a+num(x.quantity)*num(x.unit_price),0);
  const type=$('dtype')?.value||window.__ub44EditQuote?.discount_type||'percent';
  const v=Math.max(0,num($('dval')?.value??window.__ub44EditQuote?.discount_value));
  const d=type==='fixed'?Math.min(s,v):Math.min(s,s*v/100);
  return {s,d,t:Math.max(0,s-d),type,v};
}
function party50(){
  const pid=$('qproject')?.value||window.__ub44EditQuote?.project_id||'';
  const p=pid&&pid!=='NEW'&&typeof project==='function'?(project(pid)||{}):{};
  const c=pid&&pid!=='NEW'&&typeof clientByProject==='function'?(clientByProject(pid)||{}):{};
  return {
    project_no:$('npno')?.value||p.project_no||'',
    project_name:$('npname')?.value||p.project_name||'',
    site_address:$('nsite')?.value||p.site_address||'',
    company_name:$('ncname')?.value||c.company_name||'',
    contact_name:$('ncontact')?.value||c.contact_name||'',
    phone:$('nphone')?.value||c.phone||'',
    email:$('nemail')?.value||c.email||'',
    client_address:$('ncaddr')?.value||c.address||''
  };
}
function quoteMeta50(){
  const old=window.__ub44EditQuote||{};
  const t=quoteTotals50();
  return {
    quotation_no:$('qnumber')?.value||old.quotation_no||('PREVIEW-'+today().replaceAll('-','')),
    issue_date:$('qdate')?.value||old.issue_date||today(),
    valid_until:$('qvalid')?.value||old.valid_until||addDays(today(),90),
    price_tier:tier||old.price_tier||'customer',
    discount_type:t.type,discount_value:t.v,subtotal:t.s,discount_amount:t.d,total:t.t
  };
}
function scale50(){
  const host=$('quotePreview'); if(!host)return;
  host.style.display='block';host.style.visibility='visible';host.style.opacity='1';
  const paper=host.querySelector('.invoice-reference-sheet,.a4-sheet,.formal-document');
  if(!paper)return;
  paper.style.display='block';paper.style.visibility='visible';paper.style.opacity='1';
  if(typeof window.ub49ScaleQuotePreview==='function'){window.ub49ScaleQuotePreview(host);return;}
  if(typeof window.scaleStage==='function'){window.scaleStage(host);return;}
}
window.ub50UpdatePreview=function(){
  const host=$('quotePreview'); if(!host)return;
  const t=quoteTotals50();
  if($('editorTotal'))$('editorTotal').textContent=money(t.t);
  if($('qsub'))$('qsub').textContent=money(t.s);
  if($('qdisc'))$('qdisc').textContent=money(t.d);
  if($('qtotal'))$('qtotal').textContent=money(t.t);
  const items=(draft||[]).map(x=>({...x,amount:num(x.quantity)*num(x.unit_price)}));
  try{
    if(typeof quoteDocumentHTML!=='function')throw new Error('正式預覽模板未載入');
    host.innerHTML='<div class="a4-scale-box">'+quoteDocumentHTML(quoteMeta50(),party50(),items,true)+'</div>';
    host.dataset.preview='ready';
    requestAnimationFrame(scale50);
    setTimeout(scale50,60);
  }catch(e){
    host.innerHTML='<div class="ub50-preview-error"><b>即時預覽未能顯示</b><span>'+safe(e?.message||e)+'</span></div>';
    host.dataset.preview='error';
  }
};
window.ub44UpdatePreview=window.ub50UpdatePreview;
window.updateQuotePreview=window.ub50UpdatePreview;
try{updateQuotePreview=window.ub50UpdatePreview}catch(_){}

function wireEditor(){
  const work=document.querySelector('.ub44-workbench');if(!work)return;
  const preview=document.querySelector('.ub44-preview');
  if(preview){preview.style.display='block';preview.hidden=false;}
  const host=$('quotePreview');if(host){host.style.display='block';host.hidden=false;}
  work.querySelectorAll('input,textarea,select').forEach(node=>{
    if(node.dataset.ub50Live==='1')return;
    node.dataset.ub50Live='1';
    node.addEventListener('input',window.ub50UpdatePreview);
    node.addEventListener('change',window.ub50UpdatePreview);
  });
  if($('quoteItems')&&typeof window.ub44DrawItems==='function')window.ub44DrawItems();
  window.ub50UpdatePreview();
}
window.ub50WireEditor=wireEditor;

const baseRender=window.ub44RenderEditor;
window.ub50RenderEditor=function(){
  if(typeof baseRender!=='function')throw new Error('報價編輯器未載入');
  baseRender();
  const editing=window.__ub44EditQuote;
  if(editing){
    const q=$('qproject');if(q){q.value=editing.project_id||'';}
    if(typeof window.ub44ProjectChanged==='function')window.ub44ProjectChanged();
    if($('dtype'))$('dtype').value=editing.discount_type||'percent';
    if($('dval'))$('dval').value=num(editing.discount_value);
  }
  wireEditor();
  requestAnimationFrame(wireEditor);
  setTimeout(wireEditor,120);
};
window.renderQuoteWorkbench=window.ub50RenderEditor;
window.renderQuoteEditor=window.ub50RenderEditor;
try{renderQuoteWorkbench=window.ub50RenderEditor}catch(_){}
try{renderQuoteEditor=window.ub50RenderEditor}catch(_){}

window.newQuote=function(){
  window.__ub44EditQuote=null;
  window.__ub43EditQuote=null;
  window.__ub43EditQuoteId='';
  tier='customer';
  draft=[];
  window.ub50RenderEditor();
};
try{newQuote=window.newQuote}catch(_){}

window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+enc(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價單');
    const items=await api('quotation_items','?quotation_id=eq.'+enc(id)+'&select=*&order=sort_order');
    window.__ub44EditQuote=q;
    window.__ub43EditQuote=null;
    window.__ub43EditQuoteId='';
    tier=q.price_tier||'customer';
    draft=(items||[]).map(x=>({
      id:x.id,
      description:x.description||'',
      unit:x.unit||'項',
      quantity:num(x.quantity),
      unit_price:num(x.unit_price)
    }));
    window.ub50RenderEditor();
    const title=document.querySelector('.ub44-page-head h1');
    if(title)title.textContent='修改訂單／報價項目';
  }catch(e){alert('開啟修改訂單失敗：'+String(e?.message||e))}
};
try{editQuote=window.editQuote}catch(_){}

const baseRenderQuotes=window.renderQuotes;
window.renderQuotes=function(){
  if(typeof baseRenderQuotes==='function')baseRenderQuotes();
  document.querySelectorAll('.quote-card').forEach(card=>{
    const preview=[...card.querySelectorAll('button')].find(b=>/預覽|PDF/.test(b.textContent||''));
    const action=(preview?.getAttribute('onclick')||'');
    const id=(action.match(/viewQuote\(['"]([^'"]+)/)||[])[1];
    if(!id)return;
    let edit=[...card.querySelectorAll('button')].find(b=>/修改訂單|修改.*項目/.test(b.textContent||''));
    if(!edit){
      edit=document.createElement('button');edit.className='btn light';edit.textContent='修改訂單／項目';edit.onclick=()=>window.editQuote(id);
      preview?.parentElement?.insertBefore(edit,preview);
    }else{
      edit.textContent='修改訂單／項目';
      edit.onclick=()=>window.editQuote(id);
      edit.removeAttribute('onclick');
    }
  });
};
try{renderQuotes=window.renderQuotes}catch(_){}

window.addEventListener('resize',scale50);
window.UNIBRIGHT_V50_HEALTH=()=>({
  build:window.UNIBRIGHT_V50_BUILD,
  livePreview:typeof window.ub50UpdatePreview==='function',
  editQuote:typeof window.editQuote==='function',
  itemEditor:typeof window.ub44DrawItems==='function'
});
})();