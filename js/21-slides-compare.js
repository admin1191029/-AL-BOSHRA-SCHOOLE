// ══════════════════════════════════════════════════════════════
// 📽️ SLIDES VIEWER — عرض الشرائح في وضع الحصة
// ══════════════════════════════════════════════════════════════

const SLIDES = {
  mode: null,       // 'url' | 'images' | 'pdf'
  images: [],       // object URLs or base64 images
  objectUrls: [],   // URLs created via URL.createObjectURL
  currentIdx: 0,
};

function cmReleaseSlideObjectUrls(){
  if(!SLIDES.objectUrls || !SLIDES.objectUrls.length) return;
  for(const u of SLIDES.objectUrls){
    try{ URL.revokeObjectURL(u); }catch(e){}
  }
  SLIDES.objectUrls = [];
}

function cmSlidesInit(){
  if(typeof cmRenderBagBooksInClassroom==='function') cmRenderBagBooksInClassroom();
  // Restore last state if any
  if(SLIDES.mode === 'images' && SLIDES.images.length){
    cmShowImgSlide(SLIDES.currentIdx);
    cmUpdateSlidesNav();
  } else if(SLIDES.mode === 'url'){
    // already loaded
  }
}

// ── Method 1: URL ────────────────────────────────────────────
function cmLoadSlideUrl(){
  let url = document.getElementById('cmSlidesUrl')?.value.trim();
  if(!url){ toast('أدخل رابطاً','error'); return; }

  // تحويل رابط YouTube تلقائياً لـ embed
  if(url.includes('youtube.com') || url.includes('youtu.be')){
    let videoId = '';
    const ym1 = url.match(new RegExp('[?&]v=([a-zA-Z0-9_-]{11})'));
    const ym2 = url.match(new RegExp('youtu\.be\/([a-zA-Z0-9_-]{11})'));
    if(ym1) videoId = ym1[1];
    else if(ym2) videoId = ym2[1];
    if(videoId) url = 'https://www.youtube.com/embed/' + videoId + '?rel=0&autoplay=1';
  }

  // Auto-convert Google Slides share link to embed link
  if(url.includes('docs.google.com/presentation')){
    // Extract presentation ID
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if(m){
      url = `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false&delayms=3000`;
    }
  }

  // OneDrive embed — just use as-is
  SLIDES.mode = 'url';
  const frame = document.getElementById('cmSlidesFrame');
  const empty = document.getElementById('cmSlidesEmpty');
  const imgV  = document.getElementById('cmSlidesImgViewer');
  const pdfF  = document.getElementById('cmSlidesPdfFrame');

  empty.style.display='none';
  imgV.style.display='none';
  pdfF.style.display='none';
  frame.style.display='block';
  frame.src = url;

  document.getElementById('cmSlidesNav').style.display='none';
  toast('✅ تم تحميل العرض','success');
}

// ── Method 2: Images ─────────────────────────────────────────
function cmLoadImageSlides(input){
  const files = Array.from(input.files);
  if(!files.length) return;

  // Sort by name
  files.sort((a,b)=>a.name.localeCompare(b.name));
  SLIDES.images = [];
  SLIDES.currentIdx = 0;

  let loaded = 0;
  files.forEach((file,i)=>{
    const reader = new FileReader();
    reader.onload = e => {
      SLIDES.images[i] = e.target.result;
      loaded++;
      if(loaded === files.length){
        SLIDES.mode = 'images';
        const countEl = document.getElementById('cmImgCount');
        if(countEl) countEl.textContent = `${files.length} شريحة محمّلة`;
        cmShowImgSlide(0);
        cmUpdateSlidesNav();
        toast(`✅ ${files.length} شريحة جاهزة`,'success');
      }
    };
    reader.readAsDataURL(file);
  });
}

