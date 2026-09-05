(() => {
  const button = document.querySelector('#readBtn');
  const host = document.querySelector('#interactiveResult');
  if (!button || !host) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const topics = ['工作','財運','感情','健康','家庭／人際','學業／方向'];
  const topic = () => document.querySelector('#topicChoice')?.dataset.value || '工作';
  const base = {
    '乾':'開創、主動、承擔與持續推進','坤':'承載、配合、累積與穩定落地','震':'啟動、突破、消息與突然變化','巽':'滲透、協商、調整與循序深入','坎':'風險、壓力、未知與需要過關','離':'看見、表達、曝光與辨別真相','艮':'停止、界線、整理與守住底線','兌':'交流、互惠、喜悅與公開溝通'
  };
  const actionByTopic = {工作:'先核對權責、資源、期限及成果標準。',財運:'先保留現金流，再核對付款、回報與最壞損失。',感情:'用一次直接對話核對投入、界線與下一步，不靠猜。',健康:'把身體訊號當作優先資料，安排休息或專業評估，不用卦象代替醫療。','家庭／人際':'分清責任邊界，將口頭要求改成可執行分工。','學業／方向':'選一個低成本試行，記錄學習成果，再決定是否長期投入。'};
  const parse = raw => { const lines=String(raw||'').split('\n').filter(Boolean); const title=lines[0]||''; const name=(title.match(/第\d+卦\s*([^（(]+)/)||[])[1]?.trim()||title; return {title,name,raw:lines.slice(1).join(' ')}; };
  const explain = rec => { const clean=rec.name.replace(/卦$/,''); const chars=[...clean]; const a=base[chars[0]]||'局面正在變化'; const b=base[chars[1]]||'需要按現實條件調整'; return `<div class="hex-deep-head"><span>HEXAGRAM ${esc(rec.title.match(/第\d+/)?.[0]||'')}</span><h3>${esc(rec.name)}</h3><p>${esc(a)}；${esc(b)}。以下係依卦象整理嘅推測框架，唔係必然預言。</p></div><div class="hex-deep-grid"><article><b>卦義與白話</b><p>${esc(rec.raw.slice(0,380))}</p><p>白話講：事情唔應該只用「吉／凶」二分，而係要睇目前係開創、承載、變動、風險、曝光、停定，定係需要重新協商。${esc(a)}代表其中一股力量，${esc(b)}代表另一股力量。</p></article><article><b>今次盤面作用</b><p>本卦講眼前結構；互卦講中段條件；變卦講改變後方向；動爻指出最先需要處理嘅位置。${esc(rec.name)}要同你嘅問題「${esc(document.querySelector('#question')?.value||'目前最重要的選擇')}」一齊讀，唔可以抽離問題單獨解。</p></article><article><b>六大主題影響</b><ul>${topics.map(t=>`<li><strong>${t}：</strong>${t===topic()?'今次優先睇呢一欄；先觀察實際行動與條件是否匹配。':'作為旁支影響，留意佢會唔會牽動你嘅時間、資源或情緒。'}</li>`).join('')}</ul></article><article><b>可能時間窗口</b><p>未來 7 日：適合收集消息、補資料、避免一次押注。1 至 3 個月：較容易見到承諾有冇轉成持續行動。3 個月後：再判斷模式係改善、重複，定係需要退出。</p></article><article><b>風險與盲點</b><p>最大風險係把象意當成保證，或者只揀符合自己期待嘅一段。若現實證據同卦象矛盾，以合約、數字、健康狀態、對方實際行動及可控風險為先。</p></article><article><b>實際行動</b><p>${esc(actionByTopic[topic()]||actionByTopic['工作'])} 24 小時內完成一次核對，並設 7 日覆核日；到期只按已發生嘅事更新判斷。</p></article></div>`; };
  const render = async () => {
    if (document.querySelector('.method.active')?.dataset.name !== '易經') return;
    if (host.querySelector('.hex-library')) return;
    const names=['乾為天','坤為地','水雷屯','山水蒙','水天需','天水訟','地水師','水地比','風天小畜','天澤履','地天泰','天地否','天火同人','火天大有','地山謙','雷地豫','澤雷隨','山風蠱','地澤臨','風地觀','火雷噬嗑','山火賁','山地剝','地雷復','天雷無妄','山天大畜','山雷頤','澤風大過','坎為水','離為火','澤山咸','雷風恆','天山遯','雷天大壯','火地晉','地火明夷','風火家人','火澤睽','水山蹇','雷水解','山澤損','風雷益','澤天夬','天風姤','澤地萃','地風升','澤水困','水風井','澤火革','火風鼎','震為雷','艮為山','風山漸','雷澤歸妹','雷火豐','火山旅','巽為風','兌為澤','風水渙','水澤節','風澤中孚','雷山小過','水火既濟','火水未濟'];
    const records=names.map((name,i)=>({title:`第${i+1}卦`,name,raw:`${name}嘅核心象意係一種處境提示：唔用單一吉凶取代判斷，而係觀察你同環境嘅互動、阻力、資源同變化。` }));
    const current=(document.querySelector('#resultText')?.textContent.match(/本卦：([^\n]+)/)||[])[1]?.trim()||'';
    const cards=records.map((rec,i)=>`<button class="hex-index-card ${rec.name.includes(current.replace(/（.*$/,''))?'is-current':''}" data-hex="${i}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(rec.name)}</b></button>`).join('');
    host.insertAdjacentHTML('beforeend',`<section class="hex-library"><div class="hex-library-head"><span>64 HEXAGRAMS</span><h3>易經六十四卦 · 逐卦解答</h3><p>每一卦都可以獨立打開，睇卦義、白話、主題影響、時間窗口及行動。</p></div><div class="hex-index-grid">${cards}</div><div class="hex-deep-panel" id="hexDeepPanel">請撳上面任何一卦，墨川會即場拆解。</div></section>`);
    const panel=host.querySelector('#hexDeepPanel'); host.querySelectorAll('.hex-index-card').forEach(card=>card.addEventListener('click',()=>{host.querySelectorAll('.hex-index-card').forEach(x=>x.classList.remove('is-active'));card.classList.add('is-active');panel.innerHTML=explain(records[Number(card.dataset.hex)]);panel.scrollIntoView({behavior:'smooth',block:'nearest'});}));
    const first=host.querySelector('.hex-index-card.is-current')||host.querySelector('.hex-index-card'); if(first) first.click();
  };
  button.addEventListener('click',()=>setTimeout(render,900));
})();
