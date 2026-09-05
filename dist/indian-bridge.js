(() => {
  const button = document.querySelector('#readBtn');
  if (!button) return;
  button.addEventListener('click', () => {
    if (document.querySelector('.method.active')?.dataset.name !== '印度占星') return;
    if (typeof window.__indianCalculate !== 'function') return;
    try {
      document.querySelector('#resultTitle').textContent = '印度占星 · 完整計算';
      document.querySelector('#resultText').textContent = window.__indianCalculate();
      document.querySelector('#readingPanel').classList.remove('is-open');
      document.querySelector('#resultCard').classList.add('is-open');
    } catch (error) {
      document.querySelector('#selectedNote').textContent = '印度星曆計算失敗：' + (error?.message || String(error));
    }
  });
})();
