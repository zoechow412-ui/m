(()=>{
 'use strict';
 window.UNIBRIGHT_REPAIR_BUILD='20260928-1';
 function clients(){
   const groups=new Map();
   for(const c of D.clients||[]){const key=JSON.stringify(['company_name','contact_name','phone','email','address'].map(k=>String(c[k]||'').trim()));if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c);}
   app.innerHTML='<div class="page-head"><div><h1>客戶資料</h1><p>完全相同資料合併顯示，原始記錄及工程關聯保留。</p></div></div><div class="document-cards">'+[...groups.values()].map(group=>{const c=group[0],projects=D.projects.filter(p=>group.some(g=>g.id===p.client_id));return `<section class="document-card"><div class="doc-card-main"><h3>${esc(c.company_name||'未命名客戶')}</h3><p>${esc(c.contact_name||'')} ${esc(c.phone||'')}</p><p>${esc(c.email||'')} ${esc(c.address||'')}</p><small>${projects.length} 個工程${group.length>1?' · '+group.length+' 筆相同記錄':''}</small></div><div class="doc-card-actions">${projects.map(p=>`<button class="btn light" onclick="editProject('${p.id}')">${esc(p.project_name)}</button>`).join('')}</div></section>`}).join('')+'</div>';
 }
 function navigate(name){
   if(name==='more'){app.innerHTML='<div class="page-head"><h1>所有功能</h1></div><div class="ub47-menu">'+[['invoice','Invoice 管理'],['clients','客戶資料'],['documents','文件管理'],['reports','報表分析'],['settings','設定'],['pricing','價目表']].map(([key,label])=>`<button class="btn light" onclick="UB33.go('${key}')">${label}</button>`).join('')+'</div>';return true;}
   if(name==='clients'){tab=name;clients();}
   else if(name==='settings'){tab=name;app.innerHTML='<div class="page-head"><div><h1>設定</h1><p>價目與工程負責人</p></div></div><div class="document-cards"><button class="btn light" onclick="setNav(\'pricing\')">價目表及改價紀錄</button><button class="btn light" onclick="setNav(\'projects\')">工程及負責人管理</button></div>';}
   else if(name==='dashboard'){tab=name;window.renderDashboard();}
   else if(name==='calendar'){tab='booking';window.renderBooking();}
   else return false;
   document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));return true;
 }
 const oldGo=window.UB33.go;
 window.UB33.go=name=>{if(!navigate(name))oldGo(name)};
 document.addEventListener('click',event=>{const b=event.target.closest('[data-nav]');if(b&&navigate(b.dataset.nav)){event.preventDefault();event.stopImmediatePropagation();}},true);
 window.newProject=function(){
   showProjectForm({id:'',project_no:gen('PRJ'),project_name:'',status:'報價中'});
   app.querySelector('h1').textContent='建立新工程';
 };
 const existingSave=window.saveProject;
 window.saveProject=async function(pid,cid){
   if(pid)return existingSave(pid,cid);
   if(!val('epname').trim()){toast('請輸入工程名稱');return;}
   if(window.__creatingProject)return;window.__creatingProject=true;
   try{
     const body={company_name:val('ecname').trim()||'未命名客戶',contact_name:val('econtact').trim(),phone:val('ephone').trim(),email:val('eemail').trim(),address:val('ecaddr').trim()};
     let client=(D.clients||[]).find(c=>Object.keys(body).every(k=>String(c[k]||'').trim()===body[k]));
     if(!client)client=(await api('clients','',{method:'POST',body}))[0];
     await api('projects','',{method:'POST',body:{project_no:val('epno')||gen('PRJ'),project_name:val('epname').trim(),site_address:val('esite').trim(),client_id:client.id,responsible_person:val('eresponsible').trim(),status:val('estatus'),progress_percent:Math.min(100,Math.max(0,n(val('eprogress')))),contract_amount:Math.max(0,n(val('econtract')))}});
     await refreshData();setNav('projects');toast('工程已建立');
   }catch(e){alert('建立工程未完成：'+e.message)}finally{window.__creatingProject=false;}
 };
 function polish(){
   const nav=document.querySelector('.mobile-nav');if(nav&&!nav.querySelector('[data-nav="more"]')){const b=document.createElement('button');b.dataset.nav='more';b.innerHTML='<span>⋯</span>更多';nav.appendChild(b);}
   const h=app.querySelector('.ub33-hero-copy h1');if(h&&h.textContent!=='你好，歡迎使用')h.textContent='你好，歡迎使用';
   const due=app.querySelector('.ub33-kpi.red small');if(due&&due.textContent!=='Invoice 尚欠')due.textContent='Invoice 尚欠';
   const balance=app.querySelector('.ub33-payrow:last-child span');if(balance&&balance.textContent!=='合約未收餘額')balance.textContent='合約未收餘額';
   document.querySelectorAll('.ub33-weather').forEach(e=>e.remove());
   const notify=document.querySelector('.notify');if(notify)notify.hidden=true;
   app.querySelectorAll('.ub45-quick-panel .ub33-panel-head button').forEach(b=>{if(b.textContent.includes('自訂'))b.textContent='Booking →'});
   app.querySelectorAll('.ub33-quick button,.ub45-quick-grid button').forEach(b=>{if(b.textContent.includes('新增 Invoice')){b.textContent='由報價建立 Invoice';b.onclick=()=>setNav('quotation')}if(b.textContent.includes('新增收據')){b.textContent='登記收款／出收據';b.onclick=()=>setNav('invoice')}});
 }
 new MutationObserver(polish).observe(app,{childList:true,subtree:true});polish();
 window.scaleStage=function(stage){
   const paper=stage?.querySelector('.a4-sheet');if(!paper)return;
   paper.style.transform='none';
   const width=paper.offsetWidth,height=paper.scrollHeight;
   const scale=Math.min(1,Math.max(160,stage.clientWidth-28)/width);
   paper.style.transformOrigin='top left';paper.style.transform=`scale(${scale})`;
   const box=paper.parentElement;if(box!==stage){box.style.width=width*scale+'px';box.style.height=height*scale+'px';}
 };
 window.addEventListener('resize',()=>document.querySelectorAll('.preview-stage').forEach(window.scaleStage));
 window.printA4=function(){
   const paper=document.querySelector('#printArea,.a4-sheet,.formal-document');
   if(!paper){toast('請先開啟正式文件');return;}
   const popup=window.open('','_blank');if(!popup){alert('請允許彈出視窗以列印 PDF');return;}
   const styles=[...document.querySelectorAll('link[rel="stylesheet"],style')].map(el=>el.outerHTML).join('');
   popup.document.write('<!doctype html><html lang="zh-HK"><head><meta charset="utf-8"><base href="'+location.origin+'/"><title>UNIBRIGHT 正式文件</title>'+styles+'<style>body{margin:0!important;padding:0!important;background:white!important}body>article{display:block!important;visibility:visible!important;position:relative!important;left:auto!important;top:auto!important;transform:none!important}.invoice-reference-sheet{box-shadow:none!important}</style></head><body>'+paper.outerHTML+'</body></html>');
   popup.document.close();
   popup.onload=async()=>{await popup.document.fonts.ready;await Promise.all([...popup.document.images].map(img=>img.decode().catch(()=>{})));popup.focus();popup.print();};
 };
})();
