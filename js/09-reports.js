// ══════════════════════════════════════════════
// REPORTS PAGE
// ══════════════════════════════════════════════
// ── Active report subject filter ────────────────────────────
let _repSubId = '__all__'; // '__all__' or a specific subject id

function renderReports(){
  // Determine which subjects/sections to show
  const activeSubs = _repSubId==='__all__'
    ? S.subjects
    : S.subjects.filter(s=>s.id===_repSubId);

  // Per-student mastery for the active filter
  function filteredMastery(sid){
    let m=0, t=0;
    activeSubs.forEach(sub=>sub.sections.forEach(sec=>{
      const ev=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
      m+=Object.values(ev).filter(v=>v==='m').length;
      t+=sec.skills.length;
    }));
    return { m, t, pct: t?Math.round((m/t)*100):0 };
  }

  const avgPct = S.students.length
    ? Math.round(S.students.reduce((a,s)=>a+filteredMastery(s.id).pct,0)/S.students.length)
    : 0;

  const subjectLabel = _repSubId==='__all__'
    ? 'جميع المواد'
    : (S.subjects.find(s=>s.id===_repSubId)?.name||'');

  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">التقارير</span></div>
  <div class="ph">
    <div><div class="ph-title">📄 التقارير والمشاركة</div>
    <div class="ph-sub">توليد وإرسال التقارير للأولياء والمدرسة</div></div>
  </div>

  <!-- Subject Filter Tabs -->
  <div style="margin-bottom:18px;">
    <div style="font-size:0.78rem;font-weight:900;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">📚 اختر المادة لعرض تقريرها</div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;">
      <button class="btn ${_repSubId==='__all__'?'btn-primary':'btn-ghost'} btn-sm"
        onclick="_repSubId='__all__';showPage('reports')">
        🗂️ جميع المواد
      </button>
      ${S.subjects.map(sub=>`
        <button class="btn ${_repSubId===sub.id?'btn-primary':'btn-ghost'} btn-sm"
          onclick="_repSubId='${sub.id}';showPage('reports')" style="${_repSubId===sub.id?'':''}">
          ${sub.icon||'📚'} ${sub.name}
        </button>
      `).join('')}
    </div>
  </div>

  <!-- Report Header Card -->
  <div class="rep-card" style="margin-bottom:22px;">
    <div class="rep-card-header">
      <div class="rch-badge">🏫 تقرير رسمي</div>
      <h2>مدارس البشرى الأهلية</h2>
      <p>كشف متابعة الطلاب — الصف الأول الابتدائي — ${subjectLabel}</p>
      <div class="rep-meta-row">
        <div class="rep-meta-item">👩‍🏫 ${fullName()}</div>
        <div class="rep-meta-item">📅 ${fmtDate(today())}</div>
        <div class="rep-meta-item">👥 ${S.students.length} طالب</div>
        <div class="rep-meta-item">⭐ متوسط ${avgPct}%</div>
      </div>
    </div>
    <div style="padding:18px 22px;display:flex;gap:10px;flex-wrap:wrap;border-bottom:1px solid var(--border);">
      <button class="btn btn-primary" onclick="downloadClassPDF()">📄 PDF كامل</button>
      <button class="btn btn-green" onclick="shareClassWA()">💬 واتساب للمدرسة</button>
      <button class="btn btn-gold" onclick="shareAllParents()">📤 إرسال للأولياء</button>
      <button class="btn btn-ghost" onclick="copyClassReport()">📋 نسخ نصي</button>
    </div>
    <!-- Per-subject quick PDF buttons -->
    ${S.subjects.length>1?`
    <div style="padding:14px 22px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <span style="font-size:0.80rem;font-weight:800;color:var(--muted2);">PDF مادة محددة:</span>
      ${S.subjects.map(sub=>`
        <button class="btn btn-ghost btn-xs" onclick="downloadSubjectPDF('${sub.id}')">
          ${sub.icon||'📚'} ${sub.name}
        </button>`).join('')}
    </div>`:''}
  </div>

  <!-- Charts -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px;">
    <div class="chart-box">
      <h3>📊 توزيع المستويات</h3>
      <div class="chart-sub">${subjectLabel}</div>
      <div class="chart-h chart-h-220"><canvas id="repChart1"></canvas></div>
    </div>
    <div class="chart-box">
      <h3>📈 مقارنة الطلاب</h3>
      <div class="chart-sub">أعلى 10 طلاب</div>
      <div class="chart-h chart-h-220"><canvas id="repChart2"></canvas></div>
    </div>
  </div>

  <!-- Detail Table -->
  <div class="card" style="margin-bottom:20px;">
    <div class="card-header">
      <h3>📋 كشف المتابعة التفصيلي — ${subjectLabel}</h3>
      <span class="badge badge-blue">${S.students.length} طالب</span>
    </div>
    ${S.students.length===0?`<div class="empty"><div class="empty-emoji">📊</div><h3>لا توجد بيانات</h3></div>`:`
    <div class="tbl-wrap"><table class="tbl">
      <thead>
        <tr>
          <th style="min-width:36px">#</th>
          <th style="min-width:140px">الطالب</th>
          ${activeSubs.map(sub=>sub.sections.map(sec=>`
            <th style="text-align:center;white-space:nowrap;min-width:100px">
              ${sub.icon||'📚'} ${sub.name}<br>
              <small style="font-weight:400;opacity:.8;">${sec.icon||''} ${sec.name}</small>
            </th>`).join('')).join('')}
          <th style="text-align:center;min-width:90px">الإتقان</th>
          <th style="text-align:center;min-width:80px">المستوى</th>
          <th style="min-width:110px">الإجراءات</th>
        </tr>
      </thead>
      <tbody>
      ${S.students.map((s,i)=>{
        const fm = filteredMastery(s.id);
        const secCells = activeSubs.map(sub=>sub.sections.map(sec=>{
          const secEv=((S.evals[s.id]||{})[sub.id]||{})[sec.id]||{};
          const mst=Object.values(secEv).filter(v=>v==='m').length;
          const pct=sec.skills.length?Math.round((mst/sec.skills.length)*100):0;
          const col=masteryColor(pct);
          return `<td style="text-align:center;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
              <span class="badge badge-${col}">${pct}%</span>
              <span style="font-size:0.72rem;color:var(--muted)">${mst}/${sec.skills.length}</span>
            </div>
          </td>`;
        }).join('')).join('');
        return `<tr>
          <td><span class="rank-circ">${i+1}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="avatar av-32" style="${avatarStyle(s.id)};color:white">${s.name.charAt(0)}</div>
              <span style="font-weight:700;">${s.name}</span>
            </div>
          </td>
          ${secCells}
          <td style="text-align:center;">
            <div class="prog-wrap" style="width:70px;margin:0 auto 5px;">
              <div class="prog-bar ${masteryColor(fm.pct)}" style="width:${fm.pct}%"></div>
            </div>
            <span class="badge badge-${masteryColor(fm.pct)}">${fm.pct}%</span>
          </td>
          <td style="text-align:center;">
            <span class="badge badge-${masteryColor(fm.pct)}">${masteryLabel(fm.pct)}</span>
          </td>
          <td>
            <div style="display:flex;gap:5px;flex-wrap:wrap;">
              <button class="btn btn-gold btn-xs" onclick="genStudentPDF('${s.id}')">📄 PDF</button>
              <button class="btn btn-plum btn-xs" onclick="waStudentFiltered('${s.id}')">💬</button>
            </div>
          </td>
        </tr>`;
      }).join('')}
      </tbody>
    </table></div>`}
  </div>`;
}

// ── Filtered mastery helper (reused in charts) ──────────────
function _getActiveSubs(){
  return _repSubId==='__all__' ? S.subjects : S.subjects.filter(s=>s.id===_repSubId);
}
function _filteredMastery(sid){
  let m=0,t=0;
  _getActiveSubs().forEach(sub=>sub.sections.forEach(sec=>{
    const ev=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
    m+=Object.values(ev).filter(v=>v==='m').length;
    t+=sec.skills.length;
  }));
  return {m,t,pct:t?Math.round((m/t)*100):0};
}

function initReportCharts(){
  setTimeout(()=>{
    const activeSubs=_getActiveSubs();

    // Chart 1: Level distribution (doughnut)
    const levels={e:0,g:0,n:0};
    S.students.forEach(s=>{
      const p=_filteredMastery(s.id).pct;
      if(p>=70)levels.e++; else if(p>=40)levels.g++; else levels.n++;
    });
    const c1=document.getElementById('repChart1');
    if(c1){
      const ex1=Chart.getChart(c1); if(ex1) ex1.destroy();
      new Chart(c1,{
        type:'doughnut',
        data:{labels:['ممتاز (70%+)','جيد (40-70%)','في بداية رحلته 🌱'],
          datasets:[{data:[levels.e,levels.g,levels.n],
            backgroundColor:['#059669','#1565c0','#10b981'],
            borderWidth:0,hoverOffset:10}]},
        options:{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'bottom',labels:{font:{family:'Tajawal',size:12},padding:14}}}}
      });
    }

    // Chart 2: Top 10 students bar
    const stuNames=S.students.slice(0,10).map(s=>s.name.split(' ')[0]);
    const palette=['rgba(21,101,192,0.80)','rgba(16,185,129,0.80)','rgba(245,158,11,0.80)','rgba(124,58,237,0.80)','rgba(239,68,68,0.80)'];
    const datasets=[];
    let pi=0;
    activeSubs.forEach(sub=>{
      sub.sections.forEach(sec=>{
        const data=S.students.slice(0,10).map(s=>{
          const ev=((S.evals[s.id]||{})[sub.id]||{})[sec.id]||{};
          const mst=Object.values(ev).filter(v=>v==='m').length;
          return sec.skills.length?Math.round((mst/sec.skills.length)*100):0;
        });
        datasets.push({
          label:`${sub.name} — ${sec.name}`,data,
          backgroundColor:palette[pi%palette.length],
          borderRadius:5,borderSkipped:false
        });
        pi++;
      });
    });
    const c2=document.getElementById('repChart2');
    if(c2){
      const ex2=Chart.getChart(c2); if(ex2) ex2.destroy();
      new Chart(c2,{
        type:'bar',
        data:{labels:stuNames,datasets},
        options:{responsive:true,maintainAspectRatio:false,
          plugins:{legend:{position:'bottom',labels:{font:{family:'Tajawal',size:10},padding:8,boxWidth:12}}},
          scales:{
            y:{min:0,max:100,ticks:{stepSize:25,font:{family:'Tajawal'},callback:v=>v+'%'}},
            x:{ticks:{font:{family:'Tajawal',size:10}}}
          }}
      });
    }
  },80);
}

function downloadClassPDF(){
  choosePdfTemplate(tpl => _downloadClassPDFWithTemplate(tpl));
}
function _downloadClassPDFWithTemplate(tpl){
  // Use active subject filter
  const activeSubs = _getActiveSubs();
  const subLabel = _repSubId==='__all__' ? 'جميع المواد' : (S.subjects.find(s=>s.id===_repSubId)?.name||'');

  const allSections=[];
  activeSubs.forEach(sub=>sub.sections.forEach(sec=>
    allSections.push({subName:sub.name,secName:sec.name,secIcon:sec.icon||'📌',subId:sub.id,secId:sec.id})
  ));

  const thCols=allSections.map(sc=>`<th>${sc.subName}<br><small style="font-weight:400;font-size:.78em;opacity:.8">${sc.secIcon} ${sc.secName}</small></th>`).join('');

  const rows=S.students.map((s,i)=>{
    const ev=S.evals[s.id]||{};
    const secCells=allSections.map(sc=>{
      const secEv=(ev[sc.subId]||{})[sc.secId]||{};
      const mst=Object.values(secEv).filter(v=>v==='m').length;
      const tot=activeSubs.find(x=>x.id===sc.subId)?.sections.find(x=>x.id===sc.secId)?.skills.length||0;
      const pct=tot?Math.round((mst/tot)*100):0;
      const clr=pct>=70?'#059669':pct>=40?'#1565c0':'#10b981';
      return `<td style="text-align:center"><span style="color:${clr};font-weight:800">${pct}%</span><br><small style="color:#94a3b8;font-size:.78em">${mst}/${tot}</small></td>`;
    }).join('');
    const fm=_filteredMastery(s.id);
    const fClr=fm.pct>=70?'#059669':fm.pct>=40?'#d97706':'#dc2626';
    const attStatus=(S.attendance[today()]||{})[s.id];
    const attBadge=attStatus==='p'?'<span style="color:#059669">✅ حاضر</span>':attStatus==='a'?'<span style="color:#dc2626">❌ غائب</span>':attStatus==='e'?'<span style="color:#d97706">📋 بعذر</span>':'<span style="color:#94a3b8">—</span>';
    return `<tr style="background:${i%2?'#f8faff':'#fff'}">
      <td style="text-align:center;font-weight:800;color:#1e3a5f">${i+1}</td>
      <td><strong>${s.name}</strong></td>
      ${secCells}
      <td style="text-align:center"><strong style="color:${fClr};font-size:1.05em">${fm.pct}%</strong><br><small style="color:${fClr}">${masteryLabel(fm.pct)}</small></td>
      <td style="text-align:center">${attBadge}</td>
    </tr>`;
  }).join('');

  const avgMastery=S.students.length?Math.round(S.students.reduce((a,s)=>a+_filteredMastery(s.id).pct,0)/S.students.length):0;
  const present=Object.values(S.attendance[today()]||{}).filter(v=>v==='p').length;

  const html=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير الفصل — مدارس البشرى — ${subLabel}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;color:#1e293b;background:#fff;font-size:12px}
  @page{size:A4 landscape;margin:10mm 12mm}
  @media print{.no-print{display:none}}
  .no-print{display:flex;gap:10px;padding:12px 16px;background:#f8faff;border-bottom:1px solid #e2e8f8;margin-bottom:0}
  .pbtn{padding:10px 20px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-size:.9em;font-weight:800;cursor:pointer}
  .pbtn.primary{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff}
  .pbtn.secondary{background:#f1f5fd;color:#1e3a5f;border:1.5px solid #e2e8f8}
  .header{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between}
  .header h1{font-size:1.25em;font-weight:900}
  .header .meta{font-size:.82em;opacity:.8;margin-top:4px}
  .stats-row{display:flex;gap:12px;padding:12px 16px;background:#f8faff;border-bottom:1px solid #e2e8f8}
  .stat-box{background:#fff;border-radius:9px;padding:10px 16px;border:1px solid #e2e8f8;text-align:center;flex:1}
  .stat-val{font-size:1.4em;font-weight:900;color:#1e3a5f}
  .stat-lbl{font-size:.76em;color:#64748b;font-weight:700}
  table{width:100%;border-collapse:collapse}
  th{background:#1e3a5f;color:#fff;padding:9px 10px;text-align:right;font-size:.82em;font-weight:800;white-space:nowrap}
  td{padding:8px 10px;border-bottom:1px solid #e2e8f8;font-size:.88em;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  .footer{text-align:center;padding:8px;color:#94a3b8;font-size:.76em;margin-top:8px}
</style>
</head>
<body>
<div class="no-print">
  <button class="pbtn primary" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <button class="pbtn secondary" onclick="window.close()">✕ إغلاق</button>
</div>
<div class="header">
  <div style="display:flex;align-items:center;gap:16px;flex:1;">
    <img src="${SCHOOL_LOGO}" style="width:56px;height:56px;object-fit:contain;background:rgba(255,255,255,0.15);border-radius:10px;padding:4px;flex-shrink:0;" />
    <div>
      <h1 style="margin:0;font-size:1.25em;">مدارس البشرى الأهلية — تقرير الفصل</h1>
      <div class="meta">${subLabel} · الصف الأول الابتدائي · ${today()}</div>
    </div>
  </div>
  <!-- Teacher info -->
  <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.12);border-radius:10px;padding:8px 14px;flex-shrink:0;">
    ${S.teacher.photo
      ? `<img src="${S.teacher.photo}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.55);flex-shrink:0;" />`
      : `<div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:white;flex-shrink:0;">${fullName().charAt(0)||'م'}</div>`
    }
    <div>
      <div style="font-size:1em;font-weight:900;color:#fff;">${fullName()}</div>
      <div style="font-size:0.76em;opacity:0.70;">المعلم المسؤول</div>
    </div>
  </div>
