// ══════════════════════════════════════════════════════════════
// 🎮 CLASSROOM GAMES ENGINE
// ══════════════════════════════════════════════════════════════

// ── Default starter questions ──────────────────────────────
const GAMES_DEFAULT = {
  quiz: [
    { q:'ما عدد حروف اللغة العربية؟', choices:['٢٦','٢٨','٣٠','٣٢'], ans:1 },
    { q:'أيّ حرف يأتي بعد حرف الدال؟', choices:['ذال','راء','زاي','سين'], ans:0 },
    { q:'كم عدد أيام الأسبوع؟', choices:['خمسة','ستة','سبعة','ثمانية'], ans:2 },
    { q:'ما اسم عاصمة المملكة العربية السعودية؟', choices:['جدة','الرياض','مكة','الدمام'], ans:1 },
    { q:'أيّ الكلمات التالية تبدأ بحرف ب؟', choices:['تفاحة','برتقالة','جوافة','ليمون'], ans:1 },
  ],
  hot: [
    { q:'اذكر ثلاثة أسماء حيوانات' },
    { q:'ما معنى كلمة "شجاع"؟' },
    { q:'اذكر يوماً من أيام الأسبوع' },
    { q:'ما عكس كلمة كبير؟' },
    { q:'اذكر ثلاثة ألوان' },
    { q:'ما الفاكهة التي تكون صفراء؟' },
  ],
  race: [
    { q:'ما عدد أصابع اليد الواحدة؟', ans:'خمسة أصابع' },
    { q:'ما الحرف الأول من الأبجدية؟', ans:'ألف' },
    { q:'أيّ الفصول يكون دافئاً؟', ans:'الربيع والصيف' },
    { q:'ما لون السماء في النهار؟', ans:'أزرق' },
    { q:'كم يوماً في الشهر غالباً؟', ans:'ثلاثون يوماً' },
  ],
  word: [
    { word:'كتاب', hint:'تقرأ فيه', hidden:[1,3] },
    { word:'مدرسة', hint:'تذهب إليها كل يوم', hidden:[0,2,4] },
    { word:'قلم', hint:'تكتب به', hidden:[1] },
    { word:'شمس', hint:'تضيء النهار', hidden:[0,2] },
    { word:'بيت', hint:'تسكن فيه', hidden:[1] },
    { word:'سماء', hint:'فوقنا', hidden:[0,2] },
  ],
  imgquiz: [],  // صور يضيفها المعلم من بنك الأسئلة
  versus: [
    { q:'ما عدد أصابع اليدين معاً؟', ans:'عشرة' },
    { q:'ما عكس كلمة كبير؟', ans:'صغير' },
    { q:'ما اسم عاصمة المملكة؟', ans:'الرياض' },
    { q:'كم يوماً في الأسبوع؟', ans:'سبعة' },
    { q:'ما الحرف الذي يأتي بعد الألف؟', ans:'الباء' },
    { q:'ما لون العشب؟', ans:'أخضر' },
    { q:'كم شهراً في السنة؟', ans:'اثنا عشر شهراً' },
    { q:'ما عكس النهار؟', ans:'الليل' },
  ],
  opposite: [
    { word:'كبير', opposite:'صغير' },
    { word:'سريع', opposite:'بطيء' },
    { word:'قريب', opposite:'بعيد' },
    { word:'طويل', opposite:'قصير' },
    { word:'ثقيل', opposite:'خفيف' },
    { word:'جميل', opposite:'قبيح' },
    { word:'ساخن', opposite:'بارد' },
    { word:'قديم', opposite:'جديد' },
    { word:'صعب', opposite:'سهل' },
    { word:'فرح', opposite:'حزين' },
    { word:'نظيف', opposite:'وسخ' },
    { word:'قوي', opposite:'ضعيف' },
  ]
};

// ── CM.games state ──────────────────────────────────────────
function cmGamesInit(){
  if(!CM.games){
    CM.games = {
      activeGame: 'quiz',
      quizIdx: 0,
      quizRevealed: false,
      quizScore: 0,        // عدد الإجابات الصحيحة في الجولة
      quizAnswered: 0,     // عدد الأسئلة التي تمت الإجابة عليها
      quizSessionDone: false, // هل انتهت الجولة؟
      QUIZ_SESSION_LEN: 5, // عدد أسئلة الجولة
      hotIdx: 0,
      hotStudentIdx: 0,
      hotResult: null,
      _hotNextAction: null,
      raceScores: {},
      wordIdx: 0,
      wordRevealed: false,
      imgquizIdx: 0,
      imgquizRevealed: false,
      versusIdx: 0,
      versusScores: { a:0, b:0 },
      versusRevealed: false,
      oppositeIdx: 0,
      oppositeRevealed: false,
      oppositeChain: [],   // سلسلة الإجابات الصحيحة المتتالية
      // load from S or defaults (filter deleted defaults)
      questions: (()=>{
        const del = S.gamesBank?._deleted || {};
        const mg = (t) => [
          ...(S.gamesBank?.[t]||[]),
          ...( GAMES_DEFAULT[t]||[] ).filter((_,i)=>!(del[t]||[]).includes(i))
        ];
        return {
          quiz:mg('quiz'), hot:mg('hot'), race:mg('race'),
          word:mg('word'), imgquiz:mg('imgquiz'),
          versus:mg('versus'), opposite:mg('opposite')
        };
      })()
    };
    // init race scores
    S.students.forEach(s=>{ CM.games.raceScores[s.id] = 0; });
  }
}

