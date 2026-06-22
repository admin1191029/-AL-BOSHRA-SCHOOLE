// ══════════════════════════════════════════════════════════════
// 🗺️ TREASURE MAP — خريطة الكنز
// ══════════════════════════════════════════════════════════════

let _tmSubId   = null;   // active subject id
let _tmSecId   = null;   // active section id
let _tmStuId   = null;   // selected student (null = class view)
let _tmView    = 'class'; // 'class' | 'student'
let _tmQuery   = '';     // search text
let _tmSort    = 'name'; // name | progress_desc | progress_asc

// Station icons per skill index (cycles)
const TM_ICONS = ['🌱','📝','🔤','🌊','⚡','🌙','🌟','🏔️','🦁','🐉','💎','🏆'];
const TM_BADGES_DEF = [
  {id:'first',   name:'الخطوة الأولى', icon:'👣', desc:'أتقن أول مهارة'},
  {id:'half',    name:'نصف الطريق',   icon:'🌗', desc:'أتقن نصف المهارات'},
  {id:'warrior', name:'المحارب',      icon:'⚔️', desc:'أتقن 75% من المهارات'},
  {id:'star',    name:'النجم',        icon:'🌟', desc:'أتقن جميع المهارات'},
  {id:'speed',   name:'السريع',       icon:'⚡', desc:'أتقن 5 مهارات متتالية'},
  {id:'reader',  name:'القارئ الماهر',icon:'📖', desc:'إتقان كامل في القراءة'},
  {id:'writer',  name:'الكاتب المبدع',icon:'✍️', desc:'إتقان كامل في الكتابة'},
];

function _tmGetSub(){ return S.subjects.find(s=>s.id===_tmSubId)||S.subjects[0]; }
function _tmGetSec(){
  const sub=_tmGetSub();
  if(!sub) return null;
  return sub.sections.find(s=>s.id===_tmSecId)||sub.sections[0];
}

// Calculate mastery for one student in one section
function _tmSecMastery(sid, subId, secId){
  const sec = S.subjects.find(s=>s.id===subId)?.sections.find(s=>s.id===secId);
  if(!sec) return {done:[], partial:[], total:0};
  const ev = ((S.evals[sid]||{})[subId]||{})[secId]||{};
  const done=[],partial=[];
  sec.skills.forEach((sk,i)=>{
    if(ev[i]==='m') done.push(i);
    else if(ev[i]==='n') partial.push(i);
  });
  return {done, partial, total:sec.skills.length,
    pct: Math.round((done.length/sec.skills.length)*100)};
}

// Compute earned badges for a student in a section
function _tmBadges(sid, subId, secId){
  const m = _tmSecMastery(sid, subId, secId);
  const earned=[];
  if(m.done.length>=1) earned.push('first');
  if(m.done.length>=Math.floor(m.total/2)) earned.push('half');
  if(m.pct>=75) earned.push('warrior');
  if(m.pct===100) earned.push('star');
  // Speed: 5 consecutive
  let consec=0, maxConsec=0;
  for(let i=0;i<m.total;i++){
    if(m.done.includes(i)){consec++;maxConsec=Math.max(maxConsec,consec);}
    else consec=0;
  }
  if(maxConsec>=5) earned.push('speed');
  // Subject-level badges
  const sub=S.subjects.find(s=>s.id===subId);
  if(sub){
    const sec0=sub.sections[0];
    const sec1=sub.sections[1];
    if(sec0 && secId===sec0.id && m.pct===100) earned.push('reader');
    if(sec1 && secId===sec1.id && m.pct===100) earned.push('writer');
  }
  return earned;
}

function _tmStudentsFor(subId, secId){
  const q = String(_tmQuery||'').trim().toLowerCase();
  let list = [...S.students];
  if(q){
    list = list.filter(s=>{
      const n = String(s.name||'').toLowerCase();
      const num = String(s.num||'');
      return n.includes(q) || num.includes(q);
    });
  }
  if(_tmSort==='progress_desc'){
    list.sort((a,b)=>_tmSecMastery(b.id,subId,secId).pct - _tmSecMastery(a.id,subId,secId).pct);
  }else if(_tmSort==='progress_asc'){
    list.sort((a,b)=>_tmSecMastery(a.id,subId,secId).pct - _tmSecMastery(b.id,subId,secId).pct);
  }else{
    list.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''), 'ar'));
  }
  return list;
}

