// ══════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════
function doLogin(provider){
  const n1=(document.getElementById('ln1').value||'').trim();
  const n2=(document.getElementById('ln2').value||'').trim();
  const n3=(document.getElementById('ln3').value||'').trim();
  if(!n1){toast('الرجاء إدخال الاسم الأول','error');return;}
  S.teacher={n1,n2,n3};
  S.user={provider,name:fullName(),loginAt:Date.now()};
  save();
  logChange('auth','تسجيل دخول',`${provider==='google'?'Google':'محلي'} — ${S.teacher.n1}`);
  enterApp();
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
  if(!confirm('تسجيل الخروج؟ بياناتك محفوظة.')) return;
  document.getElementById('app').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('ln1').value=S.teacher.n1||'';
  document.getElementById('ln2').value=S.teacher.n2||'';
  document.getElementById('ln3').value=S.teacher.n3||'';
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
