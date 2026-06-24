// NOTIFICATIONS
// ══════════════════════════════════════════════
function buildNotifs(){
  const list=document.getElementById('notifList');
  const notifs=[];
  const today=new Date().toISOString().slice(0,10);

  // 1. حضور اليوم
  const todayAtt=S.attendance[today];
  const hasAttToday = todayAtt && Object.keys(todayAtt).length>0;
  if(!hasAttToday && S.students.length>0){
    notifs.push({
      icon:'📋', text:'لم يتم تسجيل الحضور اليوم بعد',
      sub:'اضغط لتسجيل الحضور الآن', color:'var(--ember)',
      action:()=>{ showPage('attend'); toggleNotif(); }
    });
  }

  // 2. طلاب إتقانهم أقل من 40%
  const weakStudents=S.students.filter(st=>{
    const skills=S.subjects.flatMap(sub=>sub.skills||[]);
    if(!skills.length) return false;
    const vals=skills.map(sk=>(S.evals[st.id]||{})[sk.id]||0);
    const avg=vals.reduce((a,b)=>a+b,0)/(vals.length||1);
    return avg<40;
  });
  if(weakStudents.length>0){
    notifs.push({
      icon:'⚠️', text:`${weakStudents.length} ${weakStudents.length===1?'طالب':' طلاب'} إتقانهم أقل من 40%`,
      sub:weakStudents.slice(0,2).map(s=>s.name).join('، ')+(weakStudents.length>2?'...':''),
      color:'var(--gold)',
      action:()=>{ showPage('analytics'); toggleNotif(); }
    });
  }

  // 3. غياب متكرر (3+ أيام في آخر أسبوع)
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().slice(0,10);});
  const frequentAbsent=S.students.filter(st=>{
    const absCount=last7.filter(d=>S.attendance[d]&&S.attendance[d][st.id]==='absent').length;
    return absCount>=3;
  });
  if(frequentAbsent.length>0){
    notifs.push({
      icon:'🚨', text:`${frequentAbsent.length} ${frequentAbsent.length===1?'طالب':' طلاب'} غابوا 3 أيام أو أكثر هذا الأسبوع`,
      sub:frequentAbsent.slice(0,2).map(s=>s.name).join('، ')+(frequentAbsent.length>2?'...':''),
      color:'var(--ember)',
      action:()=>{ showPage('reports'); toggleNotif(); }
    });
  }

  // 4. ملاحظات غير مكتملة
  const unseenNotes=S.notes.filter(n=>!n.seen).length;
  if(unseenNotes>0){
    notifs.push({
      icon:'📝', text:`${unseenNotes} ملاحظة جديدة لم تراجعها`,
      sub:'اضغط لعرض الملاحظات',color:'var(--plum)',
      action:()=>{ showPage('notes'); toggleNotif(); }
    });
  }

  // 5. أهداف منتهية المدة
  const expiredGoals=S.goals.filter(g=>{
    if(g.done||!g.deadline) return false;
    return new Date(g.deadline)<new Date();
  });
  if(expiredGoals.length>0){
    notifs.push({
      icon:'🎯', text:`${expiredGoals.length} ${expiredGoals.length===1?'هدف انتهت':' أهداف انتهت'} مدتها`,
      sub:'اضغط لمراجعة الأهداف', color:'var(--ember)',
      action:()=>{ showPage('goals'); toggleNotif(); }
    });
  }

  // 6. لقاءات أولياء قادمة
  const soon=S.meetings?.filter(m=>{
    if(!m.date) return false;
    const diff=(new Date(m.date)-new Date())/(1000*60*60*24);
    return diff>=0&&diff<=3;
  })||[];
  if(soon.length>0){
    notifs.push({
      icon:'🤝', text:`${soon.length} ${soon.length===1?'لقاء':' لقاءات'} مع أولياء خلال 3 أيام`,
      sub:soon[0]?.title||'', color:'var(--sky)',
      action:()=>{ showPage('meetings'); toggleNotif(); }
    });
  }

  // لو مفيش تنبيهات
  if(!notifs.length){
    list.innerHTML=`<div style="padding:28px;text-align:center;color:var(--muted);">
      <div style="font-size:2rem;margin-bottom:8px;"><i class="ti ti-circle-check"></i></div>
      <div style="font-size:0.88rem;">كل شيء على ما يرام!</div>
    </div>`;
    document.getElementById('notifCount').style.display='none';
    return;
  }

  list.innerHTML=notifs.map((n,i)=>`
    <div class="np-item" onclick="(${n.action.toString()})()" style="cursor:pointer;border-right:3px solid ${n.color};padding-right:13px;">
      <div style="font-size:1.3rem;flex-shrink:0;">${n.icon}</div>
      <div style="flex:1;">
        <div class="np-text" style="font-weight:800;">${n.text}</div>
        ${n.sub?`<div class="np-time">${n.sub}</div>`:''}
      </div>
      <div style="color:var(--muted2);font-size:0.9rem;">›</div>
    </div>
  `).join('');

  const cnt=document.getElementById('notifCount');
  cnt.textContent=notifs.length;
  cnt.style.display='flex';
}
function toggleNotif(e){
  if(e) e.stopPropagation();
  document.getElementById('notifPanel').classList.toggle('open');
}
function clearNotifs(){
  document.getElementById('notifCount').style.display='none';
  document.getElementById('notifList').innerHTML=`<div style="padding:28px;text-align:center;color:var(--muted);">
    <div style="font-size:2rem;margin-bottom:8px;"><i class="ti ti-circle-check"></i></div>
    <div style="font-size:0.88rem;">كل شيء على ما يرام!</div>
  </div>`;
  document.getElementById('notifPanel').classList.remove('open');
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#notifPanel')&&!e.target.closest('#notifBtn')&&!e.target.closest('#notifBtn2'))
    document.getElementById('notifPanel').classList.remove('open');
});

