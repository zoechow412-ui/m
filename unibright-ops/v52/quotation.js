(()=>{
 'use strict';
 const PAGE_H=1191,CONTENT_H=1075,PDF_W=595.28,PDF_H=841.89,enc=encodeURIComponent;
 window.UNIBRIGHT_V52_BUILD='20261028-readable-quote-catalog';
 let exporting=false,priceId='',saving=false;
 const el=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=x=>x?.cloneNode(true);
 function tableShell(table){const t=clone(table);t.querySelector('tbody')?.replaceChildren();return t;}
 // Build real pages from whole rows, rather than cutting a bitmap through text.
 function paginate(source,host){
   const pages=[];let page,body,table;
   const header=source.querySelector('.invoice-ref-head'),meta=source.querySelector('.invoice-ref-meta'),items=source.querySelector('.invoice-ref-items');
   if(!header||!items)throw Error('報價文件未完整載入');
   function next(){
     page=document.createElement('article');page.className=source.className+' ub52-page';
     body=document.createElement('div');body.className='ub52-page-content';page.append(body);host.append(page);pages.push(page);table=null;
     if(pages.length>1){body.append(clone(header),clone(meta));const label=document.createElement('div');label.className='ub52-continuation';label.textContent='報價單續頁 / QUOTATION CONTINUED';body.append(label);}
   }
   function bottom(node){return node.getBoundingClientRect().bottom-body.getBoundingClientRect().top;}
   function appendBlock(block){body.append(block);if(bottom(block)>CONTENT_H){block.remove();next();body.append(block);if(bottom(block)>CONTENT_H)throw Error('單一條款或項目內容過長，請分成較短項目後匯出');}}
   next();
   const children=[...source.children],idx=children.indexOf(items);
   for(const node of children.slice(0,idx))appendBlock(clone(node));
   for(const row of items.querySelectorAll('tbody tr')){
     if(!table){table=tableShell(items);body.append(table);}
     const r=clone(row);table.querySelector('tbody').append(r);
     if(bottom(table)>CONTENT_H){r.remove();if(!table.querySelector('tbody').children.length)table.remove();next();table=tableShell(items);body.append(table);table.querySelector('tbody').append(r);if(bottom(table)>CONTENT_H)throw Error('單一工程描述過長，請拆成兩個項目');}
   }
   // Totals, payment terms and signatures travel together, avoiding a signature-only page.
   const tail=document.createElement('div');tail.className='ub52-document-tail';
   children.slice(idx+1).forEach(node=>tail.append(clone(node)));body.append(tail);
   if(bottom(tail)>CONTENT_H){
     tail.remove();
     // Keep several final items with the closing section when space permits.
     const lastTable=table,rows=[...lastTable.querySelectorAll('tbody tr')];
     const carry=rows.length>1?rows.slice(-Math.min(3,rows.length-1)):[];carry.forEach(row=>row.remove());
     next();if(carry.length){table=tableShell(items);body.append(table);carry.forEach(row=>table.querySelector('tbody').append(row));}
     body.append(tail);
     while(bottom(tail)>CONTENT_H&&carry.length){const row=carry.shift();lastTable.querySelector('tbody').append(row);}
     if(table&&!table.querySelector('tbody').children.length)table.remove();
     if(bottom(tail)>CONTENT_H)throw Error('付款條款內容過長，請分成較短段落後匯出');
   }
   pages.forEach((p,i)=>{const footer=document.createElement('div');footer.className='ub52-page-footer';const no=meta?.querySelectorAll('div')[1]?.textContent||'';footer.innerHTML='<span>'+esc(no)+'</span><span>第 '+(i+1)+' / '+pages.length+' 頁</span>';p.append(footer);});
   return pages;
 }
 window.ub52PaginateQuotation=paginate;
 const previousExport=window.exportCurrentPDF,previousPrint=window.printA4;
 const library=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');const timeout=setTimeout(()=>reject(Error('PDF 引擎載入逾時，請重新整理後再試')),12000);s.src=src;s.onload=()=>{clearTimeout(timeout);resolve();};s.onerror=()=>{clearTimeout(timeout);reject(Error('PDF 引擎載入失敗'));};document.head.append(s);});
 async function exportQuote(){
   const source=document.querySelector('.quote-reference-sheet');if(!source)return previousExport?.();if(exporting)return;exporting=true;let host,frame;
   try{
     toast('正在建立清晰分頁報價 PDF…');
     app.dataset.pdfPhase='loading-renderer';
     if(!window.htmlToImage)await library('/v52/html-to-image-1.11.13.js');
     app.dataset.pdfPhase='loading-pdf';
     if(!window.jspdf?.jsPDF)await library('/v52/jspdf-2.5.1.js');
     app.dataset.pdfPhase='fonts';
     await document.fonts.ready;
     app.dataset.pdfPhase='pagination';
     host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;width:842px;background:white;pointer-events:none';document.body.append(host);
     const pages=paginate(source,host);await Promise.all([...host.querySelectorAll('img')].map(x=>x.decode().catch(()=>{})));
     frame=document.createElement('iframe');frame.style.cssText='position:fixed;left:-20000px;top:0;width:1440px;height:1191px;border:0';document.body.append(frame);
     const doc=frame.contentDocument;
     doc.open();doc.write('<!doctype html><html><head><base href="'+location.origin+'/">'+[...document.querySelectorAll('link[rel="stylesheet"],style')].map(x=>x.outerHTML).join('')+'<style>html,body{margin:0!important;padding:0!important;background:white!important}.ub52-page{margin:0!important}</style></head><body></body></html>');doc.close();
     await Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map(link=>link.sheet?Promise.resolve():new Promise((resolve,reject)=>{link.onload=resolve;link.onerror=()=>reject(Error('文件樣式未完整載入'));})));
     const pdf=new window.jspdf.jsPDF({unit:'pt',format:[PDF_W,PDF_H],orientation:'portrait',compress:true});
     for(const [i,page] of pages.entries()){
       const renderPage=page.cloneNode(true);doc.body.replaceChildren(renderPage);frame.contentWindow.scrollTo(0,0);await doc.fonts.ready;await Promise.all([...renderPage.querySelectorAll('img')].map(x=>x.decode().catch(()=>{})));
       if(i)pdf.addPage([PDF_W,PDF_H],'portrait');
       const canvas=await window.htmlToImage.toCanvas(renderPage,{pixelRatio:2,backgroundColor:'#fff',width:842,height:PAGE_H,skipFonts:true});
       pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,0,PDF_W,PDF_H,undefined,'FAST');
     }
     const no=source.querySelector('.invoice-ref-meta')?.querySelectorAll('div')[1]?.textContent||'UNIBRIGHT-Quotation';
     pdf.save(no.replace(/[\\/:*?"<>|]/g,'-')+'.pdf');
     document.getElementById('app').dataset.pdfExport=JSON.stringify({pages:pages.length,width:PDF_W,height:PDF_H,status:'downloaded'});toast('報價 PDF 已下載，共 '+pages.length+' 頁');return true;
   }catch(e){alert('報價 PDF 未能匯出：'+e.message);return false;}finally{host?.remove();frame?.remove();exporting=false;}
 }
 window.exportCurrentPDF=window.downloadCurrentPDF=exportQuote;
 window.printA4=function(){return document.querySelector('.quote-reference-sheet')?exportQuote():previousPrint?.();};
 window.ub52RenderPricing=function(){
   tab='pricing';
   app.innerHTML='<div class="page-head"><div><h1>工程項目／價目管理</h1><p>新增常用項目、修改名稱、單位及單價。新價用於之後加入報價的項目，已儲存單據保持原價。</p></div></div><div class="ub52-actions"><button class="btn green" onclick="ub52EditPrice()">新增工程項目</button><button class="btn light" onclick="setNav(\'quotation\')">返回報價</button></div><div class="ub52-price-list">'+(D.pricing||[]).map(x=>'<section class="ub52-price-row"><div><small>'+esc(x.price_tier==='trade'?'同行合作價':'客戶價')+' · '+esc(x.item_code)+'</small><h3>'+esc(x.description)+'</h3><p>'+hk(x.unit_price)+'／'+esc(x.unit||'項')+'</p><small>'+esc(x.pricing_rule||'')+'</small></div><button class="btn light" onclick="ub52EditPrice(\''+esc(x.id)+'\')">修改項目／價錢</button></section>').join('')+'</div><section class="ub-history"><h2>最近改價紀錄</h2><div id="ubPriceHistory"></div></section>';window.loadPricingHistory?.();
 };
 window.renderPricing=window.ub52RenderPricing;
 window.ub52EditPrice=function(id){
   const x=id?(D.pricing||[]).find(x=>x.id===id):{};if(!x){toast('找不到項目');return;}priceId=id||'';
   el('ub52PriceDialog')?.remove();const dialog=document.createElement('dialog');dialog.id='ub52PriceDialog';
   const field=(label,key,value,type='text')=>'<label>'+label+'<input id="ub52-'+key+'" type="'+type+'" value="'+esc(value??'')+'" '+(type==='number'?'min="0" step="0.01"':'')+'></label>';
   dialog.innerHTML='<form onsubmit="event.preventDefault();ub52SavePrice()"><h2>'+(id?'修改工程項目':'新增工程項目')+'</h2><label>價目類別<select id="ub52-tier"><option value="customer">客戶價</option><option value="trade">同行合作價</option></select></label>'+field('分類','category',x.category||'一般工程')+field('項目編號','code',x.item_code||'CUSTOM-'+Date.now())+field('項目名稱／描述','description',x.description)+field('單位','unit',x.unit||'項')+field('單價 HK$','price',x.unit_price??0,'number')+field('計價備註','rule',x.pricing_rule)+'<p class="ub52-price-error" id="ub52-price-error" role="alert"></p><div class="ub52-actions"><button class="btn green" id="ub52-save-price" type="submit">儲存項目及價錢</button><button class="btn light" type="button" onclick="document.getElementById(\'ub52PriceDialog\').close()">取消</button></div></form>';
   document.body.append(dialog);el('ub52-tier').value=x.price_tier||tier||'customer';dialog.showModal();
 };
 window.ub52SavePrice=async function(){
   if(saving)return;const value=k=>el('ub52-'+k).value.trim();
   const body={price_tier:value('tier'),category:value('category'),item_code:value('code'),description:value('description'),unit:value('unit'),unit_price:Number(value('price')),pricing_rule:value('rule')};
   if(!body.category||!body.item_code||!body.description||!body.unit||!value('price')||!Number.isFinite(body.unit_price)||body.unit_price<0){el('ub52-price-error').textContent='請填妥分類、編號、名稱、單位及有效價錢';return;}
   saving=true;el('ub52-save-price').disabled=true;
   try{
     const rows=await api('pricing_catalog',priceId?'?id=eq.'+enc(priceId):'',{method:priceId?'PATCH':'POST',body});if(!rows?.[0]?.id)throw Error('資料未能儲存');
     priceId=rows[0].id;await refreshData();el('ub52PriceDialog').close();
     if(tab==='pricing')window.ub52RenderPricing();else window.ub44DrawCatalog?.();toast('工程項目及價錢已儲存');
   }catch(e){el('ub52-price-error').textContent='儲存失敗：'+e.message;}finally{saving=false;if(el('ub52-save-price'))el('ub52-save-price').disabled=false;}
 };
 function addEntry(){
   for(const paper of app.querySelectorAll('.quote-reference-sheet')){
     for(const body of paper.querySelectorAll('.invoice-ref-party .body')){
       for(const node of [...body.childNodes])if(node.nodeType===Node.TEXT_NODE&&/^\s*聯絡人\s*[：:]/.test(node.textContent)){if(node.nextSibling?.nodeName==='BR')node.nextSibling.remove();node.remove();}
     }
   }
   for(const sign of app.querySelectorAll('.quote-reference-sheet .invoice-ref-sign')){
     const company=sign.children[0];
     if(company&&!company.querySelector('.ub52-authorized-panel')){company.innerHTML='<div class="ub52-sign-heading">公司授權簽署 AUTHORIZED SIGNATURE</div><div class="ub52-company-name">UNIBRIGHT CONSTRUCTION (HK) LIMITED</div><div class="ub52-authorized-panel"><div class="ub52-stamp-crop"><img src="/v52/company-stamp-signature.png" alt="UNIBRIGHT 公司印章"></div><div class="ub52-handwriting-crop"><img src="/v52/authorized-handwriting.png" alt="公司授權人原版手寫簽名"></div></div><div class="ub52-auth-caption">公司印章及授權簽名 Company Chop &amp; Signature</div>';}
     if(sign.querySelector('.ub52-client-confirm'))continue;
     const client=sign.children[1];if(client){client.className='ub52-client-confirm';client.innerHTML='<div>客戶確認 CLIENT CONFIRMATION</div><div class="ub52-sign-field"><span>客戶全名 Full Name</span><div></div></div><div class="ub52-sign-field"><span>客戶簽署 Signature</span><div></div></div><div class="ub52-sign-field"><span>簽署日期 Date</span><div></div></div>';}
   }
   const documentPaper=app.querySelector('.single-preview > .quote-reference-sheet');
   if(documentPaper){const stage=document.createElement('div'),box=document.createElement('div');stage.className='preview-stage';box.className='a4-scale-box';documentPaper.replaceWith(stage);box.append(documentPaper);stage.append(box);requestAnimationFrame(()=>window.scaleStage(stage));}
   const zoomHost=app.querySelector('.ub44-preview-head,.document-view-head .view-actions');
   if(zoomHost&&app.querySelector('.quote-reference-sheet')&&!el('ub52-zoom')){const b=document.createElement('button');b.id='ub52-zoom';b.className='btn light';b.textContent='放大閱讀';b.onclick=()=>{const stage=app.querySelector('.preview-stage');if(!stage)return;const on=stage.classList.toggle('ub52-reading');b.textContent=on?'適合畫面':'放大閱讀';if(!on)window.scaleStage(stage);};zoomHost.append(b);}
   const nav=document.querySelector('.side-nav');if(nav&&!nav.querySelector('[data-nav="pricing"]')){const b=document.createElement('button');b.dataset.nav='pricing';b.textContent='工程項目／價目管理';b.onclick=()=>window.ub52RenderPricing();nav.append(b);}
   const editor=app.querySelector('.ub44-add-custom');if(editor&&!el('ub52-add-price')){const b=document.createElement('button');b.id='ub52-add-price';b.className='btn light';b.textContent='新增常用項目至價目表';b.onclick=()=>window.ub52EditPrice();editor.after(b);}
   const head=app.querySelector('.page-head,.ub44-page-head');if(head&&!el('ub52-catalog-link')&&!app.querySelector('.ub52-price-list')){const b=document.createElement('button');b.id='ub52-catalog-link';b.className='btn light';b.textContent='工程項目／價目管理';b.onclick=()=>window.ub52RenderPricing();head.append(b);}
 }
 new MutationObserver(addEntry).observe(app,{childList:true,subtree:true});addEntry();
})();
