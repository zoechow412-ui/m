(() => {
  const story = document.querySelector('#teaserStory');
  if (!story) return;

  const q = selector => document.querySelector(selector);
  const qa = selector => [...document.querySelectorAll(selector)];
  const value = selector => q(selector)?.value?.trim() || '';
  const pad = number => String(number).padStart(2, '0');
  const termMeanings = {
    '紫微': '紫微代表整合資源、承擔責任及掌握方向。真正判讀要連同所在宮位、同宮星曜、三方四正及四化，唔可以只用「帝王星」三個字落結論。',
    '七殺': '七殺代表決斷、競爭、突破同高壓環境。放喺工作問題，要核對你有冇實際權限、支援同退路；有行動力唔等於要硬撐。',
    '日主': '日主係八字日柱天干，代表本人核心五行。強弱要由月令、根氣、透干、刑沖合害同整體寒暖燥濕一齊判斷。',
    '值符': '值符係奇門局中統領九星嘅核心訊號，反映局勢主導力量。要同值使、落宮、門星神及空亡一齊睇。',
    'Dasha': 'Vimshottari Dasha 係印度占星常用時間週期，以月亮 Nakshatra 計起始主星及餘額，再分大運與子運；唔係單睇一粒行星就預言事件。'
  };

  function eightCharacters(date, time) {
    try {
      if (!window.Solar || !date) return '進入後按出生資料排盤';
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = (time || '12:00').split(':').map(Number);
      const eight = window.Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar().getEightChar();
      return [eight.getYear(), eight.getMonth(), eight.getDay(), eight.getTime()].join(' · ');
    } catch (error) {
      return '進入後按出生資料排盤';
    }
  }

  function hydrate() {
    const name = value('#wizardName') || '你';
    const date = value('#wizardDate');
    const time = value('#wizardTime') || '12:00';
    const question = value('#wizardQuestion') || '尚未輸入問題';
    qa('[data-teaser-name]').forEach(node => { node.textContent = name; });
    qa('[data-teaser-question]').forEach(node => { node.textContent = question; });
    qa('[data-teaser-birth]').forEach(node => {
      node.textContent = date ? `${date} · ${time}` : '尚未輸入';
    });
    qa('[data-teaser-pillars]').forEach(node => {
      node.textContent = eightCharacters(date, time);
    });
  }

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -7% 0px' })
    : null;
  qa('.teaser-reveal').forEach(node => revealObserver ? revealObserver.observe(node) : node.classList.add('in-view'));

  let ticking = false;
  const updateMotion = () => {
    ticking = false;
    if (!story.classList.contains('is-open')) return;
    const viewport = window.innerHeight || 1;
    qa('[data-scene]').forEach(scene => {
      const rect = scene.getBoundingClientRect();
      const shift = Math.max(-100, Math.min(100, ((viewport / 2) - (rect.top + rect.height / 2)) / viewport * 100));
      scene.style.setProperty('--scene-shift', shift.toFixed(2));
    });
    const traversed = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const total = Math.max(1, document.documentElement.scrollHeight - viewport);
    const progress = Math.min(99, Math.round(traversed / total * 100));
    const label = q('#storyProgress');
    if (label) label.textContent = pad(progress);
  };
  const requestMotion = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateMotion);
  };
  window.addEventListener('scroll', requestMotion, { passive: true });
  window.addEventListener('resize', requestMotion);

  qa('[data-demo-term]').forEach(button => {
    button.addEventListener('click', () => {
      qa('[data-demo-term]').forEach(item => item.classList.toggle('active', item === button));
      const demo = q('#termDemo');
      if (demo) demo.textContent = termMeanings[button.dataset.demoTerm] || '進入命盤後查看完整解釋。';
    });
  });

  window.prepareTeaserStory = () => {
    hydrate();
    requestAnimationFrame(() => {
      qa('.teaser-reveal').slice(0, 3).forEach(node => node.classList.add('in-view'));
      updateMotion();
    });
  };

  const params = new URLSearchParams(location.search);
  if (params.get('screen') === 'teaser' || params.get('step') === 'immersion' || params.get('step') === 'teaser' || location.hash === '#teaser' || /\/teaser\/?$/.test(location.pathname)) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    qa('#hero,#templeScreen,#onboarding,#oracle').forEach(node => node?.classList.remove('is-open'));
    q('#hero')?.classList.add('is-hidden');
    story.classList.add('is-open');
    story.setAttribute('aria-hidden', 'false');
    hydrate();
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    setTimeout(() => window.scrollTo(0, 0), 80);
    requestAnimationFrame(updateMotion);
  }
})();
