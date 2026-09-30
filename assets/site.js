(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

/* ---------- progreso de scroll (respaldo si no hay scroll-timeline) ---------- */
if(!CSS.supports('animation-timeline','scroll()')){
  const p=$('#prog');
  const upd=()=>{const h=document.documentElement;p.style.transform=`scaleX(${h.scrollTop/(h.scrollHeight-h.clientHeight||1)})`};
  addEventListener('scroll',upd,{passive:true});upd();
}

/* ---------- titular: onda de pulso letra por letra ---------- */
$$('[data-wave]').forEach(h=>{
  const txt=h.textContent.trim();h.setAttribute('aria-label',txt);h.textContent='';
  let i=0;
  txt.split(' ').forEach((w,wi,arr)=>{
    const s=document.createElement('span');s.className='wd';s.setAttribute('aria-hidden','true');
    [...w].forEach(c=>{const l=document.createElement('span');l.className='ch';l.style.setProperty('--i',i++);l.textContent=c;s.appendChild(l)});
    h.appendChild(s);if(wi<arr.length-1){h.appendChild(document.createTextNode(' '));i++}
  });
});

/* ---------- botones magnéticos ---------- */
if(!reduce&&matchMedia('(pointer:fine)').matches){
  $$('.mag').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.22}px,${(e.clientY-r.top-r.height/2)*.32}px)`});
    b.addEventListener('pointerleave',()=>b.style.transform='');
  });
}

/* ---------- demo de chat ---------- */
(()=>{
  const box=$('#chat');if(!box)return;
  const script=[
    ['u','Hola, ¿tienen hora para una limpieza dental esta semana?','10:02'],
    ['b','¡Hola! Sí. Tengo jueves 16:30 o viernes 10:00 con la Dra. Rojas. ¿Cuál te acomoda?','10:02'],
    ['u','Viernes 10:00, por favor','10:03'],
    ['b','Listo, tu hora quedó agendada. Te aviso por aquí un día antes y puedes ver todo en tu portal.','10:03']
  ];
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const add=(k,t,time)=>{const d=document.createElement('div');d.className='m '+k;d.textContent=t;const tm=document.createElement('time');tm.textContent=time;d.appendChild(tm);box.appendChild(d);return d};
  if(reduce){script.forEach(([k,t,tm])=>add(k,t,tm));return}
  let alive=true;
  new IntersectionObserver(es=>alive=es[0].isIntersecting).observe(box);
  (async()=>{
    for(;;){
      for(const [k,t,tm] of script){
        while(!alive)await sleep(400);
        if(k==='b'){
          const d=document.createElement('div');d.className='m b dots';d.innerHTML='<i></i><i></i><i></i>';box.appendChild(d);
          await sleep(1300);d.remove();add(k,t,tm);await sleep(1500);
        }else{await sleep(1100);add(k,t,tm);await sleep(600)}
        while(box.children.length>5)box.firstChild.remove();
      }
      await sleep(4200);
      box.style.transition='opacity .5s';box.style.opacity=0;await sleep(550);
      box.innerHTML='';box.style.opacity=1;await sleep(500);
    }
  })();
})();

/* ---------- pipeline de Captación 360 ---------- */
(()=>{
  const svg=$('#pipe-svg');if(!svg)return;
  const NS='http://www.w3.org/2000/svg',nodesX=[150,450,750,1050],spikes=[300,600,900],Y=100;
  let d=`M0 ${Y}H${nodesX[0]}`;
  spikes.forEach(s=>d+=`H${s-46}l10 -8 10 8H${s-8}l8 -60 14 84 8 -24`);
  d+='H1200';
  const mk=(n,a)=>{const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);svg.appendChild(e);return e};
  mk('path',{class:'pl-base',d});
  const lit=mk('path',{class:'pl-lit',d,pathLength:1,'stroke-dasharray':'0 2'});
  const nodes=nodesX.map(x=>{const g=mk('g',{class:'node'});
    const h=document.createElementNS(NS,'circle');h.setAttribute('class','halo');h.setAttribute('cx',x);h.setAttribute('cy',Y);h.setAttribute('r',17);
    const c=document.createElementNS(NS,'circle');c.setAttribute('class','dot');c.setAttribute('cx',x);c.setAttribute('cy',Y);c.setAttribute('r',7);
    g.append(h,c);return g});
  const head=mk('circle',{class:'head',r:6,cx:0,cy:Y,opacity:0});
  const cols=$$('.col');
  let fr=[.13,.4,.66,.92],total=0;
  try{
    total=lit.getTotalLength();
    if(total){fr=nodesX.map(nx=>{let lo=0,hi=total;for(let k=0;k<22;k++){const m=(lo+hi)/2;lit.getPointAtLength(m).x<nx?lo=m:hi=m}return lo/total})}
  }catch(e){}
  const set=p=>{
    lit.setAttribute('stroke-dasharray',`${p} 2`);
    if(total){const pt=lit.getPointAtLength(p*total);head.setAttribute('cx',pt.x);head.setAttribute('cy',pt.y);head.setAttribute('opacity',p>0&&p<1?1:0)}
    fr.forEach((f,i)=>{const on=p>=f-.005;nodes[i].classList.toggle('on',on);cols[i].classList.toggle('on',on)});
  };
  if(reduce){set(1);return}
  const io=new IntersectionObserver(es=>{
    if(!es[0].isIntersecting)return;io.disconnect();
    const t0=performance.now(),dur=5200;
    const step=t=>{const x=clamp((t-t0)/dur);const e=x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;set(e);if(x<1)requestAnimationFrame(step)};
    requestAnimationFrame(step);
  },{threshold:.45});
  io.observe($('#pipe'));
})();

/* ---------- método: línea que se llena al hacer scroll ---------- */
(()=>{
  const ol=$('#steps');if(!ol)return;const lis=$$('li',ol);
  const upd=()=>{
    const r=ol.getBoundingClientRect(),vh=innerHeight;
    const p=clamp((vh*.62-r.top)/r.height);
    ol.style.setProperty('--p',p.toFixed(3));
    lis.forEach(li=>{const lr=li.getBoundingClientRect();li.classList.toggle('on',lr.top<vh*.62)});
  };
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();
})();

/* ---------- terminal ---------- */
(()=>{
  const pre=$('#term');if(!pre)return;
  const lines=JSON.parse(pre.dataset.lines);
  if(reduce){pre.innerHTML=lines.join('\n');return}
  const io=new IntersectionObserver(async es=>{
    if(!es[0].isIntersecting)return;io.disconnect();
    for(let i=0;i<lines.length;i++){
      pre.innerHTML=lines.slice(0,i+1).join('\n')+' <span class="cur"></span>';
      await new Promise(r=>setTimeout(r,i===0?600:420));
    }
  },{threshold:.5});
  io.observe(pre);
})();

/* ---------- línea final ---------- */
(()=>{
  const l=$('#cta-line');if(!l)return;
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){l.classList.add('in');o.disconnect()}},{threshold:.4}).observe(l);
})();

/* ---------- WebGL2: campo de pulsos ---------- */
(()=>{
  const cv=$('#gl'),hero=$('.hero');
  if(!cv||!hero)return;
  const fail=()=>hero.classList.add('nogl');
  const gl=cv.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'low-power'});
  if(!gl)return fail();
  const vs=`#version 300 es
  void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
  const fs=`#version 300 es
  precision highp float;
  uniform vec2 uRes;uniform float uT;uniform vec2 uM;
  out vec4 o;
  float g(float x,float c,float w){float d=(x-c)*w;return exp(-d*d);}
  float beat(float x){x=fract(x)-.5;return .10*g(x,-.20,18.)-.14*g(x,-.045,55.)+1.0*g(x,0.,60.)-.30*g(x,.04,50.)+.22*g(x,.24,14.);}
  void main(){
    vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 p=vec2(uv.x*asp,uv.y);
    vec3 teal=vec3(.20,.88,.77),blue=vec3(.23,.51,.96);
    vec3 abyss=vec3(.024,.082,.169),navy=vec3(.039,.137,.259);
    vec3 col=mix(abyss,navy,smoothstep(1.1,0.,length(uv-vec2(.72,.5))));
    vec2 mp=vec2(uM.x*asp,uM.y);
    const int N=24;
    for(int i=0;i<N;i++){
      float f=float(i)/float(N-1);
      float y0=mix(.10,.94,f);
      float depth=1.-f*.5;
      float x=p.x*.62-(f*1.7+uT*.10);
      float amp=.17*depth*(.6+.4*sin(f*6.+uT*.25));
      float head=mod(uT*.42+f*2.3,asp+2.)-1.;
      float env=.22+.78*exp(-pow((p.x-head)*1.15,2.));
      float y=y0+amp*beat(x)*env;
      y+=(y0-mp.y)*.22*exp(-pow(p.x-mp.x,2.)*7.)*exp(-pow(y0-mp.y,2.)*12.);
      float dist=abs(p.y-y);
      float line=smoothstep(1.5/uRes.y,0.,dist);
      float glow=exp(-dist*260.)*.06;
      vec3 c=mix(teal,blue,f*.9);
      col+=c*(line*(.35+.75*env)+glow*env)*depth*.9;
    }
    o=vec4(col,1.);
  }`;
  const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return gl.getShaderParameter(x,gl.COMPILE_STATUS)?x:null};
  const v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);if(!v||!f)return fail();
  const pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return fail();
  gl.useProgram(pr);
  const uRes=gl.getUniformLocation(pr,'uRes'),uT=gl.getUniformLocation(pr,'uT'),uM=gl.getUniformLocation(pr,'uM');
  const dpr=Math.min(devicePixelRatio||1,1.5);
  const size=()=>{const w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(uRes,cv.width,cv.height)};
  const m={x:.72,y:.5,tx:.72,ty:.5};
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();m.tx=(e.clientX-r.left)/r.width;m.ty=1-(e.clientY-r.top)/r.height});
  const draw=t=>{size();m.x+=(m.tx-m.x)*.06;m.y+=(m.ty-m.y)*.06;gl.uniform1f(uT,t);gl.uniform2f(uM,m.x,m.y);gl.drawArrays(gl.TRIANGLES,0,3)};
  if(reduce){draw(9);addEventListener('resize',()=>draw(9));return}
  let vis=true,raf=0;
  const loop=t=>{draw(t/1000);raf=requestAnimationFrame(loop)};
  const run=()=>{if(!raf&&vis&&!document.hidden)raf=requestAnimationFrame(loop)};
  const stop=()=>{cancelAnimationFrame(raf);raf=0};
  new IntersectionObserver(es=>{vis=es[0].isIntersecting;vis?run():stop()}).observe(hero);
  document.addEventListener('visibilitychange',()=>document.hidden?stop():run());
  run();
})();
})();
