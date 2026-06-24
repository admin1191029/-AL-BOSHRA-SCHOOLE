// ══════════════════════════════════════════════
// NOTES
// ══════════════════════════════════════════════
let noteTarget=null;
function renderNotes(){
  const typeLabels={general:'عام',academic:'أكاديمي',behavior:'سلوكي',parent:'تواصل ولي'};
  const prioColors={normal:'badge-gray',important:'badge-gold',urgent:'badge-red'};
  const typeColors={general:'badge-blue',academic:'badge-plum',behavior:'badge-gold',parent:'badge-green'};
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">الملاحظات</span></div>
  <div class="ph">
    <div><div class="ph-title">📝 ملاحظات المعلم</div><div class="ph-sub">${S.notes.length} ملاحظة مسجلة</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="openNoteFor(null)">+ ملاحظة جديدة</button>
    </div>
  </div>
  ${S.notes.length===0?`<div class="empty"><div class="empty-emoji">🗒️</div><h3>لا توجد ملاحظات بعد</h3><p>سجّل ملاحظاتك على الطلاب من هنا</p><button class="btn btn-primary" style="margin-top:12px;" onclick="openNoteFor(null)">➕ إضافة ملاحظة</button></div>`:`
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
    ${[...S.notes].reverse().map(n=>{
      const s=S.students.find(x=>x.id===n.sid);
      return `<div class="card" style="transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-3px)'" onmouseleave="this.style.transform=''">
        <div style="padding:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div style="display:flex;gap:7px;">
              <span class="badge ${typeColors[n.type]||'badge-blue'}">${typeLabels[n.type]||'عام'}</span>
              <span class="badge ${prioColors[n.prio]||'badge-gray'}">${n.prio==='urgent'?'⚡ عاجل':n.prio==='important'?'⭐ مهم':'عادي'}</span>
            </div>
            <button class="btn btn-red btn-xs" onclick="delNote('${n.id}')">🗑️</button>
          </div>
          ${s?`<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:8px;background:var(--surface);border-radius:9px;">
            <div class="avatar av-32" style="${avatarStyle(s.id)};color:white;">${s.name.charAt(0)}</div>
            <span style="font-weight:700;font-size:0.88rem;">${s.name}</span>
          </div>`:'<div style="font-size:0.80rem;color:var(--muted);margin-bottom:8px;">📌 ملاحظة عامة</div>'}
          <div style="font-size:0.90rem;color:var(--ink);line-height:1.6;">${n.text}</div>
          <div style="font-size:0.74rem;color:var(--muted2);margin-top:10px;">${fmtShort(n.date)}</div>
        </div>
      </div>`;
    }).join('')}
  </div>`}
  `;
}

function openNoteFor(sid){
  noteTarget=sid;
  const s=sid?S.students.find(x=>x.id===sid):null;
  document.getElementById('noteSub').textContent=s?'الطالب: '+s.name:'ملاحظة عامة';
  document.getElementById('noteText').value='';
  openM('mbNote');
}

function saveNote(){
  const text=document.getElementById('noteText').value.trim();
  if(!text){toast('الرجاء كتابة ملاحظة','error');return;}
  const note={
    id:genId(), sid:noteTarget, text,
    type:document.getElementById('noteType').value,
    prio:document.getElementById('notePrio').value,
    date:today()
  };
  S.notes.push(note);
  save();
  logChange('add','إضافة ملاحظة',text.substring(0,40));
  document.getElementById('nb-notes').textContent=S.notes.length;
  const nbRes=document.getElementById('nb-resources');if(nbRes){const rc=(S.resources||[]).length;nbRes.textContent=rc;nbRes.style.display=rc>0?'flex':'none';}
  closeM('mbNote');
  toast('تم حفظ الملاحظة 📝','success');
  if(document.getElementById('nav-notes').classList.contains('active')) showPage('notes');
}

function delNote(id){
  if(!confirm('حذف هذه الملاحظة؟')) return;
  S.notes=S.notes.filter(n=>n.id!==id);
  save();
  document.getElementById('nb-notes').textContent=S.notes.length;
  const nbRes=document.getElementById('nb-resources');if(nbRes){const rc=(S.resources||[]).length;nbRes.textContent=rc;nbRes.style.display=rc>0?'flex':'none';}
  showPage('notes');
}

// ══════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════
function renderProfile(){
  const totalMastery=S.students.length?Math.round(S.students.reduce((a,s)=>a+studentMastery(s.id).total,0)/S.students.length):0;
  const avatarHTML = S.teacher.photo
    ? `<img src="${S.teacher.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<span style="font-size:40px;font-weight:900;color:white;">${S.teacher.n1.charAt(0)||'م'}</span>`;

  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">⚙️ الإعدادات</span></div>
  <div class="ph"><div><div class="ph-title">⚙️ الملف الشخصي والإعدادات</div></div></div>

  <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start;">

    <!-- LEFT: Profile card -->
    <div>
      <!-- Photo card -->
      <div class="card" style="padding:28px;text-align:center;margin-bottom:14px;">
        <!-- Avatar with upload -->
        <div style="position:relative;width:100px;height:100px;margin:0 auto 16px;">
          <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--plum));display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 8px 24px rgba(21,101,192,0.30);border:3px solid var(--c-accent-border);">
            ${avatarHTML}
          </div>
          <!-- Upload overlay -->
          <label for="teacherPhotoInput" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);background:var(--sky);color:white;border-radius:99px;padding:3px 10px;font-size:0.70rem;font-weight:800;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.20);">
            📷 تغيير
            <input type="file" id="teacherPhotoInput" accept="image/*" style="display:none" onchange="saveTeacherPhoto(this)" />
          </label>
        </div>
        <div style="font-size:1.15rem;font-weight:900;color:var(--ink2);">${fullName()||'المعلم'}</div>
        <div style="color:var(--muted);font-size:0.82rem;margin:4px 0 14px;">مدارس البشرى الأهلية</div>
        ${S.teacher.photo?`<button class="btn btn-ghost btn-sm" onclick="removeTeacherPhoto()" style="font-size:0.76rem;opacity:0.6;">🗑️ حذف الصورة</button>`:''}
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;">
          <span class="badge badge-blue">🏫 البشرى الأهلية</span>
          <span class="badge badge-green">📚 ${S.students.length} طالب</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="card" style="padding:18px;margin-bottom:14px;">
        <div style="font-weight:800;color:var(--ink2);margin-bottom:12px;">📊 إحصائياتك</div>
        ${[
          ['👥 الطلاب', S.students.length],
          ['⭐ متوسط الإتقان', totalMastery+'%'],
          ['📅 أيام مسجّلة', Object.keys(S.attendance).length],
          ['📝 الملاحظات', S.notes.length],
          ['🎯 الأهداف النشطة', S.goals.filter(g=>!g.done).length],
          ['🏫 الفصول', getAllClasses().length],
        ].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.86rem;">
          <span style="color:var(--muted);">${l}</span>
          <span style="font-weight:800;color:var(--ink2);">${v}</span>
        </div>`).join('')}
      </div>
    </div>

    <!-- RIGHT: Settings + Help -->
    <div>
      <!-- Theme Color -->
      <div class="card" style="padding:22px;margin-bottom:14px;display:none;">
        <div style="font-weight:800;color:var(--ink2);margin-bottom:14px;">🎨 لون الثيم</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          ${THEME_COLORS.map(tc=>`
            <div class="theme-color-swatch ${(()=>{try{return localStorage.getItem('bs_accent_color')||'blue';}catch(e){return'blue';}})()===tc.id?'active':''}"
              data-color-id="${tc.id}"
              onclick="applyAccentColor('${tc.id}')"
              style="background:${tc.sky};"
              title="${tc.label}"></div>`).join('')}
          <span style="font-size:0.82rem;color:var(--muted);margin-right:4px;">اضغط لتغيير اللون الرئيسي</span>
        </div>
      </div>

      <!-- Cursor Style -->
      <div class="card" style="padding:22px;margin-bottom:14px;display:none;">
        <div style="font-weight:800;color:var(--ink2);margin-bottom:14px;">🖱️ شكل المؤشر</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
          ${[
            {id:'dot',  label:'نقطة',  preview:'●'},
            {id:'ring', label:'دائرة', preview:'○'},
          ].map(c=>`
            <button onclick="setCursorStyle('${c.id}')" id="csbtn-${c.id}"
              style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;border:2px solid var(--border2);background:var(--surface);font-family:'Tajawal',sans-serif;font-size:0.82rem;font-weight:800;color:var(--ink2);transition:all 0.18s;min-width:70px;">
              <span style="font-size:1.4rem;">${c.preview}</span>
              <span>${c.label}</span>
            </button>`).join('')}
          <!-- Custom image cursor button -->
          <button id="csbtn-custom" onclick="setCursorStyle('custom')"
            style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 18px;border-radius:12px;border:2px solid var(--border2);background:var(--surface);font-family:'Tajawal',sans-serif;font-size:0.82rem;font-weight:800;color:var(--ink2);transition:all 0.18s;min-width:70px;">
            <span style="font-size:1.4rem;">🖼️</span>
            <span>مخصص</span>
          </button>
        </div>

        <!-- Dot/Ring size + ring toggle -->
        <div id="basicCursorControls" style="display:${(()=>{try{const s=localStorage.getItem('bs_cursor_style')||'dot';return(s==='dot'||s==='ring')?'flex':'none';}catch(e){return'flex';}})()};flex-direction:column;gap:10px;background:var(--surface);border:1.5px solid var(--border2);border-radius:12px;padding:14px;margin-top:0;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);white-space:nowrap;">📐 الحجم:</span>
            <input type="range" id="basicCursorSize" min="6" max="40" value="${(()=>{try{return localStorage.getItem('bs_dot_size')||'12';}catch(e){return'12';}})()}"
              style="flex:1;" oninput="resizeBasicCursor(this.value)" />
            <span id="basicCursorSizeLabel" style="font-size:0.82rem;color:var(--muted);min-width:30px;">${(()=>{try{return localStorage.getItem('bs_dot_size')||'12';}catch(e){return'12';}})()}px</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);">الدائرة المتبعة</span>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <span style="font-size:0.82rem;color:var(--muted);" id="ringToggleLabel">${(()=>{try{return localStorage.getItem('bs_ring_hidden')==='1'?'مخفية':'ظاهرة';}catch(e){return'ظاهرة';}})()}</span>
              <div onclick="toggleCursorRing()" id="ringToggleBtn" style="width:44px;height:24px;border-radius:99px;background:${(()=>{try{return localStorage.getItem('bs_ring_hidden')==='1'?'var(--border2)':'var(--sky)';}catch(e){return'var(--sky)';}})()};position:relative;transition:background 0.2s;cursor:pointer;">
                <div style="position:absolute;top:3px;${(()=>{try{return localStorage.getItem('bs_ring_hidden')==='1'?'right:3px':'left:3px';}catch(e){return'left:3px';}})()};width:18px;height:18px;border-radius:50%;background:white;transition:all 0.2s;" id="ringToggleThumb"></div>
              </div>
            </label>
          </div>
        </div>
        <!-- Custom cursor input panel -->
        <div id="customCursorInput" style="display:${(()=>{try{return localStorage.getItem('bs_cursor_style')==='custom'?'flex':'none';}catch(e){return'none';}})()};flex-direction:column;gap:10px;background:var(--surface);border:1.5px solid var(--border2);border-radius:12px;padding:14px;">
          <!-- Upload -->
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);white-space:nowrap;">📁 رفع صورة:</span>
            <label style="flex:1;display:flex;align-items:center;gap:8px;padding:8px 12px;border:1.5px dashed var(--border2);border-radius:9px;cursor:pointer;font-size:0.82rem;color:var(--muted);font-family:'Tajawal',sans-serif;">
              <span>اختر صورة من جهازك</span>
              <input type="file" accept="image/*" style="display:none;" onchange="loadCustomCursorFile(this)" />
            </label>
          </div>
          <!-- URL -->
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);white-space:nowrap;">🔗 رابط URL:</span>
            <input id="customCursorUrl" type="text" placeholder="https://..." dir="ltr"
              style="flex:1;padding:8px 12px;border:1.5px solid var(--border2);border-radius:9px;font-size:0.82rem;font-family:'Tajawal',sans-serif;outline:none;"
              oninput="applyCustomCursorUrl(this.value)" />
          </div>
          <!-- Size slider -->
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);white-space:nowrap;">📐 الحجم:</span>
            <input type="range" id="customCursorSize" min="16" max="64" value="${(()=>{try{return localStorage.getItem('bs_cursor_size')||'32';}catch(e){return'32';}})()}"
              style="flex:1;" oninput="resizeCustomCursor(this.value)" />
            <span id="customCursorSizeLabel" style="font-size:0.82rem;color:var(--muted);min-width:30px;">${(()=>{try{return localStorage.getItem('bs_cursor_size')||'32';}catch(e){return'32';}})()}px</span>
          </div>
          <!-- Preview -->
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);">معاينة:</span>
            <div id="customCursorThumb" style="width:40px;height:40px;border:1px solid var(--border2);border-radius:8px;background:var(--surface);display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${(()=>{try{const d=localStorage.getItem('bs_cursor_data');return d?`<img src="${d}" style="max-width:100%;max-height:100%;object-fit:contain;" />`:'—';}catch(e){return'—';}})()}
            </div>
          </div>
          <!-- Ring toggle for custom -->
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:0.85rem;font-weight:700;color:var(--ink2);">الدائرة المتبعة</span>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <span style="font-size:0.82rem;color:var(--muted);" id="ringToggleLabelCustom">${(()=>{try{return localStorage.getItem('bs_ring_hidden')==='1'?'مخفية':'ظاهرة';}catch(e){return'ظاهرة';}})()}</span>
              <div onclick="toggleCursorRing()" style="width:44px;height:24px;border-radius:99px;background:${(()=>{try{return localStorage.getItem('bs_ring_hidden')==='1'?'var(--border2)':'var(--sky)';}catch(e){return'var(--sky)';}})()};position:relative;transition:background 0.2s;cursor:pointer;" id="ringToggleBtnCustom">
                <div style="position:absolute;top:3px;${(()=>{try{return localStorage.getItem('bs_ring_hidden')==='1'?'right:3px':'left:3px';}catch(e){return'left:3px';}})()};width:18px;height:18px;border-radius:50%;background:white;transition:all 0.2s;" id="ringToggleThumbCustom"></div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Edit info -->
      <div class="card" style="padding:22px;margin-bottom:14px;">
        <div style="font-weight:800;color:var(--ink2);margin-bottom:18px;">✏️ البيانات الشخصية</div>
        <div class="form-row">
          <div class="fg"><label>الاسم الأول</label><input type="text" id="pn1" value="${S.teacher.n1}" /></div>
          <div class="fg"><label>الاسم الثاني</label><input type="text" id="pn2" value="${S.teacher.n2}" /></div>
        </div>
        <div class="fg"><label>اللقب</label><input type="text" id="pn3" value="${S.teacher.n3}" /></div>
        <button class="btn btn-primary" onclick="saveProfile()">💾 حفظ التغييرات</button>
      </div>

      <!-- Data tools -->
      <div class="card" style="padding:22px;margin-bottom:14px;">
        <div style="font-weight:800;color:var(--ink2);margin-bottom:14px;">🛠️ أدوات البيانات</div>
        <div class="fg" style="margin-bottom:14px;">
          <label>مساعد الحصة — نوع الاتصال</label>
          <select id="bsAiProvider" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--border2);font-family:'Tajawal',sans-serif;font-size:0.9rem;" onchange="localStorage.setItem('bs_ai_provider', this.value==='openrouter'?'openrouter':'gemini'); bsUpdateAiHints();">
            <option value="gemini">Google Gemini (مباشر من Google AI Studio)</option>
            <option value="openrouter">OpenRouter (موصى به إذا فشل Gemini أو فتحت الملف من القرص)</option>
          </select>
        </div>
        <div class="fg" style="margin-bottom:14px;">
          <label id="bsAiKeyLabel">مفتاح API</label>
          <input type="password" id="bsAiKey" placeholder="" autocomplete="off" style="width:100%;" onchange="bsSaveAiSettings()" />
          <div id="bsAiKeyHint" style="font-size:0.76rem;color:var(--muted);margin-top:8px;line-height:1.5;"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-ghost" onclick="exportData()">📤 تصدير JSON (كل الفصول)</button>
          <button class="btn btn-ghost" onclick="importDataClick()">📥 استيراد JSON</button>
          <input type="file" id="importFile" style="display:none;" accept=".json" onchange="importData(this)" />
          <button class="btn btn-ghost" onclick="saveOfflineSnapshot();toast('تم حفظ نسخة offline ✅','success')">📦 Offline</button>
          <button class="btn btn-red" onclick="clearAllData()">🗑️ حذف الكل</button>
        </div>
        <div style="margin-top:12px;background:var(--surface);border-radius:10px;padding:12px 14px;border:1px solid var(--border);">
          <div style="display:flex;align-items:center;gap:8px;font-size:0.84rem;color:var(--muted);">
            <div id="pwaColorDot" style="width:8px;height:8px;border-radius:50%;background:var(--mint);flex-shrink:0;"></div>
            <span id="pwaOnlineText">جاري الفحص...</span>
          </div>
        </div>
      </div>

      <!-- HELP & CONCEPTS -->
      <div class="card" style="padding:22px;">
        <div style="font-weight:800;color:var(--ink2);margin-bottom:18px;">📖 دليل الاستخدام والمفاهيم</div>
        ${[
          { icon:'🌱', title:'في بداية رحلته (<40%)', desc:'الطالب بدأ يتعلم المهارة — يحتاج تكرار وتدريب إضافي. ليس حكماً على قدرته، بل وصف لمرحلته الحالية.' },
          { icon:'📈', title:'يتقدم بشكل جيد (40-70%)', desc:'الطالب يُظهر فهماً جيداً ويتحسن — استمر في التشجيع والتعزيز.' },
          { icon:'🏆', title:'أتقن المهارة (70%+)', desc:'الطالب أتقن المهارة — يمكن الانتقال لمهارة أصعب أو تعميق الفهم.' },
          { icon:'📸', title:'الحضور', desc:'✅ حاضر · ❌ غائب · 📋 بعذر. سجّل الحضور يومياً لتتبع أنماط الغياب وإرسال تقارير للأولياء.' },
          { icon:'🗺️', title:'خريطة الكنز', desc:'نظام تحفيز بصري — كل مهارة تُتقن تحرّك الطالب خطوة على الخريطة وتعطيه شارة وشهادة.' },
          { icon:'🖥️', title:'وضع الحصة', desc:'شاشة كاملة للبروجكتور — مؤقت + حضور + عجلة عشوائية + ألعاب + لوحة شرف + عرض الشرائح.' },
          { icon:'🎮', title:'الألعاب التعليم��ة', desc:'7 ألعاب مدمجة: المليون · الكرسي الساخن · سباق الإجابات · أكمل الكلمة · ما هذا؟ · فصلي ضد فصلي · كلمة وعكسها.' },
          { icon:'📊', title:'مؤشر التقدم', desc:'↗ يعني تحسّن عن البداية · → ثابت · ↘ تراجع. يُحسب بمقارنة المهارات الحالية بأول تسجيل.' },
          { icon:'🏫', title:'الفصول المتعددة', desc:'اضغط على اسم الفصل في الأعلى للتبديل. كل فصل له بياناته المستقلة تماماً.' },
          { icon:'💾', title:'حفظ البيانات', desc:'تحفظ تلقائياً كل 5 ثواني في المتصفح. للنسخ الاحتياطي: ⚙️ الإعدادات ← تصدير JSON (يشمل كل الفصول والحقائب).' },
        ].map(h=>`
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">${h.icon}</div>
            <div>
              <div style="font-size:0.86rem;font-weight:800;color:var(--ink2);margin-bottom:3px;">${h.title}</div>
              <div style="font-size:0.80rem;color:var(--muted);line-height:1.5;">${h.desc}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function saveProfile(){
  S.teacher.n1=document.getElementById('pn1')?.value.trim()||S.teacher.n1;
  S.teacher.n2=document.getElementById('pn2')?.value.trim()||S.teacher.n2;
  S.teacher.n3=document.getElementById('pn3')?.value.trim()||S.teacher.n3;
  bsSaveAiSettings(true);
  // Photo handled by saveTeacherPhoto()
  save();
  document.getElementById('tbName').textContent=S.teacher.n1;
  document.getElementById('sbName').textContent=fullName();
  // Update avatars
  const initial=S.teacher.n1.charAt(0)||'م';
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
  toast('✅ تم حفظ الملف الشخصي','success');
  showPage('profile');
}

function saveTeacherPhoto(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    // Compress to 200x200
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      canvas.width=200; canvas.height=200;
      const ctx=canvas.getContext('2d');
      const size=Math.min(img.width,img.height);
      const ox=(img.width-size)/2, oy=(img.height-size)/2;
      ctx.drawImage(img,ox,oy,size,size,0,0,200,200);
      S.teacher.photo=canvas.toDataURL('image/jpeg',0.85);
      save();
      // Refresh avatars immediately
      ['tbAvatar','sbAvatar'].forEach(id=>{
        const el=document.getElementById(id);
        if(!el) return;
        el.style.background='none';
        el.style.boxShadow='0 4px 16px rgba(0,0,0,0.25)';
        el.innerHTML=`<img src="${S.teacher.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`;
      });
      showPage('profile');
      toast('✅ تم حفظ الصورة','success');
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeTeacherPhoto(){
  if(!confirm('حذف الصورة الشخصية؟')) return;
  S.teacher.photo='';
  save();
  showPage('profile');
  toast('تم حذف الصورة','success');
}

function collectExtraLocalKeys(){
  const extras={};
  const lp=localStorage.getItem('bs_lesson_prep');
  if(lp) extras.bs_lesson_prep=lp;
  try{
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!k) continue;
      if(k.startsWith('bs_bag_act_')) extras[k]=localStorage.getItem(k);
      if(k.startsWith('bs_bag_books_manifest_')) extras[k]=localStorage.getItem(k);
    }
  }catch(e){}
  return extras;
}