function cmSelectGame(game){
  if(!CM.games) cmGamesInit();
  CM.games.activeGame = game;
  document.querySelectorAll('.cm-game-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('cgBtn-'+game)?.classList.add('active');
  cmRenderGame(game);
}

function cmRenderGame(game){
  const el = document.getElementById('cmGamesMain');
  if(!el) return;
  if(!CM.games) cmGamesInit();
  const g = CM.games;
  const qs = g.questions[game] || [];

  if(game === 'quiz')    el.innerHTML = cmBuildQuiz(qs);
  if(game === 'hot')     el.innerHTML = cmBuildHot(qs);
  if(game === 'race')    el.innerHTML = cmBuildRace(qs);
  if(game === 'word')    el.innerHTML = cmBuildWord(qs);
  if(game === 'imgquiz') el.innerHTML = cmBuildImgQuiz(qs);
  if(game === 'versus')  el.innerHTML = cmBuildVersus(qs);
  if(game === 'opposite')el.innerHTML = cmBuildOpposite(qs);
}

// ── GAME 1: من سيربح المليون ────────────────────────────────
function cmBuildQuiz(qs){
  if(!qs.length) return `<div style="color:rgba(255,255,255,0.35);text-align:center;padding:40px">لا توجد أسئلة — أضف من بنك الأسئلة</div>`;
  const g = CM.games;
  const N = g.QUIZ_SESSION_LEN || 5;
  const sessionQs = qs.slice(0, N); // أول N سؤال من القائمة

  // ── شاشة النهاية ────────────────────────────────────────
  if(g.quizSessionDone) return cmBuildQuizFinale(sessionQs);

  const qPos = g.quizIdx % sessionQs.length; // موضع السؤال داخل الجولة
  const q = sessionQs[qPos];
  const letters = ['أ','ب','ج','د'];
  if(!g.quizHidden) g.quizHidden = new Set();
  const used50 = g.quiz50Used || false;

  const choicesHTML = q.choices ? `<div class="cg-choices">
    ${q.choices.map((c,i)=>{
      if(g.quizHidden.has(i)) return `<div class="cg-choice cg-choice-hidden" id="cgChoice_${i}"><span style="font-size:1.4rem;opacity:0.20">✕</span></div>`;
      return `<div style="position:relative;display:flex;align-items:stretch;gap:0;">
        <button class="cg-choice" id="cgChoice_${i}" onclick="cmQuizReveal(${i},${q.ans})" style="flex:1;border-radius:${g.quizRevealed?'13px':'13px 0 0 13px'};">
          <span class="cg-choice-label">${letters[i]}</span> ${c}
        </button>
        ${!g.quizRevealed ? `<button class="cg-remove-btn" onclick="cmQuizRemoveChoice(${i})" title="احذف هذا الخيار">✕</button>` : ''}
      </div>`;
    }).join('')}
  </div>` : `<button class="cm-btn cm-btn-primary" style="margin:16px auto 0;display:block" onclick="cmQuizRevealOpen()">🔍 عرض الإجابة</button>`;

  // شريط تقدم الجولة
  const progressDots = Array.from({length:N},(_,i)=>{
    const cls = i < g.quizAnswered ? (g.quizAnswers?.[i] ? 'cg-dot-correct' : 'cg-dot-wrong') : (i===qPos?'cg-dot-current':'cg-dot-empty');
    return `<div class="cg-progress-dot ${cls}"></div>`;
  }).join('');

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="font-size:0.84rem;color:rgba(255,255,255,0.45);font-weight:700">السؤال ${qPos+1} من ${N}</div>
      <div style="display:flex;gap:5px;align-items:center;">${progressDots}</div>
      <div style="font-size:0.84rem;font-weight:900;color:var(--mint)">✅ ${g.quizScore||0}</div>
    </div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;">
      ${q.choices && !g.quizRevealed ? `
        <button class="cm-btn ${used50?'cg-used':'cm-btn-ghost'}" style="padding:6px 14px;font-size:0.82rem;${used50?'opacity:0.4;pointer-events:none;':''}" onclick="cmQuiz50()">🚨 50/50</button>` : ''}
      <button class="cm-btn cm-btn-ghost" style="padding:6px 14px;font-size:0.80rem" onclick="cmQuizShuffle()">🔀 خلط</button>
    </div>
  </div>
  <div class="cg-question-card">
    <div class="cg-question-num">🎯 من سيربح المليون</div>
    <div class="cg-question-text">${q.q}</div>
    ${choicesHTML}
  </div>
  ${q.choices && g.quizRevealed ? `
    <div class="cg-result">
      <div class="cg-result-emoji">🎉</div>
      <div class="cg-result-title">الإجابة الصحيحة</div>
      <div class="cg-result-sub" style="font-size:1.2rem;color:var(--mint);font-weight:800;margin-top:4px;">${q.choices[q.ans]}</div>
      ${qPos < N-1 ? `<button class="cm-btn cm-btn-primary" style="margin-top:14px;padding:10px 28px;font-size:1rem" onclick="cmQuizNext()">السؤال التالي ←</button>` 
                   : `<button class="cm-btn cm-btn-primary" style="margin-top:14px;padding:10px 28px;font-size:1rem;background:linear-gradient(135deg,var(--gold),var(--ember))" onclick="cmQuizShowFinale()">🏆 عرض النتائج</button>`}
    </div>` : ''}
  `;
}

function cmBuildQuizFinale(sessionQs){
  const g = CM.games;
  const N = sessionQs.length;
  const score = g.quizScore || 0;
  const pct = Math.round(score/N*100);

  // تحديد الميدالية والرسالة
  let medal, msg, color, bg;
  if(pct===100){
    medal='🏆'; msg='مثالي! أجبت على كل الأسئلة بشكل صحيح!';
    color='#fbbf24'; bg='rgba(245,158,11,0.15)';
  } else if(pct>=80){
    medal='🥇'; msg='ممتاز جداً! أداء رائع!';
    color='#fbbf24'; bg='rgba(245,158,11,0.12)';
  } else if(pct>=60){
    medal='🥈'; msg='جيد جداً! استمر في التحسن!';
    color='rgba(255,255,255,0.70)'; bg='rgba(255,255,255,0.07)';
  } else if(pct>=40){
    medal='🥉'; msg='جيد! نتدرب أكثر في المرة القادمة.';
    color='#cd7f32'; bg='rgba(205,127,50,0.12)';
  } else {
    medal='💪'; msg='لا بأس! المحاولة تُعلّم — هيا نحاول مرة أخرى!';
    color='rgba(255,255,255,0.50)'; bg='rgba(255,255,255,0.05)';
  }

  // قائمة الأسئلة مع النتائج
  const reviewRows = sessionQs.map((q,i)=>{
    const correct = g.quizAnswers?.[i];
    const answered = g.quizAnswers && g.quizAnswers[i] !== undefined;
    const icon = !answered ? '⬜' : correct ? '✅' : '❌';
    const ansText = q.choices ? q.choices[q.ans] : '—';
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:10px;background:${correct?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.06)'};border:1px solid ${correct?'rgba(16,185,129,0.20)':'rgba(239,68,68,0.15)'};margin-bottom:7px;">
      <div style="font-size:1.2rem;flex-shrink:0">${icon}</div>
      <div style="flex:1;">
        <div style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.85)">${q.q}</div>
        <div style="font-size:0.84rem;color:${correct?'var(--mint)':'rgba(255,255,255,0.40)'};margin-top:3px;">الإجابة: ${ansText}</div>
      </div>
    </div>`;
  }).join('');

  return `
  <div style="text-align:center;padding:20px 0 16px;animation:popIn 0.5s cubic-bezier(0.34,1.56,0.64,1);">
    <div style="font-size:5rem;margin-bottom:8px;animation:starFloat 1.5s ease-in-out infinite alternate">${medal}</div>
    <div style="font-size:2.8rem;font-weight:900;color:${color};letter-spacing:-1px;line-height:1">${score} / ${N}</div>
    <div style="font-size:1.3rem;font-weight:700;color:rgba(255,255,255,0.60);margin:6px 0 4px">${pct}% صحيح</div>
    <div style="font-size:1rem;color:rgba(255,255,255,0.45);max-width:400px;margin:0 auto 20px">${msg}</div>
    
    <!-- نقاط نتيجة كل سؤال -->
    <div style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;">
      ${Array.from({length:N},(_,i)=>`
        <div style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;background:${g.quizAnswers?.[i]?'rgba(16,185,129,0.20)':'rgba(239,68,68,0.15)'};border:2px solid ${g.quizAnswers?.[i]?'rgba(16,185,129,0.40)':'rgba(239,68,68,0.30)'}">
          ${g.quizAnswers?.[i]?'✅':'❌'}
        </div>`).join('')}
    </div>
  </div>

  <!-- مراجعة الأسئلة -->
  <div style="max-height:260px;overflow-y:auto;margin-bottom:16px;">${reviewRows}</div>

  <!-- أزرار -->
  <div style="display:flex;gap:10px;justify-content:center;">
    <button class="cm-btn cm-btn-primary" style="font-size:1rem;padding:12px 28px" onclick="cmQuizRestart()">
      🔄 جولة جديدة
    </button>
    <button class="cm-btn cm-btn-ghost" style="font-size:1rem;padding:12px 20px" onclick="cmQuizShuffle()">
      🔀 خلط وإعادة
    </button>
  </div>`;
}

function cmQuizShowFinale(){
  CM.games.quizSessionDone = true;
  cmRenderGame('quiz');
  confetti(); SFX.play('finish');
}

function cmQuizRestart(){
  const g = CM.games;
  g.quizIdx = 0;
  g.quizScore = 0;
  g.quizAnswered = 0;
  g.quizAnswers = {};
  g.quizSessionDone = false;
  g.quizRevealed = false;
  g.quizHidden = new Set();
  g.quiz50Used = false;
  cmRenderGame('quiz');
}

function cmQuizRemoveChoice(idx){
  if(!CM.games.quizHidden) CM.games.quizHidden = new Set();
  // Can't remove the correct answer
  const qs = CM.games.questions.quiz;
  const q  = qs[CM.games.quizIdx % qs.length];
  if(idx === q.ans){ toast('لا يمكن حذف الإجابة الصحيحة!','error'); return; }
  if(CM.games.quizHidden.has(idx)){ CM.games.quizHidden.delete(idx); }
  else { CM.games.quizHidden.add(idx); }
  cmRenderGame('quiz');
}

function cmQuiz50(){
  if(CM.games.quiz50Used) return;
  const qs = CM.games.questions.quiz;
  const q  = qs[CM.games.quizIdx % qs.length];
  if(!q.choices) return;
  if(!CM.games.quizHidden) CM.games.quizHidden = new Set();
  // Pick 2 wrong answers randomly and hide them
  const wrongs = [0,1,2,3].filter(i=> i !== q.ans && !CM.games.quizHidden.has(i));
  const toHide = wrongs.sort(()=>Math.random()-0.5).slice(0,2);
  toHide.forEach(i=> CM.games.quizHidden.add(i));
  CM.games.quiz50Used = true;
  cmRenderGame('quiz');
  toast('🚨 تم حذف خيارين خاطئين!','info');
}

