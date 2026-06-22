// ══════════════════════════════════════════════
// PDF — HTML PRINT ENGINE (حل مشكلة العربية)
// ══════════════════════════════════════════════
function genStudentPDF(sid){
  choosePdfTemplate(tpl => _genStudentPDFWithTemplate(sid, tpl));
}

function _genStudentPDFWithTemplate(sid, tpl){
  const s=S.students.find(x=>x.id===sid);
  if(!s){toast('لم يُعثر على الطالب','error');return;}
  const m=studentMastery(sid);
  const ev=S.evals[sid]||{};
  const stuNotes=S.notes.filter(n=>n.sid===sid);

  // ── Build per-section summary rows ──
  let summaryRows='';
  S.subjects.forEach(sub=>{
    sub.sections.forEach(sec=>{
      const secEv=(ev[sub.id]||{})[sec.id]||{};
      const mastered=Object.values(secEv).filter(v=>v==='m').length;
      const pct=sec.skills.length?Math.round((mastered/sec.skills.length)*100):0;
      const lvl=pct>=70?'ممتاز':pct>=40?'جيد':'في بداية رحلته 🌱';
      const clr=pct>=70?'#059669':pct>=40?'#1565c0':'#10b981';
      summaryRows+=`<tr>
        <td>${sub.name} — ${sec.icon||''} ${sec.name}</td>
        <td style="text-align:center">${mastered}/${sec.skills.length}</td>
        <td style="text-align:center">${pct}%</td>
        <td style="text-align:center;color:${clr};font-weight:800">${lvl}</td>
      </tr>`;
    });
  });

  // ── Build detailed skill pages ──
  let detailPages='';
  S.subjects.forEach(sub=>{
    sub.sections.forEach(sec=>{
      const secEv=(ev[sub.id]||{})[sec.id]||{};
      let skillRows='';
      sec.skills.forEach((sk,i)=>{
        const v=secEv[i];
        const statusAr=v==='m'?'✅ أتقن':v==='n'?'🌱 في طور التعلم':'⬜ لم يُقيَّم بعد';
        const rowBg=v==='m'?'#f0fdf4':v==='n'?'#f0fdf4':'#f8faff';
        const clr=v==='m'?'#059669':v==='n'?'#10b981':'#94a3b8';
        skillRows+=`<tr style="background:${rowBg}">
          <td style="text-align:center;width:36px;color:#64748b;font-weight:700">${i+1}</td>
          <td>${sk}</td>
          <td style="text-align:center;color:${clr};font-weight:800;white-space:nowrap">${statusAr}</td>
        </tr>`;
      });
      detailPages+=`
        <div class="page-break">
          <div class="section-hdr" style="background:#1e3a5f">
            <span>${sub.icon||'📚'} ${sub.name}</span>
            <span style="opacity:.7;font-size:.85em">— ${sec.icon||'📌'} ${sec.name}</span>
          </div>
          <table class="skill-tbl">
            <thead><tr><th style="width:36px">#</th><th>المهارة</th><th style="width:130px">التقييم</th></tr></thead>
            <tbody>${skillRows}</tbody>
          </table>
        </div>`;
    });
  });

  // ── Notes section ──
  let notesHtml='';
  if(stuNotes.length){
    const typeMap={general:'عام',academic:'أكاديمي',behavior:'سلوكي',parent:'تواصل ولي'};
    const prioMap={normal:'عادي',important:'⭐ مهم',urgent:'⚡ عاجل'};
    notesHtml=`<div class="page-break">
      <div class="section-hdr" style="background:#7c3aed">📝 ملاحظات المعلم</div>
      <table class="skill-tbl">
        <thead><tr><th>التاريخ</th><th>النوع</th><th>الأولوية</th><th>الملاحظة</th></tr></thead>
        <tbody>${stuNotes.map(n=>`<tr>
          <td style="white-space:nowrap">${n.date}</td>
          <td>${typeMap[n.type]||n.type}</td>
          <td>${prioMap[n.prio]||'—'}</td>
          <td>${n.text}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  // ── Overall color ──
  const totalClr=m.total>=70?'#059669':m.total>=40?'#1565c0':'#10b981';
  const totalBg=m.total>=70?'#f0fdf4':m.total>=40?'#fffbeb':'#fef2f2';

  const html=`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير ${s.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;color:#1e293b;background:#fff;font-size:13px;line-height:1.55}
  .page{width:210mm;min-height:297mm;padding:14mm 16mm 12mm;position:relative}
  @page{size:A4 portrait;margin:0}
  @media print{body{margin:0}.page{padding:12mm 14mm 10mm}}

  /* ── Header ── */
  .report-header{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;border-radius:14px;padding:20px 24px;margin-bottom:16px;position:relative;overflow:hidden}
  .rh-badge{display:inline-block;background:rgba(245,158,11,.22);border:1px solid rgba(245,158,11,.45);color:#fbbf24;padding:3px 12px;border-radius:99px;font-size:.75em;font-weight:800;margin-bottom:8px}
  .rh-school{font-size:1.45em;font-weight:900;margin-bottom:3px}
  .rh-sub{opacity:.72;font-size:.88em;margin-bottom:12px}
  .rh-meta{display:flex;gap:20px;flex-wrap:wrap;font-size:.82em;opacity:.85}
  .rh-meta span{display:flex;align-items:center;gap:5px}

  /* ── Student card ── */
  .stu-card{display:flex;align-items:center;gap:14px;background:#f8faff;border:1.5px solid #e2e8f8;border-radius:12px;padding:14px 18px;margin-bottom:12px}
  .stu-avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.5em;font-weight:900;flex-shrink:0}
  .stu-name{font-size:1.2em;font-weight:900;color:#1e3a5f}
  .stu-meta{font-size:.82em;color:#64748b;margin-top:3px}

  /* ── Overall badge ── */
  .overall-badge{background:${totalBg};border:2px solid ${totalClr}33;border-radius:12px;padding:12px 20px;text-align:center;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
  .ob-label{font-size:.88em;color:#64748b;font-weight:700}
  .ob-val{font-size:2em;font-weight:900;color:${totalClr}}
  .ob-lvl{font-size:1em;font-weight:800;color:${totalClr}}

  /* ── Summary table ── */
  .summary-tbl,.skill-tbl{width:100%;border-collapse:collapse;margin-bottom:14px}
  .summary-tbl th,.skill-tbl th{background:#1e3a5f;color:#fff;padding:9px 12px;text-align:right;font-size:.85em;font-weight:800}
  .summary-tbl td,.skill-tbl td{padding:9px 12px;border-bottom:1px solid #e2e8f8;font-size:.9em}
  .summary-tbl tr:last-child td,.skill-tbl tr:last-child td{border-bottom:none}
  .summary-tbl tbody tr:hover,.skill-tbl tbody tr:hover{background:#f8faff}

  /* ── Section header ── */
  .section-hdr{color:#fff;padding:10px 16px;border-radius:10px 10px 0 0;font-weight:800;font-size:1em;margin-top:18px;margin-bottom:0;display:flex;align-items:center;gap:8px}

  /* ── Progress bar ── */
  .prog-wrap{background:#e2e8f8;border-radius:99px;height:7px;overflow:hidden;width:120px;display:inline-block;vertical-align:middle;margin-left:8px}
  .prog-bar{height:100%;border-radius:99px}

  /* ── Page break ── */
  .page-break{page-break-before:always}

  /* ── Footer ── */
  .footer{position:fixed;bottom:0;left:0;right:0;background:#f8faff;border-top:1px solid #e2e8f8;padding:7px 16mm;display:flex;justify-content:space-between;font-size:.75em;color:#94a3b8}

  /* ── Print button (hidden on print) ── */
  .print-actions{display:flex;gap:10px;margin-bottom:18px}
  @media print{.print-actions{display:none}.footer{position:fixed}}
  .print-btn{padding:11px 22px;border-radius:10px;border:none;font-family:'Tajawal',sans-serif;font-size:.95em;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:7px}
  .print-btn.primary{background:linear-gradient(135deg,#1e3a5f,#1565c0);color:#fff;box-shadow:0 4px 14px rgba(21,101,192,.28)}
  .print-btn.secondary{background:#f1f5fd;color:#1e3a5f;border:1.5px solid #e2e8f8}
</style>
</head>
<body>
<div class="page">

  <!-- Print actions -->
  <div class="print-actions">
    <button class="print-btn primary" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="print-btn secondary" onclick="window.close()">✕ إغلاق</button>
  </div>

  <!-- ═══ HEADER BANNER ═══ -->
  <div style="background:linear-gradient(135deg,#0d1b2a 0%,#1e3a5f 50%,#1565c0 100%);border-radius:16px;overflow:hidden;margin-bottom:18px;box-shadow:0 8px 32px rgba(21,101,192,0.25);">

    <!-- Top stripe: school logo + name + student photo -->
    <div style="display:flex;align-items:center;gap:16px;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,0.12);">
      <img src="${SCHOOL_LOGO}" style="width:90px;height:90px;object-fit:contain;background:white;border-radius:16px;padding:8px;flex-shrink:0;box-shadow:0 4px 18px rgba(0,0,0,0.35);" />
      <div style="flex:1;">
        <div style="display:inline-block;background:rgba(245,158,11,0.22);border:1px solid rgba(245,158,11,0.45);color:#fbbf24;padding:3px 14px;border-radius:99px;font-size:0.72em;font-weight:800;margin-bottom:6px;">📋 تقرير رسمي</div>
        <div style="font-size:1.6em;font-weight:900;color:white;line-height:1.2;">مدارس البشرى الأهلية</div>
        <div style="font-size:0.85em;color:rgba(255,255,255,0.60);margin-top:4px;">كشف متابعة طالب — الصف الأول الابتدائي &nbsp;·&nbsp; ${fmtDate(today())}</div>
      </div>
      <!-- Student photo -->
      ${s.photo
        ? `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;">
            <img src="${s.photo}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid rgba(255,255,255,0.75);box-shadow:0 6px 22px rgba(0,0,0,0.40);" />
            <div style="font-size:0.68em;color:rgba(255,255,255,0.50);font-weight:700;letter-spacing:0.5px;">صورة الطالب</div>
          </div>`
        : `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;">
            <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#42a5f5,#1565c0);display:flex;align-items:center;justify-content:center;font-size:2.5em;font-weight:900;color:white;border:4px solid rgba(255,255,255,0.35);box-shadow:0 6px 22px rgba(0,0,0,0.30);">${s.name.charAt(0)}</div>
            <div style="font-size:0.68em;color:rgba(255,255,255,0.35);font-weight:700;">الطالب</div>
          </div>`
      }
    </div>

    <!-- Bottom stripe: teacher info + student data -->
    <div style="display:flex;align-items:center;gap:14px;padding:14px 24px;background:rgba(0,0,0,0.25);flex-wrap:wrap;">
      ${S.teacher.photo
        ? `<img src="${S.teacher.photo}" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.70);flex-shrink:0;box-shadow:0 4px 16px rgba(0,0,0,0.35);" />`
        : `<div style="width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ef4444);display:flex;align-items:center;justify-content:center;font-size:2em;font-weight:900;color:white;flex-shrink:0;border:3px solid rgba(255,255,255,0.40);">${fullName().charAt(0)||'م'}</div>`
      }
      <div style="flex:1;">
        <div style="font-size:0.70em;color:rgba(255,255,255,0.45);font-weight:700;margin-bottom:2px;">المعلم المسؤول</div>
        <div style="font-size:1.20em;font-weight:900;color:white;">${fullName()}</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <div style="text-align:center;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:8px 16px;">
          <div style="font-size:0.68em;color:rgba(255,255,255,0.45);font-weight:700;">اسم الطالب</div>
          <div style="font-size:0.92em;font-weight:900;color:white;margin-top:2px;">${s.name}</div>
        </div>
        ${s.num ? `<div style="text-align:center;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.30);border-radius:10px;padding:8px 16px;">
          <div style="font-size:0.68em;color:rgba(255,255,255,0.45);font-weight:700;">رقم الجلوس</div>
          <div style="font-size:0.92em;font-weight:900;color:#fbbf24;margin-top:2px;">${s.num}</div>
        </div>` : ''}
        ${s.parent ? `<div style="text-align:center;background:rgba(16,185,129,0.10);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:8px 16px;">
          <div style="font-size:0.68em;color:rgba(255,255,255,0.45);font-weight:700;">ولي الأمر</div>
          <div style="font-size:0.82em;font-weight:800;color:#6ee7b7;margin-top:2px;">${s.parent}</div>
        </div>` : ''}
        <div style="text-align:center;background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);border-radius:10px;padding:8px 16px;">
          <div style="font-size:0.68em;color:rgba(255,255,255,0.45);font-weight:700;">الجنس</div>
          <div style="font-size:0.92em;font-weight:900;color:#c4b5fd;margin-top:2px;">${s.gender==='f'?'أنثى':'ذكر'}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Overall -->
  <div class="overall-badge">
    <div><div class="ob-label">المستوى الكلي</div><div class="ob-lvl">${masteryLabel(m.total)}</div></div>
    <div class="ob-val">${m.total}%</div>
    <div style="text-align:left">
      ${S.subjects.map(sub=>sub.sections.map(sec=>{
        const secEv=(ev[sub.id]||{})[sec.id]||{};
        const mst=Object.values(secEv).filter(v=>v==='m').length;
        const pct=sec.skills.length?Math.round((mst/sec.skills.length)*100):0;
        const clr=pct>=70?'#059669':pct>=40?'#1565c0':'#10b981';
        return `<div style="font-size:.82em;margin-bottom:3px;color:#475569"><span style="font-weight:700">${sec.name}:</span> <span style="color:${clr};font-weight:800">${pct}%</span></div>`;
      }).join('')).join('')}
    </div>
  </div>

  <!-- Summary table -->
  <div class="section-hdr" style="background:#1e3a5f;margin-top:4px">📊 ملخص التقييم</div>
  <table class="summary-tbl">
    <thead><tr><th>المادة / الخانة</th><th style="width:90px;text-align:center">المُتقن</th><th style="width:70px;text-align:center">النسبة</th><th style="width:100px;text-align:center">المستوى</th></tr></thead>
    <tbody>${summaryRows}</tbody>
  </table>

  <!-- Detailed sections -->
  ${detailPages}

  <!-- Notes -->
  ${notesHtml}

  <!-- Footer -->
  <div class="footer">
    <span>مدارس البشرى الأهلية — سري ومخصص لولي الأمر</span>
    <span>${s.name} | ${today()}</span>
  </div>
