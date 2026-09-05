(() => {
  const numberField = document.querySelector('#numberFieldLabel');
  const numbers = document.querySelector('#numbers');
  const moment = document.querySelector('#momentTime');
  const hkNow = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Hong_Kong', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false }).formatToParts(new Date()).reduce((out, part) => (out[part.type] = part.value, out), {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  };
  const note = document.querySelector('#dataNote');
  document.querySelectorAll('.method').forEach(button => button.addEventListener('click', () => {
    const isLiuren = button.dataset.name === '小六壬';
    if (numberField) { numberField.hidden = isLiuren; numberField.style.display = isLiuren ? 'none' : ''; }
    if (isLiuren && numbers) numbers.value = '';
    if (isLiuren && moment) moment.value = hkNow();
    if (note && isLiuren) note.textContent = '掐指一算資料：問題、香港當下時間。';
    const title = document.querySelector('#selectedTitle');
    if (title) title.textContent = isLiuren ? '掐指一算' : button.dataset.name;
  }));
})();