function cmShowImgSlide(idx){
  if(!SLIDES.images.length) return;
  idx = Math.max(0, Math.min(idx, SLIDES.images.length-1));
  SLIDES.currentIdx = idx;

  const frame = document.getElementById('cmSlidesFrame');
  const empty = document.getElementById('cmSlidesEmpty');
  const imgV  = document.getElementById('cmSlidesImgViewer');
  const img   = document.getElementById('cmSlidesImg');
  const pdfF  = document.getElementById('cmSlidesPdfFrame');

  empty.style.display='none';
  frame.style.display='none';
  pdfF.style.display='none';
  imgV.style.display='flex';
  imgV.style.alignItems='center';
  imgV.style.justifyContent='center';
  img.src = SLIDES.images[idx];

  cmUpdateSlidesNav();
}

// ── Method 3: PDF ─────────────────────────────────────────────
function cmShowPdfFromUrl(url){
  const u = String(url||'');
  if(!u){ toast('رابط الملف غير صالح','error'); return; }
  SLIDES.mode = 'pdf';
  const frame = document.getElementById('cmSlidesFrame');
  const empty = document.getElementById('cmSlidesEmpty');
  const imgV  = document.getElementById('cmSlidesImgViewer');
  const pdfF  = document.getElementById('cmSlidesPdfFrame');
  const pdfV  = document.getElementById('cmSlidesPdfViewer');
  const vidP  = document.getElementById('cmVideoPlayer');
  if(empty){ empty.style.display='none'; empty.style.pointerEvents='none'; }
  if(frame) frame.style.display='none';
  if(imgV)  imgV.style.display='none';
  if(pdfV)  pdfV.style.display='none';
  if(vidP){ try{ vidP.pause(); }catch(e){} vidP.style.display='none'; }
  if(pdfF){
    pdfF.style.display='block';
    pdfF.style.position='relative';
    pdfF.style.zIndex='4';
    try{
      if(String(pdfF.src||'')===u) pdfF.src='';
      requestAnimationFrame(()=>{ pdfF.src=u; });
    }catch(e){ pdfF.src=u; }
  }
  const nav=document.getElementById('cmSlidesNav');
  if(nav) nav.style.display='none';
  const cpb=document.getElementById('cmClearPdfBtn'); if(cpb) cpb.style.display='block';
}

function cmPdfRenderPage(pageNum){
  const doc = SLIDES.pdfDoc;
  if(!doc) return;
  pageNum = Math.max(1, Math.min(pageNum, doc.numPages));
  SLIDES.pdfPage = pageNum;
  doc.getPage(pageNum).then(page=>{
    const canvas = document.getElementById('cmSlidesPdfCanvas');
    const container = document.getElementById('cmSlidesPdfViewer');
    if(!canvas||!container) return;
    const vp0 = page.getViewport({scale:1});
    const scale = Math.min(
      (container.clientWidth  || 800) / vp0.width,
      (container.clientHeight || 500) / vp0.height
    ) * 0.96;
    const vp = page.getViewport({scale});
    canvas.width  = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext('2d');
    page.render({canvasContext:ctx, viewport:vp}).promise.then(()=>{
      cmUpdateSlidesNav();
    });
  });
}

function cmPdfGotoPage(n){
  if(!SLIDES.pdfDoc) return;
  cmPdfRenderPage(n);
}

function cmLoadPdfSlide(input){
  const file = input.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  cmShowPdfFromUrl(url);
  toast('✅ تم تحميل PDF','success');
}

// ── Navigation ────────────────────────────────────────────────
function cmSlideNext(){
  if(SLIDES.mode==='images') cmShowImgSlide(SLIDES.currentIdx+1);
}
function cmSlidePrev(){
  if(SLIDES.mode==='images') cmShowImgSlide(SLIDES.currentIdx-1);
}

