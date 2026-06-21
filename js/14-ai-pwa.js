// ══════════════════════════════════════════════
// AI INSIGHTS ENGINE
// ══════════════════════════════════════════════
function generateInsights(){
  const insights=[];
  const total=S.students.length;
  if(!total) return [{icon:'📭',title:'لا توجد بيانات بعد',body:'أضف طلاباً وابدأ التقييم لرؤية التوصيات الذكية.',actions:[]}];

  // Insight 1: Students needing support
  const needHelp=S.students.filter(s=>studentMastery(s.id).total<40);
  if(needHelp.length){
    insights.push({
      icon:'⚠️',title:`${needHelp.length} طالب في بداية رحلتهم ويحتاجون دعماً فورياً`,
      body:`الطلاب التالية أسماؤهم نسبة إتقانهم أقل من 40%: ${needHelp.map(s=>s.name).join('، ')}. يُنصح بجلسات دعم فردية أو إشراك أولياء الأمور.`,
      actions:needHelp.map(s=>({label:`📝 ${s.name.split(' ')[0]}`,fn:`openNoteFor('${s.id}')`})),
      color:'ember'
    });
  }

  // Insight 2: Perfect students
  const stars=S.students.filter(s=>studentMastery(s.id).total===100);
  if(stars.length){
    insights.push({
      icon:'🌟',title:`${stars.length} طالب وصل لـ 100% إتقان!`,
      body:`تهانينا! هؤلاء الطلاب أتقنوا جميع المهارات: ${stars.map(s=>s.name).join('، ')}. يمكنك تكليفهم بأنشطة إثرائية أو مساعدة زملائهم.`,
      actions:[], color:'mint'
    });
  }

  // Insight 3: Attendance pattern
  const dates=Object.keys(S.attendance).sort().slice(-7);
  if(dates.length>=3){
    const chronicallyAbsent=S.students.filter(s=>{
      const absent=dates.filter(d=>(S.attendance[d]||{})[s.id]==='a').length;
      return absent>=3;
    });
    if(chronicallyAbsent.length){
      insights.push({
        icon:'📅',title:`${chronicallyAbsent.length} طالب كثير الغياب (3+ أيام بآخر أسبوع)`,
        body:`الطلاب: ${chronicallyAbsent.map(s=>s.name).join('، ')}. الغياب المتكرر يؤثر على التحصيل. تواصل مع أولياء الأمور.`,
        actions:chronicallyAbsent.filter(s=>s.parent).map(s=>({label:`💬 ${s.name.split(' ')[0]}`,fn:`waStudent('${s.id}')`})),
        color:'gold'
      });
    }
  }

  // Insight 4: Hardest skill
  const firstSub=S.subjects[0];
  const firstSec=firstSub?.sections[0];
  if(firstSec&&total>=3){
    const skillRates=firstSec.skills.map((sk,i)=>{
      const cnt=S.students.filter(s=>((S.evals[s.id]?.[firstSub.id]||{})[firstSec.id]||{})[i]==='m').length;
      return {sk,pct:Math.round((cnt/total)*100)};
    });
    const hardest=skillRates.sort((a,b)=>a.pct-b.pct)[0];
    if(hardest&&hardest.pct<50){
      insights.push({
        icon:'🎯',title:`المهارة الأصعب: "${hardest.sk}" (${hardest.pct}% إتقان)`,
        body:`أقل من نصف الطلاب يتقنون هذه المهارة. يُنصح بإعادة شرح هذا الدرس بأساليب مختلفة مثل الألعاب التعليمية أو الأنشطة الجماعية.`,
        actions:[{label:'🚀 تقييم سريع',fn:`startQuickEval('${firstSub.id}','${firstSec.id}')`}],
        color:'plum'
      });
    }
  }

  // Insight 5: Ungraded students
  const ungraded=S.students.filter(s=>{
    const ev=S.evals[s.id]||{};
    return Object.keys(ev).length===0;
  });
  if(ungraded.length>0){
    insights.push({
      icon:'📋',title:`${ungraded.length} طالب لم يُقيَّم بعد`,
      body:`الطلاب التالية لم يتم تقييم أي مهارة لهم: ${ungraded.slice(0,5).map(s=>s.name).join('، ')}${ungraded.length>5?` وآخرون...`:''}. ابدأ التقييم الآن!`,
      actions:[{label:'🚀 تقييم سريع للكل',fn:firstSub&&firstSec?`startQuickEval('${firstSub.id}','${firstSec.id}')`:null}].filter(a=>a.fn),
      color:'sky'
    });
  }

  // Insight 6: No parent contact students
  const noParent=S.students.filter(s=>!s.parent||s.parent.replace(/\D/g,'').length<9);
  if(noParent.length){
    insights.push({
      icon:'📱',title:`${noParent.length} طالب بدون رقم واتساب للولي`,
      body:`تواصل أولياء الأمور أمر مهم. الطلاب التالية لا يوجد رقم لأوليائهم: ${noParent.slice(0,4).map(s=>s.name).join('، ')}. أضف الأرقام من صفحة الطلاب.`,
      actions:[{label:'👥 إدارة الطلاب',fn:`showPage('students')`}],
      color:'gold'
    });
  }

  // Insight 7: Goal completion rate
  if(S.goals.length>0){
    const doneGoals=S.goals.filter(g=>g.done).length;
    const pct=Math.round((doneGoals/S.goals.length)*100);
    insights.push({
      icon:'🎯',title:`نسبة إنجاز الأهداف: ${pct}% (${doneGoals}/${S.goals.length})`,
      body:pct>=80?`ممتاز! أنت تحقق أهدافك بشكل رائع. استمر في هذا المستوى.`:pct>=50?`تقدم جيد في الأهداف. راجع الأهداف المتبقية وحدد الأولويات.`:`يوجد ${S.goals.length-doneGoals} هدف لم يُنجز بعد. خذ وقتاً لمراجعة خطتك.`,
      actions:[{label:'🎯 عرض الأهداف',fn:`showPage('goals')`}],
      color:pct>=80?'mint':pct>=50?'gold':'ember'
    });
  }

  return insights.length?insights:[{icon:'✅',title:'كل شيء يسير بشكل ممتاز!',body:'لا توجد تنبيهات الآن. استمر في متابعة طلابك.',actions:[],color:'mint'}];
}

