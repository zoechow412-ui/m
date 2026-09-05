(() => {
  const button=document.querySelector('#readBtn'),host=document.querySelector('#interactiveResult'),text=()=>document.querySelector('#resultText')?.textContent||'';
  if(!button||!host)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const render=()=>{const method=document.querySelector('.method.active')?.dataset.name||'';
    if(method==='紫微斗數'||method==='八字'||method==='小六壬')return;
    const body=text();host.hidden=true;host.innerHTML='';
    if(['梅花易數','指一算','易經'].includes(method)){
      const get=k=>(body.match(new RegExp(k+'：([^\\n]+)'))||[])[1]||'—';
      const rows=[['本卦',get('本卦'),'問題目前嘅基本結構'],['互卦',get('互卦'),'事情內部嘅中段結構'],['變卦',get('變卦'),'動爻改變後嘅發展方向']];
      host.hidden=false;host.closest('.result-card')?.classList.add('visual-mode');host.innerHTML=`<div class="chart-intro"><span>互動卦盤</span><strong>本卦 → 互卦 → 變卦</strong></div><div class="gua-board">${rows.map((r,i)=>`<button class="gua-card ${i===0?'is-selected':''}" data-index="${i}"><small>${r[0]}</small><strong>${esc(r[1])}</strong><span>${r[2]}</span></button>`).join('')}</div><div class="gua-detail" id="guaDetail"></div>`;
      const detail=host.querySelector('#guaDetail'),cards=[...host.querySelectorAll('.gua-card')];const show=i=>{detail.innerHTML=`<p class="eyebrow">${rows[i][0]}</p><h4>${esc(rows[i][1])}</h4><p>${rows[i][2]}。配合動爻及現實問題一齊判讀，唔用單一卦名代替決定。</p>`;cards.forEach((c,n)=>c.classList.toggle('is-selected',n===i));};cards.forEach((c,i)=>c.onclick=()=>show(i));show(0);return;
    }
    if(method==='奇門遁甲'){
      const rows=[...body.matchAll(/九宮\s*([^：:]+)[：:]([^\n]+)/g)].map(x=>[x[1].trim(),x[2].trim()]);
      if(rows.length===8) rows.splice(4,0,['5','中宮｜值符、值使及全局氣勢匯聚位置']);
      if(!rows.length)return;
      host.hidden=false;host.closest('.result-card')?.classList.add('visual-mode');host.innerHTML=`<div class="chart-intro"><span>互動九宮</span><strong>點擊宮位查看門、星、神</strong></div><div class="qimen-board">${rows.slice(0,9).map((r,i)=>`<button class="qimen-card ${i===0?'is-selected':''}" data-index="${i}"><small>${esc(r[0])}</small><strong>${esc(r[1].split('｜')[0]||'—')}</strong><span>${esc(r[1].split('｜').slice(1).join('｜'))}</span></button>`).join('')}</div><div class="qimen-detail" id="qimenDetail"></div>`;
      const detail=host.querySelector('#qimenDetail'),cards=[...host.querySelectorAll('.qimen-card')];const show=i=>{const r=rows[i];detail.innerHTML=`<p class="eyebrow">${esc(r[0])}</p><h4>九宮 ${esc(r[0])}</h4><p>${esc(r[1])}</p><p>九宮內嘅地盤、天盤、八門及八神要配合值符、值使及問題用神一齊判讀。</p>`;cards.forEach((c,n)=>c.classList.toggle('is-selected',n===i));};cards.forEach((c,i)=>c.onclick=()=>show(i));show(0);return;
    }
    if(method==='印度占星'){
      const rows=[...body.matchAll(/(太陽|月亮|水星|金星|火星|木星|土星|羅喉|計都|Rahu|Ketu|上升點|Lagna)\s*[:：]?\s*([^\n]+)/g)];
      if(!rows.length)return;
      host.hidden=false;host.closest('.result-card')?.classList.add('visual-mode');host.innerHTML=`<div class="chart-intro"><span>互動星盤</span><strong>點擊行星查看星座位置</strong></div><div class="india-board">${rows.map((r,i)=>`<button class="india-card ${i===0?'is-selected':''}" data-index="${i}"><small>${esc(r[1])}</small><strong>${esc(r[0])}</strong></button>`).join('')}</div><div class="india-detail" id="indiaDetail"></div>`;
      const detail=host.querySelector('#indiaDetail'),cards=[...host.querySelectorAll('.india-card')];const show=i=>{const r=rows[i];detail.innerHTML=`<p class="eyebrow">SIDEREAL CHART</p><h4>${esc(r[0])}</h4><p>${esc(r[1])}。星體要連同宮位、Nakshatra、Dasha 及 Transit 一齊解讀。</p>`;cards.forEach((c,n)=>c.classList.toggle('is-selected',n===i));};cards.forEach((c,i)=>c.onclick=()=>show(i));show(0);
    }
  };
  button.addEventListener('click',()=>setTimeout(render,180));
})();
