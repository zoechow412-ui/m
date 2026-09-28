(()=>{
'use strict';
window.UNIBRIGHT_V44_BUILD='20260924-v44-quote-editor-canonical-1';
window.__ub44EditQuote=null;

const $=id=>document.getElementById(id);
const num=v=>Number(v||0);
const enc=v=>encodeURIComponent(String(v||''));
const safe=s=>typeof esc==='function'?esc(s):String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>typeof hk==='function'?hk(v):'HK$'+num(v).toLocaleString('en-HK',{minimumFractionDigits:2,maximumFractionDigits:2});

function totals(){
  const s=(draft||[]).reduce((a,x)=>a+num(x.quantity)*num(x.unit_price),0);
  const type=$('dtype')?.value||window.__ub44EditQuote?.discount_type||'percent';
  const dv=Math.max(0,num($('dval')?.value??window.__ub44EditQuote?.discount_value));
  const d=type==='fixed'?Math.min(s,dv):Math.min(s,s*dv/100);
  return {s,d,t:Math.max(0,s-d),type,dv};
}
function party(){
  const pid=$('qproject')?.value;
  if($('npname')) return {
    project_no:$('npno')?.value||'',project_name:$('npname')?.value||'',site_address:$('nsite')?.value||'',
    company_name:$('ncname')?.value||'',contact_name:$('ncontact')?.value||'',phone:$('nphone')?.value||'',
    email:$('nemail')?.value||'',client_address:$('ncaddr')?.value||''
  };
  const p=typeof project==='function'?(project(pid)||{}):{},c=typeof clientByProject==='function'?(clientByProject(pid)||{}):{};
  return {...p,company_name:c.company_name||'',contact_name:c.contact_name||'',phone:c.phone||'',email:c.email||'',client_address:c.address||''};
}
function quoteForPreview(){
  const old=window.__ub44EditQuote;
  const t=totals();
  return {
    quotation_no:$('qnumber')?.value||old?.quotation_no||('PREVIEW-'+today().replaceAll('-','')),
    issue_date:$('qdate')?.value||old?.issue_date||today(),
    valid_until:$('qvalid')?.value||old?.valid_until||addDays(today(),90),
    price_tier:tier,discount_type:t.type,discount_value:t.dv,subtotal:t.s,discount_amount:t.d,total:t.t
  };
}
window.ub44UpdatePreview=function(){
  const t=totals();
  if($('editorTotal')) $('editorTotal').textContent=money(t.t);
  if($('qsub')) $('qsub').textContent=money(t.s);
  if($('qdisc')) $('qdisc').textContent=money(t.d);
  if($('qtotal')) $('qtotal').textContent=money(t.t);
  const host=$('quotePreview');
  if(!host)return;
  const items=(draft||[]).map(x=>({...x,amount:num(x.quantity)*num(x.unit_price)}));
  try{
    host.innerHTML='<div class="a4-scale-box">'+quoteDocumentHTML(quoteForPreview(),party(),items,true)+'</div>';
    const projectName=$('qproject')?.value==='NEW'?$('npname')?.value||'':party().project_name||'';
    if(window.scaleStage)requestAnimationFrame(()=>window.scaleStage(host));
  }catch(e){
    host.innerHTML='<div class="ub44-preview-error">預覽更新失敗：'+safe(e?.message||e)+'</div>';
  }
};
window.updateQuotePreview=window.ub44UpdatePreview;
try{updateQuotePreview=window.ub44UpdatePreview}catch(_){}

window.ub44DrawItems=function(){
  const host=$('quoteItems'); if(!host)return;
  if(!(draft||[]).length){
    host.innerHTML='<div class="ub44-empty">未加入工程項目。可由價目加入，或者新增自訂項目。</div>';
    ub44UpdatePreview(); return;
  }
  host.innerHTML=(draft||[]).map((x,i)=>`<div class="ub44-item">
    <div class="ub44-item-top"><b>項目 ${i+1}</b><button type="button" class="ub44-remove" onclick="ub44RemoveItem(${i})">刪除</button></div>
    <label>項目名稱<input value="${safe((x.description||'').split('\n')[0])}" oninput="ub44UpdateText(${i},this,false)"></label>
    <label>項目描述<textarea oninput="ub44UpdateText(${i},this,true)">${safe((x.description||'').split('\n').slice(1).join('\n'))}</textarea></label>
    <div class="ub44-item-grid">
      <label>單位<input value="${safe(x.unit||'項')}" oninput="draft[${i}].unit=this.value;ub44UpdatePreview()"></label>
      <label>數量<input type="number" min="0" step="any" value="${num(x.quantity)}" oninput="ub44UpdateNumber(${i},'quantity',this)"></label>
      <label>單價 HK$<input type="number" min="0" step="0.01" value="${num(x.unit_price)}" oninput="ub44UpdateNumber(${i},'unit_price',this)"></label>
      <div class="ub44-line-total"><span>小計</span><b>${money(num(x.quantity)*num(x.unit_price))}</b></div>
    </div>
  </div>`).join('');
  ub44UpdatePreview();
};
window.drawQuoteItems=window.ub44DrawItems; try{drawQuoteItems=window.ub44DrawItems}catch(_){}

window.ub44UpdateNumber=function(i,key,input){
  draft[i][key]=Math.max(0,num(input.value));
  input.closest('.ub44-item').querySelector('.ub44-line-total b').textContent=money(num(draft[i].quantity)*num(draft[i].unit_price));
  ub44UpdatePreview();
};
window.ub44UpdateText=function(i,input,details){
  const parts=String(draft[i].description||'').split('\n');
  draft[i].description=details?parts[0]+'\n'+input.value:input.value+(parts.length>1?'\n'+parts.slice(1).join('\n'):'');
  ub44UpdatePreview();
};

window.ub44AddBlank=function(){draft.push({description:'',unit:'項',quantity:1,unit_price:0});ub44DrawItems()};
window.addBlankItem=window.ub44AddBlank; try{addBlankItem=window.ub44AddBlank}catch(_){}

window.ub44RemoveItem=function(i){draft.splice(i,1);ub44DrawItems()};
window.removeItem=window.ub44RemoveItem; try{removeItem=window.ub44RemoveItem}catch(_){}

window.ub44PickItem=function(code){
  const x=(D.pricing||[]).find(v=>v.item_code===code); if(!x)return;
  draft.push({description:x.description||'',unit:x.unit||'項',quantity:1,unit_price:num(x.unit_price)});
  ub44DrawItems();
};
window.pickItem=window.ub44PickItem; try{pickItem=window.ub44PickItem}catch(_){}

window.ub44DrawCatalog=function(){
  const host=$('catalog'); if(!host)return;
  const q=($('catalogSearch')?.value||'').trim().toLowerCase();
  const list=(D.pricing||[]).filter(x=>x.price_tier===tier&&(!q||[x.description,x.item_code,x.pricing_rule].join(' ').toLowerCase().includes(q)));
  host.innerHTML=list.map(x=>`<div class="ub44-catalog-row"><div><b>${safe(x.description||'')}</b><small>${money(x.unit_price)}／${safe(x.unit||'項')}${x.pricing_rule?' · '+safe(x.pricing_rule):''}</small></div><button type="button" onclick="ub44PickItem('${safe(x.item_code)}')">＋</button></div>`).join('')||'<div class="ub44-empty">搵唔到相符項目</div>';
};
window.drawCatalog=window.ub44DrawCatalog; try{drawCatalog=window.ub44DrawCatalog}catch(_){}

window.ub44SetTier=function(t){
  if(window.__ub44EditQuote)return;
  tier=t;
  document.querySelectorAll('.segmented button').forEach((b,i)=>b.classList.toggle('on',i===(t==='customer'?0:1)));
  ub44DrawCatalog();ub44UpdatePreview();
};
window.setTierLive=window.ub44SetTier; try{setTierLive=window.ub44SetTier}catch(_){}
window.setTier=window.ub44SetTier; try{setTier=window.ub44SetTier}catch(_){}

window.ub44ProjectChanged=function(){
  const v=$('qproject')?.value||'NEW',nb=$('newProjectBox'),eb=$('existingProjectBox');
  if(nb)nb.classList.remove('hidden');
  if(eb)eb.classList.add('hidden');
  const p0=v==='NEW'?{}:(project(v)||{}),c0=v==='NEW'?{}:(clientByProject(v)||{});
  const fields={npname:p0.project_name,npno:p0.project_no,nsite:p0.site_address,ncname:c0.company_name,ncontact:c0.contact_name,nphone:c0.phone,nemail:c0.email,ncaddr:c0.address};
  Object.entries(fields).forEach(([key,value])=>{if($(key)&&v!=='NEW')$(key).value=value||''});
  if(v!=='NEW'&&eb){
    const p=party();
    eb.innerHTML=`<div class="ub44-selected"><b>${safe(p.project_name||'')}</b><span>${safe(p.project_no||'')} · ${safe(p.site_address||'')}</span><small>${safe(p.company_name||'')} ${safe(p.contact_name||'')} ${safe(p.phone||'')}</small></div>`;
  }
  ub44UpdatePreview();
};
window.projectChoiceChanged=window.ub44ProjectChanged; try{projectChoiceChanged=window.ub44ProjectChanged}catch(_){}

window.ub44RenderEditor=function(){
  const editing=window.__ub44EditQuote;
  const pOptions=(D.projects||[]).map(p=>`<option value="${safe(p.id)}">${safe(p.project_no||'')}｜${safe(p.project_name||'')}</option>`).join('');
  app.innerHTML=`<div class="page-head ub44-page-head"><div><span class="eyebrow">${editing?'EDIT QUOTATION':'QUOTATION BUILDER'}</span><h1>${editing?'修改訂單／報價':'建立報價'}</h1><p>${editing?'項目、數量、單位、單價同折扣全部可以修改；右邊即時預覽。':'左邊輸入，右邊正式文件即時預覽。'}</p></div><button class="btn light" onclick="${editing?`viewQuote('${editing.id}')`:"setNav('quotation')"}">返回</button></div>
  <div class="ub44-workbench">
    <section class="ub44-editor">
      <div class="ub44-card">
        <div class="ub44-step"><i>1</i><div><b>報價類別及工程</b><small>選擇工程資料</small></div></div>
        <div class="ub44-form-grid"><label class="full">報價編號<input id="qnumber" value="${safe(editing?.quotation_no||gen('QO'))}" oninput="ub44UpdatePreview()"></label><label>報價日期<input id="qdate" type="date" value="${safe(editing?.issue_date||today())}" oninput="ub44UpdatePreview()"></label><label>有效日期<input id="qvalid" type="date" value="${safe(editing?.valid_until||addDays(today(),90))}" oninput="ub44UpdatePreview()"></label></div>
        <div class="segmented"><button class="${tier==='customer'?'on':''}" ${editing?'disabled':''} onclick="ub44SetTier('customer')">客戶價</button><button class="${tier==='trade'?'on':''}" ${editing?'disabled':''} onclick="ub44SetTier('trade')">同行價</button></div>
        <label class="ub44-field">工程／項目<select id="qproject" ${editing?'disabled':''} onchange="ub44ProjectChanged()"><option value="NEW">＋ 新工程／自行輸入名稱</option>${pOptions}</select></label>
        <div id="newProjectBox">
          <div class="ub44-form-grid">
            <label>工程／項目名稱<input id="npname" oninput="ub44UpdatePreview()"></label>
            <label>工程編號<input id="npno" value="UB-${today().replaceAll('-','')}-${String(Date.now()).slice(-4)}" oninput="ub44UpdatePreview()"></label>
            <label class="full">施工地址<textarea id="nsite" oninput="ub44UpdatePreview()"></textarea></label>
            <label>客戶／公司名稱<input id="ncname" oninput="ub44UpdatePreview()"></label>
            <label>聯絡人<input id="ncontact" oninput="ub44UpdatePreview()"></label>
            <label>電話<input id="nphone" oninput="ub44UpdatePreview()"></label>
            <label>Email<input id="nemail" oninput="ub44UpdatePreview()"></label>
            <label class="full">客戶地址<textarea id="ncaddr" oninput="ub44UpdatePreview()"></textarea></label>
          </div>
        </div>
        <div id="existingProjectBox" class="hidden"></div>
      </div>

      <div class="ub44-card">
        <div class="ub44-step"><i>2</i><div><b>加入工程項目</b><small>由價目加入，或者自訂</small></div></div>
        <input id="catalogSearch" class="ub44-search" placeholder="搜尋工程項目…" oninput="ub44DrawCatalog()">
        <div id="catalog" class="ub44-catalog"></div>
        <button type="button" class="btn light ub44-add-custom" onclick="ub44AddBlank()">＋ 自訂工程項目</button>
      </div>

      <div class="ub44-card">
        <div class="ub44-step"><i>3</i><div><b>修改訂單項目</b><small>名稱、數量、單位、單價都可直接改</small></div></div>
        <div id="quoteItems"></div>
      </div>

      <div class="ub44-card">
        <div class="ub44-step"><i>4</i><div><b>折扣及確認</b><small>總額即時同步</small></div></div>
        <div class="ub44-form-grid">
          <label>折扣方式<select id="dtype" onchange="ub44UpdatePreview()"><option value="percent">百分比 %</option><option value="fixed">固定金額 HK$</option></select></label>
          <label>折扣數值<input id="dval" type="number" min="0" value="0" oninput="ub44UpdatePreview()"></label>
        </div>
        <div class="ub44-total"><span>小計 <b id="qsub">HK$0.00</b></span><span>折扣 <b id="qdisc">HK$0.00</b></span><strong>總額 <b id="qtotal">HK$0.00</b></strong></div>
        <div class="ub44-savebar"><div><small>即時總額</small><b id="editorTotal">HK$0.00</b></div><button class="btn green" onclick="saveQuote()">${editing?'儲存修改':'儲存正式報價'}</button></div>
      </div>
    </section>
    <aside class="ub44-preview">
      <div class="ub44-preview-head"><b>即時正式預覽</b><button class="btn light sm" onclick="printA4()">列印／PDF</button></div>
      <div id="quotePreview" class="preview-stage"></div>
    </aside>
  </div>`;
  if(editing){
    const q=$('qproject'); if(q){q.value=editing.project_id||'';}
    $('dtype').value=editing.discount_type||'percent';
    $('dval').value=num(editing.discount_value);
  }
  ub44ProjectChanged();
  ub44DrawCatalog();
  ub44DrawItems();
  ub44UpdatePreview();
};
try{renderQuoteWorkbench=window.ub44RenderEditor}catch(_){}
try{renderQuoteEditor=window.ub44RenderEditor}catch(_){}

window.newQuote=function(){
  window.__ub44EditQuote=null;
  window.__ub43EditQuote=null;
  window.__ub43EditQuoteId='';
  tier='customer'; draft=[];
  ub44RenderEditor();
};
try{newQuote=window.newQuote}catch(_){}

window.editQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+enc(id)+'&select=*'))[0];
    if(!q)throw new Error('搵唔到報價單');
    const items=await api('quotation_items','?quotation_id=eq.'+enc(id)+'&select=*&order=sort_order');
    window.__ub44EditQuote=q;
    window.__ub43EditQuote=null; window.__ub43EditQuoteId='';
    tier=q.price_tier||'customer';
    draft=(items||[]).map(x=>({id:x.id,description:x.description||'',unit:x.unit||'項',quantity:num(x.quantity),unit_price:num(x.unit_price)}));
    ub44RenderEditor();
  }catch(e){alert('開啟修改訂單失敗：'+String(e?.message||e))}
};