</div>
<div class="stats-row">
  <div class="stat-box"><div class="stat-val">${S.students.length}</div><div class="stat-lbl">إجمالي الطلاب</div></div>
  <div class="stat-box"><div class="stat-val" style="color:#059669">${present}</div><div class="stat-lbl">✅ حاضرون اليوم</div></div>
  <div class="stat-box"><div class="stat-val" style="color:#dc2626">${Object.values(S.attendance[today()]||{}).filter(v=>v==='a').length}</div><div class="stat-lbl">❌ غائبون</div></div>
  <div class="stat-box"><div class="stat-val" style="color:${avgMastery>=70?'#059669':avgMastery>=40?'#d97706':'#dc2626'}">${avgMastery}%</div><div class="stat-lbl">⭐ متوسط الإتقان</div></div>
  <div class="stat-box"><div class="stat-val" style="color:#059669">${S.students.filter(s=>studentMastery(s.id).total>=70).length}</div><div class="stat-lbl">🏆 مستوى ممتاز</div></div>
  <div class="stat-box"><div class="stat-val" style="color:#dc2626">${S.students.filter(s=>studentMastery(s.id).total<40).length}</div><div class="stat-lbl">⚠️ في بداية رحلته</div></div>
</div>
<table>
  <thead><tr><th>#</th><th>اسم الطالب</th>${thCols}<th>الكلي</th><th>الحضور</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">مدارس البشرى الأهلية · ${today()} · المعلم: ${fullName()}</div>
