// ══════════════════════════════════════════════
// ANALYTICS
// ══════════════════════════════════════════════
function renderAnalytics(){
  const sortedStudents=[...S.students].map(s=>({...s,...studentMastery(s.id)})).sort((a,b)=>b.total-a.total);
  // Collect all sections for skill mastery display
  const firstSub=S.subjects[0];
  const firstSec=firstSub?.sections[0];
  const skillMastery=firstSec?firstSec.skills.map((sk,i)=>{
    const count=S.students.filter(s=>((S.evals[s.id]?.[firstSub.id]||{})[firstSec.id]||{})[i]==='m').length;
    return{skill:sk,count,pct:S.students.length?Math.round((count/S.students.length)*100):0};
  }).sort((a,b)=>b.pct-a.pct):[];

  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">تحليلات</span></div>
  <div class="ph"><div><div class="ph-title">📈 تحليلات متقدمة</div><div class="ph-sub">رؤى عميقة حول مستوى الصف</div></div></div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px;">
    <div class="chart-box">
      <h3>📊 توزيع الإتقان الكلي</h3>
      <div class="chart-sub">كل طالب بنسبته</div>
      <div class="chart-h chart-h-220"><canvas id="anChart1"></canvas></div>
    </div>
    <div class="chart-box">
      <h3>📉 أصعب المهارات — ${firstSec?firstSec.name:''}</h3>
      <div class="chart-sub">المهارات الأقل إتقاناً في الفصل</div>
      <div class="chart-h chart-h-220"><canvas id="anChart2"></canvas></div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:2fr 1fr;gap:18px;margin-bottom:18px;">
    <div class="card">
      <div class="card-header"><h3>🏆 ترتيب الطلاب</h3></div>
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>الترتيب</th><th>الطالب</th><th>القراءة</th><th>الكتابة</th><th>الكلي</th></tr></thead>
        <tbody>
        ${sortedStudents.map((s,i)=>`<tr>
          <td><span class="rank-circ ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span></td>
          <td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar av-32" style="${avatarStyle(s.id)};color:white;">${s.name.charAt(0)}</div><span style="font-weight:700;">${s.name}</span></div></td>
          <td><span class="badge badge-${masteryColor(s.rPct)}">${s.rPct}%</span></td>
          <td><span class="badge badge-${masteryColor(s.wPct)}">${s.wPct}%</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:7px;">
              <div class="prog-wrap" style="width:60px;"><div class="prog-bar ${masteryColor(s.total)}" style="width:${s.total}%"></div></div>
              <span class="badge badge-${masteryColor(s.total)}">${s.total}%</span>
            </div>
          </td>
        </tr>`).join('')}
        </tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>�� أعلى المهارات إتقاناً</h3></div>
      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:9px;">
        ${skillMastery.slice(0,6).map(sk=>`
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.80rem;color:var(--muted);margin-bottom:3px;font-weight:700;">
              <span>${sk.skill.length>16?sk.skill.substring(0,15)+'…':sk.skill}</span><span>${sk.pct}%</span>
            </div>
            <div class="prog-wrap"><div class="prog-bar ${masteryColor(sk.pct)}" style="width:${sk.pct}%"></div></div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  `;
}

function initAnalyticsCharts(){
  setTimeout(()=>{
    const sorted=[...S.students].map(s=>({name:s.name.split(' ')[0],total:studentMastery(s.id).total})).sort((a,b)=>b.total-a.total);
    const c1=document.getElementById('anChart1');
    if(c1) new Chart(c1,{type:'bar',data:{labels:sorted.map(s=>s.name),datasets:[{label:'المستوى الكلي',data:sorted.map(s=>s.total),backgroundColor:sorted.map(s=>s.total>=70?'rgba(16,185,129,0.75)':s.total>=40?'rgba(245,158,11,0.75)':'rgba(239,68,68,0.75)'),borderRadius:7,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{stepSize:25,font:{family:'Tajawal'},callback:v=>v+'%'}},x:{ticks:{font:{family:'Tajawal',size:9}}}}}});

    const firstSub=S.subjects[0]; const firstSec=firstSub?.sections[0];
    if(firstSec){
      const hardest=firstSec.skills.map((sk,i)=>{
        const c=S.students.filter(s=>((S.evals[s.id]?.[firstSub.id]||{})[firstSec.id]||{})[i]==='m').length;
        return{i,c,pct:S.students.length?Math.round((c/S.students.length)*100):0,lbl:sk.length>12?sk.substring(0,11)+'…':sk};
      }).sort((a,b)=>a.pct-b.pct).slice(0,6);
      const c2=document.getElementById('anChart2');
      if(c2) new Chart(c2,{type:'bar',data:{labels:hardest.map(h=>h.lbl),datasets:[{label:'نسبة الإتقان',data:hardest.map(h=>h.pct),backgroundColor:'rgba(239,68,68,0.65)',borderRadius:6,borderSkipped:false}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{stepSize:25,font:{family:'Tajawal'},callback:v=>v+'%'}},y:{ticks:{font:{family:'Tajawal',size:10}}}}}});
    }
  },80);
}

// ══════════════════════════════════════════════
// CURRICULUM MANAGER — Add/Edit/Delete Subjects & Skills
// ══════════════════════════════════════════════
function renderCurriculum(){
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">إدارة المواد والمهارات</span></div>
  <div class="ph">
    <div><div class="ph-title">📚 إدارة المواد الدراسية والمهارات</div>
    <div class="ph-sub">أضف مواد جديدة، وعدّل خانات التقييم ومهاراتها بحرية كامل��</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="addSubject()">➕ إضافة مادة جديدة</button>
      <button class="btn btn-ghost" onclick="resetCurriculum()">↺ استعادة الافتراضي</button>
    </div>
  </div>

  <div class="note-card" style="margin-bottom:20px;">
    <span class="note-icon">💡</span>
    <div>يمكنك إضافة أي عدد من المواد والخانات والمهارات. ستظهر المواد تلقائياً في القائمة الجانبية وفي صفحات التقييم والتقارير.</div>
  </div>

  <div id="curriculumList">
    ${renderCurriculumSubjects()}
  </div>
  `;
}

function renderCurriculumSubjects(){
  if(!S.subjects.length) return `<div class="empty"><div class="empty-emoji">📚</div><h3>لا توجد مواد</h3><p>اضغط "إضافة مادة جديدة" للبدء</p></div>`;
  return S.subjects.map((sub,si)=>`
    <div class="card" style="margin-bottom:16px;" id="subCard_${sub.id}">
      <div class="card-header" style="background:linear-gradient(135deg,var(--ink2),var(--sky));color:white;border-radius:20px 20px 0 0;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:26px;">${sub.icon||'📚'}</span>
          <div>
            <div style="font-size:1.1rem;font-weight:900;">${sub.name}</div>
            <div style="font-size:0.78rem;opacity:0.75;">${sub.sections.length} خانات تقييم · ${sub.sections.reduce((a,s)=>a+s.skills.length,0)} مهارة</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-xs" style="background:rgba(255,255,255,0.15);color:white;" onclick="editSubject('${sub.id}')">✏️ تعديل</button>
          <button class="btn btn-xs" style="background:rgba(255,255,255,0.15);color:white;" onclick="addSection('${sub.id}')">➕ خانة</button>
          <button class="btn btn-xs" style="background:rgba(239,68,68,0.25);color:#fca5a5;" onclick="deleteSubject('${sub.id}')">🗑️</button>
        </div>
      </div>
      <div class="card-body" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
        ${sub.sections.map((sec,secIdx)=>renderSectionCard(sub.id,sec,secIdx)).join('')}
      </div>
    </div>
  `).join('');
}

function renderSectionCard(subId, sec, secIdx){
  return `
  <div style="background:var(--surface);border-radius:14px;border:1.5px solid var(--border);overflow:hidden;" id="secCard_${sec.id}">
    <div style="padding:12px 14px;background:white;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">${sec.icon||'📌'}</span>
        <div>
          <div style="font-weight:800;font-size:0.92rem;color:var(--ink2);">${sec.name}</div>
          <div style="font-size:0.74rem;color:var(--muted);">${sec.skills.length} مهارة</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn btn-xs btn-ghost" onclick="editSection('${subId}','${sec.id}')">✏️</button>
        <button class="btn btn-xs btn-red" onclick="deleteSection('${subId}','${sec.id}')">🗑️</button>
      </div>
    </div>
    <div style="padding:10px 12px;" id="skillsList_${sec.id}">
      ${sec.skills.map((sk,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:9px;margin-bottom:4px;background:white;border:1px solid var(--border);transition:all 0.12s;" id="skillRow_${sec.id}_${i}">
          <span style="width:20px;height:20px;background:var(--surface);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.70rem;font-weight:900;color:var(--muted);flex-shrink:0;">${i+1}</span>
          <span style="flex:1;font-size:0.86rem;font-weight:600;color:var(--ink);">${sk}</span>
          <div style="display:flex;gap:4px;opacity:0.7;">
            <button class="btn btn-xs btn-ghost" style="padding:3px 7px;" onclick="editSkill('${subId}','${sec.id}',${i})" title="تعديل">✏️</button>
            <button class="btn btn-xs btn-red" style="padding:3px 7px;" onclick="deleteSkill('${subId}','${sec.id}',${i})" title="حذف">×</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="padding:8px 12px;border-top:1px dashed var(--border);display:flex;gap:7px;">
      <input type="text" id="newSkill_${sec.id}" placeholder="اسم المهارة الجديدة..." style="flex:1;padding:8px 12px;border:1.5px solid var(--border2);border-radius:9px;font-family:'Tajawal',sans-serif;font-size:0.85rem;outline:none;text-align:right;" onkeydown="if(event.key==='Enter')addSkill('${subId}','${sec.id}')" />
      <button class="btn btn-green btn-sm" onclick="addSkill('${subId}','${sec.id}')">➕ إضافة</button>
    </div>
  </div>`;
}

// ── Subject CRUD ──
function addSubject(){
  const name=prompt('اسم المادة الجديدة:','');
  if(!name||!name.trim()) return;
  const icon=prompt('رمز المادة (emoji):','📚')||'📚';
  const sub={
    id:'sub_'+Date.now(),name:name.trim(),icon,color:'#1565c0',
    sections:[{id:'sec_'+Date.now(),name:'القسم الأول',icon:'📌',skills:[]}]
  };
  S.subjects.push(sub);
  save(); rebuildSubjectNav();
  showPage('curriculum');
  toast('تمت إضافة المادة ✅','success');
}

function editSubject(subId){
  const sub=S.subjects.find(x=>x.id===subId);
  if(!sub) return;
  const name=prompt('اسم المادة:',sub.name);
  if(!name) return;
  const icon=prompt('رمز المادة:',sub.icon)||sub.icon;
  sub.name=name.trim(); sub.icon=icon;
  save(); rebuildSubjectNav(); showPage('curriculum');
  toast('تم التعديل ✅','success');
}

function deleteSubject(subId){
  const sub=S.subjects.find(x=>x.id===subId);
  if(!sub||!confirm(`حذف مادة "${sub.name}"؟ ستُحذف جميع بيانات التقييم المرتبطة بها.`)) return;
  S.subjects=S.subjects.filter(x=>x.id!==subId);
  // Clean up evals
  S.students.forEach(s=>{ if(S.evals[s.id]) delete S.evals[s.id][subId]; });
  save(); rebuildSubjectNav(); showPage('curriculum');
  toast('تم حذف المادة','success');
}

// ── Section CRUD ──
function addSection(subId){
  const sub=S.subjects.find(x=>x.id===subId);
  if(!sub) return;
  const name=prompt('اسم خانة التقييم:','');
  if(!name||!name.trim()) return;
  const icon=prompt('رمز الخانة:','📌')||'📌';
  sub.sections.push({id:'sec_'+Date.now(),name:name.trim(),icon,skills:[]});
  save(); showPage('curriculum');
  toast('تمت الإضافة ✅','success');
}

function editSection(subId, secId){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec) return;
  const name=prompt('اسم الخانة:',sec.name);
  if(!name) return;
  const icon=prompt('رمز الخانة:',sec.icon)||sec.icon;
  sec.name=name.trim(); sec.icon=icon;
  save(); showPage('curriculum');
  toast('تم التعديل ✅','success');
}

function deleteSection(subId, secId){
  const sub=S.subjects.find(x=>x.id===subId);
  if(!sub) return;
  const sec=sub.sections.find(x=>x.id===secId);
  if(!sec||!confirm(`حذف خانة "${sec.name}"؟`)) return;
  sub.sections=sub.sections.filter(x=>x.id!==secId);
  save(); showPage('curriculum');
  toast('تم الحذف','success');
}

// ── Skill CRUD ──
function addSkill(subId, secId){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec) return;
  const inp=document.getElementById('newSkill_'+secId);
  const val=inp?inp.value.trim():'';
  if(!val){toast('اكتب اسم المهارة أولاً','error');return;}
  sec.skills.push(val);
  save();
  if(inp) inp.value='';
  // Re-render just this section card inline
  const card=document.getElementById('secCard_'+secId);
  if(card){
    const list=card.querySelector('#skillsList_'+secId);
    if(list){
      list.innerHTML=sec.skills.map((sk,i)=>`
        <div style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:9px;margin-bottom:4px;background:white;border:1px solid var(--border);">
          <span style="width:20px;height:20px;background:var(--surface);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.70rem;font-weight:900;color:var(--muted);flex-shrink:0;">${i+1}</span>
          <span style="flex:1;font-size:0.86rem;font-weight:600;color:var(--ink);">${sk}</span>
          <div style="display:flex;gap:4px;opacity:0.7;">
            <button class="btn btn-xs btn-ghost" style="padding:3px 7px;" onclick="editSkill('${subId}','${secId}',${i})">✏️</button>
            <button class="btn btn-xs btn-red" style="padding:3px 7px;" onclick="deleteSkill('${subId}','${secId}',${i})">×</button>
          </div>
        </div>
      `).join('');
    }
  }
  toast('تمت إضافة المهارة ✅','success');
}

function editSkill(subId, secId, idx){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec) return;
  const newName=prompt('تعديل المهارة:',sec.skills[idx]);
  if(!newName||!newName.trim()) return;
  sec.skills[idx]=newName.trim();
  save(); showPage('curriculum');
  toast('تم تعديل المهارة ✅','success');
}

function deleteSkill(subId, secId, idx){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec||!confirm(`حذف المهارة "${sec.skills[idx]}"؟`)) return;
  sec.skills.splice(idx,1);
  // Shift eval indices
  S.students.forEach(s=>{
    const secEv=((S.evals[s.id]||{})[subId]||{})[secId];
    if(!secEv) return;
    const newEv={};
    Object.keys(secEv).forEach(k=>{
      const ki=+k;
      if(ki<idx) newEv[ki]=secEv[ki];
      else if(ki>idx) newEv[ki-1]=secEv[ki];
    });
    S.evals[s.id][subId][secId]=newEv;
  });
  save(); showPage('curriculum');
  toast('تم الحذف','success');
}

function resetCurriculum(){
  if(!confirm('استعادة المواد الافتراضية؟ ستُحذف المواد المضافة يدوياً.')) return;
  S.subjects=JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
  save(); rebuildSubjectNav(); showPage('curriculum');
  toast('تم الاستعادة ✅','success');
}