window.saveQuote=async function(){
  if(window.__ub44Saving)return;
  const clean=(draft||[]).filter(x=>String(x.description||'').trim()&&num(x.quantity)>0);
  if(!clean.length){toast('請加入至少一個工程項目');return}
  if(clean.length!==draft.length){toast('請填妥每項名稱及大於零的數量，或刪除空白項目');return}
  const t=totals(),editing=window.__ub44EditQuote;
  const metadata=quoteForPreview();
  if(!metadata.quotation_no.trim()||metadata.valid_until<metadata.issue_date){toast('請檢查報價編號及有效日期');return;}
  window.__ub44Saving=true;
  try{
    if(editing){
      const oldItems=await api('quotation_items','?quotation_id=eq.'+enc(editing.id)+'&select=*&order=sort_order');
      for(const [i,x] of clean.entries()){
        const body={quotation_id:editing.id,sort_order:i+1,description:String(x.description).trim(),unit:String(x.unit||'項').trim(),quantity:num(x.quantity),unit_price:num(x.unit_price)};
        if(x.id)await api('quotation_items','?id=eq.'+enc(x.id)+'&quotation_id=eq.'+enc(editing.id),{method:'PATCH',body});
        else{const added=await api('quotation_items','',{method:'POST',body});x.id=added[0].id;}
      }
      for(const old of oldItems.filter(x=>!clean.some(y=>y.id===x.id)))await api('quotation_items','?id=eq.'+enc(old.id)+'&quotation_id=eq.'+enc(editing.id),{method:'DELETE'});
      await api('quotations','?id=eq.'+enc(editing.id),{method:'PATCH',body:{
        quotation_no:metadata.quotation_no,issue_date:metadata.issue_date,valid_until:metadata.valid_until,discount_type:t.type,discount_value:t.dv,subtotal:t.s,discount_amount:t.d,total:t.t,price_tier:tier
      }});
      if(editing.project_id){
        const p=party(),original=project(editing.project_id);
        await api('projects','?id=eq.'+enc(editing.project_id),{method:'PATCH',body:{project_name:p.project_name,project_no:p.project_no,site_address:p.site_address}});
        if(original?.client_id)await api('clients','?id=eq.'+enc(original.client_id),{method:'PATCH',body:{company_name:p.company_name,contact_name:p.contact_name,phone:p.phone,email:p.email,address:p.client_address}});
      }
      toast('訂單項目已更新');
      window.__ub44EditQuote=null;
      await refreshData();
      await viewQuote(editing.id);
      return;
    }

    const pid=$('qproject')?.value==='NEW'?await createProjectFromQuote():$('qproject')?.value;
    const rows=await api('quotations','',{method:'POST',body:{
      quotation_no:metadata.quotation_no,project_id:pid,issue_date:metadata.issue_date,valid_until:metadata.valid_until,
      discount_type:t.type,discount_value:t.dv,subtotal:t.s,discount_amount:t.d,total:t.t,status:'草稿',price_tier:tier
    }});
    const q=rows[0];
    await api('quotation_items','',{method:'POST',body:clean.map((x,i)=>({
      quotation_id:q.id,sort_order:i+1,description:String(x.description).trim(),unit:String(x.unit||'項').trim()||'項',quantity:num(x.quantity),unit_price:num(x.unit_price)
    }))});
    toast('報價已儲存');
    await refreshData();
    await viewQuote(q.id);
  }catch(e){alert((editing?'更新':'儲存')+'未完成，請保留畫面並重試：'+String(e?.message||e))}
  finally{window.__ub44Saving=false;}
};
try{saveQuote=window.saveQuote}catch(_){}