</body></html>`;

  const win=window.open('','_blank','width=1100,height=700,scrollbars=yes');
  if(!win){toast('السماح بالنوافذ المنبثقة لتحميل التقرير','error');return;}

  // Kids template for class PDF
  let finalHtml = html;
  if(tpl === 'kids'){
    finalHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير الفصل — مدارس البشرى</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;background:#fff;font-size:12px;}
  @page{size:A4 landscape;margin:8mm 10mm}
  @media print{.no-print{display:none}}
  .no-print{display:flex;gap:10px;padding:12px;background:#fef3c7;border-bottom:3px solid #f59e0b;margin-bottom:0;}
  .k-btn{padding:9px 20px;border-radius:10px;border:none;font-family:'Tajawal',sans-serif;font-size:0.88em;font-weight:800;cursor:pointer;}
  .k-btn.primary{background:linear-gradient(135deg,#f97316,#ec4899);color:white;}
  .k-btn.secondary{background:#f1f5f9;color:#475569;}
  .k-header{background:linear-gradient(135deg,#f97316,#ec4899,#8b5cf6);padding:14px 20px;color:white;display:flex;align-items:center;justify-content:space-between;}
  .k-title{font-size:1.3em;font-weight:900;}
  .k-sub{font-size:0.8em;opacity:0.85;margin-top:2px;}
  table{width:100%;border-collapse:collapse;}
  th{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;padding:8px 10px;text-align:right;font-size:0.82em;font-weight:800;}
  td{padding:7px 10px;border-bottom:1.5px solid #f1f5f9;font-size:0.85em;}
  tr:nth-child(even) td{background:#fdf4ff;}
  tr:hover td{background:#fce7f3;}
  .pct-chip{display:inline-block;padding:3px 10px;border-radius:99px;font-weight:800;font-size:0.85em;}
  .chip-green{background:#dcfce7;color:#15803d;}
  .chip-blue{background:#dbeafe;color:#1d4ed8;}
  .chip-red{background:#fee2e2;color:#dc2626;}
  .footer{background:linear-gradient(135deg,#f97316,#ec4899);color:white;padding:8px 20px;text-align:center;font-size:0.75em;margin-top:0;}
  .stats-bar{display:flex;gap:12px;padding:10px 20px;background:#fef3c7;border-bottom:2px solid #fde68a;}
  .stat-chip{background:white;border-radius:10px;padding:6px 14px;font-weight:800;font-size:0.85em;color:#92400e;}
</style>
</head>
<body>
<div class="no-print">
  <button class="k-btn primary" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <button class="k-btn secondary" onclick="window.close()">✕ إغلاق</button>
</div>
<div class="k-header">
  <div><div class="k-title">🌈 تقرير الفصل — مدارس البشرى الأهلية</div><div class="k-sub">📖 ${subLabel} &nbsp;·&nbsp; 👩‍🏫 ${fullName()} &nbsp;·&nbsp; 📅 ${today()}</div></div>
  <div style="font-size:2em;">🏫⭐🎉</div>
</div>
<div class="stats-bar">
  <div class="stat-chip">👥 ${S.students.length} طالب</div>
  <div class="stat-chip">✅ حاضر اليوم: ${present}</div>
  <div class="stat-chip">📊 متوسط الإتقان: ${avgMastery}%</div>
  <div class="stat-chip">🏆 ممتاز: ${S.students.filter(s=>_filteredMastery(s.id).pct>=70).length} طالب</div>
</div>
<table>
  <thead><tr><th>#</th><th>⭐ اسم الطال��</th>${thCols}<th>🎯 الكلي</th><th>📅 الحضور</th></tr></thead>
  <tbody>${S.students.map((s,i)=>{
    const ev=S.evals[s.id]||{};
    const secCells=allSections.map(sc=>{
      const secEv=(ev[sc.subId]||{})[sc.secId]||{};
      const mst=Object.values(secEv).filter(v=>v==='m').length;
      const tot=activeSubs.find(x=>x.id===sc.subId)?.sections.find(x=>x.id===sc.secId)?.skills.length||0;
      const pct=tot?Math.round((mst/tot)*100):0;
      const cls=pct>=70?'chip-green':pct>=40?'chip-blue':'chip-red';
      return `<td style="text-align:center"><span class="pct-chip ${cls}">${pct}%</span></td>`;
    }).join('');
    const fm=_filteredMastery(s.id);
    const cls=fm.pct>=70?'chip-green':fm.pct>=40?'chip-blue':'chip-red';
    const attStatus=(S.attendance[today()]||{})[s.id];
    const attBadge=attStatus==='p'?'✅':attStatus==='a'?'❌':attStatus==='e'?'📋':'—';
    return `<tr><td style="text-align:center;font-weight:800;color:#7c3aed;">${i+1}</td>
      <td><strong>${s.name}</strong></td>${secCells}
      <td style="text-align:center"><span class="pct-chip ${cls}">${fm.pct}%</span></td>
      <td style="text-align:center;font-size:1.1em;">${attBadge}</td></tr>`;
  }).join('')}</tbody>
</table>
<div class="footer">🏫 مدارس البشرى الأهلية &nbsp;·&nbsp; 👩‍🏫 ${fullName()} &nbsp;·&nbsp; 📅 ${today()} &nbsp;·&nbsp; ⭐ نتمنى لجميع الطلاب التوفيق والنجاح</div>
</body></html>`;
  }

  if(tpl === 'teacher'){
    const tPhoto = S.teacher.photo || '';
    const tName  = fullName();
    finalHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير الفصل — مدارس البشرى</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;background:#f8faff;font-size:12px;}
  @page{size:A4 landscape;margin:8mm 10mm}
  @media print{.no-print{display:none}body{background:white}}
  .no-print{display:flex;gap:10px;padding:12px;background:white;border-bottom:1px solid #e2e8f8;}
  .pb{padding:9px 20px;border-radius:10px;border:none;font-family:'Tajawal',sans-serif;font-size:0.88em;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;}
  .pb2{padding:9px 20px;border-radius:10px;border:1px solid #e2e8f8;font-family:'Tajawal',sans-serif;font-size:0.88em;font-weight:800;cursor:pointer;background:#f1f5f9;color:#475569;}
  .hdr{background:linear-gradient(135deg,#0f172a,#1e3a5f,#312e81);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;}
  .hdr-right{display:flex;align-items:center;gap:12px;}
  .hdr-logo{width:46px;height:46px;object-fit:contain;background:white;border-radius:10px;padding:4px;}
  .hdr-title{color:white;font-size:1.1em;font-weight:900;}.hdr-sub{color:rgba(255,255,255,0.5);font-size:0.72em;margin-top:2px;}
  .hdr-teacher{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:8px 14px;}
  .t-photo{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.3);background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:1rem;flex-shrink:0;}
  .t-name{color:white;font-size:0.82em;font-weight:800;}.t-role{color:rgba(255,255,255,0.45);font-size:0.68em;}
  .stats{display:flex;gap:8px;padding:8px 24px;background:rgba(30,58,95,0.04);border-bottom:1px solid #e2e8f8;}
  .stat{background:white;border-radius:8px;padding:6px 14px;font-weight:800;font-size:0.82em;color:#1e3a5f;border:1px solid #e2e8f8;}
  table{width:100%;border-collapse:collapse;}
  th{background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;padding:8px 10px;text-align:right;font-size:0.80em;font-weight:800;}
  td{padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:0.84em;}
  tr:nth-child(even) td{background:#f8faff;}
  .chip{display:inline-block;padding:2px 9px;border-radius:99px;font-weight:800;font-size:0.82em;}
  .g{background:#dcfce7;color:#15803d;} .b{background:#dbeafe;color:#1d4ed8;} .r{background:#fee2e2;color:#dc2626;}
  .sig-bar{display:flex;align-items:center;gap:14px;padding:10px 24px;background:white;border-top:1px solid #e2e8f8;margin-top:0;}
  .sig-photo{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f8;background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;flex-shrink:0;}
  .sig-line{flex:1;border-top:1.5px dashed #e2e8f8;}
  .sig-txt{font-size:0.72em;color:#64748b;font-weight:700;}
</style>
</head>
<body>
<div class="no-print">
  <button class="pb" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <button class="pb2" onclick="window.close()">✕ إغلاق</button>
</div>
<div class="hdr">
  <div class="hdr-right">
    <img src="${SCHOOL_LOGO}" class="hdr-logo" />
    <div><div class="hdr-title">تقرير الفصل — مدارس البشرى الأهلية</div><div class="hdr-sub">📖 ${subLabel} · 📅 ${today()}</div></div>
  </div>
  <div class="hdr-teacher">
    ${tPhoto ? `<img src="${tPhoto}" class="t-photo" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />` : `<div class="t-photo">${tName.charAt(0)||'م'}</div>`}
    <div><div class="t-name">${tName}</div><div class="t-role">معلم الفصل</div></div>
  </div>
</div>
<div class="stats">
  <div class="stat">👥 ${S.students.length} طالب</div>
  <div class="stat">✅ حاضر: ${present}</div>
  <div class="stat">📊 متوسط الإتقان: ${avgMastery}%</div>
  <div class="stat">🏆 ممتاز: ${S.students.filter(s=>_filteredMastery(s.id).pct>=70).length}</div>
</div>
<table>
  <thead><tr><th>#</th><th>اسم الطالب</th>${thCols}<th>الكلي</th><th>الحضور</th></tr></thead>
  <tbody>${S.students.map((s,i)=>{
    const ev=S.evals[s.id]||{};
    const secCells=allSections.map(sc=>{
      const secEv=(ev[sc.subId]||{})[sc.secId]||{};
      const mst=Object.values(secEv).filter(v=>v==='m').length;
      const tot=activeSubs.find(x=>x.id===sc.subId)?.sections.find(x=>x.id===sc.secId)?.skills.length||0;
      const pct=tot?Math.round((mst/tot)*100):0;
      const cls=pct>=70?'g':pct>=40?'b':'r';
      return `<td style="text-align:center"><span class="chip ${cls}">${pct}%</span></td>`;
    }).join('');
    const fm=_filteredMastery(s.id);
    const cls=fm.pct>=70?'g':fm.pct>=40?'b':'r';
    const attStatus=(S.attendance[today()]||{})[s.id];
    const attBadge=attStatus==='p'?'✅':attStatus==='a'?'❌':attStatus==='e'?'📋':'—';
    return `<tr><td style="text-align:center;font-weight:900;color:#1e3a5f">${i+1}</td>
      <td><strong>${s.name}</strong></td>${secCells}
      <td style="text-align:center"><span class="chip ${cls}">${fm.pct}%</span></td>
      <td style="text-align:center">${attBadge}</td></tr>`;
  }).join('')}</tbody>
</table>
<div class="sig-bar">
  ${tPhoto ? `<img src="${tPhoto}" class="sig-photo" style="width:38px;height:38px;border-radius:50%;object-fit:cover;" />` : `<div class="sig-photo">${tName.charAt(0)||'م'}</div>`}
  <div><div class="sig-txt">توقيع المعلم</div><div style="font-weight:900;font-size:0.84em;color:#1e3a5f">${tName}</div></div>
  <div class="sig-line"></div>
  <div style="text-align:center"><div class="sig-txt">التاريخ</div><div style="font-weight:900;font-size:0.84em;color:#1e3a5f">${today()}</div></div>
</div>
</body></html>`;
  }

  win.document.write(finalHtml);
  win.document.close();
  toast('تم فتح تقرير الفصل — اضغط 🖨️ للحفظ كـ PDF','success');
}

function shareClassWA(){
  const subLabel=_repSubId==='__all__'?'جميع المواد':(S.subjects.find(s=>s.id===_repSubId)?.name||'');
  let msg=`📚 *تقرير الفصل — مدارس البشرى الأهلية*\n`;
  msg+=`📖 المادة: *${subLabel}*\n`;
  msg+=`👩‍🏫 المعلم: ${fullName()}\n📅 ${today()}\n👥 ${S.students.length} طالب\n`;
  msg+=`━━━━━━━━━━━━━━━━\n`;
  msg+=S.students.map((s,i)=>{
    const fm=_filteredMastery(s.id);
    return `${i+1}. ${s.name}: ${fm.pct}% — ${masteryLabel(fm.pct)}`;
  }).join('\n');
  msg+=`\n━━━━━━━━━━━━━━━━\n🏫 مدارس البشرى الأهلية`;
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
}

function shareAllParents(){
  const withPhone=S.students.filter(s=>s.parent&&s.parent.replace(/\D/g,'').length>=9);
  if(!S.students.length){toast('لا يوجد طلاب','error');return;}
  if(!withPhone.length){toast('لا يوجد أرقام واتساب للأولياء','error');return;}
  toast(`سيتم فتح ${withPhone.length} محادثة واتساب...`,'info');
  withPhone.forEach((s,i)=>{ setTimeout(()=>waStudent(s.id), i*800); });
}

function copyClassReport(){
  const subLabel=_repSubId==='__all__'?'جميع المواد':(S.subjects.find(s=>s.id===_repSubId)?.name||'');
  let txt=`تقرير مدارس البشرى الأهلية\nالصف الأول الابتدائي — ${subLabel}\nالمعلم: ${fullName()}\nالتاريخ: ${today()}\n\n`;
  txt+=S.students.map((s,i)=>{const fm=_filteredMastery(s.id);return `${i+1}. ${s.name} — ${fm.pct}% — ${masteryLabel(fm.pct)}`;}).join('\n');
  navigator.clipboard.writeText(txt).then(()=>toast('تم نسخ التقرير ✅','success'));
}


function waStudentFiltered(sid){
  const s=S.students.find(x=>x.id===sid);
  if(!s){toast('لم يُعثر على الطالب','error');return;}
  const subLabel=_repSubId==='__all__'?'جميع المواد':(S.subjects.find(x=>x.id===_repSubId)?.name||'');
  const fm=_filteredMastery(sid);
  // Build detail lines for active subjects only
  let subLines='';
  _getActiveSubs().forEach(sub=>{
    subLines+=`\n📚 *${sub.name}*\n`;
    sub.sections.forEach(sec=>{
      const secEv=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
      const mst=Object.values(secEv).filter(v=>v==='m').length;
      const pct=sec.skills.length?Math.round((mst/sec.skills.length)*100):0;
      const bar=pct>=70?'🟢':pct>=40?'🟡':'🔴';
      subLines+=`  ${bar} ${sec.icon||''} ${sec.name}: ${mst}/${sec.skills.length} (${pct}%)\n`;
    });
  });
  const msg=`📚 *تقرير متابعة طالب*\n🏫 *مدارس البشرى الأهلية*\n📖 المادة: ${subLabel}\n━━━━━━━━━━━━━━━━\n👤 الطالب: *${s.name}*\n👩‍🏫 المعلم: ${fullName()}\n📅 ${fmtDate(today())}\n${subLines}\n⭐ *الإتقان: ${fm.pct}% — ${masteryLabel(fm.pct)}*\n━━━━━━━━━━━━━━━━\nللاستفسار تواصل مع المدرسة 🙏`;
  const ph=s.parent?s.parent.replace(/\D/g,''):'';
  window.open(`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`,'_blank');
}

function downloadSubjectPDF(subId){
  const prevFilter=_repSubId;
  _repSubId=subId;
  downloadClassPDF();
  _repSubId=prevFilter;
}