function renderInsights(){
  const insights=generateInsights();
  const colMap={ember:'rgba(239,68,68,0.07)',mint:'rgba(16,185,129,0.07)',gold:'rgba(245,158,11,0.07)',plum:'rgba(124,58,237,0.08)',sky:'rgba(21,101,192,0.07)'};
  const borderMap={ember:'rgba(239,68,68,0.22)',mint:'rgba(16,185,129,0.22)',gold:'rgba(245,158,11,0.22)',plum:'rgba(124,58,237,0.22)',sky:'rgba(21,101,192,0.22)'};
  const titleMap={ember:'var(--ember)',mint:'#059669',gold:'#b45309',plum:'var(--plum)',sky:'var(--sky)'};
  return `
  <div class="breadcrumb">🏠 <span class="sep">›</span> <span class="active">الرؤى الذكية</span></div>
  <div class="ph">
    <div><div class="ph-title">🤖 الرؤى والتوصيات الذكية</div>
    <div class="ph-sub">تحليل تلقائي لبيانات الفصل وتوصيات مخصصة للمعلم</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="showPage('insights')">🔄 تحديث</button>
    </div>
  </div>
  <div id="insightsList">
    ${insights.map((ins,i)=>`
      <div class="insight-card" style="background:${colMap[ins.color]||colMap.plum};border-color:${borderMap[ins.color]||borderMap.plum};opacity:0;transform:translateY(12px);transition:all 0.4s ease ${i*0.08}s" id="ins_${i}">
        <span class="insight-icon">${ins.icon}</span>
        <div style="flex:1">
          <div class="insight-title" style="color:${titleMap[ins.color]||titleMap.plum}">${ins.title}</div>
          <div class="insight-body">${ins.body}</div>
          ${ins.actions.length?`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
            ${ins.actions.map(a=>`<button class="insight-action" onclick="${a.fn}">${a.label}</button>`).join('')}
          </div>`:''}
        </div>
      </div>
    `).join('')}
  </div>
  <div class="note-card" style="margin-top:16px;">
    <span class="note-icon">ℹ️</span>
    <div>التوصيات تُحدَّث تلقائياً بناءً على أحدث بيانات الطلاب والحضور والتقييمات.</div>
  </div>`;
}
function animateInsights(){
  document.querySelectorAll('[id^="ins_"]').forEach((el,i)=>{
    setTimeout(()=>{el.style.opacity='1';el.style.transform='none';},i*90);
  });
}

// ══════════════════════════════════════════════════════════════
// PWA — SERVICE WORKER + OFFLINE + INSTALL
// ══════════════════════════════════════════════════════════════

