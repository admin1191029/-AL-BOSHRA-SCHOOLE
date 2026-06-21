// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════
// ── نظام الدخول الحقيقي عبر Firebase Authentication ──
let AUTH_MODE = 'signin'; // 'signin' | 'signup'

function _authEl(id){ return document.getElementById(id); }
function authClearMsgs(){
  const e=_authEl('authError'), i=_authEl('authInfo');
  if(e){e.style.display='none';e.textContent='';}
  if(i){i.style.display='none';i.textContent='';}
}
function authShowError(msg){
  const e=_authEl('authError'); if(e){e.textContent=msg;e.style.display='block';}
  const i=_authEl('authInfo'); if(i)i.style.display='none';
}
function authShowInfo(msg){
  const i=_authEl('authInfo'); if(i){i.textContent=msg;i.style.display='block';}
  const e=_authEl('authError'); if(e)e.style.display='none';
}

function authToggleMode(){
  AUTH_MODE = (AUTH_MODE==='signin') ? 'signup' : 'signin';
  const signup = AUTH_MODE==='signup';
  _authEl('authNameGroup').style.display = signup ? 'block' : 'none';
  _authEl('authTitle').textContent = signup ? 'إنشاء حساب جديد ✨' : 'أهلاً بك 👋';
  _authEl('authSubtitle').textContent = signup ? 'سجّل بياناتك لإنشاء حسابك' : 'سجّل دخولك للبدء في متابعة طلابك';
  _authEl('authSubmitBtn').textContent = signup ? 'إنشاء الحساب ←' : 'دخول ←';
  _authEl('authToggleText').textContent = signup ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟';
  _authEl('authToggleLink').textContent = signup ? 'سجّل الدخول' : 'أنشئ حساباً جديداً';
  _authEl('authForgot').style.display = signup ? 'none' : 'inline';
  _authEl('authPassword').setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
  authClearMsgs();
}

function _authMapError(e){
  const c = (e && e.code) || '';
  const m = {
    'auth/invalid-email':'البريد الإلكتروني غير صحيح',
    'auth/user-disabled':'هذا الحساب موقوف',
    'auth/user-not-found':'لا يوجد حساب بهذا البريد',
    'auth/wrong-password':'كلمة المرور غير صحيحة',
    'auth/invalid-credential':'البريد أو كلمة المرور غير صحيحة',
    'auth/email-already-in-use':'هذا البريد مستخدم بالفعل — سجّل الدخول',
    'auth/weak-password':'كلمة المرور ضعيفة (٦ أحرف على الأقل)',
    'auth/too-many-requests':'محاولات كثيرة جداً — حاول لاحقاً',
    'auth/network-request-failed':'تعذّر الاتصال بالإنترنت',
    'auth/popup-closed-by-user':'تم إغلاق نافذة Google قبل إتمام الدخول',
    'auth/popup-blocked':'المتصفح منع النافذة المنبثقة — اسمح بها وحاول ثانية',
    'auth/operation-not-allowed':'طريقة الدخول هذه غير مُفعّلة في إعدادات المشروع',
    'auth/configuration-not-found':'لم يتم تفعيل خدمة الدخول بعد في لوحة Firebase (Authentication)'
  };
  return m[c] || (e && e.message) || 'حدث خطأ — حاول مجدداً';
}

async function authSubmit(){
  if(!fbReady){ authShowError('خدمة الدخول غير متاحة حالياً'); return; }
  const email=(_authEl('authEmail').value||'').trim();
  const pass=_authEl('authPassword').value||'';
  const btn=_authEl('authSubmitBtn');
  authClearMsgs();
  if(!email){ authShowError('أدخل البريد الإلكتروني'); return; }
  if(pass.length<6){ authShowError('كلمة المرور ٦ أحرف على الأقل'); return; }
  const orig=btn.textContent; btn.disabled=true; btn.textContent='⏳ جاري...';
  try{
    if(AUTH_MODE==='signup'){
      const name=(_authEl('authName').value||'').trim();
      if(!name){ authShowError('أدخل اسمك'); btn.disabled=false; btn.textContent=orig; return; }
      const cred=await fbAuth.createUserWithEmailAndPassword(email,pass);
      if(cred.user && name){ await cred.user.updateProfile({ displayName:name }); }
      try{ SFX.play('confetti'); }catch(e){}
    } else {
      await fbAuth.signInWithEmailAndPassword(email,pass);
      try{ SFX.play('confetti'); }catch(e){}
    }
    // onAuthStateChanged سيتولّى الدخول للتطبيق
  }catch(e){
    authShowError(_authMapError(e));
    try{ SFX.play('wrong'); }catch(_){}
    btn.disabled=false; btn.textContent=orig;
  }
}

async function authGoogle(){
  if(!fbReady){ authShowError('خدمة الدخول غير متاحة حالياً'); return; }
  authClearMsgs();
  try{
    const provider=new firebase.auth.GoogleAuthProvider();
    await fbAuth.signInWithPopup(provider);
    try{ SFX.play('confetti'); }catch(e){}
  }catch(e){
    authShowError(_authMapError(e));
  }
}

