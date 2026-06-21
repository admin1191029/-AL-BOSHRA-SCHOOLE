// ══════════════════════════════════════════════════════════════
// 🔑 LICENSE SYSTEM — نظام التفعيل بمفتاح لمرة واحدة عبر Google Sheets
// ══════════════════════════════════════════════════════════════

// Google Apps Script endpoint for license validation (JSONP via cb=...&key=...)
const _GS_URL="https://script.google.com/macros/s/AKfycbwoTjpgaBqadcSeHEQdz2kzGH4kaN9KQ_y9xNrQuQ3NcCxO_Zftl79ibXWwMYfusivDsA/exec";
const _GS_SECRET=(()=>{const _x=['616c62','757368','72615f','323032','355f76','657269','6679'];return _x.map(x=>{let s='';for(let i=0;i<x.length;i+=2)s+=String.fromCharCode(parseInt(x.substr(i,2),16));return s;}).join('');})();
const _PH=(()=>{return ['30303030','30303030','34613731','61343063'].map(x=>{let s='';for(let i=0;i<x.length;i+=2)s+=String.fromCharCode(parseInt(x.substr(i,2),16));return s;}).join('');})();
const _SALT=(()=>{const _x=['616c62','757368','72615f','323032','355f73','656375','7265'];return _x.map(x=>{let s='';for(let i=0;i<x.length;i+=2)s+=String.fromCharCode(parseInt(x.substr(i,2),16));return s;}).join('');})();
const _LIC_SECRET=(()=>{return ['616c6275736872615f76656e646f725f','6c6963656e73655f7632'].map(x=>{let s='';for(let i=0;i<x.length;i+=2)s+=String.fromCharCode(parseInt(x.substr(i,2),16));return s;}).join('');})();

function _hashStr(str){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<str.length;i++){const ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+h1>>>0).toString(16).padStart(16,'0');}
function _normalizeLicenseKey(s){return String(s||'').replace(/\s+/g,'').toUpperCase();}
function _licChecksum(serial4){return _hashStr(_LIC_SECRET+serial4+_LIC_SECRET).slice(-8).toUpperCase();}
function _validateLicenseKey(raw){const k=_normalizeLicenseKey(raw);const m=/^ALB26-([A-Z0-9]{4})-([A-F0-9]{8})$/.exec(k);if(!m)return false;return _licChecksum(m[1])===m[2];}
function _gsSign(key){
  // توقيع بسيط متوافق مع Apps Script
  const raw=_GS_SECRET+key+_GS_SECRET;
  let h=0;for(let i=0;i<raw.length;i++){h=Math.imul(31,h)+raw.charCodeAt(i)|0;}
  const h2=_hashStr(raw);
  return h2.slice(0,16);
}
function _savePass(h){try{localStorage.setItem('bs_pass',h);}catch(e){}try{sessionStorage.setItem('bs_pass',h);}catch(e){}}
function _loadPass(){try{const v=localStorage.getItem('bs_pass');if(v)return v;}catch(e){}try{const v=sessionStorage.getItem('bs_pass');if(v)return v;}catch(e){}return null;}
function _saveLicenseKey(k){try{localStorage.setItem('bs_license',k);}catch(e){}try{sessionStorage.setItem('bs_license',k);}catch(e){}}
function _loadLicenseKey(){try{const v=localStorage.getItem('bs_license');if(v)return v;}catch(e){}try{const v=sessionStorage.getItem('bs_license');if(v)return v;}catch(e){}return null;}

function checkLicense(){
  const lic=_loadLicenseKey();
  if(lic&&_validateLicenseKey(lic)){
    document.getElementById('licenseScreen').style.display='none';
    return true;
  }
  const saved=_loadPass();
  if(saved&&saved===_PH){
    document.getElementById('licenseScreen').style.display='none';
    return true;
  }
  document.getElementById('licenseScreen').style.display='flex';
  document.getElementById('loginScreen').style.display='none';
  const _li=document.getElementById('licLogoImg');if(_li)_li.src=SCHOOL_LOGO;
  return false;
}

