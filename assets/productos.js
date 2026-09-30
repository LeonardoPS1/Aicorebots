/* Página /productos/: índice lateral, visuales al entrar en pantalla y mapa interactivo */
(()=>{
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* visuales: se reproducen cuando entran en pantalla */
  const play=new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('play');o.unobserve(e.target)}}),{threshold:.35});
  $$('[data-play]').forEach(el=>play.observe(el));

  /* índice lateral: marca el producto visible */
  const links=$$('.pidx a'),arts=$$('.prod');
  if(links.length&&arts.length){
    const mark=id=>links.forEach(a=>a.setAttribute('aria-current',String(a.getAttribute('href')==='#'+id)));
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)mark(e.target.id)}),{rootMargin:'-35% 0px -60% 0px'});
    arts.forEach(a=>io.observe(a));
  }

  /* mapa: al pasar por un nodo se iluminan sus conexiones */
  const svg=document.getElementById('map');
  if(svg){
    if(reduce&&svg.pauseAnimations)svg.pauseAnimations();
    const edges=$$('.edge',svg);
    const hot=(id,on)=>edges.forEach(e=>e.classList.toggle('hot',on&&(e.dataset.a===id||e.dataset.b===id)));
    $$('.mnode',svg).forEach(n=>{
      const id=n.dataset.id;
      n.addEventListener('pointerenter',()=>hot(id,true));
      n.addEventListener('pointerleave',()=>hot(id,false));
      n.addEventListener('focus',()=>hot(id,true));
      n.addEventListener('blur',()=>hot(id,false));
    });
  }
})();
