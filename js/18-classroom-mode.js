// ══════════════════════════════════════════════════════════════
// 🖥️ CLASSROOM MODE v2 — Projector Layout
// ══════════════════════════════════════════════════════════════

const CM = {
  open:false, currentView:'board',
  timerTotal:45*60, timerLeft:45*60, timerRunning:false, timerInterval:null,
  activityTotal:10*60,
  wheelSpinning:false, wheelAngle:0, wheelVelocity:0, wheelRaf:null,
  wheelHistory:[], wheelRemaining:[],
  noiseStream:null, noiseAnalyser:null, noiseRaf:null, noiseEnabled:false,
  lessonDuration:45, selectedSubId:null, starOfDay:null,
  quickTimers:[], // [{label,left,total,running,interval}]
  aiAuto:false,
  aiAutoTimer:null,
  aiAutoIdx:0,
};

// ── Entry page ──────────────────────────────────────────────
function renderClassroomMode(){
  const subOpts = S.subjects.map(s=>`<option value="${s.id}">${s.icon||'📚'} ${s.name}</option>`).join('');
  const skillOpts = S.subjects.flatMap(sub=>
    sub.sections.flatMap(sec=>
      sec.skills.map((sk,i)=>`<option value="${sub.id}:${sec.id}:${i}">${sub.name} — ${sec.name}: ${sk}</option>`)
    )
  ).join('');
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">🖥️ وضع الحصة</span></div>
  <div class="ph">
    <div><div class="ph-title"><i class="ti ti-device-desktop"></i> وضع الحصة — شاشة البروجكتور</div>
    <div class="ph-sub">شاشة كاملة مصممة للعرض أمام الطلاب — عجلة · مؤقتات · لوحة شرف</div></div>
  </div>
  <div class="card" style="max-width:540px;margin:0 auto;">
    <div class="card-header"><h3>⚙️ إعداد الحصة</h3></div>
    <div class="card-body">
      <div class="fg"><label>المادة</label><select id="cm_subSelect" onchange="cmUpdateSkillSelect()">${subOpts}</select></div>
      <div class="fg"><label>المهارة المستهدفة اليوم</label>
        <select id="cm_skillSelect"><option value="">— اختر مهارة محددة (اختياري) —</option>${skillOpts}</select>
      </div>
      <div class="fg"><label>مدة الحصة (دقيقة)</label>
        <input type="number" id="cm_duration" value="45" min="5" max="90" /></div>
      <div class="note-card" style="margin-top:4px;">
        <span class="note-icon">💡</span>
        <div>اضغط <strong>Space</strong> لتشغيل المؤقت · <strong>W</strong> للعجلة · <strong>H</strong> للوحة الشرف · <strong>Esc</strong> للإغلاق</div>
      </div>
      <button class="btn btn-ghost" style="width:100%;font-size:1rem;padding:14px;margin-top:8px" onclick="cmToggleAppFullscreen()" type="button">
        ⛶ ملء الشاشة للواجهة
      </button>
      <button class="btn btn-primary" style="width:100%;font-size:1rem;padding:14px;margin-top:6px" onclick="openClassroomMode()">
        🖥️ بدء وضع الحصة الكامل
      </button>
    </div>
  </div>`;
}

function cmUpdateSkillSelect(){
  const subId=document.getElementById('cm_subSelect')?.value;
  const sub=S.subjects.find(s=>s.id===subId);
  const sel=document.getElementById('cm_skillSelect');
  if(!sel||!sub) return;
  sel.innerHTML='<option value="">— اختر مهارة —</option>'+
    sub.sections.flatMap(sec=>sec.skills.map((sk,i)=>`<option value="${sub.id}:${sec.id}:${i}">${sec.name}: ${sk}</option>`)).join('');
}

function openClassroomMode(opts){
  opts = opts || {};
  const subId = opts.subId || document.getElementById('cm_subSelect')?.value || S.subjects[0]?.id;
  const skillVal = 'skillVal' in opts ? opts.skillVal : (document.getElementById('cm_skillSelect')?.value || '');
  const dur = opts.dur != null ? Number(opts.dur) : (parseInt(document.getElementById('cm_duration')?.value, 10) || 45);
  const sub=S.subjects.find(s=>s.id===subId);

  CM.selectedSubId=subId;
  CM.lessonDuration=dur;
  CM.timerTotal=dur*60;
  CM.timerLeft=dur*60;
  CM.timerRunning=false;
  CM.currentView='board';
  CM.wheelHistory=[];
  CM.wheelRemaining=[...S.students];
  CM.starOfDay=null;

  // Skill label
  let skillLabel='لم تُحدَّد';
  if(skillVal){
    const parts=skillVal.split(':');
    const sec=sub?.sections.find(s=>s.id===parts[1]);
    const sk=sec?.skills[+parts[2]];
    if(sk) skillLabel=sk;
  }
  document.getElementById('cmSkillLive').textContent='🎯 '+skillLabel;

  document.getElementById('classroomOverlay').classList.add('open');
  document.body.style.overflow='hidden';
  CM.open=true;

  cmSwitchView('board');
  cmUpdateTimer();
  cmUpdateBoardData();
  cmStartClock();
  logChange('edit','فتح وضع الحصة',sub?.name||'');
}


const REC = { mediaRecorder:null, chunks:[], stream:null, camStream:null, interval:null, seconds:0, active:false };

async function cmToggleRecording(){
  if(!REC.active){ await cmStartRecording(); }
  else { cmStopRecording(); }
}

async function cmStartRecording(){
  try {
    // Screen capture (records what's on screen)
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video:{ displaySurface:'browser', frameRate:30 },
      audio:true
    });

    // Try to get microphone audio
    let micStream = null;
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:false });
    } catch(e) {}

    // Try to get camera (optional)
    let camStream = null;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    } catch(e) {}

    // Merge audio tracks
    const tracks = [...screenStream.getVideoTracks()];
    if(micStream) tracks.push(...micStream.getAudioTracks());
    else if(screenStream.getAudioTracks().length) tracks.push(...screenStream.getAudioTracks());

    REC.stream = new MediaStream(tracks);
    REC.camStream = camStream;

    // Show camera preview if available
    if(camStream){
      let camPreview = document.getElementById('cmCamPreview');
      if(!camPreview){
        camPreview = document.createElement('video');
        camPreview.id = 'cmCamPreview';
        camPreview.autoplay = true; camPreview.muted = true; camPreview.playsInline = true;
        camPreview.style.cssText = 'position:fixed;bottom:80px;left:20px;width:180px;height:120px;border-radius:12px;border:2px solid rgba(239,68,68,0.6);object-fit:cover;z-index:99990;box-shadow:0 8px 24px rgba(0,0,0,0.5);';
        document.body.appendChild(camPreview);
      }
      camPreview.srcObject = camStream;
    }

    REC.chunks = [];
    REC.mediaRecorder = new MediaRecorder(REC.stream, { mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm' });
    REC.mediaRecorder.ondataavailable = e => { if(e.data.size>0) REC.chunks.push(e.data); };
    REC.mediaRecorder.onstop = cmSaveRecording;
    REC.mediaRecorder.start(1000);
    REC.active = true;
    REC.seconds = 0;
    cmInitNoise();

    // UI update
    const btn = document.getElementById('cmRecBtn');
    const dot = document.getElementById('cmRecDot');
    const lbl = document.getElementById('cmRecLabel');
    const tmr = document.getElementById('cmRecTimer');
    btn.classList.add('recording');
    dot.classList.add('active');
    lbl.textContent = 'إيقاف';
    tmr.style.display = 'inline';

    REC.interval = setInterval(()=>{
      REC.seconds++;
      const m = String(Math.floor(REC.seconds/60)).padStart(2,'0');
      const s = String(REC.seconds%60).padStart(2,'0');
      const el = document.getElementById('cmRecTimer');
      if(el) el.textContent = m+':'+s;
    }, 1000);

    // Stop if screen share ends
    screenStream.getVideoTracks()[0].onended = () => { if(REC.active) cmStopRecording(); };
    toast('🔴 بدأ التسجيل', 'success');

  } catch(err) {
    if(err.name !== 'NotAllowedError') toast('تعذّر بدء التسجيل: '+err.message, 'error');
  }
}

function cmStopRecording(){
  if(!REC.active) return;
  REC.active = false;
  clearInterval(REC.interval);
  if(REC.mediaRecorder && REC.mediaRecorder.state !== 'inactive') REC.mediaRecorder.stop();
  if(REC.stream) REC.stream.getTracks().forEach(t=>t.stop());
  if(REC.camStream) REC.camStream.getTracks().forEach(t=>t.stop());
  const cam = document.getElementById('cmCamPreview');
  if(cam) cam.remove();
  // Stop noise meter
  if(CM.noiseStream){ CM.noiseStream.getTracks().forEach(t=>t.stop()); CM.noiseStream=null; }
  CM.noiseEnabled=false;
  if(CM.noiseRaf){ cancelAnimationFrame(CM.noiseRaf); CM.noiseRaf=null; }
  const noiseFill=document.getElementById('cmNoiseFill');
  if(noiseFill) noiseFill.style.width='0%';

  // Reset UI
  const btn = document.getElementById('cmRecBtn');
  const dot = document.getElementById('cmRecDot');
  const lbl = document.getElementById('cmRecLabel');
  const tmr = document.getElementById('cmRecTimer');
  if(btn) btn.classList.remove('recording');
  if(dot) dot.classList.remove('active');
  if(lbl) lbl.textContent = 'تسجيل';
  if(tmr) tmr.style.display = 'none';
}

function cmSaveRecording(){
  const blob = new Blob(REC.chunks, { type:'video/webm' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const now  = new Date();
  const ts   = now.toISOString().slice(0,16).replace('T','_').replace(':','-');
  a.href = url;
  a.download = 'حصة_البشرى_' + ts + '.webm';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 5000);
  toast('✅ تم حفظ التسجيل', 'success');
}


// ═══════════════════════════════════════════
// DRAWING ON SCREEN — قلم، ممحاة، أشكال هندسية
// ═══════════════════════════════════════════
const DRAW = {
  active:false, painting:false, tool:'pen',
  ctx:null, shapeSnap:null, sx:0, sy:0
};

const WBDRAW = {
  active:false, painting:false, tool:'pen',
  ctx:null
};
const WBTEXT = {
  x:24, y:24, dragging:false, dx:0, dy:0, bound:false
};

function cmDrawIsShapeTool(t){
  return t==='line' || t==='rect' || t==='circle';
}

function cmDrawCoords(e, canvas){
  const r = canvas.getBoundingClientRect();
  const sx = (e.clientX - r.left) * (canvas.width / Math.max(r.width, 1));
  const sy = (e.clientY - r.top) * (canvas.height / Math.max(r.height, 1));
  return { x:sx, y:sy };
}

function cmDrawStrokeShape(ctx, x0, y0, x1, y1, tool, color, lw){
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([]);
  if(tool==='line'){
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  } else if(tool==='rect'){
    const x = Math.min(x0, x1), y = Math.min(y0, y1);
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0);
    ctx.strokeRect(x, y, w || 0.5, h || 0.5);
  } else if(tool==='circle'){
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const rx = Math.max(Math.abs(x1 - x0) / 2, 0.5);
    const ry = Math.max(Math.abs(y1 - y0) / 2, 0.5);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function cmDrawUpdateCursorClass(){
  const canvas = document.getElementById('cmDrawCanvas');
  if(!canvas) return;
  canvas.classList.remove('cm-cursor-pen','cm-cursor-eraser','cm-cursor-shape');
  if(!DRAW.active) return;
  if(DRAW.tool==='pen') canvas.classList.add('cm-cursor-pen');
  else if(DRAW.tool==='eraser') canvas.classList.add('cm-cursor-eraser');
  else if(cmDrawIsShapeTool(DRAW.tool)) canvas.classList.add('cm-cursor-shape');
}

function cmToggleDraw(){
  const canvas = document.getElementById('cmDrawCanvas');
  const toolbar = document.getElementById('cmDrawToolbar');
  const btn = document.getElementById('cmDrawToggleBtn');
  DRAW.active = !DRAW.active;
  if(DRAW.active){
    canvas.style.display = 'block';
    canvas.classList.add('cm-draw-open');
    toolbar.style.display = 'flex';
    btn.style.background = 'rgba(66,165,245,0.2)';
    btn.style.borderColor = 'rgba(66,165,245,0.5)';
    btn.style.color = 'var(--sky3)';
    cmDrawInit();
    cmDrawSetTool(DRAW.tool);
  } else {
    canvas.style.display = 'none';
    canvas.classList.remove('cm-draw-open','cm-cursor-pen','cm-cursor-eraser','cm-cursor-shape');
    toolbar.style.display = 'none';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    DRAW.shapeSnap = null;
    DRAW.painting = false;
  }
}

function cmDrawInit(){
  const canvas = document.getElementById('cmDrawCanvas');
  const main = document.getElementById('cmSlidesMain');
  canvas.width = main.offsetWidth;
  canvas.height = main.offsetHeight;
  DRAW.ctx = canvas.getContext('2d');
  DRAW.ctx.lineCap = 'round';
  DRAW.ctx.lineJoin = 'round';
  DRAW.shapeSnap = null;

  const eraserRadius = 18;

  canvas.onpointerdown = e => {
    if(!DRAW.active || !DRAW.ctx) return;
    e.preventDefault();
    const { x, y } = cmDrawCoords(e, canvas);

    if(cmDrawIsShapeTool(DRAW.tool)){
      DRAW.painting = true;
      DRAW.sx = x;
      DRAW.sy = y;
      DRAW.shapeSnap = DRAW.ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    if(DRAW.tool === 'eraser'){
      DRAW.painting = true;
      DRAW.ctx.clearRect(x - eraserRadius, y - eraserRadius, eraserRadius * 2, eraserRadius * 2);
      canvas.setPointerCapture(e.pointerId);
      return;
    }
    DRAW.painting = true;
    DRAW.ctx.beginPath();
    DRAW.ctx.moveTo(x, y);
    canvas.setPointerCapture(e.pointerId);
  };

  canvas.onpointermove = e => {
    if(!DRAW.active || !DRAW.ctx) return;
    const { x, y } = cmDrawCoords(e, canvas);

    if(cmDrawIsShapeTool(DRAW.tool) && DRAW.painting && DRAW.shapeSnap){
      DRAW.ctx.putImageData(DRAW.shapeSnap, 0, 0);
      const color = document.getElementById('cmDrawColor').value;
      const lw = parseInt(document.getElementById('cmDrawSize').value, 10) || 4;
      cmDrawStrokeShape(DRAW.ctx, DRAW.sx, DRAW.sy, x, y, DRAW.tool, color, lw);
      return;
    }
    if(!DRAW.painting) return;

    if(DRAW.tool === 'eraser'){
      DRAW.ctx.clearRect(x - eraserRadius, y - eraserRadius, eraserRadius * 2, eraserRadius * 2);
      return;
    }
    if(DRAW.tool === 'pen'){
      const ctx = DRAW.ctx;
      ctx.strokeStyle = document.getElementById('cmDrawColor').value;
      ctx.lineWidth = parseInt(document.getElementById('cmDrawSize').value, 10) || 4;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const endPointer = e => {
    if(!DRAW.active || !DRAW.ctx) return;
    if(cmDrawIsShapeTool(DRAW.tool) && DRAW.painting && DRAW.shapeSnap){
      const { x, y } = cmDrawCoords(e, canvas);
      DRAW.ctx.putImageData(DRAW.shapeSnap, 0, 0);
      const color = document.getElementById('cmDrawColor').value;
      const lw = parseInt(document.getElementById('cmDrawSize').value, 10) || 4;
      cmDrawStrokeShape(DRAW.ctx, DRAW.sx, DRAW.sy, x, y, DRAW.tool, color, lw);
      DRAW.shapeSnap = null;
    }
    DRAW.painting = false;
    try { if(e.pointerId != null) canvas.releasePointerCapture(e.pointerId); } catch(_){}
  };

  canvas.onpointerup = endPointer;
  canvas.onpointercancel = endPointer;
  canvas.onpointerleave = e => {
    if(cmDrawIsShapeTool(DRAW.tool) && DRAW.painting) endPointer(e);
    else if(!cmDrawIsShapeTool(DRAW.tool)) DRAW.painting = false;
  };
}

function cmDrawSetTool(t){
  DRAW.tool = t;
  const idle = 'rgba(255,255,255,0.1)';
  const setBg = (id, active, activeBg) => {
    const el = document.getElementById(id);
    if(el) el.style.background = active ? activeBg : idle;
  };
  setBg('cmDrawPen', t==='pen', 'rgba(66,165,245,0.45)');
  setBg('cmDrawEraser', t==='eraser', 'rgba(239,68,68,0.35)');
  setBg('cmDrawLine', t==='line', 'rgba(66,165,245,0.45)');
  setBg('cmDrawRect', t==='rect', 'rgba(66,165,245,0.45)');
  setBg('cmDrawCircle', t==='circle', 'rgba(66,165,245,0.45)');
  cmDrawUpdateCursorClass();
}

function cmDrawClear(){
  if(DRAW.ctx){
    const c = document.getElementById('cmDrawCanvas');
    DRAW.ctx.clearRect(0, 0, c.width, c.height);
    DRAW.shapeSnap = null;
  }
}

function cmWbInit(){
  const main = document.getElementById('cmWbMain');
  const canvas = document.getElementById('cmWbDrawCanvas');
  if(!main || !canvas) return;
  const textOut = null; // replaced by multi-box system
  const r = main.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(r.width));
  canvas.height = Math.max(1, Math.floor(r.height));
  WBDRAW.ctx = canvas.getContext('2d');

}

// ═══ نظام مربعات النص المتعددة ═══
let _wbBoxes = [];
let _wbBoxIdCounter = 0;

function cmWbAddBox(){
  const editor = document.getElementById('cmWbEditor');
  const layer = document.getElementById('cmWbBoxesLayer');
  const main = document.getElementById('cmWbMain');
  if(!layer || !main) return;
  const html = editor ? (editor.innerHTML || '') : '';
  const text = editor ? (editor.innerText || '').trim() : '';
  if(!text){ alert('اكتب نصاً في المحرر أولاً'); return; }

  const id = ++_wbBoxIdCounter;
  const box = document.createElement('div');
  box.id = 'cmWbBox_' + id;
  box.style.cssText = [
    'position:absolute',
    'top:' + (20 + (_wbBoxes.length % 5) * 40) + 'px',
    'right:' + (20 + (_wbBoxes.length % 3) * 30) + 'px',
    'max-width:calc(100% - 48px)',
    'min-width:140px',
    'padding:12px 14px',
    'white-space:pre-wrap',
    'word-wrap:break-word',
    'line-height:1.8',
    'color:#1f2937',
    'font-size:1.35rem',
    'font-weight:700',
    'font-family:Tajawal,sans-serif',
    'background:rgba(255,255,255,0.88)',
    'border:1.5px dashed rgba(31,41,55,0.25)',
    'border-radius:12px',
    'cursor:grab',
    'user-select:none',
    'touch-action:none',
    'pointer-events:all',
    'z-index:3',
    'box-shadow:0 2px 8px rgba(0,0,0,0.08)'
  ].join(';');
  box.innerHTML = html;

  // زر حذف
  const del = document.createElement('button');
  del.textContent = '✕';
  del.style.cssText = 'position:absolute;top:-10px;left:-10px;width:22px;height:22px;border-radius:50%;border:none;background:#ef4444;color:white;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;pointer-events:all;';
  del.onclick = (e) => { e.stopPropagation(); box.remove(); _wbBoxes = _wbBoxes.filter(b=>b.id!==id); };
  box.appendChild(del);

  // سحب وإفلات
  let dx=0, dy=0, dragging=false;
  box.onpointerdown = e => {
    if(e.target === del) return;
    e.preventDefault(); e.stopPropagation();
    dragging = true;
    const r = box.getBoundingClientRect();
    dx = e.clientX - r.left;
    dy = e.clientY - r.top;
    box.style.cursor = 'grabbing';
    box.style.opacity = '0.92';
    box.setPointerCapture(e.pointerId);
  };
  box.onpointermove = e => {
    if(!dragging) return;
    e.preventDefault();
    const mr = main.getBoundingClientRect();
    let nx = e.clientX - mr.left - dx;
    let ny = e.clientY - mr.top - dy;
    nx = Math.max(0, Math.min(nx, main.clientWidth - box.offsetWidth));
    ny = Math.max(0, Math.min(ny, main.clientHeight - box.offsetHeight));
    box.style.right = 'auto';
    box.style.left = nx + 'px';
    box.style.top = ny + 'px';
  };
  const endDrag = e => { dragging=false; box.style.cursor='grab'; box.style.opacity='1'; try{box.releasePointerCapture(e.pointerId);}catch(_){} };
  box.onpointerup = endDrag;
  box.onpointercancel = endDrag;

  layer.appendChild(box);
  _wbBoxes.push({id, el: box});

  // مسح المحرر
  if(editor) editor.innerHTML = '';
}

function cmWbClearAllBoxes(){
  const layer = document.getElementById('cmWbBoxesLayer');
  if(layer) layer.innerHTML = '';
  _wbBoxes = [];
}

function cmWbEditorCmd(cmd){
  const editor = document.getElementById('cmWbEditor');
  if(!editor) return;
  editor.focus();
  try{ document.execCommand(cmd, false, null); }catch(_){}
}

// دوال قديمة للتوافق
function cmWbApplyText(){ cmWbAddBox(); }
function cmWbClearText(){ cmWbClearAllBoxes(); }
function cmWbClampTextPos(){}
function cmWbSetTextPos(){}
function cmWbShowDoneBtn(){
  if(window.matchMedia('(pointer: coarse)').matches){
    const btn = document.getElementById('cmWbDoneBtn');
    if(btn) btn.style.display='block';
  }
}
function cmWbHideDoneBtn(){
  const btn = document.getElementById('cmWbDoneBtn');
  if(btn) btn.style.display='none';
}
function cmWbDismissKeyboard(){
  const editor = document.getElementById('cmWbEditor');
  if(editor){ editor.blur(); }
}

function cmWbDrawSetTool(tool){
  WBDRAW.tool = (tool==='eraser' ? 'eraser' : 'pen');
  const c = document.getElementById('cmWbDrawCanvas');
  if(c){
    c.classList.remove('cm-cursor-pen','cm-cursor-eraser');
    c.classList.add(WBDRAW.tool === 'eraser' ? 'cm-cursor-eraser' : 'cm-cursor-pen');
  }
}

function cmWbDrawClear(){
  const c = document.getElementById('cmWbDrawCanvas');
  if(WBDRAW.ctx && c) WBDRAW.ctx.clearRect(0, 0, c.width, c.height);
}

function cmWbToggleDraw(){
  const canvas = document.getElementById('cmWbDrawCanvas');
  const btn = document.getElementById('cmWbDrawToggleBtn');
  if(!canvas || !btn) return;
  WBDRAW.active = !WBDRAW.active;
  if(WBDRAW.active){
    cmWbInit();
    canvas.style.display = 'block';
    canvas.style.zIndex = '10';
    canvas.style.pointerEvents = 'all';
    canvas.classList.add('cm-draw-open');
    btn.textContent = '🛑 إيقاف القلم';
    cmWbDrawSetTool(WBDRAW.tool);
    btn.style.background = 'rgba(66,165,245,0.2)';
    btn.style.borderColor = 'rgba(66,165,245,0.5)';
    btn.style.color = 'var(--sky3)';

    const eraserRadius = 18;
    canvas.onpointerdown = e => {
      if(!WBDRAW.active || !WBDRAW.ctx) return;
      e.preventDefault();
      const { x, y } = cmDrawCoords(e, canvas);
      WBDRAW.painting = true;
      if(WBDRAW.tool === 'eraser'){
        WBDRAW.ctx.clearRect(x - eraserRadius, y - eraserRadius, eraserRadius * 2, eraserRadius * 2);
      }else{
        WBDRAW.ctx.beginPath();
        WBDRAW.ctx.moveTo(x, y);
      }
      canvas.setPointerCapture(e.pointerId);
    };
    canvas.onpointermove = e => {
      if(!WBDRAW.active || !WBDRAW.ctx || !WBDRAW.painting) return;
      const { x, y } = cmDrawCoords(e, canvas);
      if(WBDRAW.tool === 'eraser'){
        WBDRAW.ctx.clearRect(x - eraserRadius, y - eraserRadius, eraserRadius * 2, eraserRadius * 2);
        return;
      }
      const ctx = WBDRAW.ctx;
      ctx.strokeStyle = document.getElementById('cmWbDrawColor')?.value || '#42a5f5';
      ctx.lineWidth = parseInt(document.getElementById('cmWbDrawSize')?.value || '4', 10) || 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    const endPointer = e => {
      WBDRAW.painting = false;
      try { if(e.pointerId != null) canvas.releasePointerCapture(e.pointerId); } catch(_){}
    };
    canvas.onpointerup = endPointer;
    canvas.onpointercancel = endPointer;
    canvas.onpointerleave = endPointer;
  } else {
    canvas.style.display = 'none';
    canvas.style.zIndex = '4';
    canvas.style.pointerEvents = 'none';
    canvas.classList.remove('cm-draw-open','cm-cursor-pen','cm-cursor-eraser');
    btn.textContent = '<i class="ti ti-edit"></i> تشغيل القلم';
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    WBDRAW.painting = false;
  }
}

// ═══════════════════════════════════════════
// CLEAR FUNCTIONS
// ═══════════════════════════════════════════
function cmClearVideo(){
  const v = document.getElementById('cmVideoPlayer');
  const n = document.getElementById('cmVideoName');
  const c = document.getElementById('cmVideoControls');
  const b = document.getElementById('cmClearVideoBtn');
  const e = document.getElementById('cmSlidesEmpty');
  if(v){ v.pause(); v.src=''; v.style.display='none'; }
  if(n) n.textContent='';
  if(c) c.style.display='none';
  if(b) b.style.display='none';
  if(e) e.style.display='flex';
  document.getElementById('cmSlidesFrame').style.display='none';
  document.getElementById('cmSlidesImgViewer').style.display='none';
  document.getElementById('cmSlidesPdfFrame').style.display='none';
  toast('تم مسح الفيديو','success');
}

function cmClearImages(){
  cmReleaseSlideObjectUrls();
  SLIDES.images = []; SLIDES.currentIdx = 0;
  const b = document.getElementById('cmClearImgBtn');
  const n = document.getElementById('cmImgCount');
  const nav = document.getElementById('cmSlidesNav');
  const e = document.getElementById('cmSlidesEmpty');
  const imgV = document.getElementById('cmSlidesImgViewer');
  if(b) b.style.display='none';
  if(n) n.textContent='';
  if(nav) nav.style.display='none';
  if(imgV) imgV.style.display='none';
  if(e) e.style.display='flex';
  document.getElementById('cmSlidesImages').value='';
  toast('تم مسح الصور','success');
}

function cmClearPdf(){
  const f = document.getElementById('cmSlidesPdfFrame');
  const v = document.getElementById('cmSlidesPdfViewer');
  const b = document.getElementById('cmClearPdfBtn');
  const e = document.getElementById('cmSlidesEmpty');
  if(f){ f.src=''; f.style.display='none'; }
  if(v){ v.style.display='none'; }
  if(b) b.style.display='none';
  if(e) e.style.display='flex';
  document.getElementById('cmSlidesPdf').value='';
  toast('تم مسح PDF','success');
}

function cmClearPptx(){
  cmReleaseSlideObjectUrls();
  SLIDES.images = []; SLIDES.currentIdx = 0;
  const b = document.getElementById('cmClearPptxBtn');
  const s = document.getElementById('cmPptxStatus');
  const nav = document.getElementById('cmSlidesNav');
  const e = document.getElementById('cmSlidesEmpty');
  const imgV = document.getElementById('cmSlidesImgViewer');
  if(b) b.style.display='none';
  if(s) s.textContent='';
  if(nav) nav.style.display='none';
  if(imgV) imgV.style.display='none';
  if(e) e.style.display='flex';
  document.getElementById('cmSlidesPptx').value='';
  toast('تم مسح PPTX','success');
}

// ═══════════════════════════════════════════
// PPTX — استخراج الصور من ppt/media (المتصفح لا يعرض pptx في iframe)
// ═══════════════════════════════════════════
async function cmLoadPptx(input){
  const file = input.files[0];
  if(!file) return;
  const status = document.getElementById('cmPptxStatus');
  if(!/\.pptx$/i.test(file.name)){
    status.textContent = 'PPTX only (.ppt is not supported)';
    toast('Save as PPTX or export to PDF','error');
    input.value='';
    return;
  }
  status.textContent = 'Analyzing file...';
  if(typeof JSZip === 'undefined'){
    status.textContent = 'File library not ready. Reload page.';
    toast('Reload page then try again','error');
    return;
  }
  try{
    cmReleaseSlideObjectUrls();
    const buf = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buf);
    const mediaExts = /\.(png|jpg|jpeg|gif|bmp|webp|tif|tiff)$/i;
    const entries = [];
    zip.forEach((relPath, zf)=>{
      if((relPath.startsWith('ppt/media/') || relPath.startsWith('ppt/slides/media/')) && !zf.dir && mediaExts.test(relPath)) entries.push(relPath);
    });
    entries.sort((a,b)=>a.localeCompare(b, undefined, {numeric:true, sensitivity:'base'}));
    if(!entries.length){
      status.textContent = 'No displayable images found inside this PPTX';
      toast('Export presentation to PDF/images, or use Google Slides','error');
      input.value='';
      return;
    }
    SLIDES.images = [];
    SLIDES.currentIdx = 0;
    for(const rel of entries){
      const node = zip.file(rel);
      if(!node) continue;
      const blob = await node.async('blob');
      const url = URL.createObjectURL(blob);
      SLIDES.images.push(url);
      SLIDES.objectUrls.push(url);
    }
    SLIDES.mode = 'images';
    const frame = document.getElementById('cmSlidesFrame');
    const empty = document.getElementById('cmSlidesEmpty');
    const imgV = document.getElementById('cmSlidesImgViewer');
    const pdfF = document.getElementById('cmSlidesPdfFrame');
    const vidP = document.getElementById('cmVideoPlayer');
    if(empty) empty.style.display='none';
    if(frame){ frame.style.display='none'; try{frame.src='';}catch(_){} }
    if(pdfF){ pdfF.style.display='none'; try{pdfF.src='';}catch(_){} }
    if(vidP) vidP.style.display='none';
    if(imgV){ imgV.style.display='flex'; imgV.style.alignItems='center'; imgV.style.justifyContent='center'; }
    cmShowImgSlide(0);
    cmUpdateSlidesNav();
    status.textContent = 'Loaded ' + SLIDES.images.length + ' slide images';
    const cpb = document.getElementById('cmClearPptxBtn');
    if(cpb) cpb.style.display='block';
    const cib = document.getElementById('cmClearImgBtn');
    if(cib) cib.style.display='block';
    const ic = document.getElementById('cmImgCount');
    if(ic) ic.textContent = SLIDES.images.length + ' slides (from PPTX)';
    toast('Presentation loaded','success');
  }catch(err){
    console.warn(err);
    status.textContent = 'Could not read this file (protected or unsupported format)';
    toast('PPTX failed. Try PDF.','error');
    input.value='';
  }
}
function cmAiGeminiExtract(data){
  const c = data?.candidates?.[0];
  if(!c){
    const br = data?.promptFeedback?.blockReason;
    if(br) return { err:'الطلب مرفوض: '+br };
    return { err:data?.error?.message || 'لا توجد إجابة من الخادم' };
  }
  if(c.finishReason==='SAFETY') return { err:'الإجابة محظورة (فلتر الأمان)' };
  const parts = c.content?.parts;
  const text = Array.isArray(parts) ? parts.map(p=>(p&&p.text)||'').join('').trim() : '';
  if(text) return { text };
  return { err:'استجابة فارغة — جرّب صياغة أخرى' };
}

async function cmAiAskGemini(key, userPrompt){
  const system = 'أنت مساعد معلم في حصة مدرسية بالعربية. أجب باختصار ووضوح مناسب للشرح أمام الطلاب.';
  const combined = system + '\n\n' + userPrompt;
  const bodyBase = {
    contents:[{ parts:[{ text: combined }] }],
    generationConfig:{ maxOutputTokens:2048, temperature:0.7 },
    safetySettings:[
      { category:'HARM_CATEGORY_HARASSMENT', threshold:'BLOCK_ONLY_HIGH' },
      { category:'HARM_CATEGORY_HATE_SPEECH', threshold:'BLOCK_ONLY_HIGH' },
      { category:'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold:'BLOCK_ONLY_HIGH' },
      { category:'HARM_CATEGORY_DANGEROUS_CONTENT', threshold:'BLOCK_ONLY_HIGH' },
    ],
  };
  const models = ['gemini-2.0-flash','gemini-2.0-flash-001','gemini-1.5-flash','gemini-1.5-flash-8b'];
  // ملاحظة: موديل gemini-1.5-flash-8b أحياناً غير مدعوم مع API v1.
  // لتقليل أخطاء عدم الدعم: نستبعد موديل 8b فقط
  // لكن نحتفظ بـ v1 و v1beta لأن الدعم يختلف حسب الحساب/النسخة.
  const filteredModels = models.filter(m => m !== 'gemini-1.5-flash-8b');
  const versions = ['v1beta', 'v1'];
  let lastErr = 'تعذّر الاتصال';
  for(const ver of versions){
    for(const model of filteredModels){
      const url = 'https://generativelanguage.googleapis.com/'+ver+'/models/'+encodeURIComponent(model)+':generateContent?key='+encodeURIComponent(key);
      try{
        const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(bodyBase) });
        const data = await res.json().catch(()=>({}));
        if(!res.ok){
          lastErr = data?.error?.message || ('HTTP '+res.status);
          continue;
        }
        const ex = cmAiGeminiExtract(data);
        if(ex.text) return { text: ex.text };
        lastErr = ex.err || lastErr;
      }catch(e){
        lastErr = e.message || String(e);
      }
    }
  }
  if(/Failed to fetch|NetworkError|Load failed/i.test(lastErr))
    lastErr += ' — إن فتحت الملف بالنقر المزدوج من القرص، جرّب «OpenRouter» من الإعدادات أو شغّل الصفحة عبر خادم (http).';
  return { err: lastErr };
}

async function cmAiAskOpenRouter(key, userPrompt){
  const origin = (typeof location !== 'undefined' && location.origin && location.origin !== 'null') ? location.origin : 'http://localhost';
  const messages = [
    { role: 'system', content: 'أنت مساعد معلم في حصة مدرسية بالعربية. أجب باختصار ووضوح مناسب للشرح أمام الطلاب.' },
    { role: 'user', content: userPrompt },
  ];
  const models = [
    'google/gemini-2.0-flash-001:free',
    'google/gemini-flash-1.5:free',
    'meta-llama/llama-3.2-3b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
  ];
  let lastErr = '';
  for(const model of models){
    try{
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method:'POST',
        headers:{
          'Authorization':'Bearer '+key,
          'Content-Type':'application/json',
          'HTTP-Referer': origin,
          'X-Title': 'Albushra',
        },
        body: JSON.stringify({ model, messages }),
      });
      const data = await res.json().catch(()=>({}));
      if(!res.ok){
        lastErr = data?.error?.message || data?.message || ('HTTP '+res.status);
        continue;
      }
      const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
      if(text && String(text).trim()) return { text: String(text).trim() };
      lastErr = 'لا نص في الرد';
    }catch(e){
      lastErr = e.message || String(e);
    }
  }
  return { err: lastErr || 'تعذّر الاتصال بـ OpenRouter' };
}

// Fallback "AI" محلي (بدون استدعاء أي API):
// يطلع للمستخدم رسالة بسيطة عن الغياب/عدم التقييم من بيانات الفصل عنده.
function cmLocalMissingAttendanceAndEvaluation(){
  const total = S.students?.length || 0;
  if(!total){
    return 'لا توجد بيانات بعد. أضف طلاباً وسجّل حضور وتقييم لكي تظهر الملخصات.';
  }
  const td = (typeof today === 'function') ? today() : new Date().toISOString().split('T')[0];
  const att = S.attendance?.[td] || {};
  const evMap = S.evals || {};

  const absent = [];
  const notMarked = [];
  const present = [];
  for(const s of S.students){
    const v = att?.[s.id];
    if(v === 'a') absent.push(s);
    else if(v === 'p') present.push(s);
    else notMarked.push(s);
  }

  const ungraded = S.students.filter(s => {
    const ev = evMap?.[s.id] || {};
    return Object.keys(ev).length === 0;
  });

  const attendancePct = Math.round((present.length / total) * 100);
  const gradedPct = Math.round(((total - ungraded.length) / total) * 100);

  const takeNames = (arr, n=8) => {
    return arr.slice(0, n).map(x => (x.name || '').split(' ')[0] || x.name || '—').join('، ') + (arr.length > n ? '...' : '');
  };

  const topStudent = (() => {
    try {
      const sorted = [...S.students].map(s => ({ s, m: studentMastery(s.id)?.total || 0 }))
        .sort((a,b) => b.m - a.m);
      const best = sorted[0];
      if(!best) return null;
      return { name: (best.s.name || '').split(' ')[0] || best.s.name || '—', pct: best.m };
    } catch(_e) { return null; }
  })();

  const hardestSkill = (() => {
    try{
      const firstSub = S.subjects?.[0];
      const firstSec = firstSub?.sections?.[0];
      if(!firstSub || !firstSec || !Array.isArray(firstSec.skills) || !firstSec.skills.length) return null;
      const skillRates = firstSec.skills.map((sk,i) => {
        const cnt = S.students.filter(s =>
          (((S.evals?.[s.id] || {})[firstSub.id] || {})[firstSec.id] || {})[i] === 'm'
        ).length;
        const pct = Math.round((cnt / total) * 100);
        return { sk, pct };
      });
      if(!skillRates.length) return null;
      return skillRates.sort((a,b)=>a.pct-b.pct)[0];
    }catch(_e){ return null; }
  })();

  const goalsSummary = (() => {
    if(!Array.isArray(S.goals) || !S.goals.length) return null;
    const doneGoals = S.goals.filter(g => g.done).length;
    const pct = Math.round((doneGoals / S.goals.length) * 100);
    return { doneGoals, totalGoals: S.goals.length, pct };
  })();

  const lines = [];
  lines.push('🔎 ملخص سريع (محلي) — من بيانات الحصة:');
  if(absent.length){
    lines.push(`❌ لم يحضر اليوم (${absent.length}): ${takeNames(absent)}`);
  } else {
    lines.push('✅ لا يوجد غياب مسجّل اليوم.');
  }
  if(notMarked.length){
    lines.push(`🟠 لم يُسجَّل حضور لِـ (${notMarked.length}): ${takeNames(notMarked)}`);
  }
  if(ungraded.length){
    lines.push(`⬜ لم يُقيَّم بعد (${ungraded.length}): ${takeNames(ungraded)}`);
  } else {
    lines.push('✅ جميع الطلاب لديهم تقييم (على الأقل بيانات مهارات).');
  }

  lines.push(`📊 نسبة حضور اليوم: ${attendancePct}%`);
  lines.push(`📈 نسبة التقييم المكتمل: ${gradedPct}%`);
  if(topStudent){
    lines.push(`🏆 أعلى طالب: ${topStudent.name} (${topStudent.pct}%)`);
  }
  if(hardestSkill){
    lines.push(`🎯 أصعب مهارة (حسب أول درس): "${hardestSkill.sk}" (${hardestSkill.pct}%)`);
  }
  if(goalsSummary){
    lines.push(`🎯 الأهداف: ${goalsSummary.pct}% إنجاز (${goalsSummary.doneGoals}/${goalsSummary.totalGoals})`);
  }
  return lines.join('\n');
}

async function cmAiAsk(){
  const key = bsGetAiKey();
  const provider = bsGetAiProvider();
  const q = (document.getElementById('cmAiInput')?.value||'').trim();
  const out = document.getElementById('cmAiOut');
  const btn = document.getElementById('cmAiSendBtn');
  if(!key){
    toast('أضف مفتاح API من ⚙️ الإعدادات (Gemini أو OpenRouter)','error');
    return;
  }
  if(!q){
    toast('اكتب سؤالاً أو طلباً','error');
    return;
  }
  if(typeof location !== 'undefined' && location.protocol === 'file:' && provider === 'gemini'){
    if(out){
      out.style.display='block';
      out.textContent = '⚠️ المتصفح غالباً يمنع الاتصال بـ Google عند فتح الملف مباشرة من القرص.\n\nاختر من الإعدادات: «OpenRouter» واحصل على مفتاح من openrouter.ai/keys\nأو شغّل الصفحة عبر خادم محلي (Live Server / أي http).';
    }
    toast('جرّب OpenRouter أو افتح الموقع عبر http','error');
    return;
  }
  if(out){
    out.style.display='block';
    out.textContent='⏳ جارٍ التفكير...';
  }
  if(btn){ btn.disabled=true; btn.style.opacity='0.6'; }
  try{
    let result;
    if(provider === 'openrouter') result = await cmAiAskOpenRouter(key, q);
    else result = await cmAiAskGemini(key, q);
    if(result.text){
      if(out) out.textContent = result.text;
      toast('تمت الإجابة','success');
    } else {
      const msg = result.err || 'خطأ غير معروف';
      // لو Gemini فشل بسبب موديل/عدم دعم، نعرض رد محلي بسيط بدل الخطأ.
      if(/models\\//i.test(msg) || /not found/i.test(msg) || /generateContent/i.test(msg) || /not supported/i.test(msg)){
        if(out) out.textContent = cmLocalMissingAttendanceAndEvaluation();
        toast('تمت الإجابة مح��ياً (بدون AI خارجي)','success');
      } else {
        if(out) out.textContent = '❌ '+msg;
        toast('تعذّر إكمال الطلب','error');
      }
    }
  }catch(err){
    const m = err.message || String(err);
    if(out) out.textContent = cmLocalMissingAttendanceAndEvaluation();
    toast('تمت الإجابة محلياً (تعذّر الاتصال بالمساعد)','error');
  }finally{
    if(btn){ btn.disabled=false; btn.style.opacity=''; }
  }
}

// ═══════════════════════════════════════════
// LESSON PREP JS
// ═══════════════════════════════════════════
function lpToggleStage(n){
  const body = document.getElementById('lpBody'+n);
  const arrow = document.getElementById('lpArrow'+n);
  if(!body) return;
  body.classList.toggle('open');
  arrow.textContent = body.classList.contains('open') ? '▴' : '▾';
}

function lpSave(){
  const data = {
    date: document.getElementById('lpDate')?.value,
    timeFrom: document.getElementById('lpTimeFrom')?.value,
    timeTo: document.getElementById('lpTimeTo')?.value,
    subject: document.getElementById('lpSubject')?.value,
    topic: document.getElementById('lpTopic')?.value,
    skill: document.getElementById('lpSkill')?.value,
    objectives: document.getElementById('lpObjectives')?.value,
  };
  try { localStorage.setItem('bs_lesson_prep', JSON.stringify(data)); } catch(e){}
  toast('✅ تم حفظ بيانات الحصة','success');
  // Update skill display in header
  const sl = document.getElementById('cmSkillLive');
  if(sl && data.topic) sl.textContent = (data.subject?data.subject+' — ':'') + data.topic;
}

function lpClear(){
  ['lpDate','lpTimeFrom','lpTimeTo','lpSubject','lpTopic','lpSkill','lpObjectives'].forEach(id=>{
    const el = document.getElementById(id); if(el) el.value='';
  });
  try { localStorage.removeItem('bs_lesson_prep'); } catch(e){}
  toast('تم المسح','success');
}

function lpLoad(){
  try {
    const d = JSON.parse(localStorage.getItem('bs_lesson_prep')||'{}');
    if(d.date) document.getElementById('lpDate').value = d.date;
    if(d.timeFrom) document.getElementById('lpTimeFrom').value = d.timeFrom;
    if(d.timeTo) document.getElementById('lpTimeTo').value = d.timeTo;
    if(d.subject) document.getElementById('lpSubject').value = d.subject;
    if(d.topic) document.getElementById('lpTopic').value = d.topic;
    if(d.skill) document.getElementById('lpSkill').value = d.skill;
    if(d.objectives) document.getElementById('lpObjectives').value = d.objectives;
  } catch(e){}
}


// TEACHER BAG — per subject
const BAG_BOOKS = {}; // subId -> Array<{id, url, name, size}>
const BAG_ACTIVITIES = {}; // subId -> [{id,text,done}]

function bagEscapeHtml(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}
function bagEscapeAttr(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function bagIdbStorageKey(subId, bookId){ return subId+'::'+String(bookId); }

function bagIdbOpen(){
  return new Promise((res,rej)=>{
    const req=indexedDB.open('albushra_teacher_bag',1);
    req.onupgradeneeded=function(e){
      const db=e.target.result;
      if(!db.objectStoreNames.contains('pdfs')) db.createObjectStore('pdfs');
    };
    req.onsuccess=function(){ res(req.result); };
    req.onerror=function(){ rej(req.error); };
  });
}
function bagIdbPut(key, blob){
  return bagIdbOpen().then(db=>new Promise((res,rej)=>{
    try{
      const tx=db.transaction('pdfs','readwrite');
      tx.objectStore('pdfs').put(blob,key);
      tx.oncomplete=function(){ res(); };
      tx.onerror=function(){ rej(tx.error); };
    }catch(err){ rej(err); }
  }));
}
function bagIdbGet(key){
  return bagIdbOpen().then(db=>new Promise((res,rej)=>{
    const tx=db.transaction('pdfs','readonly');
    const r=tx.objectStore('pdfs').get(key);
    r.onsuccess=function(){ res(r.result); };
    r.onerror=function(){ rej(r.error); };
  }));
}
function bagIdbDelete(key){
  return bagIdbOpen().then(db=>new Promise((res,rej)=>{
    try{
      const tx=db.transaction('pdfs','readwrite');
      tx.objectStore('pdfs').delete(key);
      tx.oncomplete=function(){ res(); };
      tx.onerror=function(){ rej(tx.error); };
    }catch(err){ rej(err); }
  }));
}

function bagSaveBooksManifest(subId){
  const arr=BAG_BOOKS[subId]||[];
  const manifest=arr.map(({id,name,size})=>({id,name,size}));
  try{ localStorage.setItem('bs_bag_books_manifest_'+subId, JSON.stringify(manifest)); }catch(e){}
}

function bagRevokeSubjectBooks(subId){
  (BAG_BOOKS[subId]||[]).forEach(b=>{ try{ if(b.url) URL.revokeObjectURL(b.url); }catch(e){} });
  delete BAG_BOOKS[subId];
}

function bagRevokeAllBooks(){
  Object.keys(BAG_BOOKS).forEach(bagRevokeSubjectBooks);
}

async function bagRestoreBooksForSubject(subId){
  bagRevokeSubjectBooks(subId);
  let manifest=[];
  try{
    const raw=localStorage.getItem('bs_bag_books_manifest_'+subId);
    if(raw) manifest=JSON.parse(raw);
  }catch(e){ manifest=[]; }
  if(!manifest.length){ BAG_BOOKS[subId]=[]; return; }
  BAG_BOOKS[subId]=[];
  for(const m of manifest){
    if(!m||m.id==null) continue;
    try{
      const blob=await bagIdbGet(bagIdbStorageKey(subId,m.id));
      if(blob){
        BAG_BOOKS[subId].push({
          id:m.id,
          name:m.name||'ملف.pdf',
          size:m.size||'',
          url:URL.createObjectURL(blob)
        });
      }
    }catch(e){}
  }
}

async function bagLoadAllBooks(){
  bagRevokeAllBooks();
  for(const sub of S.subjects){
    await bagRestoreBooksForSubject(sub.id);
  }
}

function bagRenderBooks(subId){
  const list=document.getElementById('bagBooksList_'+subId);
  if(!list) return;
  const arr=BAG_BOOKS[subId]||[];
  if(!arr.length){
    list.innerHTML='<div style="font-size:0.78rem;color:var(--muted2);padding:4px 0;">لا توجد ملفات بعد — اضغط أعلاه لإضافة PDF</div>';
    if(typeof CM!=='undefined' && CM.open && CM.currentView==='slides' && String(subId)===String(CM.selectedSubId)) cmRenderBagBooksInClassroom();
    return;
  }
  list.innerHTML=arr.map(b=>{
    const nm=bagEscapeHtml(b.name);
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-radius:10px;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;flex-wrap:wrap;">'
      +'<div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">'
      +'<span style="font-size:1.35rem;flex-shrink:0;">📕</span>'
      +'<div style="min-width:0;"><div style="font-size:0.82rem;font-weight:800;color:#92400e;word-break:break-word;">'+nm+'</div>'
      +'<div style="font-size:0.70rem;color:#b45309;">'+bagEscapeHtml(b.size)+'</div></div></div>'
      +'<div style="display:flex;gap:6px;flex-shrink:0;">'
      +'<button type="button" onclick="bagOpenBook('+JSON.stringify(subId)+','+JSON.stringify(b.id)+')" class="btn btn-gold btn-sm">📖 فتح</button>'
      +'<button type="button" onclick="bagRemoveBook('+JSON.stringify(subId)+','+JSON.stringify(b.id)+')" class="btn btn-ghost btn-sm"><i class="ti ti-trash"></i></button>'
      +'</div></div>';
  }).join('');
  if(typeof CM!=='undefined' && CM.open && CM.currentView==='slides' && String(subId)===String(CM.selectedSubId)) cmRenderBagBooksInClassroom();
}

async function bagLoadBook(subId, input){
  const files=Array.from(input.files||[]);
  input.value='';
  if(!files.length) return;
  if(!BAG_BOOKS[subId]) BAG_BOOKS[subId]=[];
  let added=0;
  for(let fi=0;fi<files.length;fi++){
    const file=files[fi];
    const ok=file.type==='application/pdf' || /\.pdf$/i.test(file.name);
    if(!ok){ toast('تخطّي (ليس PDF): '+file.name,'error'); continue; }
    const id='b'+Date.now()+'_'+fi+'_'+Math.random().toString(36).replace(/[^a-z0-9]/gi,'').slice(0,10);
    const key=bagIdbStorageKey(subId,id);
    try{
      await bagIdbPut(key,file);
    }catch(e){
      toast('تعذّر حفظ الملف على الجهاز: '+file.name,'error');
      continue;
    }
    BAG_BOOKS[subId].push({
      id,
      url:URL.createObjectURL(file),
      name:file.name,
      size:(file.size/1024/1024).toFixed(2)+' MB'
    });
    added++;
  }
  if(added) bagSaveBooksManifest(subId);
  if(added) toast(added===1?'✅ تمت إضافة ملف PDF':'✅ تمت إضافة '+added+' ملفات','success');
  bagRenderBooks(subId);
}

function bagOpenBook(subId, bookId){
  const arr=BAG_BOOKS[subId]||[];
  const b=arr.find(x=>String(x.id)===String(bookId));
  if(!b||!b.url){ toast('الملف غير متوفر — أعد رفعه','error'); return; }
  openClassroomMode({ subId: subId, dur: parseInt(document.getElementById('cm_duration')?.value, 10) || CM.lessonDuration || 45 });
  setTimeout(()=>{
    cmSwitchView('slides');
    cmShowPdfFromUrl(b.url);
    toast('📖 '+String(b.name).replace(/\.pdf$/i,''),'success');
  }, 120);
}

function cmOpenBagBookFromClass(subId, bookId){
  const arr=BAG_BOOKS[subId]||[];
  const b=arr.find(x=>String(x.id)===String(bookId));
  if(!b||!b.url){ toast('الملف غير متوفر — أعد رفعه','error'); return; }
  cmShowPdfFromUrl(b.url);
  toast('📖 '+String(b.name).replace(/\.pdf$/i,''),'success');
}

function cmRenderBagBooksInClassroom(){
  const el=document.getElementById('cmBagBooksList');
  if(!el) return;
  if(!el.dataset.delegated){
    el.dataset.delegated='1';
    el.addEventListener('click', function(e){
      const btn=e.target.closest('.cm-bag-book-btn');
      if(!btn||!el.contains(btn)) return;
      e.preventDefault();
      e.stopPropagation();
      const subId=btn.getAttribute('data-bag-sub');
      const bookId=btn.getAttribute('data-bag-book');
      if(subId!=null && bookId!=null) cmOpenBagBookFromClass(subId, bookId);
    });
  }
  const subId=CM.selectedSubId || S.subjects[0]?.id;
  const arr=BAG_BOOKS[subId]||[];
  if(!arr.length){
    el.innerHTML='<div style="font-size:0.68rem;color:rgba(255,255,255,0.35);line-height:1.45;">لا توجد ملفات PDF في حقيبة هذه المادة. أضفها من صفحة «المواد الدراسية» ← حقيبة المعلم.</div>';
    return;
  }
  el.innerHTML=arr.map(b=>{
    return '<button type="button" class="cm-btn cm-btn-ghost cm-bag-book-btn" style="width:100%;justify-content:flex-start;font-size:0.76rem;padding:8px 10px;white-space:normal;text-align:right;line-height:1.35;cursor:pointer;touch-action:manipulation;" data-bag-sub="'+bagEscapeAttr(subId)+'" data-bag-book="'+bagEscapeAttr(String(b.id))+'"><span style="flex-shrink:0;margin-left:6px;pointer-events:none;">📕</span><span style="pointer-events:none;">'+bagEscapeHtml(b.name)+'</span></button>';
  }).join('');
}

async function bagRemoveBook(subId, bookId){
  const arr=BAG_BOOKS[subId]||[];
  const b=arr.find(x=>String(x.id)===String(bookId));
  if(!b) return;
  try{ await bagIdbDelete(bagIdbStorageKey(subId,b.id)); }catch(e){}
  try{ if(b.url) URL.revokeObjectURL(b.url); }catch(e){}
  BAG_BOOKS[subId]=arr.filter(x=>String(x.id)!==String(bookId));
  bagSaveBooksManifest(subId);
  bagRenderBooks(subId);
  if(typeof CM!=='undefined' && CM.open && CM.currentView==='slides' && String(subId)===String(CM.selectedSubId)) cmRenderBagBooksInClassroom();
  toast('تم حذف الملف','success');
}

function bagAddActivity(subId){
  const input=document.getElementById('bagActInput_'+subId);
  const val=input&&input.value.trim();
  if(!val) return;
  if(!BAG_ACTIVITIES[subId]) BAG_ACTIVITIES[subId]=[];
  BAG_ACTIVITIES[subId].push({ id:Date.now(), text:val, done:false });
  input.value='';
  bagRenderActivities(subId);
  bagSaveActivities(subId);
}

function bagToggleActivity(btn){
  const subId=btn.dataset.sub; const id=parseInt(btn.dataset.id);
  const arr=BAG_ACTIVITIES[subId]||[];
  const a=arr.find(x=>x.id===id);
  if(a) a.done=!a.done;
  bagRenderActivities(subId);
  bagSaveActivities(subId);
}

function bagDeleteActivity(btn){
  const subId=btn.dataset.sub; const id=parseInt(btn.dataset.id);
  if(!BAG_ACTIVITIES[subId]) return;
  BAG_ACTIVITIES[subId]=BAG_ACTIVITIES[subId].filter(x=>x.id!==id);
  bagRenderActivities(subId);
  bagSaveActivities(subId);
}

function bagRenderActivities(subId){
  const list=document.getElementById('bagActList_'+subId);
  if(!list) return;
  const arr=BAG_ACTIVITIES[subId]||[];
  if(!arr.length){
    list.innerHTML='<div style="font-size:0.78rem;color:var(--muted2);padding:6px 0;">لا توجد أنشطة بعد</div>';
    return;
  }
  list.innerHTML=arr.map(a=>{
    const bg=a.done?'var(--gold)':'transparent';
    const clr=a.done?'var(--muted2)':'var(--ink2)';
    const td=a.done?'line-through':'none';
    const sid=subId;
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:9px;border:1.5px solid var(--border);background:var(--surface);">'
      +'<button onclick="bagToggleActivity(this)" data-sub="'+sid+'" data-id="'+a.id+'" style="width:22px;height:22px;border-radius:6px;border:1.5px solid var(--gold);background:'+bg+';color:white;font-size:12px;cursor:none;flex-shrink:0;">'+(a.done?'✓':'')+'</button>'
      +'<span style="flex:1;font-size:0.82rem;color:'+clr+';text-decoration:'+td+'">'+a.text+'</span>'
      +'<button onclick="bagDeleteActivity(this)" data-sub="'+sid+'" data-id="'+a.id+'" style="width:22px;height:22px;border-radius:6px;border:none;background:#fee2e2;color:#ef4444;font-size:11px;cursor:none;">✕</button>'
      +'</div>';
  }).join('');
}

function bagSaveActivities(subId){
  try{ localStorage.setItem('bs_bag_act_'+subId, JSON.stringify(BAG_ACTIVITIES[subId]||[])); }catch(e){}
}

function bagLoadAllActivities(){
  S.subjects.forEach(sub=>{
    try{
      const d=JSON.parse(localStorage.getItem('bs_bag_act_'+sub.id)||'[]');
      BAG_ACTIVITIES[sub.id]=d;
    }catch(e){}
  });
}

function closeClassroomMode(){
  if(REC.active) cmStopRecording();
  // If user entered fullscreen in projector mode, exit it.
  try{ cmExitClassroomFullscreen(); }catch(e){}
  try{ cmStopAiAutoMode(); }catch(e){}
  document.getElementById('classroomOverlay').classList.remove('open');
  document.body.style.overflow='';
  CM.open=false;
  clearInterval(CM.timerInterval); CM.timerInterval=null;
  CM.timerRunning=false;
  clearInterval(CM._clockInterval);
  cmStopNoise();
  cancelAnimationFrame(CM.wheelRaf);
  CM.quickTimers.forEach(t=>{ clearInterval(t.interval); t.interval=null; });
}

// ── View switcher ───────────────────────────────────────────
function cmSwitchView(view){
  CM.currentView=view;
  document.querySelectorAll('.cm-view').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.cm-view-tab').forEach(b=>b.classList.remove('active'));
  const viewEl=document.getElementById('cmView-'+view);
  const tabEl =document.getElementById('cmVTab-'+view);
  if(viewEl) viewEl.classList.add('active');
  if(tabEl)  tabEl.classList.add('active');

  if(view==='board')  { cmUpdateBoardData(); }
  if(view==='wheel')  { setTimeout(cmDrawWheel,50); }
  if(view==='honor')  { cmBuildHonorView(); }
  if(view==='games')  { if(!CM.games) cmGamesInit(); cmRenderGame(CM.games.activeGame||'quiz'); }
  if(view==='slides') { cmSlidesInit(); }
  if(view==='whiteboard') { setTimeout(cmWbInit, 20); }
  if(view==='lessonprep') { lpLoad(); }
}

// ── CLOCK ───────────────────────────────────────────────────
function cmStartClock(){
  clearInterval(CM._clockInterval);
  let _lastTime='', _lastDate='';
  const tick=()=>{
    const n=new Date();
    const h=String(n.getHours()).padStart(2,'0');
    const m=String(n.getMinutes()).padStart(2,'0');
    const s=String(n.getSeconds()).padStart(2,'0');
    const timeStr=`${h}:${m}:${s}`;
    const dateStr=fmtDate(today());
    const el=document.getElementById('cmClock');
    const dl=document.getElementById('cmDateLive');
    if(el && timeStr!==_lastTime){ el.textContent=timeStr; _lastTime=timeStr; }
    if(dl && dateStr!==_lastDate){ dl.textContent=dateStr; _lastDate=dateStr; }
  };
  tick();
  CM._clockInterval=setInterval(tick,1000);
}

// ── TIMER ───────────────────────────────────────────────────
function fmtSecs(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }

function cmUpdateTimer(){
  const el=document.getElementById('cmTimerDisplay');
  const ring=document.getElementById('cmRingProg');
  const btn=document.getElementById('cmTimerBtn');
  if(!el||!ring) return;
  const pct=CM.timerLeft/CM.timerTotal;
  ring.style.strokeDashoffset=502*(1-pct);
  el.textContent=fmtSecs(CM.timerLeft);
  if(btn) btn.textContent=CM.timerRunning?'⏸ إيقاف':'▶ ابدأ';
  el.className='cm-timer-time';
  ring.className='ring-prog';
  if(pct<=0.10){ el.classList.add('urgent'); ring.classList.add('urgent'); }
  else if(pct<=0.25){ el.classList.add('warn'); ring.classList.add('warn'); }
}

function cmToggleTimer(){
  if(CM.timerRunning){
    clearInterval(CM.timerInterval); CM.timerInterval=null; CM.timerRunning=false;
  } else {
    if(CM.timerLeft<=0) cmResetTimer();
    CM.timerRunning=true;
    CM.timerInterval=setInterval(()=>{
      CM.timerLeft--;
      cmUpdateTimer();
      if(CM.timerLeft<=0){
        clearInterval(CM.timerInterval); CM.timerInterval=null; CM.timerRunning=false;
        toast('🔔 انتهت الحصة!','info');
      }
    },1000);
  }
  cmUpdateTimer();
}

function cmResetTimer(){
  clearInterval(CM.timerInterval); CM.timerInterval=null;
  CM.timerRunning=false; CM.timerLeft=CM.timerTotal;
  cmUpdateTimer();
}

function cmQuickTimer(min){
  const btn=event?.target;
  // Toggle: if already running this timer, cancel it
  const existing=CM.quickTimers.find(t=>t.label===min+'د');
  if(existing){
    clearInterval(existing.interval); existing.interval=null;
    CM.quickTimers=CM.quickTimers.filter(t=>t!==existing);
    if(btn) btn.classList.remove('active');
    return;
  }
  if(btn) btn.classList.add('active');
  const t={label:min+'د',total:min*60,left:min*60,running:true,interval:null,btn};
  CM.quickTimers.push(t);
  t.interval=setInterval(()=>{
    t.left--;
    if(t.left<=0){
      clearInterval(t.interval); t.interval=null;
      CM.quickTimers=CM.quickTimers.filter(x=>x!==t);
      if(btn) btn.classList.remove('active');
      toast(`🔔 مؤقت ${t.label} انتهى!`,'info');
    }
  },1000);
  toast(`⏱ مؤقت ${min} دقيقة بدأ`,'info');
}

// ── BOARD DATA ──────────────────────────────────────────────
function cmUpdateBoardData(){
  cmUpdateAttendanceGrid();
  cmUpdateTopList();
  cmInitEvalCard();
  cmUpdateStarCard();
}

function cmUpdateAttendanceGrid(){
  const grid=document.getElementById('cmAttGrid');
  const summary=document.getElementById('cmAttSummary');
  if(!grid) return;
  const att=S.attendance[today()]||{};
  const present=Object.values(att).filter(v=>v==='p').length;
  const absent=Object.values(att).filter(v=>v==='a').length;
  grid.innerHTML=S.students.map(s=>{
    const v=att[s.id];
    const cls=v==='p'?'present':v==='a'?'absent':'unknown';
    const photoEl=s.photo
      ?`<img src="${s.photo}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;"/>`
      :`<div style="width:28px;height:28px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;">${s.name.charAt(0)}</div>`;
    return `<div class="cm-att-card ${cls}" onclick="cmToggleAttendance('${s.id}')" title="${v==='p'?'حاضر — اضغط للغياب':v==='a'?'غائب — اضغط لإزالة':'اضغط لتسجيل الحضور'}">
      ${photoEl}
      <div class="cm-att-name">${s.name.split(' ')[0]}</div>
      <div style="font-size:0.72rem;margin-top:1px;">${v==='p'?'✅':v==='a'?'❌':'⬜'}</div>
    </div>`;
  }).join('');
  if(summary) summary.textContent=`✅${present} ❌${absent}`;
}

function cmToggleAttendance(sid){
  if(!S.attendance[today()]) S.attendance[today()]={};
  const cur=S.attendance[today()][sid];
  if(cur==='p') S.attendance[today()][sid]='a';
  else if(cur==='a') delete S.attendance[today()][sid];
  else S.attendance[today()][sid]='p';
  save();
  logChange('att','تسجيل حضور في وضع الحصة',S.students.find(s=>s.id===sid)?.name||'');
  cmUpdateAttendanceGrid();
}

function cmMarkAllPresent(){
  if(!S.attendance[today()]) S.attendance[today()]={};
  S.students.forEach(s=>{ S.attendance[today()][s.id]='p'; });
  save();
  cmUpdateAttendanceGrid();
  toast('✅ تم تسجيل حضور الجميع','success');
}

function cmUpdateTopList(){
  const el=document.getElementById('cmTopList');
  if(!el) return;
  const sorted=[...S.students].sort((a,b)=>studentMastery(b.id).total-studentMastery(a.id).total);
  el.innerHTML=sorted.map((s,i)=>{
    const m=studentMastery(s.id);
    const p=studentProgressSimple(s.id);
    const pctColor=m.total>=70?'var(--mint)':m.total>=40?'var(--gold)':'var(--ember)';
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
    const trendIcon=p.delta>0?'↗':p.delta<0?'↘':'→';
    const trendColor=p.delta>0?'var(--mint)':p.delta<0?'var(--ember)':'rgba(255,255,255,0.30)';
    const photoEl=s.photo
      ?`<img src="${s.photo}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;"/>`
      :`<div style="width:24px;height:24px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0;">${s.name.charAt(0)}</div>`;
    return `<div class="cm-top-item">
      <div class="cm-top-medal">${medal}</div>
      ${photoEl}
      <div class="cm-top-name">${s.name.split(' ')[0]}</div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;">
        <div class="cm-top-pct" style="color:${pctColor}">${m.total}%</div>
        <div style="font-size:0.68rem;font-weight:800;color:${trendColor}">${trendIcon}${p.label}</div>
      </div>
    </div>`;
  }).join('');
}

function cmUpdateStarCard(){
  const card=document.getElementById('cmStarCard');
  if(!card) return;
  if(CM.starOfDay){
    const s=S.students.find(x=>x.id===CM.starOfDay);
    if(s){ card.style.display='block'; document.getElementById('cmStarCardName').textContent=s.name; }
  } else { card.style.display='none'; }
}

// ── Eval card ───────────────────────────────────────────────
function cmInitEvalCard(){
  const sel=document.getElementById('cmEvalSubSec');
  if(!sel) return;
  sel.innerHTML=S.subjects.flatMap(sub=>
    sub.sections.map(sec=>`<option value="${sub.id}:${sec.id}">${sub.icon||'📚'}${sub.name} — ${sec.name}</option>`)
  ).join('');
  if(CM.selectedSubId){
    const sub=S.subjects.find(s=>s.id===CM.selectedSubId);
    if(sub?.sections[0]) sel.value=`${sub.id}:${sub.sections[0].id}`;
  }
  cmRenderEvalGrid();
}

function cmRenderEvalGrid(){
  const sel=document.getElementById('cmEvalSubSec');
  const grid=document.getElementById('cmEvalGrid');
  if(!sel||!grid) return;
  const [subId,secId]=sel.value.split(':');
  const sub=S.subjects.find(s=>s.id===subId);
  const sec=sub?.sections.find(s=>s.id===secId);
  if(!sec){ grid.innerHTML='<div style="color:rgba(255,255,255,0.30);font-size:0.82rem;padding:8px;">اختر مادة وخانة</div>'; return; }

  grid.innerHTML=S.students.map(s=>{
    const val=((S.evals[s.id]||{})[subId]||{})[secId]||{};
    const total=sec.skills.length;
    const mastered=Object.values(val).filter(v=>v==='m').length;
    const evaluated=Object.keys(val).length;
    const pct=total?Math.round(mastered/total*100):0;
    const statusClass=evaluated?(pct>=70?'ev-mastered':pct>0?'':'ev-not'):'';
    const statusIcon=pct>=70?'✅':evaluated&&mastered>0?'🔄':evaluated?'❌':'⬜';
    const photoEl=s.photo
      ?`<img src="${s.photo}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0;"/>`
      :`<div style="width:22px;height:22px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0;">${s.name.charAt(0)}</div>`;
    return `<div class="cm-eval-stu-btn ${statusClass}" onclick="cmEvalToggle('${s.id}','${subId}','${secId}')">
      ${photoEl}
      <div class="cm-eval-stu-name">${s.name.split(' ')[0]}</div>
      <div class="cm-eval-stu-status">${statusIcon}</div>
      <div style="position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 9px 0;background:${pct>=70?'rgba(16,185,129,0.7)':pct>0?'rgba(245,158,11,0.6)':'rgba(255,255,255,0.05)'};width:${pct}%;transition:width .4s;"></div>
    </div>`;
  }).join('');
}

function cmEvalToggle(sid,subId,secId){
  const sub=S.subjects.find(s=>s.id===subId);
  const sec=sub?.sections.find(s=>s.id===secId);
  const s=S.students.find(x=>x.id===sid);
  if(!sec||!s) return;
  const existing=document.getElementById('cmEvalPopup');
  if(existing) existing.remove();
  const popup=document.createElement('div');
  popup.id='cmEvalPopup';
  popup.style.cssText='position:fixed;inset:0;z-index:1200;background:rgba(0,0,0,0.75);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;';
  popup.onclick=e=>{ if(e.target===popup){ popup.remove(); cmRenderEvalGrid(); } };
  const curEval=((S.evals[sid]||{})[subId]||{})[secId]||{};
  const skillRows=sec.skills.map((sk,i)=>{
    const v=curEval[i];
    return `<div style="display:flex;align-items:center;gap:10px;padding:9px 13px;border-radius:10px;background:${v==='m'?'rgba(16,185,129,0.12)':v==='n'?'rgba(239,68,68,0.10)':'rgba(255,255,255,0.04)'};border:1px solid ${v==='m'?'rgba(16,185,129,0.25)':v==='n'?'rgba(239,68,68,0.20)':'rgba(255,255,255,0.07)'};margin-bottom:6px;">
      <span style="font-size:0.70rem;color:rgba(255,255,255,0.30);width:18px;text-align:center;font-weight:700">${i+1}</span>
      <span style="flex:1;font-size:0.86rem;color:rgba(255,255,255,0.85);font-weight:600">${sk}</span>
      <button onclick="cmEvalSet('${sid}','${subId}','${secId}',${i},'m')" style="padding:5px 11px;border-radius:7px;border:none;background:${v==='m'?'var(--mint)':'rgba(16,185,129,0.15)'};color:${v==='m'?'var(--ink)':'var(--mint)'};font-family:Tajawal,sans-serif;font-size:0.78rem;font-weight:800;cursor:none;">✅ أتقن</button>
      <button onclick="cmEvalSet('${sid}','${subId}','${secId}',${i},'n')" style="padding:5px 11px;border-radius:7px;border:none;background:${v==='n'?'var(--ember)':'rgba(239,68,68,0.15)'};color:${v==='n'?'white':'var(--ember)'};font-family:Tajawal,sans-serif;font-size:0.78rem;font-weight:800;cursor:none;">❌ لم يتقن بعد</button>
    </div>`;
  }).join('');
  const photoEl=s.photo
    ?`<img src="${s.photo}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(66,165,245,0.30);"/>`
    :`<div style="width:44px;height:44px;border-radius:50%;${avatarStyle(sid)};color:white;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;">${s.name.charAt(0)}</div>`;
  popup.innerHTML=`<div style="background:#111e33;border:1px solid rgba(255,255,255,0.10);border-radius:18px;padding:22px;width:460px;max-width:95vw;max-height:80vh;overflow-y:auto;direction:rtl;font-family:Tajawal,sans-serif;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      ${photoEl}
      <div><div style="font-size:1rem;font-weight:900;color:white;">${s.name}</div>
      <div style="font-size:0.74rem;color:rgba(255,255,255,0.40);">${sub.icon||'📚'} ${sub.name} — ${sec.name}</div></div>
      <button onclick="document.getElementById('cmEvalPopup').remove();cmRenderEvalGrid();" style="margin-right:auto;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.60);font-size:13px;font-weight:900;cursor:none;font-family:sans-serif;">✕</button>
    </div>
    ${skillRows}
    <div style="display:flex;gap:8px;margin-top:12px;">
      <button onclick="cmEvalMarkAll('${sid}','${subId}','${secId}','m')" style="flex:1;padding:10px;border-radius:10px;border:none;background:rgba(16,185,129,0.18);color:var(--mint);font-family:Tajawal,sans-serif;font-size:0.84rem;font-weight:800;cursor:none;">✅ أتقن الكل</button>
      <button onclick="cmEvalMarkAll('${sid}','${subId}','${secId}','n')" style="flex:1;padding:10px;border-radius:10px;border:none;background:rgba(239,68,68,0.15);color:var(--ember);font-family:Tajawal,sans-serif;font-size:0.84rem;font-weight:800;cursor:none;">❌ لم يُتقن بعد — وهو في طور التعلم</button>
    </div>
  </div>`;
  document.getElementById('classroomOverlay').appendChild(popup);
}

function cmEvalSet(sid,subId,secId,idx,val){
  if(!S.evals[sid]) S.evals[sid]={};
  if(!S.evals[sid][subId]) S.evals[sid][subId]={};
  if(!S.evals[sid][subId][secId]) S.evals[sid][subId][secId]={};
  if(S.evals[sid][subId][secId][idx]===val) delete S.evals[sid][subId][secId][idx];
  else S.evals[sid][subId][secId][idx]=val;
  save();
  logChange('eval','تقييم في وضع الحصة',S.students.find(s=>s.id===sid)?.name||'');
  const popup=document.getElementById('cmEvalPopup');
  if(popup){ popup.remove(); cmEvalToggle(sid,subId,secId); }
}

function cmEvalMarkAll(sid,subId,secId,val){
  const sub=S.subjects.find(s=>s.id===subId);
  const sec=sub?.sections.find(s=>s.id===secId);
  if(!sec) return;
  if(!S.evals[sid]) S.evals[sid]={};
  if(!S.evals[sid][subId]) S.evals[sid][subId]={};
  S.evals[sid][subId][secId]={};
  sec.skills.forEach((_,i)=>{ S.evals[sid][subId][secId][i]=val; });
  save();
  const popup=document.getElementById('cmEvalPopup');
  if(popup){ popup.remove(); cmEvalToggle(sid,subId,secId); }
  cmRenderEvalGrid();
  cmUpdateTopList();
}

function cmPickStarOfDay(){
  if(!S.students.length) return;
  const sorted=[...S.students].sort((a,b)=>studentMastery(b.id).total-studentMastery(a.id).total);
  CM.starOfDay=sorted[0].id;
  cmUpdateStarCard();
  confetti();
  toast('⭐ نجمة اليوم: '+sorted[0].name,'success');
}

function cmStartQuickEval(){
  if(!S.subjects.length||!S.students.length) return;
  closeClassroomMode();
  const sub=S.subjects.find(s=>s.id===CM.selectedSubId)||S.subjects[0];
  startQuickEval(sub.id,sub.sections[0]?.id);
}

// ── WHEEL ───────────────────────────────────────────────────
function cmDrawWheel(){
  const canvas=document.getElementById('cmWheelCanvas');
  if(!canvas) return;
  const pool = CM.wheelRemaining.length ? CM.wheelRemaining : S.students;
  if(!pool.length) return;
  const ctx=canvas.getContext('2d');
  const cx=190,cy=190,r=185,n=pool.length;
  const colors=['#1565c0','#0e7490','#059669','#7c3aed','#dc2626','#d97706','#0284c7','#4f46e5','#0f766e','#9333ea'];
  ctx.clearRect(0,0,380,380);
  pool.forEach((s,i)=>{
    const start=(i/n)*2*Math.PI+CM.wheelAngle;
    const end=((i+1)/n)*2*Math.PI+CM.wheelAngle;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,end); ctx.closePath();
    ctx.fillStyle=colors[i%colors.length]; ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.20)'; ctx.lineWidth=2; ctx.stroke();
    const mid=(start+end)/2;
    ctx.save();
    ctx.translate(cx+Math.cos(mid)*r*0.65,cy+Math.sin(mid)*r*0.65);
    ctx.rotate(mid+Math.PI/2);
    ctx.fillStyle='white'; ctx.font='bold 13px Tajawal,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const name=s.name.split(' ')[0];
    ctx.fillText(name.length>7?name.substring(0,6)+'…':name,0,0);
    ctx.restore();
  });
  // Center
  ctx.beginPath(); ctx.arc(cx,cy,30,0,2*Math.PI);
  ctx.fillStyle='#0a0f1e'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=3; ctx.stroke();
  ctx.fillStyle='white'; ctx.font='bold 20px sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('🎡',cx,cy);
  // Show remaining count on canvas corner
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.font='bold 12px Tajawal,sans-serif';
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText(`متبقي: ${pool.length}/${S.students.length}`,8,8);
}

function cmSpinWheel(){
  const pool = CM.wheelRemaining.length ? CM.wheelRemaining : S.students;
  if(CM.wheelSpinning || !pool.length) return;

  const btn=document.getElementById('cmSpinBtn');
  CM.wheelSpinning=true;
  if(btn){ btn.disabled=true; btn.textContent='⏳ جاري الدوران...'; }
  document.getElementById('cmWheelResultBig').querySelector('.cm-wrb-text').textContent='...';
  document.getElementById('cmWheelResultBig').querySelector('.cm-wrb-emoji').textContent='🎡';

  CM.wheelVelocity=0.28+Math.random()*0.30;
  function spin(){
    CM.wheelAngle+=CM.wheelVelocity;
    CM.wheelVelocity*=0.984;
    cmDrawWheel();
    if(CM.wheelVelocity>0.003){
      CM.wheelRaf=requestAnimationFrame(spin);
    } else {
      CM.wheelSpinning=false;
      const currentPool = CM.wheelRemaining.length ? CM.wheelRemaining : S.students;
      const n = currentPool.length;
      // Pointer is at TOP of canvas (angle = -π/2 from standard)
      // Normalize wheel angle so pointer (top) maps correctly to segment
      const norm = (((-(CM.wheelAngle + Math.PI/2) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI));
      const idx = Math.floor(norm / (2*Math.PI / n)) % n;
      const winner = currentPool[idx];
      const m=studentMastery(winner.id);

      // ── Remove winner from remaining pool ──
      CM.wheelRemaining=CM.wheelRemaining.filter(s=>s.id!==winner.id);

      // If pool exhausted — reset it silently for next round
      const exhausted = CM.wheelRemaining.length === 0;
      if(exhausted) CM.wheelRemaining=[...S.students];

      // Update result display
      const rb=document.getElementById('cmWheelResultBig');
      rb.querySelector('.cm-wrb-emoji').textContent='🎉';
      rb.querySelector('.cm-wrb-text').textContent=winner.name;
      const remaining = exhausted ? S.students.length : CM.wheelRemaining.length;
      document.getElementById('cmWheelSubBig').textContent=
        `إتقان ${m.total}% · ${masteryLabel(m.total)}${exhausted?' · 🔄 تمت جميع الطلاب! جولة جديدة':''}`;

      // Update btn
      if(btn){
        btn.disabled=false;
        btn.textContent = exhausted
          ? '🔄 جولة جديدة — أدِر العجلة'
          : `🎡 أدِر العجلة (${CM.wheelRemaining.length} متبقي)`;
      }

      // History
      CM.wheelHistory.unshift({name:winner.name,pct:m.total});
      const hist=document.getElementById('cmWheelHistory');
      if(hist) hist.innerHTML=CM.wheelHistory.slice(0,8).map((h,i)=>`
        <div class="cm-hist-item">
          <div class="cm-hist-num">${i+1}</div>
          <div style="flex:1">${h.name}</div>
          <div style="color:var(--sky3);font-weight:800">${h.pct}%</div>
        </div>`).join('');

      confetti();
      // Redraw wheel without the winner
      setTimeout(cmDrawWheel, 800);
    }
  }
  spin();
}

// ── HONOR VIEW ──────────────────────────────────────────────
function cmBuildHonorView(){
  const el=document.getElementById('cmHonorDate');
  if(el) el.textContent=fmtDate(today())+' · '+fullName();

  const sorted=[...S.students]
    .map(s=>({s,m:studentMastery(s.id),stars:((S.behavior[s.id]||{})[today()]||{}).stars||0}))
    .sort((a,b)=>b.m.total-a.m.total);

  // Podium (top 3)
  const podium=document.getElementById('cmHonorPodium');
  if(podium&&sorted.length>=1){
    const order=sorted.length>=3?[sorted[1],sorted[0],sorted[2]]:[sorted[0]];
    const classes=sorted.length>=3?['second','first','third']:['first'];
    const sizes=sorted.length>=3?[64,80,56]:[80];
    podium.innerHTML=order.map((item,i)=>{
      if(!item) return '';
      const medal=classes[i]==='first'?'🥇':classes[i]==='second'?'🥈':'🥉';
      const pctColor=item.m.total>=70?'var(--mint)':item.m.total>=40?'var(--gold)':'var(--ember)';
      const sz=sizes[i];
      return `<div class="cm-podium-item ${classes[i]}">
        <div style="font-size:1.5rem">${medal}</div>
        <div class="cm-podium-avatar" style="${avatarStyle(item.s.id)};color:white;width:${sz}px;height:${sz}px;font-size:${Math.round(sz*0.38)}px">
          ${item.s.photo
            ?(`<img src="${item.s.photo}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;" />`)
            :item.s.name.charAt(0)}
        </div>
        <div class="cm-podium-name" style="max-width:130px">${item.s.name.split(' ').slice(0,2).join(' ')}</div>
        <div class="cm-podium-pct" style="color:${pctColor};font-size:${classes[i]==='first'?'1.1rem':'0.88rem'}">${item.m.total}%</div>
        <div class="cm-podium-base"></div>
      </div>`;
    }).join('');
  }

  // Rest
  const rest=document.getElementById('cmHonorRest');
  if(rest){
    rest.innerHTML=sorted.slice(3).map((item,i)=>{
      const pctColor=item.m.total>=70?'var(--mint)':item.m.total>=40?'var(--gold)':'var(--ember)';
      return `<div class="cm-rest-chip">
        <span style="font-weight:900;color:rgba(255,255,255,0.38)">${i+4}</span>
        ${item.s.photo?`<img src="${item.s.photo}" style="width:24px;height:24px;border-radius:50%;object-fit:cover" />`
          :`<div style="width:24px;height:24px;border-radius:50%;${avatarStyle(item.s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900">${item.s.name.charAt(0)}</div>`}
        ${item.s.name.split(' ')[0]}
        <span style="color:${pctColor};font-weight:900">${item.m.total}%</span>
      </div>`;
    }).join('');
  }
}

// ── NOISE ───────────────────────────────────────────────────
function cmInitNoise(){
  if(!navigator.mediaDevices||!window.AudioContext) return;
  navigator.mediaDevices.getUserMedia({audio:true,video:false})
    .then(stream=>{
      CM.noiseStream=stream;
      const actx=new AudioContext();
      const src=actx.createMediaStreamSource(stream);
      const analyser=actx.createAnalyser();
      analyser.fftSize=256;
      src.connect(analyser);
      CM.noiseAnalyser=analyser;
      CM.noiseEnabled=true;
      cmNoiseLoop();
    }).catch(()=>{});
}

function cmNoiseLoop(){
  if(!CM.noiseEnabled||!CM.noiseAnalyser) return;
  const data=new Uint8Array(CM.noiseAnalyser.fftSize);
  CM.noiseAnalyser.getByteTimeDomainData(data);
  let sum=0; data.forEach(v=>{const d=v-128;sum+=d*d;});
  const pct=Math.min(100,Math.sqrt(sum/data.length)*3);
  const fill=document.getElementById('cmNoiseFill');
  if(fill){
    fill.style.width=pct+'%';
    fill.style.background=pct>70?'var(--ember)':pct>40?'var(--gold)':'var(--mint)';
  }
  if(pct>80){
    const al=document.getElementById('cmNoiseAlert');
    if(al){al.classList.add('show');setTimeout(()=>al.classList.remove('show'),550);}
  }
  CM.noiseRaf=requestAnimationFrame(cmNoiseLoop);
}

function cmStopNoise(){
  CM.noiseEnabled=false;
  cancelAnimationFrame(CM.noiseRaf);
  CM.noiseStream?.getTracks().forEach(t=>t.stop());
  CM.noiseStream=null; CM.noiseAnalyser=null;
}

// ── KEYBOARD وضع الحصة: لا اختصارات — لتفادي التقاط المسافة والحروف أثناء الكتابة في الحقول
