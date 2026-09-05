(() => {
  const button = document.querySelector('#readBtn'), host = document.querySelector('#baziInteractiveResult');
  if (!button || !host) return;
  const definitions = {
    '年柱':'家族背景、早年環境、童年氣氛及你從社會根源帶來的傾向。','月柱':'成長環境、工作基礎、父母影響及季節令氣；八字判強弱要先看月令。','日柱':'日干是日主，代表你本人；日支常用作親密關係及內在落點參考。','時柱':'後期發展、作品、子女、長期目標及你想留下的成果。','日主':'八字代表本人的核心天干；強弱不能只看一粒字，要連月令、根氣、透干及全盤五行。','五行':'木火土金水五種元素；用來看資源、輸出、責任、財務及環境節奏，不能單獨當成吉凶。','十神':'以日主與其他天干的生剋及陰陽關係分類，描述同伴、資源、輸出、責任與財務。','大運':'約十年一段的長周期，用來看人生階段主題；要配合原局及流年，不是單獨定論。','流年':'某一年加入的時間背景；適合用來安排策略，不能取代現實證據。','流月／流日':'流年內的月度與短期節奏，適合做行動提醒，不宜單獨決定重大選擇。'
  };
  const stemElement={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  const branchElement={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const tenGods={丙:{甲:'偏印',乙:'正印',丙:'比肩',丁:'劫財',戊:'食神',己:'傷官',庚:'偏財',辛:'正財',壬:'七殺',癸:'正官'}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const render=()=>{
    if(document.querySelector('.method.active')?.dataset.name!=='八字'){host.hidden=true;host.innerHTML='';return;}
    if(typeof Solar==='undefined') return;
    try{
      const date=document.querySelector('#birthDate').value,time=document.querySelector('#birthTime').value||'12:00';
      const [h,m]=time.split(':').map(Number),solar=Solar.fromYmdHms(...date.split('-').map(Number),h,m,0),ec=solar.getLunar().getEightChar();
      const raw=[['年柱',ec.getYear(),ec.getYearNaYin()],['月柱',ec.getMonth(),ec.getMonthNaYin()],['日柱',ec.getDay(),ec.getDayNaYin()],['時柱',ec.getTime(),ec.getTimeNaYin()]];
      const dayGan=ec.getDayGan(), dayElement=stemElement[dayGan]||'—';
      host.hidden=false;
      host.closest('.result-card')?.classList.add('visual-mode');
      host.innerHTML=`<div class="chart-intro"><span>互動八字</span><strong>先揀一柱，再睇日主、五行、十神點樣落地</strong></div><div class="bazi-pillars">${raw.map((x,i)=>`<button class="pillar-card ${i===2?'is-selected':''}" data-index="${i}"><small>${x[0]}</small><strong>${esc(x[1])}</strong><span>${esc(x[2])}</span></button>`).join('')}</div><div class="bazi-facts"><button class="fact-card" data-term="日主"><small>日主</small><strong>${esc(dayGan)} · ${esc(dayElement)}</strong></button><button class="fact-card" data-term="五行"><small>四柱納音</small><strong>${raw.map(x=>x[2]).join('／')}</strong></button><button class="fact-card" data-term="十神"><small>天干關係</small><strong>${raw.map(x=>tenGods[dayGan]?.[x[1][0]]||'日主').join('／')}</strong></button></div><div class="bazi-detail" id="baziDetail"></div><div class="bazi-term-drawer" id="baziTermDrawer" hidden></div>`;
      const detail=host.querySelector('#baziDetail'),drawer=host.querySelector('#baziTermDrawer');
      const show=index=>{const [label,gz,nayin]=raw[index],gan=gz[0],zhi=gz[1],gEl=stemElement[gan]||'—',zEl=branchElement[zhi]||'—',ten=tenGods[dayGan]?.[gan]||'日主';detail.innerHTML=`<p class="eyebrow">${esc(label)}</p><h4>${esc(gz)}</h4><p>${esc(definitions[label])}</p><div class="bazi-line"><b>天干 ${esc(gan)}</b><span>${esc(gEl)} · ${esc(ten)}；${esc(definitions['十神'])}</span></div><div class="bazi-line"><b>地支 ${esc(zhi)}</b><span>${esc(zEl)}；配合藏干、刑沖合害及月令判讀。</span></div><div class="bazi-line"><b>納音</b><span>${esc(nayin)}；只作傳統分類參考，不單獨決定吉凶。</span></div><div class="bazi-terms"><button class="bazi-term" data-term="${label}">${label}</button><button class="bazi-term" data-term="日主">日主</button><button class="bazi-term" data-term="五行">五行</button><button class="bazi-term" data-term="十神">十神</button><button class="bazi-term" data-term="流月／流日">流月／流日</button></div>`;host.querySelectorAll('.pillar-card').forEach((el,i)=>el.classList.toggle('is-selected',i===index));detail.querySelectorAll('.bazi-term').forEach(chip=>chip.onclick=()=>{drawer.hidden=false;drawer.innerHTML=`<button class="bazi-term-close" aria-label="關閉術語">×</button><b>${esc(chip.dataset.term)}</b><p>${esc(definitions[chip.dataset.term])}</p>`;drawer.querySelector('.bazi-term-close').onclick=()=>{drawer.hidden=true;};});};
      host.querySelectorAll('.pillar-card').forEach((el,i)=>el.onclick=()=>show(i));host.querySelectorAll('.fact-card').forEach(el=>el.onclick=()=>{drawer.hidden=false;drawer.innerHTML=`<button class="bazi-term-close" aria-label="關閉術語">×</button><b>${esc(el.dataset.term)}</b><p>${esc(definitions[el.dataset.term])}</p>`;drawer.querySelector('.bazi-term-close').onclick=()=>{drawer.hidden=true;};});show(2);
    }catch(error){host.hidden=true;host.closest('.result-card')?.classList.remove('visual-mode');}
  };
  button.addEventListener('click',()=>setTimeout(render,80));
})();