// ══════════════════════════════════════════════
// MODAL UTILS
// ══════════════════════════════════════════════
function openM(id){
  const el=document.getElementById(id); if(!el) return;
  el.classList.add('open');
  if(window.innerWidth<=960) document.body.style.overflow='hidden';
}
function closeM(id){
  const el=document.getElementById(id); if(!el) return;
  el.classList.remove('open');
  document.body.style.overflow='';
}
document.querySelectorAll('.modal-bg').forEach(el=>{
  el.addEventListener('click',e=>{if(e.target===el)el.classList.remove('open');});
});

// ══════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════
function toast(msg,type=''){
  const wrap=document.getElementById('toastWrap');
  if(!wrap){ alert(msg); return; }
  const t=document.createElement('div');
  t.className='toast '+(type||'');
  t.innerHTML=`<span>${type==='success'?'✅':type==='error'?'❌':type==='info'?'ℹ️':'💬'}</span> ${msg}`;
  wrap.appendChild(t);
  setTimeout(()=>{t.style.animation='toastOut 0.3s ease forwards';setTimeout(()=>t.remove(),350);},2800);
}

// ══════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(typeof CM !== 'undefined' && CM.open) return;
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){ e.preventDefault(); openCmd(); return; }
  if(e.altKey){
    if(e.key==='1') showPage('dash');
    if(e.key==='2') showPage('students');
    if(e.key==='3') showPage('attend');
    if(e.key==='4'&&S.subjects[0]) showPage(S.subjects[0].id);
    if(e.key==='5') showPage('reports');
    if(e.key==='6') showPage('curriculum');
    if(e.key==='7') showPage('insights');
    if(e.key==='n') openNoteFor(null);
    if(e.key==='g') openGoalFor(null);
  }
  if(e.key==='Escape'){
    document.querySelectorAll('.modal-bg.open').forEach(m=>m.classList.remove('open'));
    closeCmd(); stopQE();
  }
});

// Classroom keyboard shortcuts (slides arrow navigation)
document.addEventListener('keydown',e=>{
  if(typeof CM === 'undefined' || !CM.open) return;
  if(CM.currentView !== 'slides') return;
  if(e.key==='ArrowRight' || e.key==='ArrowUp'){   e.preventDefault(); cmSlidePrev(); }
  if(e.key==='ArrowLeft'  || e.key==='ArrowDown'){  e.preventDefault(); cmSlideNext(); }
});

