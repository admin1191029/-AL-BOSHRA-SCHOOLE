// ══════════════════════════════════════════════════════════════
// CHANGELOG — سجل التغييرات
// ══════════════════════════════════════════════════════════════

const CL_TYPES = {
  add:  { label:'إضافة',  icon:'➕', color:'var(--mint)'  },
  edit: { label:'تعديل', icon:'✏️', color:'var(--sky3)'  },
  del:  { label:'حذف',   icon:'🗑️', color:'var(--ember)' },
  eval: { label:'تقييم', icon:'📋', color:'var(--plum)'  },
  att:  { label:'حضور',  icon:'📅', color:'var(--gold)'  },
  auth: { label:'دخول',  icon:'🔑', color:'var(--mint)'  },
};

function logChange(type, action, detail=''){
  const entry = {
    id: genId(),
    ts: new Date().toISOString(),
    type,
    action,
    detail,
    teacher: S.teacher.n1 || 'مجهول'
  };
  if(!S.changelog) S.changelog=[];
  S.changelog.push(entry);
  // Update badge if changelog page is open
  const nb = document.getElementById('nb-changelog');
  if(nb) nb.textContent = S.changelog.length;
}

function renderChangelog(){
  const log = [...(S.changelog||[])].reverse().slice(0,100);
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">سجل التغييرات</span></div>
  <div class="ph">
    <div>
      <div class="ph-title">📜 سجل التغييرات</div>
      <div class="ph-sub">${S.changelog?.length||0} إجراء مسجَّل — كل تعديل بتاريخه ووقته</div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-ghost" onclick="exportChangelog()">📤 تصدير السجل</button>
      <button class="btn btn-red btn-sm" onclick="clearChangelog()">🗑️ مسح السجل</button>
    </div>
  </div>

  ${log.length===0?`<div class="empty"><div class="empty-emoji">📜</div><h3>لا توجد سجلات بعد</h3><p>ستظهر هنا كل التغييرات التي تجريها</p></div>`:`

  <!-- Filters -->
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
    ${Object.entries(CL_TYPES).map(([k,v])=>{
      const count=(S.changelog||[]).filter(e=>e.type===k).length;
      return count?`<span class="badge" style="background:${v.color}20;color:${v.color};border:1px solid ${v.color}40;cursor:none" onclick="filterChangelog('${k}')" id="clf_${k}">${v.icon} ${v.label} (${count})</span>`:'';
    }).join('')}
    <span class="badge badge-gray" onclick="filterChangelog('')" id="clf_all">الكل (${S.changelog?.length||0})</span>
  </div>

  <div class="card">
    <div id="changelogList" style="padding:6px 0;">
      ${log.map(entry=>{
        const t=CL_TYPES[entry.type]||{label:entry.type,icon:'📌',color:'var(--muted)'};
        const d=new Date(entry.ts);
        const timeStr=d.toLocaleDateString('ar-SA',{month:'short',day:'numeric'})+' '+d.toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
        return `<div class="cl-item" data-type="${entry.type}" style="padding:11px 18px;">
          <div class="cl-dot ${entry.type}" style="background:${t.color}"></div>
          <div style="flex:1">
            <div class="cl-action">${t.icon} ${entry.action}${entry.detail?` — <span style="color:var(--muted);font-size:0.82rem">${entry.detail}</span>`:''}</div>
            <div class="cl-meta">👤 ${entry.teacher} · 🕐 ${timeStr}</div>
          </div>
          <span class="badge" style="background:${t.color}15;color:${t.color};border:1px solid ${t.color}30;font-size:0.72rem">${t.label}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`}`;
}

function filterChangelog(type){
  const items=document.querySelectorAll('#changelogList .cl-item');
  items.forEach(el=>{
    el.style.display=(!type||el.dataset.type===type)?'':'none';
  });
  document.querySelectorAll('[id^="clf_"]').forEach(b=>{
    b.style.opacity=(!type||b.id==='clf_'+type||b.id==='clf_all')&&(!type&&b.id==='clf_all'||type&&b.id==='clf_'+type)?'1':'0.5';
  });
}

function exportChangelog(){
  if(!S.changelog?.length){toast('لا توجد سجلات','error');return;}
  const csv=['التاريخ والوقت,النوع,الإجراء,التفاصيل,المعلم',
    ...S.changelog.map(e=>`"${e.ts}","${e.type}","${e.action}","${e.detail||''}","${e.teacher}"`)
  ].join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
  a.download='changelog_'+today()+'.csv';
  a.click();
  toast('تم تصدير السجل ✅','success');
}

function clearChangelog(){
  if(!confirm('مسح سجل التغييرات كاملا��؟')) return;
  S.changelog=[];
  save(); showPage('changelog');
  toast('تم مسح السجل','success');
}

// changelog hooks — integrated directly into functions below

// ══════════════════════════════════════════════════════════════
// GOOGLE CLASSROOM IMPORT
// ══════════════════════════════════════════════════════════════

// Google OAuth config — teacher pastes their own Client ID
// Uses implicit flow (no backend needed)
let _gcToken = null;
const GC_SCOPES = 'https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.courses.readonly';

function renderClassroomImport(){
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">استيراد Google Classroom</span></div>
  <div class="ph">
    <div><div class="ph-title">🎓 استيراد من Google Classroom</div>
    <div class="ph-sub">جلب أسماء الطلاب مباشرةً من فصلك في Google Classroom</div></div>
  </div>

  <div class="gc-card">
    <div class="gc-header">
      <div class="gc-logo">🎓</div>
      <div>
        <div class="gc-title">Google Classroom Import</div>
        <div class="gc-sub">يتطلب حساب Google ومعلم في Classroom</div>
      </div>
    </div>

    <div class="gc-steps">
      <div class="gc-step">
        <div class="gc-step-num">1</div>
        <div>
          <strong>أدخل Client ID من Google Cloud Console</strong><br>
          <span style="font-size:0.80rem;color:var(--muted)">أنشئ مشروعاً على <a href="https://console.cloud.google.com" target="_blank" style="color:var(--sky)">console.cloud.google.com</a> وفعّل Classroom API وأضف OAuth Client ID</span>
          <div style="margin-top:8px;">
            <input type="text" id="gcClientId" placeholder="XXXXXXXX.apps.googleusercontent.com"
              style="width:100%;padding:9px 12px;border:1.5px solid var(--border2);border-radius:9px;font-family:'Tajawal',sans-serif;font-size:0.88rem;outline:none;text-align:left;direction:ltr"
              value="${localStorage.getItem('gc_client_id')||''}" />
          </div>
        </div>
      </div>

      <div class="gc-step">
        <div class="gc-step-num">2</div>
        <div style="flex:1">
          <strong>سجّل الدخول بـ Google</strong><br>
          <span style="font-size:0.80rem;color:var(--muted)">سيُطلب منك الإذن بقراءة قائمة طلابك فقط</span>
          <div style="margin-top:10px;">
            <button class="btn btn-primary" onclick="gcSignIn()">
              <svg width="18" height="18" viewBox="0 0 24 24" style="flex-shrink:0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              تسجيل الدخول بـ Google
            </button>
            <span id="gcAuthStatus" style="margin-right:10px;font-size:0.82rem;color:var(--muted)"></span>
          </div>
        </div>
      </div>

      <div class="gc-step" id="gcStep3" style="${_gcToken?'':'opacity:0.45'}">
        <div class="gc-step-num">3</div>
        <div style="flex:1">
          <strong>اختر الفصل واستورد الطلاب</strong>
          <div id="gcCoursesList" style="margin-top:10px;">
            ${_gcToken?'<button class="btn btn-green btn-sm" onclick="gcLoadCourses()">🔄 تحميل الفصول</button>':'<span style="font-size:0.82rem;color:var(--muted)">سجّل الدخول أولاً</span>'}
          </div>
        </div>
      </div>
    </div>

    <div class="gc-import-result" id="gcImportResult"></div>
  </div>

  <div class="note-card">
    <span class="note-icon">🔒</span>
    <div>البيانات لا تُرسَل لأي خادم — تُحفظ محلياً في متصفحك فقط. الصلاحية المطلوبة: قراءة قائمة الطلاب فقط (للقراءة لا للكتابة).</div>
  </div>

  <div class="note-card" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-color:#bfdbfe;color:#1e40af;margin-top:12px;">
    <span class="note-icon">📋</span>
    <div>
      <strong>بديل سريع — استيراد من ملف نصي:</strong><br>
      أضف أسماء الطلاب سطراً بسطر وسيتم استيرادهم مباشرة:
      <div style="margin-top:8px;display:flex;gap:8px;align-items:flex-start;">
        <textarea id="textImportNames" placeholder="محمد أحمد&#10;فاطمة علي&#10;عبدالله محمد&#10;..." style="flex:1;min-height:100px;padding:10px;border:1.5px solid var(--border2);border-radius:9px;font-family:'Tajawal',sans-serif;font-size:0.88rem;resize:vertical;outline:none;"></textarea>
        <button class="btn btn-primary" onclick="importFromText()" style="flex-shrink:0;">⬇️ استيراد</button>
      </div>
    </div>
  </div>`;
}

// Google OAuth Implicit Flow
function gcSignIn(){
  const clientId = document.getElementById('gcClientId')?.value?.trim();
  if(!clientId){ toast('أدخل Client ID أولاً','error'); return; }
  localStorage.setItem('gc_client_id', clientId);

  const redirectUri = window.location.href.split('?')[0].split('#')[0];
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?`+
    `client_id=${encodeURIComponent(clientId)}`+
    `&redirect_uri=${encodeURIComponent(redirectUri)}`+
    `&response_type=token`+
    `&scope=${encodeURIComponent(GC_SCOPES)}`+
    `&prompt=select_account`;

  // Store that we're waiting for OAuth callback
  sessionStorage.setItem('gc_oauth_pending','1');

  const popup = window.open(authUrl,'gcAuth','width=500,height=600,scrollbars=yes');
  if(!popup){ toast('يرجى السماح بالنوافذ المنبثقة','error'); return; }

  // Poll for callback
  const poll = setInterval(()=>{
    try {
      const hash = popup.location.hash;
      if(hash && hash.includes('access_token')){
        clearInterval(poll);
        popup.close();
        const params = new URLSearchParams(hash.substring(1));
        _gcToken = params.get('access_token');
        if(_gcToken){
          document.getElementById('gcAuthStatus').innerHTML='<span style="color:var(--mint);font-weight:800">✅ تم الدخول</span>';
          document.getElementById('gcStep3').style.opacity='1';
          document.getElementById('gcCoursesList').innerHTML='<button class="btn btn-green btn-sm" onclick="gcLoadCourses()">🔄 تحميل الفصول</button>';
          logChange('auth','تسجيل دخول Google Classroom','');
          toast('✅ تم تسجيل الدخول بنجاح','success');
        }
      }
    } catch(e) { /* cross-origin, keep polling */ }
    if(popup.closed){ clearInterval(poll); }
  }, 500);
}

// Handle OAuth redirect (if page reloaded with token in hash)
(function(){
  if(window.location.hash.includes('access_token')){
    const params = new URLSearchParams(window.location.hash.substring(1));
    _gcToken = params.get('access_token');
    history.replaceState(null,'',window.location.pathname);
  }
})();

async function gcLoadCourses(){
  if(!_gcToken){ toast('سجّل الدخول أولاً','error'); return; }
  const el = document.getElementById('gcCoursesList');
  el.innerHTML = '<span style="color:var(--muted);font-size:0.85rem">⏳ جاري تحميل الفصول...</span>';
  try {
    const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE',{
      headers:{ Authorization: 'Bearer '+_gcToken }
    });
    const data = await res.json();
    if(data.error){ throw new Error(data.error.message); }
    const courses = data.courses||[];
    if(!courses.length){ el.innerHTML='<span style="color:var(--muted)">لا توجد فصول نشطة</span>'; return; }
    el.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;">'+
      courses.map(c=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:white;border-radius:10px;border:1px solid rgba(66,133,244,0.20);">
          <div>
            <div style="font-weight:800;color:#1a73e8;">${c.name}</div>
            <div style="font-size:0.78rem;color:var(--muted)">${c.section||''} · ${c.enrollmentCode||''}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="gcImportStudents('${c.id}','${c.name.replace(/'/g,'')}')">⬇️ استيراد</button>
        </div>`).join('')+
      '</div>';
  } catch(e){
    el.innerHTML=`<span style="color:var(--ember)">❌ خطأ: ${e.message}</span>`;
    toast('فشل تحميل الفصول: '+e.message,'error');
  }
}

async function gcImportStudents(courseId, courseName){
  if(!_gcToken){ toast('سجّل الدخول أولاً','error'); return; }
  const res = document.getElementById('gcImportResult');
  res.style.display='block';
  res.textContent='⏳ جاري تحميل الطلاب...';
  try {
    const r = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students?pageSize=100`,{
      headers:{ Authorization:'Bearer '+_gcToken }
    });
    const data = await r.json();
    if(data.error) throw new Error(data.error.message);
    const students = data.students||[];
    if(!students.length){ res.textContent='لا يوجد طلاب في هذا الفصل'; return; }

    let added=0, skipped=0;
    students.forEach((stu,i)=>{
      const name = stu.profile?.name?.fullName || stu.profile?.name?.givenName || '';
      if(!name){ skipped++; return; }
      // Skip if already exists
      if(S.students.some(s=>s.name===name)){ skipped++; return; }
      S.students.push({
        id: genId(), name,
        num: S.students.length+1,
        parent:'', gender:'m',
        note:'مستورد من Google Classroom',
        createdAt: Date.now()
      });
      added++;
    });

    save();
    document.getElementById('nb-students').textContent = S.students.length;
    logChange('add',`استيراد من Google Classroom`,`${added} طالب من فصل ${courseName}`);
    res.innerHTML=`✅ تم استيراد <strong>${added}</strong> طالب جديد من "${courseName}"${skipped?` (${skipped} موجود مسبقاً)`:''} — <a href="javascript:showPage('students')" style="color:#1a73e8;font-weight:800">عرض الطلاب →</a>`;
    toast(`✅ تم استيراد ${added} طالب من Google Classroom`,'success');
    if(added>0) confetti();
  } catch(e){
    res.textContent='❌ خطأ: '+e.message;
    toast('فشل الاستيراد: '+e.message,'error');
  }
}

// Quick text import (no Google needed)
function importFromText(){
  const raw = document.getElementById('textImportNames')?.value||'';
  const names = raw.split('\n').map(n=>n.trim()).filter(n=>n.length>1);
  if(!names.length){ toast('أدخل أسماء الطلاب','error'); return; }
  let added=0, skipped=0;
  names.forEach(name=>{
    if(S.students.some(s=>s.name===name)){ skipped++; return; }
    S.students.push({
      id:genId(), name,
      num:S.students.length+1,
      parent:'', gender:'m', note:'', createdAt:Date.now()
    });
    added++;
  });
  save();
  document.getElementById('nb-students').textContent=S.students.length;
  logChange('add','استيراد من نص',`${added} طالب`);
  toast(`✅ تم إضافة ${added} طالب${skipped?` (${skipped} موجود)`:''}`,'success');
  if(added>0){ confetti(); showPage('students'); }
}