function exportData(){
  save();
  const classes=getAllClasses();
  const classData={};
  for(const c of classes){
    const raw=localStorage.getItem(getClassStorageKey(c.id));
    if(raw) try{ classData[c.id]=JSON.parse(raw); }catch(e){}
  }
  const payload={
    format:'albushra_full',
    version:2,
    exportedAt:new Date().toISOString(),
    activeClassId:ACTIVE_CLASS_ID,
    classes,
    classData,
    extras:collectExtraLocalKeys()
  };
  const data=JSON.stringify(payload,null,2);
  const a=document.createElement('a');
  a.href='data:application/json;charset=utf-8,'+encodeURIComponent(data);
  a.download='albushra_backup_all_classes_'+today()+'.json';
  a.click();
  toast('تم تصدير كل الفصول والبيانات ✅','success');
}

function importDataClick(){ document.getElementById('importFile').click(); }

function importData(el){
  const f=el.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=e=>{
    try{
      const d=JSON.parse(e.target.result);
      if(d.format==='albushra_full' && d.version>=2 && Array.isArray(d.classes) && d.classData){
        if(!confirm('سيتم استبدال بيانات كل الفصول من الملف. هل تريد المتابعة؟')){ el.value=''; return; }
        localStorage.setItem('bs_classes', JSON.stringify(d.classes));
        Object.keys(d.classData).forEach(cid=>{
          localStorage.setItem(getClassStorageKey(cid), JSON.stringify(d.classData[cid]));
        });
        if(d.activeClassId && d.classes.some(c=>c.id===d.activeClassId)){
          ACTIVE_CLASS_ID=d.activeClassId;
          localStorage.setItem('bs_active_class', d.activeClassId);
        }
        if(d.extras && typeof d.extras==='object'){
          if(d.extras.bs_lesson_prep) localStorage.setItem('bs_lesson_prep', d.extras.bs_lesson_prep);
          Object.keys(d.extras).forEach(k=>{
            if(k.startsWith('bs_bag_act_')) localStorage.setItem(k, d.extras[k]);
            if(k.startsWith('bs_bag_books_manifest_')) localStorage.setItem(k, d.extras[k]);
          });
        }
        load();
        bagLoadAllActivities();
        bagLoadAllBooks().catch(function(){});
        renderClassList();
        const nameEl=document.getElementById('tbClassName');
        const cur=getAllClasses().find(c=>c.id===ACTIVE_CLASS_ID);
        if(nameEl&&cur) nameEl.textContent=cur.name;
        const nb=document.getElementById('nb-students');
        if(nb) nb.textContent=S.students.length;
        const nbg=document.getElementById('nb-goals');
        if(nbg) nbg.textContent=S.goals.filter(g=>!g.done).length;
        rebuildSubjectNav();
        if(typeof CM!=='undefined') CM.games=null;
        showPage('dash');
        toast('تم استيراد كل الفصول بنجاح ✅','success');
        el.value='';
        return;
      }
      if(d.students) S.students=d.students;
      if(d.attendance) S.attendance=d.attendance;
      if(d.evals) S.evals=d.evals;
      if(d.notes) S.notes=d.notes;
      if(d.teacher) S.teacher=d.teacher;
      save(); showPage('dash');
      toast('تم استيراد بيانات الفصل الحالي ✅','success');
      el.value='';
    }catch(err){ toast('خطأ في الملف','error'); el.value=''; }
  };
  r.readAsText(f);
}