function cmQuizReveal(chosen, correct){
  const g = CM.games;
  const isCorrect = chosen === correct;
  const N = g.QUIZ_SESSION_LEN || 5;
  const sessionQs = g.questions.quiz.slice(0, N);
  const qPos = g.quizIdx % sessionQs.length;
  if(!g.quizAnswers) g.quizAnswers = {};
  // Only record if not already answered
  if(g.quizAnswers[qPos] === undefined){
    g.quizAnswers[qPos] = isCorrect;
    if(isCorrect) g.quizScore = (g.quizScore||0) + 1;
    g.quizAnswered = (g.quizAnswered||0) + 1;
  }
  document.querySelectorAll('.cg-choice:not(.cg-choice-hidden)').forEach(btn=>{
    const i = parseInt(btn.id.replace('cgChoice_',''));
    if(isNaN(i)) return;
    if(i===correct) btn.classList.add('correct');
    else if(i===chosen && !isCorrect) btn.classList.add('wrong');
    btn.onclick=null;
  });
  document.querySelectorAll('.cg-remove-btn').forEach(b=>b.remove());
  g.quizRevealed = true;
  if(isCorrect) confetti();
  cmRenderGame('quiz');
}

function cmQuizRevealOpen(){
  CM.games.quizRevealed = true;
  cmRenderGame('quiz');
}

function cmQuizNext(){
  const g = CM.games;
  const N = g.QUIZ_SESSION_LEN || 5;
  const sessionQs = g.questions.quiz.slice(0, N);
  const qPos = g.quizIdx % sessionQs.length;
  if(qPos >= N - 1){ cmQuizShowFinale(); return; }
  g.quizIdx++;
  g.quizRevealed = false;
  g.quizHidden = new Set();
  g.quiz50Used = false;
  cmRenderGame('quiz');
}

function cmQuizPrev(){
  CM.games.quizIdx = Math.max(0, CM.games.quizIdx-1);
  CM.games.quizRevealed = false;
  CM.games.quizHidden = new Set();
  CM.games.quiz50Used = false;
  cmRenderGame('quiz');
}

function cmQuizShuffle(){
  CM.games.questions.quiz = CM.games.questions.quiz.sort(()=>Math.random()-0.5);
  cmQuizRestart();
  toast('🔀 تم خلط الأسئلة','info');
}

// ── GAME 2: الكرسي الساخن ───────────────────────────────────
function cmBuildHot(qs){
  if(!qs.length || !S.students.length) return `<div style="color:rgba(255,255,255,0.35);text-align:center;padding:40px">لا توجد أسئلة أو طلاب</div>`;
  const g = CM.games;

  // ── شاشة النتيجة بعد الإجابة ─────────────────────────
  if(g.hotResult){
    const r = g.hotResult;
    const s = S.students[r.studentIdx % S.students.length];
    const photoEl = s.photo
      ? `<img src="${s.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ${r.type==='yes'?'rgba(16,185,129,0.60)':'rgba(245,158,11,0.40)'};margin-bottom:8px;"/>`
      : `<div style="width:80px;height:80px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;border:3px solid ${r.type==='yes'?'rgba(16,185,129,0.60)':'rgba(245,158,11,0.40)'};margin:0 auto 8px;">${s.name.charAt(0)}</div>`;
    return `
    <div class="cg-chair-display">
      <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:1px">💣 الكرسي الساخن</div>
      ${photoEl}
      <div class="cg-chair-student">${s.name}</div>
      ${r.type==='yes'
        ? `<div style="font-size:2.5rem;font-weight:900;color:var(--mint);text-align:center;animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)">✅ أجاب صح! 🌟</div>
           <div style="font-size:0.88rem;color:rgba(255,255,255,0.40);margin-top:4px;">يكمل في الكرسي — سؤال جديد</div>`
        : r.type==='no'
          ? `<div style="font-size:2rem;font-weight:900;color:var(--gold);text-align:center;">لا بأس 💪</div>
             <div style="font-size:0.88rem;color:rgba(255,255,255,0.40);margin-top:4px;">دور الطالب التالي</div>`
          : `<div style="font-size:2rem;font-weight:900;color:rgba(255,255,255,0.50);text-align:center;">⏭ مرّر</div>`
      }
      <button class="cg-chair-btn yes" style="font-size:1.1rem;padding:14px 36px;margin-top:8px" onclick="cmHotConfirmNext()">
        التالي →
      </button>
    </div>`;
  }

  // ── شاشة السؤال الرئيسية ──────────────────────────────
  const q = qs[g.hotIdx % qs.length];
  const s = S.students[g.hotStudentIdx % S.students.length];
  const photoEl = s.photo
    ? `<img src="${s.photo}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid rgba(239,68,68,0.40);margin-bottom:8px;"/>`
    : `<div style="width:80px;height:80px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;border:3px solid rgba(239,68,68,0.40);margin:0 auto 8px;">${s.name.charAt(0)}</div>`;
  return `
  <div class="cg-chair-display">
    <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:1px">💣 الكرسي الساخن</div>
    ${photoEl}
    <div class="cg-chair-student">${s.name}</div>
    <div class="cg-chair-question">${q.q}</div>
    <div class="cg-chair-btns">
      <button class="cg-chair-btn yes"  onclick="cmHotAnswer(true)">✅ أجاب</button>
      <button class="cg-chair-btn pass" onclick="cmHotAnswer(null)">⏭ مرّر</button>
      <button class="cg-chair-btn no"   onclick="cmHotAnswer(false)">❌ لم يجب</button>
    </div>
    <div style="display:flex;gap:10px;margin-top:8px;">
      <button class="cm-btn cm-btn-ghost" style="font-size:0.80rem" onclick="cmHotNextQ()">سؤال جديد 🎲</button>
      <button class="cm-btn cm-btn-ghost" style="font-size:0.80rem" onclick="cmHotNextStudent()">طالب آخر 👤</button>
    </div>
  </div>`;
}

function cmHotAnswer(correct){
  const g = CM.games;
  const s = S.students[g.hotStudentIdx % S.students.length];

  if(correct === true){
    // ✅ أجاب صح — نقطة + نفس الطالب + سؤال جديد مباشرة
    if(!CM.games.raceScores[s.id]) CM.games.raceScores[s.id]=0;
    CM.games.raceScores[s.id]++;
    confetti(); SFX.play('point');
    g.hotResult = { type:'yes', studentIdx: g.hotStudentIdx, keepStudent: true };
    g._hotNextAction = 'newQ'; // نفس الطالب، سؤال جديد

  } else if(correct === false){
    // ❌ لم يجب — طالب جديد + سؤال جديد
    SFX.play('wrong');
    g.hotResult = { type:'no', studentIdx: g.hotStudentIdx, keepStudent: false };
    g._hotNextAction = 'newStudent';

  } else {
    // ⏭ مرّر — طالب جديد فوراً بدون شاشة وسيطة
    SFX.play('pass');
    g.hotStudentIdx++;
    g.hotIdx++;
    g.hotResult = null;
    cmRenderGame('hot');
    return;
  }
  cmRenderGame('hot');
}

function cmHotConfirmNext(){
  const g = CM.games;
  g.hotResult = null;
  if(g._hotNextAction === 'newQ'){
    g.hotIdx++; // سؤال جديد، نفس الطالب — hotStudentIdx لا يتغير
  } else {
    g.hotStudentIdx++; // طالب جديد
    g.hotIdx++;
  }
  g._hotNextAction = null;
  cmRenderGame('hot');
}

function cmHotNextQ(){
  CM.games.hotIdx++;
  CM.games.hotResult = null;
  cmRenderGame('hot');
}
function cmHotNextStudent(){
  CM.games.hotStudentIdx++;
  CM.games.hotIdx++;
  CM.games.hotResult = null;
  cmRenderGame('hot');
}

// ── GAME 3: سباق الإجابات ───────────────────────────────────
function cmBuildRace(qs){
  if(!qs.length) return `<div style="color:rgba(255,255,255,0.35);text-align:center;padding:40px">لا توجد أسئلة</div>`;
  const g = CM.games;
  const q = qs[g.quizIdx % qs.length]; // reuse quizIdx for race
  return `
  <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">⏱️ سباق الإجابات — من يرفع يده أولاً يفوز</div>
  <div class="cg-race-question">${q.q}</div>
  <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
    <button class="cm-btn cm-btn-primary" onclick="cmRaceReveal()">🔍 عرض الإجابة</button>
    <button class="cm-btn cm-btn-ghost" onclick="cmRaceNext()">سؤال جديد →</button>
    <div id="cgRaceAnswer" style="font-size:1rem;font-weight:800;color:var(--mint);display:none;padding:8px 16px;background:rgba(16,185,129,0.10);border-radius:10px;border:1px solid rgba(16,185,129,0.25);">${q.ans||''}</div>
  </div>
  <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);font-weight:800;letter-spacing:1px;margin-bottom:8px">اضغط على الطالب لإعطائه نقطة</div>
  <div class="cg-race-scores">
    ${S.students.map(s=>{
      const pts = g.raceScores[s.id]||0;
      const photoEl = s.photo
        ? `<img src="${s.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;margin-bottom:5px;"/>`
        : `<div style="width:36px;height:36px;border-radius:50%;${avatarStyle(s.id)};color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;margin:0 auto 5px;">${s.name.charAt(0)}</div>`;
      return `<div class="cg-score-card" onclick="cmRaceAddPoint('${s.id}')" id="cgScore_${s.id}">
        ${photoEl}
        <div class="cg-score-name">${s.name.split(' ')[0]}</div>
        <div class="cg-score-pts">${pts}</div>
      </div>`;
    }).join('')}
  </div>
  <div style="margin-top:12px;">
    <button class="cm-btn cm-btn-ghost" style="font-size:0.78rem" onclick="cmRaceReset()">🔄 تصفير النقاط</button>
  </div>`;
}

