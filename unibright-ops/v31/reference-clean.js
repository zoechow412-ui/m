(()=>{
'use strict';
window.UNIBRIGHT_V31_BUILD='20260914-v31-reference-clean-1';

const $all=(s,r=document)=>Array.from(r.querySelectorAll(s));
const num=v=>Number(v||0);
const money=v=>'HK$'+Math.round(num(v)).toLocaleString('en-HK');
const localDate=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const dateText=v=>{if(!v)return'—';const [y,m,d]=String(v).split('-');return `${d}/${m}/${y}`};
const timeText=v=>v?String(v).slice(0,5):'—';
const bookings=()=>Array.isArray(D?.bookings)?D.bookings:[];
const safeName=v=>String(v||'').trim().toLowerCase()==='jason'?'—':String(v||'—');

function scrubPlaceholderName(root=document){
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;while(node=walker.nextNode()){if(/jason/i.test(node.nodeValue||''))node.nodeValue=(node.nodeValue||'').replace(/jason/gi,'').replace(/，\s*👋/,' 👋').replace(/\s{2,}/g,' ')}
}
function activate(name){
  try{tab=name}catch(_){ }
  $all('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
}
function go(name){
  activate(name);
  const map={
    dashboard:window.renderDashboard,
    projects:window.renderProjects,
    quotation:window.renderQuotes,
    invoice:window.renderInvoices,
    receipt:window.renderReceipts,
    booking:window.renderBooking,
    calendar:window.renderCalendarV31,
    clients:window.renderClientsV31,
    documents:window.renderDocumentsV31,
    reports:window.renderReportsV31,
    pricing:window.renderPricing,
    settings:window.renderPricing
  };
  const fn=map[name]||window.renderDashboard;
  if(typeof fn==='function')fn();
  requestAnimationFrame(()=>scrubPlaceholderName(document.body));
}
window.UB31={go};

function statusMeta(p){
  const done=String(p?.status||'').includes('完成');
  const overdue=p?.target_finish_date&&p.target_finish_date<localDate()&&!done;
  if(overdue)return['red','逾期'];
  if(done)return['blue','已完成'];
  if(String(p?.status||'').includes('待'))return['gold',p.status];
  return['green',p?.status||'進行中'];
}
function nextDate(p){
  const b=bookings().find(x=>x.project_id===p.id&&x.booking_date>=localDate()&&!String(x.status||'').includes('取消'));
  return b?.booking_date||p.target_finish_date||'';
}
function filteredDash(){
  let list=typeof filteredProjects==='function'?filteredProjects():D.projects||[];
  const f=window.__dashProjectFilterV31||'all';
  if(f==='active')list=list.filter(p=>{const s=statusMeta(p)[1];return s!=='逾期'&&!String(p.status||'').includes('完成')&&!String(p.status||'').includes('待')});
  if(f==='follow')list=list.filter(p=>String(p.status||'').includes('待'));
  if(f==='done')list=list.filter(p=>String(p.status||'').includes('完成'));
  if(f==='overdue')list=list.filter(p=>statusMeta(p)[1]==='逾期');
  return list;
}
window.setDashProjectFilterV31=f=>{window.__dashProjectFilterV31=f;window.renderDashboard()};
function tabButton(k,label,count){return `<button class="ref-tab ${(window.__dashProjectFilterV31||'all')===k?'active':''}" onclick="setDashProjectFilterV31('${k}')">${label} (${count})</button>`}
function projectRows(){
  const list=filteredDash().slice(0,8);
  if(!list.length)return `<tr><td colspan="7" class="ref-booking-empty">未有相關工程。</td></tr>`;
  return list.map(p=>{const c=clientByProject(p.id)||{},sm=sumProject(p.id)||{},st=statusMeta(p),amt=num(p.contract_amount)||num(sm.contract_amount);return `<tr data-project-id="${p.id}" tabindex="0"><td>${esc(p.project_name||'未命名工程')}</td><td>${esc(c.company_name||'—')}</td><td>${esc(safeName(p.responsible_person))}</td><td><span class="ref-status ${st[0]}">${esc(st[1])}</span></td><td>${money(amt)}</td><td>${dateText(nextDate(p))}</td><td><button class="ref-more" onclick="event.stopPropagation();editProject('${p.id}')">•••</button></td></tr>`}).join('');
}
function scheduleHTML(){
  const list=bookings().filter(b=>b.booking_date===localDate()&&!String(b.status||'').includes('取消')).slice(0,5);
  if(!list.length)return `<div class="ref-booking-empty">今日未有 Booking<br><button class="btn green sm" style="margin-top:10px" onclick="showBookingForm('')">＋ 新增 Booking</button></div>`;
  return list.map(b=>{const p=project(b.project_id)||{};return `<div class="ref-schedule-item" data-booking-id="${b.id}" tabindex="0"><div class="ref-time">${timeText(b.start_time)}</div><div class="ref-dot"></div><div><b>${esc(b.booking_type||'預約')} ${esc(p.project_name||b.client_name||'')}</b><small>${esc(b.location||'')}</small></div><button class="ref-iconbtn" onclick="event.stopPropagation();showBookingForm('${b.id}')">▣</button></div>`}).join('');
}
function monthlyBars(){
  const y=new Date().getFullYear(),counts=Array(12).fill(0);(D.projects||[]).forEach(p=>{const d=new Date(p.created_at||0);if(d.getFullYear()===y)counts[d.getMonth()]++});const max=Math.max(1,...counts);
  return counts.map((c,i)=>`<div class="ref-barcol"><i style="height:${Math.max(7,Math.round(c/max*105))}px"></i><span>${i+1}月</span></div>`).join('');
}
function bookingRows(){
  const list=bookings().filter(b=>b.booking_date>=localDate()&&!String(b.status||'').includes('取消')).slice(0,8);
  if(!list.length)return `<tr><td colspan="9" class="ref-booking-empty">未有 Booking，按「新增 Booking」建立預約。</td></tr>`;
  return list.map(b=>{const p=project(b.project_id)||{},c=clientByProject(b.project_id)||{};let cls='green';if(String(b.status||'').includes('完成'))cls='blue';else if(String(b.status||'').includes('改期'))cls='gold';return `<tr data-booking-id="${b.id}" tabindex="0"><td>${dateText(b.booking_date)}</td><td>${timeText(b.start_time)}${b.end_time?'–'+timeText(b.end_time):''}</td><td>${esc(b.client_name||c.company_name||'—')}</td><td>${esc(p.project_name||b.project_ref||'—')}</td><td>${esc(b.booking_type||'—')}</td><td>${esc(b.location||'—')}</td><td>${esc(safeName(b.responsible_person||p.responsible_person))}</td><td><span class="ref-status ${cls}">${esc(b.status||'已預約')}</span></td><td><div class="booking-actions"><button onclick="event.stopPropagation();showBookingForm('${b.id}')">編輯</button>${String(b.status||'').includes('完成')?'':`<button onclick="event.stopPropagation();completeBooking('${b.id}')">完成</button>`}</div></td></tr>`}).join('');
}

window.renderDashboard=function(){
  const quoteTotal=(D.quotes||[]).reduce((a,x)=>a+num(x.total),0),invoiceTotal=(D.invoices||[]).reduce((a,x)=>a+num(x.total),0),due=(D.invoices||[]).reduce((a,x)=>a+num(x.amount_due),0),paid=(D.invoices||[]).reduce((a,x)=>a+num(x.amount_paid),0),contract=Math.max(invoiceTotal,paid+due),pct=contract?Math.round(paid/contract*100):0;
  const all=(D.projects||[]).length,follow=(D.projects||[]).filter(p=>String(p.status||'').includes('待')).length,done=(D.projects||[]).filter(p=>String(p.status||'').includes('完成')).length,over=(D.projects||[]).filter(p=>statusMeta(p)[1]==='逾期').length,active=Math.max(0,all-done-follow-over);
  app.innerHTML=`<div class="ref-dashboard">
    <section class="ref-hero"><div class="ref-hello"><h1>你好 👋</h1><p>管理你的工程・從這裡開始</p><small>專業・合規・安全・高效</small></div><div class="ref-script">Build a Better <span>Tomorrow</span></div></section>
    <section class="ref-kpis">
      <button class="ref-kpi green" onclick="UB31.go('projects')"><div class="ico">▰</div><div><small>工程總數</small><strong>${all}</strong><span class="trend">↑ 即時工程資料</span></div></button>
      <button class="ref-kpi blue" onclick="UB31.go('quotation')"><div class="ico">▤</div><div><small>報價總額</small><strong>${money(quoteTotal)}</strong><span class="trend">Quotation</span></div></button>
      <button class="ref-kpi gold" onclick="UB31.go('invoice')"><div class="ico">▣</div><div><small>Invoice 總額</small><strong>${money(invoiceTotal)}</strong><span class="trend">Invoice</span></div></button>
      <button class="ref-kpi red" onclick="UB31.go('receipt')"><div class="ico">$</div><div><small>尚欠金額</small><strong>${money(due)}</strong><span class="trend">待收款</span></div></button>
    </section>
    <section class="ref-main-grid">
      <div class="ref-panel"><div class="ref-panel-head"><h2>▣　最近工程</h2><button class="ref-link" onclick="UB31.go('projects')">查看全部 →</button></div><div class="ref-tabs">${tabButton('all','全部',all)}${tabButton('active','進行中',active)}${tabButton('follow','待跟進',follow)}${tabButton('done','已完成',done)}${tabButton('overdue','已逾期',over)}</div><div class="ref-table-wrap"><table class="ref-table"><thead><tr><th>工程名稱</th><th>客戶</th><th>負責人</th><th>狀態</th><th>金額</th><th>跟進日期</th><th>操作</th></tr></thead><tbody>${projectRows()}</tbody></table></div></div>
      <div class="ref-side-stack"><div class="ref-panel"><div class="ref-panel-head"><h3>▦　今日行程</h3><button class="ref-link" onclick="UB31.go('booking')">查看全部 →</button></div><div class="ref-schedule">${scheduleHTML()}</div></div><div class="ref-panel"><div class="ref-panel-head"><h3>◉　快捷操作</h3><button class="ref-link" onclick="UB31.go('booking')">Booking →</button></div><div class="ref-quick"><button onclick="UB31.go('projects')">＋<br>工程項目</button><button onclick="newQuote()">▤<br>新增報價</button><button onclick="UB31.go('invoice')">▣<br>Invoice</button><button onclick="showBookingForm('')">▦<br>Booking</button></div></div></div>
    </section>
    <section class="ref-bottom-grid">
      <div class="ref-panel" data-go="receipt"><div class="ref-panel-head"><h3>▣　收款進度</h3></div><div class="ref-progress"><div class="ref-donut" style="--pct:${pct}%"><b>${pct}%</b></div><div class="ref-money"><div><span>合約總額</span><b>${money(contract)}</b></div><div><span>已收金額</span><b>${money(paid)}</b></div><div><span>尚欠金額</span><b class="red">${money(due)}</b></div></div></div></div>
      <div class="ref-panel" data-go="reports"><div class="ref-panel-head"><h3>▥　每月工程數量</h3></div><div class="ref-bars">${monthlyBars()}</div></div>
      <div class="ref-panel ref-brandcard"><h3>專注工程<br>締造更好未來</h3><p>UNIBRIGHT CONSTRUCTION<br><br>合規標準　・　專業團隊　・　優質服務</p></div>
    </section>
    <section class="ref-panel ref-booking-panel"><div class="ref-panel-head"><h2>📅　Booking 預約表</h2><button class="btn green sm" onclick="showBookingForm('')">＋ 新增 Booking</button></div><div class="ref-table-wrap"><table class="ref-table ref-booking-table"><thead><tr><th>日期</th><th>時間</th><th>客戶</th><th>工程</th><th>類型</th><th>地點</th><th>負責人</th><th>狀態</th><th>操作</th></tr></thead><tbody>${bookingRows()}</tbody></table></div></section>
  </div>`;
  wireDashboardRows();scrubPlaceholderName(app);
};

function wireDashboardRows(){
  $all('[data-project-id]',app).forEach(row=>{const fn=()=>editProject(row.dataset.projectId);row.onclick=e=>{if(!e.target.closest('button,a,input,select,textarea'))fn()};row.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button,a')){e.preventDefault();fn()}}});
  $all('[data-booking-id]',app).forEach(row=>{const fn=()=>showBookingForm(row.dataset.bookingId);row.onclick=e=>{if(!e.target.closest('button,a,input,select,textarea'))fn()};row.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button,a')){e.preventDefault();fn()}}});
  $all('[data-go]',app).forEach(el=>{el.style.cursor='pointer';el.onclick=e=>{if(!e.target.closest('button,a,input,select,textarea'))go(el.dataset.go)}});
}

window.renderClientsV31=function(){
  const clients=D.clients||[];
  app.innerHTML=`<div class="page-head"><div><h1>客戶資料</h1><p>客戶聯絡資料及相關工程。</p></div></div><div class="ref-panel"><div class="ref-table-wrap"><table class="ref-table"><thead><tr><th>公司／客戶</th><th>聯絡人</th><th>電話</th><th>Email</th><th>工程數</th></tr></thead><tbody>${clients.length?clients.map(c=>`<tr><td>${esc(c.company_name||'—')}</td><td>${esc(c.contact_name||'—')}</td><td>${esc(c.phone||'—')}</td><td>${esc(c.email||'—')}</td><td>${(D.projects||[]).filter(p=>p.client_id===c.id).length}</td></tr>`).join(''):`<tr><td colspan="5" class="ref-booking-empty">未有客戶資料。</td></tr>`}</tbody></table></div></div>`;
};
window.renderDocumentsV31=function(){
  const docs=[];(D.quotes||[]).forEach(x=>docs.push({type:'Quotation',no:x.quotation_no,date:x.issue_date,fn:`viewQuote('${x.id}')`}));(D.invoices||[]).forEach(x=>docs.push({type:'Invoice',no:x.invoice_no,date:x.issue_date,fn:`viewInvoice('${x.id}')`}));(D.payments||[]).forEach(x=>docs.push({type:'Receipt',no:x.receipt_no||'Receipt',date:x.payment_date,fn:`viewReceipt('${x.id}')`}));docs.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  app.innerHTML=`<div class="page-head"><div><h1>文件管理</h1><p>Quotation、Invoice、Receipt 集中查看。</p></div></div><div class="ref-panel"><div class="ref-table-wrap"><table class="ref-table"><thead><tr><th>文件</th><th>編號</th><th>日期</th><th>操作</th></tr></thead><tbody>${docs.length?docs.map(d=>`<tr><td>${d.type}</td><td>${esc(d.no||'—')}</td><td>${dateText(d.date)}</td><td><button class="btn light sm" onclick="${d.fn}">查看</button></td></tr>`).join(''):`<tr><td colspan="4" class="ref-booking-empty">未有文件。</td></tr>`}</tbody></table></div></div>`;
};
window.renderReportsV31=function(){
  const q=(D.quotes||[]).reduce((a,x)=>a+num(x.total),0),i=(D.invoices||[]).reduce((a,x)=>a+num(x.total),0),p=(D.payments||[]).reduce((a,x)=>a+num(x.amount),0),due=(D.invoices||[]).reduce((a,x)=>a+num(x.amount_due),0);
  app.innerHTML=`<div class="page-head"><div><h1>報表分析</h1><p>工程、報價及收款摘要。</p></div></div><section class="ref-kpis"><div class="ref-kpi green"><div class="ico">▰</div><div><small>工程總數</small><strong>${(D.projects||[]).length}</strong></div></div><div class="ref-kpi blue"><div class="ico">▤</div><div><small>報價總額</small><strong>${money(q)}</strong></div></div><div class="ref-kpi gold"><div class="ico">▣</div><div><small>Invoice 總額</small><strong>${money(i)}</strong></div></div><div class="ref-kpi red"><div class="ico">$</div><div><small>尚欠</small><strong>${money(due)}</strong><span class="trend">已收 ${money(p)}</span></div></div></section><div class="ref-panel" style="margin-top:14px"><div class="ref-panel-head"><h3>每月工程數量</h3></div><div class="ref-bars">${monthlyBars()}</div></div>`;
};
window.renderCalendarV31=function(){
  const list=bookings().filter(b=>!String(b.status||'').includes('取消')).slice().sort((a,b)=>String(a.booking_date+a.start_time).localeCompare(String(b.booking_date+b.start_time)));
  const groups={};list.forEach(b=>(groups[b.booking_date]??=[]).push(b));
  app.innerHTML=`<div class="booking-card-head"><div><h1>行程表</h1><p class="muted">Booking 按日期排列。</p></div><button class="btn green" onclick="showBookingForm('')">＋ 新增 Booking</button></div><div class="stack">${Object.keys(groups).length?Object.entries(groups).map(([d,arr])=>`<div class="ref-panel"><div class="ref-panel-head"><h3>${dateText(d)}</h3></div>${arr.map(b=>`<div class="ref-schedule-item" onclick="showBookingForm('${b.id}')"><div class="ref-time">${timeText(b.start_time)}</div><div class="ref-dot"></div><div><b>${esc(b.booking_type||'預約')}</b><small>${esc(b.location||'')}</small></div><button class="ref-iconbtn">›</button></div>`).join('')}</div>`).join(''):'<div class="ref-panel ref-booking-empty">未有 Booking。</div>'}</div>`;
};

function beautifyChrome(){
  const av=document.querySelector('.avatar');if(av){av.textContent='👤';av.setAttribute('aria-label','帳戶')}
  const brand=document.querySelector('.brand');if(brand){brand.innerHTML='<div class="logo-mark">B</div><div><b>UNIBRIGHT</b><small>CONSTRUCTION</small></div>'}
  const labels={dashboard:['⌂','首頁','Dashboard'],projects:['▰','工程項目','Projects'],quotation:['▤','報價管理','Quotation'],invoice:['▣','Invoice 管理','Invoice'],receipt:['$','收款 / Receipt','Payment'],booking:['▦','Booking / 預約','Booking'],calendar:['□','行程表','Calendar'],clients:['○','客戶資料','Clients'],documents:['▱','文件管理','Documents'],reports:['↗','報表分析','Reports'],pricing:['＋','價目表','Pricing'],settings:['⚙','設定','Settings']};
  $all('.side-nav button[data-nav]').forEach(b=>{const x=labels[b.dataset.nav];if(x)b.innerHTML=`<span class="ico">${x[0]}</span><span>${x[1]}<small style="display:block;font-size:10px;font-weight:500;opacity:.72;margin-top:2px">${x[2]}</small></span>`});
  scrubPlaceholderName(document.body);
}
function wireStaticNav(){
  $all('[data-nav]').forEach(btn=>{if(btn.dataset.ub31==='1')return;btn.dataset.ub31='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go(btn.dataset.nav)},true)});
}

beautifyChrome();wireStaticNav();
requestAnimationFrame(()=>{beautifyChrome();wireStaticNav();if(typeof tab!=='undefined'&&tab==='dashboard')window.renderDashboard()});
setTimeout(()=>{beautifyChrome();wireStaticNav();scrubPlaceholderName(document.body)},350);
})();
