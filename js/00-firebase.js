// ══════════════════════════════════════════════
// FIREBASE — تهيئة الاتصال (مصادقة + قاعدة بيانات سحابية)
// ══════════════════════════════════════════════
// إعدادات مشروع al-boushra. مفتاح الويب (apiKey) عام بطبيعته —
// الأمان الحقيقي يأتي من Firebase Authentication + قواعد Firestore.
const firebaseConfig = {
  apiKey: "AIzaSyBQHFDwyNUNPPToHyrYMwx-OZLqQcWn_ho",
  authDomain: "al-boushra.firebaseapp.com",
  projectId: "al-boushra",
  storageBucket: "al-boushra.firebasestorage.app",
  messagingSenderId: "412254115808",
  appId: "1:412254115808:web:5412b463c521d16f3c7d85",
  measurementId: "G-8MF18ZP24M"
};

// متاحة عالمياً لباقي الوحدات
let fbAuth = null, fbDb = null, fbReady = false;

try {
  firebase.initializeApp(firebaseConfig);
  fbAuth = firebase.auth();
  fbDb = firebase.firestore();
  fbReady = true;
  // إبقاء الجلسة محفوظة على الجهاز (يفضل الدخول حتى بعد إغلاق المتصفح)
  fbAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(e){
    console.warn('Firebase persistence:', e && e.message);
  });
} catch (e) {
  console.error('⚠️ تعذّر تهيئة Firebase:', e && e.message);
  fbReady = false;
}
