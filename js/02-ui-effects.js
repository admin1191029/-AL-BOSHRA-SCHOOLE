// ══════════════════════════════════════════════
// CURSOR
// ══════════════════════════════════════════════
const cur = document.getElementById('cursor');
const curR = document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
// أجهزة اللمس: شيل الـ cursor elements خالص من الـ DOM
if (window.matchMedia('(pointer: coarse)').matches) {
  cur?.remove();
  curR?.remove();
} else {
  document.addEventListener('mousemove', e=>{
    mx=e.clientX; my=e.clientY;
    const off = window._cursorOffset||[6,6];
    cur.style.left=(mx-off[0])+'px'; cur.style.top=(my-off[1])+'px';
  });
  function animRing(){
    rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
    curR.style.left=(rx-18)+'px'; curR.style.top=(ry-18)+'px';
    requestAnimationFrame(animRing);
  }
  animRing();
}

// ══════════════════════════════════════════════
// BG CANVAS
// ══════════════════════════════════════════════
(function(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let w,h,pts=[];
  function resize(){
    w=canvas.width=window.innerWidth;
    h=canvas.height=window.innerHeight;
  }
  resize(); window.addEventListener('resize',resize);
  for(let i=0;i<28;i++) pts.push({
    x:Math.random()*1200,y:Math.random()*800,
    vx:(Math.random()-.5)*0.4,vy:(Math.random()-.5)*0.4,
    r:Math.random()*3+1,
    c:`hsla(${210+Math.random()*60},70%,65%,${Math.random()*0.4+0.1})`
  });
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rafId=null, running=false;
  function draw(){
    ctx.clearRect(0,0,w,h);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w) p.vx*=-1;
      if(p.y<0||p.y>h) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.c; ctx.fill();
    });
    pts.forEach((p,i)=>{
      for(let j=i+1;j<pts.length;j++){
        const d=Math.hypot(p.x-pts[j].x,p.y-pts[j].y);
        if(d<140){
          ctx.beginPath();
          ctx.moveTo(p.x,p.y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(100,160,240,${0.08*(1-d/140)})`;
          ctx.lineWidth=1; ctx.stroke();
        }
      }
    });
    rafId=requestAnimationFrame(draw);
  }
  function start(){ if(running||reduceMotion) return; running=true; draw(); }
  function stop(){ running=false; if(rafId) cancelAnimationFrame(rafId); rafId=null; }
  document.addEventListener('visibilitychange',()=>{ document.hidden ? stop() : start(); });
  if(reduceMotion){ // draw a single static frame, then idle
    pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.c; ctx.fill(); });
  } else { start(); }
})();
