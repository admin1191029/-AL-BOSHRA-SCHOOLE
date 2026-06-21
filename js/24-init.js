// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// ACTIVITY TIMER — مؤقت النشاط
// ══════════════════════════════════════════════
const ACT = {
  total: 300,      // seconds
  left: 300,
  running: false,
  interval: null,
  minimized: false
};

function actTimerOpen(){
  const el = document.getElementById('actTimer');
  if(!el) return;
  el.style.display = 'block';
  actTimerReset();
  actTimerInitDrag();
}

function actTimerInitDrag(){
  const el = document.getElementById('actTimer');
  if(!el || el._dragInit) return;
  el._dragInit = true;
  let startX, startY, startL, startB;

  function makeDraggable(handle){
    if(!handle) return;
    handle.style.cursor = 'move';

    handle.addEventListener('mousedown', e=>{
      if(e.target.tagName==='BUTTON'||e.target.tagName==='INPUT') return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startL = rect.left; startB = window.innerHeight - rect.bottom;
      el.style.transition = 'none';
      const onMove = e=>{
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const r = el.getBoundingClientRect();
        let newLeft = Math.max(0, Math.min(window.innerWidth - r.width, startL + dx));
        let newBottom = Math.max(0, Math.min(window.innerHeight - r.height, startB - dy));
        el.style.left = newLeft + 'px';
        el.style.bottom = newBottom + 'px';
        el.style.right = 'auto';
      };
      const onUp = ()=>{
        el.style.transition = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    handle.addEventListener('touchstart', e=>{
      if(e.target.tagName==='BUTTON'||e.target.tagName==='INPUT') return;
      const t = e.touches[0];
      const rect = el.getBoundingClientRect();
      startX = t.clientX; startY = t.clientY;
      startL = rect.left; startB = window.innerHeight - rect.bottom;
      el.style.transition = 'none';
      const onMove = e=>{
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        const r = el.getBoundingClientRect();
        let newLeft = Math.max(0, Math.min(window.innerWidth - r.width, startL + dx));
        let newBottom = Math.max(0, Math.min(window.innerHeight - r.height, startB - dy));
        el.style.left = newLeft + 'px';
        el.style.bottom = newBottom + 'px';
        el.style.right = 'auto';
      };
      const onEnd = ()=>{
        el.style.transition = '';
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
      };
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('touchend', onEnd);
    }, {passive:true});
  }

  // drag on full header
  makeDraggable(document.querySelector('#actTimerFull > div'));
  // drag on mini bar itself
  makeDraggable(document.getElementById('actTimerMini'));
}

function actTimerClose(){
  const el = document.getElementById('actTimer');
  if(el) el.style.display = 'none';
  actTimerStop();
}

function actTimerMinimize(){
  ACT.minimized = true;
  document.getElementById('actTimerFull').style.display = 'none';
  const mini = document.getElementById('actTimerMini');
  mini.style.display = 'flex';
  actTimerUpdateMini();
}

function actTimerExpand(){
  ACT.minimized = false;
  document.getElementById('actTimerFull').style.display = 'block';
  document.getElementById('actTimerMini').style.display = 'none';
}

function actTimerSetFromInput(){
  const v = parseInt(document.getElementById('actTimerInput').value) || 5;
  ACT.total = Math.max(1, Math.min(60, v)) * 60;
  ACT.left = ACT.total;
  actTimerUpdateUI();
}

function actTimerAdjust(delta){
  const inp = document.getElementById('actTimerInput');
  let v = (parseInt(inp.value) || 5) + delta;
  v = Math.max(1, Math.min(60, v));
  inp.value = v;
  ACT.total = v * 60;
  ACT.left = ACT.total;
  actTimerUpdateUI();
}

function actTimerQuick(mins){
  document.getElementById('actTimerInput').value = mins;
  ACT.total = mins * 60;
  ACT.left = ACT.total;
  actTimerStop();
  actTimerUpdateUI();
}

function actTimerToggle(){
  if(ACT.running) actTimerStop();
  else actTimerStart();
}

function actTimerStart(){
  if(ACT.left <= 0) actTimerReset();
  ACT.running = true;
  document.getElementById('actTimerPlayBtn').textContent = '⏸ إيقاف';
  document.getElementById('actTimerPlayBtn').style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
  document.getElementById('actTimerStatus').textContent = 'يعمل...';
  ACT.interval = setInterval(()=>{
    ACT.left--;
    actTimerUpdateUI();
    if(ACT.left <= 0){
      actTimerDone();
    }
  }, 1000);
}

function actTimerStop(){
  ACT.running = false;
  clearInterval(ACT.interval);
  const btn = document.getElementById('actTimerPlayBtn');
  if(btn){ btn.textContent = '▶ استمرار'; btn.style.background = 'linear-gradient(135deg,#10b981,#059669)'; }
  const st = document.getElementById('actTimerStatus');
  if(st) st.textContent = 'متوقف';
}

function actTimerReset(){
  actTimerStop();
  ACT.left = ACT.total;
  const btn = document.getElementById('actTimerPlayBtn');
  if(btn){ btn.textContent = '▶ ابدأ'; btn.style.background = 'linear-gradient(135deg,#10b981,#059669)'; }
  const st = document.getElementById('actTimerStatus');
  if(st) st.textContent = 'جاهز';
  actTimerUpdateUI();
}

function actTimerDone(){
  actTimerStop();
  ACT.left = 0;
  actTimerUpdateUI();
  const st = document.getElementById('actTimerStatus');
  if(st) st.textContent = '✅ انتهى!';
  const btn = document.getElementById('actTimerPlayBtn');
  if(btn){ btn.textContent = '↺ إعادة'; btn.style.background = 'linear-gradient(135deg,#7c3aed,#6d28d9)'; }
  // flash effect
  let flashes = 0;
  const el = document.getElementById('actTimer');
  const flash = setInterval(()=>{
    if(!el) { clearInterval(flash); return; }
    el.style.opacity = flashes % 2 === 0 ? '0.4' : '1';
    if(++flashes >= 6){ clearInterval(flash); el.style.opacity = '1'; }
  }, 300);
  try{ SFX.play('correct'); }catch(e){}
}

function actTimerUpdateUI(){
  const pct = ACT.total > 0 ? ACT.left / ACT.total : 0;
  const mins = Math.floor(ACT.left / 60);
  const secs = ACT.left % 60;
  const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

  // color logic
  let color = '#10b981'; // green
  if(pct <= 0.5 && pct > 0.25) color = '#f59e0b'; // yellow
  if(pct <= 0.25) color = '#ef4444'; // red

  // full display
  const disp = document.getElementById('actTimerDisplay');
  if(disp){ disp.textContent = timeStr; disp.style.color = pct <= 0.25 ? '#fca5a5' : 'white'; }

  // ring (circumference = 2π×48 ≈ 301.6)
  const ring = document.getElementById('actTimerRing');
  if(ring){
    ring.style.stroke = color;
    ring.style.strokeDashoffset = 301.6 * (1 - pct);
  }

  // mini
  actTimerUpdateMini();
}

function actTimerUpdateMini(){
  const pct = ACT.total > 0 ? ACT.left / ACT.total : 0;
  const mins = Math.floor(ACT.left / 60);
  const secs = ACT.left % 60;
  const timeStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  let color = '#10b981';
  if(pct <= 0.5 && pct > 0.25) color = '#f59e0b';
  if(pct <= 0.25) color = '#ef4444';

  const md = document.getElementById('actTimerMiniDisplay');
  if(md){ md.textContent = timeStr; md.style.color = pct <= 0.25 ? '#fca5a5' : 'white'; }

  // mini ring (circumference = 2π×14 ≈ 87.96)
  const mr = document.getElementById('actTimerMiniRing');
  if(mr){
    mr.style.stroke = color;
    mr.style.strokeDashoffset = 87.96 * (1 - pct);
  }
}
