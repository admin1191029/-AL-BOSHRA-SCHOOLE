// ══════════════════════════════════════════════
// WELCOME SPLASH SCREEN
// ══════════════════════════════════════════════
(function initSplash(){
  // Set logo
  const wsLogo = document.getElementById('wsLogoImg');
  if(wsLogo) wsLogo.src = SCHOOL_LOGO;

  // Generate floating particles
  const container = document.getElementById('wsParticles');
  if(container){
    const colors = ['#ffffff','#a9cdef','#6fa3da','#cfe0f5'];
    for(let i=0;i<28;i++){
      const p = document.createElement('div');
      p.className = 'ws-particle';
      const size = 4 + Math.random()*14;
      p.style.cssText = `
        width:${size}px;height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        left:${Math.random()*100}%;
        animation-duration:${5+Math.random()*8}s;
        animation-delay:${Math.random()*4}s;
      `;
      container.appendChild(p);
    }
  }

  // Hide splash after bar finishes (~2.6s)
  setTimeout(()=>{
    const splash = document.getElementById('welcomeSplash');
    if(splash){
      splash.classList.add('hide');
      setTimeout(()=>{ splash.style.display='none'; }, 650);
    }
  }, 2600);
})();

// ══════════════════════════════════════════════
// THEME COLOR CUSTOMIZER
// ══════════════════════════════════════════════
const THEME_COLORS = [
  { id:'blue',   label:'أزرق',    sky:'#1d4e89', sky2:'#16335c', sky3:'#4a86c5' },
  { id:'teal',   label:'زمردي',   sky:'#0d7377', sky2:'#14a085', sky3:'#48d1cc' },
  { id:'purple', label:'بنفسجي',  sky:'#6d28d9', sky2:'#7c3aed', sky3:'#a78bfa' },
  { id:'rose',   label:'وردي',    sky:'#be185d', sky2:'#db2777', sky3:'#f472b6' },
  { id:'green',  label:'أخضر',    sky:'#166534', sky2:'#16a34a', sky3:'#4ade80' },
  { id:'orange', label:'برتقالي', sky:'#c2410c', sky2:'#ea580c', sky3:'#fb923c' },
];

function applyAccentColor(colorId, save=true){
  const tc = THEME_COLORS.find(c=>c.id===colorId) || THEME_COLORS[0];
  const root = document.documentElement;
  root.style.setProperty('--sky',  tc.sky);
  root.style.setProperty('--sky2', tc.sky2);
  root.style.setProperty('--sky3', tc.sky3);
  root.style.setProperty('--ink2', tc.sky);
  if(save) localStorage.setItem('bs_accent_color', colorId);
  // Update active swatch
  document.querySelectorAll('.theme-color-swatch').forEach(sw=>{
    sw.classList.toggle('active', sw.dataset.colorId===colorId);
  });
}

function _initAccentColor(){
  applyAccentColor('blue', false); // لون واحد مقفول مطابق لصفحة الدخول
}
_initAccentColor();

