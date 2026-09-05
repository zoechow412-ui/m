(() => {
  document.querySelectorAll('.method').forEach(card => {
    card.addEventListener('pointermove', e => { const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5; card.style.transform=`perspective(700px) rotateX(${y*-5}deg) rotateY(${x*6}deg) translateY(-4px)`; });
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });
  const hero=document.querySelector('#hero'); if(hero) hero.addEventListener('pointerdown',()=>{hero.classList.remove('webtoon-hit');void hero.offsetWidth;hero.classList.add('webtoon-hit');});
  const enter=document.querySelector('#enterBtn'),transition=document.querySelector('#comicTransition'),temple=document.querySelector('#templeScreen');
  if(enter&&transition&&temple){enter.onclick=()=>{hero.classList.add('is-transitioning');transition.classList.remove('is-open');transition.setAttribute('aria-hidden','true');setTimeout(()=>{hero.classList.add('is-hidden');temple.classList.remove('is-open');temple.setAttribute('aria-hidden','true');window.openOnboarding?.();window.scrollTo(0,0);},450);};}
})();
