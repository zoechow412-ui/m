(() => {
  const button = document.querySelector('#readBtn');
  if (!button) return;
  const val = id => document.querySelector('#' + id)?.value || '';
  let hexagrams = [];
  fetch('./public/hexagrams.json?v=20260823').then(r => r.json()).then(x => { hexagrams = x['周易'] || []; }).catch(() => {});
  const parseHexagram = index => {
    const raw = hexagrams[index - 1] || `第${index}卦（本地資料未載入）`;
    const lines = raw.split('\n');
    return {title: lines[0] || `第${index}卦`,body: lines.slice(1, 5).join('\n')};
  };
  const trigram={1:{name:'乾',symbol:'☰',bits:[1,1,1],element:'金'},2:{name:'兌',symbol:'☱',bits:[1,1,0],element:'金'},3:{name:'離',symbol:'☲',bits:[1,0,1],element:'火'},4:{name:'震',symbol:'☳',bits:[1,0,0],element:'木'},5:{name:'巽',symbol:'☴',bits:[0,1,1],element:'木'},6:{name:'坎',symbol:'☵',bits:[0,1,0],element:'水'},7:{name:'艮',symbol:'☶',bits:[0,0,1],element:'土'},8:{name:'坤',symbol:'☷',bits:[0,0,0],element:'土'}};
  const pairNames=[
    ['坤為地','澤地萃','雷地豫','風地觀','水地比','山地剝','火地晉','天地否'],
    ['澤天夬','兌為澤','雷澤歸妹','風澤中孚','水澤節','山澤損','火澤睽','天澤履'],
    ['雷天大壯','澤雷隨','震為雷','風雷益','水雷屯','山雷頤','火雷噬嗑','天雷無妄'],
    ['風天小畜','澤風大過','雷風恆','巽為風','水風井','山風蠱','火風鼎','天風姤'],
    ['水天需','澤水困','雷水解','風水渙','坎為水','山水蒙','火水未濟','天水訟'],
    ['山天大畜','澤山咸','雷山小過','風山漸','水山蹇','艮為山','火山旅','天山遯'],
    ['火天大有','澤火革','雷火豐','風火家人','水火既濟','山火賁','離為火','天火同人'],
    ['地天泰','地澤臨','地雷復','地風升','地水師','地山謙','地火明夷','乾為天']
  ];
  const pairIndex={1:7,2:1,3:6,4:2,5:3,6:4,7:5,8:0};
  const guaName=(upper,lower)=>pairNames[pairIndex[lower]][pairIndex[upper]];
  const linesFor=(upper,lower)=>trigram[lower].bits.concat(trigram[upper].bits);
  const changed=(lines,moving)=>{const next=lines.slice();next[moving-1]=next[moving-1]?0:1;return next;};
  const numForBits=bits=>Object.keys(trigram).find(n=>trigram[n].bits.join('')===bits.join(''));
  const hexagramByName=name=>{const raw=hexagrams.find(x=>String(x).includes(name.replace('遯','遁')));if(!raw)return {title:name,body:'本地卦文尚未載入。'};const parts=raw.split('\n');return {title:parts[0],body:parts.slice(1,5).join('\n')};};
  const assemble=(upper,lower,moving,basis)=>{const main=linesFor(upper,lower),mutual=[main[1],main[2],main[3],main[2],main[3],main[4]],next=changed(main,moving),mutualUpper=numForBits(mutual.slice(3)),mutualLower=numForBits(mutual.slice(0,3)),changedUpper=numForBits(next.slice(3)),changedLower=numForBits(next.slice(0,3));return {basis,upper,lower,moving,mainName:guaName(upper,lower),mutualName:guaName(Number(mutualUpper),Number(mutualLower)),changedName:guaName(Number(changedUpper),Number(changedLower)),mainElement:trigram[lower].name+'（'+trigram[lower].element+'）／'+trigram[upper].name+'（'+trigram[upper].element+'）'};};
  const meihuaFromTime=moment=>{const d=new Date(moment),shichen=Math.floor((d.getHours()+1)/2)%12+1;let yearNum=((d.getFullYear()-4)%12+12)%12+1,monthNum=d.getMonth()+1,dayNum=d.getDate(),basis=`時間起卦：公曆 ${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}；時辰數 ${shichen}`;try{if(window.Solar){const lunar=Solar.fromYmdHms(d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),0).getLunar();yearNum=lunar.getYearGanIndex()+1;monthNum=Math.abs(lunar.getMonth());dayNum=lunar.getDay();basis=`農曆時間起卦：年支數 ${yearNum}、農曆月 ${monthNum}、農曆日 ${dayNum}、時辰數 ${shichen}`;}}catch(e){}const total=yearNum+monthNum+dayNum;return assemble((total%8)||8,((total+shichen)%8)||8,((total+shichen)%6)||6,basis);};
  const meihuaFromNumber=number=>{const n=Math.abs(Number(number))||1,digits=String(n).split('').reduce((a,b)=>a+Number(b),0);return assemble((n%8)||8,(digits%8)||8,(n%6)||6,`一念一數起卦：輸入 ${n}；數字和 ${digits}；上卦取餘數、下卦取數字和、動爻取六除餘數`);};
  const seed = text => [...text].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) % 997, 7);
  const show = (title, body) => {
    document.querySelector('#resultTitle').textContent = title;
    document.querySelector('#resultText').textContent = body;
    document.querySelector('#readingPanel').classList.remove('is-open');
    document.querySelector('#resultCard').classList.add('is-open');
  };
  button.addEventListener('click', async () => {
    const method = document.querySelector('.method.active')?.dataset.name;
    if (!['梅花易數','指一算','易經','奇門遁甲'].includes(method)) return;
    const question = val('question').trim() || '目前最重要的選擇';
    const number = Number(val('numbers')) || 0;
    if (method === '奇門遁甲') {
      const moment = val('momentTime') || new Date().toISOString().slice(0,16);
      try {
        const qimen = window.QimenEngine || await import('./public/qimen-engine.js');
        const chart = qimen.calculate(new Date(moment), { type: '三元', method: '时家', location: val('birthPlace') || '香港', purpose: question });
        if (chart?.error) throw new Error(chart.message || '奇門排盤失敗');
        const rows = chart.baseOrder.map((palace, i) => `九宮 ${palace}：地盤 ${chart.baseArr[i]?.diPan || '—'}｜天盤 ${chart.starArr[i]?.tianpan || '—'}｜八門 ${chart.gateArr[i] || '—'}｜八神 ${chart.godArr[i] || '—'}`).join('\n');
        show('奇門遁甲 · 完整九宮盤', `問題：「${question}」\n\n起局時間：${moment}\n所在地：${val('birthPlace') || '香港'}\n\n四柱：${Object.values(chart.info.siZhu).join('／')}\n節氣：${chart.info.jieqi}\n局數：${chart.info.ju}\n值符：${chart.info.fu}\n值使：${chart.info.shi}\n旬首：${chart.info.xunshou}\n空亡：${chart.info.kong}\n\n${rows}\n\n判讀框架：先以局數、值符、值使定位主軸，再按問題檢查九宮內的門、星、神；最後將吉方轉成可執行時間及方向。\n\n資料層：四柱、節氣、陰陽遁、局數、地盤、天盤、九星、八門、八神、值符、值使、空亡\n來源審計：perfhelf/bigfishmarquis-qimen（研究規則及資料）＋本地 qimendunjia-standalone（MrJelly/QiMenDunJia）執行九宮計算`);
      } catch (error) {
        show('奇門遁甲 · 排盤錯誤', `問題：「${question}」\n\n本地完整九宮引擎未能完成排盤：${error.message}\n\n系統沒有以簡化文字冒充完整奇門盤，請檢查日期格式或引擎版本。`);
      }
      return;
    }
    const moment=val('momentTime')||new Date().toISOString().slice(0,16),reading=method==='指一算'&&number?meihuaFromNumber(number):meihuaFromTime(moment),numberLine=method==='指一算'&&number?`一指數字：${number}；已按數字公式獨立起卦`:'按指定起卦時間起卦',hex=hexagramByName(reading.mainName),mutual=hexagramByName(reading.mutualName),changedHex=hexagramByName(reading.changedName);
    show(`${method} · 本地卦典`, `問題：「${question}」\n\n${numberLine}\n起卦時間：${moment}\n${reading.basis}\n上卦：${reading.upper}（${trigram[reading.upper].symbol}${trigram[reading.upper].name}）\n下卦：${reading.lower}（${trigram[reading.lower].symbol}${trigram[reading.lower].name}）\n動爻：第 ${reading.moving} 爻\n\n本卦：${hex.title}\n${hex.body}\n\n互卦：${mutual.title}\n${mutual.body}\n\n變卦：${changedHex.title}\n${changedHex.body}\n\n判讀框架：先讀本卦，再看互卦的中段結構及變卦方向；動爻只指出最需要處理的變化位，最後落實一個 24 小時內可驗證的行動。\n\n資料層：時間起卦、上下卦、動爻、本卦、互卦、變卦、六十四卦本地資料\n來源審計：handsomejustin/meihua-yi（起卦／體用規則研究源）＋kentang2017/ichingshifa（卦爻資料研究源）＋public/hexagrams.json`);
  });
})();