window.renderQuotes=function(){
  app.innerHTML=`<div class="page-head"><div><h1>報價單</h1><p>每張報價都可以即時預覽，亦可以修改訂單項目。</p></div><button class="btn" onclick="newQuote()">＋ 新報價</button></div><div class="document-cards">${(D.quotes||[]).map(q=>{const p=project(q.project_id);return `<div class="document-card quote-card"><div class="doc-icon">Q</div><div class="doc-card-main"><span class="doc-type">${q.price_tier==='trade'?'同行價':'客戶價'}</span><h3>${safe(q.quotation_no)}</h3><p>${safe(p?.project_name||'')} · ${safe(q.issue_date||'')}</p><strong>${money(q.total)}</strong></div><div class="doc-card-actions"><button class="btn light" onclick="editQuote('${q.id}')">修改訂單／項目</button><button class="btn light" onclick="viewQuote('${q.id}')">預覽／PDF</button>${q.status!=='已轉Invoice'?`<button class="btn green" onclick="invoiceWorkbench('${q.id}')">轉 Invoice</button>`:''}</div></div>`}).join('')||'<div class="empty-state">未有報價單。</div>'}</div>`;
};
try{renderQuotes=window.renderQuotes}catch(_){}

window.viewQuote=async function(id){
  try{
    const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+enc(id)+'&select=*'))[0];
    const items=await api('quotation_items','?quotation_id=eq.'+enc(id)+'&select=*&order=sort_order');
    const p0=project(q.project_id)||{},c=clientByProject(q.project_id)||{},p={...p0,company_name:c.company_name,contact_name:c.contact_name,phone:c.phone,email:c.email,client_address:c.address};
    tier=q.price_tier||'customer';
    app.innerHTML=`<div class="document-view-head"><div><span class="eyebrow">FORMAL DOCUMENT</span><h1>${safe(q.quotation_no)}</h1><p>${safe(p.project_name||'')} · ${money(q.total)}</p></div><div class="view-actions"><button class="btn light" onclick="setNav('quotation')">返回</button><button class="btn light" onclick="editQuote('${id}')">修改訂單／項目</button><button class="btn gold" onclick="window.print()">列印／PDF</button>${q.status!=='已轉Invoice'?`<button class="btn green" onclick="invoiceWorkbench('${id}')">轉 Invoice</button>`:''}</div></div><div class="single-preview">${quoteDocumentHTML(q,p,items)}</div>`;
  }catch(e){alert('開啟報價失敗：'+String(e?.message||e))}
};
try{viewQuote=window.viewQuote}catch(_){}

window.UNIBRIGHT_V44_HEALTH=()=>({
  build:window.UNIBRIGHT_V44_BUILD,
  livePreview:typeof window.ub44UpdatePreview==='function',
  editItems:typeof window.editQuote==='function',
  canonicalEditor:true
});
})();
