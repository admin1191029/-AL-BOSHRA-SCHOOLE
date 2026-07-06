// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
function renderDash(){
  const td=today();
  const todayAtt=S.attendance[td]||{};
  const present=Object.values(todayAtt).filter(v=>v==='p').length;
  const absent=Object.values(todayAtt).filter(v=>v==='a').length;
  const excuse=Object.values(todayAtt).filter(v=>v==='e').length;
  const total=S.students.length;
  const notMarked=total-Object.keys(todayAtt).length;

  let totalMastery=0;
  S.students.forEach(s=>totalMastery+=studentMastery(s.id).total);
  const avgMastery=total?Math.round(totalMastery/total):0;

  const top5=S.students.map(s=>({...s,...studentMastery(s.id)}))
    .sort((a,b)=>b.total-a.total).slice(0,5);

  const recent=S.notes.slice(-4).reverse();

  // Weekly attendance data
  const weekDates=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    weekDates.push(d.toISOString().split('T')[0]);
  }

  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">لوحة التحكم</span></div>
  <div class="ph">
    <div>
      <div class="ph-title">أهلاً، ${S.teacher.n1}</div>
      <div class="ph-sub">${fmtDate(td)} · الصف الأول الابتدائي · مدارس البشرى الأهلية</div>
    </div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="showPage('students');openAddModal()"><i class="ti ti-plus"></i> إضافة طالب</button>
      <button class="btn btn-gold" onclick="showPage('reports')"><i class="ti ti-chart-bar"></i> التقارير</button>
      <button class="btn btn-ghost" onclick="cmToggleAppFullscreen()" title="ملء الشاشة للوحة التحكم"><i class="ti ti-maximize"></i> ملء الشاشة</button>
    </div>
  </div>

  <div class="kpi-grid">
    <div class="kpi blue">
      <div class="kpi-bg-icon"><i class="ti ti-users"></i></div>
      <span class="kpi-icon"><i class="ti ti-users"></i></span>
      <div class="kpi-val">${total}</div>
      <div class="kpi-label">إجمالي الطلاب</div>
      <div class="kpi-trend trend-up">الصف الأول الابتدائي</div>
    </div>
    <div class="kpi green">
      <div class="kpi-bg-icon"><i class="ti ti-circle-check"></i></div>
      <span class="kpi-icon"><i class="ti ti-circle-check"></i></span>
      <div class="kpi-val">${present}</div>
      <div class="kpi-label">حاضرون اليوم</div>
      <div class="kpi-trend ${present>absent?'trend-up':'trend-down'}">${total?Math.round((present/total)*100):0}% من الطلاب</div>
    </div>
    <div class="kpi red">
      <div class="kpi-bg-icon"><i class="ti ti-circle-x"></i></div>
      <span class="kpi-icon"><i class="ti ti-circle-x"></i></span>
      <div class="kpi-val">${absent}</div>
      <div class="kpi-label">غائبون اليوم</div>
      <div class="kpi-trend trend-down">${excuse} بعذر</div>
    </div>
    <div class="kpi gold">
      <div class="kpi-bg-icon"><i class="ti ti-star"></i></div>
      <span class="kpi-icon"><i class="ti ti-star"></i></span>
      <div class="kpi-val">${avgMastery}%</div>
      <div class="kpi-label">متوسط الإتقان</div>
      <div class="kpi-trend ${avgMastery>=60?'trend-up':'trend-down'}">${masteryLabel(avgMastery)}</div>
    </div>
    <div class="kpi plum">
      <div class="kpi-bg-icon"><i class="ti ti-note"></i></div>
      <span class="kpi-icon"><i class="ti ti-note"></i></span>
      <div class="kpi-val">${S.notes.length}</div>
      <div class="kpi-label">الملاحظات</div>
      <div class="kpi-trend trend-up">إجمالي الملاحظات المسجلة</div>
    </div>
  </div>

  <div class="dash-charts-grid">
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-chart-pie"></i> توزيع المستويات</h3><span class="badge badge-blue">لغتي</span></div>
      <div class="card-body">
        <div class="chart-h chart-h-220"><canvas id="dashLevelChart"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-calendar"></i> حضور الأسبوع</h3></div>
      <div class="card-body">
        <div class="chart-h chart-h-220"><canvas id="dashWeekChart"></canvas></div>
      </div>
    </div>
  </div>

  <div class="dash-cards-grid">
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-trophy"></i> أعلى الطلاب تقدماً</h3><button class="btn btn-ghost btn-sm" onclick="showPage('analytics')">عرض الكل</button></div>
      ${top5.length===0?`<div class="empty"><div class="empty-emoji"><i class="ti ti-seedling"></i></div><h3>لا توجد تقييمات بعد</h3><p>ابدأ بتقييم طلابك</p></div>`:`
      <div style="padding:14px 20px;display:flex;flex-direction:column;gap:12px;">
        ${top5.map((s,i)=>`
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="rank-circ ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</div>
            <div class="avatar av-32" style="${avatarStyle(s.id)};color:white;">${s.name.charAt(0)}</div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:0.88rem;margin-bottom:4px;">${s.name}</div>
              <div class="prog-wrap"><div class="prog-bar ${masteryColor(s.total)}" style="width:${s.total}%"></div></div>
            </div>
            <span class="badge badge-${masteryColor(s.total)}">${s.total}%</span>
          </div>
        `).join('')}
      </div>`}
    </div>

    <div class="card">
      <div class="card-header"><h3><i class="ti ti-note"></i> آخر الملاحظات</h3><button class="btn btn-ghost btn-sm" onclick="showPage('notes')">الكل</button></div>
      <div style="padding:14px 16px;">
        ${recent.length===0?`<div class="empty"><div class="empty-emoji"><i class="ti ti-note"></i></div><h3>لا توجد ملاحظات</h3></div>`:`
        <div class="timeline">
          ${recent.map((n,i)=>{
            const s=S.students.find(x=>x.id===n.sid);
            const cols={general:'blue',academic:'plum',behavior:'gold',parent:'green'};
            const col=cols[n.type]||'blue';
            return `<div class="tl-item">
              <div class="tl-line">
                <div class="tl-dot ${col}"></div>
                ${i<recent.length-1?'<div class="tl-connector"></div>':''}
              </div>
              <div class="tl-content">
                <div class="tl-date">${fmtShort(n.date)} · ${s?s.name:'عام'}</div>
                <div class="tl-text">${n.text.substring(0,60)}${n.text.length>60?'...':''}</div>
              </div>
            </div>`;
          }).join('')}
        </div>`}
      </div>
    </div>
  </div>

  ${notMarked>0?`
  <div class="note-card">
    <span class="note-icon">⚠️</span>
    <div>تذكير: لم يتم تسجيل حضور <strong>${notMarked}</strong> طالب اليوم. <button class="btn btn-xs btn-ghost" style="margin-right:8px;" onclick="showPage('attend')">سجّل الآن</button></div>
  </div>`:''}

  <!-- Quick actions strip -->
  <div class="quick-actions-strip">
    <div class="quick-actions-title"><i class="ti ti-bolt"></i> إجراءات سريعة</div>
    <div class="quick-actions-btns">
      <button class="btn btn-primary btn-sm" onclick="showPage('attend')"><i class="ti ti-clipboard-check"></i> سجّل الحضور</button>
      <button class="btn btn-plum btn-sm" onclick="startQuickEval(S.subjects[0]?.id,S.subjects[0]?.sections[0]?.id)"><i class="ti ti-bolt"></i> تقييم سريع</button>
      <button class="btn btn-green btn-sm" onclick="showPage('behavior')"><i class="ti ti-star"></i> تقييم السلوك</button>
      <button class="btn btn-gold btn-sm" onclick="showPage('planner')"><i class="ti ti-calendar"></i> خطة اليوم</button>
      <button class="btn btn-ghost btn-sm" onclick="showPage('insights')"><i class="ti ti-bulb"></i> الرؤى الذكية</button>
    </div>
  </div>

  <!-- Top insight preview -->
  ${(()=>{
    const ins=generateInsights()[0];
    if(!ins) return '';
    const colMap={ember:'rgba(239,68,68,0.07)',mint:'rgba(16,185,129,0.07)',gold:'rgba(245,158,11,0.07)',plum:'rgba(124,58,237,0.08)',sky:'rgba(21,101,192,0.07)'};
    const borderMap={ember:'rgba(239,68,68,0.22)',mint:'rgba(16,185,129,0.22)',gold:'rgba(245,158,11,0.22)',plum:'rgba(124,58,237,0.22)',sky:'rgba(21,101,192,0.22)'};
    return `<div class="insight-card" style="background:${colMap[ins.color]||colMap.plum};border-color:${borderMap[ins.color]||borderMap.plum};margin-top:14px">
      <span class="insight-icon">${ins.icon}</span>
      <div style="flex:1">
        <div class="insight-title">${ins.title}</div>
        <div class="insight-body" style="font-size:0.82rem">${ins.body.substring(0,120)}...</div>
      </div>
      <button class="insight-action" onclick="showPage('insights')">كل الرؤى ←</button>
    </div>`;
  })()}

  <!-- Quick Access Cards -->
  <div style="margin-top:24px;">
    <div class="quick-actions-title" style="margin-bottom:14px;"><i class="ti ti-layout-grid"></i> الوصول السريع للأقسام
      <button class="btn btn-ghost btn-sm" style="margin-right:10px;font-size:0.76rem;" onclick="showPage('combined_view')">عرض الكل ←</button>
    </div>
    <div class="nav-cards-grid">
      ${[
        {id:'attend',page:'attend',icon:'ti-clipboard-check',title:'الحضور اليومي',desc:'تسجيل حضور وغياب الطلاب',accent:'linear-gradient(90deg,#10b981,#42a5f5)',iconBg:'rgba(16,185,129,0.10)',iconBorder:'rgba(16,185,129,0.22)',iconShadow:'rgba(16,185,129,0.14)',badgeBg:'rgba(16,185,129,0.10)',badgeColor:'#059669',badgeBorder:'rgba(16,185,129,0.22)',badge:'يومي',stat:'الحضور'},
        {id:'students',page:'students',icon:'ti-users',title:'الطلاب',desc:'إدارة ملفات وبيانات الطلاب',accent:'linear-gradient(90deg,#7c3aed,#1565c0)',iconBg:'rgba(124,58,237,0.10)',iconBorder:'rgba(124,58,237,0.22)',iconShadow:'rgba(124,58,237,0.14)',badgeBg:'rgba(124,58,237,0.10)',badgeColor:'#6d28d9',badgeBorder:'rgba(124,58,237,0.22)',badge:'الطلاب',stat:'إدارة'},
        {id:'gradebook',page:'gradebook',icon:'ti-notebook',title:'دفتر الدرجات',desc:'رصد وتسجيل درجات الطلاب',accent:'linear-gradient(90deg,#f59e0b,#ef4444)',iconBg:'rgba(245,158,11,0.10)',iconBorder:'rgba(245,158,11,0.28)',iconShadow:'rgba(245,158,11,0.14)',badgeBg:'rgba(245,158,11,0.10)',badgeColor:'#b45309',badgeBorder:'rgba(245,158,11,0.28)',badge:'الدرجات',stat:'التقييم'},
        {id:'behavior',page:'behavior',icon:'ti-star',title:'السلوك',desc:'تقييم سلوك الطلاب يومياً',accent:'linear-gradient(90deg,#f59e0b,#10b981)',iconBg:'rgba(245,158,11,0.10)',iconBorder:'rgba(245,158,11,0.28)',iconShadow:'rgba(245,158,11,0.14)',badgeBg:'rgba(245,158,11,0.10)',badgeColor:'#92400e',badgeBorder:'rgba(245,158,11,0.28)',badge:'سلوكي',stat:'التحفيز'},
        {id:'reports',page:'reports',icon:'ti-chart-bar',title:'التقارير',desc:'تقارير وإحصاءات شاملة',accent:'linear-gradient(90deg,#7c3aed,#1565c0)',iconBg:'rgba(124,58,237,0.10)',iconBorder:'rgba(124,58,237,0.22)',iconShadow:'rgba(124,58,237,0.14)',badgeBg:'rgba(124,58,237,0.10)',badgeColor:'#5b21b6',badgeBorder:'rgba(124,58,237,0.22)',badge:'شهري',stat:'التقارير'},
        {id:'absence_report',page:'absence_report',icon:'ti-calendar-off',title:'تقرير الغياب',desc:'متابعة الغياب بعذر وبغير عذر',accent:'linear-gradient(90deg,#f59e0b,#f43f5e)',iconBg:'rgba(239,68,68,0.10)',iconBorder:'rgba(239,68,68,0.22)',iconShadow:'rgba(239,68,68,0.14)',badgeBg:'rgba(239,68,68,0.10)',badgeColor:'#991b1b',badgeBorder:'rgba(239,68,68,0.22)',badge:'جديد',stat:'الغياب'},
        {id:'planner',page:'planner',icon:'ti-calendar',title:'المخطط الأسبوعي',desc:'خطط الدروس والجداول الأسبوعية',accent:'linear-gradient(90deg,#8b5cf6,#f43f5e)',iconBg:'rgba(139,92,246,0.10)',iconBorder:'rgba(139,92,246,0.22)',iconShadow:'rgba(139,92,246,0.14)',badgeBg:'rgba(139,92,246,0.10)',badgeColor:'#6d28d9',badgeBorder:'rgba(139,92,246,0.22)',badge:'أسبوعي',stat:'التخطيط'},
        {id:'insights',page:'insights',icon:'ti-bulb',title:'رؤى ذكية',desc:'توصيات الذكاء الاصطناعي',accent:'linear-gradient(90deg,#8b5cf6,#42a5f5)',iconBg:'rgba(139,92,246,0.10)',iconBorder:'rgba(139,92,246,0.22)',iconShadow:'rgba(139,92,246,0.14)',badgeBg:'rgba(139,92,246,0.10)',badgeColor:'#4c1d95',badgeBorder:'rgba(139,92,246,0.22)',badge:'ذكاء اصطناعي',stat:'الرؤى'},
      ].map(c=>`<div class="nav-card" onclick="showPage('${c.page}')"
        style="--nc-accent:${c.accent};--nc-icon-bg:${c.iconBg};--nc-icon-border:${c.iconBorder};--nc-icon-shadow:${c.iconShadow};">
        <div class="nc-top">
          <div class="nc-icon"><i class="ti ${c.icon}"></i></div>
          <div class="nc-badge" style="background:${c.badgeBg};color:${c.badgeColor};border-color:${c.badgeBorder};">${c.badge}</div>
        </div>
        <div class="nc-title">${c.title}</div>
        <div class="nc-desc">${c.desc}</div>
        <div class="nc-footer">
          <div class="nc-stat">${c.stat}</div>
          <div class="nc-arrow">←</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
  `;
}

function initDashCharts(){
  // Level distribution
  const levels={excellent:0,good:0,needs:0};
  S.students.forEach(s=>{
    const t=studentMastery(s.id).total;
    if(t>=70)levels.excellent++; else if(t>=40)levels.good++; else levels.needs++;
  });
  const c1=document.getElementById('dashLevelChart');
  if(c1) new Chart(c1,{
    type:'doughnut',
    data:{
      labels:['ممتاز (70%+)','جيد (40-70%)','في بداية رحلته (<40%)'],
      datasets:[{data:[levels.excellent,levels.good,levels.needs],
        backgroundColor:['#059669','#1565c0','#10b981'],
        borderWidth:0, hoverOffset:8}]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{position:'bottom',labels:{font:{family:'Tajawal',size:12},padding:16}}}}
  });

  // Weekly attendance
  const weekDates=[];
  for(let i=6;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i);
    weekDates.push(d.toISOString().split('T')[0]);
  }
  const pData=weekDates.map(d=>Object.values(S.attendance[d]||{}).filter(v=>v==='p').length);
  const c2=document.getElementById('dashWeekChart');
  if(c2) new Chart(c2,{
    type:'bar',
    data:{
      labels:weekDates.map(d=>fmtShort(d)),
      datasets:[{label:'حاضرون',data:pData,
        backgroundColor:'rgba(21,101,192,0.75)',
        borderRadius:8,borderSkipped:false}]
    },
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true,max:Math.max(S.students.length,1),
        ticks:{stepSize:1,font:{family:'Tajawal'}}},
        x:{ticks:{font:{family:'Tajawal'}}}}}
  });
}

