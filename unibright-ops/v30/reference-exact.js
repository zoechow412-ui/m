(()=>{
'use strict';
window.UNIBRIGHT_V30_BUILD='20260914-v30-reference-exact-1';

function activateNav(name){
  try{tab=name}catch(_){ }
  document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
}
function go(name){
  if(name==='booking'){
    activateNav('booking');
    if(typeof window.renderBooking==='function')window.renderBooking();
    else if(typeof renderBooking==='function')renderBooking();
    return;
  }
  if(typeof setNav==='function')setNav(name);
}
function keyboardize(el,fn){
  if(!el||el.dataset.ubWired==='1')return;
  el.dataset.ubWired='1';el.setAttribute('role','button');el.setAttribute('tabindex','0');
  el.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea'))return;fn(e)});
  el.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('button,a,input,select,textarea')){e.preventDefault();fn(e)}});
}
function wireDashboard(){
  const k=[...document.querySelectorAll('.ref-kpi')];
  [['projects'],['quotation'],['invoice'],['receipt']].forEach((a,i)=>{const el=k[i];if(!el)return;keyboardize(el,()=>go(a[0]));});

  const projectRows=[...document.querySelectorAll('.ref-main-grid .ref-table tbody tr')];
  projectRows.forEach(row=>{
    const btn=row.querySelector('button[onclick*="editProject"]');if(!btn)return;
    const m=(btn.getAttribute('onclick')||'').match(/editProject\('([^']+)'\)/);if(!m)return;
    keyboardize(row,()=>{if(typeof editProject==='function')editProject(m[1])});
  });

  document.querySelectorAll('.ref-schedule-item').forEach(item=>{
    const btn=item.querySelector('button[onclick*="showBookingForm"]');if(!btn)return;
    const m=(btn.getAttribute('onclick')||'').match(/showBookingForm\('([^']*)'\)/);if(!m)return;
    keyboardize(item,()=>{if(typeof showBookingForm==='function')showBookingForm(m[1])});
  });

  const bottom=[...document.querySelectorAll('.ref-bottom-grid .ref-panel')];
  if(bottom[0]){bottom[0].dataset.clickable='1';keyboardize(bottom[0],()=>go('receipt'))}
  if(bottom[1]){bottom[1].dataset.clickable='1';keyboardize(bottom[1],()=>go('projects'))}

  document.querySelectorAll('.ref-booking-panel tbody tr').forEach(row=>{
    const btn=row.querySelector('button[onclick*="showBookingForm"]');if(!btn)return;
    const m=(btn.getAttribute('onclick')||'').match(/showBookingForm\('([^']+)'\)/);if(!m)return;
    keyboardize(row,()=>{if(typeof showBookingForm==='function')showBookingForm(m[1])});
  });
}

const previousDashboard=window.renderDashboard;
if(typeof previousDashboard==='function'){
  window.renderDashboard=function(){previousDashboard();requestAnimationFrame(wireDashboard)};
}

function interceptBookingNav(){
  document.querySelectorAll('[data-nav="booking"]').forEach(btn=>{
    if(btn.dataset.ubBookingWired==='1')return;
    btn.dataset.ubBookingWired='1';
    btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();go('booking')},true);
  });
}

function cleanChrome(){
  const av=document.querySelector('.avatar');if(av){av.textContent='👤';av.removeAttribute('title')}
  document.querySelectorAll('.ub-top-meta').forEach(el=>{el.style.fontWeight='600'});
}

interceptBookingNav();cleanChrome();
requestAnimationFrame(()=>{wireDashboard();interceptBookingNav();cleanChrome()});
setTimeout(()=>{wireDashboard();interceptBookingNav();cleanChrome()},500);
})();
