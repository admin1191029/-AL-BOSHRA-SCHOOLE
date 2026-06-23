// ══════════════════════════════════════════════
// CLOUD SYNC — مزامنة بيانات كل معلّم عبر Firestore
// offline-first: localStorage هو المصدر السريع، والسحابة نسخة متزامنة لكل حساب.
// البنية: users/{uid}/meta/profile (قائمة الفصول + المعلّم)
//         users/{uid}/classes/{classId} (بيانات الفصل كنص JSON)
// ══════════════════════════════════════════════
let _cloudTimer = null;

function _cloudUid(){
  return (typeof fbReady !== 'undefined' && fbReady && fbAuth && fbAuth.currentUser)
    ? fbAuth.currentUser.uid : null;
}

// يُستدعى من save() — يدفع الفصل الحالي للسحابة (مؤجَّل لتجميع الكتابات المتتابعة)
function cloudSyncSave(){
  const uid = _cloudUid();
  if(!uid || !fbDb) return;
  clearTimeout(_cloudTimer);
  _cloudTimer = setTimeout(function(){ _cloudPushActive(uid); }, 1500);
}

async function _cloudPushActive(uid){
  if(!fbDb) return;
  try{
    const classId = ACTIVE_CLASS_ID;
    const blob = localStorage.getItem(getClassStorageKey(classId)) || '{}';
    const batch = fbDb.batch();
    batch.set(fbDb.collection('users').doc(uid).collection('classes').doc(classId),
      { blob: blob, updatedAt: Date.now() });
    batch.set(fbDb.collection('users').doc(uid).collection('meta').doc('profile'),
      { classes: getAllClasses(), activeClass: classId, teacher: S.teacher || null, updatedAt: Date.now() });
    await batch.commit();
  }catch(e){ console.warn('cloud push', e && e.message); }
}

// يرفع كل الفصول دفعة واحدة (ترحيل أول مرة من المحلي إلى السحابة)
async function cloudPushAll(){
  const uid = _cloudUid();
  if(!uid || !fbDb) return;
  try{
    const classes = getAllClasses();
    const batch = fbDb.batch();
    classes.forEach(function(c){
      const blob = localStorage.getItem(getClassStorageKey(c.id)) || '{}';
      batch.set(fbDb.collection('users').doc(uid).collection('classes').doc(c.id),
        { blob: blob, updatedAt: Date.now() });
    });
    batch.set(fbDb.collection('users').doc(uid).collection('meta').doc('profile'),
      { classes: classes, activeClass: ACTIVE_CLASS_ID, teacher: S.teacher || null, updatedAt: Date.now() });
    await batch.commit();
  }catch(e){ console.warn('cloud pushAll', e && e.message); }
}

// يسحب بيانات الحساب من السحابة إلى localStorage. يرجّع {hadCloud}
async function cloudPull(uid){
  if(!fbDb || !uid) return { hadCloud: false };
  try{
    const metaDoc = await fbDb.collection('users').doc(uid).collection('meta').doc('profile').get();
    if(!metaDoc.exists) return { hadCloud: false };
    const meta = metaDoc.data() || {};
    const classesSnap = await fbDb.collection('users').doc(uid).collection('classes').get();
    classesSnap.forEach(function(doc){
      const d = doc.data() || {};
      if(typeof d.blob === 'string'){ try{ localStorage.setItem('bs_class_' + doc.id, d.blob); }catch(e){} }
    });
    if(meta.classes){ try{ localStorage.setItem('bs_classes', JSON.stringify(meta.classes)); }catch(e){} }
    if(meta.activeClass){ try{ localStorage.setItem('bs_active_class', meta.activeClass); }catch(e){} ACTIVE_CLASS_ID = meta.activeClass; }
    if(meta.teacher){ S.teacher = meta.teacher; }
    return { hadCloud: true };
  }catch(e){
    console.warn('cloud pull', e && e.message);
    return { hadCloud: false, error: String(e) };
  }
}
