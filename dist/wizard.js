(() => {
  const wizard = document.querySelector('#onboarding');
  if (!wizard) return;
  const temple = document.querySelector('#templeScreen');
  const oracle = document.querySelector('#oracle');
  const story = document.querySelector('#teaserStory');
  const steps = [...wizard.querySelectorAll('.wizard-step')];
  const next = document.querySelector('#wizardNext');
  const count = document.querySelector('#wizardCount');
  const progress = document.querySelector('#wizardProgress');
  let index = 0;

  const field = selector => document.querySelector(selector);
  const set = (selector, value) => {
    const node = field(selector);
    if (node) node.value = value;
  };
  const show = () => {
    steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === index));
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
    progress.style.width = `${(index + 1) / steps.length * 100}%`;
    next.style.display = [4, 5].includes(index) ? 'none' : 'block';
    const focusTarget = steps[index]?.querySelector('input,select');
    if (focusTarget && matchMedia('(pointer:fine)').matches) setTimeout(() => focusTarget.focus({ preventScroll: true }), 180);
  };
  const go = stepIndex => {
    index = Math.max(0, Math.min(steps.length - 1, stepIndex));
    show();
  };
  const open = () => {
    temple.classList.remove('is-open');
    temple.setAttribute('aria-hidden', 'true');
    oracle?.classList.remove('is-open');
    wizard.classList.add('is-open');
    wizard.setAttribute('aria-hidden', 'false');
    show();
    window.scrollTo(0, 0);
  };
  window.openOnboarding = open;

  field('#skipBtn').onclick = open;
  field('#templeMessage').onclick = open;
  field('#onboardingBack').onclick = () => {
    wizard.classList.remove('is-open');
    wizard.setAttribute('aria-hidden', 'true');
    temple.classList.add('is-open');
    temple.setAttribute('aria-hidden', 'false');
  };

  next.onclick = () => {
    if (index === 0 && !field('#wizardDate').value) return field('#wizardDate').focus();
    if (index === 1 && !field('#wizardTime').value) field('#wizardTime').value = '12:00';
    if (index < steps.length - 1) go(index + 1);
  };

  wizard.querySelectorAll('[data-calendar]').forEach(button => {
    button.onclick = () => {
      wizard.querySelectorAll('[data-calendar]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    };
  });
  wizard.querySelectorAll('[data-gender]').forEach(button => {
    button.onclick = () => {
      wizard.querySelectorAll('[data-gender]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      setTimeout(() => go(4), 180);
    };
  });
  field('#unknownTime').onclick = () => {
    field('#wizardTime').value = '12:00';
    go(2);
  };
  field('#nameConfirm').onclick = () => {
    if (!field('#wizardName').value.trim()) field('#wizardName').value = '你';
    go(5);
  };
  wizard.querySelectorAll('.orientation-choice,.work-choice').forEach(button => {
    button.onclick = () => {
      button.parentElement.querySelectorAll('button').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
    };
  });
  field('#wizardFinish').onclick = () => {
    set('#birthDate', field('#wizardDate').value);
    set('#birthTime', field('#wizardTime').value || '12:00');
    set('#birthPlace', field('#wizardPlace').value || '');
    set('#gender', wizard.querySelector('.gender-choice.active')?.dataset.gender || 'other');
    set('#question', '');
    wizard.classList.remove('is-open');
    wizard.setAttribute('aria-hidden', 'true');
    story.classList.add('is-open');
    story.setAttribute('aria-hidden', 'false');
    window.prepareTeaserStory?.();
    window.scrollTo(0, 0);
  };
  field('#storyContinue').onclick = () => {
    story.classList.remove('is-open');
    story.setAttribute('aria-hidden', 'true');
    oracle.classList.add('is-open');
    oracle.setAttribute('aria-hidden', 'false');
    window.scrollTo(0, 0);
  };
  field('#storyBack').onclick = () => {
    story.classList.remove('is-open');
    story.setAttribute('aria-hidden', 'true');
    wizard.classList.add('is-open');
    wizard.setAttribute('aria-hidden', 'false');
    show();
    window.scrollTo(0, 0);
  };
})();