function cmUpdateSlidesNav(){
  const nav = document.getElementById('cmSlidesNav');
  const counter = document.getElementById('cmSlidesCounter');
  if(!nav||!counter) return;
  if(SLIDES.mode==='images' && SLIDES.images.length){
    nav.style.display='block';
    counter.textContent = `${SLIDES.currentIdx+1} / ${SLIDES.images.length}`;
  } else {
    nav.style.display='none';
  }
}

function cmSlidesFullscreen(){
  const main = document.getElementById('cmSlidesMain');
  if(main?.requestFullscreen) main.requestFullscreen();
  else if(main?.webkitRequestFullscreen) main.webkitRequestFullscreen();
}

function cmExitClassroomFullscreen(){
  try{
    if(document.fullscreenElement) document.exitFullscreen();
  }catch(e){}
}

function cmForceCursorVisible(show){
  try{
    const cur = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if(show){
      document.body.style.cursor = 'auto';
      document.documentElement.style.cursor = 'auto';
      if(cur){
        cur.style.setProperty('display','block','important');
        cur.style.setProperty('opacity','1','important');
      }
      if(ring){
        ring.style.setProperty('display','block','important');
        ring.style.setProperty('opacity','1','important');
      }
    } else {
      if(cur){
        cur.style.removeProperty('display');
        cur.style.removeProperty('opacity');
      }
      if(ring){
        ring.style.removeProperty('display');
        ring.style.removeProperty('opacity');
      }
    }
  }catch(e){}
}

function cmToggleAppFullscreen(){
  try{
    // Toggle fullscreen for the current app page
    if(document.fullscreenElement){
      document.exitFullscreen();
      return;
    }
    const target = document.documentElement || document.body;
    const req = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
    if(req) req.call(target);
  }catch(e){}
}

function cmToggleClassroomFullscreen(){
  const el = document.getElementById('classroomOverlay');
  if(!el) return;
  const btn = document.getElementById('cmFsBtn');

  // Toggle
  if(document.fullscreenElement){
    cmExitClassroomFullscreen();
    return;
  }

  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if(req){
    req.call(el);
  }

  // Button text will update on fullscreenchange
  if(btn) btn.textContent = '⤫ خروج';
  // Ensure system cursor is visible (our custom cursor can get hidden in fullscreen).
  try{ document.body.classList.add('cm-fs-showcursor'); }catch(e){}
  // Force override cursor visibility after fullscreen enters (async in browsers)
  setTimeout(()=>{ cmForceCursorVisible(true); }, 80);
}

// Update button label when fullscreen state changes
document.addEventListener('fullscreenchange', ()=>{
  const btn = document.getElementById('cmFsBtn');
  if(!btn) return;
  btn.textContent = document.fullscreenElement ? '⤫ خروج' : '⛶ ملء الشاشة';
  // Only keep the cursor helper while the projector overlay is in fullscreen.
  try{
    if(document.fullscreenElement && document.fullscreenElement.id === 'classroomOverlay'){
      document.body.classList.add('cm-fs-showcursor');
      cmForceCursorVisible(true);
    }else{
      document.body.classList.remove('cm-fs-showcursor');
      cmForceCursorVisible(false);
    }
  }catch(e){}
});

