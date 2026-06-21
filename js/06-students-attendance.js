// ══════════════════════════════════════════════
// STUDENTS
// ══════════════════════════════════════════════
let stuSearch='', stuView='table';
function renderStudents(){
  const filtered=S.students.filter(s=>s.name.includes(stuSearch)||stuSearch==='');
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">الطلاب</span></div>
  <div class="ph">
    <div><div class="ph-title">👥 إدارة الطلاب</div><div class="ph-sub">${S.students.length} طالب مسجّل · الصف الأول الابتدائي</div></div>
    <div class="ph-actions">
      <div class="search-box"><span class="search-icon">🔍</span><input placeholder="بحث عن طالب..." value="${stuSearch}" oninput="stuSearch=this.value;showPage('students')" /></div>
      <button class="btn btn-ghost btn-sm" onclick="stuView=stuView==='table'?'cards':'table';showPage('students')">${stuView==='table'?'🃏 بطاقات':'📋 جدول'}</button>
      <button class="btn btn-ghost btn-sm" onclick="openStudentCards()">🖨️ طباعة البطاقات</button>
      <button class="btn btn-primary" onclick="openAddModal()">➕ إضافة طالب</button>
    </div>
  </div>
  ${filtered.length===0?`<div class="empty"><div class="empty-emoji">👶</div><h3>لا يوجد طلاب</h3><p>اضغط "إضافة طالب" لبدء إضافة طلابك</p></div>`
  : stuView==='cards' ? renderStudentCards(filtered) : renderStudentTable(filtered)}
  `;
}

function renderStudentTable(list){
  const td=today();
  return `<div class="card"><div class="tbl-wrap"><table class="tbl">
    <thead><tr>
      <th>#</th><th>الطالب</th><th>مستوى القراءة</th><th>مستوى الكتابة</th><th>الكلي</th><th>التقدم</th><th>الحضور</th><th>الإجراءات</th>
    </tr></thead>
    <tbody>
    ${list.map((s,i)=>{
      const m=studentMastery(s.id);
      const p=studentProgressSimple(s.id);
      const att=(S.attendance[td]||{})[s.id];
      const trendIcon = p.delta>0?'↗':p.delta<0?'↘':'→';
      const trendColor = p.delta>0?'var(--mint)':p.delta<0?'var(--muted)':'var(--muted2)';
      return `<tr>
        <td><span class="rank-circ">${i+1}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            ${avatarHTML(s.id,40,'',true)}
            <div>
              <div style="font-weight:800;color:var(--ink2);">${s.name}</div>
              <div style="font-size:0.74rem;color:var(--muted);">${s.parent||'لا يوجد رقم'}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="prog-wrap" style="width:80px;"><div class="prog-bar ${masteryColor(m.rPct)}" style="width:${m.rPct}%"></div></div>
            <small style="color:var(--muted);font-weight:700;">${m.rm}/${m.rt}</small>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="prog-wrap" style="width:80px;"><div class="prog-bar ${masteryColor(m.wPct)}" style="width:${m.wPct}%"></div></div>
            <small style="color:var(--muted);font-weight:700;">${m.wm}/${m.wt}</small>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:7px;">
            ${buildRadialSVG(m.total,masteryColor(m.total))}
            <div>
              <div class="radial-val" style="position:static;font-size:0.85rem;font-weight:900;color:var(--ink2);">${m.total}%</div>
              <span class="badge badge-${masteryColor(m.total)}">${masteryLabel(m.total)}</span>
            </div>
          </div>
        </td>
        <td>
          <div style="font-size:0.88rem;font-weight:800;color:${trendColor};display:flex;align-items:center;gap:4px;" title="${p.delta>0?`تحسّن +${p.delta} مهارة`:p.delta<0?`تراجع ${p.delta}`:' لا تغيير'}">
            <span style="font-size:1rem;">${trendIcon}</span>
            <span>${p.label}</span>
          </div>
        </td>
        <td><span class="badge ${att==='p'?'badge-green':att==='a'?'badge-red':att==='e'?'badge-gold':'badge-gray'}">${att==='p'?'✅ حاضر':att==='a'?'❌ غائب':att==='e'?'📋 بعذر':'—'}</span></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-primary btn-xs" onclick="openEval('${s.id}')">✏️ تقييم</button>
            <button class="btn btn-green btn-xs" onclick="openChart('${s.id}')">📊</button>
            <button class="btn btn-ghost btn-xs" onclick="openNoteFor('${s.id}')">📝</button>
            <button class="btn btn-plum btn-xs" onclick="openGoalFor('${s.id}')">🎯</button>
            <button class="btn btn-gold btn-xs" onclick="openMeetingFor('${s.id}')">🤝</button>
            <button class="btn btn-red btn-xs" onclick="delStudent('${s.id}')">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table></div></div>`;
}

function renderStudentCards(list){
  const td=today();
  return `<div class="student-cards-grid">
    ${list.map(s=>{
      const m=studentMastery(s.id);
      const p=studentProgressSimple(s.id);
      const att=(S.attendance[td]||{})[s.id];
      const trendIcon = p.delta>0?'↗':p.delta<0?'↘':'→';
      const trendColor = p.delta>0?'var(--mint)':p.delta<0?'var(--muted)':'var(--muted2)';
      const trendTitle = p.delta>0?`تحسّن +${p.delta} مهارة منذ البداية`:p.delta<0?`تراجع ${p.delta} مهارة`:'لا تغيير بعد';
      return `<div class="stu-card" onclick="openEval('${s.id}')">
        <div class="stu-card-top">
          ${avatarHTML(s.id,48,'border-radius:14px;',true)}
          <div>
            <div class="stu-card-name">${s.name}</div>
            <div class="stu-card-num">${s.parent?'📱 '+s.parent:'لا يوجد رقم'}</div>
          </div>
        </div>
        <div class="stu-card-prog-label"><span>📖 القراءة</span><span>${m.rPct}%</span></div>
        <div class="prog-wrap" style="margin-bottom:10px;"><div class="prog-bar ${masteryColor(m.rPct)}" style="width:${m.rPct}%"></div></div>
        <div class="stu-card-prog-label"><span>✍️ الكتابة</span><span>${m.wPct}%</span></div>
        <div class="prog-wrap"><div class="prog-bar ${masteryColor(m.wPct)}" style="width:${m.wPct}%"></div></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
          <span class="badge badge-${masteryColor(m.total)}">${m.total}%</span>
          <span style="font-size:0.80rem;font-weight:800;color:${trendColor}" title="${trendTitle}">
            ${trendIcon} ${p.label}
          </span>
          <span class="badge badge-${att==='p'?'green':att==='a'?'red':att==='e'?'gold':'gray'}">${att==='p'?'✅':att==='a'?'❌':att==='e'?'📋':'—'}</span>
        </div>
        <div class="stu-card-actions" onclick="event.stopPropagation()">
          <button class="btn btn-green btn-sm" onclick="openChart('${s.id}')">📊 رسم</button>
          <button class="btn btn-ghost btn-sm" onclick="openNoteFor('${s.id}')">📝 ملاحظة</button>
          <button class="btn btn-red btn-sm" onclick="delStudent('${s.id}')">🗑���</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function openAddModal(){ 
  document.getElementById('an1').value='';
  document.getElementById('an2').value='';
  document.getElementById('an3').value='';
  document.getElementById('an5').value='';
  // Reset photo
  _addPhotoData='';
  const prev=document.getElementById('addModalPhotoPreview');
  if(prev) prev.innerHTML='👤';
  const inp=document.getElementById('an6');
  if(inp) inp.value='';
  openM('mbAdd'); 
}

// saveStudent — see photo system section below

function delStudent(id){
  const s=S.students.find(x=>x.id===id);
  if(!s||!confirm(`حذف "${s.name}"؟ لا يمكن التراجع.`)) return;
  logChange('del','حذف طالب',s.name);
  S.students=S.students.filter(x=>x.id!==id);
  delete S.evals[id];
  Object.keys(S.attendance).forEach(d=>{if(S.attendance[d])delete S.attendance[d][id];});
  S.notes=S.notes.filter(n=>n.sid!==id);
  save();
  document.getElementById('nb-students').textContent=S.students.length;
  toast('تم الحذف','success');
  showPage('students');
}

// ══════════════════════════════════════════════
// ATTENDANCE
// ══════════════════════════════════════════════
let attendDate=today();
function renderAttend(){
  const att=S.attendance[attendDate]||{};
  const p=Object.values(att).filter(v=>v==='p').length;
  const a=Object.values(att).filter(v=>v==='a').length;
  const e=Object.values(att).filter(v=>v==='e').length;
  const un=S.students.length-Object.keys(att).length;

  // History for last 5 dates
  const histDates=Object.keys(S.attendance).sort().slice(-5).reverse();

  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">كشف الحضور</span></div>
  <div class="ph">
    <div><div class="ph-title">📋 كشف الحضور اليومي</div><div class="ph-sub">${fmtDate(attendDate)}</div></div>
    <div class="ph-actions">
      <input type="date" value="${attendDate}" onchange="attendDate=this.value;showPage('attend')" style="padding:9px 14px;border:1.5px solid var(--border2);border-radius:var(--r-sm);font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;cursor:none;">
      <button class="btn btn-green btn-sm" onclick="markAllAtt('p')">✅ تحضير الكل</button>
      <button class="btn btn-red btn-sm" onclick="markAllAtt('a')">❌ غياب الكل</button>
      <button class="btn btn-gold btn-sm" onclick="exportAttendancePDF()">📄 PDF</button>
      <button class="btn btn-primary btn-sm" onclick="exportReportForAdmin()" style="background:linear-gradient(135deg,#059669,#10b981);">📤 إرسال للإدارة</button>
    </div>
  </div>

  <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:18px;">
    <div class="kpi blue"><span class="kpi-icon" style="font-size:20px;">👥</span><div class="kpi-val" style="font-size:1.6rem;">${S.students.length}</div><div class="kpi-label">الكل</div></div>
    <div class="kpi green"><span class="kpi-icon" style="font-size:20px;">✅</span><div class="kpi-val" style="font-size:1.6rem;">${p}</div><div class="kpi-label">حاضر</div></div>
    <div class="kpi red"><span class="kpi-icon" style="font-size:20px;">❌</span><div class="kpi-val" style="font-size:1.6rem;">${a}</div><div class="kpi-label">غائب</div></div>
    <div class="kpi gold"><span class="kpi-icon" style="font-size:20px;">📋</span><div class="kpi-val" style="font-size:1.6rem;">${e}</div><div class="kpi-label">بعذر</div></div>
    <div class="kpi plum"><span class="kpi-icon" style="font-size:20px;">❓</span><div class="kpi-val" style="font-size:1.6rem;">${un}</div><div class="kpi-label">غير مسجل</div></div>
  </div>

  ${S.students.length===0?`<div class="empty"><div class="empty-emoji">📋</div><h3>لا يوجد طلاب</h3><p>أضف طلاباً أولاً من قسم الطلاب</p></div>`:`
  <div class="card" style="margin-bottom:20px;">
    <div class="card-header"><h3>📋 كشف الحضور</h3>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="prog-wrap" style="width:120px;"><div class="prog-bar ${p/S.students.length>=0.8?'green':'gold'}" style="width:${S.students.length?Math.round((p/S.students.length)*100):0}%"></div></div>
        <span class="badge badge-${p/S.students.length>=0.8?'green':'gold'}">${S.students.length?Math.round((p/S.students.length)*100):0}% حضور</span>
      </div>
    </div>
    <div class="tbl-wrap"><table class="tbl">
      <thead><tr><th>#</th><th>الطالب</th><th>الحالة</th><th>ملاحظة سريعة</th></tr></thead>
      <tbody>
        ${S.students.map((s,i)=>{
          const cur=(S.attendance[attendDate]||{})[s.id];
          return `<tr id="atr_${s.id}">
            <td><span class="rank-circ">${i+1}</span></td>
            <td>
              <div style="display:flex;align-items:center;gap:9px;">
                <div class="avatar av-32" style="${avatarStyle(s.id)};color:white;">${s.name.charAt(0)}</div>
                <span style="font-weight:700;">${s.name}</span>
              </div>
            </td>
            <td>
              <div style="display:flex;gap:7px;">
                <button class="att-chip att-p ${cur==='p'?'sel':''}" onclick="setAtt('${s.id}','p')">✅ حاضر</button>
                <button class="att-chip att-a ${cur==='a'?'sel':''}" onclick="setAtt('${s.id}','a')">❌ غائب</button>
                <button class="att-chip att-ex ${cur==='e'?'sel':''}" onclick="setAtt('${s.id}','e')">📋 بعذر</button>
              </div>
            </td>
            <td><button class="btn btn-ghost btn-xs" onclick="openNoteFor('${s.id}')">+ ملاحظة</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table></div>
  </div>`}

  ${histDates.length>0?`
  <div class="card">
    <div class="card-header"><h3>📅 سجل الحضور السابق</h3></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;">
        ${histDates.map(d=>{
          const da=S.attendance[d]||{};
          const dp=Object.values(da).filter(v=>v==='p').length;
          const pct=S.students.length?Math.round((dp/S.students.length)*100):0;
          return `<div class="kpi ${pct>=80?'green':pct>=60?'gold':'red'}" style="cursor:none;" onclick="attendDate='${d}';showPage('attend')">
            <div class="kpi-val" style="font-size:1.4rem;">${pct}%</div>
            <div class="kpi-label">${fmtShort(d)}</div>
            <div class="kpi-trend">${dp}/${S.students.length} حاضر</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`:''}
  `;
}

function setAtt(sid,val){
  if(!S.attendance[attendDate]) S.attendance[attendDate]={};
  S.attendance[attendDate][sid]=val;
  save();
  const row=document.getElementById('atr_'+sid);
  if(!row) return;
  row.querySelectorAll('.att-chip').forEach(b=>{
    b.classList.remove('sel');
    if((b.classList.contains('att-p')&&val==='p')||(b.classList.contains('att-a')&&val==='a')||(b.classList.contains('att-ex')&&val==='e')) b.classList.add('sel');
  });
}

function markAllAtt(val){
  if(!S.attendance[attendDate]) S.attendance[attendDate]={};
  S.students.forEach(s=>S.attendance[attendDate][s.id]=val);
  save();
  logChange('att','تسجيل حضور جماعي',val==='p'?'تحضير الكل':val==='a'?'غياب الكل':'بعذر الكل');
  showPage('attend');
}

function exportAttendancePDF(){
  choosePdfTemplate(tpl => _exportAttendancePDFWithTemplate(tpl));
}
function _exportAttendancePDFWithTemplate(tpl){
  const att=S.attendance[attendDate]||{};
  const p=Object.values(att).filter(v=>v==='p').length;
  const a=Object.values(att).filter(v=>v==='a').length;
  const e=Object.values(att).filter(v=>v==='e').length;

  const rows=S.students.map((s,i)=>{
    const v=att[s.id];
    const statusAr=v==='p'?'<span style="color:#059669;font-weight:800">✅ حاضر</span>':v==='a'?'<span style="color:#dc2626;font-weight:800">❌ غائب</span>':v==='e'?'<span style="color:#d97706;font-weight:800">📋 بعذر</span>':'<span style="color:#94a3b8">—</span>';
    return `<tr style="background:${i%2?'#f8faff':'#fff'}">
      <td style="text-align:center;font-weight:800;color:#1e3a5f">${i+1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          ${s.photo
            ?`<img src="${s.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1.5px solid #e2e8f8;flex-shrink:0;" />`
            :`<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;flex-shrink:0;">${s.name.charAt(0)}</div>`
          }
          <strong>${s.name}</strong>
        </div>
      </td>
      <td style="text-align:center">${statusAr}</td>
      <td style="color:#94a3b8;font-size:.85em">${s.parent||'—'}</td>
    </tr>`;
  }).join('');

  const html=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>كشف الحضور ${attendDate}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;color:#1e293b;background:#fff;font-size:13px}
  @page{size:A4 portrait;margin:12mm}
  @media print{.no-print{display:none}}
  .no-print{display:flex;gap:10px;padding:12px;background:#f8faff;border-bottom:1px solid #e2e8f8}
  .pbtn{padding:10px 20px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-size:.9em;font-weight:800;cursor:pointer}
  .pbtn.primary{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff}
  .pbtn.secondary{background:#f1f5fd;color:#1e3a5f;border:1.5px solid #e2e8f8}
  .header{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;padding:18px 22px;margin-bottom:14px;border-radius:12px}
  .header h1{font-size:1.3em;font-weight:900;margin-bottom:5px}
  .header .meta{font-size:.85em;opacity:.8}
  .stats{display:flex;gap:10px;margin-bottom:14px}
  .stat{background:#f8faff;border:1px solid #e2e8f8;border-radius:9px;padding:10px 16px;text-align:center;flex:1}
  .sv{font-size:1.5em;font-weight:900;color:#1e3a5f}
  .sl{font-size:.75em;color:#64748b;font-weight:700;margin-top:2px}
  table{width:100%;border-collapse:collapse}
  th{background:#1e3a5f;color:#fff;padding:10px 12px;text-align:right;font-weight:800;font-size:.88em}
  td{padding:9px 12px;border-bottom:1px solid #e2e8f8;font-size:.92em}
  tr:last-child td{border-bottom:none}
  .footer{text-align:center;color:#94a3b8;font-size:.75em;margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f8}
</style>
</head>
<body style="padding:12px">
<div class="no-print">
  <button class="pbtn primary" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <button class="pbtn secondary" onclick="window.close()">✕ إغلاق</button>
</div>
<div class="header">
  <h1>📋 كشف الحضور اليومي</h1>
  <div class="meta">مدارس البشرى الأهلية · الصف الأول الابتدائي · المعلم: ${fullName()} · ${fmtDate(attendDate)}</div>
</div>
<div class="stats">
  <div class="stat"><div class="sv">${S.students.length}</div><div class="sl">إجمالي</div></div>
  <div class="stat"><div class="sv" style="color:#059669">${p}</div><div class="sl">✅ حاضر</div></div>
  <div class="stat"><div class="sv" style="color:#dc2626">${a}</div><div class="sl">❌ غائب</div></div>
  <div class="stat"><div class="sv" style="color:#d97706">${e}</div><div class="sl">📋 بعذر</div></div>
  <div class="stat"><div class="sv" style="color:#1565c0">${S.students.length?Math.round((p/S.students.length)*100):0}%</div><div class="sl">نسبة الحضور</div></div>
</div>
<table>
  <thead><tr><th>#</th><th>اسم الطالب</th><th style="width:130px;text-align:center">الحالة</th><th>رقم الولي</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="footer">مدارس البشرى الأهلية · ${attendDate} · ${fullName()}</div>
</body></html>`;

  const win=window.open('','_blank','width=800,height=650,scrollbars=yes');
  if(!win){toast('السماح بالنوافذ المنبثقة','error');return;}

  let finalHtml = html;
  if(tpl === 'teacher'){
    const tPhoto = S.teacher.photo||'';
    const tName  = fullName();
    finalHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<title>كشف الحضور ${attendDate}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;background:#f8faff;font-size:13px;}
  @page{size:A4 portrait;margin:12mm} @media print{.np{display:none}body{background:white}}
  .np{display:flex;gap:10px;padding:12px;background:white;border-bottom:1px solid #e2e8f8;}
  .pb{padding:9px 18px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;font-size:.88em;}
  .pb2{padding:9px 18px;border-radius:9px;border:1px solid #e2e8f8;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:#f1f5f9;color:#475569;font-size:.88em;}
  .hdr{background:linear-gradient(135deg,#0f172a,#1e3a5f,#312e81);padding:16px 22px;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-radius:12px;}
  .hdr-left{display:flex;align-items:center;gap:10px;}
  .hdr-logo{width:46px;height:46px;object-fit:contain;background:white;border-radius:10px;padding:4px;}
  .hdr-title{color:white;font-size:1.1em;font-weight:900;} .hdr-sub{color:rgba(255,255,255,0.5);font-size:.75em;margin-top:2px;}
  .t-card{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:7px 12px;}
  .t-photo{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.3);background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;flex-shrink:0;}
  .t-name{color:white;font-size:.80em;font-weight:800;} .t-role{color:rgba(255,255,255,0.45);font-size:.68em;}
  .stats{display:flex;gap:8px;margin-bottom:14px;}
  .stat{background:white;border:1px solid #e2e8f8;border-radius:9px;padding:9px 14px;text-align:center;flex:1;}
  .sv{font-size:1.4em;font-weight:900;color:#1e3a5f;} .sl{font-size:.72em;color:#64748b;font-weight:700;margin-top:2px;}
  table{width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);}
  th{background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;padding:10px 12px;text-align:right;font-size:.85em;font-weight:800;}
  td{padding:9px 12px;border-bottom:1px solid #f1f5f9;font-size:.9em;}
  tr:last-child td{border-bottom:none;} tr:nth-child(even) td{background:#f8faff;}
  .sig{display:flex;align-items:center;gap:12px;padding:10px 0;margin-top:14px;border-top:1px solid #e2e8f8;}
  .sig-photo{width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f8;background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;flex-shrink:0;}
  .sig-line{flex:1;border-top:1.5px dashed #e2e8f8;}
  .sig-lbl{font-size:.68em;color:#94a3b8;font-weight:700;} .sig-val{font-size:.82em;font-weight:900;color:#1e3a5f;}
</style></head><body style="padding:12px">
<div class="np">
  <button class="pb" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  <button class="pb2" onclick="window.close()">✕ إغلاق</button>
</div>
<div class="hdr">
  <div class="hdr-left">
    <img src="${SCHOOL_LOGO}" class="hdr-logo"/>
    <div><div class="hdr-title">📋 كشف الحضور اليومي</div><div class="hdr-sub">مدارس البشرى الأهلية · ${fmtDate(attendDate)}</div></div>
  </div>
  <div class="t-card">
    ${tPhoto?`<img src="${tPhoto}" class="t-photo" style="width:38px;height:38px;border-radius:50%;object-fit:cover;"/>`:`<div class="t-photo">${tName.charAt(0)||'م'}</div>`}
    <div><div class="t-name">${tName}</div><div class="t-role">معلم الفصل</div></div>
  </div>
</div>
<div class="stats">
  <div class="stat"><div class="sv">${S.students.length}</div><div class="sl">إجمالي</div></div>
  <div class="stat"><div class="sv" style="color:#059669">${p}</div><div class="sl">✅ حاضر</div></div>
  <div class="stat"><div class="sv" style="color:#dc2626">${a}</div><div class="sl">❌ غائب</div></div>
  <div class="stat"><div class="sv" style="color:#d97706">${e}</div><div class="sl">📋 بعذر</div></div>
  <div class="stat"><div class="sv" style="color:#1565c0">${S.students.length?Math.round((p/S.students.length)*100):0}%</div><div class="sl">نسبة الحضور</div></div>
</div>
<table>
  <thead><tr><th>#</th><th>اسم الطالب</th><th style="text-align:center;width:130px">الحالة</th><th>رقم الولي</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="sig">
  ${tPhoto?`<img src="${tPhoto}" class="sig-photo" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"/>`:`<div class="sig-photo">${tName.charAt(0)||'م'}</div>`}
  <div><div class="sig-lbl">توقيع المعلم</div><div class="sig-val">${tName}</div></div>
  <div class="sig-line"></div>
  <div style="text-align:center"><div class="sig-lbl">التاريخ</div><div class="sig-val">${fmtDate(attendDate)}</div></div>
</div>
</body></html>`;
  }

  win.document.write(finalHtml);
  win.document.close();
  toast('تم فتح كشف الحضور — اضغط 🖨️ للحفظ كـ PDF','success');
}