function renderTreasureMap(){
  const sub = _tmGetSub();
  if(!sub){ _tmSubId=S.subjects[0]?.id; }
  if(!_tmGetSec()) _tmSecId = _tmGetSub()?.sections[0]?.id;

  const activeSub = _tmGetSub();
  const activeSec = _tmGetSec();

  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">🗺️ خريطة الكنز</span></div>
  <div class="ph">
    <div>
      <div class="ph-title">🗺️ خريطة الكنز</div>
      <div class="ph-sub">رحلة تعلم بصرية — تابع تقدم كل طالب محطةً بمحطة</div>
    </div>
    <div class="ph-actions">
      <button class="btn ${_tmView==='class'?'btn-primary':'btn-ghost'} btn-sm" onclick="_tmView='class';showPage('treasuremap')">🏫 عرض الفصل</button>
      <button class="btn ${_tmView==='student'?'btn-primary':'btn-ghost'} btn-sm" onclick="_tmView='student';showPage('treasuremap')">👤 عرض فردي</button>
      <button class="btn btn-gold btn-sm" onclick="_tmPrintCerts()">🏅 طباعة الشهادات</button>
    </div>
  </div>

  <div class="card tm-no-print" style="margin-bottom:14px;">
    <div class="card-body" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
      <input type="text" value="${String(_tmQuery||'').replace(/"/g,'&quot;')}" placeholder="🔎 ابحث عن طالب (اسم/رقم)..."
        oninput="_tmQuery=this.value;showPage('treasuremap')"
        style="flex:1;min-width:240px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--border2);font-family:'Tajawal',sans-serif;font-size:0.88rem;outline:none;" />
      <select onchange="_tmSort=this.value;showPage('treasuremap')"
        style="padding:9px 12px;border-radius:10px;border:1.5px solid var(--border2);font-family:'Tajawal',sans-serif;font-size:0.84rem;">
        <option value="name" ${_tmSort==='name'?'selected':''}>الفرز: الاسم</option>
        <option value="progress_desc" ${_tmSort==='progress_desc'?'selected':''}>الفرز: الأعلى تقدماً</option>
        <option value="progress_asc" ${_tmSort==='progress_asc'?'selected':''}>الفرز: الأقل تقدماً</option>
      </select>
      <button class="btn btn-ghost btn-sm" onclick="_tmQuery='';_tmSort='name';showPage('treasuremap')">إعادة ضبط</button>
    </div>
  </div>

  <!-- Subject tabs -->
  <div class="tm-sub-tabs tm-no-print">
    ${S.subjects.map(sub=>`
      <button class="tm-sub-tab ${(_tmSubId||S.subjects[0]?.id)===sub.id?'active':''}"
        onclick="_tmSubId='${sub.id}';_tmSecId=null;showPage('treasuremap')">
        ${sub.icon||'📚'} ${sub.name}
      </button>`).join('')}
  </div>

  <!-- Section tabs (if >1 section) -->
  ${activeSub&&activeSub.sections.length>1?`
  <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:18px;">
    ${activeSub.sections.map(sec=>`
      <button class="btn btn-sm ${(_tmSecId||activeSub.sections[0]?.id)===sec.id?'btn-primary':'btn-ghost'}"
        onclick="_tmSecId='${sec.id}';showPage('treasuremap')">
        ${sec.icon||'📌'} ${sec.name}
      </button>`).join('')}
  </div>`:''}

  ${_tmView==='class' ? _renderClassMap(activeSub,activeSec) : _renderStudentMap(activeSub,activeSec)}

  <!-- Tooltip -->
  <div id="tmPopup" class="tm-popup" style="display:none;"></div>
  `;
}

function _renderClassMap(sub,sec){
  if(!sec||!S.students.length) return `<div class="empty"><div class="empty-emoji">🗺️</div><h3>لا يوجد طلاب بعد</h3></div>`;
  const subId=sub.id, secId=sec.id;
  const shownStudents = _tmStudentsFor(subId, secId);
  if(!shownStudents.length) return `<div class="empty"><div class="empty-emoji">🔎</div><h3>لا توجد نتائج مطابقة</h3><p>جرّب اسمًا آخر أو امسح البحث</p></div>`;

  // Stats
  const masteries = S.students.map(s=>_tmSecMastery(s.id,subId,secId));
  const avgPct = Math.round(masteries.reduce((a,m)=>a+m.pct,0)/S.students.length);
  const completed = masteries.filter(m=>m.pct===100).length;
  const needsHelp = masteries.filter(m=>m.pct<40).length;

  // Per-skill class mastery
  const skillRates = sec.skills.map((sk,i)=>{
    const cnt = S.students.filter(s=>((S.evals[s.id]||{})[subId]||{})[secId]?.[i]==='m').length;
    return {sk, pct: Math.round((cnt/S.students.length)*100), cnt};
  });
  const hardest = [...skillRates].sort((a,b)=>a.pct-b.pct)[0];
  const easiest = [...skillRates].sort((a,b)=>b.pct-a.pct)[0];

  return `
  <!-- Class summary KPIs -->
  <div class="kpi-grid" style="margin-bottom:20px;">
    <div class="kpi blue"><span class="kpi-icon">👥</span><div class="kpi-val">${S.students.length}</div><div class="kpi-label">طلاب في الرحلة</div></div>
    <div class="kpi green"><span class="kpi-icon">🏆</span><div class="kpi-val">${completed}</div><div class="kpi-label">وصلوا الكنز</div></div>
    <div class="kpi gold"><span class="kpi-icon">⭐</span><div class="kpi-val">${avgPct}%</div><div class="kpi-label">متوسط التقدم</div></div>
    <div class="kpi red"><span class="kpi-icon">⚠️</span><div class="kpi-val">${needsHelp}</div><div class="kpi-label">يحتاجون دعم</div></div>
  </div>

  <!-- Insight bar -->
  ${hardest?`<div class="note-card" style="margin-bottom:16px;${hardest.pct<50?'background:linear-gradient(135deg,#fef2f2,#fee2e2);border-color:#fca5a5;color:#991b1b;':'background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-color:#bbf7d0;color:#166534;'}">
    <span class="note-icon">${hardest.pct<50?'⚠️':'🌟'}</span>
    <div>${hardest.pct<50
      ?`<strong>أصعب محطة:</strong> "${hardest.sk}" — ${hardest.pct}% فقط من الطلاب أتقنوها. يُنصح بإعادة شرحها.`
      :`<strong>أسهل محطة:</strong> "${easiest.sk}" — ${easiest.pct}% إتقان! رائع.`
    }</div>
  </div>`:''}

  <!-- Class Road Map -->
  <div class="card" style="margin-bottom:20px;overflow:visible;">
    <div class="card-header">
      <h3>🗺️ خريطة الرحلة — ${sec.icon||''} ${sec.name}</h3>
      <span class="badge badge-gold">${sec.skills.length} محطة</span>
    </div>
    <div style="padding:10px 16px;overflow-x:auto;">
      <!-- Road with station nodes -->
      <div class="tm-road" id="tmRoad">
        <!-- Start flag -->
        <div class="tm-station">
          <div class="tm-node start" title="البداية">🚀</div>
          <div class="tm-label">البداية</div>
        </div>
        <div class="tm-connector" style="background:linear-gradient(90deg,#1565c0,#42a5f5)"></div>

        ${sec.skills.map((sk,i)=>{
          const rate = skillRates[i];
          const cls = rate.pct>=70?'done':rate.pct>0?'partial':'locked';
          const connClr = rate.pct>=70?'#10b981':rate.pct>0?'#f59e0b':'#e2e8f8';
          const icon = TM_ICONS[i%TM_ICONS.length];
          return `<div class="tm-station" onclick="_tmShowStationInfo('${subId}','${secId}',${i},event)">
            <div class="tm-node ${cls}" title="${sk}">
              ${rate.pct===100?'✅':icon}
              ${rate.pct===100?`<div style="position:absolute;top:-8px;right:-8px;background:#f59e0b;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;border:2px solid white;">⭐</div>`:''}
            </div>
            <div class="tm-label">${sk.length>10?sk.substring(0,9)+'…':sk}</div>
            <div class="tm-pct ${cls}">${rate.pct}%</div>
          </div>
          ${i<sec.skills.length-1?`<div class="tm-connector" style="background:${connClr}80"></div>`:''}`;
        }).join('')}

        <div class="tm-connector" style="background:linear-gradient(90deg,#a78bfa,#7c3aed)"></div>
        <!-- Treasure finish -->
        <div class="tm-station">
          <div class="tm-node finish">🏆</div>
          <div class="tm-label">الكنز!</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Class heatmap grid -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-header"><h3>🌡️ خريطة الحرارة — كل طالب × كل محطة</h3>
      <div style="display:flex;gap:8px;font-size:0.76rem;color:var(--muted);font-weight:700;">
        <span>🟢 أتقن</span><span>🟡 لم يتقن بعد</span><span>⬜ لم يُقيَّم</span>
      </div>
    </div>
    <div style="padding:16px;overflow-x:auto;">
      <!-- Header row: skill names -->
      <div class="tm-class-row" style="grid-template-columns:130px repeat(${sec.skills.length},1fr);margin-bottom:4px;">
        <div style="font-size:0.70rem;font-weight:800;color:var(--muted2);">الطالب</div>
        ${sec.skills.map((sk,i)=>`<div style="font-size:0.62rem;font-weight:800;color:var(--muted);text-align:center;transform:rotate(-35deg);transform-origin:center;white-space:nowrap;height:40px;display:flex;align-items:flex-end;justify-content:center;">${i+1}</div>`).join('')}
      </div>
      ${shownStudents.map(s=>{
        const ev=((S.evals[s.id]||{})[subId]||{})[secId]||{};
        return `<div class="tm-class-row" style="grid-template-columns:130px repeat(${sec.skills.length},1fr);margin-bottom:3px;">
          <div style="font-size:0.78rem;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:none;"
            onclick="_tmView='student';_tmStuId='${s.id}';showPage('treasuremap')"
            title="عرض رحلة ${s.name}">${s.name.split(' ')[0]}</div>
          ${sec.skills.map((_,i)=>{
            const v=ev[i];
            const cls=v==='m'?'c-done':v==='n'?'c-partial':'c-none';
            const tt=v==='m'?'✅ أتقن':v==='n'?'🌱 في طور التعلم':'⬜ لم يُقيَّم بعد';
            return `<div class="tm-class-cell ${cls}" title="${tt}"></div>`;
          }).join('')}
        </div>`;
      }).join('')}
      <!-- Skill numbers legend -->
      <div style="margin-top:12px;display:flex;flex-direction:column;gap:3px;">
        ${sec.skills.map((sk,i)=>`<div style="font-size:0.74rem;color:var(--muted);"><strong style="color:var(--ink2)">${i+1}.</strong> ${sk}</div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Student quick list -->
  <div class="card">
    <div class="card-header"><h3>👤 عرض رحلة طالب محدد</h3></div>
    <div style="padding:14px 16px;display:flex;flex-wrap:wrap;gap:8px;">
      ${shownStudents.map(s=>{
        const m=_tmSecMastery(s.id,subId,secId);
        return `<div class="tm-student-pill ${_tmStuId===s.id?'active':''}"
          onclick="_tmView='student';_tmStuId='${s.id}';showPage('treasuremap')">
          <div class="avatar av-32" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>
          <div>
            <div class="tm-pill-name">${s.name.split(' ').slice(0,2).join(' ')}</div>
            <div class="tm-pill-pct" style="color:${m.pct>=70?'#059669':m.pct>=40?'#d97706':'#dc2626'}">${m.pct}% — ${m.done.length}/${m.total}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function _renderStudentMap(sub,sec){
  if(!S.students.length) return `<div class="empty"><div class="empty-emoji">👤</div><h3>لا يوجد طلاب</h3></div>`;
  const subId=sub.id, secId=sec.id;
  const shownStudents = _tmStudentsFor(subId, secId);
  if(!shownStudents.length) return `<div class="empty"><div class="empty-emoji">🔎</div><h3>لا توجد نتائج مطابقة</h3><p>جرّب اسمًا آخر أو امسح البحث</p></div>`;
  if(!_tmStuId || !shownStudents.some(x=>x.id===_tmStuId)) _tmStuId=shownStudents[0].id;
  const s=shownStudents.find(x=>x.id===_tmStuId)||shownStudents[0];
  const m=_tmSecMastery(s.id,subId,secId);
  const ev=((S.evals[s.id]||{})[subId]||{})[secId]||{};
  const earnedBadges=_tmBadges(s.id,subId,secId);
  const starsToday=((S.behavior[s.id]||{})[today()]||{}).stars||0;

  // Next locked skill
  const nextLocked=sec.skills.findIndex((_,i)=>ev[i]===undefined||ev[i]==='n');

  return `
  <!-- Student selector -->
  <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px;padding:12px 16px;background:var(--card);border-radius:var(--r);border:1px solid var(--border);">
    <div style="font-size:0.78rem;font-weight:900;color:var(--muted2);width:100%;margin-bottom:4px;">اختر الطالب:</div>
    ${shownStudents.map(st=>{
      const mm=_tmSecMastery(st.id,subId,secId);
      return `<div class="tm-student-pill ${st.id===s.id?'active':''}"
        onclick="_tmStuId='${st.id}';showPage('treasuremap')">
        <div class="avatar av-32" style="${avatarStyle(st.id)};color:white">${st.name.charAt(0)}</div>
        <div>
          <div class="tm-pill-name">${st.name.split(' ')[0]}</div>
          <div class="tm-pill-pct" style="color:${st.id===s.id?'rgba(255,255,255,0.85)':mm.pct>=70?'#059669':mm.pct>=40?'#d97706':'#dc2626'}">${mm.pct}%</div>
        </div>
      </div>`;
    }).join('')}
  </div>

  <!-- Student hero card -->
  <div style="background:linear-gradient(135deg,var(--ink2),var(--sky));border-radius:var(--r);padding:24px 28px;color:white;margin-bottom:20px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
    ${s.photo?`<img src="${s.photo}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.3);flex-shrink:0" />`:`<div style="width:70px;height:70px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;border:3px solid rgba(255,255,255,0.3);flex-shrink:0">${s.name.charAt(0)}</div>`}
    <div style="flex:1">
      <div style="font-size:1.4rem;font-weight:900;margin-bottom:4px;">${s.name}</div>
      <div style="opacity:.80;font-size:.88rem;">رحلة: ${sub.icon||'📚'} ${sub.name} — ${sec.icon||'📌'} ${sec.name}</div>
      <div style="margin-top:10px;display:flex;gap:16px;flex-wrap:wrap;">
        <span style="display:flex;align-items:center;gap:5px;font-size:.85rem">✅ أتقن: <strong>${m.done.length}/${m.total}</strong></span>
        <span style="display:flex;align-items:center;gap:5px;font-size:.85rem">⭐ التقدم: <strong>${m.pct}%</strong></span>
        <span style="display:flex;align-items:center;gap:5px;font-size:.85rem">⭐ السلوك اليوم: <strong>${'★'.repeat(starsToday)||'—'}</strong></span>
      </div>
    </div>
    <div style="text-align:center;">
      <div style="font-size:2.4rem;font-weight:900">${m.pct}%</div>
      <div style="opacity:.75;font-size:.80rem">${m.pct>=70?'🏆 ممتاز!':m.pct>=40?'📈 في الطريق':'🌱 في البداية'}</div>
    </div>
  </div>

  <!-- Progress bar full -->
  <div style="margin-bottom:20px;">
    <div style="display:flex;justify-content:space-between;font-size:.80rem;font-weight:800;color:var(--muted);margin-bottom:6px;">
      <span>🚀 البداية</span><span>المحطة ${m.done.length} من ${m.total}</span><span>🏆 الكنز</span>
    </div>
    <div style="background:var(--border);border-radius:99px;height:14px;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.10)">
      <div style="height:100%;width:${m.pct}%;background:linear-gradient(90deg,#1565c0,#10b981,#f59e0b);border-radius:99px;transition:width 1s cubic-bezier(.34,1.56,.64,1);position:relative;">
        ${m.pct>8?`<div style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:9px;font-weight:900;color:white">${m.pct}%</div>`:''}
      </div>
    </div>
  </div>

  <!-- Individual road -->
  <div class="card" style="margin-bottom:20px;overflow:visible;">
    <div class="card-header"><h3>🗺️ رحلة ${s.name.split(' ')[0]}</h3>
      ${nextLocked>=0?`<span class="badge badge-gold">⭐ التالية: ${sec.skills[nextLocked]?.substring(0,15)}</span>`:'<span class="badge badge-green">🏆 أتم الرحلة!</span>'}
    </div>
    <div style="padding:10px 16px;overflow-x:auto;">
      <div class="tm-road">
        <div class="tm-station">
          <div class="tm-node start">🚀</div>
          <div class="tm-label">البداية</div>
        </div>
        <div class="tm-connector" style="background:#1565c080"></div>
        ${sec.skills.map((sk,i)=>{
          const v=ev[i];
          const cls=v==='m'?'done':v==='n'?'partial':'locked';
          const icon=v==='m'?'✅':v==='n'?'❌':TM_ICONS[i%TM_ICONS.length];
          const connClr=v==='m'?'#10b98180':v==='n'?'#f59e0b80':'#e2e8f8';
          return `<div class="tm-station" onclick="_tmShowSkillDetail(${i},'${subId}','${secId}','${s.id}',event)">
            <div class="tm-node ${cls}" title="${sk}">
              ${icon}
              ${i===nextLocked?`<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:16px;animation:bounce 1.5s infinite">👆</div>`:''}
            </div>
            <div class="tm-label">${sk.length>10?sk.substring(0,9)+'…':sk}</div>
            <div class="tm-pct ${cls}">${v==='m'?'✅':v==='n'?'مراجعة':'⬜'}</div>
          </div>
          ${i<sec.skills.length-1?`<div class="tm-connector" style="background:${connClr}"></div>`:''}`;
        }).join('')}
        <div class="tm-connector" style="background:#7c3aed80"></div>
        <div class="tm-station">
          <div class="tm-node ${m.pct===100?'finish':'locked'}">${m.pct===100?'🏆':'🔒'}</div>
          <div class="tm-label">${m.pct===100?'الكنز!':'مقفل'}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Skill detail list -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
    <div class="card">
      <div class="card-header"><h3>✅ المحطات المُتقنة (${m.done.length})</h3></div>
      <div style="padding:10px 14px;">
        ${m.done.length===0?'<div style="color:var(--muted);font-size:.85rem;padding:8px 0">لا توجد بعد</div>':
          m.done.map(i=>`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:.84rem;">
            <span style="color:var(--mint);font-size:16px">✅</span>
            <span style="font-weight:700">${i+1}. ${sec.skills[i]}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3>🎯 المحطات المتبقية (${m.total-m.done.length})</h3></div>
      <div style="padding:10px 14px;">
        ${m.done.length===m.total?'<div style="color:var(--mint);font-size:.85rem;padding:8px 0">🏆 أتم جميع المحطات!</div>':
          sec.skills.map((sk,i)=>ev[i]!=='m'?`<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);font-size:.84rem;">
            <span style="font-size:16px">${ev[i]==='n'?'❌':'⬜'}</span>
            <span style="color:${ev[i]==='n'?'var(--ember)':'var(--muted)'};font-weight:600">${i+1}. ${sk}</span>
          </div>`:''
          ).filter(Boolean).join('')}
      </div>
    </div>
  </div>

  <!-- Badges -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-header"><h3>🏅 شارات الإنجاز</h3>
      <span class="badge badge-gold">${earnedBadges.length} شارة مكتسبة</span>
    </div>
    <div class="card-body">
      <div class="tm-badge-strip">
        ${TM_BADGES_DEF.map(b=>{
          const has=earnedBadges.includes(b.id);
          return `<div class="tm-badge ${has?'earned':'locked'}" title="${b.desc}">
            <div class="tm-badge-icon">${b.icon}</div>
            <div class="tm-badge-name">${b.name}</div>
            ${has?'<div style="font-size:.62rem;color:#b45309;font-weight:700">مكتسبة ✓</div>':'<div style="font-size:.62rem;color:var(--muted2)">مقفلة</div>'}
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  <!-- Actions -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;">
    <button class="btn btn-primary" onclick="genStudentPDF('${s.id}')">📄 تقرير PDF</button>
    <button class="btn btn-green" onclick="waStudentFiltered('${s.id}')">💬 واتساب للولي</button>
    <button class="btn btn-gold" onclick="_tmPrintCert('${s.id}')">🏅 طباعة شهادة</button>
    <button class="btn btn-ghost" onclick="openEvalDyn('${s.id}','${subId}')">✏️ تحديث التقييم</button>
  </div>`;
}

// Station info popup (class view)
function _tmShowStationInfo(subId,secId,skillIdx,event){
  const sec=S.subjects.find(s=>s.id===subId)?.sections.find(s=>s.id===secId);
  if(!sec) return;
  const skill=sec.skills[skillIdx];
  const students=S.students.map(s=>{
    const v=((S.evals[s.id]||{})[subId]||{})[secId]?.[skillIdx];
    return {name:s.name.split(' ')[0], v};
  });
  const done=students.filter(s=>s.v==='m');
  const not=students.filter(s=>s.v==='n');
  const none=students.filter(s=>!s.v);
  const popup=document.getElementById('tmPopup');
  if(!popup) return;
  popup.innerHTML=`
    <div class="tm-popup-title">📌 ${skill}</div>
    <div style="font-size:.78rem;color:var(--muted);margin-bottom:8px">${Math.round((done.length/S.students.length)*100)}% إتقان</div>
    ${done.length?`<div class="tm-popup-skill"><span style="color:var(--mint)">✅</span> أتقن: ${done.map(s=>s.name).join('، ')}</div>`:''}
    ${not.length?`<div class="tm-popup-skill"><span style="color:var(--ember)">❌</span> لم يتقن بعد: ${not.map(s=>s.name).join('، ')}</div>`:''}
    ${none.length?`<div class="tm-popup-skill"><span style="opacity:.5">⬜</span> لم يُقيَّم: ${none.map(s=>s.name).join('، ')}</div>`:''}
  `;
  const rect=event.currentTarget?.getBoundingClientRect?.()||{top:event.clientY,left:event.clientX};
  popup.style.top=(rect.top+window.scrollY-180)+'px';
  popup.style.left=Math.max(8,(rect.left-100))+'px';
  popup.style.display='block';
  setTimeout(()=>{ popup.style.display='none'; },3500);
}

function _tmShowSkillDetail(i,subId,secId,sid,event){
  const sec=S.subjects.find(s=>s.id===subId)?.sections.find(s=>s.id===secId);
  if(!sec) return;
  const v=((S.evals[sid]||{})[subId]||{})[secId]?.[i];
  const popup=document.getElementById('tmPopup');
  if(!popup) return;
  popup.innerHTML=`
    <div class="tm-popup-title">${TM_ICONS[i%TM_ICONS.length]} ${sec.skills[i]}</div>
    <div style="font-size:.88rem;margin-top:4px;color:${v==='m'?'var(--mint)':v==='n'?'var(--ember)':'var(--muted)'}">
      ${v==='m'?'✅ مُتقنة':'❌ لم تُتقن بعد'}
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;pointer-events:all;">
      <button class="btn btn-green btn-xs" onclick="setEvDyn('${subId}','${secId}',${i},'m');document.getElementById('tmPopup').style.display='none';showPage('treasuremap')">✅ أتقن</button>
      <button class="btn btn-red btn-xs" onclick="setEvDyn('${subId}','${secId}',${i},'n');document.getElementById('tmPopup').style.display='none';showPage('treasuremap')">❌ لم يتقن بعد</button>
    </div>`;
  popup.style.pointerEvents='all';
  const rect=event.currentTarget?.getBoundingClientRect?.()||{top:event.clientY,left:event.clientX};
  popup.style.top=(rect.top+window.scrollY-160)+'px';
  popup.style.left=Math.max(8,(rect.left-80))+'px';
  popup.style.display='block';
}

// Print certificate for one student
function _tmPrintCert(sid){
  const s=S.students.find(x=>x.id===sid);
  if(!s) return;
  const sub=_tmGetSub(), sec=_tmGetSec();
  const m=_tmSecMastery(sid,sub.id,sec.id);
  const earned=_tmBadges(sid,sub.id,sec.id);
  const badgesHTML=TM_BADGES_DEF.filter(b=>earned.includes(b.id))
    .map(b=>`<div style="text-align:center;margin:0 8px"><div style="font-size:32px">${b.icon}</div><div style="font-size:10px;font-weight:800;color:#7c3aed">${b.name}</div></div>`).join('');
  const skillsHTML=sec.skills.map((sk,i)=>{
    const v=((S.evals[sid]||{})[sub.id]||{})[sec.id]?.[i];
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:11px;">
      <span style="color:${v==='m'?'#059669':'#dc2626'};font-size:14px">${v==='m'?'✅':'❌'}</span>
      <span style="font-weight:${v==='m'?'800':'400'};color:${v==='m'?'#1e3a5f':'#94a3b8'}">${sk}</span>
    </div>`;
  }).join('');

  const certHTML=`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=Amiri:wght@700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Tajawal',sans-serif;direction:rtl;background:#fff}
    @media print{.no-print{display:none}}
    .cert{width:210mm;min-height:148mm;padding:14mm 16mm;border:8px double #f59e0b;margin:8mm auto;position:relative;background:linear-gradient(160deg,#fffbeb 0%,#fff 60%)}
    .cert::before{content:'🗺️';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:200px;opacity:.04;pointer-events:none}
    .school{font-size:12px;color:#64748b;text-align:center;margin-bottom:4px}
    .cert-title{font-family:'Amiri',serif;font-size:28px;color:#1e3a5f;text-align:center;font-weight:700;margin-bottom:4px}
    .cert-sub{text-align:center;color:#64748b;font-size:12px;margin-bottom:14px}
    .student-name{font-size:26px;font-weight:900;color:#1565c0;text-align:center;padding:8px 0;border-top:2px solid #f59e0b;border-bottom:2px solid #f59e0b;margin:8px 0 12px}
    .stats{display:flex;justify-content:center;gap:24px;margin-bottom:14px}
    .stat{text-align:center}.stat-val{font-size:24px;font-weight:900;color:#059669}.stat-lbl{font-size:10px;color:#64748b;font-weight:700}
    .skills-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin-bottom:14px}
    .badges-row{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
    .footer{text-align:center;font-size:10px;color:#94a3b8;margin-top:8px}
    .no-print{text-align:center;padding:10px;margin-bottom:8px}
    .pbtn{padding:9px 20px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:white;font-size:.9em}
  </style></head><body>
  <div class="no-print"><button class="pbtn" onclick="window.print()">🖨️ طباعة الشهادة</button></div>
  <div class="cert">
    <div class="school" style="display:flex;align-items:center;justify-content:center;gap:8px;"><img src="${SCHOOL_LOGO}" style="width:40px;height:40px;object-fit:contain;" />مدارس البشرى الأهلية — الصف الأول الابتدائي</div>
    <div class="cert-title">🗺️ شهادة إتقان خريطة الكنز</div>
    <div class="cert-sub">${sub.icon||'📚'} ${sub.name} — ${sec.icon||'📌'} ${sec.name}</div>
    <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:8px;">
      ${s.photo
        ?`<img src="${s.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #f59e0b;box-shadow:0 4px 12px rgba(0,0,0,.15);" />`
        :`<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:white;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;border:3px solid #f59e0b;">${s.name.charAt(0)}</div>`
      }
      <div class="student-name" style="border:none;padding:0;margin:0">⭐ ${s.name} ⭐</div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-val">${m.pct}%</div><div class="stat-lbl">نسبة الإتقان</div></div>
      <div class="stat"><div class="stat-val">${m.done.length}/${m.total}</div><div class="stat-lbl">المحطات المُتقنة</div></div>
      <div class="stat"><div class="stat-val">${earned.length}</div><div class="stat-lbl">الشارات المكتسبة</div></div>
    </div>
    ${badgesHTML?`<div class="badges-row">${badgesHTML}</div>`:''}
    <div class="skills-grid">${skillsHTML}</div>
    <div class="footer">المعلم: ${fullName()} · التاريخ: ${fmtDate(today())} · مدارس البشرى الأهلية</div>
  </div></body></html>`;
  const w=window.open('','_blank','width=800,height=650');
  w.document.write(certHTML); w.document.close();
}

// Print ALL certificates
function _tmPrintCerts(){
  if(!S.students.length){toast('لا يوجد طلاب','error');return;}
  const sub=_tmGetSub(), sec=_tmGetSec();
  if(!sub||!sec){toast('اختر مادة وخانة أولاً','error');return;}
  // Open one window with all certs
  const all=S.students.map(s=>{
    const m=_tmSecMastery(s.id,sub.id,sec.id);
    const earned=_tmBadges(s.id,sub.id,sec.id);
    const bdg=TM_BADGES_DEF.filter(b=>earned.includes(b.id))
      .map(b=>`<span style="font-size:22px" title="${b.name}">${b.icon}</span>`).join('');
    const skills=sec.skills.map((sk,i)=>{
      const v=((S.evals[s.id]||{})[sub.id]||{})[sec.id]?.[i];
      return `<div style="font-size:10px;padding:2px 0;border-bottom:1px solid #f5f5f5;display:flex;gap:5px;align-items:center"><span>${v==='m'?'✅':'❌'}</span><span style="color:${v==='m'?'#1e3a5f':'#94a3b8'}">${sk}</span></div>`;
    }).join('');
    return `<div style="width:180mm;border:5px double #f59e0b;padding:10mm 12mm;margin:5mm auto;page-break-after:always;position:relative;background:linear-gradient(160deg,#fffbeb,#fff);">
      <div style="font-size:10px;color:#64748b;text-align:center">🏫 مدارس البشرى الأهلية</div>
      <div style="font-family:'Amiri',serif;font-size:22px;font-weight:700;color:#1e3a5f;text-align:center;margin:4px 0">🗺️ شهادة خريطة الكنز</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:10px;border-top:2px solid #f59e0b;border-bottom:2px solid #f59e0b;padding:6px 0;margin:6px 0;">
        ${s.photo
          ?`<img src="${s.photo}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #f59e0b;" />`
          :`<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:white;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;">${s.name.charAt(0)}</div>`
        }
        <div style="font-size:18px;font-weight:900;color:#1565c0;">⭐ ${s.name}</div>
      </div>
      <div style="display:flex;justify-content:center;gap:16px;margin-bottom:8px">
        <span style="font-weight:900;color:#059669;font-size:18px">${m.pct}%</span>
        <span style="font-weight:700;font-size:12px;color:#64748b">${m.done.length}/${m.total} محطة</span>
        <span style="font-size:14px">${bdg||'—'}</span>
      </div>
      <div style="columns:2;gap:8px">${skills}</div>
      <div style="font-size:9px;color:#94a3b8;text-align:center;margin-top:6px">${fullName()} · ${today()}</div>
    </div>`;
  }).join('');
  const w=window.open('','_blank','width=900,height=700');
  w.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=Amiri:wght@700&display=swap" rel="stylesheet">
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Tajawal',sans-serif;direction:rtl}@media print{.np{display:none}}</style>
    </head><body>
    <div class="np" style="padding:10px;text-align:center"><button onclick="window.print()" style="padding:9px 20px;border-radius:9px;border:none;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:white;font-family:'Tajawal',sans-serif;font-weight:800;font-size:.9em;cursor:pointer">🖨️ طباعة كل الشهادات (${S.students.length})</button></div>
    ${all}</body></html>`);
  w.document.close();
}

function initTreasureMap(){
  // Initialize default subject/section if not set
  if(!_tmSubId) _tmSubId=S.subjects[0]?.id;
  if(!_tmSecId) _tmSecId=S.subjects.find(s=>s.id===_tmSubId)?.sections[0]?.id;
  // Animate progress bars
  document.querySelectorAll('.prog-bar,.tm-node').forEach((el,i)=>{
    el.style.transition=`all 0.5s ease ${i*0.04}s`;
  });
}