function cmAiAutoBuildMessages(){
  const total = S.students?.length || 0;
  const td = (typeof today === 'function') ? today() : new Date().toISOString().split('T')[0];
  const att = S.attendance?.[td] || {};
  const evMap = S.evals || {};

  const absent = [];
  const notMarked = [];
  const present = [];
  for(const s of S.students || []){
    const v = att?.[s.id];
    if(v === 'a') absent.push(s);
    else if(v === 'p') present.push(s);
    else notMarked.push(s);
  }

  const ungraded = (S.students || []).filter(s => {
    const ev = evMap?.[s.id] || {};
    return Object.keys(ev).length === 0;
  });

  const takeNames = (arr, n=8) => {
    return arr.slice(0, n).map(x => (x.name || '').split(' ')[0] || x.name || '—')
      .join('، ') + (arr.length > n ? '...' : '');
  };

  const attendancePct = total ? Math.round((present.length / total) * 100) : 0;
  const gradedPct = total ? Math.round(((total - ungraded.length) / total) * 100) : 0;

  // Top student by overall mastery
  let top = null;
  try{
    const sorted = (S.students || []).map(s => ({ s, m: (studentMastery && studentMastery(s.id)?.total) || 0 }))
      .sort((a,b)=>b.m-a.m);
    top = sorted[0] || null;
  }catch(_e){}

  // Hardest skill based on first subject/first section skills
  let hardestSkill = null;
  try{
    const firstSub = S.subjects?.[0];
    const firstSec = firstSub?.sections?.[0];
    if(firstSub && firstSec && Array.isArray(firstSec.skills) && firstSec.skills.length){
      const idxRates = firstSec.skills.map((sk, i) => {
        const cnt = (S.students || []).filter(s =>
          (((S.evals?.[s.id] || {})[firstSub.id] || {})[firstSec.id] || {})[i] === 'm'
        ).length;
        const pct = total ? Math.round((cnt / total) * 100) : 0;
        return { sk, pct };
      });
      hardestSkill = idxRates.sort((a,b)=>a.pct-b.pct)[0] || null;
    }
  }catch(_e){}

  const doneGoals = Array.isArray(S.goals) ? S.goals.filter(g => g.done).length : 0;
  const totalGoals = Array.isArray(S.goals) ? S.goals.length : 0;
  const goalsPct = totalGoals ? Math.round((doneGoals / totalGoals) * 100) : null;

  const messages = [];
  if(total === 0){
    messages.push('لا توجد بيانات بعد. أضف طلاباً وسجّل حضور وتقييم.');
    return messages;
  }

  // Add 6 rotating messages (every 10 seconds)
  messages.push(absent.length ? `❌ لم يحضر اليوم (${absent.length}): ${takeNames(absent)}` : '✅ لا يوجد غياب مسجّل اليوم.');
  messages.push(notMarked.length ? `🟠 لم يُسجَّل حضور (${notMarked.length}): ${takeNames(notMarked)}` : '✅ تم تسجيل حضور كل الطلاب.');
  messages.push(ungraded.length ? `⬜ لم يُقيَّم بعد (${ungraded.length}): ${takeNames(ungraded)}` : '✅ التقييمات مكتملة (لا يوجد غير مُقيَّمين).');
  messages.push(`📊 نسبة حضور اليوم: ${attendancePct}% �� 📈 نسبة التقييم المكتمل: ${gradedPct}%`);
  if(top && top.s) messages.push(`🏆 أعلى طالب: ${String(top.s.name||'—').split(' ')[0]} (${top.m}%)`);
  if(hardestSkill) messages.push(`🎯 أصعب مهارة: "${hardestSkill.sk}" (${hardestSkill.pct}%)`);
  if(goalsPct != null) messages.push(`🎯 إنجاز الأهداف: ${goalsPct}% (${doneGoals}/${totalGoals})`);

  return messages.filter(Boolean);
}

function cmAiAutoRenderTick(){
  const out = document.getElementById('cmAiOut');
  if(!out) return;
  const messages = cmAiAutoBuildMessages();
  if(!messages.length){
    out.style.display = 'none';
    return;
  }
  if(!CM.aiAutoIdx) CM.aiAutoIdx = 0;
  const msg = messages[CM.aiAutoIdx % messages.length];
  CM.aiAutoIdx++;
  out.textContent = msg;
  out.style.display = 'block';
}