function cmRaceReveal(){
  const el=document.getElementById('cgRaceAnswer');
  if(el) el.style.display='block';
}
function cmRaceNext(){
  CM.games.quizIdx++;
  document.getElementById('cgRaceAnswer') && (document.getElementById('cgRaceAnswer').style.display='none');
  cmRenderGame('race');
}
function cmRaceAddPoint(sid){
  if(!CM.games.raceScores[sid]) CM.games.raceScores[sid]=0;
  CM.games.raceScores[sid]++;
  const card=document.getElementById('cgScore_'+sid);
  if(card){
    card.classList.add('buzzing');
    card.querySelector('.cg-score-pts').textContent=CM.games.raceScores[sid];
    setTimeout(()=>card.classList.remove('buzzing'),400);
  }
  const s=S.students.find(x=>x.id===sid);
  toast(`⭐ ${s?.name} +1 نقطة`,'success');
}
function cmRaceReset(){
  S.students.forEach(s=>{ CM.games.raceScores[s.id]=0; });
  cmRenderGame('race');
}

// ── GAME 4: أكمل الكلمة ─────────────────────────────────────
function cmBuildWord(qs){
  if(!qs.length) return `<div style="color:rgba(255,255,255,0.35);text-align:center;padding:40px">لا توجد كلمات</div>`;
  const g = CM.games;
  const q = qs[g.wordIdx % qs.length];
  const hidden = q.hidden || [1];
  const displayed = q.word.split('').map((ch,i)=> hidden.includes(i)?'_':ch).join('  ');
  return `
  <div style="font-size:0.78rem;color:rgba(255,255,255,0.35);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">🔤 أكمل الكلمة — الكلمة ${(g.wordIdx%qs.length)+1} / ${qs.length}</div>
  <div class="cg-word-display">${displayed}</div>
  <div class="cg-word-hint">💡 تلميح: ${q.hint||'—'}</div>
  <div class="cg-word-reveal ${g.wordRevealed?'show':''}" id="cgWordReveal">✅ الكلمة: ${q.word}</div>
  <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">
    <button class="cm-btn cm-btn-primary" onclick="cmWordReveal()">🔍 أظهر الكلمة</button>
    <button class="cm-btn cm-btn-ghost" onclick="cmWordNext()">كلمة جديدة →</button>
    <button class="cm-btn cm-btn-ghost" onclick="cmWordPrev()">← السابقة</button>
    <button class="cm-btn cm-btn-ghost" onclick="cmWordShuffle()">🔀 خلط</button>
  </div>`;
}

function cmWordReveal(){
  SFX.play('reveal'); CM.games.wordRevealed=true;
  const el=document.getElementById('cgWordReveal');
  if(el){ el.classList.add('show'); }
  confetti();
}
function cmWordNext(){ CM.games.wordIdx++; CM.games.wordRevealed=false; cmRenderGame('word'); }
function cmWordPrev(){ CM.games.wordIdx=Math.max(0,CM.games.wordIdx-1); CM.games.wordRevealed=false; cmRenderGame('word'); }
function cmWordShuffle(){ CM.games.questions.word=CM.games.questions.word.sort(()=>Math.random()-0.5); CM.games.wordIdx=0; CM.games.wordRevealed=false; cmRenderGame('word'); toast('🔀 تم خلط الكلمات','info'); }

// ── GAME 6: فصلي ضد فصلي ────────────────────────────────────
function cmBuildVersus(qs){
  if(!qs.length) return `<div style="color:rgba(255,255,255,0.35);text-align:center;padding:40px">لا توجد أسئلة — أضف من بنك الأسئلة</div>`;
  const g = CM.games;
  const idx = g.versusIdx % qs.length;
  const q = qs[idx];
  const sa = g.versusScores.a || 0;
  const sb = g.versusScores.b || 0;

  // اسم الفريق من state أو افتراضي
  const nameA = g.versusNameA || '🔴 الفريق الأحمر';
  const nameB = g.versusNameB || '🔵 الفريق الأزرق';

  return `
  <!-- لوحة النتائج -->
  <div style="display:flex;align-items:stretch;gap:12px;margin-bottom:16px;">
    <div style="flex:1;background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,${sa>sb?'0.50':'0.20'});border-radius:16px;padding:14px;text-align:center;">
      <div style="font-size:0.80rem;font-weight:800;color:rgba(255,255,255,0.50);margin-bottom:4px;">${nameA}</div>
      <div style="font-size:3.5rem;font-weight:900;color:${sa>sb?'var(--ember)':'rgba(255,255,255,0.70)'};line-height:1">${sa}</div>
      <button class="cm-btn cm-btn-ghost" style="width:100%;justify-content:center;margin-top:10px;font-size:0.82rem;color:rgba(239,68,68,0.80);border-color:rgba(239,68,68,0.25);" onclick="cmVersusPoint('a')">
        ✅ نقطة للفريق
      </button>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;">
      <div style="font-size:1.5rem;font-weight:900;color:rgba(255,255,255,0.30)">VS</div>
      <div style="font-size:0.74rem;color:rgba(255,255,255,0.25);font-weight:700">${idx+1}/${qs.length}</div>
    </div>
    <div style="flex:1;background:rgba(66,165,245,0.12);border:2px solid rgba(66,165,245,${sb>sa?'0.50':'0.20'});border-radius:16px;padding:14px;text-align:center;">
      <div style="font-size:0.80rem;font-weight:800;color:rgba(255,255,255,0.50);margin-bottom:4px;">${nameB}</div>
      <div style="font-size:3.5rem;font-weight:900;color:${sb>sa?'var(--sky3)':'rgba(255,255,255,0.70)'};line-height:1">${sb}</div>
      <button class="cm-btn cm-btn-ghost" style="width:100%;justify-content:center;margin-top:10px;font-size:0.82rem;color:rgba(66,165,245,0.80);border-color:rgba(66,165,245,0.25);" onclick="cmVersusPoint('b')">
        ✅ نقط�� للفريق
      </button>
    </div>
  </div>

  <!-- السؤال -->
  <div class="cg-question-card" style="text-align:center;">
    <div class="cg-question-num">🏆 فصلي ضد فصلي — من يجاوب أسرع؟</div>
    <div class="cg-question-text">${q.q}</div>
    ${g.versusRevealed
      ? `<div style="margin-top:14px;padding:14px 24px;background:rgba(16,185,129,0.12);border:1.5px solid rgba(16,185,129,0.30);border-radius:12px;font-size:1.5rem;font-weight:900;color:var(--mint);">${q.ans}</div>`
      : `<button class="cm-btn cm-btn-primary" style="margin:14px auto 0;display:block;font-size:0.92rem;padding:10px 28px" onclick="cmVersusReveal()">🔍 الإجابة</button>`
    }
  </div>

  <!-- أدوات -->
  <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center;">
    <button class="cm-btn cm-btn-ghost" style="font-size:0.82rem" onclick="cmVersusNext()">سؤال جديد ←</button>
    <button class="cm-btn cm-btn-ghost" style="font-size:0.82rem" onclick="cmVersusShuffle()">🔀 خلط</button>
    <button class="cm-btn cm-btn-ghost" style="font-size:0.78rem;opacity:0.55" onclick="cmVersusReset()">🔄 تصفير</button>
    <button class="cm-btn cm-btn-ghost" style="font-size:0.78rem;opacity:0.55" onclick="cmVersusRename()">✏️ أسماء الفرق</button>
  </div>`;
}

