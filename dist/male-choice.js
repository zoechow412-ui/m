(() => {
  const cards = [...document.querySelectorAll('.male-choice-card')];
  if (!cards.length) return;
  const portrait = document.querySelector('[data-guide-portrait]');
  const name = document.querySelector('[data-guide-name]');
  const status = document.querySelector('#maleChoiceStatus');
  const key = 'hyeonpage-selected-guide';
  const apply = (card, save = true) => {
    cards.forEach(item => item.classList.toggle('is-selected', item === card));
    if (portrait) { portrait.src = card.dataset.image; portrait.alt = `${card.dataset.name}，玄頁韓漫命理師`; }
    if (name) name.textContent = card.dataset.title;
    if (status) status.textContent = `目前由${card.dataset.name}替你開盤：${card.dataset.tone}。`;
    document.body.dataset.selectedGuide = card.dataset.guide;
    if (save) localStorage.setItem(key, card.dataset.guide);
  };
  cards.forEach(card => card.addEventListener('click', () => apply(card)));
  const stored = localStorage.getItem(key);
  apply(cards.find(card => card.dataset.guide === stored) || cards.find(card => card.dataset.guide === 'amber') || cards[0], false);
})();