// ══════════════════════════════════════════════
// THEME (فاتح / ليلي / دافئ / معلمات)
// ══════════════════════════════════════════════
function applyTheme(){
  S.theme = 'light'; // ثيم واحد مقفول (الثيمات الأخرى محفوظة لكن غير ظاهرة)
  document.body.classList.toggle('dark', S.theme === 'dark');
  document.body.classList.toggle('theme-neu', S.theme === 'sepia');
  document.body.classList.toggle('theme-rose', S.theme === 'rose');
  const t = document.getElementById('darkToggle');
  if(t){
    const titles = {
      light: 'المظهر: فاتح — اضغط للتبديل',
      dark: 'المظهر: ليلي — اضغط للتبديل',
      sepia: 'المظهر: Neumorphism — اضغط للتبديل',
      rose: 'المظهر: وردي (معلمات) — اضغط للتبديل'
    };
    t.title = titles[S.theme] || titles.light;
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta){
    if(S.theme === 'dark') meta.setAttribute('content', '#0f172a');
    else if(S.theme === 'sepia') meta.setAttribute('content', '#e0e5ec');
    else if(S.theme === 'rose') meta.setAttribute('content', '#831843');
    else meta.setAttribute('content', '#1e3a5f');
  }
}
function cycleTheme(){
  const order = ['light', 'dark', 'sepia', 'rose'];
  const i = order.indexOf(S.theme);
  S.theme = order[(i + 1) % order.length];
  applyTheme();
  save();
}

// ══════════════════════════════════════════════
// COMMAND PALETTE
// ══════════════════════════════════════════════
const CMD_ITEMS=[
  {icon:'🏠',title:'لوحة التحكم',sub:'الصفحة الرئيسية',action:()=>showPage('dash'),shortcut:'Alt+1'},
  {icon:'👥',title:'الطلاب',sub:'إدارة الطلاب وإضافتهم',action:()=>showPage('students'),shortcut:'Alt+2'},
  {icon:'📋',title:'الحضور',sub:'تسجيل الحضور اليومي',action:()=>showPage('attend'),shortcut:'Alt+3'},
  {icon:'📊',title:'التقارير',sub:'توليد ومشاركة التقارير',action:()=>showPage('reports'),shortcut:'Alt+5'},
  {icon:'📒',title:'دفتر الدرجات',sub:'إدخال وتتبع الدرجات',action:()=>showPage('gradebook')},
  {icon:'🪑',title:'خريطة المقاعد',sub:'ترتيب جلوس الطلاب',action:()=>showPage('seatmap')},
  {icon:'⭐',title:'تقييم السلوك',sub:'نجوم السلوك والمشاركة',action:()=>showPage('behavior')},
  {icon:'🎯',title:'الأهداف والخطط',sub:'أهداف تعليمية فردية IEP',action:()=>showPage('goals')},
  {icon:'📅',title:'المخطط الأسبوعي',sub:'تخطيط الحصص والأنشطة',action:()=>showPage('planner')},
  {icon:'🤝',title:'لقاءات الأولياء',sub:'تسجيل محادثات أولياء الأمور',action:()=>showPage('meetings')},
  {icon:'🤖',title:'الرؤى الذكية',sub:'تحليل وتوصيات تلقائية',action:()=>showPage('insights')},
  {icon:'📈',title:'التحليلات',sub:'إحصائيات وبيانات متقدمة',action:()=>showPage('analytics')},
  {icon:'📚',title:'إدارة المواد',sub:'إضافة وتعديل المواد والمهارات',action:()=>showPage('curriculum')},
  {icon:'⚙️',title:'الملف الشخصي',sub:'إعدادات المعلم',action:()=>showPage('profile')},
  {icon:'➕',title:'إضافة طالب جديد',sub:'',action:()=>{showPage('students');openAddModal();}},
  {icon:'📝',title:'إضافة ملاحظة',sub:'',action:()=>openNoteFor(null)},
  {icon:'🎯',title:'إضافة هدف',sub:'',action:()=>openGoalFor(null)},
  {icon:'🎨',title:'تبديل المظهر',sub:'فاتح ← ليلي ← دافئ ← معلمات',action:cycleTheme},
];