async function activateLicense(){
  const input=document.getElementById('licKeyInput')?.value.trim();
  const errEl=document.getElementById('licError');
  const expEl=document.getElementById('licExpiry');
  const btn=document.querySelector('.lic-btn');
  errEl.style.display='none';
  expEl.style.display='none';
  if(!input){errEl.textContent='أدخل مفتاح الترخيص';errEl.style.display='block';return;}
  const norm=_normalizeLicenseKey(input);

  // تحقق من صيغة المفتاح أولاً
  if(!_validateLicenseKey(norm)){
    // جرب كلمة السر القديمة
    const hashed=_hashStr(_SALT+input+_SALT);
    if(hashed!==_PH){
      errEl.textContent='❌ المفتاح غير صحيح';
      errEl.style.display='block';
      try{SFX.play('wrong');}catch(e){}
      return;
    }
    _savePass(hashed);
    try{localStorage.removeItem('bs_license');sessionStorage.removeItem('bs_license');}catch(e){}
    expEl.textContent='✅ تم الدخول بنجاح';
    expEl.style.display='block';
    try{SFX.play('confetti');}catch(e){}
    setTimeout(()=>{document.getElementById('licenseScreen').style.display='none';document.getElementById('loginScreen').style.display='flex';},1200);
    return;
  }

  // المفتاح صيغته صحيحة — تحقق من Google Sheets عبر JSONP
  if(btn){btn.textContent='⏳ جاري التحقق...';btn.disabled=true;}
  try{
    const data=await new Promise((resolve,reject)=>{
      const cbName='_gscb_'+Date.now();
      const script=document.createElement('script');
      const timer=setTimeout(()=>{delete window[cbName];script.remove();reject(new Error('TIMEOUT'));},12000);
      window[cbName]=function(d){clearTimeout(timer);delete window[cbName];script.remove();resolve(d);};
      script.src=_GS_URL+'?cb='+cbName+'&key='+encodeURIComponent(norm);
      script.onerror=()=>{clearTimeout(timer);delete window[cbName];script.remove();reject(new Error('SCRIPT_ERROR'));};
      document.head.appendChild(script);
    });
    if(btn){btn.textContent='تفعيل الترخيص';btn.disabled=false;}

    if(data.ok){
      // المفتاح صالح وتم حذفه من الشيت
      _saveLicenseKey(norm);
      // تأكد إن المتصفح فعلا سمح بالتخزين المحلي (بعض الخصوصية/الحظر يمنع localStorage)
      const stored = _loadLicenseKey();
      const storageOk = stored && stored === norm;
      try{localStorage.removeItem('bs_pass');sessionStorage.removeItem('bs_pass');}catch(e){}
      expEl.textContent=storageOk
        ? '✅ تم تفعيل الترخيص بنجاح'
        : '✅ تم تفعيل الترخيص بنجاح (لكن التخزين المحلي غير متاح)';
      expEl.style.display='block';
      try{SFX.play('confetti');}catch(e){}
      setTimeout(()=>{document.getElementById('licenseScreen').style.display='none';document.getElementById('loginScreen').style.display='flex';},1200);
    } else if(data.err==='NOT_FOUND'){
      errEl.textContent='❌ هذا المفتاح مستخدم مسبقاً أو غير موجود';
      errEl.style.display='block';
      try{SFX.play('wrong');}catch(e){}
    } else if(data.err==='INVALID_SIG'){
      errEl.textContent='❌ خطأ في التحقق — حاول مجدداً';
      errEl.style.display='block';
    } else {
      errEl.textContent='❌ خطأ في الخادم — حاول مجدداً';
      errEl.style.display='block';
    }
  } catch(e){
    if(btn){btn.textContent='تفعيل الترخيص';btn.disabled=false;}
    errEl.textContent='❌ تعذّر الاتصال: ' + (e && e.message ? e.message : 'حاول مرة أخرى');
    errEl.style.display='block';
    try{SFX.play('wrong');}catch(e2){}
  }
}