</div>
</body>
</html>`;

  // ── Kids template ──
  const kidsHtml = tpl === 'kids' ? `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>تقرير ${s.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Tajawal',Arial,sans-serif;direction:rtl;background:#fff;font-size:13px;line-height:1.6}
  .page{width:210mm;min-height:297mm;padding:12mm 14mm;position:relative}
  @page{size:A4 portrait;margin:0}
  @media print{body{margin:0}.page{padding:10mm 12mm}.no-print{display:none}}

  /* header */
  .k-header{background:linear-gradient(135deg,#f97316,#ec4899,#8b5cf6);border-radius:20px;padding:20px 24px;margin-bottom:18px;color:white;text-align:center;position:relative;overflow:hidden;}
  .k-header::before{content:'⭐ 🌟 ✨ 🎉 ⭐ 🌟 ✨ 🎉 ⭐ 🌟';position:absolute;top:6px;left:0;right:0;font-size:1.1em;opacity:0.25;letter-spacing:4px;}
  .k-school{font-size:1.5em;font-weight:900;margin-bottom:4px;}
  .k-badge{display:inline-block;background:rgba(255,255,255,0.25);border:1.5px solid rgba(255,255,255,0.5);border-radius:99px;padding:3px 14px;font-size:0.75em;font-weight:800;margin-bottom:10px;}
  .k-date{font-size:0.8em;opacity:0.8;}

  /* student card */
  .k-stu{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#fef3c7,#fde68a);border:2px solid #f59e0b;border-radius:18px;padding:14px 20px;margin-bottom:16px;}
  .k-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#f97316,#ec4899);color:white;display:flex;align-items:center;justify-content:center;font-size:1.8em;font-weight:900;flex-shrink:0;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.15);}
  .k-name{font-size:1.3em;font-weight:900;color:#92400e;}
  .k-meta{font-size:0.82em;color:#b45309;margin-top:3px;}

  /* overall */
  .k-overall{background:linear-gradient(135deg,#d1fae5,#a7f3d0);border:2px solid #10b981;border-radius:16px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;}
  .k-pct{font-size:2.4em;font-weight:900;color:#059669;}
  .k-lvl{font-size:1.1em;font-weight:800;color:#065f46;}
  .k-stars{font-size:1.6em;letter-spacing:2px;}

  /* section header */
  .k-sec-hdr{border-radius:12px;padding:8px 16px;font-weight:900;font-size:0.95em;margin-top:16px;margin-bottom:8px;display:flex;align-items:center;gap:8px;color:white;}

  /* skill rows */
  .k-skill-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;margin-bottom:5px;border:1.5px solid transparent;}
  .k-skill-row.mastered{background:#f0fdf4;border-color:#86efac;}
  .k-skill-row.learning{background:#fefce8;border-color:#fde047;}
  .k-skill-row.none{background:#f8faff;border-color:#e2e8f8;}
  .k-skill-icon{font-size:1.2em;flex-shrink:0;}
  .k-skill-name{flex:1;font-size:0.88em;font-weight:700;color:#1e293b;}
  .k-skill-status{font-size:0.78em;font-weight:800;border-radius:99px;padding:3px 10px;}
  .k-skill-status.m{background:#dcfce7;color:#15803d;}
  .k-skill-status.n{background:#fef9c3;color:#a16207;}
  .k-skill-status.x{background:#f1f5f9;color:#94a3b8;}

  /* summary */
  .k-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
  .k-sum-card{border-radius:14px;padding:12px 14px;text-align:center;}
  .k-sum-val{font-size:1.6em;font-weight:900;}
  .k-sum-lbl{font-size:0.72em;font-weight:700;margin-top:2px;}

  /* footer */
  .k-footer{margin-top:20px;text-align:center;font-size:0.75em;color:#94a3b8;border-top:2px dashed #e2e8f8;padding-top:10px;}

  /* print btn */
  .no-print{display:flex;gap:10px;margin-bottom:16px;}
  .k-btn{padding:10px 22px;border-radius:10px;border:none;font-family:'Tajawal',sans-serif;font-size:0.95em;font-weight:800;cursor:pointer;}
  .k-btn.primary{background:linear-gradient(135deg,#f97316,#ec4899);color:white;}
  .k-btn.secondary{background:#f1f5f9;color:#475569;}
  .page-break{page-break-before:always;}
</style>
</head>
<body>
<div class="page">
  <div class="no-print">
    <button class="k-btn primary" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="k-btn secondary" onclick="window.close()">✕ إغلاق</button>
  </div>

  <!-- Header -->
  <div class="k-header">
    <div class="k-badge">📋 تقرير متابعة الطالب</div>
    <div class="k-school">🏫 مدارس البشرى الأهلية</div>
    <div class="k-date">📅 ${fmtDate(today())} · الصف الأول الابتدائي</div>
  </div>

  <!-- Student -->
  <div class="k-stu">
    ${s.photo
      ? `<img src="${s.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid white;flex-shrink:0;" />`
      : `<div class="k-avatar">${s.name.charAt(0)}</div>`}
    <div>
      <div class="k-name">🌟 ${s.name}</div>
      <div class="k-meta">👩‍🏫 المعلم: ${fullName()} &nbsp;·&nbsp; 🎓 الصف الأول الابتدائي</div>
      ${s.parent ? `<div class="k-meta">👨‍👩‍👧 ولي الأمر: ${s.parent}</div>` : ''}
    </div>
  </div>

  <!-- Overall -->
  <div class="k-overall">
    <div>
      <div class="k-lvl">${m.total>=70?'🏆 ممتاز':m.total>=40?'⭐ جيد':'🌱 في بداية رحلته'}</div>
      <div style="font-size:0.82em;color:#065f46;margin-top:4px;">المستوى الكلي للطالب</div>
    </div>
    <div style="text-align:center;">
      <div class="k-pct">${m.total}%</div>
      <div class="k-stars">${m.total>=70?'⭐⭐⭐':m.total>=40?'⭐⭐':'⭐'}</div>
    </div>
  </div>

  <!-- Summary cards -->
  <div class="k-summary">
    ${S.subjects.map((sub,si)=>{
      const colors=[['#dbeafe','#1d4ed8'],['#fce7f3','#be185d'],['#d1fae5','#065f46'],['#fef3c7','#92400e']];
      const [bg,fg]=colors[si%colors.length];
      const subEv=S.evals[s.id]?.[sub.id]||{};
      let tot=0,mst=0;
      sub.sections.forEach(sec=>{const sv=subEv[sec.id]||{};tot+=sec.skills.length;mst+=Object.values(sv).filter(v=>v==='m').length;});
      const pct=tot?Math.round((mst/tot)*100):0;
      return `<div class="k-sum-card" style="background:${bg};border:2px solid ${fg}33;">
        <div class="k-sum-val" style="color:${fg}">${pct}%</div>
        <div class="k-sum-lbl" style="color:${fg}">${sub.icon||'📚'} ${sub.name}</div>
      </div>`;
    }).join('')}
  </div>

  <!-- Skills detail -->
  ${S.subjects.map((sub,si)=>{
    const secColors=['#6366f1','#f97316','#10b981','#ec4899','#0ea5e9'];
    return sub.sections.map((sec,seci)=>{
      const secEv=(S.evals[s.id]?.[sub.id]||{})[sec.id]||{};
      const color=secColors[(si+seci)%secColors.length];
      const skillRows=sec.skills.map((sk,i)=>{
        const v=secEv[i];
        const cls=v==='m'?'mastered':v==='n'?'learning':'none';
        const icon=v==='m'?'✅':v==='n'?'🌱':'⬜';
        const statusTxt=v==='m'?'أتقن ✨':v==='n'?'يتعلم 📖':'لم يُقيَّم';
        const statusCls=v==='m'?'m':v==='n'?'n':'x';
        return `<div class="k-skill-row ${cls}">
          <span class="k-skill-icon">${icon}</span>
          <span class="k-skill-name">${i+1}. ${sk}</span>
          <span class="k-skill-status ${statusCls}">${statusTxt}</span>
        </div>`;
      }).join('');
      return `<div class="k-sec-hdr" style="background:${color};">${sec.icon||'📌'} ${sub.name} — ${sec.name}</div>${skillRows}`;
    }).join('');
  }).join('<div class="page-break"></div>')}

  <!-- Footer -->
  <div class="k-footer">
    🏫 مدارس البشرى الأهلية &nbsp;·&nbsp; 👩‍🏫 ${fullName()} &nbsp;·&nbsp; 📅 ${today()}
  </div>
</div>
</body>
</html>` : null;

  const teacherPhoto = S.teacher.photo || '';
  const teacherName = fullName();
  const teacherHtml = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800;900&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Tajawal',sans-serif;direction:rtl;background:#f0f4ff;color:#1e293b;}
    @media print{.no-print{display:none}body{background:white}}
    .no-print{padding:12px 20px;background:white;border-bottom:1px solid #e2e8f8;display:flex;gap:10px;}
    .pb{padding:9px 20px;border-radius:9px;border:none;font-family:'Tajawal',sans-serif;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#7c3aed);color:white;font-size:.9em;}
    /* Header */
    .hdr{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#312e81 100%);padding:0;border-radius:0 0 24px 24px;margin-bottom:20px;overflow:hidden;}
    .hdr-top{display:flex;align-items:center;justify-content:space-between;padding:20px 28px 16px;}
    .hdr-school{display:flex;align-items:center;gap:12px;}
    .hdr-logo{width:54px;height:54px;object-fit:contain;background:white;border-radius:12px;padding:5px;}
    .hdr-school-name{color:white;font-size:1rem;font-weight:900;line-height:1.3;}
    .hdr-school-sub{color:rgba(255,255,255,0.5);font-size:0.72rem;margin-top:2px;}
    .hdr-teacher{display:flex;flex-direction:column;align-items:center;gap:6px;}
    .hdr-teacher-photo{width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.4);background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-size:1.4rem;font-weight:900;}
    .hdr-teacher-name{color:rgba(255,255,255,0.85);font-size:0.72rem;font-weight:700;text-align:center;}
    .hdr-teacher-role{color:rgba(255,255,255,0.45);font-size:0.65rem;text-align:center;}
    /* Student info band */
    .stu-band{background:rgba(255,255,255,0.06);border-top:1px solid rgba(255,255,255,0.08);padding:14px 28px;display:flex;align-items:center;gap:16px;}
    .stu-avatar{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2.5px solid rgba(255,255,255,0.3);background:linear-gradient(135deg,#42a5f5,#10b981);display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;font-weight:900;flex-shrink:0;}
    .stu-name{font-size:1.2rem;font-weight:900;color:white;}
    .stu-meta{font-size:0.75rem;color:rgba(255,255,255,0.5);margin-top:2px;}
    .stu-badge{margin-right:auto;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:8px 14px;text-align:center;}
    .stu-pct{font-size:1.5rem;font-weight:900;color:${m.total>=70?'#34d399':m.total>=40?'#fbbf24':'#f87171'};}
    .stu-lvl{font-size:0.68rem;color:rgba(255,255,255,0.55);margin-top:1px;}
    /* Body */
    .body{padding:0 20px 20px;}
    .section-title{font-size:0.80rem;font-weight:900;color:#64748b;letter-spacing:1px;margin:16px 0 8px;text-transform:uppercase;}
    .card{background:white;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:12px;}
    table{width:100%;border-collapse:collapse;}
    th{background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;padding:9px 14px;text-align:right;font-size:.82em;font-weight:800;}
    td{padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:.88em;}
    tr:last-child td{border-bottom:none;}
    tr:nth-child(even) td{background:#f8faff;}
    .skill-row{display:flex;align-items:center;gap:10px;padding:8px 14px;border-bottom:1px solid #f1f5f9;}
    .skill-row:last-child{border-bottom:none;}
    .skill-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
    .skill-dot.m{background:#10b981;} .skill-dot.n{background:#f59e0b;} .skill-dot.x{background:#e2e8f0;}
    .skill-name{flex:1;font-size:.84em;}
    .skill-status{font-size:.75em;font-weight:800;padding:2px 8px;border-radius:99px;}
    .skill-status.m{background:#dcfce7;color:#059669;} .skill-status.n{background:#fef3c7;color:#d97706;} .skill-status.x{background:#f1f5f9;color:#94a3b8;}
    .sec-hdr{background:linear-gradient(135deg,#1e3a5f,#312e81);color:white;padding:8px 14px;font-weight:800;font-size:.82em;display:flex;align-items:center;gap:6px;}
    /* Signature */
    .sig{background:white;border-radius:14px;padding:16px 20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);display:flex;align-items:center;gap:14px;margin-top:16px;}
    .sig-photo{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #e2e8f8;background:linear-gradient(135deg,#42a5f5,#7c3aed);display:flex;align-items:center;justify-content:center;color:white;font-size:1.1rem;font-weight:900;flex-shrink:0;}
    .sig-line{flex:1;border-top:1.5px dashed #e2e8f8;margin-top:8px;}
    .sig-label{font-size:0.70rem;color:#94a3b8;margin-bottom:4px;}
    .sig-name{font-size:0.88rem;font-weight:900;color:#1e3a5f;}
    .footer{text-align:center;font-size:.72em;color:#94a3b8;margin-top:16px;padding-top:10px;border-top:1px solid #e2e8f8;}
    @page{size:A4;margin:10mm}
  </style></head><body>
  <div class="no-print">
    <button class="pb" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
    <button class="pb" style="background:#f1f5f9;color:#1e3a5f;" onclick="window.close()">✕ إغلاق</button>
  </div>

  <!-- Header -->
  <div class="hdr">
    <div class="hdr-top">
      <div class="hdr-school">
        <img src="${SCHOOL_LOGO}" class="hdr-logo" />
        <div>
          <div class="hdr-school-name">مدارس البشرى الأهلية</div>
          <div class="hdr-school-sub">تقرير متابعة طالب · ${fmtDate(today())}</div>
        </div>
      </div>
      <div class="hdr-teacher">
        ${teacherPhoto
          ? `<img src="${teacherPhoto}" class="hdr-teacher-photo" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,0.4);" />`
          : `<div class="hdr-teacher-photo">${teacherName.charAt(0)||'م'}</div>`}
        <div class="hdr-teacher-name">${teacherName}</div>
        <div class="hdr-teacher-role">معلم الفصل</div>
      </div>
    </div>
    <div class="stu-band">
      ${s.photo
        ? `<img src="${s.photo}" class="stu-avatar" style="width:52px;height:52px;border-radius:50%;object-fit:cover;" />`
        : `<div class="stu-avatar">${s.name.charAt(0)}</div>`}
      <div>
        <div class="stu-name">${s.name}</div>
        <div class="stu-meta">الصف الأول الابتدائي · ${fmtDate(today())}</div>
      </div>
      <div class="stu-badge">
        <div class="stu-pct">${m.total}%</div>
        <div class="stu-lvl">${m.total>=70?'ممتاز 🏆':m.total>=40?'جيد 📈':'في بداية رحلته 🌱'}</div>
      </div>
    </div>
  </div>

  <!-- Body -->
  <div class="body">
    <div class="section-title">📊 ملخص المهارات</div>
    <div class="card">
      <table>
        <thead><tr><th>المادة والخانة</th><th style="text-align:center;width:80px">مُتقَن</th><th style="text-align:center;width:70px">النسبة</th><th style="text-align:center;width:90px">المستوى</th></tr></thead>
        <tbody>${summaryRows}</tbody>
      </table>
    </div>

    <div class="section-title">📋 تفاصيل المهارات</div>
    ${S.subjects.map(sub=>sub.sections.map(sec=>{
      const secEv=(ev[s.id]?.[sub.id]||{})[sec.id]||{};
      const rows=sec.skills.map((sk,i)=>{
        const v=secEv[i];
        const cls=v==='m'?'m':v==='n'?'n':'x';
        const st=v==='m'?'أتقن':v==='n'?'يتعلم':'لم يُقيَّم';
        return `<div class="skill-row"><div class="skill-dot ${cls}"></div><div class="skill-name">${i+1}. ${sk}</div><span class="skill-status ${cls}">${st}</span></div>`;
      }).join('');
      return `<div class="card"><div class="sec-hdr">${sec.icon||'📌'} ${sub.name} — ${sec.name}</div>${rows}</div>`;
    }).join('')).join('')}

    <!-- Signature -->
    <div class="sig">
      ${teacherPhoto
        ? `<img src="${teacherPhoto}" class="sig-photo" style="width:48px;height:48px;border-radius:50%;object-fit:cover;" />`
        : `<div class="sig-photo">${teacherName.charAt(0)||'م'}</div>`}
      <div style="flex:1;">
        <div class="sig-label">توقيع المعلم</div>
        <div class="sig-name">${teacherName}</div>
        <div class="sig-line"></div>
      </div>
      <div style="text-align:center;">
        <div class="sig-label">التاريخ</div>
        <div class="sig-name">${fmtDate(today())}</div>
      </div>
    </div>

    <div class="footer">🏫 مدارس البشرى الأهلية · جميع الحقوق محفوظة · ${today()}</div>
  </div>
</body></html>`;

  const finalHtml = tpl === 'kids' ? kidsHtml : tpl === 'teacher' ? teacherHtml : html;
  const win=window.open('','_blank','width=900,height=700,scrollbars=yes');
  if(!win){toast('السماح بالنوافذ المنبثقة لتحميل التقرير','error');return;}
  win.document.write(finalHtml);
  win.document.close();
  toast('تم فتح التقرير — اضغط 🖨️ للحفظ كـ PDF','success');
}
