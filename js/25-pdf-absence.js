// ══════════════════════════════════════════════
// PDF TEMPLATE CHOOSER
// ══════════════════════════════════════════════
let _pdfTemplateMode = 'formal'; // 'formal' | 'kids'
let _pdfTemplateFn   = null;     // function to call after choosing

function choosePdfTemplate(fn){
  _pdfTemplateFn = fn;
  openM('mbPdfTemplate');
}

function selectPdfTemplate(mode){
  _pdfTemplateMode = mode;
  ['formal','kids','teacher'].forEach(m=>{
    const card  = document.getElementById('tplCard-'+m);
    const badge = card?.querySelector('div[style*="position:absolute"]');
    if(m === mode){
      card.style.border = '2.5px solid var(--sky)';
      card.style.background = 'rgba(21,101,192,0.05)';
      if(badge){ badge.style.display='block'; badge.style.background='var(--sky)'; badge.style.color='white'; }
    } else {
      card.style.border = '2px solid var(--border)';
      card.style.background = 'var(--surface)';
      if(badge) badge.style.display='none';
    }
  });
}

function executePdfWithTemplate(){
  closeM('mbPdfTemplate');
  if(_pdfTemplateFn) _pdfTemplateFn(_pdfTemplateMode);
}

window.addEventListener('beforeunload', ()=>{ clearInterval(ACT.interval); });

// ══════════════════════════════════════════════
// ABSENCE REPORT — مرتبط بالبيانات الحقيقية
// ══════════════════════════════════════════════
let _absChartBar=null, _absChartDough=null, _absChartClass=null;
let _absCurrentPeriod='week';

// اسم الفصل الحالي من الـ localStorage
function _absGetClassName(){
  try{
    const cur = getAllClasses().find(c=>c.id===ACTIVE_CLASS_ID);
    return cur ? (cur.name||cur.label||'الفصل الحالي') : (document.getElementById('tbClassName')?.textContent||'الفصل الحالي');
  }catch(e){ return 'الفصل الحالي'; }
}

// تصفية التواريخ المسجلة حسب الفترة
function _absFilterDates(period, from, to){
  const all = Object.keys(S.attendance).sort();
  const now = new Date();
  if(period==='week'){
    const cut=new Date(now); cut.setDate(now.getDate()-7);
    return all.filter(d=>d>=cut.toISOString().split('T')[0]);
  } else if(period==='month'){
    const y=now.getFullYear(), m=String(now.getMonth()+1).padStart(2,'0');
    return all.filter(d=>d.startsWith(`${y}-${m}`));
  } else if(period==='semester'){
    const cut=new Date(now); cut.setDate(now.getDate()-120);
    return all.filter(d=>d>=cut.toISOString().split('T')[0]);
  } else if(period==='custom' && from && to){
    return all.filter(d=>d>=from && d<=to);
  }
  return all;
}

// بناء سجلات الغياب من البيانات الحقيقية
function _absBuildRecords(dates){
  const rows=[];
  const className = _absGetClassName();
  dates.forEach(dateStr=>{
    const dayAtt = S.attendance[dateStr]||{};
    Object.entries(dayAtt).forEach(([sid, val])=>{
      if(val==='a' || val==='e'){
        const st = S.students.find(s=>s.id===sid);
        if(st){
          rows.push({
            sid,
            name: st.name||'—',
            num:  st.num||'—',
            cls:  className,           // الفصل من اسم الفصل النشط
            dateStr,
            type: val==='e' ? 'بعذر' : 'بدون عذر',
            val
          });
        }
      }
    });
  });
  return rows.sort((a,b)=>b.dateStr.localeCompare(a.dateStr));
}

function _absGetLabel(period,f,t){
  const now=new Date();
  if(period==='week'){
    const cut=new Date(now); cut.setDate(now.getDate()-7);
    return cut.toLocaleDateString('ar-SA',{day:'numeric',month:'long'})+' — '+now.toLocaleDateString('ar-SA',{day:'numeric',month:'long',year:'numeric'});
  } else if(period==='month'){
    return now.toLocaleDateString('ar-SA',{month:'long',year:'numeric'});
  } else if(period==='semester'){
    return 'آخر 4 أشهر — '+now.getFullYear();
  }
  return (f||'')+' — '+(t||'');
}

