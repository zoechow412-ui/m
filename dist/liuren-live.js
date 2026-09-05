(() => {
  const button = document.querySelector('#readBtn');
  if (!button) return;
  const signs = [
    ['大安','穩定、守成','先守住基本盤，按計劃完成第一步。'],
    ['留連','拖延、待定','先查清楚阻力及等待條件，不急住定案。'],
    ['速喜','消息快、進展快','即時跟進機會，但要核對條款細節。'],
    ['赤口','口舌、衝突','避免衝動回覆，重要事情用書面留紀錄。'],
    ['小吉','小幅順利、有人助','先做小規模測試，收集回饋再加碼。'],
    ['空亡','未定、事不全','補資料及驗證承諾，暫緩不可逆決定。']
  ];
  const hkNow = () => {
    const p = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).reduce((o,x)=>(o[x.type]=x.value,o),{});
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  };
  button.addEventListener('click', () => setTimeout(() => {
    if (document.querySelector('.method.active')?.dataset.name !== '小六壬') return;
    const host = document.querySelector('#interactiveResult');
    if (!host) return;
    const question = document.querySelector('#question')?.value.trim() || '目前最重要的選擇';
    const raw = document.querySelector('#momentTime')?.value || hkNow();
    const hour = Number(raw.slice(11,13)) || 12;
    const selected = Math.floor((hour + 1) / 2) % 6;
    const current = signs[selected];
    host.hidden = false;
    host.innerHTML = `<img class="liuren-figure" src="./public/teaser/mokawa-pose-liuren.png" alt="墨川以手指推算小六壬"><div class="chart-intro"><span>互動掐指一算</span><strong>落宮：「${current[0]}」</strong></div><div class="liuren-method-note"><b>點樣計？</b><span>只用香港當下時間；左手六個固定關節位依次為：大安 → 留連 → 速喜 → 赤口 → 小吉 → 空亡。</span><span>大安起正月 → 月上起日 → 日上起時，最後落點用來讀事情節奏。</span></div><div class="liuren-steps"><div><small>01</small><b>月上起月</b><span>由大安開始</span></div><div><small>02</small><b>月上起日</b><span>按農曆日數</span></div><div><small>03</small><b>日上起時</b><span>香港 ${raw.slice(11,16)}</span></div></div><div class="liuren-board">${signs.map((s,i)=>`<button class="liuren-card ${i===selected?'is-selected':''}" data-index="${i}"><small>${i+1}</small><strong>${s[0]}</strong><span>${s[1]}</span></button>`).join('')}</div><div class="liuren-detail"><p class="eyebrow">CURRENT SIGN · ${raw}</p><h4>${current[0]}</h4><p>${current[1]}：${current[2]}</p><p><b>針對「${question}」：</b>先將答案拆成一個今日可以驗證嘅小行動，再決定是否投入更多。</p></div>`;
    host.querySelectorAll('.liuren-card').forEach((card,i)=>card.addEventListener('click',()=>{host.querySelectorAll('.liuren-card').forEach((c,n)=>c.classList.toggle('is-selected',n===i));const d=host.querySelector('.liuren-detail');d.innerHTML=`<p class="eyebrow">SIX SPIRITS · ${i+1}/6</p><h4>${signs[i][0]}</h4><p>${signs[i][1]}：${signs[i][2]}</p><p><b>針對「${question}」：</b>將呢個提示翻譯成一個可核對嘅行動，唔好當成百分百預言。</p>`;}));
    const title = document.querySelector('#resultTitle');
    if (title) title.textContent = '掐指一算 · 六神解讀';
  }, 240));
})();
