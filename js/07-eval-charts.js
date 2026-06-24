// ══════════════════════════════════════════════
// SUBJECT PAGE (Dynamic — works for any subject)
// ══════════════════════════════════════════════
let subjectSearch='';
function renderSubjectPage(subId){
  const sub=S.subjects.find(x=>x.id===subId);
  if(!sub) return `<div class="empty"><div class="empty-emoji">📚</div><h3>المادة غير موجودة</h3></div>`;
  const list=S.students.filter(s=>s.name.includes(subjectSearch)||subjectSearch==='');
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">${sub.icon} ${sub.name}</span></div>
  <div class="ph">
    <div>
      <div class="ph-title">${sub.icon} مادة ${sub.name}</div>
      <div class="ph-sub">${sub.sections.map(sec=>`${sec.icon||'📌'} ${sec.name} (${sec.skills.length} مهارة)`).join(' · ')}</div>
    </div>
    <div class="ph-actions">
      <div class="search-box"><span class="search-icon">🔍</span><input placeholder="بحث..." value="${subjectSearch}" oninput="subjectSearch=this.value;showPage('${subId}')" /></div>
      <button class="btn btn-plum" onclick="startQuickEval('${sub.id}','${sub.sections[0]?.id||''}')">⚡ تقييم سريع</button>
      <button class="btn btn-ghost btn-sm" onclick="showPage('curriculum')">⚙️ تعديل المهارات</button>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-bottom:18px;">
    ${sub.sections.map(sec=>`
      <div class="note-card" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-color:#bfdbfe;color:#1e40af;">
        <span class="note-icon">${sec.icon||'📌'}</span>
        <div><strong>${sec.name} (${sec.skills.length} مهارة):</strong><br><span style="font-size:0.80rem;opacity:0.85;">${sec.skills.join(' · ')}</span></div>
      </div>
    `).join('')}
  </div>

  ${list.length===0?`<div class="empty"><div class="empty-emoji">${sub.icon}</div><h3>لا يوجد طلاب</h3></div>`:`
  <div class="card"><div class="tbl-wrap"><table class="tbl">
    <thead><tr>
      <th>#</th><th>الطالب</th>
      ${sub.sections.map(sec=>`<th>${sec.icon||'📌'} ${sec.name}<br><small style="font-weight:400;text-transform:none;">${sec.skills.length} مهارة</small></th>`).join('')}
      <th>الكلي</th><th>الإجراءات</th>
    </tr></thead>
    <tbody>
    ${list.map((s,i)=>{
      const subEv=(S.evals[s.id]||{})[subId]||{};
      const secStats=sub.sections.map(sec=>{
        const secEv=subEv[sec.id]||{};
        const m=Object.values(secEv).filter(v=>v==='m').length;
        const t=sec.skills.length;
        const pct=Math.round((m/t)*100);
        return {m,t,pct};
      });
      const totalM=secStats.reduce((a,x)=>a+x.m,0);
      const totalT=secStats.reduce((a,x)=>a+x.t,0);
      const totalPct=totalT?Math.round((totalM/totalT)*100):0;
      return `<tr>
        <td><span class="rank-circ">${i+1}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:9px;">
            <div class="avatar av-40" style="${avatarStyle(s.id)};color:white;">${s.name.charAt(0)}</div>
            <div>
              <div style="font-weight:800;color:var(--ink2);">${s.name}</div>
              <div style="font-size:0.74rem;color:var(--muted);">${totalM} مهارة مُتقنة</div>
            </div>
          </div>
        </td>
        ${secStats.map(st=>`<td>
          <div style="display:flex;justify-content:space-between;font-size:0.76rem;color:var(--muted);margin-bottom:3px;">
            <span>${st.m} أتقن</span><span>${st.t-st.m} لم يتقن بعد</span>
          </div>
          <div class="prog-wrap"><div class="prog-bar ${masteryColor(st.pct)}" style="width:${st.pct}%"></div></div>
          <span class="badge badge-${masteryColor(st.pct)}" style="margin-top:4px;">${st.pct}%</span>
        </td>`).join('')}
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="position:relative;width:52px;height:52px;flex-shrink:0;">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20" fill="none" stroke="#eef2ff" stroke-width="5"/>
                <circle cx="26" cy="26" r="20" fill="none" stroke="${{green:'#10b981',gold:'#059669',blue:'#1565c0',red:'#10b981'}[masteryColor(totalPct)]}" stroke-width="5"
                  stroke-dasharray="${2*Math.PI*20*(totalPct/100)} ${2*Math.PI*20}" stroke-linecap="round" transform="rotate(-90 26 26)"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:900;color:var(--ink2);">${totalPct}%</div>
            </div>
            <span class="badge badge-${masteryColor(totalPct)}">${masteryLabel(totalPct)}</span>
          </div>
        </td>
        <td>
          <div style="display:flex;gap:5px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="openEvalDyn('${s.id}','${subId}')">✏️ تقييم</button>
            <button class="btn btn-green btn-sm" onclick="openChart('${s.id}')">📊</button>
            <button class="btn btn-gold btn-sm" onclick="genStudentPDF('${s.id}')">📄</button>
            <button class="btn btn-plum btn-sm" onclick="waStudent('${s.id}')">💬</button>
          </div>
        </td>
      </tr>`;
    }).join('')}
    </tbody>
  </table></div></div>`}

  <div class="card" style="margin-top:16px;">
    <div class="card-header" style="display:flex;align-items:center;justify-content:space-between;">
      <h3>🎒 حقيبة المعلم — ${sub.icon} ${sub.name}</h3>
    </div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;">

        <!-- كتب وملفات PDF للمادة -->
        <div>
          <div style="font-size:0.82rem;font-weight:800;color:var(--ink2);margin-bottom:10px;">📖 كتب وملفات PDF</div>
          <p style="font-size:0.76rem;color:var(--muted);margin-bottom:8px;line-height:1.45;">يمكنك إضافة أكثر من ملف PDF (دفعة واحدة أو عدة مرات). تُحفظ على هذا الجهاز.</p>
          <label for="bagBook_${sub.id}" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;border-radius:10px;border:2px dashed var(--border2);background:var(--surface);color:var(--muted);font-size:0.82rem;cursor:pointer;transition:all 0.2s;">
            📁 إضافة PDF (واحد أو أكثر)
            <input type="file" id="bagBook_${sub.id}" accept="application/pdf,.pdf" multiple onchange="bagLoadBook('${sub.id}',this)" style="display:none;" />
          </label>
          <div id="bagBooksList_${sub.id}" style="margin-top:10px;display:flex;flex-direction:column;gap:8px;"></div>
        </div>

        <!-- أنشطة المادة -->
        <div>
          <div style="font-size:0.82rem;font-weight:800;color:var(--ink2);margin-bottom:10px;">🎨 أنشطة المادة</div>
          <div id="bagActList_${sub.id}" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;max-height:180px;overflow-y:auto;"></div>
          <div style="display:flex;gap:6px;">
            <input type="text" id="bagActInput_${sub.id}" placeholder="أضف نشاطاً للمادة..." style="flex:1;padding:8px 12px;border-radius:9px;border:1.5px solid var(--border2);background:white;color:var(--ink);font-family:'Tajawal',sans-serif;font-size:0.85rem;outline:none;" onkeydown="if(event.key==='Enter')bagAddActivity('${sub.id}')" />
            <button onclick="bagAddActivity('${sub.id}')" class="btn btn-gold btn-sm" style="padding:8px 14px;">+</button>
          </div>
        </div>

      </div>
    </div>
  </div>
  `;
}

// ══════════════════════════════════════════════
// EVAL MODAL — Dynamic
// ══════════════════════════════════════════════
let evalSubId='';
// ── EVAL SYSTEM — fully isolated per call ──────────────────────────────
// State scoped to current open modal only — no DOM leakage between subjects
let _evalSid='', _evalSubId='', _evalSecIdx=0;

function openEvalDyn(sid, subId){
  _evalSid = sid;
  _evalSubId = subId || S.subjects[0]?.id || '';
  evalSubId = _evalSubId; // keep legacy compat
  S.currentEval = sid;

  const s = S.students.find(x=>x.id===sid);
  if(!s){ toast('تعذّر فتح التقييم','error'); return; }

  document.getElementById('evalTitle').textContent = 'تقييم: ' + s.name;

  // ── Build subject selector (shown when >1 subject) ──
  const selector = document.getElementById('evalSubjectSelector');
  if(S.subjects.length > 1){
    selector.style.display = '';
    selector.innerHTML = '<div style="font-size:0.80rem;font-weight:800;color:var(--muted);margin-bottom:6px;">اختر المادة:</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      S.subjects.map(sub=>`
        <button class="btn btn-sm ${sub.id===_evalSubId?'btn-primary':'btn-ghost'}"
          onclick="_evalSwitchSubject('${sub.id}')" id="subjBtn_${sub.id}">
          ${sub.icon||'📚'} ${sub.name}
        </button>`).join('') +
      '</div>';
  } else {
    selector.style.display = 'none';
  }

  _evalLoadSubject(_evalSubId, sid);
  openM('mbEval');
}

function _evalSwitchSubject(subId){
  _evalSubId = subId;
  evalSubId = subId;
  // Update subject button states
  S.subjects.forEach(sub=>{
    const btn=document.getElementById('subjBtn_'+sub.id);
    if(btn){ btn.className='btn btn-sm '+(sub.id===subId?'btn-primary':'btn-ghost'); }
  });
  _evalLoadSubject(subId, _evalSid);
}

function _evalLoadSubject(subId, sid){
  const sub = S.subjects.find(x=>x.id===subId);
  if(!sub) return;

  document.getElementById('evalSub').textContent = (sub.icon||'📚') + ' ' + sub.name;

  // ── COMPLETELY WIPE previous section content ──
  const tabBar = document.getElementById('evalModalTabs');
  const wrap = document.getElementById('evalSectionsWrap');
  tabBar.innerHTML = '';
  wrap.innerHTML = '';

  if(sub.sections.length === 0){
    wrap.innerHTML = '<div class="empty"><div class="empty-emoji">📭</div><h3>لا توجد خانات في هذه المادة</h3><p>أضف خانات من صفحة إدارة المواد</p></div>';
    return;
  }

  // ── Build section tabs ──
  sub.sections.forEach((sec, i)=>{
    const btn = document.createElement('button');
    btn.className = 'm-tab' + (i===0?' active':'');
    btn.dataset.secid = sec.id;
    btn.dataset.subid = subId;
    btn.innerHTML = (sec.icon||'📌') + ' ' + sec.name;
    btn.onclick = ()=> _evalShowSection(sec.id);
    tabBar.appendChild(btn);
  });

  // ── Build section panels ──
  sub.sections.forEach((sec, i)=>{
    const panel = document.createElement('div');
    panel.dataset.secpanel = sec.id;
    panel.style.display = i===0 ? '' : 'none';
    panel.innerHTML = _buildSectionHTML(sec, subId, sid);
    wrap.appendChild(panel);
  });

  _evalSecIdx = 0;
}

function _evalShowSection(secId){
  const wrap = document.getElementById('evalSectionsWrap');
  const tabBar = document.getElementById('evalModalTabs');
  // Show correct panel, hide rest
  wrap.querySelectorAll('[data-secpanel]').forEach(p=>{
    p.style.display = p.dataset.secpanel===secId ? '' : 'none';
  });
  // Toggle tab active state
  tabBar.querySelectorAll('.m-tab').forEach(b=>{
    b.classList.toggle('active', b.dataset.secid===secId);
  });
}

function _buildSectionHTML(sec, subId, sid){
  const secEv = ((S.evals[sid]||{})[subId]||{})[sec.id]||{};
  const mastered = Object.values(secEv).filter(v=>v==='m').length;
  const pct = sec.skills.length ? Math.round((mastered/sec.skills.length)*100) : 0;
  const badgeCol = masteryColor(pct);

  const skillsHTML = sec.skills.map((sk, i)=>{
    const v = secEv[i];
    const isMastered = v==='m', isNot = v==='n';
    return `<div class="eval-item ${isMastered?'mastered':isNot?'not-mastered':''}" id="ei__${subId}__${sec.id}__${i}">
      <div class="eval-num">${i+1}</div>
      <div class="eval-name">${sk}</div>
      <div class="eval-btns">
        <button class="ev-btn ev-m ${isMastered?'on':''}" onclick="setEvDyn('${subId}','${sec.id}',${i},'m')">✅ أتقن</button>
        <button class="ev-btn ev-n ${isNot?'on':''}"  onclick="setEvDyn('${subId}','${sec.id}',${i},'n')">❌ لم يتقن بعد</button>
      </div>
    </div>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-weight:800;font-size:0.95rem;color:var(--ink2);">${sec.icon||'📌'} ${sec.name}</span>
        <span class="badge badge-${badgeCol}" id="secBadge__${subId}__${sec.id}">${mastered}/${sec.skills.length} أتقن (${pct}%)</span>
      </div>
      <div style="display:flex;gap:7px;">
        <button class="btn btn-green btn-xs" onclick="setAllEvalDyn('${subId}','${sec.id}','m')">✅ كل أتقن</button>
        <button class="btn btn-red btn-xs"   onclick="setAllEvalDyn('${subId}','${sec.id}','n')">❌ كل لم يتقن بعد</button>
        <button class="btn btn-ghost btn-xs" onclick="clearEvalDyn('${subId}','${sec.id}')">↺ مسح</button>
      </div>
    </div>
    <div class="eval-grid">${skillsHTML}</div>`;
}

// Re-render a section panel in place (called after bulk set/clear)
function renderEvalSection(sec, subId){
  const sid = S.currentEval;
  const wrap = document.getElementById('evalSectionsWrap');
  if(!wrap) return;
  const panel = wrap.querySelector('[data-secpanel="'+sec.id+'"]');
  if(!panel) return;
  const wasHidden = panel.style.display==='none';
  panel.innerHTML = _buildSectionHTML(sec, subId, sid);
  panel.style.display = wasHidden ? 'none' : '';
}

// legacy shim
function openEval(sid){ openEvalDyn(sid, S.subjects[0]?.id||'sub_arabic'); }

function switchETabDyn(secId, subId){ _evalShowSection(secId); }
function switchETab(type){
  const sub=S.subjects.find(x=>x.id===_evalSubId);
  if(!sub) return;
  const sec=type==='r'?sub.sections[0]:sub.sections[1];
  if(sec) _evalShowSection(sec.id);
}

function setEvDyn(subId, secId, idx, val){
  const sid=S.currentEval;
  if(!S.evals[sid]) S.evals[sid]={};
  if(!S.evals[sid][subId]) S.evals[sid][subId]={};
  if(!S.evals[sid][subId][secId]) S.evals[sid][subId][secId]={};
  S.evals[sid][subId][secId][idx]=val;
  save();

  // Update the specific skill row (new ID format: ei__subId__secId__idx)
  const item=document.getElementById('ei__'+subId+'__'+secId+'__'+idx);
  if(item){
    item.className='eval-item '+(val==='m'?'mastered':val==='n'?'not-mastered':'');
    item.querySelectorAll('.ev-btn').forEach(b=>b.classList.remove('on'));
    item.querySelector(val==='m'?'.ev-m':'.ev-n')?.classList.add('on');
  }

  // Live-update the section badge counter
  const secEv=(S.evals[sid][subId]||{})[secId]||{};
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(sec){
    const mst=Object.values(secEv).filter(v=>v==='m').length;
    const pct=sec.skills.length?Math.round((mst/sec.skills.length)*100):0;
    const badge=document.getElementById('secBadge__'+subId+'__'+secId);
    if(badge){
      badge.textContent=mst+'/'+sec.skills.length+' أتقن ('+pct+'%)';
      badge.className='badge badge-'+masteryColor(pct);
    }
  }
}

// Legacy shim for old setEv(type,idx,val) calls
function setEv(type,idx,val){
  const sub=S.subjects.find(x=>x.id===evalSubId)||S.subjects[0];
  if(!sub) return;
  const sec=type==='r'?sub.sections[0]:sub.sections[1];
  if(sec) setEvDyn(sub.id,sec.id,idx,val);
}

function setAllEvalDyn(subId, secId, val){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec) return;
  const sid=S.currentEval;
  if(!S.evals[sid]) S.evals[sid]={};
  if(!S.evals[sid][subId]) S.evals[sid][subId]={};
  if(!S.evals[sid][subId][secId]) S.evals[sid][subId][secId]={};
  sec.skills.forEach((_,i)=>S.evals[sid][subId][secId][i]=val);
  save();
  renderEvalSection(sec, subId); // re-renders panel in place
}

function clearEvalDyn(subId, secId){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec) return;
  const sid=S.currentEval;
  if(!S.evals[sid]) S.evals[sid]={};
  if(!S.evals[sid][subId]) S.evals[sid][subId]={};
  S.evals[sid][subId][secId]={};
  save();
  renderEvalSection(sec, subId); // re-renders panel in place
}

// Legacy shims
function setAllEval(type,val){
  const sub=S.subjects.find(x=>x.id===evalSubId)||S.subjects[0];
  if(!sub) return;
  const sec=type==='r'?sub.sections[0]:sub.sections[1];
  if(sec) setAllEvalDyn(sub.id,sec.id,val);
}
function clearEval(type){
  const sub=S.subjects.find(x=>x.id===evalSubId)||S.subjects[0];
  if(!sub) return;
  const sec=type==='r'?sub.sections[0]:sub.sections[1];
  if(sec) clearEvalDyn(sub.id,sec.id);
}

// ══════════════════════════════════════════════
// CHART MODAL
// ══════════════════════════════════════════════
let rchart=null, bchart=null;
function openChart(sid){
  S.currentChart=sid;
  const s=S.students.find(x=>x.id===sid);
  if(!s) return;
  document.getElementById('chartTitle').textContent='📊 '+s.name;
  const m=studentMastery(sid);
  // Build per-subject per-section KPI cards
  const miniCards = [];
  S.subjects.forEach(sub=>{
    sub.sections.forEach(sec=>{
      const secEv=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
      const mst=Object.values(secEv).filter(v=>v==='m').length;
      const pct=sec.skills.length?Math.round((mst/sec.skills.length)*100):0;
      const col=masteryColor(pct);
      miniCards.push('<div class="kpi '+col+'" style="padding:12px;"><div class="kpi-val" style="font-size:1.3rem;">'+pct+'%</div><div class="kpi-label">'+(sec.icon||'')+'  '+sub.name+' — '+sec.name+' ('+mst+'/'+sec.skills.length+')</div></div>');
    });
  });
  miniCards.push('<div class="kpi '+masteryColor(m.total)+'" style="padding:12px;grid-column:1/-1;"><div class="kpi-val" style="font-size:1.4rem;">⭐ '+m.total+'%</div><div class="kpi-label">المستوى الكلي لجميع المواد — '+masteryLabel(m.total)+'</div></div>');
  document.getElementById('chartMiniStats').style.gridTemplateColumns='repeat(auto-fill,minmax(160px,1fr))';
  document.getElementById('chartMiniStats').innerHTML=miniCards.join('');  openM('mbChart');
  setTimeout(()=>buildCharts(sid),150);
}

function buildCharts(sid){
  if(rchart){rchart.destroy();rchart=null;}
  if(bchart){bchart.destroy();bchart=null;}

  // Each subject gets its OWN radar using its OWN skills as labels
  // The first subject goes into radChart, bar chart shows per-section summary
  const firstSub = S.subjects[0];
  const palette = ['#1565c0','#10b981','#f59e0b','#7c3aed','#ef4444','#0e7490'];

  if(firstSub){
    // Radar: first subject's sections as datasets, first section's skills as labels
    const radarLabels = firstSub.sections[0]?.skills || [];
    const radarDatasets = firstSub.sections.map((sec,si)=>{
      const secEv = ((S.evals[sid]||{})[firstSub.id]||{})[sec.id]||{};
      const col = palette[si % palette.length];
      return {
        label:`${sec.icon||''} ${sec.name}`,
        // Map to radarLabels length — use 50 (neutral) for sections with different skills
        data: radarLabels.map((_,i)=>{
          const secSkillIdx = sec.skills.findIndex((sk,ki)=>ki===i);
          const v = secEv[secSkillIdx];
          return v==='m'?100:v==='n'?0:50;
        }),
        backgroundColor:col+'20', borderColor:col, borderWidth:2,
        pointBackgroundColor:col, pointRadius:4
      };
    });

    const c1=document.getElementById('radChart');
    if(c1 && radarLabels.length>0) rchart=new Chart(c1,{
      type:'radar',
      data:{ labels:radarLabels, datasets:radarDatasets },
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{font:{family:'Tajawal',size:11},padding:14}}},
        scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{family:'Tajawal',size:10}},
          pointLabels:{font:{family:'Tajawal',size:10}},
          grid:{color:'rgba(0,0,0,0.06)'},angleLines:{color:'rgba(0,0,0,0.06)'}}}}
    });
  }

  // Bar chart: one bar per section across ALL subjects, each correctly labeled
  const barLabels=[], barData=[], barColors=[];
  S.subjects.forEach(sub=>{
    sub.sections.forEach(sec=>{
      const secEv=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
      const m=Object.values(secEv).filter(v=>v==='m').length;
      const pct=sec.skills.length?Math.round((m/sec.skills.length)*100):0;
      barLabels.push(`${sub.name}\n${sec.icon||''} ${sec.name}`);
      barData.push(pct);
      barColors.push(pct>=70?'rgba(16,185,129,0.8)':pct>=40?'rgba(245,158,11,0.8)':'rgba(239,68,68,0.8)');
    });
  });
  const c2=document.getElementById('barChart');
  if(c2) bchart=new Chart(c2,{
    type:'bar',
    data:{labels:barLabels, datasets:[{
      label:'نسبة الإتقان', data:barData,
      backgroundColor:barColors, borderRadius:8, borderSkipped:false
    }]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},
        tooltip:{callbacks:{label:ctx=>`${ctx.raw}% إتقان`}}},
      scales:{
        y:{min:0,max:100,ticks:{stepSize:25,font:{family:'Tajawal'},callback:v=>v+'%'}},
        x:{ticks:{font:{family:'Tajawal',size:10},maxRotation:30}}
      }}
  });
}

function shareChartImg(){
  const c=document.getElementById('radChart');
  if(!c) return;
  try{
    const url=c.toDataURL('image/png');
    const a=document.createElement('a');
    a.href=url; a.download='chart_'+S.currentChart+'.png'; a.click();
    toast('تم تحميل الرسم البياني ✅','success');
  } catch(e){ toast('خطأ في التحميل','error'); }
}

function waStudent(sid){
  const s=S.students.find(x=>x.id===sid);
  if(!s){toast('لم يُعثر على الطالب','error');return;}
  const m=studentMastery(sid);
  // Build per-subject detail lines — grouped by subject
  let subLines='';
  S.subjects.forEach(sub=>{
    subLines+=`\n📚 *${sub.name}*\n`;
    sub.sections.forEach(sec=>{
      const secEv=((S.evals[sid]||{})[sub.id]||{})[sec.id]||{};
      const mastered=Object.values(secEv).filter(v=>v==='m').length;
      const pct=sec.skills.length?Math.round((mastered/sec.skills.length)*100):0;
      const bar=pct>=70?'🟢':pct>=40?'🟡':'🔴';
      subLines+=`  ${bar} ${sec.icon||''} ${sec.name}: ${mastered}/${sec.skills.length} (${pct}%)\n`;
    });
  });
  const msg=`📚 *تقرير متابعة طالب*\n🏫 *مدارس البشرى الأهلية*\n━━━━━━━━━━━━━━━━\n👤 الطالب: *${s.name}*\n👩‍🏫 المعلم: ${fullName()}\n📅 التاريخ: ${fmtDate(today())}\n\n📊 *التقييم الأكاديمي:*\n${subLines}\n⭐ *المستوى الكلي: ${m.total}% — ${masteryLabel(m.total)}*\n━━━━━━━━━━━━━━━━\nللاستفسار يرجى التواصل مع المدرسة 🙏`;
  const ph=s.parent?s.parent.replace(/\D/g,''):'';
  const url=`https://wa.me/${ph}?text=${encodeURIComponent(msg)}`;
  window.open(url,'_blank');
}
