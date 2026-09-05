(() => {
  const button = document.querySelector('#readBtn');
  const host = document.querySelector('#baziInteractiveResult');
  if (!button || !host) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stemEl = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  const branchEl = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const hidden = {子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
  const terms = {
    藏干:'地支內含的天干，代表較隱性的資源、能力及事件背景；要連同月令及透干判讀。',
    旺衰:'按月令、根氣、透干及生剋估算日主承受力；本頁是可追溯的五行計數提示，不把分數當成絕對吉凶。',
    刑沖合害:'地支之間的互動：沖是變動，合是牽連，刑是磨合壓力，害是暗中不順；要看是否被其他柱化解或加強。',
    大運:'約十年一段的長周期，顯示人生階段的主題；仍須配合原局、流年和實際環境。',
    流年:'某一年加入的背景；適合定策略，不單獨決定結果。',
    流月:'一年內的月度節奏；適合安排先後次序。'
  };
  const openTerm = (title, text) => { const d = host.querySelector('#baziDeepDrawer'); if (!d) return; d.hidden = false; d.innerHTML = `<button class="bazi-term-close" aria-label="關閉術語">×</button><b>${esc(title)}</b><p>${esc(text)}</p>`; d.querySelector('button').onclick = () => { d.hidden = true; }; };
  const render = () => {
    if (document.querySelector('.method.active')?.dataset.name !== '八字' || typeof Solar === 'undefined') return;
    try {
      const date = document.querySelector('#birthDate').value, time = document.querySelector('#birthTime').value || '12:00';
      const [h, m] = time.split(':').map(Number), [y, mo, da] = date.split('-').map(Number);
      const ec = Solar.fromYmdHms(y, mo, da, h, m, 0).getLunar().getEightChar();
      const pillars = [
        ['年柱', ec.getYear(), ec.getYearNaYin(), ec.getYearHideGan(), ec.getYearShiShenZhi()],
        ['月柱', ec.getMonth(), ec.getMonthNaYin(), ec.getMonthHideGan(), ec.getMonthShiShenZhi()],
        ['日柱', ec.getDay(), ec.getDayNaYin(), ec.getDayHideGan(), ec.getDayShiShenZhi()],
        ['時柱', ec.getTime(), ec.getTimeNaYin(), ec.getTimeHideGan(), ec.getTimeShiShenZhi()]
      ];
      const visible = pillars.flatMap(([, gz]) => [gz[0], gz[1]]);
      const counts = Object.fromEntries(['木','火','土','金','水'].map(e => [e, 0]));
      visible.forEach((x, i) => { const e = i % 2 === 0 ? stemEl[x] : branchEl[x]; if (e) counts[e] += i % 2 === 0 ? 2 : 1; });
      const hiddenStems = pillars.flatMap(([, gz]) => [...(hidden[gz[1]] || '')]);
      hiddenStems.forEach(x => { if (stemEl[x]) counts[stemEl[x]] += 0.5; });
      const max = Math.max(...Object.values(counts)), day = ec.getDayGan(), dayE = stemEl[day] || '—';
      const strength = counts[dayE] >= max - 1 ? '偏旺／有根' : counts[dayE] <= 1.5 ? '偏弱／需借力' : '中和／要看運勢';
      const branches = pillars.map(x => x[1][1]);
      const relations = [];
      const push = (a,b,name) => { if (branches.includes(a) && branches.includes(b)) relations.push(`${a}${b}${name}`); };
      push('子','午','沖'); push('卯','酉','沖'); push('子','卯','刑'); push('子','酉','破'); push('寅','亥','合'); push('巳','申','合'); push('辰','酉','合'); push('午','未','合');
      const gender = document.querySelector('#gender').value === 'male' ? 1 : 0;
      const yun = ec.getYun(gender, 2), dayuns = yun.getDaYun(8), nowYear = new Date().getFullYear();
      const current = dayuns.find(d => nowYear >= d.getStartYear() && nowYear <= d.getEndYear()) || dayuns[Math.min(1, dayuns.length - 1)];
      const liu = current ? current.getLiuNian(10) : [];
      const currentLiu = liu.find(x => x.getYear() === nowYear);
      const flow = currentLiu ? `${currentLiu.getYear()} ${currentLiu.getGanZhi()}；流月：${currentLiu.getLiuYue().map(x => x.getGanZhi()).join('、')}` : '今年流年資料待按大運起始年對應';
      host.querySelector('.bazi-deep-panel')?.remove();
      const panel = document.createElement('section'); panel.className = 'bazi-deep-panel';
      panel.innerHTML = `<div class="chart-intro"><span>八字深度計算</span><strong>藏干、旺衰、刑沖合害、大運與流年</strong></div>
        <div class="bazi-deep-grid"><button class="deep-fact" data-term="藏干"><small>四柱藏干</small><b>${pillars.map(x => `${x[1][1]}：${x[3] || '—'}`).join(' ／ ')}</b></button><button class="deep-fact" data-term="旺衰"><small>日主 ${esc(day)} · ${esc(dayE)}</small><b>${strength}</b><span>五行權重 木 ${counts.木}／火 ${counts.火}／土 ${counts.土}／金 ${counts.金}／水 ${counts.水}</span></button><button class="deep-fact" data-term="刑沖合害"><small>地支互動</small><b>${relations.length ? relations.join('、') : '未見主要組合'}</b></button></div>
        <div class="bazi-deep-lines"><div><b>目前大運</b><span>${current ? `${current.getGanZhi() || '起運前'} · ${current.getStartYear()}–${current.getEndYear()}（${current.getStartAge()}–${current.getEndAge()}歲）` : '—'}</span></div><div><b>2026 流年</b><span>${esc(flow)}</span></div></div>
        <div class="deep-term-row"><button data-term="藏干">藏干</button><button data-term="旺衰">旺衰</button><button data-term="刑沖合害">刑沖合害</button><button data-term="大運">大運</button><button data-term="流年">流年</button><button data-term="流月">流月</button></div><div id="baziDeepDrawer" class="bazi-term-drawer" hidden></div>`;
      host.appendChild(panel);
      panel.querySelectorAll('[data-term]').forEach(el => el.onclick = () => openTerm(el.dataset.term, terms[el.dataset.term] || '先看原局，再配合時間層及現實資料。'));
    } catch (e) { console.warn('bazi deep render failed', e); }
  };
  button.addEventListener('click', () => setTimeout(render, 160));
})();