// ══════════════════════════════════════════════
// COMBINED VIEW — العرض الشامل
// ══════════════════════════════════════════════
const _cvCards = [
  { id:'dash',            group:'main',     icon:'ti-home',  title:'لوحة التحكم',         desc:'نظرة عامة على أداء الصف والإحصاءات اليومية',           accent:'linear-gradient(90deg,#1565c0,#42a5f5)', iconBg:'rgba(21,101,192,0.10)',  iconBorder:'rgba(21,101,192,0.22)',  iconShadow:'rgba(21,101,192,0.16)',  badgeBg:'rgba(21,101,192,0.10)',  badgeColor:'#1565c0',  badgeBorder:'rgba(21,101,192,0.22)',  badge:'رئيسي',      stat:'الصفحة الرئيسية' },
  { id:'students',        group:'mgmt',     icon:'ti-users',  title:'الطلاب',              desc:'إدارة بيانات الطلاب والملفات الشخصية الكاملة',          accent:'linear-gradient(90deg,#7c3aed,#1565c0)', iconBg:'rgba(124,58,237,0.10)',  iconBorder:'rgba(124,58,237,0.22)',  iconShadow:'rgba(124,58,237,0.14)',  badgeBg:'rgba(124,58,237,0.10)',  badgeColor:'#6d28d9',  badgeBorder:'rgba(124,58,237,0.22)',  badge:'الطلاب',     stat:'إدارة الطلاب' },
  { id:'attend',          group:'mgmt',     icon:'ti-clipboard-check',  title:'الحضور اليومي',       desc:'تسجيل الحضور والغياب يومياً مع تقارير تفصيلية',         accent:'linear-gradient(90deg,#10b981,#42a5f5)', iconBg:'rgba(16,185,129,0.10)',  iconBorder:'rgba(16,185,129,0.22)',  iconShadow:'rgba(16,185,129,0.14)',  badgeBg:'rgba(16,185,129,0.10)',  badgeColor:'#059669',  badgeBorder:'rgba(16,185,129,0.22)',  badge:'يومي',       stat:'تسجيل الحضور' },
  { id:'gradebook',       group:'mgmt',     icon:'ti-notebook',  title:'دفتر الدرجات',        desc:'تسجيل وتتبع درجات الطلاب عبر جميع المواد',             accent:'linear-gradient(90deg,#f59e0b,#ef4444)', iconBg:'rgba(245,158,11,0.10)',  iconBorder:'rgba(245,158,11,0.28)',  iconShadow:'rgba(245,158,11,0.16)',  badgeBg:'rgba(245,158,11,0.10)',  badgeColor:'#b45309',  badgeBorder:'rgba(245,158,11,0.28)',  badge:'الدرجات',    stat:'رصد الأداء' },
  { id:'seatmap',         group:'mgmt',     icon:'ti-armchair',  title:'خريطة المقاعد',       desc:'تنظيم ترتيب جلوس الطلاب داخل الفصل',                   accent:'linear-gradient(90deg,#06b6d4,#10b981)', iconBg:'rgba(6,182,212,0.10)',   iconBorder:'rgba(6,182,212,0.22)',   iconShadow:'rgba(6,182,212,0.14)',   badgeBg:'rgba(6,182,212,0.10)',   badgeColor:'#0e7490',  badgeBorder:'rgba(6,182,212,0.22)',   badge:'الفصل',      stat:'ترتيب المقاعد' },
  { id:'behavior',        group:'mgmt',     icon:'ti-star',  title:'تقييم السلوك',        desc:'تقييم السلوك اليومي وتوثيق الإيجابيات والتحديات',       accent:'linear-gradient(90deg,#f59e0b,#10b981)', iconBg:'rgba(245,158,11,0.10)',  iconBorder:'rgba(245,158,11,0.28)',  iconShadow:'rgba(245,158,11,0.14)',  badgeBg:'rgba(245,158,11,0.10)',  badgeColor:'#92400e',  badgeBorder:'rgba(245,158,11,0.28)',  badge:'سلوكي',      stat:'التقييم اليومي' },
  { id:'planner',         group:'mgmt',     icon:'ti-calendar',  title:'المخطط الأسبوعي',     desc:'تنظيم الخطط الدراسية الأسبوعية والأهداف التعليمية',     accent:'linear-gradient(90deg,#8b5cf6,#f43f5e)', iconBg:'rgba(139,92,246,0.10)',  iconBorder:'rgba(139,92,246,0.22)',  iconShadow:'rgba(139,92,246,0.14)',  badgeBg:'rgba(139,92,246,0.10)',  badgeColor:'#6d28d9',  badgeBorder:'rgba(139,92,246,0.22)',  badge:'أسبوعي',     stat:'خطة الدروس' },
  { id:'goals',           group:'mgmt',     icon:'ti-target',  title:'الأهداف والخطط',      desc:'متابعة الأهداف التعليمية وخطط التطوير الفردية',         accent:'linear-gradient(90deg,#ef4444,#f59e0b)', iconBg:'rgba(239,68,68,0.10)',   iconBorder:'rgba(239,68,68,0.22)',   iconShadow:'rgba(239,68,68,0.14)',   badgeBg:'rgba(239,68,68,0.10)',   badgeColor:'#b91c1c',  badgeBorder:'rgba(239,68,68,0.22)',   badge:'الأهداف',    stat:'تتبع التقدم' },
  { id:'curriculum',      group:'subjects', icon:'ti-books',  title:'إدارة المواد',        desc:'إعداد المواد الدراسية والمهارات والوحدات التعليمية',     accent:'linear-gradient(90deg,#1565c0,#8b5cf6)', iconBg:'rgba(21,101,192,0.10)',  iconBorder:'rgba(21,101,192,0.22)',  iconShadow:'rgba(21,101,192,0.14)',  badgeBg:'rgba(21,101,192,0.10)',  badgeColor:'#1e40af',  badgeBorder:'rgba(21,101,192,0.22)',  badge:'المناهج',    stat:'المحتوى الدراسي' },
  { id:'notes',           group:'subjects', icon:'ti-note',  title:'الملاحظات',           desc:'تسجيل الملاحظات الأكاديمية والسلوكية والعامة',           accent:'linear-gradient(90deg,#10b981,#8b5cf6)', iconBg:'rgba(16,185,129,0.10)',  iconBorder:'rgba(16,185,129,0.22)',  iconShadow:'rgba(16,185,129,0.14)',  badgeBg:'rgba(16,185,129,0.10)',  badgeColor:'#065f46',  badgeBorder:'rgba(16,185,129,0.22)',  badge:'ملاحظات',    stat:'التوثيق' },
  { id:'resources',       group:'subjects', icon:'ti-cloud',  title:'مكتبة الموارد',       desc:'ملفات وموارد تعليمية منظمة وسهلة الوصول',               accent:'linear-gradient(90deg,#06b6d4,#1565c0)', iconBg:'rgba(6,182,212,0.10)',   iconBorder:'rgba(6,182,212,0.22)',   iconShadow:'rgba(6,182,212,0.14)',   badgeBg:'rgba(6,182,212,0.10)',   badgeColor:'#155e75',  badgeBorder:'rgba(6,182,212,0.22)',   badge:'الموارد',    stat:'المكتبة الرقمية' },
  { id:'reports',         group:'reports',  icon:'ti-chart-bar',  title:'التقارير',            desc:'تقارير وتحليلات إحصائية شاملة لأداء الطلاب',           accent:'linear-gradient(90deg,#7c3aed,#1565c0)', iconBg:'rgba(124,58,237,0.10)',  iconBorder:'rgba(124,58,237,0.22)',  iconShadow:'rgba(124,58,237,0.14)',  badgeBg:'rgba(124,58,237,0.10)',  badgeColor:'#5b21b6',  badgeBorder:'rgba(124,58,237,0.22)',  badge:'شهري',       stat:'تقارير الأداء' },
  { id:'absence_report',  group:'reports',  icon:'ti-calendar-off',  title:'تقرير الغياب',        desc:'متابعة الغياب وتصنيفه مع إحصاءات فترية مفصّلة',        accent:'linear-gradient(90deg,#f59e0b,#f43f5e)', iconBg:'rgba(239,68,68,0.10)',   iconBorder:'rgba(239,68,68,0.22)',   iconShadow:'rgba(239,68,68,0.14)',   badgeBg:'rgba(239,68,68,0.10)',   badgeColor:'#991b1b',  badgeBorder:'rgba(239,68,68,0.22)',   badge:'جديد',       stat:'إحصاء الغياب' },
  { id:'analytics',       group:'reports',  icon:'ti-chart-line',  title:'تحليلات',             desc:'رسوم بيانية تفصيلية لمستويات الطلاب والاتجاهات',       accent:'linear-gradient(90deg,#10b981,#42a5f5)', iconBg:'rgba(16,185,129,0.10)',  iconBorder:'rgba(16,185,129,0.22)',  iconShadow:'rgba(16,185,129,0.14)',  badgeBg:'rgba(16,185,129,0.10)',  badgeColor:'#064e3b',  badgeBorder:'rgba(16,185,129,0.22)',  badge:'تحليل',      stat:'البيانات والرسوم' },
  { id:'insights',        group:'reports',  icon:'ti-bulb',  title:'رؤى ذكية',            desc:'توصيات مدعومة بالذكاء الاصطناعي لتحسين أداء الطلاب',   accent:'linear-gradient(90deg,#8b5cf6,#42a5f5)', iconBg:'rgba(139,92,246,0.10)',  iconBorder:'rgba(139,92,246,0.22)',  iconShadow:'rgba(139,92,246,0.14)',  badgeBg:'rgba(139,92,246,0.10)',  badgeColor:'#4c1d95',  badgeBorder:'rgba(139,92,246,0.22)',  badge:'ذكاء اصطناعي', stat:'الرؤى التحليلية' },
  { id:'compare',         group:'reports',  icon:'ti-chart-bar',  title:'مقارنة الفصول',       desc:'مقارنة أداء الفصول الدراسية المختلفة',                   accent:'linear-gradient(90deg,#1565c0,#10b981)', iconBg:'rgba(21,101,192,0.10)',  iconBorder:'rgba(21,101,192,0.22)',  iconShadow:'rgba(21,101,192,0.14)',  badgeBg:'rgba(21,101,192,0.10)',  badgeColor:'#1e40af',  badgeBorder:'rgba(21,101,192,0.22)',  badge:'مقارنة',     stat:'تقييم الفصول' },
  { id:'meetings',        group:'comm',     icon:'ti-messages',  title:'لقاءات الأولياء',     desc:'جدولة وتوثيق اجتماعات أولياء الأمور ونتائجها',          accent:'linear-gradient(90deg,#10b981,#f59e0b)', iconBg:'rgba(16,185,129,0.10)',  iconBorder:'rgba(16,185,129,0.22)',  iconShadow:'rgba(16,185,129,0.14)',  badgeBg:'rgba(16,185,129,0.10)',  badgeColor:'#065f46',  badgeBorder:'rgba(16,185,129,0.22)',  badge:'الأولياء',   stat:'التواصل' },
  { id:'photos',          group:'comm',     icon:'ti-camera',  title:'صور الطلاب',          desc:'إدارة صور ملفات الطلاب الشخصية',                         accent:'linear-gradient(90deg,#f43f5e,#f59e0b)', iconBg:'rgba(244,63,94,0.10)',   iconBorder:'rgba(244,63,94,0.22)',   iconShadow:'rgba(244,63,94,0.14)',   badgeBg:'rgba(244,63,94,0.10)',   badgeColor:'#9f1239',  badgeBorder:'rgba(244,63,94,0.22)',   badge:'صور',        stat:'ملفات الطلاب' },
  { id:'classroom_mode',  group:'tools',    icon:'ti-school',  title:'وضع الحصة',           desc:'عرض تفاعلي للدرس مع أدوات الرسم والعرض والتحكم',       accent:'linear-gradient(90deg,#1565c0,#f59e0b)', iconBg:'rgba(21,101,192,0.10)',  iconBorder:'rgba(21,101,192,0.22)',  iconShadow:'rgba(21,101,192,0.14)',  badgeBg:'rgba(21,101,192,0.10)',  badgeColor:'#1e40af',  badgeBorder:'rgba(21,101,192,0.22)',  badge:'حصة مباشرة', stat:'أدوات التدريس' },
  { id:'games_bank',      group:'tools',    icon:'ti-device-gamepad-2',  title:'بنك الألعاب',         desc:'ألعاب تعليمية تفاعلية لتحفيز الطلاب',                   accent:'linear-gradient(90deg,#8b5cf6,#f43f5e)', iconBg:'rgba(139,92,246,0.10)',  iconBorder:'rgba(139,92,246,0.22)',  iconShadow:'rgba(139,92,246,0.14)',  badgeBg:'rgba(139,92,246,0.10)',  badgeColor:'#4c1d95',  badgeBorder:'rgba(139,92,246,0.22)',  badge:'ألعاب',      stat:'التعلم باللعب' },
  { id:'treasuremap',     group:'tools',    icon:'ti-map-2',  title:'خريطة الكنز',         desc:'نظام مكافآت تحفيزي ممتع للطلاب',                        accent:'linear-gradient(90deg,#f59e0b,#ef4444)', iconBg:'rgba(245,158,11,0.10)',  iconBorder:'rgba(245,158,11,0.28)',  iconShadow:'rgba(245,158,11,0.14)',  badgeBg:'rgba(245,158,11,0.10)',  badgeColor:'#92400e',  badgeBorder:'rgba(245,158,11,0.28)',  badge:'تحفيز',      stat:'نظام المكافآت' },
  { id:'profile',         group:'settings', icon:'ti-settings',  title:'الملف الشخصي',        desc:'إعدادات الحساب والتفضيلات والمظهر',                     accent:'linear-gradient(90deg,#6b7280,#1565c0)', iconBg:'rgba(107,114,128,0.10)', iconBorder:'rgba(107,114,128,0.22)', iconShadow:'rgba(107,114,128,0.14)', badgeBg:'rgba(107,114,128,0.10)', badgeColor:'#374151',  badgeBorder:'rgba(107,114,128,0.22)', badge:'إعدادات',    stat:'الملف الشخصي' },
  { id:'changelog',       group:'settings', icon:'ti-history',  title:'سجل التغييرات',       desc:'آخر التحديثات والميزات الجديدة في المنصة',               accent:'linear-gradient(90deg,#1565c0,#10b981)', iconBg:'rgba(21,101,192,0.10)',  iconBorder:'rgba(21,101,192,0.22)',  iconShadow:'rgba(21,101,192,0.14)',  badgeBg:'rgba(21,101,192,0.10)',  badgeColor:'#1e40af',  badgeBorder:'rgba(21,101,192,0.22)',  badge:'جديد',       stat:'التحديثات' },
  { id:'about',           group:'settings', icon:'ti-info-circle',  title:'حول التطبيق',         desc:'معلومات عن منصة المعلم الذكية ومدارس البشرى',           accent:'linear-gradient(90deg,#42a5f5,#10b981)', iconBg:'rgba(66,165,245,0.10)',  iconBorder:'rgba(66,165,245,0.22)',  iconShadow:'rgba(66,165,245,0.14)',  badgeBg:'rgba(66,165,245,0.10)',  badgeColor:'#1565c0',  badgeBorder:'rgba(66,165,245,0.22)',  badge:'عن التطبيق', stat:'البشرى' },
];