function cmStartAiAutoMode(){
  CM.aiAuto = true;
  CM.aiAutoIdx = 0;
  const input = document.getElementById('cmAiInput');
  const sendBtn = document.getElementById('cmAiSendBtn');
  const out = document.getElementById('cmAiOut');

  if(input){
    input.disabled = true;
    input.readOnly = true;
    input.style.display = 'none'; // يمنع الكتابة تماماً
  }
  if(sendBtn){
    sendBtn.disabled = true;
    sendBtn.style.display = 'none';
  }
  if(out){
    out.style.display = 'block';
  }

  const btn = document.getElementById('cmAiAutoBtn');
  if(btn) btn.textContent = '⏸ إيقاف الرسائل';

  // First tick immediately, then every 10 seconds
  cmAiAutoRenderTick();
  if(CM.aiAutoTimer) clearInterval(CM.aiAutoTimer);
  CM.aiAutoTimer = setInterval(cmAiAutoRenderTick, 10000);
}

function cmStopAiAutoMode(){
  CM.aiAuto = false;
  if(CM.aiAutoTimer){
    clearInterval(CM.aiAutoTimer);
    CM.aiAutoTimer = null;
  }
  const input = document.getElementById('cmAiInput');
  const sendBtn = document.getElementById('cmAiSendBtn');
  const out = document.getElementById('cmAiOut');
  if(input){
    input.disabled = false;
    input.readOnly = false;
    input.style.display = ''; // restore default
  }
  if(sendBtn){
    sendBtn.disabled = false;
    sendBtn.style.display = '';
  }
  if(out){
    // keep last message visible
    out.style.display = 'block';
  }
  const btn = document.getElementById('cmAiAutoBtn');
  if(btn) btn.textContent = '🧠 رسائل تلقائية';
}

function cmToggleAiAutoMode(){
  if(CM.aiAuto) cmStopAiAutoMode();
  else cmStartAiAutoMode();
}

function cmClearSlides(){
  cmReleaseSlideObjectUrls();
  SLIDES.mode=null; SLIDES.images=[]; SLIDES.currentIdx=0;
  const frame = document.getElementById('cmSlidesFrame');
  const empty = document.getElementById('cmSlidesEmpty');
  const imgV  = document.getElementById('cmSlidesImgViewer');
  const pdfF  = document.getElementById('cmSlidesPdfFrame');
  const vidP  = document.getElementById('cmVideoPlayer');
  if(frame){ frame.style.display='none'; frame.src=''; }
  if(imgV)  imgV.style.display='none';
  if(pdfF){ pdfF.style.display='none'; pdfF.src=''; }
  if(vidP){ vidP.style.display='none'; vidP.src=''; }
  if(empty) empty.style.display='block';
  document.getElementById('cmSlidesNav').style.display='none';
  document.getElementById('cmVideoControls').style.display='none';
  const countEl=document.getElementById('cmImgCount');
  if(countEl) countEl.textContent='';
  const nameEl=document.getElementById('cmVideoName');
  if(nameEl) nameEl.textContent='';
  const pptxSt=document.getElementById('cmPptxStatus');
  if(pptxSt) pptxSt.textContent='';
  const pptxIn=document.getElementById('cmSlidesPptx');
  if(pptxIn) pptxIn.value='';
  const cPptx=document.getElementById('cmClearPptxBtn');
  if(cPptx) cPptx.style.display='none';
}

// ── Video functions ──────────────────────────────────────────
function cmLoadVideo(input){
  const file = input.files[0];
  if(!file) return;
  SLIDES.mode = 'video';
  const url = URL.createObjectURL(file);

  const frame = document.getElementById('cmSlidesFrame');
  const empty = document.getElementById('cmSlidesEmpty');
  const imgV  = document.getElementById('cmSlidesImgViewer');
  const pdfF  = document.getElementById('cmSlidesPdfFrame');
  const vidP  = document.getElementById('cmVideoPlayer');

  empty.style.display='none';
  frame.style.display='none';
  imgV.style.display='none';
  pdfF.style.display='none';
  vidP.style.display='block';
  vidP.src = url;

  document.getElementById('cmSlidesNav').style.display='none';
  const ctrl = document.getElementById('cmVideoControls');
  if(ctrl) ctrl.style.display='block';
  const nameEl = document.getElementById('cmVideoName');
  if(nameEl) nameEl.textContent = `🎬 ${file.name}`;
  toast('✅ تم تحميل الفيديو','success');
}