function cmVersusPoint(team){
  if(!CM.games.versusScores) CM.games.versusScores={a:0,b:0};
  CM.games.versusScores[team]++;
  const winner = team==='a'?(CM.games.versusNameA||'الفريق الأحمر'):(CM.games.versusNameB||'الفريق الأزرق');
  confetti(); SFX.play('point');
  toast(`✅ نقطة لـ ${winner}!`,'success');
  cmVersusNext();
}
function cmVersusReveal(){
  CM.games.versusRevealed=true;
  cmRenderGame('versus');
}
function cmVersusNext(){
  CM.games.versusIdx++;
  CM.games.versusRevealed=false;
  cmRenderGame('versus');
}
function cmVersusShuffle(){
  CM.games.questions.versus=CM.games.questions.versus.sort(()=>Math.random()-0.5);
  CM.games.versusIdx=0; CM.games.versusRevealed=false;
  cmRenderGame('versus'); toast('🔀 تم خلط الأسئلة','info');
}
function cmVersusReset(){
  CM.games.versusScores={a:0,b:0};
  CM.games.versusIdx=0; CM.games.versusRevealed=false;
  cmRenderGame('versus'); toast('🔄 تم تصفير النتائج','info');
}
function cmVersusRename(){
  const a=prompt('اسم الفريق الأحمر:',CM.games.versusNameA||'الفريق الأحمر');
  if(a?.trim()) CM.games.versusNameA=a.trim();
  const b=prompt('اسم الفريق الأزرق:',CM.games.versusNameB||'الفريق الأزرق');
  if(b?.trim()) CM.games.versusNameB=b.trim();
  cmRenderGame('versus');
}

// ── GAME 7: كلمة وعكسها ──────────────────────────────────────
function cmBuildOpposite(qs){
  if(!qs.length) return `<div style="color:rgba(255,255,255,0.35);text-align:center;padding:40px">لا توجد كلمات — أضف من بنك الأسئلة</div>`;
  const g = CM.games;
  const idx = g.oppositeIdx % qs.length;
  const q = qs[idx];
  const chain = g.oppositeChain || [];

  return `
  <!-- سلسلة الإجابات -->
  ${chain.length ? `
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
    <span style="font-size:0.76rem;color:rgba(255,255,255,0.35);font-weight:700;">السلسلة:</span>
    ${chain.slice(-6).map((c,i)=>`
      <span style="padding:3px 10px;border-radius:99px;font-size:0.80rem;font-weight:700;background:${i%2===0?'rgba(66,165,245,0.15)':'rgba(16,185,129,0.15)'};color:${i%2===0?'var(--sky3)':'var(--mint)'};">
        ${c}
      </span>`).join('<span style="color:rgba(255,255,255,0.20);font-size:0.80rem;">↔</span>')}
    ${chain.length>6?`<span style="color:rgba(255,255,255,0.25);font-size:0.76rem;">...وأكثر</span>`:''}
  </div>` : ''}

  <!-- الكلمة الحالية -->
  <div style="text-align:center;padding:28px 20px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.10);border-radius:18px;margin-bottom:14px;">
    <div style="font-size:0.80rem;font-weight:800;color:rgba(255,255,255,0.30);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">✏️ كلمة وعكسها</div>
    <div style="font-size:3.5rem;font-weight:900;color:white;letter-spacing:-1px;margin-bottom:8px;">${q.word}</div>
    <div style="font-size:1rem;color:rgba(255,255,255,0.35);font-weight:700;">ما عكس هذه الكلمة؟</div>
    ${g.oppositeRevealed
      ? `<div style="margin-top:16px;font-size:2.5rem;font-weight:900;color:var(--mint);animation:popIn 0.35s cubic-bezier(0.34,1.56,0.64,1);">${q.opposite}</div>`
      : ''
    }
  </div>

  <!-- أزرار -->
  <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
    ${!g.oppositeRevealed
      ? `<button class="cm-btn cm-btn-primary" style="font-size:1rem;padding:12px 32px" onclick="cmOppositeReveal()">🔍 عرض العكس</button>`
      : `<button class="cm-btn cm-btn-primary" style="font-size:1rem;padding:12px 32px;background:linear-gradient(135deg,var(--mint),var(--sky))" onclick="cmOppositeCorrect()">✅ صح — التالي</button>
         <button class="cm-btn cm-btn-ghost"   style="font-size:1rem;padding:12px 28px" onclick="cmOppositeSkip()">⏭ تخطى</button>`
    }
    <button class="cm-btn cm-btn-ghost" style="font-size:0.80rem" onclick="cmOppositeShuffle()">🔀 خلط</button>
    <button class="cm-btn cm-btn-ghost" style="font-size:0.78rem;opacity:0.55" onclick="cmOppositeReset()">🔄 من البداية</button>
  </div>

  <!-- عداد السلسلة -->
  ${chain.length>=3?`
  <div style="text-align:center;margin-top:14px;padding:10px;background:rgba(245,158,11,0.10);border-radius:12px;border:1px solid rgba(245,158,11,0.25);">
    <span style="font-size:0.88rem;font-weight:800;color:var(--gold);">🔥 سلسلة ${chain.length} صحيح متتالي!</span>
  </div>`:''}`;
}

function cmOppositeReveal(){
  CM.games.oppositeRevealed=true;
  cmRenderGame('opposite');
}
function cmOppositeCorrect(){
  SFX.play('correct');
  const g=CM.games;
  const q=g.questions.opposite[g.oppositeIdx%g.questions.opposite.length];
  if(!g.oppositeChain) g.oppositeChain=[];
  // أضف الكلمة والعكس للسلسلة
  if(!g.oppositeChain.length) g.oppositeChain.push(q.word);
  g.oppositeChain.push(q.opposite);
  if(g.oppositeChain.length>=5) confetti();
  g.oppositeIdx++;
  g.oppositeRevealed=false;
  cmRenderGame('opposite');
}
function cmOppositeSkip(){
  SFX.play('wrong');
  CM.games.oppositeIdx++;
  CM.games.oppositeRevealed=false;
  CM.games.oppositeChain=[];
  cmRenderGame('opposite');
  toast('تم التخطي �� السلسلة انكسرت','info');
}
function cmOppositeShuffle(){
  CM.games.questions.opposite=CM.games.questions.opposite.sort(()=>Math.random()-0.5);
  CM.games.oppositeIdx=0; CM.games.oppositeRevealed=false; CM.games.oppositeChain=[];
  cmRenderGame('opposite'); toast('🔀 تم خلط الكلمات','info');
}
function cmOppositeReset(){
  CM.games.oppositeIdx=0; CM.games.oppositeRevealed=false; CM.games.oppositeChain=[];
  cmRenderGame('opposite');
}

