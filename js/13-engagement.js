// ══════════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// 🎵 SOUND ENGINE — Web Audio API
// ══════════════════════════════════════════════
const SFX = {
  _ctx: null,
  _enabled: localStorage.getItem('bs_sfx') !== 'off',
  _unlocked: false,

  ctx(){
    if(!this._ctx) this._ctx = new (window.AudioContext||window.webkitAudioContext)();
    // Resume if suspended (browser autoplay policy)
    if(this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  },

  // Call once on first user interaction to unlock audio
  unlock(){
    if(this._unlocked) return;
    try{
      const ctx = this.ctx();
      const buf = ctx.createBuffer(1,1,22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      this._unlocked = true;
    }catch(e){}
  },

  play(type){
    if(!this._enabled) return;
    try{
      const ctx = this.ctx();
      if(ctx.state === 'suspended'){ ctx.resume().then(()=>this._playNow(type,ctx)); return; }
      this._playNow(type, ctx);
    } catch(e){}
  },

  _playNow(type, ctx){
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const sounds = {
      correct: ()=>{ this._tone(ctx,g,523,0,0.10); this._tone(ctx,g,659,0.12,0.10); this._tone(ctx,g,784,0.24,0.18); },
      wrong:   ()=>{ this._tone(ctx,g,300,0,0.10,{type:'sawtooth'}); this._tone(ctx,g,220,0.12,0.18,{type:'sawtooth'}); },
      confetti:()=>{ [523,659,784,1047].forEach((f,i)=>this._tone(ctx,g,f,i*0.08,0.12)); },
      point:   ()=>{ this._tone(ctx,g,880,0,0.06); this._tone(ctx,g,1100,0.08,0.12); },
      reveal:  ()=>{ this._tone(ctx,g,440,0,0.08); this._tone(ctx,g,554,0.10,0.14); },
      pass:    ()=>{ this._tone(ctx,g,350,0,0.08,{type:'triangle'}); this._tone(ctx,g,300,0.10,0.10,{type:'triangle'}); },
      tick:    ()=>{ this._tone(ctx,g,800,0,0.04,{type:'square'}); },
      finish:  ()=>{ [523,659,784,1047,1319].forEach((f,i)=>this._tone(ctx,g,f,i*0.09,0.14)); },
    };
    sounds[type]?.();
  },

  _tone(ctx, g, freq, delay, dur, opts={}){
    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.type = opts.type || 'sine';
    o.frequency.value = freq;
    o.connect(og); og.connect(g);
    const t = ctx.currentTime + delay;
    og.gain.setValueAtTime(0.35, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  },

  toggle(){
    this._enabled = !this._enabled;
    localStorage.setItem('bs_sfx', this._enabled?'on':'off');
    const btn = document.getElementById('sfxToggle');
    if(btn){ btn.textContent = this._enabled?'🔊':'🔇'; btn.style.opacity = this._enabled?'1':'0.45'; }
    if(this._enabled) this.play('tick'); // test sound
  }
};

// Unlock audio on first click anywhere
document.addEventListener('click', ()=>SFX.unlock(), {once:true});
document.addEventListener('touchstart', ()=>SFX.unlock(), {once:true});

function confetti(){
  const colors=['#10b981','#f59e0b','#1565c0','#7c3aed','#ef4444','#fbbf24'];
  for(let i=0;i<40;i++){
    setTimeout(()=>{
      const el=document.createElement('div');
      el.className='confetti-piece';
      el.style.cssText=`left:${Math.random()*100}vw;top:${Math.random()*40}vh;background:${colors[Math.floor(Math.random()*colors.length)]};transform:rotate(${Math.random()*360}deg);`;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),1400);
    },i*30);
  }
}

// ═══════════════════════════════════���══════════
// SEAT MAP
// ══════════════════════════════════════════════
const SEAT_ROWS=5, SEAT_COLS=6;
function initSeatLayout(){
  if(!S.seatLayout.length){
    S.seatLayout=Array.from({length:SEAT_ROWS},()=>Array(SEAT_COLS).fill(null));
    S.students.forEach((s,i)=>{
      const r=Math.floor(i/SEAT_COLS), c=i%SEAT_COLS;
      if(r<SEAT_ROWS) S.seatLayout[r][c]=s.id;
    });
    save();
  }
}
function renderSeatMap(){
  initSeatLayout();
  const td=today(), todayAtt=S.attendance[td]||{};
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">خريطة المقاعد</span></div>
  <div class="ph">
    <div><div class="ph-title">🪑 خريطة مقاعد الفصل</div>
    <div class="ph-sub">اضغط على أي مقعد لتغيير الطالب · الألوان تعكس حضور اليوم</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="autoArrangeSeatMap()">🔀 ترتيب تلقائي</button>
      <button class="btn btn-ghost" onclick="clearSeatMap()">🗑️ مسح الكل</button>
    </div>
  </div>

  <div class="note-card" style="margin-bottom:16px;">
    <span class="note-icon">🖊️</span>
    <div>اضغط على مقعد لتعيين طالب أو تبديله. استخدم الترتيب التلقائي لتوزيع الطلاب حسب المستوى.</div>
  </div>

  <!-- Board label -->
  <div style="text-align:center;margin-bottom:14px;">
    <div style="display:inline-block;background:linear-gradient(135deg,var(--ink2),var(--sky));color:white;padding:10px 60px;border-radius:10px;font-weight:800;font-size:0.95rem;box-shadow:var(--shadow);">
      🖥️ السبورة
    </div>
  </div>

  <div class="seat-grid" style="grid-template-columns:repeat(${SEAT_COLS},1fr);max-width:900px;margin:0 auto;">
    ${S.seatLayout.map((row,r)=>row.map((sid,c)=>{
      const s=sid?S.students.find(x=>x.id===sid):null;
      const att=sid?(todayAtt[sid]||''):null;
      const m=s?studentMastery(s.id):null;
      const attClass=att==='p'?'present':att==='a'?'absent':'';
      if(!s) return `<div class="seat-cell empty" onclick="assignSeat(${r},${c})">
        <div style="font-size:22px;opacity:0.25">🪑</div>
        <div style="font-size:0.68rem;color:var(--muted2)">فارغ</div>
      </div>`;
      return `<div class="seat-cell ${attClass}" onclick="assignSeat(${r},${c})" title="${s.name}">
        ${s.photo?`<img src="${s.photo}" class="seat-avatar stu-photo" style="width:34px;height:34px;" />`:`<div class="seat-avatar" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>`}
        <div class="seat-name">${s.name.split(' ').slice(0,2).join(' ')}</div>
        <div class="seat-pct" style="color:${m.total>=70?'var(--mint)':m.total>=40?'var(--gold)':'var(--ember)'}">${m.total}%</div>
      </div>`;
    }).join('')).join('')}
  </div>

  <div class="seat-legend" style="margin-top:20px;justify-content:center;">
    <span><div class="dot" style="background:rgba(16,185,129,0.5)"></div> حاضر</span>
    <span><div class="dot" style="background:rgba(239,68,68,0.5)"></div> غائب</span>
    <span><div class="dot" style="background:var(--border)"></div> فارغ / لم يُسجَّل</span>
  </div>`;
}
function assignSeat(r,c){
  const unplaced=S.students.filter(s=>!S.seatLayout.flat().includes(s.id));
  const cur=S.seatLayout[r][c];
  const opts=[{id:null,name:'(فارغ)'},...S.students];
  const names=opts.map(s=>s.name||s.id);
  const curIdx=opts.findIndex(s=>s.id===cur);
  const choice=prompt(`اختر طالباً للمقعد (${r+1},${c+1}):\n${names.map((n,i)=>`${i}: ${n}`).join('\n')}`,curIdx>=0?curIdx:0);
  if(choice===null) return;
  const chosen=opts[parseInt(choice)];
  if(!chosen) return;
  // Remove student from previous seat if exists
  if(chosen.id){
    for(let rr=0;rr<SEAT_ROWS;rr++) for(let cc=0;cc<SEAT_COLS;cc++)
      if(S.seatLayout[rr][cc]===chosen.id) S.seatLayout[rr][cc]=null;
  }
  S.seatLayout[r][c]=chosen.id;
  save(); showPage('seatmap');
}
function autoArrangeSeatMap(){
  const sorted=[...S.students].sort((a,b)=>studentMastery(b.id).total-studentMastery(a.id).total);
  S.seatLayout=Array.from({length:SEAT_ROWS},()=>Array(SEAT_COLS).fill(null));
  sorted.forEach((s,i)=>{
    const r=Math.floor(i/SEAT_COLS), c=i%SEAT_COLS;
    if(r<SEAT_ROWS) S.seatLayout[r][c]=s.id;
  });
  save(); showPage('seatmap');
  toast('تم الترتيب التلقائي حسب المستوى ✅','success');
}
function clearSeatMap(){
  if(!confirm('مسح خريطة المقاعد؟')) return;
  S.seatLayout=[];
  save(); showPage('seatmap');
}

// ══════════════════════════════════════════════
// BEHAVIOR TRACKER
// ══════════════════════════════════════════════
const BEH_POS_TAGS=['مشارك','مجتهد','منضبط','متعاون','قيادي','إبداعي'];
const BEH_NEG_TAGS=['غير منتبه','مشاغب','لا يكمل الواجب','كثير الكلام'];
const BEH_NEU_TAGS=['هادئ','يحتاج تشجيع','خجول'];

function renderBehavior(){
  const td=today();
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">تقييم السلوك</span></div>
  <div class="ph">
    <div><div class="ph-title">⭐ تقييم السلوك والمشاركة</div>
    <div class="ph-sub">التاريخ: ${fmtDate(td)} · اضغط النجوم وحدد الصفات</div></div>
    <div class="ph-actions">
      <button class="btn btn-gold" onclick="printBehaviorReport()">📄 تقرير سلوكي</button>
    </div>
  </div>
  <div class="beh-grid">
    ${S.students.map(s=>{
      const rec=(S.behavior[s.id]||{})[td]||{stars:0,tags:[]};
      return `<div class="beh-card" id="bc_${s.id}">
        <div class="beh-header">
          <div class="avatar av-40" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>
          <div style="flex:1">
            <div style="font-weight:800;color:var(--ink2)">${s.name}</div>
            <div style="font-size:0.75rem;color:var(--muted)">النجوم: ${rec.stars}/5</div>
          </div>
        </div>
        <div class="beh-stars">
          ${[1,2,3,4,5].map(n=>`<span class="beh-star ${rec.stars>=n?'on':''}" onclick="setStar('${s.id}',${n})">★</span>`).join('')}
        </div>
        <div class="beh-tags">
          ${BEH_POS_TAGS.map(t=>`<span class="beh-tag pos ${rec.tags.includes(t)?'on':''}" onclick="toggleTag('${s.id}','${t}')">${t}</span>`).join('')}
          ${BEH_NEG_TAGS.map(t=>`<span class="beh-tag neg ${rec.tags.includes(t)?'on':''}" onclick="toggleTag('${s.id}','${t}')">${t}</span>`).join('')}
          ${BEH_NEU_TAGS.map(t=>`<span class="beh-tag neu ${rec.tags.includes(t)?'on':''}" onclick="toggleTag('${s.id}','${t}')">${t}</span>`).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}
function setStar(sid,n){
  const td=today();
  if(!S.behavior[sid]) S.behavior[sid]={};
  if(!S.behavior[sid][td]) S.behavior[sid][td]={stars:0,tags:[]};
  S.behavior[sid][td].stars=S.behavior[sid][td].stars===n?0:n;
  save();
  const card=document.getElementById('bc_'+sid);
  if(!card) return;
  const stars=card.querySelectorAll('.beh-star');
  const cur=S.behavior[sid][td].stars;
  stars.forEach((s,i)=>s.classList.toggle('on',i<cur));
  card.querySelector('.beh-header div div:last-child').textContent=`النجوم: ${cur}/5`;
}
function toggleTag(sid,tag){
  const td=today();
  if(!S.behavior[sid]) S.behavior[sid]={};
  if(!S.behavior[sid][td]) S.behavior[sid][td]={stars:0,tags:[]};
  const tags=S.behavior[sid][td].tags;
  const idx=tags.indexOf(tag);
  if(idx>=0) tags.splice(idx,1); else tags.push(tag);
  save();
  const card=document.getElementById('bc_'+sid);
  if(!card) return;
  card.querySelectorAll('.beh-tag').forEach(el=>{
    if(el.textContent===tag) el.classList.toggle('on',tags.includes(tag));
  });
}
function printBehaviorReport(){
  choosePdfTemplate(tpl => _printBehaviorReportWithTemplate(tpl));
}
function _printBehaviorReportWithTemplate(tpl){
  const td=today();
  const isKids = tpl === 'kids';
  let rows='';
  S.students.forEach((s,i)=>{
    const rec=(S.behavior[s.id]||{})[td]||{stars:0,tags:[]};
    const stars='★'.repeat(rec.stars)+'☆'.repeat(5-rec.stars);
    const rowBg = isKids
      ? (i%2 ? '#fff9f0' : '#ffffff')
      : (i%2 ? '#f8faff' : 'white');
    rows+=`<tr style="background:${rowBg}">
      <td>${i+1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          ${s.photo
            ?`<img src="${s.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid ${isKids?'#fbbf24':'#e2e8f8'};" />`
            :`<div style="width:32px;height:32px;border-radius:50%;background:${isKids?`linear-gradient(135deg,#f97316,#ec4899)`:`linear-gradient(135deg,#1e3a5f,#1565c0)`};color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;">${s.name.charAt(0)}</div>`
          }
          <strong>${s.name}</strong>
        </div>
      </td>
      <td style="font-size:1.1em;letter-spacing:2px;color:#f59e0b">${stars}</td>
      <td>${rec.tags.join(' · ')||'—'}</td>
    </tr>`;
  });

  const headerBg = isKids ? 'linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)' : 'linear-gradient(135deg,#1e3a5f,#1565c0)';
  const thBg     = isKids ? '#f97316' : '#1e3a5f';
  const titleClr = isKids ? '#ec4899' : '#1e3a5f';
  const extraStyle = isKids ? `
    body{background:#fffbf5}
    h1{background:${headerBg};-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:1.6em}
    .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:.75em;font-weight:900}
    .kids-header{background:${headerBg};border-radius:16px;padding:14px 20px;margin-bottom:16px;color:white;text-align:center}
    .kids-header h1{-webkit-text-fill-color:white;font-size:1.4em;margin:0}
    .kids-header p{opacity:.85;margin:4px 0 0;font-size:.85em}
  ` : '';

  const html=`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Tajawal',sans-serif;direction:rtl;padding:20px}
  @media print{.no-print{display:none}}
  .no-print{margin-bottom:14px}
  .pbtn{padding:9px 18px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-size:.9em;font-weight:800;cursor:pointer;background:${headerBg};color:white}
  h1{color:${titleClr};margin-bottom:6px}p{color:#64748b;margin-bottom:14px;font-size:.9em}
  table{width:100%;border-collapse:collapse;border-radius:${isKids?'12px':'4px'};overflow:hidden}
  th{background:${thBg};color:white;padding:9px 12px;text-align:right;font-size:.85em}
  td{padding:8px 12px;border-bottom:1px solid ${isKids?'#fde68a':'#e2e8f8'};font-size:.9em}
  ${extraStyle}
  </style></head><body>
  <div class="no-print"><button class="pbtn" onclick="window.print()">🖨️ طباعة</button></div>
  ${isKids
    ? `<div class="kids-header"><h1>⭐ تقرير سلوك الطلاب 🌟</h1><p>مدارس البشرى الأهلية · المعلم: ${fullName()} · ${fmtDate(td)}</p></div>`
    : `<h1>⭐ تقرير سلوك الطلاب</h1><p>مدارس البشرى الأهلية · المعلم: ${fullName()} · ${fmtDate(td)}</p>`
  }
  <table><thead><tr><th>#</th><th>الطالب</th><th>النجوم</th><th>الصفات الملاحظة</th></tr></thead>
  <tbody>${rows}</tbody></table>
  ${isKids ? '<div style="text-align:center;margin-top:16px;font-size:1.4em;">🌈 ⭐ 🎉 🌟 🏆</div>' : ''}
  </body></html>`;
  const w=window.open('','_blank','width=800,height=600');
  if(!w) return;

  let finalHtml = html;
  if(tpl === 'teacher'){
    const tPhoto = S.teacher.photo||'';
    const tName  = fullName();
    finalHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Tajawal',sans-serif;direction:rtl;background:#f8faff;padding:0;}
  @media print{.np{display:none}body{background:white}}
  .np{display:flex;gap:10px;padding:12px;background:white;border-bottom:1px solid #e2e8f8;}
  .pb{padding:9px 18px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;font-size:.88em;}
  .pb2{padding:9px 18px;border-radius:9px;border:1px solid #e2e8f8;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:#f1f5f9;color:#475569;font-size:.88em;}
  .hdr{background:linear-gradient(135deg,#0f172a,#1e3a5f,#312e81);padding:16px 22px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .hdr-left{display:flex;align-items:center;gap:10px;}
  .hdr-logo{width:44px;height:44px;object-fit:contain;background:white;border-radius:10px;padding:4px;}
  .hdr-title{color:white;font-size:1.05em;font-weight:900;}.hdr-sub{color:rgba(255,255,255,0.5);font-size:.75em;margin-top:2px;}
  .t-card{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:7px 12px;}
  .t-photo{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.3);background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;flex-shrink:0;}
  .t-name{color:white;font-size:.80em;font-weight:800;}.t-role{color:rgba(255,255,255,0.45);font-size:.68em;}
  .body{padding:0 16px 16px;}
  table{width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);}
  th{background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;padding:9px 12px;text-align:right;font-size:.85em;font-weight:800;}
  td{padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:.9em;}
  tr:last-child td{border-bottom:none;}tr:nth-child(even) td{background:#f8faff;}
  .sig{display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:14px;border-top:1px solid #e2e8f8;}
  .sig-photo{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f8;background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;flex-shrink:0;}
  .sig-line{flex:1;border-top:1.5px dashed #e2e8f8;}
  .sig-lbl{font-size:.68em;color:#94a3b8;font-weight:700;}.sig-val{font-size:.82em;font-weight:900;color:#1e3a5f;}
</style></head><body>
<div class="np">
  <button class="pb" onclick="window.print()">🖨️ طباعة</button>
  <button class="pb2" onclick="window.close()">✕ إغلاق</button>
</div>
<div class="hdr">
  <div class="hdr-left">
    <img src="${SCHOOL_LOGO}" class="hdr-logo"/>
    <div><div class="hdr-title">⭐ تقرير سلوك الطلاب</div><div class="hdr-sub">مدارس البشرى الأهلية · ${fmtDate(td)}</div></div>
  </div>
  <div class="t-card">
    ${tPhoto?`<img src="${tPhoto}" class="t-photo" style="width:38px;height:38px;border-radius:50%;object-fit:cover;"/>`:`<div class="t-photo">${tName.charAt(0)||'م'}</div>`}
    <div><div class="t-name">${tName}</div><div class="t-role">معلم الفصل</div></div>
  </div>
</div>
<div class="body">
<table><thead><tr><th>#</th><th>الطالب</th><th>النجوم</th><th>الصفات الملاحظة</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="sig">
  ${tPhoto?`<img src="${tPhoto}" class="sig-photo" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"/>`:`<div class="sig-photo">${tName.charAt(0)||'م'}</div>`}
  <div><div class="sig-lbl">توقيع المعلم</div><div class="sig-val">${tName}</div></div>
  <div class="sig-line"></div>
  <div style="text-align:center"><div class="sig-lbl">التاريخ</div><div class="sig-val">${fmtDate(td)}</div></div>
</div>
</div>
</body></html>`;
  }

  w.document.write(finalHtml); w.document.close();
}

// ══════════════════════════════════════════════
// GOALS / IEP
// ══════════════════════════════════════════════
let goalTargetSid=null;
function renderGoals(){
  const pending=S.goals.filter(g=>!g.done).length;
  const done=S.goals.filter(g=>g.done).length;
  const today_=today();
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">الأهداف والخطط</span></div>
  <div class="ph">
    <div><div class="ph-title">🎯 الأهداف والخطط التعليمية الفردية</div>
    <div class="ph-sub">${pending} هدف قيد التنفيذ · ${done} مكتمل</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="openGoalFor(null)">➕ هد�� جديد</button>
    </div>
  </div>
  ${S.students.length===0?`<div class="empty"><div class="empty-emoji">🎯</div><h3>لا يوجد طلاب</h3></div>`:`
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
    ${S.students.map(s=>{
      const sGoals=S.goals.filter(g=>g.sid===s.id||g.sid===null).slice(0,6);
      const studentGoals=S.goals.filter(g=>g.sid===s.id);
      if(!studentGoals.length&&!S.goals.filter(g=>g.sid===null).length) return `
        <div class="card" style="padding:18px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div class="avatar av-40" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>
            <div><div style="font-weight:800;color:var(--ink2)">${s.name}</div><div style="font-size:0.75rem;color:var(--muted)">لا توجد أهداف بعد</div></div>
          </div>
          <button class="btn btn-ghost btn-sm" style="width:100%" onclick="openGoalFor('${s.id}')">➕ إضافة هدف</button>
        </div>`;
      return `
        <div class="card" style="padding:18px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
            <div class="avatar av-40" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>
            <div style="flex:1"><div style="font-weight:800;color:var(--ink2)">${s.name}</div>
            <div style="font-size:0.75rem;color:var(--muted)">${studentGoals.filter(g=>!g.done).length} هدف متبقٍ · ${studentGoals.filter(g=>g.done).length} مكتمل</div></div>
            <button class="btn btn-xs btn-primary" onclick="openGoalFor('${s.id}')">➕</button>
          </div>
          ${studentGoals.slice(0,4).map(g=>{
            const daysLeft=g.deadline?Math.ceil((new Date(g.deadline)-new Date())/86400000):null;
            const deadlineClass=daysLeft!==null?(daysLeft<0?'overdue':daysLeft<=3?'soon':''):'';
            return `<div class="goal-item">
              <div class="goal-check ${g.done?'done':''}" onclick="toggleGoal('${g.id}')">${g.done?'✓':''}</div>
              <div style="flex:1">
                <div class="goal-text ${g.done?'done':''}">${g.text}</div>
                <div class="goal-meta">
                  ${g.deadline?`<span class="goal-deadline ${deadlineClass}">${daysLeft<0?'⚠️ متأخر':daysLeft===0?'⏰ اليوم':daysLeft<=3?`⚡ ${daysLeft} أيام`:g.deadline}</span>`:''}
                  ${g.strategy?`<span style="margin-right:8px">📌 ${g.strategy.substring(0,30)}...</span>`:''}
                </div>
              </div>
              <button class="btn btn-xs btn-red" onclick="deleteGoal('${g.id}')">×</button>
            </div>`;
          }).join('')}
          ${studentGoals.length>4?`<div style="font-size:0.78rem;color:var(--muted);text-align:center;padding:6px">+${studentGoals.length-4} أهداف أخرى</div>`:''}
        </div>`;
    }).join('')}
  </div>`}`;
}
function openGoalFor(sid){
  goalTargetSid=sid;
  const s=sid?S.students.find(x=>x.id===sid):null;
  document.getElementById('goalSub').textContent=s?`الطالب: ${s.name}`:'هدف عام للفصل';
  document.getElementById('goalText').value='';
  document.getElementById('goalDeadline').value='';
  document.getElementById('goalStrategy').value='';
  openM('mbGoal');
}
function saveGoal(){
  const text=document.getElementById('goalText').value.trim();
  if(!text){toast('اكتب نص الهدف','error');return;}
  const goal={
    id:genId(), sid:goalTargetSid,
    text, deadline:document.getElementById('goalDeadline').value,
    prio:document.getElementById('goalPrio').value,
    strategy:document.getElementById('goalStrategy').value.trim(),
    done:false, createdAt:today()
  };
  S.goals.push(goal);
  save();
  logChange('add','إضافة هدف',text.substring(0,40));
  const nb=document.getElementById('nb-goals');
  if(nb) nb.textContent=S.goals.filter(g=>!g.done).length;
  closeM('mbGoal');
  toast('تم حفظ الهدف 🎯','success');
  showPage('goals');
}
function toggleGoal(id){
  const g=S.goals.find(x=>x.id===id);
  if(!g) return;
  g.done=!g.done;
  save();
  if(g.done) confetti();
  showPage('goals');
}
function deleteGoal(id){
  if(!confirm('حذف هذا الهدف؟')) return;
  S.goals=S.goals.filter(x=>x.id!==id);
  save(); showPage('goals');
}

// ══════════════════════════════════════════════
// GRADE BOOK
// ══════════════════════════════════════════════
function renderGradeBook(){
  if(!S.grades.columns) S.grades={columns:[],rows:{}};
  if(!S.grades.columns.length){
    S.grades.columns=[
      {id:'g1',name:'الاختبار الأول',max:10},
      {id:'g2',name:'الواجب اليومي',max:5},
      {id:'g3',name:'المشاركة',max:5},
    ];
    save();
  }
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">دفتر الدرجات</span></div>
  <div class="ph">
    <div><div class="ph-title">📒 دفتر الدرجات</div>
    <div class="ph-sub">تتبع درجات الطلاب في الاختبارات والواجبات</div></div>
    <div class="ph-actions">
      <button class="btn btn-gold" onclick="addGradeColumn()">➕ اختبار / واجب</button>
      <button class="btn btn-primary" onclick="printGradeBook()">🖨️ طباعة</button>
    </div>
  </div>
  <div class="card">
    <div class="tbl-wrap">
      <table class="tbl gb-table">
        <thead>
          <tr>
            <th>#</th>
            <th style="min-width:140px">الطالب</th>
            ${S.grades.columns.map(col=>`
              <th style="text-align:center;min-width:110px">
                ${col.name}<br>
                <small style="font-weight:400;opacity:0.75">من ${col.max}</small>
                <button onclick="deleteGradeCol('${col.id}')" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:none;font-size:12px;padding:0 3px;margin-right:4px">×</button>
              </th>`).join('')}
            <th style="text-align:center;min-width:80px">المجموع</th>
            <th style="text-align:center;min-width:70px">%</th>
          </tr>
        </thead>
        <tbody>
          ${S.students.map((s,i)=>{
            const row=S.grades.rows[s.id]||{};
            const total=S.grades.columns.reduce((sum,col)=>{
              const v=parseFloat(row[col.id]);
              return sum+(isNaN(v)?0:v);
            },0);
            const maxTotal=S.grades.columns.reduce((sum,col)=>sum+col.max,0);
            const pct=maxTotal?Math.round((total/maxTotal)*100):0;
            return `<tr>
              <td><span class="rank-circ">${i+1}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div class="avatar av-32" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>
                  <span style="font-weight:700">${s.name}</span>
                </div>
              </td>
              ${S.grades.columns.map(col=>{
                const v=row[col.id]!==undefined?row[col.id]:'';
                const num=parseFloat(v);
                const cls=isNaN(num)?'':(num/col.max>=0.7?'high':num/col.max>=0.4?'mid':'low');
                return `<td style="text-align:center"><input type="number" class="gb-cell-input ${cls}" min="0" max="${col.max}" step="0.5" value="${v}" placeholder="—" onchange="setGrade('${s.id}','${col.id}',this.value)" oninput="colorGradeCell(this,${col.max})" /></td>`;
              }).join('')}
              <td style="text-align:center"><span class="gb-avg" style="color:${pct>=70?'var(--mint)':pct>=40?'var(--gold)':'var(--ember)'}">${total.toFixed(1)}</span></td>
              <td style="text-align:center"><span class="badge badge-${masteryColor(pct)}">${pct}%</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
function colorGradeCell(el,max){
  const v=parseFloat(el.value);
  el.classList.remove('high','mid','low');
  if(!isNaN(v)) el.classList.add(v/max>=0.7?'high':v/max>=0.4?'mid':'low');
}
function setGrade(sid,colId,val){
  if(!S.grades.rows[sid]) S.grades.rows[sid]={};
  S.grades.rows[sid][colId]=val===''?undefined:parseFloat(val);
  save();
}
function addGradeColumn(){
  const name=prompt('اسم الاختبار / الواجب:','');
  if(!name||!name.trim()) return;
  const max=parseFloat(prompt('الدرجة الكاملة:','10')||10);
  S.grades.columns.push({id:'g'+Date.now(),name:name.trim(),max:isNaN(max)?10:max});
  save(); showPage('gradebook');
  toast('تمت الإضافة ✅','success');
}
function deleteGradeCol(id){
  if(!confirm('حذف هذا العمود؟')) return;
  S.grades.columns=S.grades.columns.filter(c=>c.id!==id);
  save(); showPage('gradebook');
}
function printGradeBook(){
  choosePdfTemplate(tpl => _printGradeBookWithTemplate(tpl));
}
function _printGradeBookWithTemplate(tpl){
  const isKids = tpl === 'kids';
  let cols='<th>#</th><th>الطالب</th>'+S.grades.columns.map(c=>`<th>${c.name} (${c.max})</th>`).join('')+'<th>المجموع</th><th>%</th>';
  let rows=S.students.map((s,i)=>{
    const row=S.grades.rows[s.id]||{};
    const total=S.grades.columns.reduce((sm,c)=>{const v=parseFloat(row[c.id]);return sm+(isNaN(v)?0:v);},0);
    const maxT=S.grades.columns.reduce((sm,c)=>sm+c.max,0);
    const pct=maxT?Math.round((total/maxT)*100):0;
    const clr=pct>=70?'#059669':pct>=40?'#1565c0':'#ef4444';
    if(isKids){
      const emoji = pct>=70?'🌟':pct>=40?'👍':'💪';
      const rowBg = i%2 ? 'rgba(251,191,36,0.08)' : 'rgba(52,211,153,0.06)';
      return `<tr style="background:${rowBg}"><td style="text-align:center;font-weight:900">${i+1}</td><td><strong>${s.name}</strong></td>${S.grades.columns.map(c=>`<td style="text-align:center">${row[c.id]!==undefined?row[c.id]:'—'}</td>`).join('')}<td style="text-align:center;font-weight:900;color:#1e3a5f">${total.toFixed(1)}</td><td style="text-align:center;color:${clr};font-weight:900">${pct}% ${emoji}</td></tr>`;
    }
    return `<tr style="background:${i%2?'#f8faff':'white'}"><td>${i+1}</td><td><strong>${s.name}</strong></td>${S.grades.columns.map(c=>`<td style="text-align:center">${row[c.id]!==undefined?row[c.id]:'—'}</td>`).join('')}<td style="text-align:center;font-weight:900">${total.toFixed(1)}</td><td style="text-align:center;color:${clr};font-weight:800">${pct}%</td></tr>`;
  }).join('');

  const html = isKids ? `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Tajawal',sans-serif;direction:rtl;padding:16px;background:#fffbf0}@page{size:A4 landscape}@media print{.np{display:none}}
  .np{margin-bottom:12px}.pb{padding:9px 18px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#f97316,#ec4899);color:white}
  .hdr{background:linear-gradient(135deg,#f97316,#ec4899,#8b5cf6);border-radius:16px;padding:16px 24px;color:white;margin-bottom:16px;display:flex;align-items:center;gap:14px}
  .hdr-title{font-size:1.3em;font-weight:900}.hdr-sub{font-size:0.85em;opacity:0.85;margin-top:2px}
  .stars{font-size:1.4em;letter-spacing:2px}
  table{width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.08)}
  th{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;padding:10px 12px;text-align:right;font-size:.85em;font-weight:800}
  td{padding:9px 12px;border-bottom:2px solid rgba(251,191,36,0.2);font-size:.9em}
  .footer{margin-top:14px;text-align:center;font-size:0.78em;color:#94a3b8}
  </style></head><body>
  <div class="np"><button class="pb" onclick="window.print()">🖨️ طباعة</button></div>
  <div class="hdr">
    <div class="stars">📒⭐🎉</div>
    <div><div class="hdr-title">دفتر الدرجات — مدارس البشرى الأهلية</div>
    <div class="hdr-sub">المعلم: ${fullName()} · ${today()} · 🌟 عظيم يا أبطال!</div></div>
  </div>
  <table><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>
  <div class="footer">🏫 مدارس البشرى الأهلية · بالتوفيق للجميع 🌟</div>
  </body></html>`
  : `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap" rel="stylesheet">
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Tajawal',sans-serif;direction:rtl;padding:14px}@page{size:A4 landscape}@media print{.np{display:none}}
  .np{margin-bottom:12px}.pb{padding:9px 18px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:white}
  h1{font-size:1.2em;color:#1e3a5f;margin-bottom:4px}p{color:#64748b;font-size:.85em;margin-bottom:12px}
  table{width:100%;border-collapse:collapse}th{background:#1e3a5f;color:white;padding:8px 10px;text-align:right;font-size:.82em}
  td{padding:7px 10px;border-bottom:1px solid #e2e8f8;font-size:.88em}
  </style></head><body>
  <div class="np"><button class="pb" onclick="window.print()">🖨️ طباعة</button></div>
  <h1>📒 دفتر الدرجات — مدارس البشرى الأهلية</h1>
  <p>المعلم: ${fullName()} · ${today()}</p>
  <table><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;

  const w=window.open('','_blank','width=1100,height=650');
  if(!w){toast('السماح بالنوافذ المنبثقة','error');return;}
  w.document.write(html); w.document.close();
}

// ══════════════════════════════════════════════
// WEEKLY PLANNER
// ══════════════════════════════════════════════
const DAYS_AR=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس'];
const PERIODS=['الحصة الأولى','الحصة الثانية','الحصة الثالثة','الحصة الرابعة','الحصة الخامسة','الحص�� السادسة'];
const PERIOD_TIMES=['7:30-8:10','8:15-8:55','9:00-9:40','9:55-10:35','10:40-11:20','11:25-12:05'];
function getWeekKey(){
  const d=new Date(); const day=d.getDay();
  const sun=new Date(d); sun.setDate(d.getDate()-(day===0?0:day));
  return sun.toISOString().split('T')[0];
}
let editDay=-1, editPeriod=-1;
function renderPlanner(){
  const wk=getWeekKey();
  if(!S.planner[wk]) S.planner[wk]={};
  const todayDay=new Date().getDay(); // 0=Sun
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">المخطط الأسبوعي</span></div>
  <div class="ph">
    <div><div class="ph-title">📅 المخطط الأسبوعي</div>
    <div class="ph-sub">أسبوع: ${fmtShort(wk)} · اضغط على أي حصة للتعديل</div></div>
    <div class="ph-actions">
      <button class="btn btn-ghost" onclick="clearWeekPlan()">↺ مسح الأسبوع</button>
    </div>
  </div>
  <div class="planner-grid">
    ${DAYS_AR.map((day,di)=>{
      const dayIdx=di; // 0=Sun
      const isToday=(di===0&&todayDay===0)||(di===1&&todayDay===1)||(di===2&&todayDay===2)||(di===3&&todayDay===3)||(di===4&&todayDay===4);
      return `<div class="planner-day">
        <div class="planner-day-hdr ${isToday?'today-hdr':''}">${day}${isToday?' 📍':''}</div>
        ${PERIODS.map((p,pi)=>{
          const cell=(S.planner[wk][di]||{})[pi]||{};
          return `<div class="planner-period" onclick="openPeriodEdit(${di},${pi})">
            <div class="pp-time">${PERIOD_TIMES[pi]}</div>
            ${cell.content?`<div class="pp-content">${cell.content}</div>`:`<div class="pp-empty">${p}</div>`}
            ${cell.notes?`<div style="font-size:0.68rem;color:var(--muted);margin-top:2px">📝 ${cell.notes.substring(0,30)}</div>`:''}
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}
  </div>`;
}
function openPeriodEdit(day,period){
  editDay=day; editPeriod=period;
  const wk=getWeekKey();
  const cell=(S.planner[wk]?.[day]||{})[period]||{};
  document.getElementById('periodSub').textContent=`${DAYS_AR[day]} — ${PERIODS[period]} (${PERIOD_TIMES[period]})`;
  document.getElementById('periodContent').value=cell.content||'';
  document.getElementById('periodNotes').value=cell.notes||'';
  openM('mbPeriod');
}
function savePeriod(){
  const wk=getWeekKey();
  if(!S.planner[wk]) S.planner[wk]={};
  if(!S.planner[wk][editDay]) S.planner[wk][editDay]={};
  S.planner[wk][editDay][editPeriod]={
    content:document.getElementById('periodContent').value.trim(),
    notes:document.getElementById('periodNotes').value.trim()
  };
  save(); closeM('mbPeriod'); showPage('planner');
  toast('تم حفظ الحصة ✅','success');
}
function clearWeekPlan(){
  if(!confirm('مسح خطة هذا الأسبوع؟')) return;
  const wk=getWeekKey();
  S.planner[wk]={};
  save(); showPage('planner');
}

// ══════════════════════════════════════════════
// PARENT MEETINGS LOG
// ════════════════════════════���═════════════════
const MEET_TYPES={physical:'🤝 حضوري',phone:'📞 هاتفي',whatsapp:'💬 واتساب',online:'📹 مرئي'};
let meetTargetSid=null;
function renderMeetings(){
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">لقاءات الأولياء</span></div>
  <div class="ph">
    <div><div class="ph-title">🤝 سجل لقاءات أولياء الأمور</div>
    <div class="ph-sub">${S.meetings.length} لقاء مسجّل</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="openMeetingFor(null)">➕ تسجيل لقاء</button>
    </div>
  </div>
  ${S.meetings.length===0?`<div class="empty"><div class="empty-emoji">🤝</div><h3>لا توجد لقاءات مسجلة بعد</h3><p>ابدأ بتسجيل أول لقاء مع ولي أمر</p></div>`:`
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
    ${[...S.meetings].reverse().map(m=>{
      const s=m.sid?S.students.find(x=>x.id===m.sid):null;
      return `<div class="meeting-card">
        <div class="meeting-hdr">
          <div style="display:flex;align-items:center;gap:9px">
            ${s?`<div class="avatar av-32" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>`:'<span style="font-size:20px">👤</span>'}
            <div>
              <div class="meeting-title">${s?s.name:'لقاء عام'}</div>
              <div style="font-size:0.75rem;color:var(--muted)">${MEET_TYPES[m.type]||m.type} · ${fmtShort(m.date)}</div>
            </div>
          </div>
          <button class="btn btn-xs btn-red" onclick="deleteMeeting('${m.id}')">🗑️</button>
        </div>
        <div class="meeting-body">${m.notes}</div>
        ${m.action?`<div class="meeting-footer"><span class="badge badge-green">✅ إجراء: ${m.action}</span></div>`:''}
      </div>`;
    }).join('')}
  </div>`}`;
}
function openMeetingFor(sid){
  meetTargetSid=sid;
  const s=sid?S.students.find(x=>x.id===sid):null;
  document.getElementById('meetingSub').textContent=s?`الطالب: ${s.name}`:'لقاء عام';
  document.getElementById('meetDate').value=today();
  document.getElementById('meetNotes').value='';
  document.getElementById('meetAction').value='';
  openM('mbMeeting');
}
function saveMeeting(){
  const notes=document.getElementById('meetNotes').value.trim();
  if(!notes){toast('اكتب ملخص اللقاء','error');return;}
  S.meetings.push({
    id:genId(), sid:meetTargetSid,
    date:document.getElementById('meetDate').value||today(),
    type:document.getElementById('meetType').value,
    notes, action:document.getElementById('meetAction').value.trim()
  });
  save();
  logChange('add','تسجيل لقاء ولي أمر',notes.substring(0,40));
  closeM('mbMeeting');
  toast('تم تسجيل اللقاء 🤝','success');
  showPage('meetings');
}
function deleteMeeting(id){
  if(!confirm('حذف هذا اللقاء؟')) return;
  S.meetings=S.meetings.filter(m=>m.id!==id);
  save(); showPage('meetings');
}