function absSetPeriod(p){
  _absCurrentPeriod = p;
  document.querySelectorAll('.abs-ptab').forEach(t=>{
    const active = t.dataset.period===p;
    t.style.background  = active ? 'var(--gold)' : 'transparent';
    t.style.borderColor = active ? 'var(--gold)' : 'rgba(255,255,255,0.22)';
    t.style.color       = active ? '#1a0800'     : 'rgba(255,255,255,0.7)';
  });
  const descMap={week:'عرض: آخر 7 أيام',month:'عرض: هذا الشهر',semester:'عرض: آخر 4 أشهر',custom:'عرض: فترة مخصصة'};
  const el=document.getElementById('absPerDesc'); if(el) el.textContent=descMap[p]||'';
  document.getElementById('absCustomRow').style.display = p==='custom'?'flex':'none';
  if(p!=='custom') absRenderData(p);
}

function absApplyCustom(){
  const f=document.getElementById('absDateFrom').value;
  const t=document.getElementById('absDateTo').value;
  if(!f||!t){ alert('يرجى تحديد تاريخ البداية والنهاية'); return; }
  absRenderData('custom',f,t);
}

function absRenderData(period,from,to){
  if(S.students.length===0){
    ['absKpiTotal','absKpiDays','absKpiAbsent','absKpiExcused','absKpiRate','absKpiCritical']
      .forEach(id=>{ const e=document.getElementById(id); if(e) e.textContent='0'; });
    const tb=document.getElementById('absTable');
    if(tb) tb.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted2);">👥 أضف طلاباً أولاً من قسم الطلاب</td></tr>`;
    const ta=document.getElementById('absTopAbsent');
    if(ta) ta.innerHTML=`<p style="color:var(--muted2);text-align:center;padding:16px;">لا يوجد طلاب مضافون</p>`;
    return;
  }

  const dates   = _absFilterDates(period,from,to);
  const records = _absBuildRecords(dates);
  const lbl=document.getElementById('absRangeLabel');
  if(lbl) lbl.textContent=_absGetLabel(period,from,to);

  const totalStudents = S.students.length;
  const totalDays     = dates.length;
  const absentRows    = records.filter(r=>r.val==='a');
  const excusedRows   = records.filter(r=>r.val==='e');
  const totalAbsent   = records.length;
  const attendRate    = totalDays>0
    ? Math.round(((totalStudents*totalDays - totalAbsent)/(totalStudents*totalDays))*100)
    : 100;

  // حالات حرجة: 3 غيابات أو أكثر
  const perStudent={};
  records.forEach(r=>{ perStudent[r.sid]=(perStudent[r.sid]||0)+1; });
  const critical = Object.values(perStudent).filter(c=>c>=3).length;

  const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  set('absKpiTotal',    totalStudents);
  set('absKpiDays',     totalDays);
  set('absKpiAbsent',   absentRows.length);
  set('absKpiExcused',  excusedRows.length);
  set('absKpiRate',     attendRate+'%');
  set('absKpiCritical', critical);

  // رسم شريطي: غياب يومي (آخر 14 يوم)
  const barDates = dates.slice(-14);
  const barLabels = barDates.map(d=>new Date(d).toLocaleDateString('ar-SA',{day:'numeric',month:'short'}));
  const barData   = barDates.map(d=>Object.values(S.attendance[d]||{}).filter(v=>v==='a'||v==='e').length);

  if(_absChartBar) _absChartBar.destroy();
  const cvBar=document.getElementById('absChartBar');
  if(cvBar) _absChartBar=new Chart(cvBar,{
    type:'bar',
    data:{labels:barLabels,datasets:[{
      label:'الغياب',data:barData,backgroundColor:'rgba(21,101,192,0.72)',
      borderRadius:7,hoverBackgroundColor:'rgba(21,101,192,0.95)'
    }]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{color:'#64748b',font:{size:10},maxRotation:45,autoSkip:false}},
        y:{ticks:{color:'#64748b',font:{size:11},stepSize:1},beginAtZero:true}
      }
    }
  });

  // دائري: نوع الغياب
  if(_absChartDough) _absChartDough.destroy();
  const cvD=document.getElementById('absChartDough');
  if(cvD) _absChartDough=new Chart(cvD,{
    type:'doughnut',
    data:{labels:['بدون عذر','بعذر'],
      datasets:[{data:[absentRows.length,excusedRows.length],
        backgroundColor:['#ef4444','#f59e0b'],borderWidth:0,hoverOffset:5}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}
  });

  // شريطي: أكثر الطلاب غياباً (أعلى 10)
  const topStudents=Object.entries(perStudent).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const clsLabels=topStudents.map(([sid])=>{ const st=S.students.find(s=>s.id===sid); return st?.name||sid; });
  const clsVals=topStudents.map(([,c])=>c);
  const ccEl=document.getElementById('absClassCount');
  if(ccEl) ccEl.textContent=topStudents.length+' طالب';

  if(_absChartClass) _absChartClass.destroy();
  const cvC=document.getElementById('absChartClass');
  if(cvC) _absChartClass=new Chart(cvC,{
    type:'bar',
    data:{labels:clsLabels,datasets:[{
      label:'مرات الغياب',data:clsVals,indexAxis:'y',
      backgroundColor:'rgba(124,58,237,0.65)',borderRadius:5,
      hoverBackgroundColor:'rgba(124,58,237,0.88)'
    }]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{color:'#64748b',font:{size:11},stepSize:1},beginAtZero:true},
        y:{ticks:{color:'#64748b',font:{size:11}}}
      }
    }
  });

  // جدول تفصيلي
  const tbody=document.getElementById('absTable');
  if(tbody){
    if(records.length===0){
      tbody.innerHTML=`<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted2);">✅ لا يوجد غياب مسجل في هذه الفترة</td></tr>`;
    } else {
      tbody.innerHTML=records.slice(0,50).map((r,i)=>`
        <tr>
          <td style="color:var(--muted2);font-size:0.74rem;">${i+1}</td>
          <td style="font-weight:700;">${r.name}</td>
          <td style="color:var(--muted);font-size:0.8rem;">${r.cls}</td>
          <td style="direction:ltr;text-align:right;font-size:0.8rem;">${r.dateStr}</td>
          <td><span class="badge ${r.val==='a'?'badge-red':'badge-gold'}">${r.type}</span></td>
        </tr>`).join('');
    }
  }
  const tcEl=document.getElementById('absTableCount'); if(tcEl) tcEl.textContent=records.length+' حالة';

  // أكثر الطلاب غياباً - قائمة
  const mx=topStudents[0]?.[1]||1;
  const taEl=document.getElementById('absTopAbsent');
  if(taEl){
    if(topStudents.length===0){
      taEl.innerHTML=`<p style="color:var(--muted2);text-align:center;padding:16px;">✅ لا يوجد غياب في هذه الفترة</p>`;
    } else {
      taEl.innerHTML=topStudents.slice(0,5).map(([sid,cnt])=>{
        const st=S.students.find(s=>s.id===sid);
        const nm=st?.name||'—';
        return `<div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:0.87rem;font-weight:700;">${nm}</span>
            <span class="badge ${cnt>=5?'badge-red':cnt>=3?'badge-gold':'badge-blue'}">${cnt} ${cnt===1?'مرة':'مرات'}</span>
          </div>
          <div class="prog-wrap"><div class="prog-bar blue" style="width:${Math.round(cnt/mx*100)}%;"></div></div>
        </div>`;
      }).join('');
    }
  }
}