const _cvGroupLabels = {
  main:'الرئيسية', mgmt:'إدارة الصف', subjects:'المواد والمحتوى',
  reports:'التقارير والتحليلات', comm:'التواصل', tools:'أدوات التدريس', settings:'الإعدادات'
};

let _cvActiveFilter = 'all';
let _cvSearch = '';

function _cvCardHTML(c) {
  return `<div class="nav-card" onclick="showPage('${c.id}')"
    style="--nc-accent:${c.accent};--nc-icon-bg:${c.iconBg};--nc-icon-border:${c.iconBorder};--nc-icon-shadow:${c.iconShadow};">
    <div class="nc-top">
      <div class="nc-icon"><i class="ti ${c.icon}"></i></div>
      <div class="nc-badge" style="background:${c.badgeBg};color:${c.badgeColor};border-color:${c.badgeBorder};">${c.badge}</div>
    </div>
    <div class="nc-title">${c.title}</div>
    <div class="nc-desc">${c.desc}</div>
    <div class="nc-footer">
      <div class="nc-stat">${c.stat}</div>
      <div class="nc-arrow">←</div>
    </div>
  </div>`;
}

function renderCombinedView() {
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">العرض الشامل</span></div>
  <div class="ph">
    <div>
      <div class="ph-title"><i class="ti ti-stack-2"></i> العرض الشامل</div>
      <div class="ph-sub">جميع أقسام المنصة في مكان واحد</div>
    </div>
  </div>
  <div class="cv-filter-strip">
    <span class="cv-filter-label">تصفية:</span>
    <button class="cv-filter-btn ${_cvActiveFilter==='all'?'active':''}" onclick="_cvSetFilter('all',this)">الكل</button>
    <button class="cv-filter-btn ${_cvActiveFilter==='mgmt'?'active':''}" onclick="_cvSetFilter('mgmt',this)">إدارة الصف</button>
    <button class="cv-filter-btn ${_cvActiveFilter==='subjects'?'active':''}" onclick="_cvSetFilter('subjects',this)">المواد</button>
    <button class="cv-filter-btn ${_cvActiveFilter==='reports'?'active':''}" onclick="_cvSetFilter('reports',this)">التقارير</button>
    <button class="cv-filter-btn ${_cvActiveFilter==='tools'?'active':''}" onclick="_cvSetFilter('tools',this)">الأدوات</button>
    <button class="cv-filter-btn ${_cvActiveFilter==='comm'?'active':''}" onclick="_cvSetFilter('comm',this)">التواصل</button>
    <div class="cv-search">
      <span style="color:var(--muted2);font-size:14px;"><i class="ti ti-search"></i></span>
      <input type="text" placeholder="ابحث عن قسم..." value="${_cvSearch}" oninput="_cvSearchCards(this.value)">
    </div>
  </div>
  <div id="cvContent">${_cvRenderContent()}</div>`;
}

function _cvRenderContent() {
  const q = _cvSearch.trim();
  let filtered = q
    ? _cvCards.filter(c => c.title.includes(q) || c.desc.includes(q) || c.badge.includes(q))
    : (_cvActiveFilter === 'all' ? _cvCards : _cvCards.filter(c => c.group === _cvActiveFilter));

  if (!filtered.length) return `<div style="text-align:center;padding:60px 20px;color:var(--muted);font-size:1rem;">لا توجد نتائج لـ "${q}"</div>`;

  if (q || _cvActiveFilter !== 'all') {
    return `<div class="nav-cards-grid">${filtered.map(_cvCardHTML).join('')}</div>`;
  }
  const groups = {};
  filtered.forEach(c => { if (!groups[c.group]) groups[c.group] = []; groups[c.group].push(c); });
  return Object.entries(groups).map(([g,cs]) => `
    <div class="cv-group">
      <div class="cv-group-title">${_cvGroupLabels[g]||g}</div>
      <div class="nav-cards-grid">${cs.map(_cvCardHTML).join('')}</div>
    </div>`).join('');
}

function _cvSetFilter(f, btn) {
  _cvActiveFilter = f; _cvSearch = '';
  const el = document.getElementById('cvContent');
  if (el) el.innerHTML = _cvRenderContent();
  document.querySelectorAll('.cv-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function _cvSearchCards(q) {
  _cvSearch = q;
  const el = document.getElementById('cvContent');
  if (el) el.innerHTML = _cvRenderContent();
}
