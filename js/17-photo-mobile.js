// ══════════════════════════════════════════════════════════════
// 📷 STUDENT PHOTO SYSTEM
// ══════════════════════════════════════════════════════════════

let _photoTargetSid = null;
let _photoPendingData = null; // base64 string pending save

function openPhotoModal(sid, event){
  if(event) event.stopPropagation();
  _photoTargetSid = sid;
  _photoPendingData = null;
  const s = S.students.find(x=>x.id===sid);
  if(!s) return;
  document.getElementById('photoStudentName').textContent = s.name;
  document.getElementById('photoFileInput').value = '';
  document.getElementById('photoCameraInput').value = '';
  document.getElementById('photoUrlInput').value = '';
  document.getElementById('photoUrlInput').style.display = 'none';
  document.getElementById('photoSaveBtn').style.display = 'none';
  // Show current photo if exists
  const prev = document.getElementById('photoPreviewWrap');
  const img = document.getElementById('photoPreviewImg');
  if(s.photo){
    img.src = s.photo;
    prev.style.display = 'block';
    document.getElementById('photoDropZone').style.display = 'none';
  } else {
    prev.style.display = 'none';
    document.getElementById('photoDropZone').style.display = '';
  }
  openM('mbPhoto');
}

function handlePhotoFile(input){
  const file = input.files[0];
  if(!file) return;
  if(file.size > 3*1024*1024){ toast('الصورة أكبر من 3MB، اختر صورة أصغر','error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    _setPhotoPending(e.target.result);
  };
  reader.readAsDataURL(file);
}

function handlePhotoDrop(event){
  event.preventDefault();
  document.getElementById('photoDropZone').classList.remove('drag-over');
  const file = event.dataTransfer.files[0];
  if(!file || !file.type.startsWith('image/')){ toast('الرجاء إسقاط ملف صورة','error'); return; }
  if(file.size > 3*1024*1024){ toast('الصورة أكبر من 3MB','error'); return; }
  const reader = new FileReader();
  reader.onload = e => _setPhotoPending(e.target.result);
  reader.readAsDataURL(file);
}

function applyPhotoUrl(){
  const url = document.getElementById('photoUrlInput').value.trim();
  if(!url){ toast('أدخل رابط صحيح','error'); return; }
  _setPhotoPending(url);
}

function _setPhotoPending(dataOrUrl){
  // Resize image to max 200x200 using canvas to save storage space
  if(dataOrUrl.startsWith('data:image')){
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 200;
      let w = img.width, h = img.height;
      if(w > max || h > max){
        if(w > h){ h = Math.round(h*(max/w)); w = max; }
        else { w = Math.round(w*(max/h)); h = max; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      _photoPendingData = canvas.toDataURL('image/jpeg', 0.82);
      _showPhotoPending();
    };
    img.src = dataOrUrl;
  } else {
    _photoPendingData = dataOrUrl;
    _showPhotoPending();
  }
}

function _showPhotoPending(){
  const prev = document.getElementById('photoPreviewWrap');
  const img = document.getElementById('photoPreviewImg');
  img.src = _photoPendingData;
  prev.style.display = 'block';
  document.getElementById('photoDropZone').style.display = 'none';
  document.getElementById('photoSaveBtn').style.display = '';
}

function savePhoto(){
  if(!_photoPendingData || !_photoTargetSid){ toast('لا توجد صورة للحفظ','error'); return; }
  const s = S.students.find(x=>x.id===_photoTargetSid);
  if(!s) return;
  s.photo = _photoPendingData;
  save();
  closeM('mbPhoto');
  toast('تم حفظ صورة الطالب ✅','success');
  logChange('edit','تحديث صورة طالب', s.name);
  // Refresh current page if students-related
  const cur = document.querySelector('.nav-btn.active')?.id?.replace('nav-','');
  if(cur && ['students','seatmap','behavior','treasuremap'].includes(cur)) showPage(cur);
  else showPage('students');
}

function removePhoto(){
  const s = S.students.find(x=>x.id===_photoTargetSid);
  if(!s) return;
  s.photo = '';
  _photoPendingData = null;
  save();
  document.getElementById('photoPreviewWrap').style.display = 'none';
  document.getElementById('photoDropZone').style.display = '';
  document.getElementById('photoSaveBtn').style.display = 'none';
  toast('تم حذف الصورة','success');
}

// Preview in add-student modal
let _addPhotoData = '';
function previewAddPhoto(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 200;
      let w=img.width, h=img.height;
      if(w>max||h>max){ if(w>h){h=Math.round(h*(max/w));w=max;}else{w=Math.round(w*(max/h));h=max;} }
      canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      _addPhotoData = canvas.toDataURL('image/jpeg', 0.82);
      const prev = document.getElementById('addModalPhotoPreview');
      prev.innerHTML = `<img src="${_addPhotoData}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;" />`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Photo reset integrated into openAddModal directly

// Hook into saveStudent to include photo
const _origSaveStudentCore = saveStudent;
function saveStudent(){
  const name=document.getElementById('an1').value.trim();
  if(!name){toast('الرجاء إدخال الاسم','error');return;}
  const num=document.getElementById('an2').value||S.students.length+1;
  const parent=document.getElementById('an3').value.trim();
  const gender=document.getElementById('an4').value;
  const note=document.getElementById('an5').value.trim();
  const s={id:genId(),name,num:+num,parent,gender,note,photo:_addPhotoData||'',createdAt:Date.now()};
  S.students.push(s);
  if(note) S.notes.push({id:genId(),sid:s.id,text:note,type:'general',prio:'normal',date:today()});
  save();
  logChange('add','إضافة طالب',name);
  document.getElementById('nb-students').textContent=S.students.length;
  closeM('mbAdd');
  _addPhotoData='';
  toast('تم إضافة الطالب بنجاح ✅','success');
  showPage('students');
}

// Bulk photo import page inside profile
function renderPhotoManager(){
  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">إدارة صور الطلاب</span></div>
  <div class="ph">
    <div><div class="ph-title">📷 إدارة صور الطلاب</div>
    <div class="ph-sub">أضف صورة لكل طالب — تظهر في كل صفحات التطبيق</div></div>
  </div>
  ${S.students.length===0?`<div class="empty"><div class="empty-emoji">📷</div><h3>لا يوجد طلاب</h3></div>`:`
  <div class="photo-class-grid">
    ${S.students.map(s=>`
      <div class="photo-class-item" onclick="openPhotoModal('${s.id}',event)">
        ${s.photo
          ?`<img src="${s.photo}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--sky3);" />`
          :`<div style="width:64px;height:64px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;border:2px dashed rgba(255,255,255,0.4);">${s.name.charAt(0)}</div>`
        }
        <div class="pc-name">${s.name.split(' ').slice(0,2).join(' ')}</div>
        <div style="font-size:0.65rem;color:${s.photo?'var(--mint)':'var(--muted2)'}">
          ${s.photo?'✅ يوجد صورة':'📷 اضغط للإضافة'}
        </div>
      </div>
    `).join('')}
  </div>`}`;
}

// ══════════════════════════════════════════════════════════════
// 📱 MOBILE SUPPORT SYSTEM
// ══════════════════════════════════════════════════════════════

const isMobile = () => window.innerWidth <= 960 || ('ontouchstart' in window);

// ── Bottom Nav ──────────────────────────────────────────────
const BN_PAGES = { dash:'dash', students:'students', attend:'attend', reports:'reports' };

function setBnActive(page){
  document.querySelectorAll('.bn-item').forEach(b=>{
    b.classList.remove('active');
    b.querySelector('.bn-dot')?.classList.remove('active');
  });
  const btn = document.getElementById('bn-'+page);
  if(btn){ btn.classList.add('active'); }
  // Update student badge
  const bnn = document.getElementById('bnn-students');
  if(bnn){
    const n = S.students.length;
    bnn.textContent = n;
    bnn.style.display = n>0?'flex':'none';
  }
}

// Hook showPage to also update bottom nav
// showPage mobile hooks — integrated below

function onFabPress(){
  const cur = document.querySelector('.nav-btn.active, .bn-item.active')?.id?.replace('nav-','')?.replace('bn-','') || '';
  if(cur==='students') openAddModal();
  else if(cur==='notes') openNoteFor(null);
  else if(cur==='goals') openGoalFor(null);
  else if(cur==='meetings') openMeetingFor(null);
  else openAddModal();
}

// ── More Sheet ───────────────────────────────────────────────
function openMoreSheet(){
  document.getElementById('moreSheet').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeMoreSheet(){
  document.getElementById('moreSheet').classList.remove('open');
  document.body.style.overflow='';
}

// ── Swipe to open more sheet ─────────────────────────────────
let _swipeStartX=0, _swipeStartY=0, _swipeLocked=false;
document.addEventListener('touchstart', e=>{
  _swipeStartX=e.touches[0].clientX;
  _swipeStartY=e.touches[0].clientY;
  _swipeLocked=false;
}, {passive:true});
document.addEventListener('touchend', e=>{
  if(_swipeLocked) return;
  const dx=e.changedTouches[0].clientX-_swipeStartX;
  const dy=e.changedTouches[0].clientY-_swipeStartY;
  // عشّق الـ threshold لـ 120px ونسبة أفقية صارمة — يمنع الفتح العرضي
  if(Math.abs(dx)>120 && Math.abs(dx)>Math.abs(dy)*3){
    const inModal=document.querySelector('.modal-bg.open, #moreSheet.open');
    if(inModal){ closeMoreSheet(); return; }
    // فقط لو السحب من أقصى اليمين (آخر 30px من الشاشة)
    if(dx>0 && isMobile() && _swipeStartX > window.innerWidth - 30){
      openMoreSheet();
    }
  }
}, {passive:true});

// ── Pull-to-refresh on mobile ────────────────────────────────
let _pullStart=0, _pulling=false;
const content = document.getElementById('mainContent');
if(content){
  content.addEventListener('touchstart', e=>{
    // فقط لو في الأعلى خالص وإصبع واحد
    if(content.scrollTop===0 && e.touches.length===1){
      _pullStart=e.touches[0].clientY;
    } else {
      _pullStart=0;
    }
  }, {passive:true});
  content.addEventListener('touchmove', e=>{
    if(_pullStart>0 && content.scrollTop===0){
      const pull=e.touches[0].clientY-_pullStart;
      // تأكد إن الحركة للأسفل وأكبر من 80px قبل الـ trigger
      if(pull>80 && !_pulling){
        _pulling=true;
        const ind=document.createElement('div');
        ind.id='pullInd';
        ind.style.cssText='position:fixed;top:68px;left:50%;transform:translateX(-50%);background:var(--sky);color:white;padding:6px 18px;border-radius:0 0 12px 12px;font-size:.80rem;font-weight:800;z-index:400;font-family:Tajawal,sans-serif;';
        ind.textContent='🔄 اسحب للتحديث...';
        document.body.appendChild(ind);
      }
    }
  }, {passive:true});
  content.addEventListener('touchend', e=>{
    if(_pulling){
      _pulling=false; _pullStart=0;
      document.getElementById('pullInd')?.remove();
      const cur=document.querySelector('.nav-btn.active, .bn-item.active')?.id?.replace('nav-','')?.replace('bn-','');
      if(cur) showPage(cur);
    } else { _pullStart=0; }
  }, {passive:true});
}

// ── Modal bottom sheet on mobile ─────────────────────────────
// openM/closeM — see above

// ── Responsive table helper: hide less important cols ─────────
function applyMobileTableHide(){
  if(!isMobile()) return;
  // Add hide-mobile to certain th/td based on index
  document.querySelectorAll('.tbl thead tr th').forEach((th,i)=>{
    if(i>=5 && i!==th.closest('thead').querySelectorAll('th').length-1){
      th.classList.add('hide-mobile');
    }
  });
  document.querySelectorAll('.tbl tbody tr').forEach(tr=>{
    tr.querySelectorAll('td').forEach((td,i)=>{
      if(i>=5 && i!==tr.querySelectorAll('td').length-1){
        td.classList.add('hide-mobile');
      }
    });
  });
}

// ── Override initPage to apply mobile fixes ──────────────────
// initPage mobile — integrated

// ── Viewport height fix for mobile browsers (address bar) ────
function fixViewportHeight(){
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', fixViewportHeight);
fixViewportHeight();

// ── Prevent double-tap zoom على الأزرار فقط (مش السكرول) ──────
document.addEventListener('touchend', e=>{
  const tapEl=e.target.closest('button,.btn,.bn-item,.nav-btn');
  if(!tapEl) return;
  // لو كان فيه حركة عمودية = سكرول، متمنعش
  const dy = Math.abs(e.changedTouches[0].clientY - _swipeStartY);
  if(dy > 10) return;
  e.preventDefault();
  tapEl.click();
}, {passive:false});