function absExportCSV(){
  const from=document.getElementById('absDateFrom')?.value;
  const to=document.getElementById('absDateTo')?.value;
  const dates=_absFilterDates(_absCurrentPeriod,from,to);
  const records=_absBuildRecords(dates);
  const className=_absGetClassName();
  const rows=[['#','اسم الطالب','الفصل','التاريخ','نوع الغياب']];
  records.forEach((r,i)=>rows.push([i+1,r.name,r.cls,r.dateStr,r.type]));
  const csv='\uFEFF'+rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download=`تقرير_غياب_${className}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

function absExportPDF(){
  const className = _absGetClassName();
  const from = document.getElementById('absDateFrom')?.value;
  const to   = document.getElementById('absDateTo')?.value;
  const dates   = _absFilterDates(_absCurrentPeriod, from, to);
  const label   = _absGetLabel(_absCurrentPeriod, from, to);
  const teacher = fullName();

  if(S.students.length===0){ toast('لا يوجد طلاب مضافون','error'); return; }

  // أسماء الأيام بالعربي
  const DAY_NAMES = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

  // أعمدة الأيام (كل يوم = عمود)
  const daysCols = dates.map(d => {
    const dt = new Date(d);
    return {
      dateStr: d,
      dayName: DAY_NAMES[dt.getDay()],
      shortDate: dt.toLocaleDateString('ar-SA',{day:'numeric',month:'numeric'})
    };
  });

  // إحصائيات إجمالية
  let totalPresent=0, totalAbsent=0, totalExcused=0, totalUnmarked=0;
  S.students.forEach(s=>{
    dates.forEach(d=>{
      const v=(S.attendance[d]||{})[s.id];
      if(v==='p') totalPresent++;
      else if(v==='a') totalAbsent++;
      else if(v==='e') totalExcused++;
      else totalUnmarked++;
    });
  });
  const totalCells = S.students.length * dates.length;
  const rate = totalCells>0 ? Math.round((totalPresent/totalCells)*100) : 100;

  // رأس الجدول — صف اليوم + صف التاريخ
  const thDayNames = daysCols.map(d=>`<th style="text-align:center;font-size:.72em;border-left:1px solid rgba(255,255,255,0.15)">${d.dayName}</th>`).join('');
  const thDates    = daysCols.map(d=>`<th style="text-align:center;font-size:.68em;font-weight:400;opacity:.75;border-left:1px solid rgba(255,255,255,0.15)">${d.shortDate}</th>`).join('');

  // صفوف الطلاب
  const studentRows = S.students.map((s,i)=>{
    let absCount=0, excCount=0;
    const cells = daysCols.map(d=>{
      const v=(S.attendance[d.dateStr]||{})[s.id];
      if(v==='p') return `<td style="text-align:center;border-left:1px solid #e2e8f8;color:#059669;font-size:1em">✅</td>`;
      if(v==='a'){ absCount++; return `<td style="text-align:center;border-left:1px solid #e2e8f8;color:#dc2626;font-size:1em">❌</td>`; }
      if(v==='e'){ excCount++; return `<td style="text-align:center;border-left:1px solid #e2e8f8;color:#d97706;font-size:1em">📋</td>`; }
      return `<td style="text-align:center;border-left:1px solid #e2e8f8;color:#cbd5e1;font-size:.8em">—</td>`;
    }).join('');

    const totalAbs = absCount+excCount;
    const rowBg = i%2 ? '#f8faff' : '#fff';
    const absBadge = totalAbs>0
      ? `<span style="margin-right:6px;padding:1px 7px;border-radius:99px;font-size:.72em;font-weight:800;background:${absCount>=3?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.12)'};color:${absCount>=3?'#dc2626':'#b45309'}">${totalAbs}</span>`
      : '';

    return `<tr style="background:${rowBg}">
      <td style="text-align:center;font-weight:800;color:#94a3b8;font-size:.8em;border-left:1px solid #e2e8f8">${i+1}</td>
      <td style="font-weight:700;white-space:nowrap;border-left:1px solid #e2e8f8;padding:7px 10px">${s.name}${absBadge}</td>
      ${cells}
      <td style="text-align:center;font-weight:900;color:${absCount>=3?'#dc2626':absCount>=1?'#d97706':'#059669'};border-left:1px solid #e2e8f8">${absCount}</td>
      <td style="text-align:center;font-weight:900;color:#d97706;border-left:1px solid #e2e8f8">${excCount}</td>
    </tr>`;
  }).join('');

  // صف مجاميع الغياب لكل يوم
  const sumRow = daysCols.map(d=>{
    const cnt = Object.values(S.attendance[d.dateStr]||{}).filter(v=>v==='a'||v==='e').length;
    return `<td style="text-align:center;font-weight:800;color:${cnt>3?'#dc2626':cnt>0?'#d97706':'#059669'};border-left:1px solid rgba(255,255,255,0.2)">${cnt}</td>`;
  }).join('');

  // عرض الجدول — إذا الأيام كتير نستخدم landscape
  const isLandscape = daysCols.length > 10;
  const pageSize = isLandscape ? 'A4 landscape' : 'A4 portrait';

  const html=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير الغياب — ${className}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;color:#1e293b;background:#fff;font-size:12px}
  @page{size:${pageSize};margin:10mm}
  @media print{.no-print{display:none}body{padding:0;font-size:11px}}
  .no-print{display:flex;gap:10px;padding:10px 14px;background:#f8faff;border-bottom:1px solid #e2e8f8;align-items:center;flex-wrap:wrap}
  .pbtn{padding:8px 18px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-size:.86em;font-weight:800;cursor:pointer}
  .pbtn.primary{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff}
  .pbtn.secondary{background:#f1f5fd;color:#1e3a5f;border:1.5px solid #e2e8f8}
  .header{background:linear-gradient(135deg,#060d1a,#1e3a5f,#1565c0);color:#fff;padding:14px 20px;margin-bottom:12px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
  .header h1{font-size:1.1em;font-weight:900;margin-bottom:3px}
  .header .meta{font-size:.76em;opacity:.7}
  .badge-period{background:rgba(245,158,11,0.25);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);padding:3px 12px;border-radius:99px;font-size:.76em;font-weight:800;white-space:nowrap}
  .stats{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  .stat{background:#f8faff;border:1px solid #e2e8f8;border-radius:9px;padding:8px 14px;text-align:center;flex:1;min-width:80px}
  .sv{font-size:1.3em;font-weight:900;color:#1e3a5f;line-height:1}
  .sl{font-size:.68em;color:#64748b;font-weight:700;margin-top:3px}
  .sv.red{color:#dc2626}.sv.gold{color:#d97706}.sv.green{color:#059669}.sv.plum{color:#7c3aed}
  .legend{display:flex;gap:14px;font-size:.76em;color:#64748b;margin-bottom:10px;flex-wrap:wrap}
  .legend span{display:flex;align-items:center;gap:4px}
  .tbl-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:.84em}
  thead th{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;padding:7px 6px;text-align:right;font-weight:800}
  thead tr:first-child th{border-bottom:1px solid rgba(255,255,255,0.15)}
  thead tr:nth-child(2) th{font-weight:400}
  tfoot td{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;padding:6px;font-weight:800}
  td{padding:6px 8px;border-bottom:1px solid #e2e8f8}
  tr:last-child td{border-bottom:none}
  .footer{text-align:center;color:#94a3b8;font-size:.7em;padding-top:8px;border-top:1px solid #e2e8f8;margin-top:8px}
</style>
</head>
<body style="padding:12px">
<div class="no-print">
  <button class="pbtn primary" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <button class="pbtn secondary" onclick="window.close()">✕ إغلاق</button>
  <span style="color:#64748b;font-size:.85em;margin-right:8px">يظهر الجدول بشكل صحيح عند الطباعة — اختر «حفظ كـ PDF» من خيارات الطابعة</span>
</div>

<div class="header">
  <div>
    <h1>📋 كشف الحضور والغياب</h1>
    <div class="meta">مدارس البشرى الأهلية &nbsp;·&nbsp; ${className} &nbsp;·&nbsp; المعلم: ${teacher} &nbsp;·&nbsp; ${label}</div>
  </div>
  <span class="badge-period">${_absCurrentPeriod==='week'?'أسبوعي':_absCurrentPeriod==='month'?'شهري':_absCurrentPeriod==='semester'?'فصلي':'مخصص'} — ${daysCols.length} يوم</span>
</div>

<div class="stats">
  <div class="stat"><div class="sv">${S.students.length}</div><div class="sl">👥 الطلاب</div></div>
  <div class="stat"><div class="sv">${daysCols.length}</div><div class="sl">📅 الأيام</div></div>
  <div class="stat"><div class="sv green">${totalPresent}</div><div class="sl">✅ حضور</div></div>
  <div class="stat"><div class="sv red">${totalAbsent}</div><div class="sl">❌ غياب</div></div>
  <div class="stat"><div class="sv gold">${totalExcused}</div><div class="sl">📋 بعذر</div></div>
  <div class="stat"><div class="sv green">${rate}%</div><div class="sl">📊 نسبة الحضور</div></div>
</div>

<div class="legend">
  <span>✅ حاضر</span>
  <span>❌ غائب بدون عذر</span>
  <span>📋 غائب بعذر</span>
  <span>— غير مسجل</span>
  <span style="background:rgba(239,68,68,0.1);color:#dc2626;padding:1px 7px;border-radius:99px;font-weight:800">3 = حالة حرجة</span>
</div>

<div class="tbl-wrap">
<table>
  <thead>
    <tr>
      <th style="width:30px;text-align:center">#</th>
      <th style="min-width:130px">اسم الطالب</th>
      ${thDayNames}
      <th style="text-align:center;width:44px;border-left:1px solid rgba(255,255,255,0.2)">❌</th>
      <th style="text-align:center;width:44px;border-left:1px solid rgba(255,255,255,0.2)">📋</th>
    </tr>
    <tr>
      <th></th><th style="font-size:.72em;font-weight:400;opacity:.6">الأيام ↓</th>
      ${thDates}
      <th style="text-align:center;font-size:.68em;font-weight:400;opacity:.75;border-left:1px solid rgba(255,255,255,0.2)">غياب</th>
      <th style="text-align:center;font-size:.68em;font-weight:400;opacity:.75;border-left:1px solid rgba(255,255,255,0.2)">عذر</th>
    </tr>
  </thead>
  <tbody>${studentRows}</tbody>
  <tfoot>
    <tr>
      <td style="text-align:center"></td>
      <td style="font-size:.82em">مجموع الغياب اليومي</td>
      ${sumRow}
      <td style="text-align:center;border-left:1px solid rgba(255,255,255,0.2)">${totalAbsent}</td>
      <td style="text-align:center;border-left:1px solid rgba(255,255,255,0.2)">${totalExcused}</td>
    </tr>
  </tfoot>
</table>
</div>

<div class="footer">
  مدارس البشرى الأهلية &nbsp;·&nbsp; ${className} &nbsp;·&nbsp; ${teacher} &nbsp;·&nbsp;
  تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
</div>
</body></html>`;

  const win = window.open('','_blank','width=1000,height=750,scrollbars=yes');
  if(!win){ toast('فعّل النوافذ المنبثقة في المتصفح','error'); return; }
  win.document.open();
  win.document.write(html);
  }