async function authReset(){
  if(!fbReady){ authShowError('الخدمة غير متاحة حالياً'); return; }
  const email=(_authEl('authEmail').value||'').trim();
  authClearMsgs();
  if(!email){ authShowError('أدخل بريدك الإلكتروني أولاً لإرسال رابط الاستعادة'); return; }
  try{
    await fbAuth.sendPasswordResetEmail(email);
    authShowInfo('📧 أرسلنا رابط استعادة كلمة المرور إلى بريدك');
  }catch(e){
    authShowError(_authMapError(e));
  }
}

// ── مراقبة حالة الدخول — تقرر أي شاشة تظهر (تُستدعى من الإقلاع) ──
function initAuth(){
  if(!fbReady || !fbAuth){
    document.getElementById('loginScreen').style.display='flex';
    authShowError('تعذّر الاتصال بخدمة الدخول — تحقق من الإنترنت');
    return;
  }
  fbAuth.onAuthStateChanged(function(user){
    if(user){
      _applyAuthUser(user);
      document.getElementById('licenseScreen').style.display='none';
      document.getElementById('loginScreen').style.display='none';
      enterApp();
    } else {
      document.getElementById('app').style.display='none';
      document.getElementById('loginScreen').style.display='flex';
    }
  });
}

function _applyAuthUser(user){
  const dn=(user.displayName || (user.email||'').split('@')[0] || 'معلم').trim();
  const parts=dn.split(/\s+/);
  // احتفظ باسم سبق تعديله من الملف الشخصي إن وُجد
  if(!S.teacher || !S.teacher.n1){
    S.teacher={ n1:parts[0]||'معلم', n2:parts.slice(1).join(' ')||'', n3:'', photo:(S.teacher&&S.teacher.photo)||'' };
  }
  S.user={
    provider:(user.providerData[0] && user.providerData[0].providerId) || 'password',
    uid:user.uid, email:user.email||'', name:dn, loginAt:Date.now()
  };
  save();
  try{ logChange('auth','تسجيل دخول',`${S.user.provider==='google.com'?'Google':'بريد'} — ${S.teacher.n1}`); }catch(e){}
}

function fullName(){
  return [S.teacher.n3,S.teacher.n1,S.teacher.n2].filter(Boolean).join(' ');
}


// ── إضافة طلاب تجريبيين إذا كان الفصل فارغاً ─────────────
function addDemoStudents(){
  if(S.students.length > 0) return;
  const names = [
    {n:'أحمد محمد العمري',   p:'+966501234001', g:'m'},
    {n:'فاطمة علي الزهراني', p:'+966501234002', g:'f'},
    {n:'محمد سعد القحطاني',  p:'+966501234003', g:'m'},
    {n:'نورة خالد الشهري',   p:'+966501234004', g:'f'},
    {n:'عبدالله يوسف الغامدي',p:'+966501234005', g:'m'},
    {n:'ريم ناصر الدوسري',   p:'+966501234006', g:'f'},
    {n:'سلطان حمد البلوي',   p:'+966501234007', g:'m'},
    {n:'لمى عمر الحربي',     p:'+966501234008', g:'f'},
    {n:'يوسف راشد المطيري',  p:'+966501234009', g:'m'},
    {n:'هند سالم العتيبي',   p:'+966501234010', g:'f'},
  ];
  names.forEach((x,i)=>{
    S.students.push({
      id: genId(),
      name: x.n,
      num: i+1,
      parent: x.p,
      gender: x.g,
      note: '',
      photo: '',
      createdAt: Date.now()
    });
  });
  save();
  toast('✅ تم إضافة 10 طلاب تجريبيين','success');
}

function enterApp(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('tbName').textContent=S.teacher.n1||'معلم';
  const tbLogo=document.getElementById('tbLogoImg'); if(tbLogo) tbLogo.src=SCHOOL_LOGO;
  // Teacher avatar — photo or initial
  function _setTeacherAvatars(){
    const initial = S.teacher.n1.charAt(0)||'م';
    ['tbAvatar','sbAvatar'].forEach(id=>{
      const el=document.getElementById(id);
      if(!el) return;
      if(S.teacher.photo){
        el.style.background='none';
        el.style.boxShadow='0 4px 16px rgba(0,0,0,0.25)';
        el.innerHTML=`<img src="${S.teacher.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`;
      } else {
        el.style.background='';
        el.style.boxShadow='';
        el.innerHTML=`<span style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:inherit;font-weight:900;">${initial}</span>`;
      }
    });
  }
  _setTeacherAvatars();
  document.getElementById('sbName').textContent=fullName();
  document.getElementById('nb-students').textContent=S.students.length;
  document.getElementById('nb-notes').textContent=S.notes.length;
  const nbRes=document.getElementById('nb-resources');if(nbRes){const rc=(S.resources||[]).length;nbRes.textContent=rc;nbRes.style.display=rc>0?'flex':'none';}
  const nbg=document.getElementById('nb-goals');
  if(nbg) nbg.textContent=S.goals.filter(g=>!g.done).length;
  addDemoStudents();
  initClassMeta();
  applyTheme();
  bagLoadAllActivities();
  bagLoadAllBooks().catch(function(){});
  rebuildSubjectNav();
  buildNotifs();
  // Changelog badge
  const nbc=document.getElementById('nb-changelog');
  if(nbc) nbc.textContent=S.changelog?.length||0;
  // Mobile bottom nav badge
  const bnn=document.getElementById('bnn-students');
  if(bnn){ bnn.textContent=S.students.length; bnn.style.display=S.students.length>0?'flex':'none'; }
  // Take weekly snapshot for progress tracking
  ensureWeeklySnapshot();
  save(); // حفظ فوري عند الدخول لضمان البيانات في الـ key الصح
  showPage('dash');
  setBnActive('dash');
  setTimeout(initPWA, 1000);
}

