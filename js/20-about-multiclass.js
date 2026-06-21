// ══════════════════════════════════════════════
// 💙 ABOUT PAGE — حول التطبيق
// ══════════════════════════════════════════════
function renderAbout(){
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">💙 حول التطبيق</span></div>

  <!-- شعار المدرسة -->
  <div style="text-align:center;padding:32px 20px 20px;">
    <img src="${SCHOOL_LOGO}" style="width:110px;height:110px;object-fit:contain;border-radius:20px;box-shadow:0 8px 32px rgba(21,101,192,0.18);background:white;padding:8px;" />
    <div style="margin-top:14px;font-size:1.5rem;font-weight:900;color:var(--ink2);">مدارس البشرى الأهلية</div>
    <div style="font-size:0.88rem;color:var(--muted);margin-top:4px;">مؤسسة الخطابي التعليمية — الزاهر</div>
    <div style="font-size:0.80rem;color:var(--muted2);margin-top:2px;">ابتدائي · متوسط · ثانوي</div>
  </div>

  <!-- بطاقة التطبيق -->
  <div class="card" style="max-width:560px;margin:0 auto 18px;">
    <div class="card-header" style="text-align:center;padding:20px;">
      <div style="font-size:2.4rem;margin-bottom:8px;">🎓</div>
      <div style="font-size:1.2rem;font-weight:900;color:var(--ink2);">منصة المعلم الذكية</div>
      <div style="font-size:0.82rem;color:var(--muted);margin-top:4px;">نظام متابعة الطلاب وإدارة الفصل</div>
    </div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div style="background:var(--surface);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border);">
          <div style="font-size:1.5rem;font-weight:900;color:var(--sky)">34</div>
          <div style="font-size:0.76rem;color:var(--muted);font-weight:700">إصداراً طوّرناها معاً</div>
        </div>
        <div style="background:var(--surface);border-radius:10px;padding:12px;text-align:center;border:1px solid var(--border);">
          <div style="font-size:1.5rem;font-weight:900;color:var(--mint)">27</div>
          <div style="font-size:0.76rem;color:var(--muted);font-weight:700">مراحل تطوير</div>
        </div>
      </div>
      <div style="font-size:0.86rem;color:var(--muted);text-align:center;line-height:1.7;padding:0 8px;">
        تطبيق تعليمي متكامل صُمِّم خصيصاً لمعلمات ومعلمي المرحلة الابتدائية في مدارس البشرى الأهلية،
        يجمع بين إدارة الحضور والتقييم والتقارير وأدوات الفصل التفاعلية في مكان واحد.
      </div>
    </div>
  </div>

  <!-- بطاقة الفريق -->
  <div class="card" style="max-width:560px;margin:0 auto 18px;border:2px solid rgba(21,101,192,0.35);background:linear-gradient(135deg,rgba(21,101,192,0.06),rgba(124,58,237,0.05));">
    <div class="card-body" style="padding:28px 24px;">

      <!-- المطوّر -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:0.72rem;font-weight:900;color:var(--sky);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;background:rgba(66,165,245,0.12);border:1.5px solid rgba(66,165,245,0.30);border-radius:99px;padding:5px 16px;display:inline-block;">
          ⚙️ القائم على تطوير النظام
        </div>
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--plum));display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:white;margin:0 auto 14px;box-shadow:0 8px 28px rgba(21,101,192,0.40);border:3px solid rgba(255,255,255,0.15);">ز</div>
        <div style="font-size:1.25rem;font-weight:900;color:var(--ink2);margin-bottom:4px;">زياد السيد عبد الملك</div>
        <div style="font-size:0.82rem;color:var(--sky);font-weight:700;margin-bottom:16px;">مطوّر ومصمم المنصة</div>
        <!-- روابط التواصل -->
        <div style="display:flex;justify-content:center;gap:12px;">
          <a href="https://www.facebook.com/people/Ziad-El-Sayed/pfbid0dca5LjH756GVwAhqbuGF9K1EqgrULvVTHSPyeXoARitor1PWus1qh3w5DDUodmMGl/?mibextid=wwXIfr" target="_blank"
            style="display:inline-flex;align-items:center;gap:8px;background:#1877F2;color:white;border-radius:12px;padding:10px 18px;text-decoration:none;font-weight:800;font-size:0.85rem;box-shadow:0 4px 14px rgba(24,119,242,0.35);transition:transform 0.15s;"
            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            فيسبوك
          </a>
          <a href="https://www.instagram.com/ziad_40_4?igsh=MWNjbDltbGJmejhvcw%3D%3D&utm_source=qr" target="_blank"
            style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);color:white;border-radius:12px;padding:10px 18px;text-decoration:none;font-weight:800;font-size:0.85rem;box-shadow:0 4px 14px rgba(220,39,67,0.35);transition:transform 0.15s;"
            onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            إنستغرام
          </a>
        </div>
      </div>

      <div style="height:1px;background:var(--border);margin:0 0 20px;"></div>

      <!-- المشرف -->
      <div style="text-align:center;">
        <div style="font-size:0.72rem;font-weight:900;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;background:rgba(245,158,11,0.10);border:1px solid rgba(245,158,11,0.20);border-radius:99px;padding:4px 14px;display:inline-block;">
          🎓 تحت إشراف
        </div>
        <div style="width:66px;height:66px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--ember));display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:white;margin:0 auto 10px;box-shadow:0 6px 20px rgba(245,158,11,0.25);">س</div>
        <div style="font-size:1.10rem;font-weight:900;color:var(--ink2);margin-bottom:8px;">الأستاذ / سيد عبد الملك أحمد</div>
        <a href="https://www.facebook.com/share/1BXEqJiCTK/?mibextid=wwXIfr" target="_blank"
          style="display:inline-flex;align-items:center;gap:8px;background:#1877F2;color:white;border-radius:12px;padding:9px 18px;text-decoration:none;font-weight:800;font-size:0.85rem;box-shadow:0 4px 14px rgba(24,119,242,0.30);transition:transform 0.15s;"
          onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          فيسبوك
        </a>
      </div>

    </div>
  </div>

  <!-- بطاقة التواصل -->
  <div class="card" style="max-width:560px;margin:0 auto 18px;">
    <div class="card-body" style="text-align:center;padding:24px 20px;">
      <div style="font-size:1rem;font-weight:800;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">للتواصل والدعم الفني</div>
      <a href="https://wa.me/201007579619" target="_blank"
        style="display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border-radius:14px;padding:14px 28px;text-decoration:none;font-weight:800;font-size:1rem;box-shadow:0 6px 20px rgba(37,211,102,0.30);transition:transform 0.15s;"
        onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        واتساب: +20 100 757 9619
      </a>
      <div style="font-size:0.76rem;color:var(--muted2);margin-top:12px;">متاح للدعم الفني وحل المشكلات التقنية</div>
    </div>
  </div>

  <!-- فيتشرز التطبيق -->
  <div class="card" style="max-width:560px;margin:0 auto 40px;">
    <div class="card-header"><h3>✨ ميزات التطبيق</h3></div>
    <div class="card-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        ${[
          ['📋','إدارة الحضور اليومي'],
          ['⭐','نظام تقييم المهارات'],
          ['📊','تقارير PDF احترافية'],
          ['🖥️','وضع الحصة للبروجكتور'],
          ['🎡','عجلة المشاركة العشوائية'],
          ['🎮','ألعاب تعليمية تفاعلية'],
          ['🗺️','خريطة الكنز والشهادات'],
          ['📈','مؤشر التقدم الحقيقي'],
          ['🪑','خريطة المقاعد'],
          ['🤝','لقاءات أولياء الأمور'],
          ['🎯','الأهداف التعليمية IEP'],
          ['💡','رؤى ذكية تلقائية'],
        ].map(([icon,label])=>`
          <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border-radius:9px;border:1px solid var(--border);">
            <span style="font-size:1.1rem;">${icon}</span>
            <span style="font-size:0.82rem;font-weight:700;color:var(--ink2);">${label}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// 🏫 MULTI-CLASS SYSTEM — نظام الفصول المتعددة
// ══════════════════════════════════════════════════════════════

function openClassSwitcher(){
  renderClassList();
  document.getElementById('classModal').classList.add('open');
  document.getElementById('addClassForm').style.display='none';
}
function closeClassSwitcher(){
  document.getElementById('classModal').classList.remove('open');
}

function renderClassList(){
  const el = document.getElementById('classListItems');
  if(!el) return;

  let classes = getAllClasses();
  if(!classes.length){
    const def = {
      id:'class_default',
      name: S.teacher.n1 ? `فصل ${S.teacher.n1}` : 'الفصل الأول',
      note: 'الصف الأول الابتدائي',
      createdAt: Date.now()
    };
    classes = [def];
    saveClassMeta(def);
  }

  const icons = ['🏫','📚','✏️','🎓','📖','🌟'];

  el.innerHTML = classes.map((c,ci)=>{
    const isActive = c.id === ACTIVE_CLASS_ID;
    let stuCount=0, attToday=0;
    try{
      const raw = localStorage.getItem(getClassStorageKey(c.id));
      if(raw){
        const d=JSON.parse(raw);
        stuCount=(d.students||[]).length;
        const td=new Date().toISOString().slice(0,10);
        attToday=Object.values((d.attendance||{})[td]||{}).filter(v=>v==='p').length;
      }
    }catch(e){}
    return `<div class="class-item ${isActive?'active':''}" onclick="switchToClass('${c.id}')">
      <div class="class-item-icon" style="background:${isActive?'linear-gradient(135deg,var(--sky),var(--plum))':'linear-gradient(135deg,var(--muted2),#94a3b8)'}">
        ${icons[ci%icons.length]}
      </div>
      <div style="flex:1;min-width:0;">
        <div class="class-item-name">${c.name}</div>
        <div class="class-item-meta">
          ${c.note?c.note+' · ':''}${stuCount} طالب
          ${stuCount>0 && attToday>0?` · ✅ ${attToday} حاضر اليوم`:''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:5px;">
        ${isActive?'<div class="class-item-badge">الحالي ✓</div>':''}
        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation();renameClass('${c.id}')" title="تعديل الاسم">✏️</button>
        ${c.id!=='class_default'?`<button class="btn btn-red btn-xs" onclick="event.stopPropagation();deleteClass('${c.id}')" title="��ذف">🗑️</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function renameClass(cid){
  const classes = getAllClasses();
  const c = classes.find(x=>x.id===cid);
  if(!c) return;
  const newName = prompt('اسم الفصل الجديد:', c.name);
  if(!newName?.trim()) return;
  c.name = newName.trim();
  saveClassMeta(c);
  // Update topbar if active
  if(cid === ACTIVE_CLASS_ID){
    const nameEl = document.getElementById('tbClassName');
    if(nameEl) nameEl.textContent = c.name;
  }
  renderClassList();
  toast('✅ تم تعديل الاسم','success');
}

function switchToClass(cid){
  if(cid === ACTIVE_CLASS_ID){ closeClassSwitcher(); return; }
  save(); // حفظ الفصل الحالي أولاً

  ACTIVE_CLASS_ID = cid;
  localStorage.setItem('bs_active_class', cid);

  // reset state to defaults
  S.students=[]; S.attendance={}; S.evals={}; S.notes=[];
  S.subjects=JSON.parse(JSON.stringify(DEFAULT_SUBJECTS));
  S.behavior={}; S.goals=[]; S.grades={}; S.planner={};
  S.meetings=[]; S.seatLayout=null; S.changelog=[];
  S.gamesBank=null; S._snapshots={};

  load();
  bagLoadAllActivities();
  bagLoadAllBooks().catch(function(){});
  ensureWeeklySnapshot();

  // تحديث اسم الفصل في الـ topbar
  const classes = getAllClasses();
  const cur = classes.find(c=>c.id===cid);
  const nameEl = document.getElementById('tbClassName');
  if(nameEl && cur) nameEl.textContent = cur.name;

  // تحديث العداد والـ nav
  document.getElementById('nb-students').textContent = S.students.length;
  const nbg = document.getElementById('nb-goals');
  if(nbg) nbg.textContent = S.goals.filter(g=>!g.done).length;
  rebuildSubjectNav();
  buildNotifs();

  // إعادة CM.games عشان يأخذ بيانات الفصل الجديد
  if(typeof CM !== 'undefined') CM.games = null;

  closeClassSwitcher();
  showPage('dash');
  toast(`🏫 الفصل الحالي: ${cur?.name||cid}`,'success');
}

function openAddClassForm(){
  document.getElementById('addClassForm').style.display='block';
  document.getElementById('newClassName').focus();
}

function addNewClass(){
  const name = document.getElementById('newClassName')?.value.trim();
  const note = document.getElementById('newClassNote')?.value.trim();
  if(!name){ toast('أدخل اسم الفصل','error'); return; }
  const id = 'class_' + genId();
  const meta = { id, name, note: note||'', createdAt: Date.now() };
  saveClassMeta(meta);
  // Save empty state for new class
  localStorage.setItem(getClassStorageKey(id), JSON.stringify({
    teacher: S.teacher, // share teacher info
    students:[], attendance:{}, evals:{}, notes:[],
    subjects: JSON.parse(JSON.stringify(DEFAULT_SUBJECTS)),
    behavior:{}, goals:[], grades:{}, planner:{}, meetings:[],
    changelog:[], theme:S.theme, darkMode: S.theme === 'dark'
  }));
  document.getElementById('newClassName').value='';
  document.getElementById('newClassNote').value='';
  document.getElementById('addClassForm').style.display='none';
  renderClassList();
  toast(`✅ تم إنشاء "${name}" — اضغ�� عليه للانتقال`,'success');
}

function deleteClass(cid){
  if(cid==='class_default'){ toast('لا يمكن حذف الفصل الافتراضي','error'); return; }
  const classes = getAllClasses();
  const c = classes.find(x=>x.id===cid);
  if(!confirm(`حذف فصل "${c?.name}"؟ سيتم حذف كل بياناته بشكل نهائي.`)) return;
  const updated = classes.filter(x=>x.id!==cid);
  localStorage.setItem('bs_classes', JSON.stringify(updated));
  localStorage.removeItem(getClassStorageKey(cid));
  renderClassList();
  toast('✅ تم حذف الفصل','success');
}

// Init class meta on enterApp
function initClassMeta(){
  let classes = getAllClasses();
  if(!classes.length){
    const def = {
      id:'class_default',
      name: S.teacher.n1 ? `فصل ${S.teacher.n1}` : 'الفصل الأول',
      note: 'الصف الأول الابتدائي',
      createdAt: Date.now()
    };
    saveClassMeta(def);
  }
  // Update topbar
  const cur = getAllClasses().find(c=>c.id===ACTIVE_CLASS_ID) || getAllClasses()[0];
  const nameEl = document.getElementById('tbClassName');
  if(nameEl && cur) nameEl.textContent = cur.name;
}
