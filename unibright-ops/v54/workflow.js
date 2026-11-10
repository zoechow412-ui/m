(()=>{
 'use strict';
 const $=id=>document.getElementById(id),C=window.UB54,enc=encodeURIComponent;
 const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const defaults=()=>({method:'銀行轉帳／FPS／支票',bank:'中國工商銀行（亞洲）有限公司 720502009151',fps:'120437801',stages:[{percent:50,label:'確認訂單時支付訂金'},{percent:50,label:'完工後7天內支付尾款'}]});
 let payment=defaults(),previewDraft=null,saving=false,quoteContext=null,paymentContext=null;
 function metaFor(q){return q?.notes?C.read(q.notes):{}}
 function currentMeta(){return {payment,options:(previewDraft||draft||[]).flatMap((x,i)=>x.optional?[{...x,sort_order:i+1}]:[])}}
 function activeRows(rows){return rows.filter(x=>!x.optional||x.selected)}
 const baseUpdate=window.ub50UpdatePreview;
 function update(){const all=draft;previewDraft=all;draft=activeRows(all);try{baseUpdate()}finally{draft=all;previewDraft=null}}
 window.ub50UpdatePreview=window.ub44UpdatePreview=window.updateQuotePreview=update;
 const baseDraw=window.ub44DrawItems;
 window.ub44DrawItems=function(){baseDraw();document.querySelectorAll('#quoteItems .ub44-item').forEach((card,i)=>{
   const label=document.createElement('label');label.className='ub54-choice';label.innerHTML='<input type="checkbox" '+(!draft[i].optional||draft[i].selected?'checked':'')+' onchange="ub54Choose('+i+',this.checked)"> 選用並計入總價（未剔選則列為單點待選項目）';card.querySelector('.ub44-item-top').after(label);
 });};
 window.ub54Choose=(i,on)=>{draft[i].optional=true;draft[i].selected=on;update()};
 const basePick=window.ub44PickItem;
 window.ub44PickItem=function(code){basePick(code);if($('ub54-add-mode')?.value==='optional'&&draft.length){draft[draft.length-1].optional=true;draft[draft.length-1].selected=false;window.ub44DrawItems()}};
 window.pickItem=window.ub44PickItem;
 const baseNew=window.newQuote;
 window.newQuote=function(){payment=defaults();baseNew()};
 window.editQuote=async function(id){try{
   const q=(D.quotes||[]).find(x=>x.id===id)||(await api('quotations','?id=eq.'+enc(id)+'&select=*'))[0];if(!q)throw Error('找不到報價');
   const rows=await api('quotation_items','?quotation_id=eq.'+enc(id)+'&select=*&order=sort_order'),m=metaFor(q);payment=m.payment||defaults();
   const opts=m.options||[];draft=rows.map(x=>({...x,optional:opts.some(o=>o.selected&&o.sort_order===x.sort_order),selected:true}));
   for(const x of opts.filter(x=>!x.selected))draft.push({...x,id:undefined});draft.sort((a,b)=>Number(a.sort_order)-Number(b.sort_order));
   window.__ub44EditQuote=q;window.__ub43EditQuote=null;window.__ub43EditQuoteId='';tier=q.price_tier||'customer';window.ub50RenderEditor();
 }catch(err){alert('開啟報價失敗：'+err.message)}};
 function drawStages(){const box=$('ub54-stages');if(!box)return;
   box.innerHTML=payment.stages.map((x,i)=>'<div class="ub54-stage"><label>第 '+(i+1)+' 期 %<input aria-label="第 '+(i+1)+' 期百分比" type="number" min="0" max="100" step="0.01" value="'+x.percent+'" oninput="ub54Stage('+i+',\'percent\',this.value)"></label><label>付款時間／條件<input aria-label="第 '+(i+1)+' 期付款條件" value="'+e(x.label)+'" oninput="ub54Stage('+i+',\'label\',this.value)"></label></div>').join('');
 }
 window.ub54Stage=(i,k,v)=>{payment.stages[i][k]=k==='percent'?Number(v):v;update()};
 window.ub54Count=function(count){const n=Math.max(1,Math.min(12,Number(count)||1));payment.stages=Array.from({length:n},(_,i)=>({percent:i===n-1?C.money(100-C.money(100/n)*(n-1)):C.money(100/n),label:i===0?(n===1?'確認訂單時全數支付':'確認訂單時支付'):i===n-1?'完工後7天內支付':'按雙方確認之工程進度支付'}));drawStages();update()};
 window.ub54Sort=function(){const catalog=D.pricing||[];const rank=x=>{const p=catalog.find(y=>y.price_tier===tier&&(y.item_code===x.item_code||y.description===x.description));return p?Number(p.sort_order):10000};draft=draft.map((x,i)=>({x,i})).sort((a,b)=>rank(a.x)-rank(b.x)||a.i-b.i).map(v=>v.x);window.ub44DrawItems();toast('已按價目次序排列，儲存後生效')};
 function wire(){
   if(!$('qnumber')||$('ub54-panel'))return;
   const panel=document.createElement('section');panel.id='ub54-panel';panel.className='ub54-panel';
   panel.innerHTML='<h3>付款方式及分期設定</h3><label>付款方式<input id="ub54-method" value="'+e(payment.method)+'" placeholder="例如 現金／銀行轉帳／FPS"></label><label>銀行及戶口資料<input id="ub54-bank" value="'+e(payment.bank)+'"></label><label>FPS 資料<input id="ub54-fps" value="'+e(payment.fps)+'"></label><label>分期期數<select id="ub54-count">'+Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' 期</option>').join('')+'</select></label><div id="ub54-stages"></div><p>各期百分比合計須為100%；最後一期自動調整分毫尾差。修改只影響付款安排，唔會自行登記收款。</p>';
   $('dtype').closest('.ub44-card').prepend(panel);$('ub54-count').value=payment.stages.length;$('ub54-count').onchange=x=>window.ub54Count(x.target.value);drawStages();
   for(const key of ['method','bank','fps'])$('ub54-'+key).oninput=x=>{payment[key]=x.target.value;update()};
   const mode=document.createElement('label');mode.className='ub54-add-mode';mode.innerHTML='加入方式<select id="ub54-add-mode"><option value="included">工程項目：計入總價</option><option value="optional">單點待選：不計入總價，供剔選</option></select>';$('catalogSearch').before(mode);
   const sort=document.createElement('button');sort.type='button';sort.className='btn light';sort.textContent='按價目次序排列項目';sort.onclick=window.ub54Sort;$('quoteItems').before(sort);
   const help=$('ub53-options')?.querySelector('small');if(help)help.textContent='報價 QO/MK/ZOE/YYYYMMDD/001；Invoice INV/...；收據 RCP/...。舊單不會自動改號。';
   const q=$('qnumber');if(!window.__ub44EditQuote&&/^[A-Z0-9]+\/ZOE\//.test(q.value))q.value='QO/'+q.value;
 }
 new MutationObserver(wire).observe(app,{childList:true,subtree:true});
 const baseNumber=window.ub53Number;
 window.ub53Number=function(force=false){baseNumber(force);const q=$('qnumber');if(q&&(!window.__ub44EditQuote||force)&&q.dataset.manual!=='1'&&/^[A-Z0-9]+\/ZOE\//.test(q.value)){q.value='QO/'+q.value;update()}};
 const rawApi=api;
 api=window.api=async function(table,query='',options){
   if(options?.method==='POST'&&options.body&&!Array.isArray(options.body)){
     let body={...options.body};
     if(table==='invoices'){
       const q=(D.quotes||[]).find(x=>x.id===body.quotation_id),m=metaFor(q);
       body.invoice_no=C.number('INV',q?.quotation_no||project(body.project_id)?.project_no,body.issue_date||today(),(D.invoices||[]).map(x=>x.invoice_no));
       if(m.payment)body.notes=C.write(body.notes,{payment:m.payment});
     }
     if(table==='payments'){
       const iv=(D.invoices||[]).find(x=>x.id===body.invoice_id);
       if(!/^RCP\//.test(body.receipt_no||''))body.receipt_no=C.number('RCP',iv?.invoice_no||project(body.project_id)?.project_no,body.payment_date||today(),(D.payments||[]).map(x=>x.receipt_no));
       if(window.__paymentContext?.x?.id===body.invoice_id)window.__paymentContext.receiptNo=body.receipt_no;
     }
     options={...options,body};
   }return rawApi(table,query,options);
 };
 window.saveQuote=async function(){
   if(saving)return;const all=draft;
   if(!all.length||all.some(x=>!String(x.description||'').trim()||!(Number(x.quantity)>0)||!Number.isFinite(Number(x.unit_price))||Number(x.unit_price)<0)){toast('請填妥項目名稱、數量及有效單價');return;}
   const sum=payment.stages.reduce((a,x)=>a+Number(x.percent),0);if(Math.abs(sum-100)>.001||payment.stages.some(x=>!(x.percent>0)||!x.label.trim())){toast('每期須填有效百分比及條件，百分比合計須為100%');return;}
   const editing=window.__ub44EditQuote;
   if(!editing){if(!$('ub53-district')?.value){toast('請先選擇工程地區');return;}window.ub53Number();}
   const number=$('qnumber').value.trim(),date=$('qdate').value,valid=$('qvalid').value;
   if(!number||valid<date||(D.quotes||[]).some(x=>x.quotation_no===number&&x.id!==editing?.id)){toast('請檢查報價編號及日期，編號不可重複');return;}
   const type=$('dtype').value,value=Number($('dval').value)||0,t=C.totals(all,type,value),m=currentMeta();
   saving=true;let qid=editing?.id;
   try{
     let pid=editing?.project_id;
     if(!editing)pid=$('qproject').value==='NEW'?await createProjectFromQuote():$('qproject').value;
     const body={quotation_no:number,project_id:pid,issue_date:date,valid_until:valid,discount_type:type,discount_value:value,subtotal:t.subtotal,discount_amount:t.discount,total:t.total,price_tier:tier,notes:C.write(editing?.notes,m)};
     if(editing)await api('quotations','?id=eq.'+enc(qid),{method:'PATCH',body});else{body.status='草稿';const result=await api('quotations','',{method:'POST',body});qid=result[0]?.id;if(!qid)throw Error('未取得報價紀錄');}
     const old=editing?await api('quotation_items','?quotation_id=eq.'+enc(qid)+'&select=*'):[],keep=[];
     for(const [i,x] of all.entries()){
       if(x.optional&&!x.selected)continue;
       const data={quotation_id:qid,sort_order:i+1,description:x.description.trim(),unit:x.unit||'項',quantity:Number(x.quantity),unit_price:Number(x.unit_price)};
       if(x.id&&old.some(y=>y.id===x.id)){await api('quotation_items','?id=eq.'+enc(x.id)+'&quotation_id=eq.'+enc(qid),{method:'PATCH',body:data});keep.push(x.id)}else{const row=await api('quotation_items','',{method:'POST',body:data});x.id=row[0].id;keep.push(x.id)}
     }
     for(const x of old.filter(x=>!keep.includes(x.id)))await api('quotation_items','?id=eq.'+enc(x.id)+'&quotation_id=eq.'+enc(qid),{method:'DELETE'});
     if(editing){const p=project(pid);await api('projects','?id=eq.'+enc(pid),{method:'PATCH',body:{project_name:$('npname').value,project_no:$('npno').value,site_address:$('nsite').value}});if(p?.client_id)await api('clients','?id=eq.'+enc(p.client_id),{method:'PATCH',body:{company_name:$('ncname').value,contact_name:$('ncontact').value,phone:$('nphone').value,email:$('nemail').value,address:$('ncaddr').value}});}
     await refreshData();window.__ub44EditQuote=null;await viewQuote(qid);toast('報價、單點選項及付款安排已儲存');
   }catch(err){alert('儲存未完成，請保留畫面重試：'+err.message)}finally{saving=false}
 };
 function paymentHTML(config,total){const rows=C.stages(total,config.stages);return '<div class="label">付款方式</div><div>'+e(config.method)+'</div>'+(config.bank?'<div class="label">銀行資料</div><div>'+e(config.bank)+'</div>':'')+(config.fps?'<div class="label">轉數快 FPS</div><div>'+e(config.fps)+'</div>':'')+'<div class="label">付款安排</div><div>'+rows.map((x,i)=>'第 '+(i+1)+' 期 '+e(x.percent)+'% · '+hk(x.amount)+' · '+e(x.label)).join('<br>')+'</div>'}
 const quoteHTML=window.quoteDocumentHTML;
 window.quoteDocumentHTML=function(q,p,items,...rest){
   const box=document.createElement('div');box.innerHTML=quoteHTML(q,p,items,...rest);const paper=box.querySelector('article');if(!paper)return box.innerHTML;
   const m=previewDraft?currentMeta():metaFor(q),opts=(m.options||[]).filter(x=>!x.selected);
   if(opts.length){const table=document.createElement('table');table.className='invoice-ref-items ub54-optional-table';table.innerHTML='<colgroup><col style="width:55%"><col style="width:10%"><col style="width:10%"><col style="width:25%"></colgroup><thead><tr><th>額外工程項目（自選）</th><th>單位</th><th>數量</th><th>金額</th></tr></thead><tbody>'+opts.map(x=>'<tr><td>□ '+e(x.description)+'</td><td>'+e(x.unit)+'</td><td>'+e(x.quantity)+'</td><td>'+hk(C.money(Number(x.quantity)*Number(x.unit_price)))+'</td></tr>').join('')+'</tbody>';const note=document.createElement('p');note.className='ub54-optional-note';note.textContent='以下項目供客戶選擇，費用另計。';paper.querySelector('.invoice-ref-summary').before(table,note);}
   if(m.payment)paper.querySelector('.invoice-ref-payment').innerHTML=paymentHTML(m.payment,q.total);
   return box.innerHTML;
 };
 const invoiceHTML=window.invoiceDoc;
 if(invoiceHTML)window.invoiceDoc=function(iv,...args){const box=document.createElement('div');box.innerHTML=invoiceHTML(iv,...args);const q=(D.quotes||[]).find(x=>x.id===iv.quotation_id),config=metaFor(iv).payment||metaFor(q).payment||(/PREVIEW/.test(iv.invoice_no||'')?metaFor(quoteContext).payment:null);if(config&&box.querySelector('.invoice-ref-payment'))box.querySelector('.invoice-ref-payment').innerHTML=paymentHTML(config,iv.total);return box.innerHTML};
 const oldInvoiceWorkbench=window.invoiceWorkbench;
 if(oldInvoiceWorkbench)window.invoiceWorkbench=async function(qid){quoteContext=(D.quotes||[]).find(x=>x.id===qid);await oldInvoiceWorkbench(qid);const config=metaFor(quoteContext).payment;if(config&&$('invDeposit')){$('invDeposit').value=config.stages[0].percent;window.updateInvoicePreview?.()}};
 const originalGen=gen;
 window.gen=function(type){
   if(type==='INV'&&quoteContext)return C.number('INV',quoteContext.quotation_no,$('invDate')?.value||today(),(D.invoices||[]).map(x=>x.invoice_no));
   if(type==='RCP'){const iv=paymentContext||window.__paymentContext?.x;return C.number('RCP',iv?.invoice_no||project(iv?.project_id)?.project_no,$('payDate')?.value||today(),(D.payments||[]).map(x=>x.receipt_no));}
   return originalGen(type);
 };
 const oldPaymentWorkbench=window.paymentWorkbench;
 if(oldPaymentWorkbench)window.paymentWorkbench=async function(id){paymentContext=(D.invoices||[]).find(x=>x.id===id);return oldPaymentWorkbench(id)};
 const oldViewInvoice=window.viewInvoice;
 if(oldViewInvoice)window.viewInvoice=async function(id){await oldViewInvoice(id);const head=app.querySelector('.document-view-head .view-actions,.a4-actions');if(head){const b=document.createElement('button');b.className='btn light';b.textContent='修改付款方式／分期';b.onclick=()=>window.ub54InvoiceTerms(id);head.append(b)}};
 window.ub54InvoiceTerms=function(id){
   const iv=(D.invoices||[]).find(x=>x.id===id);if(!iv)return;const prior=payment;payment=JSON.parse(JSON.stringify(metaFor(iv).payment||defaults()));
   const dialog=document.createElement('dialog');dialog.className='ub54-terms-dialog';dialog.innerHTML='<h2>修改 Invoice 付款方式及分期</h2><p>不改合約額、不改已收款及尚欠額。</p><label>付款方式<input id="ub54-method" value="'+e(payment.method)+'"></label><label>銀行資料<input id="ub54-bank" value="'+e(payment.bank)+'"></label><label>FPS 資料<input id="ub54-fps" value="'+e(payment.fps)+'"></label><label>分期期數<select id="ub54-count">'+Array.from({length:12},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' 期</option>').join('')+'</select></label><div id="ub54-stages"></div><p class="ub54-terms-error" role="alert"></p><button class="btn green" id="ub54-save-terms">儲存付款安排</button><button class="btn light" id="ub54-cancel-terms">取消</button>';
   document.body.append(dialog);$('ub54-count').value=payment.stages.length;$('ub54-count').onchange=x=>window.ub54Count(x.target.value);drawStages();for(const key of ['method','bank','fps'])$('ub54-'+key).oninput=x=>payment[key]=x.target.value;
   const close=()=>{dialog.close();dialog.remove();payment=prior};$('ub54-cancel-terms').onclick=close;dialog.addEventListener('cancel',()=>{payment=prior;dialog.remove()});
   $('ub54-save-terms').onclick=async()=>{if(Math.abs(payment.stages.reduce((a,x)=>a+Number(x.percent),0)-100)>.001||payment.stages.some(x=>!(x.percent>0)||!x.label.trim())){dialog.querySelector('.ub54-terms-error').textContent='每期百分比及條件必須有效，百分比合計須為100%';return;}try{const m=metaFor(iv);await api('invoices','?id=eq.'+enc(id),{method:'PATCH',body:{notes:C.write(iv.notes,{...m,payment})}});close();await refreshData();await window.viewInvoice(id);toast('付款安排已更新，已收款及合約額不變')}catch(err){dialog.querySelector('.ub54-terms-error').textContent='儲存失敗：'+err.message}};dialog.showModal();
 };
 // Make original artwork available without a separate image request. Filled by the release script.
 const markSources=window.UB54_MARK_SOURCES||{};
 function marks(){for(const paper of app.querySelectorAll('.invoice-reference-sheet')){
   const sign=paper.querySelector('.invoice-ref-sign');if(!sign)continue;
   if(!sign.querySelector('.ub52-authorized-panel')){const left=sign.children[0],line=left?.querySelector('.sig-line');if(line){line.classList.add('ub54-invoice-mark');line.innerHTML='<div class="ub52-authorized-panel"><div class="ub52-handwriting-crop"><img alt="公司原版簽名" src="'+e(markSources.handwriting||'/v52/authorized-handwriting.png')+'"></div><div class="ub52-stamp-crop"><img alt="UNIBRIGHT 公司原版印章" src="'+e(markSources.stamp||'/v52/company-stamp-signature.png')+'"></div></div>';}}
   for(const img of sign.querySelectorAll('img')){const src=img.getAttribute('src');if(src==='/v52/company-stamp-signature.png'&&markSources.stamp)img.src=markSources.stamp;if(src==='/v52/authorized-handwriting.png'&&markSources.handwriting)img.src=markSources.handwriting;}
 }}
 new MutationObserver(marks).observe(app,{childList:true,subtree:true});wire();marks();
})();