// Inject manifest dynamically (avoids needing external file)
(function(){
  const manifest = {
    name: 'مدارس البشرى — منصة المعلم',
    short_name: 'البشرى',
    description: 'منصة المعلم الذكية لمتابعة الطلاب',
    start_url: './',
    display: 'standalone',
    background_color: '#1e3a5f',
    theme_color: '#1e3a5f',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231e3a5f"/><text y=".9em" font-size="80" x="10">🏫</text></svg>', sizes: '192x192', type: 'image/svg+xml' },
      { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%231e3a5f"/><text y=".9em" font-size="80" x="10">🏫</text></svg>', sizes: '512x512', type: 'image/svg+xml' }
    ]
  };
  const blob = new Blob([JSON.stringify(manifest)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  document.getElementById('pwaManifest').href = url;
})();

// ═════════════════════════════��════════════════════════════════
// PWA OFFLINE ENGINE
// Strategy: since this is a single HTML file, SW blob registration
// is blocked by browsers. Instead we use:
//   1. IndexedDB to cache the full page HTML for offline use
//   2. Cache API to cache external CDN assets (Chart.js, fonts)
//   3. Online/Offline detection with auto-sync
//   4. "Add to Home Screen" install prompt
// ══════════════════════════════════════════════════════════════

const CACHE_NAME = 'albushra-v6';

// ── Cache external assets via Cache API (no SW needed) ─────────
async function cacheExternalAssets(){
  if(!('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const assets = [
      'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
      'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&family=Amiri:wght@400;700&display=swap'
    ];
    // Cache each asset silently (ignore failures)
    await Promise.allSettled(assets.map(url=>
      fetch(url, {mode:'no-cors'}).then(r=>cache.put(url, r)).catch(()=>{})
    ));
    console.log('✅ External assets cached');
  } catch(e){ console.warn('Cache failed:', e); }
}

// ── Save full page snapshot to IndexedDB for offline ──────────
function saveOfflineSnapshot(){
  try {
    const html = document.documentElement.outerHTML;
    const req = indexedDB.open('albushra_offline', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('pages');
    req.onsuccess = e => {
      const db = e.target.result;
      const tx = db.transaction('pages','readwrite');
      tx.objectStore('pages').put({
        html, savedAt: new Date().toISOString(),
        version: 'v6'
      }, 'main');
    };
  } catch(e){ /* IDB not available */ }
}

// ── Attempt to serve from IndexedDB if offline ────────────────
function checkOfflineSnapshot(){
  if(navigator.onLine) return;
  try {
    const req = indexedDB.open('albushra_offline', 1);
    req.onsuccess = e => {
      const db = e.target.result;
      if(!db.objectStoreNames.contains('pages')) return;
      const tx = db.transaction('pages','readonly');
      tx.objectStore('pages').get('main').onsuccess = r => {
        if(r.result) console.log('📦 Offline snapshot available from', r.result.savedAt);
      };
    };
  } catch(e){}
}

let _pwaPrompt = null;

function initPWA(){
  // Cache assets when online
  if(navigator.onLine){
    setTimeout(cacheExternalAssets, 2000);
    // Save page snapshot every 5 minutes
    setTimeout(saveOfflineSnapshot, 5000);
    setInterval(saveOfflineSnapshot, 5 * 60 * 1000);
  } else {
    checkOfflineSnapshot();
  }

  // PWA install prompt
  window.addEventListener('beforeinstallprompt', e=>{
    e.preventDefault();
    _pwaPrompt = e;
    setTimeout(()=>{
      if(!localStorage.getItem('pwa_dismissed')){
        document.getElementById('pwaInstallBanner').classList.add('show');
      }
    }, 3000);
  });

  window.addEventListener('appinstalled', ()=>{
    document.getElementById('pwaInstallBanner').classList.remove('show');
    toast('🎉 تم تثبيت التطبيق! افتحه من الشاشة الرئيسية','success');
    logChange('add','تثبيت التطبيق','تم تثبيت PWA على الجهاز');
  });

  // Online/Offline events
  let wasOffline = false;
  window.addEventListener('offline', ()=>{
    wasOffline = true;
    document.getElementById('offlineBadge').classList.add('show');
    toast('📵 انقطع الاتصال — البيانات محفوظة محلياً','info');
    logChange('edit','حالة الاتصال','انقطع الاتصال بالإنترنت');
  });

  window.addEventListener('online', ()=>{
    document.getElementById('offlineBadge').classList.remove('show');
    if(wasOffline){
      wasOffline = false;
      const sb = document.getElementById('syncBadge');
      sb.classList.add('show');
      setTimeout(()=>sb.classList.remove('show'), 3200);
      save();
      cacheExternalAssets();
      saveOfflineSnapshot();
      logChange('edit','حالة الاتصال','عاد الاتصال — تمت المزامنة والنسخ الاحتياطي');
    }
  });

  // Initial state
  if(!navigator.onLine){
    document.getElementById('offlineBadge').classList.add('show');
  }
}

function installPWA(){
  if(!_pwaPrompt){
    // Check why install is not available
    const isFile = location.protocol === 'file:';
    const isHttps = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if(isFile){
      toast('⚠️ لتثبيت التطبيق: افتح الملف عبر سيرفر (Live Server) وليس مباشرة من المجلد','info');
    } else if(!isHttps && !isLocalhost){
      toast('⚠️ التثبيت يتطلب اتصال HTTPS — تأكد أن الموقع يعمل على https://','info');
    } else {
      toast('⚠️ التثبيت غير متاح الآن — جرّب Chrome أو Edge وأعد تحميل الصفحة','info');
    }
    return;
  }
  _pwaPrompt.prompt();
  _pwaPrompt.userChoice.then(r=>{
    if(r.outcome==='accepted') toast('🎉 جاري التثبيت...','success');
    _pwaPrompt = null;
    document.getElementById('pwaInstallBanner').classList.remove('show');
  });
}

function dismissPWA(){
  document.getElementById('pwaInstallBanner').classList.remove('show');
  localStorage.setItem('pwa_dismissed', '1');
}