let cmdFocusIdx=0;
function openCmd(){
  document.getElementById('cmdPalette').classList.add('open');
  document.getElementById('cmdOverlay').classList.add('open');
  const inp=document.getElementById('cmdInput');
  inp.value=''; inp.focus();
  renderCmdItems('');
}
function closeCmd(){
  document.getElementById('cmdPalette').classList.remove('open');
  document.getElementById('cmdOverlay').classList.remove('open');
}
function filterCmd(q){
  renderCmdItems(q.trim().toLowerCase());
}
function renderCmdItems(q){
  const el=document.getElementById('cmdResults');
  let items=CMD_ITEMS;
  if(q){
    items=CMD_ITEMS.filter(i=>i.title.includes(q)||i.sub.includes(q));
    // Also search students
    const stuMatches=S.students.filter(s=>s.name.includes(q)).slice(0,4);
    stuMatches.forEach(s=>{
      items.push({icon:'👤',title:s.name,sub:`رقم جلوس ${s.num||'—'} · ${s.parent||''}`,action:()=>openEvalDyn(s.id,S.subjects[0]?.id)});
    });
  }
  cmdFocusIdx=0;
  el.innerHTML=`
    ${!q?'<div class="cmd-section">الأوامر والصفحات</div>':''}
    ${items.slice(0,10).map((it,i)=>`
      <div class="cmd-item ${i===0?'focused':''}" onclick="runCmd(${CMD_ITEMS.indexOf(it)>=0?CMD_ITEMS.indexOf(it):-(i+1)},'${it.title.replace(/'/g,'')}',${i})" data-idx="${i}">
        <span class="cmd-item-icon">${it.icon}</span>
        <div class="cmd-item-text">
          <div class="cmd-item-title">${it.title}</div>
          ${it.sub?`<div class="cmd-item-sub">${it.sub}</div>`:''}
        </div>
        ${it.shortcut?`<span class="cmd-shortcut">${it.shortcut}</span>`:''}
      </div>
    `).join('')}
  `;
  // Store dynamic items for runtime use
  window._cmdDynItems=items;
}
function runCmd(idx,title,listIdx){
  const items=window._cmdDynItems||CMD_ITEMS;
  const it=items[listIdx];
  if(it){it.action(); closeCmd();}
}
function cmdKey(e){
  const items=document.querySelectorAll('.cmd-item');
  if(e.key==='ArrowDown'){
    cmdFocusIdx=Math.min(cmdFocusIdx+1,items.length-1);
    items.forEach((el,i)=>el.classList.toggle('focused',i===cmdFocusIdx));
    e.preventDefault();
  } else if(e.key==='ArrowUp'){
    cmdFocusIdx=Math.max(cmdFocusIdx-1,0);
    items.forEach((el,i)=>el.classList.toggle('focused',i===cmdFocusIdx));
    e.preventDefault();
  } else if(e.key==='Enter'){
    const focused=items[cmdFocusIdx];
    if(focused) focused.click();
  } else if(e.key==='Escape'){
    closeCmd();
  }
}
document.addEventListener('keydown',e=>{
  if(typeof CM !== 'undefined' && CM.open) return;
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){ e.preventDefault(); openCmd(); }
});

// ══════════════════════════════════════════════
// QUICK EVAL (barrage mode)
// ══════════════════════════════════════════════
let qeItems=[], qePos=0;
function startQuickEval(subId, secId){
  const sub=S.subjects.find(x=>x.id===subId);
  const sec=sub?.sections.find(x=>x.id===secId);
  if(!sec||!S.students.length){toast('لا يوجد طلاب أو مهارات','error');return;}
  // Build queue: all students × all skills in this section
  qeItems=[];
  S.students.forEach(s=>{
    sec.skills.forEach((sk,i)=>{
      const cur=((S.evals[s.id]||{})[subId]||{})[secId]||{};
      if(cur[i]===undefined) qeItems.push({sid:s.id,sname:s.name,subId,secId,skillIdx:i,skill:sk});
    });
  });
  if(!qeItems.length){toast('جميع الطلاب تم تقييمهم في هذه الخانة ✅','success');return;}
  qePos=0;
  S.qeSubId=subId; S.qeSecId=secId;
  document.getElementById('qeBar').classList.remove('hidden');
  renderQE();
  toast(`🚀 وضع التقييم السريع — ${qeItems.length} تقييم متبقٍ`,'info');
}
function renderQE(){
  if(qePos>=qeItems.length){stopQE();confetti();toast('🎉 انتهى التقييم السريع!','success');return;}
  const item=qeItems[qePos];
  document.getElementById('qeName').textContent=`${item.sname}  (${qePos+1}/${qeItems.length})`;
  document.getElementById('qeSkill').textContent=`${item.skill}`;
  const pct=Math.round((qePos/qeItems.length)*100);
  document.getElementById('qeProgress').style.width=pct+'%';
}
function qeAnswer(val){
  if(qePos>=qeItems.length) return;
  const item=qeItems[qePos];
  if(val!=='skip') setEvDyn(item.subId,item.secId,item.skillIdx,val==='m'?'m':'n');
  qePos++;
  renderQE();
}
function stopQE(){
  document.getElementById('qeBar').classList.add('hidden');
  qeItems=[]; qePos=0;
}