function renderAbsenceReport(){
  const now=new Date();
  const todayStr=now.toISOString().split('T')[0];
  const wk=new Date(now); wk.setDate(now.getDate()-7);
  const wkStr=wk.toISOString().split('T')[0];
  _absCurrentPeriod='week';

  return `
<div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">تقرير الغياب</span></div>
<div class="ph">
  <div>
    <div class="ph-title"><i class="ti ti-calendar-off"></i> تقرير الغياب</div>
    <div class="ph-sub" id="absPerDesc">عرض: آخر 7 أيام — ${_absGetClassName()}</div>
  </div>
  <div class="ph-actions">
    <button class="btn btn-ghost btn-sm" onclick="absExportCSV()">⬇ تصدير CSV</button>
    <button class="btn btn-primary btn-sm" onclick="absExportPDF()">📄 تصدير PDF</button>
    <button class="btn btn-sm" onclick="absExportForAdmin()" style="background:linear-gradient(135deg,#059669,#10b981);color:white;box-shadow:0 4px 14px rgba(5,150,105,0.30);">📤 إرسال للإدارة</button>
  </div>
</div>

<div style="display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#060d1a,#1e3a5f);border-radius:16px;padding:16px 20px;margin-bottom:16px;flex-wrap:wrap;gap:12px;">
  <div id="absRangeLabel" style="color:rgba(255,255,255,0.65);font-size:0.82rem;font-weight:700;">جار التحميل...</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <button class="abs-ptab" data-period="week"     onclick="_absCurrentPeriod='week';absSetPeriod('week')"         style="padding:8px 16px;border-radius:99px;border:1.5px solid var(--gold);color:#1a0800;font-size:0.83rem;font-weight:700;font-family:'Tajawal',sans-serif;background:var(--gold);cursor:none;transition:all 0.2s;">أسبوعي</button>
    <button class="abs-ptab" data-period="month"    onclick="_absCurrentPeriod='month';absSetPeriod('month')"       style="padding:8px 16px;border-radius:99px;border:1.5px solid rgba(255,255,255,0.22);color:rgba(255,255,255,0.7);font-size:0.83rem;font-weight:700;font-family:'Tajawal',sans-serif;background:transparent;cursor:none;transition:all 0.2s;">شهري</button>
    <button class="abs-ptab" data-period="semester" onclick="_absCurrentPeriod='semester';absSetPeriod('semester')" style="padding:8px 16px;border-radius:99px;border:1.5px solid rgba(255,255,255,0.22);color:rgba(255,255,255,0.7);font-size:0.83rem;font-weight:700;font-family:'Tajawal',sans-serif;background:transparent;cursor:none;transition:all 0.2s;">فصلي</button>
    <button class="abs-ptab" data-period="custom"   onclick="_absCurrentPeriod='custom';absSetPeriod('custom')"     style="padding:8px 16px;border-radius:99px;border:1.5px solid rgba(255,255,255,0.22);color:rgba(255,255,255,0.7);font-size:0.83rem;font-weight:700;font-family:'Tajawal',sans-serif;background:transparent;cursor:none;transition:all 0.2s;">✦ مخصص</button>
  </div>
</div>

<div id="absCustomRow" style="display:none;gap:10px;align-items:center;background:var(--card);border:1.5px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:16px;flex-wrap:wrap;">
  <label style="font-size:0.82rem;color:var(--muted);font-weight:700;">من:</label>
  <input type="date" id="absDateFrom" value="${wkStr}" style="padding:7px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.84rem;outline:none;direction:ltr;cursor:none;">
  <label style="font-size:0.82rem;color:var(--muted);font-weight:700;">إلى:</label>
  <input type="date" id="absDateTo" value="${todayStr}" style="padding:7px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.84rem;outline:none;direction:ltr;cursor:none;">
  <button class="btn btn-primary btn-sm" onclick="absApplyCustom()">⚡ إنشاء التقرير</button>
</div>

<div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));margin-bottom:16px;">
  <div class="kpi blue"><span class="kpi-icon">👥</span><div class="kpi-val" id="absKpiTotal">—</div><div class="kpi-label">إجمالي الطلاب</div></div>
  <div class="kpi gold"><span class="kpi-icon">📅</span><div class="kpi-val" id="absKpiDays">—</div><div class="kpi-label">أيام مسجلة</div></div>
  <div class="kpi red"><span class="kpi-icon">🚫</span><div class="kpi-val" id="absKpiAbsent">—</div><div class="kpi-label">بدون عذر</div></div>
  <div class="kpi gold"><span class="kpi-icon">📝</span><div class="kpi-val" id="absKpiExcused">—</div><div class="kpi-label">بعذر</div></div>
  <div class="kpi green"><span class="kpi-icon">✅</span><div class="kpi-val" id="absKpiRate">—</div><div class="kpi-label">نسبة الحضور</div></div>
  <div class="kpi plum"><span class="kpi-icon">⚠️</span><div class="kpi-val" id="absKpiCritical">—</div><div class="kpi-label">حالات حرجة (3+)</div></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
  <div class="card">
    <div class="card-header"><h3>📊 الغياب اليومي</h3></div>
    <div class="card-body"><div style="position:relative;width:100%;height:220px;"><canvas id="absChartBar"></canvas></div></div>
  </div>
  <div class="card">
    <div class="card-header"><h3>🍩 نوع الغياب</h3></div>
    <div class="card-body">
      <div style="display:flex;gap:14px;margin-bottom:10px;font-size:12px;color:var(--muted);">
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#ef4444;display:inline-block;"></span>بدون عذر</span>
        <span style="display:flex;align-items:center;gap:4px;"><span style="width:10px;height:10px;border-radius:2px;background:#f59e0b;display:inline-block;"></span>بعذر</span>
      </div>
      <div style="position:relative;width:100%;height:180px;"><canvas id="absChartDough"></canvas></div>
    </div>
  </div>
</div>

<div class="card" style="margin-bottom:14px;">
  <div class="card-header"><h3>👤 أكثر الطلاب غياباً</h3><span class="badge badge-plum" id="absClassCount">—</span></div>
  <div class="card-body"><div style="position:relative;width:100%;height:220px;"><canvas id="absChartClass"></canvas></div></div>
</div>

<div class="card" style="margin-bottom:14px;">
  <div class="card-header"><h3>📋 سجل الغياب التفصيلي</h3><span class="badge badge-red" id="absTableCount">—</span></div>
  <div class="card-body" style="padding:0;">
    <div style="overflow-x:auto;">
      <table class="tbl">
        <thead><tr><th>#</th><th>اسم الطالب</th><th>الفصل</th><th>التاريخ</th><th>النوع</th></tr></thead>
        <tbody id="absTable"></tbody>
      </table>
    </div>
  </div>
</div>

<div class="card" style="margin-bottom:20px;">
  <div class="card-header"><h3>⚠️ الأكثر غياباً</h3></div>
  <div class="card-body" id="absTopAbsent"></div>
</div>`;
}