function cmVideoToggle(){
  const v = document.getElementById('cmVideoPlayer');
  const btn = document.getElementById('cmVidPlayBtn');
  if(!v) return;
  if(v.paused){ v.play(); if(btn) btn.textContent='⏸ إيقاف'; SFX.play('tick'); }
  else { v.pause(); if(btn) btn.textContent='▶ تشغيل'; }
}

function cmVideoMute(){
  const v = document.getElementById('cmVideoPlayer');
  const btn = document.getElementById('cmVidMuteBtn');
  if(!v) return;
  v.muted = !v.muted;
  if(btn) btn.textContent = v.muted ? '🔇' : '🔊';
}

function cmVideoSeek(val){
  const v = document.getElementById('cmVideoPlayer');
  if(!v || !v.duration) return;
  v.currentTime = (val/100) * v.duration;
}

function cmVideoTimeUpdate(){
  const v = document.getElementById('cmVideoPlayer');
  const seek = document.getElementById('cmVideoSeek');
  const time = document.getElementById('cmVideoTime');
  if(!v) return;
  if(v.duration){
    const pct = (v.currentTime / v.duration) * 100;
    if(seek) seek.value = pct;
    const fmt = s => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
    if(time) time.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
  }
}

function cmVideoMetaLoaded(){
  const btn = document.getElementById('cmVidPlayBtn');
  if(btn) btn.textContent = '▶ تشغيل';
}