// ── GAME 5: ما هذا؟ — لعبة الصور ────────────────────────────
function cmBuildImgQuiz(qs){
  if(!qs.length) return `
  <div style="text-align:center;padding:40px 20px;">
    <div style="font-size:3.5rem;margin-bottom:16px">🖼️</div>
    <div style="font-size:1.3rem;font-weight:800;color:rgba(255,255,255,0.50);margin-bottom:8px">لا توجد صور بعد</div>
    <div style="font-size:0.88rem;color:rgba(255,255,255,0.25);margin-bottom:20px">أضف صوراً من صفحة "🎮 بنك الأسئلة"</div>
    <button class="cm-btn cm-btn-ghost" style="font-size:0.90rem" onclick="closeClassroomMode();showPage('games_bank')">
      ➕ اذهب لبنك الأسئلة
    </button>
  </div>`;

  const g = CM.games;
  const idx = g.imgquizIdx % qs.length;
  const q = qs[idx];

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
    <div style="font-size:0.84rem;color:rgba(255,255,255,0.40);font-weight:700">
      🔍 ما هذا؟ — ${idx+1} / ${qs.length}
    </div>
    <div style="display:flex;gap:8px;">
      <button class="cm-btn cm-btn-ghost" style="padding:6px 14px;font-size:0.80rem" onclick="cmImgQuizPrev()">← السابق</button>
      <button class="cm-btn cm-btn-ghost" style="padding:6px 14px;font-size:0.80rem" onclick="cmImgQuizNext()">التالي ←</button>
      <button class="cm-btn cm-btn-ghost" style="padding:6px 14px;font-size:0.80rem" onclick="cmImgQuizShuffle()">🔀 خلط</button>
    </div>
  </div>

  <!-- الصورة الرئيسية -->
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:16px;">
    <div style="position:relative;max-width:580px;width:100%;">
      <img src="${q.img}" alt="ما هذا؟"
        style="width:100%;max-height:360px;object-fit:contain;border-radius:18px;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.10);display:block;" />
      ${q.hint && !g.imgquizRevealed ? `
        <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);padding:6px 16px;border-radius:99px;font-size:0.84rem;color:rgba(255,255,255,0.75);font-weight:700;white-space:nowrap;">
          💡 ${q.hint}
        </div>` : ''}
    </div>

    <!-- سؤال ثابت كبير -->
    <div style="font-size:2.5rem;font-weight:900;color:white;letter-spacing:-0.5px;text-align:center;">
      ما هذا؟ 🤔
    </div>

    <!-- الإجابة -->
    ${g.imgquizRevealed ? `
      <div style="background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.35);border-radius:16px;padding:18px 40px;text-align:center;animation:popIn 0.35s cubic-bezier(0.34,1.56,0.64,1);">
        <div style="font-size:2.2rem;font-weight:900;color:var(--mint);">${q.answer}</div>
        ${q.extra ? `<div style="font-size:1rem;color:rgba(255,255,255,0.50);margin-top:6px;">${q.extra}</div>` : ''}
      </div>
      <button class="cm-btn cm-btn-primary" style="font-size:1rem;padding:12px 32px" onclick="cmImgQuizNext()">
        التالي ←
      </button>
    ` : `
      <button class="cm-btn cm-btn-primary" style="font-size:1rem;padding:14px 40px;background:linear-gradient(135deg,var(--sky),var(--plum))" onclick="cmImgQuizReveal()">
        🔍 اكشف الإجابة
      </button>
    `}
  </div>`;
}

function cmImgQuizReveal(){
  CM.games.imgquizRevealed = true;
  confetti(); SFX.play('reveal');
  cmRenderGame('imgquiz');
}
function cmImgQuizNext(){
  CM.games.imgquizIdx++;
  CM.games.imgquizRevealed = false;
  cmRenderGame('imgquiz');
}
function cmImgQuizPrev(){
  CM.games.imgquizIdx = Math.max(0, CM.games.imgquizIdx - 1);
  CM.games.imgquizRevealed = false;
  cmRenderGame('imgquiz');
}
function cmImgQuizShuffle(){
  CM.games.questions.imgquiz = CM.games.questions.imgquiz.sort(()=>Math.random()-0.5);
  CM.games.imgquizIdx = 0;
  CM.games.imgquizRevealed = false;
  cmRenderGame('imgquiz');
  toast('🔀 تم خلط الصور','info');
}

// ── Override cmSwitchView to handle games ─────────────────────
// (merged into original below — no duplicate needed)

// ── GAMES BANK PAGE (outside classroom) ─────────────────────
function renderGamesBank(){
  if(!S.gamesBank) S.gamesBank={ quiz:[], hot:[], race:[], word:[] };
  const deleted = S.gamesBank._deleted || {};

  // دمج المضاف + الافتراضي (مع استثناء المحذوف من الافتراضي)
  const mergeQ = (type) => {
    const customs  = S.gamesBank[type] || [];
    const defaults = GAMES_DEFAULT[type].filter((_,i)=>!(deleted[type]||[]).includes(i));
    return [...customs, ...defaults];
  };

  const allQ = {
    quiz: mergeQ('quiz'),
    hot:  mergeQ('hot'),
    race: mergeQ('race'),
    word: mergeQ('word'),
    imgquiz: mergeQ('imgquiz'),
    versus: mergeQ('versus'),
    opposite: mergeQ('opposite'),
  };
  const games = [
    { id:'quiz',  icon:'🎯', name:'من سيربح المليون', desc:'أسئلة باختيار من متعدد', qs:allQ.quiz,
      addForm:`<div style="display:flex;flex-direction:column;gap:8px;">
        <input id="gba_quiz_q" class="fg input" placeholder="السؤال..." style="padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <input id="gba_quiz_a" placeholder="الخيار أ" style="padding:8px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.86rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
          <input id="gba_quiz_b" placeholder="الخيار ب" style="padding:8px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.86rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
          <input id="gba_quiz_c" placeholder="الخيار ج" style="padding:8px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.86rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
          <input id="gba_quiz_d" placeholder="الخيار د" style="padding:8px 11px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.86rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:0.84rem;font-weight:700;color:var(--muted)">الإجابة الصحيحة:</label>
          <select id="gba_quiz_ans" style="padding:7px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.86rem;outline:none;background:var(--card);color:var(--ink);">
            <option value="0">أ</option><option value="1">ب</option><option value="2">ج</option><option value="3">د</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="gbAddQuiz()">➕ إضافة</button>
        </div>
      </div>`
    },
    { id:'hot', icon:'💣', name:'الكرسي الساخن', desc:'أسئلة مفتوحة — أجب أو مرّر', qs:allQ.hot,
      addForm:`<div style="display:flex;gap:8px;align-items:center;">
        <input id="gba_hot_q" class="fg input" placeholder="السؤال المفتوح..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <button class="btn btn-primary btn-sm" onclick="gbAddHot()">➕ إضافة</button>
      </div>`
    },
    { id:'race', icon:'⏱️', name:'سباق الإجابات', desc:'سؤال بإجابة واحدة — أسرع يفوز', qs:allQ.race,
      addForm:`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input id="gba_race_q" placeholder="السؤال..." style="flex:2;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <input id="gba_race_a" placeholder="الإجابة..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <button class="btn btn-primary btn-sm" onclick="gbAddRace()">➕ إضافة</button>
      </div>`
    },
    { id:'word', icon:'🔤', name:'أكمل الكلمة', desc:'كلمة بحروف مخفية', qs:allQ.word,
      addForm:`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input id="gba_word_w" placeholder="الكلمة..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <input id="gba_word_h" placeholder="التلميح..." style="flex:2;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <button class="btn btn-primary btn-sm" onclick="gbAddWord()">➕ إضافة</button>
      </div>`
    },
    { id:'imgquiz', icon:'🔍', name:'ما هذا؟', desc:'صورة + تخمين الإجابة', qs:allQ.imgquiz,
      addForm:`<div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input id="gba_iq_ans" placeholder="الإجابة الصحيحة (مثل: قطة)..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
          <input id="gba_iq_hint" placeholder="تلميح اختياري..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <label style="flex:1;padding:10px;border:2px dashed var(--border);border-radius:9px;cursor:pointer;text-align:center;font-size:0.86rem;color:var(--muted);font-weight:700;" for="gba_iq_img">
            🖼️ اختر صورة (PNG/JPG)
            <input type="file" id="gba_iq_img" accept="image/*" style="display:none" onchange="gbPreviewImgQuiz(this)">
          </label>
          <button class="btn btn-primary btn-sm" onclick="gbAddImgQuiz()">➕ إضافة</button>
        </div>
        <div id="gba_iq_preview" style="display:none;margin-top:4px;">
          <img id="gba_iq_preview_img" style="max-height:120px;border-radius:10px;border:1px solid var(--border);object-fit:contain;" />
        </div>
      </div>`
    },
    { id:'versus', icon:'🏆', name:'فصلي ضد فصلي', desc:'أسئلة للتنافس بين فريقين', qs:allQ.versus,
      addForm:`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input id="gba_vs_q" placeholder="السؤال..." style="flex:2;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <input id="gba_vs_a" placeholder="الإجابة..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <button class="btn btn-primary btn-sm" onclick="gbAddVersus()">➕ إضافة</button>
      </div>`
    },
    { id:'opposite', icon:'✏️', name:'كلمة وعكسها', desc:'سلسلة كلمة وضدها', qs:allQ.opposite,
      addForm:`<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <input id="gba_op_w" placeholder="الكلمة..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <input id="gba_op_o" placeholder="العكس..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;">
        <button class="btn btn-primary btn-sm" onclick="gbAddOpposite()">➕ إضافة</button>
      </div>`
    },
  ];

  return `
  <div class="breadcrumb"><i class="ti ti-home"></i> <span class="sep">›</span> <span class="active">🎮 بنك الأسئلة</span></div>
  <div class="ph">
    <div><div class="ph-title">🎮 بنك الأسئلة والألعاب</div>
    <div class="ph-sub">أضف أسئلتك الخاصة — تظهر تلقائياً في وضع ا��حصة</div></div>
    <div class="ph-actions">
      <button class="btn btn-primary" onclick="showPage('classroom_mode')">🖥️ وضع الحصة</button>
    </div>
  </div>
  ${games.map(g=>`
  <div class="gb-game-section">
    <div class="gb-game-header">
      <div class="gb-game-icon">${g.icon}</div>
      <div>
        <div class="gb-game-title">${g.name}</div>
        <div style="font-size:0.76rem;color:var(--muted)">${g.desc}</div>
      </div>
      <div class="gb-game-count">${g.qs.length} سؤال</div>
    </div>
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);">${g.addForm}</div>
    <div>
      ${g.qs.map((q,i)=>gbRenderItem(g.id,q,i)).join('')}
    </div>
  </div>`).join('')}`;
}

function gbRenderItem(type, q, i){
  const bankLen = (S.gamesBank?.[type]||[]).length;
  const isCustom = i < bankLen;
  const letters = ['أ','ب','ج','د'];
  let text='', extra='';
  if(type==='quiz'){
    text=q.q;
    extra=`<div class="gb-q-choices">${(q.choices||[]).map((c,ci)=>`<span class="gb-q-choice ${ci===q.ans?'correct':''}">${letters[ci]} ${c}</span>`).join('')}</div>`;
  } else if(type==='hot'){ text=q.q; }
  else if(type==='race'){ text=q.q; extra=`<div style="font-size:0.76rem;color:var(--mint);font-weight:700;margin-top:3px;">✅ ${q.ans||'—'}</div>`; }
  else if(type==='word'){ text=q.word; extra=`<div style="font-size:0.76rem;color:var(--muted);margin-top:2px;">💡 ${q.hint||''}</div>`; }
  else if(type==='imgquiz'){
    text=q.answer||'—';
    extra=`<div style="display:flex;align-items:center;gap:10px;margin-top:4px;">
      <img src="${q.img}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;border:1px solid var(--border);flex-shrink:0;" />
      ${q.hint?`<span style="font-size:0.76rem;color:var(--muted)">💡 ${q.hint}</span>`:''}
    </div>`;
  }
  else if(type==='versus'){
    text=q.q;
    extra=`<div style="font-size:0.76rem;color:var(--mint);font-weight:700;margin-top:3px;">✅ ${q.ans||'—'}</div>`;
  }
  else if(type==='opposite'){
    text=q.word;
    extra=`<div style="font-size:0.76rem;color:var(--sky);font-weight:700;margin-top:3px;">↔ ${q.opposite||'—'}</div>`;
  }

  return `<div class="gb-q-item" id="gbItem_${type}_${i}" style="${isCustom?'background:rgba(21,101,192,0.04);':''}">
    <div class="gb-q-num" style="${isCustom?'background:var(--c-accent-bg);border-color:var(--c-accent-border);color:var(--sky);':''}">
      ${i+1}
    </div>
    <div class="gb-q-body">
      <div class="gb-q-text">${text}</div>
      ${extra}
    </div>
    <div class="gb-q-actions">
      <button class="btn btn-ghost btn-xs" onclick="gbOpenEdit('${type}',${i})" title="تعديل">✏️</button>
      <button class="btn btn-red btn-xs" onclick="gbDelete('${type}',${i})" title="حذف">🗑️</button>
    </div>
  </div>`;
}

function gbDelete(type, i){
  if(!confirm('حذف هذا السؤال؟')) return;
  const bankLen = (S.gamesBank?.[type]||[]).length;
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[]};

  if(i < bankLen){
    // سؤال مضاف — احذفه من البنك مباشرة
    S.gamesBank[type].splice(i, 1);
  } else {
    // سؤال افتراضي — أضفه للـ "deleted list" عشان يختفي
    if(!S.gamesBank._deleted) S.gamesBank._deleted={};
    if(!S.gamesBank._deleted[type]) S.gamesBank._deleted[type]=[];
    // احفظ index الافتراضي (بعد خصم البنك)
    const defaultIdx = i - bankLen;
    S.gamesBank._deleted[type].push(defaultIdx);
  }
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم الحذف','success');
}

function gbOpenEdit(type, i){
  const bankLen = (S.gamesBank?.[type]||[]).length;
  const isCustom = i < bankLen;
  const allQ = [
    ...(S.gamesBank?.[type]||[]),
    ...GAMES_DEFAULT[type]
  ];
  const q = allQ[i];
  if(!q) return;
  const letters = ['أ','ب','ج','د'];

  document.querySelectorAll('.gb-edit-form').forEach(el=>el.remove());
  document.querySelectorAll('.gb-q-item').forEach(el=>el.style.border='');

  const item = document.getElementById(`gbItem_${type}_${i}`);
  if(!item) return;
  item.style.border = '1.5px solid var(--sky)';

  const form = document.createElement('div');
  form.className = 'gb-edit-form';
  form.style.cssText = 'padding:14px 16px;background:var(--c-accent-bg);border:1.5px solid var(--c-accent-border);border-top:none;border-radius:0 0 12px 12px;display:flex;flex-direction:column;gap:9px;';

  let inner = '';
  const inp = (id,val,ph='')=>`<input type="text" id="${id}" value="${(val||'').replace(/"/g,'&quot;')}" placeholder="${ph}" style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.90rem;outline:none;background:var(--card);color:var(--ink);text-align:right;width:100%">`;

  if(type==='quiz'){
    inner = `
      <div class="fg" style="margin:0"><label>السؤال</label>${inp('gbe_q', q.q)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
        ${[0,1,2,3].map(ci=>`
          <div style="position:relative;">
            <input type="text" id="gbe_c${ci}" value="${((q.choices||[])[ci]||'').replace(/"/g,'&quot;')}" placeholder="الخيار ${letters[ci]}"
              style="padding:8px 11px;padding-left:32px;border:1.5px solid ${q.ans===ci?'var(--mint)':'var(--border)'};border-radius:8px;font-family:'Tajawal',sans-serif;font-size:0.86rem;outline:none;background:var(--card);color:var(--ink);text-align:right;width:100%;cursor:text"
              onfocus="gbMarkCorrect(${ci})">
            <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:0.72rem;font-weight:900;width:18px;height:18px;border-radius:50%;background:${q.ans===ci?'var(--mint)':'var(--border)'};color:${q.ans===ci?'white':'var(--muted)'};display:flex;align-items:center;justify-content:center;" id="gbe_label_${ci}">${letters[ci]}</span>
          </div>`).join('')}
      </div>
      <input type="hidden" id="gbe_ans" value="${q.ans||0}">
      <div style="font-size:0.76rem;color:var(--muted)">💡 اضغط على الخيار لتعيينه كإجابة صحيحة</div>`;
  } else if(type==='hot'){
    inner = `<div class="fg" style="margin:0"><label>السؤال</label>${inp('gbe_q', q.q)}</div>`;
  } else if(type==='race'){
    inner = `
      <div class="fg" style="margin:0"><label>السؤال</label>${inp('gbe_q', q.q)}</div>
      <div class="fg" style="margin:0"><label>الإجابة</label>${inp('gbe_a', q.ans)}</div>`;
  } else if(type==='word'){
    inner = `
      <div class="fg" style="margin:0"><label>الكلمة</label>${inp('gbe_w', q.word)}</div>
      <div class="fg" style="margin:0"><label>التلميح</label>${inp('gbe_h', q.hint)}</div>`;
  } else if(type==='versus'){
    inner = `
      <div class="fg" style="margin:0"><label>السؤال</label>${inp('gbe_q', q.q)}</div>
      <div class="fg" style="margin:0"><label>الإجابة</label>${inp('gbe_a', q.ans)}</div>`;
  } else if(type==='opposite'){
    inner = `
      <div class="fg" style="margin:0"><label>الكلمة</label>${inp('gbe_w', q.word)}</div>
      <div class="fg" style="margin:0"><label>العكس</label>${inp('gbe_o', q.opposite)}</div>`;
  } else if(type==='imgquiz'){
    inner = `
      <div class="fg" style="margin:0"><label>الإجابة الصحيحة</label>${inp('gbe_iq_ans', q.answer)}</div>
      <div class="fg" style="margin:0"><label>التلميح (اختياري)</label>${inp('gbe_iq_hint', q.hint)}</div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:4px;">
        <img id="gbe_iq_cur" src="${q.img}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid var(--border);" />
        <label style="flex:1;padding:8px;border:2px dashed var(--border);border-radius:8px;cursor:pointer;text-align:center;font-size:0.84rem;color:var(--muted);font-weight:700;" for="gbe_iq_newimg">
          🖼️ تغيير الصورة (اختياري)
          <input type="file" id="gbe_iq_newimg" accept="image/*" style="display:none" onchange="gbEditPreviewImgQuiz(this)">
        </label>
      </div>`;
  }

  form.innerHTML = inner + `
    <div style="display:flex;gap:8px;">
      <button class="btn btn-primary btn-sm" onclick="gbSaveEdit('${type}',${i},${isCustom})">💾 حفظ</button>
      <button class="btn btn-ghost btn-sm" onclick="gbCancelEdit()">إلغاء</button>
    </div>`;
  item.after(form);
  form.querySelector('input:not([type=hidden])')?.focus();
}

function gbMarkCorrect(ci){
  document.getElementById('gbe_ans').value = ci;
  [0,1,2,3].forEach(j=>{
    const inp = document.getElementById('gbe_c'+j);
    const lbl = document.getElementById('gbe_label_'+j);
    if(inp){ inp.style.border = j===ci ? '1.5px solid var(--mint)' : '1.5px solid var(--border)'; }
    if(lbl){ lbl.style.background = j===ci ? 'var(--mint)' : 'var(--border)'; lbl.style.color = j===ci ? 'white' : 'var(--muted)'; }
  });
}

function gbSaveEdit(type, i, isCustom){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[]};
  const bankLen = S.gamesBank[type].length;

  // بناء الكائن الجديد
  let updated = {};
  if(type==='quiz'){
    const newQ=document.getElementById('gbe_q')?.value.trim();
    const c0=document.getElementById('gbe_c0')?.value.trim();
    const c1=document.getElementById('gbe_c1')?.value.trim();
    const c2=document.getElementById('gbe_c2')?.value.trim();
    const c3=document.getElementById('gbe_c3')?.value.trim();
    const ans=parseInt(document.getElementById('gbe_ans')?.value)||0;
    if(!newQ||!c0||!c1||!c2||!c3){toast('أكمل كل الحقول','error');return;}
    updated={q:newQ,choices:[c0,c1,c2,c3],ans};
  } else if(type==='hot'){
    const newQ=document.getElementById('gbe_q')?.value.trim();
    if(!newQ){toast('أدخل السؤال','error');return;}
    updated={q:newQ};
  } else if(type==='race'){
    const newQ=document.getElementById('gbe_q')?.value.trim();
    const newA=document.getElementById('gbe_a')?.value.trim();
    if(!newQ){toast('أدخل السؤال','error');return;}
    updated={q:newQ,ans:newA};
  } else if(type==='word'){
    const newW=document.getElementById('gbe_w')?.value.trim();
    const newH=document.getElementById('gbe_h')?.value.trim();
    if(!newW){toast('أدخل الكلمة','error');return;}
    const hidden=newW.length>2?[Math.floor(newW.length/2)]:[];
    updated={word:newW,hint:newH,hidden};
  } else if(type==='imgquiz'){
    const newAns = document.getElementById('gbe_iq_ans')?.value.trim();
    const newHint= document.getElementById('gbe_iq_hint')?.value.trim();
    if(!newAns){toast('أدخل الإجابة','error');return;}
    const allQ2=[...(S.gamesBank?.imgquiz||[]),...GAMES_DEFAULT.imgquiz];
    const curImg = allQ2[i]?.img || '';
    const newImg = _gbEditImgData || curImg;
    if(!newImg){toast('الصورة مطلوبة','error');return;}
    updated={img:newImg, answer:newAns, hint:newHint||''};
    _gbEditImgData=null;
  } else if(type==='versus'){
    const newQ=document.getElementById('gbe_q')?.value.trim();
    const newA=document.getElementById('gbe_a')?.value.trim();
    if(!newQ){toast('أدخل السؤال','error');return;}
    updated={q:newQ,ans:newA};
  } else if(type==='opposite'){
    const newW=document.getElementById('gbe_w')?.value.trim();
    const newO=document.getElementById('gbe_o')?.value.trim();
    if(!newW||!newO){toast('أدخل الكلمة وعكسها','error');return;}
    updated={word:newW,opposite:newO};
  }

  if(isCustom){
    // تعديل مباشر في البنك
    S.gamesBank[type][i] = updated;
  } else {
    // افتراضي — أضف نسخة معدّلة للبنك، واحذف الأصلي
    const defaultIdx = i - bankLen;
    S.gamesBank[type].push(updated);
    if(!S.gamesBank._deleted) S.gamesBank._deleted={};
    if(!S.gamesBank._deleted[type]) S.gamesBank._deleted[type]=[];
    S.gamesBank._deleted[type].push(defaultIdx);
  }
  save(); CM.games=null;
  gbCancelEdit();
  showPage('games_bank');
  toast('✅ تم حفظ التعديل','success');
}

function gbCancelEdit(){
  document.querySelectorAll('.gb-edit-form').forEach(el=>el.remove());
  document.querySelectorAll('.gb-q-item').forEach(el=>el.style.border='');
}

function gbAddQuiz(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[]};
  const q=document.getElementById('gba_quiz_q')?.value.trim();
  const a=document.getElementById('gba_quiz_a')?.value.trim();
  const b=document.getElementById('gba_quiz_b')?.value.trim();
  const c=document.getElementById('gba_quiz_c')?.value.trim();
  const d=document.getElementById('gba_quiz_d')?.value.trim();
  const ans=parseInt(document.getElementById('gba_quiz_ans')?.value)||0;
  if(!q||!a||!b||!c||!d){toast('أكمل السؤال والخيارات الأربعة','error');return;}
  S.gamesBank.quiz.push({q,choices:[a,b,c,d],ans});
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة السؤال','success');
}
function gbAddHot(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[]};
  const q=document.getElementById('gba_hot_q')?.value.trim();
  if(!q){toast('أدخل السؤال','error');return;}
  S.gamesBank.hot.push({q});
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة السؤال','success');
}
function gbAddRace(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[]};
  const q=document.getElementById('gba_race_q')?.value.trim();
  const a=document.getElementById('gba_race_a')?.value.trim();
  if(!q){toast('أدخل السؤال','error');return;}
  S.gamesBank.race.push({q,ans:a});
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة السؤال','success');
}
function gbAddWord(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[]};
  const w=document.getElementById('gba_word_w')?.value.trim();
  const h=document.getElementById('gba_word_h')?.value.trim();
  if(!w){toast('أدخل الكلمة','error');return;}
  const hidden=w.length>2?[Math.floor(w.length/2)]:[];
  S.gamesBank.word.push({word:w,hint:h,hidden});
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة الكلمة','success');
}

let _gbImgData = null;
let _gbEditImgData = null;

function gbAddVersus(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[],imgquiz:[],versus:[],opposite:[]};
  if(!S.gamesBank.versus) S.gamesBank.versus=[];
  const q=document.getElementById('gba_vs_q')?.value.trim();
  const a=document.getElementById('gba_vs_a')?.value.trim();
  if(!q){toast('أدخل السؤال','error');return;}
  S.gamesBank.versus.push({q,ans:a||''});
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة السؤال','success');
}

function gbAddOpposite(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[],imgquiz:[],versus:[],opposite:[]};
  if(!S.gamesBank.opposite) S.gamesBank.opposite=[];
  const w=document.getElementById('gba_op_w')?.value.trim();
  const o=document.getElementById('gba_op_o')?.value.trim();
  if(!w||!o){toast('أدخل الكلمة وعكسها','error');return;}
  S.gamesBank.opposite.push({word:w,opposite:o});
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة الكلمة','success');
}

function gbPreviewImgQuiz(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _gbImgData = e.target.result;
    const prev = document.getElementById('gba_iq_preview');
    const img  = document.getElementById('gba_iq_preview_img');
    if(prev && img){ img.src = _gbImgData; prev.style.display = 'block'; }
  };
  reader.readAsDataURL(file);
}

function gbEditPreviewImgQuiz(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _gbEditImgData = e.target.result;
    const cur = document.getElementById('gbe_iq_cur');
    if(cur) cur.src = _gbEditImgData;
  };
  reader.readAsDataURL(file);
}

function gbAddImgQuiz(){
  if(!S.gamesBank) S.gamesBank={quiz:[],hot:[],race:[],word:[],imgquiz:[]};
  if(!S.gamesBank.imgquiz) S.gamesBank.imgquiz=[];
  const ans  = document.getElementById('gba_iq_ans')?.value.trim();
  const hint = document.getElementById('gba_iq_hint')?.value.trim();
  if(!ans){  toast('أدخل الإجابة الصحيحة','error'); return; }
  if(!_gbImgData){ toast('اختر صورة أولاً','error'); return; }
  S.gamesBank.imgquiz.push({ img:_gbImgData, answer:ans, hint:hint||'' });
  _gbImgData = null;
  save(); CM.games=null; showPage('games_bank');
  toast('✅ تم إضافة الصورة','success');
}