function initAbsenceReportCharts(){
  absRenderData('week');
}


load();
// لا شاشة ترخيص — يبدأ مباشرةً بنظام الدخول الحقيقي (حساب المعلّم)
initAuth();

// ══════════════════════════════════════════════
// 📤 تصدير تقرير الغياب للإدارة
// ══════════════════════════════════════════════
function exportReportForAdmin(){
  // جمع كل سجلات الغياب (مش بس اليوم)
  const teacherName = [S.teacher.n1, S.teacher.n2, S.teacher.n3].filter(Boolean).join(' ') || 'غير محدد';
  const classes = getAllClasses();
  const activeClass = classes.find(c => c.id === ACTIVE_CLASS_ID) || { id: ACTIVE_CLASS_ID, name: 'فصل غير مسمى' };

  const exportData = {
    _type: 'bushra_admin_report',
    _version: 2,
    _exportedAt: new Date().toISOString(),
    classId: activeClass.id,
    className: activeClass.name,
    teacherName,
    studentCount: S.students.length,
    students: S.students.map(s => ({ id: s.id, name: s.name, parent: s.parent||'' })),
    attendance: S.attendance, // كل سجلات الحضور
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
  a.href = url;
  a.download = `تقرير_${activeClass.name}_${teacherName.split(' ')[0]}_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('✅ تم تصدير التقرير — أرسله للإدارة', 'success');
}

// ══════════════════════════════════════════════
// 📤 تصدير تقرير الغياب (مُصفَّى) من صفحة تقرير الغياب
// ══════════════════════════════════════════════
function absExportForAdmin(){
  if(S.students.length===0){ toast('لا يوجد طلاب مضافون','error'); return; }

  const teacherName = [S.teacher.n1, S.teacher.n2, S.teacher.n3].filter(Boolean).join(' ') || 'غير محدد';
  const classes     = getAllClasses();
  const activeClass = classes.find(c => c.id === ACTIVE_CLASS_ID) || { id: ACTIVE_CLASS_ID, name: 'فصل غير مسمى' };

  // الفترة الحالية المختارة في صفحة تقرير الغياب
  const from  = document.getElementById('absDateFrom')?.value;
  const to    = document.getElementById('absDateTo')?.value;
  const dates = _absFilterDates(_absCurrentPeriod, from, to);
  const label = _absGetLabel(_absCurrentPeriod, from, to);

  const periodLabels = { week:'أسبوعي', month:'شهري', semester:'فصلي', custom:'مخصص' };
  const periodLabel  = periodLabels[_absCurrentPeriod] || _absCurrentPeriod;

  // بناء attendance مُصفَّى بالأيام المختارة فقط
  const filteredAttendance = {};
  dates.forEach(d => {
    if(S.attendance[d]) filteredAttendance[d] = S.attendance[d];
  });

  const exportData = {
    _type:       'bushra_admin_report',
    _version:    2,
    _exportedAt: new Date().toISOString(),
    _period:     _absCurrentPeriod,
    _periodLabel: periodLabel,
    _dateRange:  label,
    _datesCount: dates.length,
    classId:     activeClass.id,
    className:   activeClass.name,
    teacherName,
    studentCount: S.students.length,
    students:    S.students.map(s => ({ id: s.id, name: s.name, parent: s.parent||'' })),
    attendance:  filteredAttendance,
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  const dateStr = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
  a.href     = url;
  a.download = `تقرير_غياب_${periodLabel}_${activeClass.name}_${teacherName.split(' ')[0]}_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast(`✅ تم تصدير التقرير ${periodLabel} (${dates.length} يوم) — أرسله للإدارة`, 'success');
}