// ══════════════════════════════════════════════════════════════
// 📊 COMPARE CLASSES — مقارنة الفصول
// ══════════════════════════════════════════════════════════════
function renderCompare(){
  const classes = getAllClasses();
  if(classes.length < 2){
    return `
    <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active"><i class="ti ti-chart-bar"></i> مقارنة الفصول</span></div>
    <div class="empty">
      <div class="empty-emoji"><i class="ti ti-chart-bar"></i></div>
      <h3>تحتاج فصلين على الأقل</h3>
      <p>أضف فصلاً ثانياً من زر الفصل في الأعلى</p>
      <button class="btn btn-primary" onclick="openClassSwitcher()"><i class="ti ti-plus"></i> إضافة فصل</button>
    </div>`;
  }

  // Load data for each class
  const classData = classes.map(c=>{
    try{
      const raw = localStorage.getItem(getClassStorageKey(c.id));
      if(!raw) return { ...c, students:[], subjects:[], evals:{}, attendance:{} };
      const d = JSON.parse(raw);
      return { ...c, students:d.students||[], subjects:d.subjects||[], evals:d.evals||{}, attendance:d.attendance||{} };
    }catch(e){ return {...c, students:[], subjects:[], evals:{}, attendance:{}}; }
  });

  // Compute metrics per class
  const metrics = classData.map(c=>{
    const stuCount = c.students.length;
    if(!stuCount) return { ...c, avgMastery:0, topStudent:null, attRate:0, masteredSkills:0, totalSkills:0 };

    // Average mastery
    let totalM=0, totalT=0;
    c.students.forEach(s=>{
      c.subjects.forEach(sub=>{
        sub.sections?.forEach(sec=>{
          const ev=((c.evals[s.id]||{})[sub.id]||{})[sec.id]||{};
          totalM+=Object.values(ev).filter(v=>v==='m').length;
          totalT+=sec.skills?.length||0;
        });
      });
    });
    const avgMastery = totalT ? Math.round(totalM/c.students.length/totalT*100) : 0;
    const masteredSkills = totalT ? Math.round(totalM/c.students.length) : 0;

    // Top student
    const stuScores = c.students.map(s=>{
      let m=0,t=0;
      c.subjects.forEach(sub=>sub.sections?.forEach(sec=>{
        const ev=((c.evals[s.id]||{})[sub.id]||{})[sec.id]||{};
        m+=Object.values(ev).filter(v=>v==='m').length;
        t+=sec.skills?.length||0;
      }));
      return {s, pct:t?Math.round(m/t*100):0};
    }).sort((a,b)=>b.pct-a.pct);
    const topStudent = stuScores[0]?.s;
    const topPct = stuScores[0]?.pct||0;

    // Attendance rate (last 30 days)
    const today = new Date();
    let attP=0, attTotal=0;
    for(let i=0;i<30;i++){
      const d=new Date(today); d.setDate(d.getDate()-i);
      const key=d.toISOString().slice(0,10);
      const dayAtt=c.attendance[key];
      if(dayAtt && Object.keys(dayAtt).length){
        attP+=Object.values(dayAtt).filter(v=>v==='p').length;
        attTotal+=Object.keys(dayAtt).length;
      }
    }
    const attRate = attTotal ? Math.round(attP/attTotal*100) : 0;

    // Per-subject mastery
    const subjectMastery = c.subjects.map(sub=>{
      let m=0,t=0;
      c.students.forEach(s=>{
        sub.sections?.forEach(sec=>{
          const ev=((c.evals[s.id]||{})[sub.id]||{})[sec.id]||{};
          m+=Object.values(ev).filter(v=>v==='m').length;
          t+=sec.skills?.length||0;
        });
      });
      return {name:sub.name, icon:sub.icon||'📚', pct:t?Math.round(m/c.students.length/t*100):0};
    });

    return {...c, avgMastery, masteredSkills, totalSkills:totalT, topStudent, topPct, attRate, subjectMastery, stuCount};
  });

  // Find best class per metric
  const bestMastery = metrics.reduce((a,b)=>b.avgMastery>a.avgMastery?b:a, metrics[0]);
  const bestAtt     = metrics.reduce((a,b)=>b.attRate>a.attRate?b:a, metrics[0]);

  // All subjects union
  const allSubNames = [...new Set(metrics.flatMap(m=>m.subjectMastery.map(s=>s.name)))];

  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active"><i class="ti ti-chart-bar"></i> مقارنة الفصول</span></div>
  <div class="ph">
    <div><div class="ph-title"><i class="ti ti-chart-bar"></i> مقارنة الفصول</div>
    <div class="ph-sub">مقارنة ${classes.length} فصول — الإتقان والحضور والتقدم</div></div>
    <div class="ph-actions" style="margin-top:6px;">
      <button class="btn btn-primary btn-sm no-print" onclick="window.print()"><i class="ti ti-printer"></i> طباعة مقارنة الفصول</button>
    </div>
  </div>

  <!-- Overview cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-bottom:24px;">
    ${metrics.map((m,i)=>{
      const colors = ['var(--sky)','var(--mint)','var(--gold)','var(--plum)','var(--ember)'];
      const col = colors[i%colors.length];
      const isBestM = m.id===bestMastery.id;
      const isBestA = m.id===bestAtt.id;
      return `<div class="card" style="border-top:3px solid ${col};position:relative;">
        ${isBestM?`<div style="position:absolute;top:10px;left:10px;background:${col};color:white;font-size:0.68rem;font-weight:900;padding:2px 8px;border-radius:99px;"><i class="ti ti-trophy"></i> الأعلى إتقاناً</div>`:''}
        <div class="card-body" style="padding-top:${isBestM?'30px':'14px'}">
          <div style="font-size:1rem;font-weight:900;color:var(--ink2);margin-bottom:2px;">${m.name}</div>
          <div style="font-size:0.78rem;color:var(--muted);margin-bottom:14px;">${m.note||''} · ${m.stuCount} طالب</div>

          <!-- Mastery bar -->
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-weight:700;color:var(--muted);margin-bottom:4px;">
              <span><i class="ti ti-star"></i> متوسط الإتقان</span><span style="color:${col};font-size:0.92rem;">${m.avgMastery}%</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${m.avgMastery}%;background:${col};border-radius:99px;transition:width 0.8s ease;"></div>
            </div>
          </div>

          <!-- Attendance bar -->
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;font-weight:700;color:var(--muted);margin-bottom:4px;">
              <span><i class="ti ti-clipboard-check"></i> نسبة الحضور</span><span>${m.attRate}%</span>
            </div>
            <div style="height:8px;background:var(--border);border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${m.attRate}%;background:var(--mint);border-radius:99px;"></div>
            </div>
          </div>

          <!-- Top student -->
          ${m.topStudent ? `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border-radius:10px;border:1px solid var(--border);">
            <span style="font-size:1rem"><i class="ti ti-medal"></i></span>
            <div>
              <div style="font-size:0.80rem;font-weight:800;color:var(--ink2);">${m.topStudent.name.split(' ').slice(0,2).join(' ')}</div>
              <div style="font-size:0.72rem;color:var(--muted);">الأعلى إتقاناً — ${m.topPct}%</div>
            </div>
          </div>` : '<div style="font-size:0.78rem;color:var(--muted2);">لا يوجد بيانات تقييم</div>'}
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- Subject comparison table -->
  ${allSubNames.length ? `
  <div class="card">
    <div class="card-header"><h3><i class="ti ti-books"></i> مقارنة المواد</h3></div>
    <div class="card-body" style="padding:0;">
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>المادة</th>
          ${metrics.map(m=>`<th style="text-align:center;">${m.name}</th>`).join('')}
          <th style="text-align:center;">الأفضل</th>
        </tr></thead>
        <tbody>
        ${allSubNames.map(subName=>{
          const vals = metrics.map(m=>{
            const sub = m.subjectMastery?.find(s=>s.name===subName);
            return sub?.pct||0;
          });
          const maxVal = Math.max(...vals);
          const subIcon = metrics.flatMap(m=>m.subjectMastery).find(s=>s.name===subName)?.icon||'📚';
          const bestIdx = vals.indexOf(maxVal);
          return `<tr>
            <td><span style="font-weight:700;">${subIcon} ${subName}</span></td>
            ${vals.map((v,i)=>`<td style="text-align:center;">
              <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                <span style="font-weight:900;color:${v===maxVal&&maxVal>0?'var(--sky)':'var(--ink2)'};">${v}%</span>
                <div style="width:50px;height:5px;background:var(--border);border-radius:99px;overflow:hidden;">
                  <div style="height:100%;width:${v}%;background:${v===maxVal&&maxVal>0?'var(--sky)':'var(--muted2)'};border-radius:99px;"></div>
                </div>
              </div>
            </td>`).join('')}
            <td style="text-align:center;font-weight:800;color:var(--sky);">${maxVal>0?metrics[bestIdx]?.name:'—'}</td>
          </tr>`;
        }).join('')}
        </tbody>
      </table></div>
    </div>
  </div>` : ''}

  <!-- Summary insight -->
  <div class="note-card" style="margin-top:16px;">
    <span class="note-icon"><i class="ti ti-bulb"></i></span>
    <div>
      <strong>أبرز الملاحظات:</strong><br>
      ${bestMastery.avgMastery>0?`🏆 <strong>${bestMastery.name}</strong> الأعلى إتقاناً بمتوسط ${bestMastery.avgMastery}%. `:''}
      ${bestAtt.attRate>0?`✅ <strong>${bestAtt.name}</strong> الأفضل حضوراً بنسبة ${bestAtt.attRate}%.`:''}
      ${metrics.every(m=>m.avgMastery===0)?'لا يوجد بيانات تقييم بعد في أي فصل.':''}
    </div>
  </div>`;
}
