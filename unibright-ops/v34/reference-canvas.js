(()=>{
'use strict';
window.UNIBRIGHT_V34_BUILD='20260914-v34-reference-canvas-1';
const prev={dashboard:window.renderDashboard,projects:window.renderProjects,quotation:window.renderQuotes,invoice:window.renderInvoices,receipt:window.renderReceipts,pricing:window.renderPricing,booking:window.renderBooking};
const $=(s,r=document)=>r.querySelector(s), all=(s,r=document)=>Array.from(r.querySelectorAll(s));
const n=v=>Number(v||0), cash=v=>'HK$'+Math.round(n(v)).toLocaleString('en-HK'), esc2=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const dt=v=>{if(!v)return '—';const a=String(v).split('-');return a.length===3?`${a[2]}/${a[1]}/${a[0]}`:v};
const tm=v=>v?String(v).slice(0,5):'—';
function logoSrc(){return document.querySelector('.brand img')?.src||''}
function bookings(){return Array.isArray(D?.bookings)?D.bookings:[]}
function projectStatus(p){const s=String(p?.status||'');if(p?.target_finish_date&&p.target_finish_date<today()&&!s.includes('完成'))return['red','逾期'];if(s.includes('完成'))return['blue','已完成'];if(s.includes('待'))return['gold','待跟進'];return['green',s||'進行中']}
function counts(){const a=D?.projects||[],done=a.filter(p=>projectStatus(p)[1]==='已完成').length,follow=a.filter(p=>projectStatus(p)[1]==='待跟進').length,over=a.filter(p=>projectStatus(p)[1]==='逾期').length;return{all:a.length,done,follow,over,active:Math.max(0,a.length-done-follow-over)}}
function nextDate(p){const b=bookings().filter(x=>x.project_id===p.id&&x.booking_date>=today()&&!String(x.status||'').includes('取消')).sort((a,b)=>String(a.booking_date).localeCompare(String(b.booking_date)))[0];return b?.booking_date||p?.target_finish_date||''}
function go(name){
  document.documentElement.classList.remove('ub34-mode');document.body.classList.remove('ub34-mode');
  const host=$('#ub34Host');if(host)host.innerHTML='';
  if(name==='calendar'||name==='booking'){if(typeof window.renderBooking==='function')return window.renderBooking();if(typeof prev.booking==='function')return prev.booking()}
  const map={projects:prev.projects,quotation:prev.quotation,invoice:prev.invoice,receipt:prev.receipt,pricing:prev.pricing};
  const fn=map[name];if(typeof fn==='function')return fn();
  return draw();
}
window.UB34={go};
function nav(label,en,ico,target,active=false){return `<button class="${active?'active':''}" onclick="UB34.go('${target}')"><span class="ico">${ico}</span><span><b>${label}</b><small>${en}</small></span></button>`}
function rows(){let list=(D?.projects||[]).slice(0,5);return list.length?list.map(p=>{const c=typeof clientByProject==='function'?(clientByProject(p.id)||{}):{},sm=typeof sumProject==='function'?(sumProject(p.id)||{}):{},st=projectStatus(p),amt=n(p.contract_amount)||n(sm.contract_amount);return `<tr onclick="editProject('${p.id}')"><td>${esc2(p.project_name||'未命名工程')}</td><td>${esc2(c.company_name||'—')}</td><td>${esc2(p.responsible_person||'—')}</td><td><span class="ub34-status ${st[0]}">${st[1]}</span></td><td>${cash(amt)}</td><td>${dt(nextDate(p))}</td><td><button class="ub34-more" onclick="event.stopPropagation();editProject('${p.id}')">•••</button></td></tr>`}).join(''):`<tr><td colspan="7" style="text-align:center;padding:32px;color:#7b8da0">未有工程資料</td></tr>`}
function events(){const a=bookings().filter(b=>b.booking_date===today()&&!String(b.status||'').includes('取消')).slice(0,3);if(!a.length)return `<div style="padding:35px 10px;text-align:center;color:#788b9c;font-size:12px">今日未有行程<br><button style="margin-top:10px;border:0;background:#e5f6ef;color:#08725a;border-radius:8px;padding:8px 12px;cursor:pointer" onclick="showBookingForm('')">＋ 新增 Booking</button></div>`;return a.map(b=>{const p=typeof project==='function'?(project(b.project_id)||{}):{};return `<div class="ub34-event"><div class="time">${tm(b.start_time)}</div><div class="dot"></div><div><b>${esc2(b.booking_type||'預約')} ${esc2(p.project_name||b.client_name||'')}</b><small>負責人：${esc2(b.responsible_person||p.responsible_person||'—')}</small></div><button onclick="showBookingForm('${b.id}')">▣</button></div>`}).join('')}
function bars(){const y=new Date().getFullYear(),a=Array(10).fill(0);(D?.projects||[]).forEach(p=>{const d=new Date(p.created_at||0);if(d.getFullYear()===y&&d.getMonth()<10)a[d.getMonth()]++});const m=Math.max(1,...a);return a.map((v,i)=>`<div class="ub34-bar"><i style="height:${Math.max(22,Math.round(v/m*92))}px"></i><span>${i+1}月</span></div>`).join('')}
function scale(){const c=$('.ub34-canvas'),v=$('.ub34-viewport');if(!c||!v)return;const s=Math.min(1.15,window.innerWidth/1536);c.style.transform=`scale(${s})`;v.style.height=(1024*s)+'px'}
function draw(){
  let host=$('#ub34Host');if(!host){host=document.createElement('div');host.id='ub34Host';document.body.appendChild(host)}
  document.documentElement.classList.add('ub34-mode');document.body.classList.add('ub34-mode');
  const c=counts(),quote=(D?.quotes||[]).reduce((a,x)=>a+n(x.total),0),inv=(D?.invoices||[]).reduce((a,x)=>a+n(x.total),0),due=(D?.invoices||[]).reduce((a,x)=>a+n(x.amount_due),0),got=(D?.payments||[]).reduce((a,x)=>a+n(x.amount),0),contract=(D?.summary||[]).reduce((a,x)=>a+n(x.contract_amount),0),pct=contract?Math.round(got/contract*100):0,d=new Date(),date=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  const logo=logoSrc();
  host.innerHTML=`<div class="ub34-viewport"><div class="ub34-canvas">
    <aside class="ub34-side"><div class="ub34-logo">${logo?`<img src="${logo}" alt="UNIBRIGHT">`:`<div class="ub34-logo-fallback">UNIBRIGHT<br><small>CONSTRUCTION</small></div>`}</div><div class="ub34-nav">
      ${nav('首頁','Dashboard','⌂','dashboard',true)}${nav('工程項目','Projects','♜','projects')}${nav('報價管理','Quotation','▤','quotation')}${nav('Invoice 管理','Invoice','▣','invoice')}${nav('收款 / Receipt','Payment','$','receipt')}${nav('項目表','Calendar','▦','calendar')}${nav('客戶資料','Clients','○','projects')}${nav('文件管理','Documents','▱','quotation')}${nav('報表分析','Reports','↗','receipt')}${nav('設定','Settings','⚙','pricing')}
    </div><div class="ub34-side-city"><div class="ub34-motto">專業・合規・高效<small>Build a Better Tomorrow</small></div><div class="ub34-userbox"><div class="ub34-avatar">👤</div><div><b>負責人</b><small>UNIBRIGHT</small></div><span style="margin-left:auto">⌄</span></div></div></aside>
    <header class="ub34-top"><div class="ub34-search">⌕ <input placeholder="搜尋工程名稱、客戶、Project Ref..."></div><button class="ub34-bell">♧</button><div class="ub34-topavatar">👤</div><div class="ub34-date">${date}</div><div class="ub34-weather"><span class="sun">☀</span>香港</div></header>
    <main class="ub34-main"><section class="ub34-hero"><div class="ub34-hello"><h1>你好 👋</h1><p>管理你的工程・從這裡開始</p><small>專業・合規・安全・高效</small></div><div class="ub34-script">Build a Better<span>Tomorrow</span><small>UNIBRIGHT CONSTRUCTION</small></div><div class="ub34-heroright">用專業<br>建設更好的<br>生活空間</div></section>
      <section class="ub34-kpis"><button class="ub34-kpi green" onclick="UB34.go('projects')"><div class="icon">♜</div><div><small>工程總數</small><strong>${c.all}</strong><span class="trend">↑ 即時工程資料</span></div><div class="arrow">›</div></button><button class="ub34-kpi blue" onclick="UB34.go('quotation')"><div class="icon">▤</div><div><small>報價總額</small><strong>${cash(quote)}</strong><span class="trend">↑ 報價資料</span></div><div class="arrow">›</div></button><button class="ub34-kpi gold" onclick="UB34.go('invoice')"><div class="icon">▣</div><div><small>Invoice 總額</small><strong>${cash(inv)}</strong><span class="trend">↑ Invoice</span></div><div class="arrow">›</div></button><button class="ub34-kpi red" onclick="UB34.go('receipt')"><div class="icon">$</div><div><small>尚欠金額</small><strong>${cash(due)}</strong><span class="trend">↓ 待收款</span></div><div class="arrow">›</div></button></section>
      <section class="ub34-panel ub34-projects"><div class="ub34-ph"><h2>▣　最近工程</h2><button onclick="UB34.go('projects')">查看全部 →</button></div><div class="ub34-tabs"><button class="active">全部 (${c.all})</button><button>進行中 (${c.active})</button><button>待跟進 (${c.follow})</button><button>已完成 (${c.done})</button><button>已逾期 (${c.over})</button></div><table class="ub34-table"><thead><tr><th>工程名稱</th><th>客戶</th><th>負責人</th><th>狀態</th><th>金額</th><th>跟進日期</th><th>操作</th></tr></thead><tbody>${rows()}</tbody></table></section>
      <section class="ub34-panel ub34-schedule"><div class="ub34-ph"><h3>▦　今日行程</h3><button onclick="UB34.go('calendar')">查看全部 →</button></div>${events()}</section>
      <section class="ub34-panel ub34-quick"><div class="ub34-ph"><h3>◉　快捷操作</h3><button onclick="UB34.go('calendar')">Booking →</button></div><div class="ub34-qgrid"><button onclick="newProject()">＋<br>新增工程</button><button onclick="newQuote()">▤<br>新增報價</button><button onclick="UB34.go('invoice')">▣<br>新增 Invoice</button><button onclick="UB34.go('receipt')">$<br>新增收據</button></div></section>
      <section class="ub34-panel ub34-pay"><div class="ub34-ph"><h3>▣　收款進度</h3></div><div class="ub34-donutrow"><div class="ub34-donut" style="--pct:${pct}%"><b>${pct}%</b></div><div class="ub34-money"><div><span>●　合約總額</span><b>${cash(contract)}</b></div><div><span>●　已收金額</span><b>${cash(got)}</b></div><div><span>●　尚欠金額</span><b class="red">${cash(Math.max(0,contract-got))}</b></div></div></div></section>
      <section class="ub34-panel ub34-barsbox"><div class="ub34-ph"><h3>▥　每月工程數量</h3></div><div class="ub34-chart">${bars()}</div></section>
      <section class="ub34-panel ub34-brand"><div class="ub34-brandpic"><div class="ub34-brandcopy"><h3>專注工程<br>締造更好未來</h3><small>UNIBRIGHT CONSTRUCTION</small></div></div><div class="ub34-features"><span>合規標準</span><span>專業團隊</span><span>優質服務</span></div></section>
    </main>
  </div></div>`;
  scale();
}
window.addEventListener('resize',()=>{if(document.body.classList.contains('ub34-mode'))scale()});
window.renderDashboard=draw;try{renderDashboard=draw}catch(_){ }
setTimeout(draw,450);
})();