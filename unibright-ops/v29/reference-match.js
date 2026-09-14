(()=>{
'use strict';
window.UNIBRIGHT_V29_BUILD='20260914-v29-reference-match-1';

function localDateV29(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function dateTextV29(v){if(!v)return'—';const [y,m,d]=String(v).split('-');return `${d}/${m}/${y}`}
function timeTextV29(v){return v?String(v).slice(0,5):'—'}
function moneyV29(v){return 'HK$'+Math.round(n(v)).toLocaleString('en-HK')}
function bookingsV29(){return Array.isArray(D.bookings)?D.bookings:[]}
function projectStatusV29(p){const done=String(p.status||'').includes('完成');const overdue=p.target_finish_date&&p.target_finish_date<localDateV29()&&!done;if(overdue)return['red','逾期'];if(done)return['blue','已完成'];if(String(p.status||'').includes('待'))return['gold',p.status];return['green',p.status||'進行中']}
function projectNextV29(p){const b=bookingsV29().find(x=>x.project_id===p.id&&x.booking_date>=localDateV29()&&!String(x.status).includes('取消'));return b?.booking_date||p.target_finish_date||''}
function dashFilterV29(){return window.__dashProjectFilter||'all'}
function filteredDashProjectsV29(){let list=filteredProjects();const f=dashFilterV29();if(f==='active')list=list.filter(p=>!String(p.status).includes('完成')&&!String(p.status).includes('待')&&projectStatusV29(p)[1]!=='逾期');if(f==='follow')list=list.filter(p=>String(p.status).includes('待'));if(f==='done')list=list.filter(p=>String(p.status).includes('完成'));if(f==='overdue')list=list.filter(p=>projectStatusV29(p)[1]==='逾期');return list}
function tabV29(key,label,count){return `<button class="ref-tab ${dashFilterV29()===key?'active':''}" onclick="setDashProjectFilter('${key}')">${label} (${count})</button>`}
function rowsV29(){const list=filteredDashProjectsV29().slice(0,8);if(!list.length)return `<tr><td colspan="7" class="ref-booking-empty">未有相關工程。</td></tr>`;return list.map(p=>{const c=clientByProject(p.id),s=projectStatusV29(p),sm=sumProject(p.id),amt=n(p.contract_amount)||n(sm.contract_amount);return `<tr><td>${esc(p.project_name||'未命名工程')}</td><td>${esc(c.company_name||'—')}</td><td>${esc(p.responsible_person||'—')}</td><td><span class="ref-status ${s[0]}">${esc(s[1])}</span></td><td>${moneyV29(amt)}</td><td>${dateTextV29(projectNextV29(p))}</td><td><button class="ref-more" onclick="editProject('${p.id}')">•••</button></td></tr>`}).join('')}
function scheduleV29(){const list=bookingsV29().filter(b=>b.booking_date===localDateV29()&&!String(b.status).includes('取消')).slice(0,5);if(!list.length)return `<div class="ref-booking-empty">今日未有 Booking<br><button class="btn green sm" style="margin-top:10px" onclick="showBookingForm('')">＋ 新增 Booking</button></div>`;return list.map(b=>{const p=project(b.project_id)||{};return `<div class="ref-schedule-item"><div class="ref-time">${timeTextV29(b.start_time)}</div><div class="ref-dot"></div><div><b>${esc(b.booking_type||'預約')} ${esc(p.project_name||b.client_name||'')}</b><small>${esc(b.location||'')}</small></div><button class="ref-iconbtn" onclick="showBookingForm('${b.id}')">▣</button></div>`}).join('')}
function barsV29(){const y=new Date().getFullYear(),counts=Array(12).fill(0);D.projects.forEach(p=>{const d=new Date(p.created_at||0);if(d.getFullYear()===y)counts[d.getMonth()]++});const mx=Math.max(1,...counts);return counts.map((c,i)=>`<div class="ref-barcol"><i style="height:${Math.max(7,Math.round(c/mx*105))}px"></i><span>${i+1}月</span></div>`).join('')}
function bookingRowsV29(){const upcoming=bookingsV29().filter(b=>b.booking_date>=localDateV29()&&!String(b.status).includes('取消')).slice(0,8);if(!upcoming.length)return `<tr><td colspan="9" class="ref-booking-empty">未有 Booking，按「新增 Booking」建立預約。</td></tr>`;return upcoming.map(b=>{const p=project(b.project_id)||{},c=clientByProject(b.project_id)||{};let cls='green',label=b.status||'已預約';if(String(label).includes('完成'))cls='blue';else if(String(label).includes('改期'))cls='gold';else if(String(label).includes('取消'))cls='gray';return `<tr><td>${dateTextV29(b.booking_date)}</td><td>${timeTextV29(b.start_time)}${b.end_time?'–'+timeTextV29(b.end_time):''}</td><td>${esc(b.client_name||c.company_name||'—')}</td><td>${esc(p.project_name||b.project_ref||'—')}</td><td>${esc(b.booking_type||'—')}</td><td>${esc(b.location||'—')}</td><td>${esc(b.responsible_person||p.responsible_person||'—')}</td><td><span class="ref-status ${cls}">${esc(label)}</span></td><td><div class="booking-actions"><button onclick="showBookingForm('${b.id}')">編輯</button><button onclick="completeBooking('${b.id}')">完成</button></div></td></tr>`}).join('')}

window.renderDashboard=function(){
  const quoteTotal=D.quotes.reduce((a,x)=>a+n(x.total),0),invoiceTotal=D.invoices.reduce((a,x)=>a+n(x.total),0),due=D.invoices.reduce((a,x)=>a+n(x.amount_due),0),paid=D.invoices.reduce((a,x)=>a+n(x.amount_paid),0),contract=Math.max(invoiceTotal,paid+due),pct=contract?Math.round(paid/contract*100):0;
  const all=D.projects.length,follow=D.projects.filter(p=>String(p.status).includes('待')).length,done=D.projects.filter(p=>String(p.status).includes('完成')).length,over=D.projects.filter(p=>projectStatusV29(p)[1]==='逾期').length,active=Math.max(0,all-done-follow-over);
  app.innerHTML=`<div class="ref-dashboard">
    <section class="ref-hero"><div class="ref-hello"><h1>你好 👋</h1><p>管理你的工程，從這裡開始</p><small>專業・合規・安全・高效</small></div><div class="ref-script">Build a Better <span>Tomorrow</span></div></section>
    <section class="ref-kpis">
      <div class="ref-kpi green"><div class="ico">♜</div><div><small>工程總數</small><strong>${all}</strong><span class="trend">↑ 即時工程資料</span></div></div>
      <div class="ref-kpi blue"><div class="ico">▤</div><div><small>報價總額</small><strong>${moneyV29(quoteTotal)}</strong><span class="trend">Quotation</span></div></div>
      <div class="ref-kpi gold"><div class="ico">▣</div><div><small>Invoice 總額</small><strong>${moneyV29(invoiceTotal)}</strong><span class="trend">Invoice</span></div></div>
      <div class="ref-kpi red"><div class="ico">$</div><div><small>尚欠金額</small><strong>${moneyV29(due)}</strong><span class="trend">待收款</span></div></div>
    </section>
    <section class="ref-main-grid">
      <div class="ref-panel"><div class="ref-panel-head"><h2>▣　最近工程</h2><button class="ref-link" onclick="setNav('projects')">查看全部 →</button></div><div class="ref-tabs">${tabV29('all','全部',all)}${tabV29('active','進行中',active)}${tabV29('follow','待跟進',follow)}${tabV29('done','已完成',done)}${tabV29('overdue','已逾期',over)}</div><div class="ref-table-wrap"><table class="ref-table"><thead><tr><th>工程名稱</th><th>客戶</th><th>負責人</th><th>狀態</th><th>金額</th><th>跟進日期</th><th>操作</th></tr></thead><tbody>${rowsV29()}</tbody></table></div></div>
      <div class="ref-side-stack"><div class="ref-panel"><div class="ref-panel-head"><h3>◷　今日行程</h3><button class="ref-link" onclick="setNav('booking')">查看全部 →</button></div><div class="ref-schedule">${scheduleV29()}</div></div><div class="ref-panel"><div class="ref-panel-head"><h3>▦　快捷操作</h3><button class="ref-link" onclick="setNav('booking')">自訂 ›</button></div><div class="ref-quick"><button onclick="setNav('projects')">＋<br>工程</button><button onclick="newQuote()">▤<br>報價</button><button onclick="setNav('invoice')">▣<br>Invoice</button><button onclick="showBookingForm('')">▦<br>Booking</button></div></div></div>
    </section>
    <section class="ref-bottom-grid">
      <div class="ref-panel"><div class="ref-panel-head"><h3>▣　收款進度</h3></div><div class="ref-progress"><div class="ref-donut" style="--pct:${pct}%"><b>${pct}%</b></div><div class="ref-money"><div><span>合約總額</span><b>${moneyV29(contract)}</b></div><div><span>已收金額</span><b>${moneyV29(paid)}</b></div><div><span>尚欠金額</span><b class="red">${moneyV29(due)}</b></div></div></div></div>
      <div class="ref-panel"><div class="ref-panel-head"><h3>▥　每月工程數量</h3></div><div class="ref-bars">${barsV29()}</div></div>
      <div class="ref-panel ref-brandcard"><h3>專注工程<br>締造更好未來</h3><p>UNIBRIGHT CONSTRUCTION<br><br>合規標準　・　專業團隊　・　優質服務</p></div>
    </section>
    <section class="ref-panel ref-booking-panel"><div class="ref-panel-head"><h2>📅　Booking 預約表</h2><button class="btn green sm" onclick="showBookingForm('')">＋ 新增 Booking</button></div><div class="ref-table-wrap"><table class="ref-table ref-booking-table"><thead><tr><th>日期</th><th>時間</th><th>客戶</th><th>工程</th><th>類型</th><th>地點</th><th>負責人</th><th>狀態</th><th>操作</th></tr></thead><tbody>${bookingRowsV29()}</tbody></table></div></section>
  </div>`;
};

function patchChrome(){
  const av=document.querySelector('.avatar');if(av){av.textContent='👤';av.setAttribute('aria-label','帳戶')}
  document.querySelectorAll('.topbar .ub-top-meta').forEach(x=>x.remove());
  const top=document.querySelector('.topbar');if(top){const now=new Date();const weekdays=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];const meta=document.createElement('div');meta.className='ub-top-meta';meta.textContent=`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日　${weekdays[now.getDay()]}`;top.appendChild(meta)}
  const brand=document.querySelector('.brand');if(brand){const txt=brand.textContent||'';if(/Jason/i.test(txt))brand.innerHTML=brand.innerHTML.replace(/Jason/gi,'')}
}
patchChrome();
setTimeout(()=>{patchChrome();if(typeof tab!=='undefined'&&tab==='dashboard')renderDashboard()},300);
})();
