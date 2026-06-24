// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function today(){ return new Date().toISOString().split('T')[0]; }

function fmtDate(d){
  try{ return new Date(d).toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'}); }
  catch{ return d; }
}

function fmtShort(d){
  try{ return new Date(d).toLocaleDateString('ar-SA',{month:'short',day:'numeric'}); }
  catch{ return d; }
}

function studentMastery(sid){
  // Per-subject mastery — only uses subjects[0] for legacy rPct/wPct fields
  // Total = weighted across ALL subjects and ALL sections
  let totalM=0, totalT=0;
  // Legacy fields: first subject only, first two sections
  const sub0=S.subjects[0];
  let rm=0,rt=1,wm=0,wt=1;
  if(sub0){
    const sec0=sub0.sections[0];
    const sec1=sub0.sections[1];
    if(sec0){
      const secEv=((S.evals[sid]||{})[sub0.id]||{})[sec0.id]||{};
      rm=Object.values(secEv).filter(v=>v==='m').length;
      rt=sec0.skills.length||1;
    }
    if(sec1){
      const secEv=((S.evals[sid]||{})[sub0.id]||{})[sec1.id]||{};
      wm=Object.values(secEv).filter(v=>v==='m').length;
      wt=sec1.skills.length||1;
    }
  }
  // Grand total across everything
  S.subjects.forEach(sub=>{
    sub.sections.forEach(sec=>{
      const secEv=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
      totalM+=Object.values(secEv).filter(v=>v==='m').length;
      totalT+=sec.skills.length;
    });
  });
  if(totalT===0) totalT=1;
  const rPct=Math.round((rm/rt)*100);
  const wPct=Math.round((wm/wt)*100);
  const total=Math.round((totalM/totalT)*100);
  return {rm,wm,rt,wt,rPct,wPct,total,totalM,totalT};
}

function masteryColor(pct){ return pct>=70?'gold':pct>=40?'blue':'green'; }
function masteryLabel(pct){ return pct>=70?'أتقن المهارة':pct>=40?'يتقدم بشكل جيد':'في بداية رحلته'; }

// ── مؤشر التقدم الحقيقي ─────────────────────────────────────
// يحسب كم مهارة أتقنها الطالب في آخر N يوم
// ويقارنها بالفترة اللي قبلها
function studentProgress(sid, days=7){
  const now = Date.now();
  const msDay = 86400000;
  const cutNew = now - days * msDay;       // بداي�� الفترة الجديدة
  const cutOld = now - days * 2 * msDay;   // بداية الفترة القديمة

  // احسب إجمالي المهارات المتقنة الآن
  const curTotal = studentMastery(sid).totalM;

  // ابحث في الـ changelog عن آخر تقييم لهذا الطالب قبل أسبوع
  // لكن عندنا مشكلة: ما عندنا snapshot تاريخية للإتقان
  // الحل: نحسب من تاريخ آخر تعديل في الـ evals
  // بديل بسيط وفعال: نشوف كم entry eval في الـ changelog خلال الأسبوع

  if(!S.changelog) return { delta:0, newSkills:0, trend:'flat' };

  // عدد المهارات المقيّمة بـ 'تقييم' في آخر أسبوع لهذا الطالب
  const recentEvals = S.changelog.filter(e=>{
    if(e.type !== 'eval') return false;
    const ts = new Date(e.ts).getTime();
    return ts >= cutNew && (e.detail===sid || e.detail===S.students.find(s=>s.id===sid)?.name);
  }).length;

  const olderEvals = S.changelog.filter(e=>{
    if(e.type !== 'eval') return false;
    const ts = new Date(e.ts).getTime();
    return ts >= cutOld && ts < cutNew && (e.detail===sid || e.detail===S.students.find(s=>s.id===sid)?.name);
  }).length;

  // استخدم totalM مباشرة كمؤشر تراكمي
  // وخزّن snapshot أسبوعي في S إذا مش موجود
  if(!S._snapshots) S._snapshots = {};
  const snapKey = `${sid}_${new Date(cutNew).toISOString().slice(0,10)}`;
  if(!S._snapshots[snapKey]) {
    // أول مرة نحسب — خزّن الرقم الحالي كـ baseline
    // بعد أسبوع هيكون هو المقارنة
    S._snapshots[snapKey] = curTotal;
  }

  // أقدم snapshot متاح لهذا الطالب
  const oldSnaps = Object.entries(S._snapshots)
    .filter(([k])=> k.startsWith(sid+'_'))
    .sort(([a],[b])=> a.localeCompare(b));

  let delta = 0;
  if(oldSnaps.length >= 2){
    const oldest = oldSnaps[0][1];
    delta = curTotal - oldest;
  } else if(oldSnaps.length === 1){
    delta = curTotal - (oldSnaps[0][1] || 0);
  }

  const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return { delta, newSkills: recentEvals, trend, curTotal };
}

// نسخة مبسطة سريعة — تقارن مجموع المهارات الحالي بأول snapshot مسجّل
function studentProgressSimple(sid){
  const cur = studentMastery(sid).totalM;
  if(!S._snapshots) S._snapshots = {};

  // ابحث عن أقدم snapshot
  const snaps = Object.entries(S._snapshots)
    .filter(([k])=> k.startsWith(sid+'_'))
    .sort(([a],[b])=> a.localeCompare(b));

  if(!snaps.length){
    // أول مرة — سجّل baseline
    const key = `${sid}_${today()}`;
    S._snapshots[key] = cur;
    return { delta:0, trend:'flat', label:'جديد' };
  }

  const baseline = snaps[0][1];
  const delta = cur - baseline;
  const trend = delta > 2 ? 'up' : delta > 0 ? 'up_slow' : delta < 0 ? 'down' : 'flat';

  let label = '';
  if(delta > 0) label = `+${delta} مهارة`;
  else if(delta === 0) label = 'ثابت';
  else label = `${delta} مهارة`;

  return { delta, trend, label, baseline, cur };
}

// حفظ snapshot أسبوعي تلقائي
function ensureWeeklySnapshot(){
  if(!S._snapshots) S._snapshots = {};
  const key_prefix = today(); // YYYY-MM-DD
  S.students.forEach(s=>{
    const key = `${s.id}_${key_prefix}`;
    if(!S._snapshots[key]){
      S._snapshots[key] = studentMastery(s.id).totalM;
    }
  });
}

function avatarStyle(sid){
  const idx = S.students.findIndex(s=>s.id===sid) % AVATAR_COLORS.length;
  const [c1,c2]=AVATAR_COLORS[idx]||AVATAR_COLORS[0];
  return `background:linear-gradient(135deg,${c1},${c2})`;
}

// Returns <img> if student has photo, else colored initial div
function avatarHTML(sid, size=40, extraStyle='', showEdit=false){
  const s=S.students.find(x=>x.id===sid);
  if(!s) return `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.38)}px;${avatarStyle(sid)};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;${extraStyle}">?</div>`;
  if(s.photo){
    return `<div class="stu-photo-wrap" style="width:${size}px;height:${size}px;${extraStyle}">
      <img src="${s.photo}" class="stu-photo" width="${size}" height="${size}" style="width:${size}px;height:${size}px;" />
      ${showEdit?`<div class="stu-photo-edit" onclick="openPhotoModal('${sid}',event)"><i class="ti ti-edit"></i></div>`:''}
    </div>`;
  }
  return `<div class="stu-photo-wrap" style="${extraStyle}" ${showEdit?`onclick="openPhotoModal('${sid}',event)"`:''}>`+
    `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size*0.38)}px;${avatarStyle(sid)};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;">${s.name.charAt(0)}</div>`+
    `${showEdit?`<div class="stu-photo-edit">📷</div>`:''}
    </div>`;
}

function genId(){ return 'id_'+Date.now()+'_'+Math.random().toString(36).substr(2,5); }

function buildRadialSVG(pct, color){
  const r=34, circ=2*Math.PI*r, dash=circ*(pct/100);
  const colMap={green:'#10b981',gold:'#f59e0b',red:'#10b981',blue:'#1565c0',sprout:'#10b981'};
  const c=colMap[color]||colMap.blue;
  return `<svg width="80" height="80" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="#eef2ff" stroke-width="7"/>
    <circle cx="40" cy="40" r="${r}" fill="none" stroke="${c}" stroke-width="7"
      stroke-dasharray="${dash} ${circ}" stroke-linecap="round"
      transform="rotate(-90 40 40)" style="transition:stroke-dasharray 0.8s ease"/>
  </svg>`;
}