// ══════════════════════════════════════════════
// STUDENT CARDS PRINT
// ══════════════════════════════════════════════
function openStudentCards(){
  const cards = S.students.map((st,idx)=>{
    const colors = [
      ['#1e3a5f','#1565c0','#42a5f5'],
      ['#4a1d96','#7c3aed','#a78bfa'],
      ['#065f46','#059669','#34d399'],
      ['#92400e','#d97706','#fbbf24'],
      ['#9d174d','#db2777','#f9a8d4'],
      ['#1e3a5f','#0891b2','#67e8f9'],
    ];
    const [c1,c2,c3] = colors[idx % colors.length];

    const photoHTML = st.photo
      ? `<img src="${st.photo}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,${c2},${c3});display:flex;align-items:center;justify-content:center;color:white;font-size:2.8rem;font-weight:900;">${(st.name||'؟').charAt(0)}</div>`;

    return `
      <div style="width:200px;background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.13);page-break-inside:avoid;break-inside:avoid;border:1px solid #e2e8f0;">
        <!-- Header gradient -->
        <div style="height:70px;background:linear-gradient(135deg,${c1},${c2},${c3});position:relative;">
          <div style="position:absolute;top:0;left:0;right:0;bottom:0;opacity:0.15;background:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><circle cx=%2230%22 cy=%2230%22 r=%2220%22 fill=%22none%22 stroke=%22white%22 stroke-width=%221%22/></svg>');"></div>
        </div>
        <!-- Photo -->
        <div style="margin:-45px auto 0;width:90px;height:90px;border-radius:50%;overflow:hidden;border:4px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.18);position:relative;z-index:2;">
          ${photoHTML}
        </div>
        <!-- Info -->
        <div style="padding:12px 14px 18px;text-align:center;">
          <div style="font-size:1rem;font-weight:900;color:#0d1b2a;margin-bottom:4px;line-height:1.3;">${st.name||'—'}</div>
          ${st.number ? `<div style="display:inline-block;background:linear-gradient(135deg,${c1},${c2});color:white;font-size:0.72rem;font-weight:800;padding:3px 12px;border-radius:99px;margin-bottom:8px;"># ${st.number}</div>` : ''}
          <div style="margin-top:8px;padding-top:8px;border-top:1px dashed #e2e8f0;font-size:0.65rem;color:#94a3b8;font-weight:700;letter-spacing:0.5px;">مدارس البشرى الأهلية</div>
        </div>
      </div>`;
  }).join('');

  const win = window.open('','_blank');
  if(!win){ toast('السماح بالنوافذ المنبثقة','error'); return; }
  win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl">
  <head><meta charset="UTF-8"><title>بطاقات الطلاب</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet">
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Tajawal',sans-serif;background:#f8faff;padding:32px;direction:rtl;}
    .cards-grid{display:flex;flex-wrap:wrap;gap:20px;justify-content:flex-start;}
    .print-header{text-align:center;margin-bottom:28px;}
    .print-header h1{font-size:1.6rem;font-weight:900;color:#1e3a5f;}
    .print-header p{color:#64748b;font-size:0.88rem;margin-top:4px;}
    @media print{body{background:white;padding:16px;} .no-print{display:none!important;}}
  </style></head><body>
  <div class="print-header no-print">
    <h1>🎓 بطاقات الطلاب — ${S.teacher.n1||'المعلم'}</h1>
    <p>${S.students.length} طالب • ${new Date().toLocaleDateString('ar-EG')}</p>
  </div>
  <div style="text-align:center;margin-bottom:24px;" class="no-print">
    <button onclick="window.print()" style="padding:12px 32px;background:#1565c0;color:white;border:none;border-radius:12px;font-family:'Tajawal',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;">🖨️ طباعة البطاقات</button>
  </div>
  <div class="cards-grid">${cards}</div>
  </body></html>`);
  win.document.close();
}

// ══════════════════════════════��═══════════════
// CURSOR STYLE SWITCHER
// ══════════════════════════════════════════════
const _CS_STYLES = ['dot','ring','custom'];
const _CS_OFFSETS = { dot:[6,6], ring:[9,9], custom:[0,0] };

function setCursorStyle(style){
  if(!_CS_STYLES.includes(style)) style='dot';
  _CS_STYLES.forEach(s=>document.body.classList.remove('cs-'+s));
  document.body.classList.add('cs-'+style);
  localStorage.setItem('bs_cursor_style', style);
  _CS_STYLES.forEach(s=>{
    const btn=document.getElementById('csbtn-'+s);
    if(btn) btn.classList.toggle('cs-active', s===style);
  });
  const inp=document.getElementById('customCursorInput');
  if(inp) inp.style.display = style==='custom'?'flex':'none';
  const basic=document.getElementById('basicCursorControls');
  if(basic) basic.style.display = (style==='dot'||style==='ring')?'flex':'none';
  const cur=document.getElementById('cursor');
  if(!cur) return;
  if(style==='dot'||style==='ring'){
    const size=parseInt(localStorage.getItem('bs_dot_size')||'12');
    cur.style.width=size+'px'; cur.style.height=size+'px';
    cur.style.backgroundImage=''; cur.style.borderRadius= style==='dot'?'50%':'50%';
    window._cursorOffset=[size/2,size/2];
  }
  if(style==='custom'){
    const data=localStorage.getItem('bs_cursor_data');
    const size=parseInt(localStorage.getItem('bs_cursor_size')||'32');
  if(data){ cur.style.cssText+=`;background-image:url('${data}');background-size:cover;background-repeat:no-repeat;background-color:transparent;border-radius:50%;border:none;width:${size}px;height:${size}px;`; }
    window._cursorOffset=[size/2, size/2];
  } else {
    cur.style.backgroundImage=''; cur.style.backgroundSize=''; cur.style.backgroundRepeat=''; cur.style.backgroundColor='';
    window._cursorOffset=_CS_OFFSETS[style]||[6,6];
  }
}

function _applyCustomCursorData(dataUrl){
  const size=parseInt(localStorage.getItem('bs_cursor_size')||'32');
  localStorage.setItem('bs_cursor_data', dataUrl);
  const cur=document.getElementById('cursor');
  if(cur && document.body.classList.contains('cs-custom')){
    cur.style.backgroundImage=`url('${dataUrl}')`;
    cur.style.backgroundSize='cover';
    cur.style.backgroundRepeat='no-repeat';
    cur.style.backgroundColor='transparent';
    cur.style.borderRadius='50%';
    cur.style.border='none';
    cur.style.width=size+'px';
    cur.style.height=size+'px';
  }
  window._cursorOffset=[size/2,size/2];
  // update thumb preview
  const thumb=document.getElementById('customCursorThumb');
  if(thumb) thumb.innerHTML=`<img src="${dataUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" />`;
}

function loadCustomCursorFile(input){
  const file=input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{ _applyCustomCursorData(e.target.result); setCursorStyle('custom'); };
  reader.readAsDataURL(file);
}

function applyCustomCursorUrl(url){
  if(!url||!url.startsWith('http')) return;
  // Convert to dataURL via canvas to avoid CORS issues where possible
  const img=new Image();
  img.crossOrigin='anonymous';
  img.onload=()=>{
    try{
      const c=document.createElement('canvas');
      c.width=img.naturalWidth; c.height=img.naturalHeight;
      c.getContext('2d').drawImage(img,0,0);
      _applyCustomCursorData(c.toDataURL());
    } catch(e){
      // fallback: use URL directly
      _applyCustomCursorData(url);
    }
    setCursorStyle('custom');
  };
  img.onerror=()=>{ toast('تعذّر تحميل الصورة — جرّب رفعها من جهازك','error'); };
  img.src=url;
}

function resizeCustomCursor(val){
  const size=parseInt(val)||32;
  localStorage.setItem('bs_cursor_size', size);
  const label=document.getElementById('customCursorSizeLabel');
  if(label) label.textContent=size+'px';
  const cur=document.getElementById('cursor');
  if(cur && document.body.classList.contains('cs-custom')){
    cur.style.width=size+'px'; cur.style.height=size+'px';
  }
  window._cursorOffset=[size/2,size/2];
}

function resizeBasicCursor(val){
  const size=parseInt(val)||12;
  localStorage.setItem('bs_dot_size', size);
  const label=document.getElementById('basicCursorSizeLabel');
  if(label) label.textContent=size+'px';
  const cur=document.getElementById('cursor');
  if(!cur) return;
  const style=localStorage.getItem('bs_cursor_style')||'dot';
  if(style==='dot'){ cur.style.width=size+'px'; cur.style.height=size+'px'; window._cursorOffset=[size/2,size/2]; }
  else if(style==='ring'){ cur.style.width=size+'px'; cur.style.height=size+'px'; window._cursorOffset=[size/2,size/2]; }
}

function toggleCursorRing(){
  const hidden = localStorage.getItem('bs_ring_hidden')==='1';
  const newVal = hidden ? '0' : '1';
  localStorage.setItem('bs_ring_hidden', newVal);
  const ring=document.getElementById('cursor-ring');
  if(ring) ring.style.display = newVal==='1' ? 'none' : '';
  // sync all toggles
  [['ringToggleBtn','ringToggleThumb','ringToggleLabel'],['ringToggleBtnCustom','ringToggleThumbCustom','ringToggleLabelCustom']].forEach(([btnId,thumbId,lblId])=>{
    const btn=document.getElementById(btnId);
    const thumb=document.getElementById(thumbId);
    const lbl=document.getElementById(lblId);
    if(btn) btn.style.background = newVal==='1' ? 'var(--border2)' : 'var(--sky)';
    if(thumb){ thumb.style.left = newVal==='1' ? '' : '3px'; thumb.style.right = newVal==='1' ? '3px' : ''; }
    if(lbl) lbl.textContent = newVal==='1' ? 'مخفية' : 'ظاهرة';
  });
}

function _initRingVisibility(){
  if(localStorage.getItem('bs_ring_hidden')==='1'){
    const ring=document.getElementById('cursor-ring');
    if(ring) ring.style.display='none';
  }
}
_initRingVisibility();

function applyCustomCursor(){}  // legacy stub

function _initCursorStyle(){
  const saved=localStorage.getItem('bs_cursor_style')||'dot';
  setCursorStyle(saved);
  window._cursorOffset=_CS_OFFSETS[saved]||[6,6];
}
_initCursorStyle();