function bsGetAiKey(){
  const k=(localStorage.getItem('bs_ai_key')||'').trim();
  if(k) return k;
  return (localStorage.getItem('bs_gemini_key')||'').trim();
}
function bsGetAiProvider(){
  return localStorage.getItem('bs_ai_provider')||'gemini';
}
function bsLoadAiSettingsIntoForm(){
  const prov=document.getElementById('bsAiProvider');
  const key=document.getElementById('bsAiKey');
  if(prov){
    prov.value=bsGetAiProvider();
    if(prov.value!=='openrouter'&&prov.value!=='gemini') prov.value='gemini';
  }
  if(key){
    const k=bsGetAiKey();
    key.value=k;
  }
  bsUpdateAiHints();
  // تحديث أزرار شكل الماوس
  const saved = localStorage.getItem('bs_cursor_style')||'dot';
  ['dot','ring','custom'].forEach(s=>{
    const btn=document.getElementById('csbtn-'+s);
    if(btn) btn.classList.toggle('cs-active', s===saved);
  });
  const inp=document.getElementById('customCursorInput');
  if(inp) inp.style.display = saved==='custom'?'flex':'none';
  const basic=document.getElementById('basicCursorControls');
  if(basic) basic.style.display = (saved==='dot'||saved==='ring')?'flex':'none';
}
function bsUpdateAiHints(){
  const prov=(document.getElementById('bsAiProvider')?.value)||bsGetAiProvider();
  const hint=document.getElementById('bsAiKeyHint');
  const lab=document.getElementById('bsAiKeyLabel');
  if(prov==='openrouter'){
    if(lab) lab.textContent='مفتاح OpenRouter';
    if(hint) hint.innerHTML='احصل على مفتاح من <a href="https://openrouter.ai/keys" target="_blank" rel="noopener">openrouter.ai/keys</a> — يعمل عادة من المتصفح حتى مع فتح الملف محلياً. يُحفظ على جهازك فقط.';
  } else {
    if(lab) lab.textContent='مفتاح Google AI (Gemini)';
    if(hint) hint.innerHTML='من <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>. إن فتحت الصفحة كملف مباشر (file://) قد يمنع المتصفح الاتصال — استخدم «OpenRouter» أو شغّل الموقع عبر خادم محلي (مثل Live Server).';
  }
}
function bsSaveAiSettings(silent){
  const provEl=document.getElementById('bsAiProvider');
  const keyEl=document.getElementById('bsAiKey');
  const prov=provEl?provEl.value:bsGetAiProvider();
  const v=keyEl?keyEl.value.trim():'';
  localStorage.setItem('bs_ai_provider', prov==='openrouter'?'openrouter':'gemini');
  if(v) localStorage.setItem('bs_ai_key', v);
  else localStorage.removeItem('bs_ai_key');
  if(v) localStorage.setItem('bs_gemini_key', v);
  else localStorage.removeItem('bs_gemini_key');
  bsUpdateAiHints();
  if(!silent) toast('تم حفظ إعدادات المساعد','success');
}

function clearAllData(){
  if(!confirm('هل أنت متأكد من حذف كل البيانات؟ لا يمكن التراجع!')) return;
  if(!confirm('تأكيد نهائي: حذف كل الطلاب والتقييمات والملاحظات؟')) return;
  S.students=[];S.attendance={};S.evals={};S.notes=[];
  save(); showPage('dash');
  toast('تم حذف كل البيانات','success');
}

// ═══════════════════════════════════════════���══