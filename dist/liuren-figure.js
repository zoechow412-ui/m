(() => {
  const button = document.querySelector('#readBtn');
  if (!button) return;
  button.addEventListener('click', () => setTimeout(() => {
    if (document.querySelector('.method.active')?.dataset.name !== '小六壬') return;
    const host = document.querySelector('#interactiveResult');
    if (!host || host.querySelector('.liuren-figure')) return;
    const figure = document.createElement('img');
    figure.className = 'liuren-figure';
    figure.src = './public/teaser/mokawa-pose-liuren.png';
    figure.alt = '墨川以手指推算小六壬';
    host.prepend(figure);
  }, 180));
})();