function doLogout(){
  if(!confirm('تسجيل الخروج؟ بياناتك محفوظة على جهازك.')) return;
  if(fbReady && fbAuth){
    fbAuth.signOut().catch(function(e){ console.warn('signOut', e&&e.message); });
    // onAuthStateChanged سيُظهر شاشة الدخول تلقائياً
  } else {
    document.getElementById('app').style.display='none';
    document.getElementById('loginScreen').style.display='flex';
  }
}

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════
const PAGES=['dash','combined_view','students','attend','arabic','reports','absence_report','analytics','gradebook','notes','seatmap','behavior','goals','planner','meetings','insights','treasuremap','classroom_mode','games_bank','photos','changelog','classroom','curriculum','profile','about','compare'];
function showPage(p){
  PAGES.forEach(id=>{
    const n=document.getElementById('nav-'+id);
    if(n) n.classList.toggle('active',id===p);
  });
  // dynamic subject pages
  document.querySelectorAll('.dyn-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.sid===p));
  const c=document.getElementById('mainContent');
  const renderers={
    dash:renderDash, combined_view:renderCombinedView, students:renderStudents, attend:renderAttend,
    arabic:()=>renderSubjectPage(S.subjects[0]?.id||'sub_arabic'),
    reports:renderReports, absence_report:renderAbsenceReport, analytics:renderAnalytics,
    gradebook:renderGradeBook, notes:renderNotes, seatmap:renderSeatMap,
    behavior:renderBehavior, goals:renderGoals, planner:renderPlanner,
    meetings:renderMeetings, insights:renderInsights, treasuremap:renderTreasureMap,
    classroom_mode:renderClassroomMode, games_bank:renderGamesBank, photos:renderPhotoManager,
    changelog:renderChangelog, classroom:renderClassroomImport,
    about:renderAbout, compare:renderCompare, profile:renderProfile, curriculum:renderCurriculum,
    resources:renderResources
  };
  const subMatch=S.subjects.find(s=>s.id===p);
  if(subMatch){ c.innerHTML=renderSubjectPage(p); }
  else { c.innerHTML=(renderers[p]||renderDash)(); }
  c.scrollTop=0; closeCmd();
  // Mobile bottom nav sync
  if(window.innerWidth<=960){
    setBnActive(p);
    const fab=document.getElementById('fab');
    if(fab){
      const fabPages={students:'➕',notes:'📝',goals:'🎯',meetings:'🤝'};
      if(fabPages[p]){fab.textContent=fabPages[p];fab.classList.add('show');}
      else{fab.classList.remove('show');}
    }
  }
  setTimeout(()=>initPage(p),80);
}

function rebuildSubjectNav(){
  const el=document.getElementById('subjectNavList');
  if(!el) return;
  el.innerHTML=S.subjects.map(sub=>`
    <button class="nav-btn dyn-nav-btn" data-sid="${sub.id}" onclick="showPage('${sub.id}')">
      <span class="nav-icon">${sub.icon||'📚'}</span> ${sub.name}
    </button>
  `).join('');
}

function initPage(p){
  if(p==='dash') initDashCharts();
  if(p==='reports') initReportCharts();
  if(p==='absence_report') initAbsenceReportCharts();
  if(p==='analytics') initAnalyticsCharts();
  if(p==='insights') setTimeout(animateInsights,100);
  if(p==='treasuremap') setTimeout(initTreasureMap,80);
  if(p==='profile'){
    setTimeout(updatePWAStatus,50);
    bsLoadAiSettingsIntoForm();
  }
  const subMatch=S.subjects.find(s=>s.id===p);
  if(subMatch){
    bagRenderActivities(subMatch.id);
    bagRenderBooks(subMatch.id);
  }
}

function updatePWAStatus(){
  const dot = document.getElementById('pwaColorDot');
  const txt = document.getElementById('pwaOnlineText');
  const status = document.getElementById('pwaInstallStatus');
  if(dot) dot.style.background = navigator.onLine ? 'var(--mint)' : 'var(--ember)';
  if(txt) txt.textContent = navigator.onLine ? 'متصل بالإنترنت' : 'غير متصل — يعمل offline';
  if(status) status.textContent = _pwaPrompt ? '⬇️ يمكن تثبيت التطبيق على جهازك' : '✅ التطبيق محفوظ محلياً';
}
