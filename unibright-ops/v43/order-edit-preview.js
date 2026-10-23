(()=>{
'use strict';
window.UNIBRIGHT_V43_BUILD='20260924-v43-live-preview-edit-items-1';
const $=id=>document.getElementById(id);
const money=v=>typeof hk==='function'?hk(Number(v||0)):'HK$'+Number(v||0).toLocaleString('en-HK',{minimumFractionDigits:2,maximumFractionDigits:2});
const num=v=>Number(v||0);
const safe=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const getParty=pid=>typeof partyFor==='function'?partyFor(pid):(()=>{
 const p=(typeof project==='function'?project(pid):null)||{};
 const c=(typeof clientByProject==='function'?clientByProject(pid):null)||{};
 return {project_id:pid,project_no:p.project_no||'',project_name:p.project_name||'',site_address:p.site_address||'',company_name:c.company_name||'',contact_name:c.contact_name||'',phone:c.phone||'',email:c.email||'',client_address:c.address||''};
})();
function qDoc(q,p,items){
 if(typeof quoteDoc==='function') return quoteDoc(q,p,items);
 if(typeof quoteDocumentHTML==='function') return quoteDocumentHTML(q,p,items);
 return '<div style="padding:30px;background:#fff">預覽載入中</div>';
}
function scale(host){
 try{
   if(typeof scaleStage==='function') return scaleStage(host);
   const paper=host?.querySelector('.a4-sheet,.formal-document'); if(!paper)return;
   paper.style.transform='none'; const width=Math.max(280,(host.clientWidth||794)-40),s=Math.min(1,width/794);
   paper.style.transform='scale('+s+')';paper.style.transformOrigin='top left';
 }catch(_){}
}
function previewAlive(){
 const p=document.querySelector('.preview-panel');
 if(p){p.style.setProperty('display','block','important');p.style.setProperty('visibility','visible','important');p.style.setProperty('opacity','1','important')}
 const h=$('livePreview'); if(h&&typeof updateQuotePreview==='function'){try{updateQuotePreview();scale(h)}catch(_){}}
}
const originalNewQuote=typeof newQuote==='function'?newQuote:null;
window.newQuote=function(){
 try{tier='customer';draft=[];if(typeof renderQuoteEditor==='function')renderQuoteEditor();else if(originalNewQuote)originalNewQuote()}catch(_){if(originalNewQuote)originalNewQuote()}
 requestAnimationFrame(previewAlive);setTimeout(previewAlive,80);
};
try{newQuote=window.newQuote}catch(_){}

const baseViewQuote=typeof viewQuote==='function'?viewQuote:null;
window.viewQuote=async function(id){
 if(!baseViewQuote)return;
 await baseViewQuote(id);
 const bar=document.querySelector('.a4-actions,.view-actions');
 if(bar&&!bar.querySelector('.ub43-edit-order')){
   const b=document.createElement('button');b.className='btn light ub43-edit-order';b.textContent='修改訂單／項目';b.onclick=()=>window.editQuoteOrder(id);
   const first=bar.querySelector('button'); if(first&&first.nextSibling)bar.insertBefore(b,first.nextSibling); else bar.prepend(b);
 }
};
try{viewQuote=window.viewQuote}catch(_){}

function totals(){
 const rows=window.__ub43Items||[];
 const subtotal=rows.reduce((a,x)=>a+num(x.quantity)*num(x.unit_price),0);
 const type=$('ub43Dtype')?.value||window.__ub43Quote?.discount_type||'percent';
 const value=num($('ub43Dval')?.value ?? window.__ub43Quote?.discount_value);
 const discount=type==='fixed'?Math.min(subtotal,value):subtotal*value/100;
 return {subtotal,discount,total:Math.max(0,subtotal-discount),type,value};
}
function renderItems(){
 const host=$('ub43Items');if(!host)return;
 const rows=window.__ub43Items||[];
 host.innerHTML='<div class="live-lines">'+(rows.length?rows.map((x,i)=>`
 <div class="live-line ub43-line">
  <input value="${safe(x.description)}" placeholder="工程項目" oninput="__ub43Items[${i}].description=this.value;ub43UpdatePreview()">
  <input value="${safe(x.unit||'項')}" placeholder="單位" oninput="__ub43Items[${i}].unit=this.value;ub43UpdatePreview()">
  <div class="qty-mini"><button onclick="ub43Qty(${i},-1)">−</button><input type="number" min="0" step="1" value="${num(x.quantity)}" oninput="__ub43Items[${i}].quantity=Number(this.value||0);ub43UpdatePreview()"><button onclick="ub43Qty(${i},1)">＋</button></div>
  <input type="number" min="0" step="0.01" value="${num(x.unit_price)}" oninput="__ub43Items[${i}].unit_price=Number(this.value||0);ub43UpdatePreview()">
  <button class="x" onclick="ub43Remove(${i})">×</button>
  <div class="amt" style="grid-column:4/6">${money(num(x.quantity)*num(x.unit_price))}</div>
 </div>`).join(''):'<small class="muted">未有工程項目，請新增。</small>')+'</div>';
 window.ub43UpdatePreview();
}
window.ub43Qty=(i,d)=>{const a=window.__ub43Items||[];if(!a[i])return;a[i].quantity=Math.max(0,num(a[i].quantity)+d);renderItems()};
window.ub43Remove=i=>{(window.__ub43Items||[]).splice(i,1);renderItems()};
window.ub43AddBlank=()=>{(window.__ub43Items||[]).push({description:'',unit:'項',quantity:1,unit_price:0});renderItems()};
window.ub43AddCatalog=code=>{const x=(D.pricing||[]).find(v=>v.item_code===code);if(!x)return;(window.__ub43Items||[]).push({description:x.description,unit:x.unit,quantity:1,unit_price:num(x.unit_price)});renderItems()};
window.ub43Catalog=function(){
 const host=$('ub43Catalog');if(!host)return;
 const q=String($('ub43Search')?.value||'').toLowerCase(),quote=window.__ub43Quote||{},t=quote.price_tier||'customer';
 const list=(D.pricing||[]).filter(x=>x.price_tier===t&&(!q||(String(x.description)+' '+String(x.item_code)).toLowerCase().includes(q)));
 host.innerHTML=list.map(x=>`<div class="live-catalog-item"><div><b>${safe(x.description)}</b><small>${money(x.unit_price)}／${safe(x.unit||'項')}</small></div><button class="btn sm" onclick="ub43AddCatalog('${safe(x.item_code)}')">加入</button></div>`).join('')||'<small>未有符合項目。</small>';
};
window.ub43UpdatePreview=function(){
 const q=window.__ub43Quote,p=window.__ub43Party,host=$('ub43Preview');if(!q||!p||!host)return;
 const t=totals(),x={...q,issue_date:$('ub43Issue')?.value||q.issue_date,valid_until:$('ub43Valid')?.value||q.valid_until,discount_type:t.type,discount_value:t.value,subtotal:t.subtotal,discount_amount:t.discount,total:t.total};
 const items=(window.__ub43Items||[]).map((r,i)=>({...r,sort_order:i+1,amount:num(r.quantity)*num(r.unit_price)}));
 if($('ub43Sub'))$('ub43Sub').textContent=money(t.subtotal);
 if($('ub43Disc'))$('ub43Disc').textContent=money(t.discount);
 if($('ub43Total'))$('ub43Total').textContent=money(t.total);
 host.innerHTML='<div class="a4-scale-box">'+qDoc(x,p,items)+'</div>';scale(host);
};
window.editQuoteOrder=async function(id){
 try{
   const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+encodeURIComponent(id)+'&select=*'))[0];
   if(!q)throw new Error('搵唔到報價單');
   const items=await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id)+'&select=*&order=sort_order');
   window.__ub43Quote={...q};window.__ub43Party=getParty(q.project_id);
   window.__ub43Items=(items||[]).map(x=>({id:x.id,description:x.description||'',unit:x.unit||'項',quantity:num(x.quantity),unit_price:num(x.unit_price)}));
   app.innerHTML=`<div class="page-head no-print"><div><h1>修改訂單／項目</h1><p>${safe(q.quotation_no)}｜左邊改項目，右邊即時預覽。</p></div><button class="btn light" onclick="viewQuote('${id}')">取消／返回</button></div>
   <div class="live-workbench ub43-editor">
    <div class="live-controls no-print">
     <div class="live-card tint-yellow"><div class="live-step"><i>1</i>訂單資料</div>
      <div class="form-grid">
       <div class="field"><label>工程</label><input value="${safe(window.__ub43Party.project_name)}" disabled></div>
       <div class="field"><label>報價單編號</label><input value="${safe(q.quotation_no)}" disabled></div>
       <div class="field"><label>報價日期</label><input id="ub43Issue" type="date" value="${safe(q.issue_date||today())}" oninput="ub43UpdatePreview()"></div>
       <div class="field"><label>有效期至</label><input id="ub43Valid" type="date" value="${safe(q.valid_until||addDays(today(),90))}" oninput="ub43UpdatePreview()"></div>
      </div>
     </div>
     <div class="live-card tint-blue"><div class="live-step"><i>2</i>加入工程項目</div>
       <div class="live-catalog-search"><input id="ub43Search" placeholder="搜尋價目…" oninput="ub43Catalog()"></div><div id="ub43Catalog" class="live-catalog"></div>
     </div>
     <div class="live-card tint-pink"><div class="live-step"><i>3</i>修改項目／數量／單價</div><div id="ub43Items"></div><button class="btn light" onclick="ub43AddBlank()">＋ 自訂項目</button></div>
     <div class="live-card tint-green"><div class="live-step"><i>4</i>折扣及儲存</div>
      <div class="form-grid"><div class="field"><label>折扣方式</label><select id="ub43Dtype" onchange="ub43UpdatePreview()"><option value="percent" ${q.discount_type==='fixed'?'':'selected'}>百分比 %</option><option value="fixed" ${q.discount_type==='fixed'?'selected':''}>固定金額 HK$</option></select></div><div class="field"><label>折扣數值</label><input id="ub43Dval" type="number" min="0" value="${num(q.discount_value)}" oninput="ub43UpdatePreview()"></div></div>
      <div class="live-total"><div><span>小計</span><b id="ub43Sub"></b></div><div><span>折扣</span><b id="ub43Disc"></b></div><div class="grand"><span>總額</span><b id="ub43Total"></b></div></div>
      <div class="form-actions"><button class="btn green" onclick="ub43Save('${id}')">儲存修改</button></div>
     </div>
    </div>
    <div class="preview-panel"><div class="preview-toolbar"><strong>訂單 A4 即時預覽</strong><button class="print-btn" onclick="printA4()">列印 / PDF</button></div><div class="preview-stage" id="ub43Preview"></div></div>
   </div>`;
   window.ub43Catalog();renderItems();requestAnimationFrame(()=>window.ub43UpdatePreview());
 }catch(e){alert('開啟修改失敗：'+String(e?.message||e))}
};
window.ub43Save=async function(id){
 const q=window.__ub43Quote,rows=(window.__ub43Items||[]).filter(x=>String(x.description||'').trim()&&num(x.quantity)>0);
 if(!q)return;if(!rows.length){toast('請保留至少一個工程項目');return}
 try{
   const t=totals();
   await api('quotations','?id=eq.'+encodeURIComponent(id),{method:'PATCH',body:{issue_date:$('ub43Issue')?.value||q.issue_date,valid_until:$('ub43Valid')?.value||q.valid_until,discount_type:t.type,discount_value:t.value,subtotal:t.subtotal,discount_amount:t.discount,total:t.total}});
   await api('quotation_items','?quotation_id=eq.'+encodeURIComponent(id),{method:'DELETE'});
   await api('quotation_items','',{method:'POST',body:rows.map((x,i)=>({quotation_id:id,sort_order:i+1,description:String(x.description).trim(),unit:String(x.unit||'項').trim()||'項',quantity:num(x.quantity),unit_price:num(x.unit_price)}))});
   try{
    const linked=(D.invoices||[]).find(x=>x.quotation_id===id);
    if(linked&&num(linked.amount_paid)<=0){
      await api('invoices','?id=eq.'+encodeURIComponent(linked.id),{method:'PATCH',body:{subtotal:t.subtotal,discount_amount:t.discount,total:t.total}});
      await api('invoice_items','?invoice_id=eq.'+encodeURIComponent(linked.id),{method:'DELETE'});
      await api('invoice_items','',{method:'POST',body:rows.map((x,i)=>({invoice_id:linked.id,sort_order:i+1,description:String(x.description).trim(),unit:String(x.unit||'項').trim()||'項',quantity:num(x.quantity),unit_price:num(x.unit_price)}))});
    }
   }catch(_){}
   toast('訂單項目已更新');await refreshData();await viewQuote(id);
 }catch(e){alert('儲存修改失敗：'+String(e?.message||e))}
};
})();