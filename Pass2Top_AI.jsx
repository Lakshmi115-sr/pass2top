import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: "maths",   name: "Mathematics",   icon: "📐", color: "#FF6B35", light: "#FF6B3522" },
  { id: "science", name: "Science",       icon: "🔬", color: "#4ECDC4", light: "#4ECDC422" },
  { id: "social",  name: "Social Studies",icon: "🌍", color: "#45B7D1", light: "#45B7D122" },
  { id: "telugu",  name: "Telugu",        icon: "తె", color: "#96CEB4", light: "#96CEB422" },
  { id: "hindi",   name: "Hindi",         icon: "हि", color: "#FECA57", light: "#FECA5722" },
  { id: "english", name: "English",       icon: "📖", color: "#DDA0DD", light: "#DDA0DD22" },
];

const TOPICS = {
  maths:   ["Real Numbers","Polynomials","Linear Equations","Quadratic Equations","Arithmetic Progressions","Triangles","Coordinate Geometry","Trigonometry","Circles","Areas & Circles","Surface Areas & Volumes","Statistics","Probability"],
  science: ["Chemical Reactions","Acids Bases Salts","Metals & Non-Metals","Carbon Compounds","Periodic Table","Life Processes","Control & Coordination","Reproduction","Heredity & Evolution","Light – Reflection","Electricity","Magnetic Effects","Energy Sources","Our Environment"],
  social:  ["Nationalism in Europe","Nationalism in India","Industrialisation","Print Culture","Novels","Resources & Development","Forest & Wildlife","Water Resources","Agriculture","Manufacturing Industries","Lifelines of Economy","Power Sharing","Federalism","Political Parties","Democracy & Challenges","Money & Credit","Globalisation","Consumer Rights"],
  telugu:  ["వ్యాకరణం – సంధులు","వ్యాకరణం – సమాసాలు","అలంకారాలు","ఛందస్సు","పద్యాలు","గద్యాలు","నాటకాలు","కథలు","వ్యాసాలు","లేఖలు","అనువాదం","నిఘంటువు"],
  hindi:   ["व्याकरण – संधि","व्याकरण – समास","अलंकार","पद्य पाठ","गद्य पाठ","कहानी","निबंध","पत्र लेखन","अनुवाद","मुहावरे"],
  english: ["Grammar – Tenses","Grammar – Voice","Grammar – Reported Speech","Reading Comprehension","Letter Writing – Formal","Letter Writing – Informal","Essay Writing","Poetry Analysis","Prose Summary","Vocabulary","Editing Skills"],
};

const SYSTEM_PROMPT = `You are Pass2Top AI — a friendly, expert tutor for Telangana 10th class board exam 2026. 
Your ONLY goal: help students pass with minimum marks guaranteed and guide toppers to full score.
Curriculum: Telangana State Board SSC (10th class) 2026.
Tone: warm, encouraging, like a knowledgeable elder sibling. Use simple Telugu/Hindi words occasionally to connect. 
Keep responses concise and exam-focused. Always mention marks/question patterns.
Format nicely with emojis, bullet points, and key terms in CAPS.`;

// ─── CLAUDE API CALL ─────────────────────────────────────────────────────────
async function askClaude(messages, onChunk) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
        stream: true,
      }),
    });

    if (!res.ok) throw new Error("API error");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            fullText += parsed.delta.text;
            onChunk(fullText);
          }
        } catch {}
      }
    }
    return fullText;
  } catch (err) {
    throw err;
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Kalam:wght@400;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060818;
  --card:#ffffff0d;
  --border:#ffffff18;
  --orange:#FF6B35;
  --gold:#FFD93D;
  --green:#6BCB77;
  --teal:#4ECDC4;
  --text:#f0f0f0;
  --muted:#ffffff60;
}
body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
.app{max-width:430px;margin:0 auto;min-height:100vh;position:relative}

/* BG */
.bg-orbs{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.15}
.orb1{width:300px;height:300px;background:#FF6B35;top:-50px;right:-80px;animation:drift 8s ease-in-out infinite}
.orb2{width:250px;height:250px;background:#4ECDC4;bottom:-50px;left:-80px;animation:drift 10s ease-in-out infinite reverse}
.orb3{width:200px;height:200px;background:#DDA0DD;top:50%;left:50%;animation:drift 12s ease-in-out infinite 2s}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,30px)}}

/* SCREENS */
.screen{position:relative;z-index:1;min-height:100vh;padding:24px 18px 110px;animation:fadeUp .35s ease}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

/* LOGO */
.logo-mark{font-family:'Poppins',sans-serif;font-size:26px;font-weight:900;letter-spacing:-1px;
  background:linear-gradient(135deg,#FF6B35 0%,#FFD93D 50%,#6BCB77 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;display:inline-block}
.logo-sub{font-size:11px;letter-spacing:3px;color:var(--muted);text-transform:uppercase;margin-top:2px}

/* CARDS */
.card{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:20px;margin-bottom:14px;backdrop-filter:blur(12px)}
.card-sm{padding:14px 16px;border-radius:14px}
.card-title{font-size:16px;font-weight:700;margin-bottom:12px;color:#fff}
.card-title.lg{font-size:20px;font-weight:900;font-family:'Poppins'}

/* INPUTS */
input,textarea,select{width:100%;background:#ffffff0a;border:1.5px solid var(--border);border-radius:13px;
  padding:13px 16px;color:#fff;font-family:'Poppins',sans-serif;font-size:14px;outline:none;margin-bottom:10px;
  transition:border-color .2s,background .2s}
input::placeholder,textarea::placeholder{color:var(--muted)}
input:focus,textarea:focus,select:focus{border-color:var(--orange);background:#ffffff12}
select option{background:#1a1040}
textarea{min-height:90px;resize:none}

/* BUTTONS */
.btn{width:100%;padding:15px;border-radius:14px;border:none;font-family:'Poppins',sans-serif;
  font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:.3px;margin-bottom:10px}
.btn:active{transform:scale(.97)}
.btn-primary{background:linear-gradient(135deg,#FF6B35,#ff8c42);color:#fff;box-shadow:0 8px 28px #FF6B3550}
.btn-success{background:linear-gradient(135deg,#6BCB77,#4CAF50);color:#fff;box-shadow:0 8px 28px #6BCB7750}
.btn-ghost{background:var(--card);color:#fff;border:1.5px solid var(--border)}
.btn-gold{background:linear-gradient(135deg,#FFD93D,#FFA500);color:#000;box-shadow:0 8px 28px #FFD93D50}
.btn-sm{padding:9px 16px;font-size:13px;width:auto;display:inline-flex;align-items:center;gap:5px;margin-bottom:0}
.btn-danger{background:linear-gradient(135deg,#ff5252,#ff1744);color:#fff}

/* TAGS/BADGES */
.badge{display:inline-flex;align-items:center;gap:4px;padding:4px 11px;border-radius:20px;font-size:12px;font-weight:700}
.badge-orange{background:#FF6B3522;border:1px solid #FF6B3566;color:#FF6B35}
.badge-green{background:#6BCB7722;border:1px solid #6BCB7766;color:#6BCB77}
.badge-red{background:#ff525222;border:1px solid #ff525266;color:#ff5252}
.badge-gold{background:#FFD93D22;border:1px solid #FFD93D66;color:#FFD93D}
.badge-blue{background:#4ECDC422;border:1px solid #4ECDC466;color:#4ECDC4}
.badge-purple{background:#DDA0DD22;border:1px solid #DDA0DD66;color:#DDA0DD}
.pill{background:var(--card);border:1px solid var(--border);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;display:inline-block;margin:4px}
.pill:active,.pill.active{border-color:var(--orange);background:#FF6B3522;color:var(--orange)}

/* AI CHAT */
.chat-wrap{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}
.bubble-row{display:flex;gap:10px;align-items:flex-start;animation:fadeUp .4s ease}
.bubble-row.user{flex-direction:row-reverse}
.avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.avatar.ai{background:linear-gradient(135deg,#FF6B35,#FFD93D)}
.avatar.user{background:linear-gradient(135deg,#4ECDC4,#45B7D1)}
.bubble{max-width:82%;padding:12px 16px;border-radius:18px;font-size:14px;line-height:1.65;word-break:break-word}
.bubble.ai{background:#ffffff10;border:1px solid #ffffff18;border-radius:0 18px 18px 18px;color:#eee}
.bubble.user{background:linear-gradient(135deg,#4ECDC4,#45B7D1);color:#000;font-weight:600;border-radius:18px 0 18px 18px}

/* TYPING */
.typing-dot{display:inline-flex;gap:4px;padding:10px 14px}
.dot{width:7px;height:7px;border-radius:50%;background:#FF6B35;animation:bounce .9s ease infinite}
.dot:nth-child(2){animation-delay:.15s}
.dot:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-8px);opacity:1}}

/* CHAT INPUT */
.chat-input-row{display:flex;gap:8px;margin-top:10px}
.chat-input-row input{flex:1;margin-bottom:0}
.send-btn{width:46px;height:46px;background:linear-gradient(135deg,#FF6B35,#ff8c42);border:none;border-radius:13px;
  font-size:18px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
.send-btn:active{transform:scale(.93)}
.send-btn:disabled{opacity:.4;cursor:not-allowed}

/* TOPIC LIST */
.topic-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;
  background:var(--card);border:1px solid var(--border);border-radius:13px;margin-bottom:8px;
  cursor:pointer;transition:all .2s}
.topic-row:active{background:#FF6B3515;border-color:#FF6B3566}
.topic-row.done{border-color:#6BCB7744;background:#6BCB7710}
.topic-left{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600}
.topic-right{font-size:12px;color:var(--muted)}

/* SUBJECT GRID */
.subj-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}
.subj-card{background:var(--card);border:2px solid var(--border);border-radius:18px;padding:16px;
  text-align:center;cursor:pointer;transition:all .25s;position:relative;overflow:hidden}
.subj-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .2s}
.subj-card:active{transform:scale(.96)}
.subj-card.selected::before{opacity:1}
.subj-icon{font-size:30px;display:block;margin-bottom:6px}
.subj-name{font-size:13px;font-weight:700}
.subj-pct{font-size:12px;margin-top:4px;font-weight:700}

/* PROGRESS BAR */
.pbar-wrap{height:6px;background:#ffffff15;border-radius:4px;overflow:hidden;margin-top:6px}
.pbar{height:100%;border-radius:4px;transition:width 1s ease}

/* NAV */
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;
  background:rgba(6,8,24,.95);backdrop-filter:blur(20px);border-top:1px solid var(--border);
  display:flex;z-index:100}
.nav-btn{flex:1;padding:13px 6px;text-align:center;cursor:pointer;border:none;background:none;
  color:var(--muted);transition:all .2s}
.nav-btn.active{color:var(--orange)}
.nav-icon{font-size:21px;display:block}
.nav-label{font-size:10px;font-weight:700;letter-spacing:.5px;margin-top:2px}

/* BACK HEADER */
.page-header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.back-btn{background:var(--card);border:1px solid var(--border);border-radius:11px;
  width:38px;height:38px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:18px;color:#fff;flex-shrink:0;transition:all .2s}
.back-btn:active{transform:scale(.93)}
.page-title{font-size:18px;font-weight:800}

/* QUESTION CARD */
.q-card{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:18px;margin-bottom:14px}
.q-meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.q-num{font-size:11px;font-weight:800;letter-spacing:1.5px;color:var(--orange);text-transform:uppercase}
.q-marks{background:#FF6B3520;border:1px solid #FF6B3544;border-radius:8px;padding:3px 10px;
  font-size:12px;font-weight:700;color:var(--orange)}
.q-text{font-size:14px;font-weight:600;line-height:1.65;margin-bottom:14px;color:#eee}
.ans-reveal{background:#6BCB7710;border:1px solid #6BCB7730;border-radius:12px;padding:14px;
  font-size:13px;line-height:1.75;color:#ddd;margin-top:10px}
.ans-title{font-size:11px;font-weight:800;letter-spacing:1px;color:var(--green);margin-bottom:7px;text-transform:uppercase}
.ai-ans{background:#FF6B3510;border:1px solid #FF6B3530;border-radius:12px;padding:14px;
  font-size:13px;line-height:1.75;color:#ddd;margin-top:10px}
.ai-ans-title{font-size:11px;font-weight:800;letter-spacing:1px;color:var(--orange);margin-bottom:7px;text-transform:uppercase}

/* TIMER */
.timer-bar{background:#FF6B3515;border:1px solid #FF6B3530;border-radius:12px;padding:10px 16px;
  text-align:center;font-size:22px;font-weight:900;color:var(--orange);margin-bottom:16px;font-family:'Poppins'}
.timer-bar.urgent{color:#ff5252;background:#ff525215;border-color:#ff525230;animation:pulse .5s ease infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.02)}}

/* COMMAND */
.rank-card{text-align:center;padding:24px;background:linear-gradient(135deg,#FFD93D18,#FF6B3518);
  border:1px solid #FFD93D30;border-radius:22px;margin-bottom:16px}
.rank-emoji{font-size:52px}
.rank-name{font-size:24px;font-weight:900;margin-top:8px}
.rank-desc{font-size:13px;color:var(--muted);margin-top:4px;line-height:1.6}

.ring-wrap{display:flex;justify-content:center;margin:16px 0}
.ring-inner{position:relative;width:130px;height:130px}
.ring-inner svg{transform:rotate(-90deg)}
.ring-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center}
.ring-pct{font-size:28px;font-weight:900}
.ring-lbl{font-size:10px;color:var(--muted);letter-spacing:1px}

.subj-prog{display:flex;align-items:center;gap:12px;background:var(--card);
  border-radius:13px;padding:12px 14px;margin-bottom:8px}
.sp-info{flex:1}
.sp-name{font-size:14px;font-weight:700}
.sp-meta{font-size:11px;color:var(--muted);margin-top:2px}
.sp-pct{font-size:15px;font-weight:800;min-width:38px;text-align:right}

.ai-plan{background:linear-gradient(135deg,#FFD93D10,#FF6B3510);border:1px solid #FFD93D20;
  border-radius:18px;padding:18px;margin-bottom:14px}
.ai-plan p{font-size:13px;line-height:1.9;color:var(--muted)}
.ai-plan strong{color:#fff;font-weight:700}

/* DIVIDER */
.divider{border:none;border-top:1px solid var(--border);margin:14px 0}

/* SCORE SELF-RATE */
.star-row{display:flex;gap:8px;justify-content:center;margin:12px 0}
.star{font-size:28px;cursor:pointer;transition:transform .15s;filter:grayscale(1)}
.star.active{filter:none;transform:scale(1.15)}

/* ASSESSMENT QUIZ */
.choice-btn{display:block;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--border);
  border-radius:13px;padding:13px 16px;color:#fff;font-family:'Poppins',sans-serif;font-size:14px;
  font-weight:600;cursor:pointer;margin-bottom:9px;transition:all .2s}
.choice-btn:active{background:#FF6B3515;border-color:var(--orange)}
.choice-btn.correct{background:#6BCB7720;border-color:#6BCB77;color:#6BCB77}
.choice-btn.wrong{background:#ff525220;border-color:#ff5252;color:#ff5252}
.choice-btn.disabled{pointer-events:none}

/* TOAST */
.toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#1a1a2e;
  border:1px solid var(--orange);border-radius:14px;padding:12px 20px;font-size:14px;
  font-weight:700;color:#fff;z-index:999;animation:toastIn .3s ease;white-space:nowrap}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* ONBOARDING STEP */
.step-dot{width:8px;height:8px;border-radius:50%;background:var(--border);display:inline-block;margin:0 3px;transition:all .3s}
.step-dot.active{background:var(--orange);width:20px;border-radius:4px}

/* MISC */
.section-title{font-size:13px;font-weight:800;letter-spacing:1.5px;color:var(--muted);text-transform:uppercase;margin-bottom:10px}
.alert-box{background:#ff525218;border:1px solid #ff525240;border-radius:13px;padding:12px 16px;font-size:13px;font-weight:600;color:#ff8a8a;margin-bottom:12px}
.success-box{background:#6BCB7718;border:1px solid #6BCB7740;border-radius:13px;padding:12px 16px;font-size:13px;font-weight:600;color:#6BCB77;margin-bottom:12px}

/* SCROLLBAR */
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#FF6B3544;border-radius:4px}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const save = useCallback(v => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, save];
}

function getRank(avg) {
  if (avg >= 90) return { emoji: "🏆", name: "TOPPER", desc: "Outstanding! You're on track for full marks. Keep this pace!", color: "#FFD93D" };
  if (avg >= 75) return { emoji: "⭐", name: "DISTINCTION", desc: "Excellent work! A little more push and you'll be at the top.", color: "#6BCB77" };
  if (avg >= 60) return { emoji: "👍", name: "FIRST CLASS", desc: "Great progress! Target your weak subjects to reach distinction.", color: "#4ECDC4" };
  if (avg >= 45) return { emoji: "📚", name: "PASS CLASS", desc: "You're safe. Regular study can push you to first class easily.", color: "#FECA57" };
  return { emoji: "⚡", name: "NEEDS FOCUS", desc: "Daily study of 2-3 hours will guarantee your pass. You can do it!", color: "#FF6B35" };
}

function fmtTime(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }

function Toast({ msg }) {
  return msg ? <div className="toast">{msg}</div> : null;
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [student, setStudent] = useStorage("p2t_student", null);
  const [scores, setScores] = useStorage("p2t_scores", {});
  const [doneTopics, setDoneTopics] = useStorage("p2t_topics", {});
  const [doneExams, setDoneExams] = useStorage("p2t_exams", {});
  const [chatHistory, setChatHistory] = useStorage("p2t_chat", []);

  const [page, setPage] = useState("login");
  const [tab, setTab] = useState("learn");
  const [selSubject, setSelSubject] = useState(null);
  const [selTopic, setSelTopic] = useState(null);
  const [examSub, setExamSub] = useState(null);
  const [toast, setToast] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const chatEndRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const scoreOf = (id) => scores[id] ?? Math.floor(Math.random() * 25 + 30);
  const avgScore = Math.round(SUBJECTS.reduce((a, s) => a + scoreOf(s.id), 0) / SUBJECTS.length);
  const weakSubs = SUBJECTS.filter(s => scoreOf(s.id) < 50);

  useEffect(() => {
    if (student) setPage("main");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamText]);

  // ─── AI CHAT SEND ──────────────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState("");

  const sendChat = async (msgOverride) => {
    const text = msgOverride || chatInput.trim();
    if (!text || aiLoading) return;
    setChatInput("");
    const userMsg = { role: "user", content: text };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setAiLoading(true);
    setStreamText("");

    // Build context
    const apiMessages = newHistory.map(m => ({ role: m.role, content: m.content }));

    try {
      let full = "";
      await askClaude(apiMessages, chunk => {
        full = chunk;
        setStreamText(chunk);
      });
      setStreamText("");
      setChatHistory([...newHistory, { role: "assistant", content: full }]);
    } catch {
      setChatHistory([...newHistory, { role: "assistant", content: "⚠️ Sorry, couldn't connect. Check your internet and try again!" }]);
    }
    setAiLoading(false);
  };

  const quickAsk = (q) => sendChat(q);

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  if (!student || page === "login") {
    return <LoginScreen onLogin={s => {
      setStudent(s);
      const initScores = {};
      SUBJECTS.forEach(sub => { initScores[sub.id] = Math.floor(Math.random() * 20 + 25); });
      setScores(initScores);
      const welcome = [{
        role: "assistant",
        content: `🎉 Welcome to Pass2Top, ${s.name}! I'm your personal AI tutor for Telangana 10th Board 2026.\n\n✨ My mission: **Minimum Pass Guarantee • Maximum Full Score**\n\nI see you want to improve in **${s.weakSubject || "all subjects"}**. Let's get started! Ask me anything — topic explanations, exam tips, model answers, or study plans. I'm here 24/7! 💪\n\nWhat would you like to study first?`
      }];
      setChatHistory(welcome);
      setPage("main");
    }} />;
  }

  const rank = getRank(avgScore);

  // ─── TOPIC DETAIL ──────────────────────────────────────────────────────────
  if (page === "topic" && selSubject && selTopic) {
    return <TopicScreen
      student={student} subject={SUBJECTS.find(s => s.id === selSubject)}
      topic={selTopic} done={(doneTopics[selSubject] || []).includes(selTopic)}
      onBack={() => setPage("subject")}
      onMarkDone={() => {
        const updated = { ...doneTopics, [selSubject]: [...(doneTopics[selSubject] || []), selTopic] };
        setDoneTopics(updated);
        setScores({ ...scores, [selSubject]: Math.min(100, scoreOf(selSubject) + 5) });
        showToast("✅ Topic marked as studied! +5 score");
        setPage("subject");
      }}
    />;
  }

  // ─── SUBJECT SCREEN ────────────────────────────────────────────────────────
  if (page === "subject" && selSubject) {
    const sub = SUBJECTS.find(s => s.id === selSubject);
    return <SubjectScreen
      student={student} sub={sub} score={scoreOf(selSubject)}
      topics={TOPICS[selSubject] || []}
      doneTopics={doneTopics[selSubject] || []}
      onBack={() => setPage("main")}
      onTopic={t => { setSelTopic(t); setPage("topic"); }}
    />;
  }

  // ─── EXAM SCREEN ───────────────────────────────────────────────────────────
  if (page === "exam-active" && examSub) {
    return <ExamScreen
      student={student} subject={SUBJECTS.find(s => s.id === examSub)}
      onBack={() => setPage("main")}
      onComplete={(score) => {
        const old = scoreOf(examSub);
        setScores({ ...scores, [examSub]: Math.min(100, old + score) });
        setDoneExams({ ...doneExams, [examSub]: true });
        showToast(`🎯 Exam done! +${score} score added`);
        setPage("main");
        setTab("command");
      }}
    />;
  }

  // ─── MAIN UI ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{G}</style>
      <Toast msg={toast} />
      <div className="app">
        <div className="bg-orbs">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
        </div>

        {/* ── LEARN TAB ── */}
        {tab === "learn" && (
          <div className="screen">
            <div style={{ marginBottom: 20 }}>
              <div className="logo-mark">Pass2Top</div>
              <div className="logo-sub">Telangana SSC 2026 · AI Tutor</div>
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span className="badge badge-orange">🎯 {avgScore}% Avg</span>
                <span className={`badge badge-${rank.emoji === "⚡" ? "red" : "green"}`}>{rank.emoji} {rank.name}</span>
                <span className="badge badge-blue">👤 {student.name.split(" ")[0]}</span>
              </div>
            </div>

            {weakSubs.length > 0 && (
              <div className="alert-box">
                ⚠️ Focus needed on: {weakSubs.map(s => s.name).join(", ")}
              </div>
            )}

            <div className="section-title">All Subjects</div>
            <div className="subj-grid">
              {SUBJECTS.map(sub => {
                const sc = scoreOf(sub.id);
                return (
                  <div key={sub.id} className="subj-card" onClick={() => { setSelSubject(sub.id); setPage("subject"); }}
                    style={{ borderColor: sc < 50 ? "#ff525240" : sc >= 70 ? "#6BCB7740" : "#ffffff18" }}>
                    <span className="subj-icon">{sub.icon}</span>
                    <div className="subj-name">{sub.name}</div>
                    <div className="subj-pct" style={{ color: sc < 50 ? "#ff5252" : sc >= 70 ? "#6BCB77" : "#FFD93D" }}>{sc}%</div>
                    <div className="pbar-wrap" style={{ marginTop: 8 }}>
                      <div className="pbar" style={{ width: sc + "%", background: sub.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="section-title" style={{ marginTop: 4 }}>Quick Tips</div>
            <div className="card">
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.9 }}>
                📅 <strong style={{ color: "#fff" }}>Board Exam:</strong> March 2026<br />
                ⏱ <strong style={{ color: "#fff" }}>Daily Target:</strong> 2 subjects × 1 hour<br />
                🎯 <strong style={{ color: "#fff" }}>Pass Mark:</strong> 35/100 per subject<br />
                💡 <strong style={{ color: "#fff" }}>AI Chat:</strong> Ask me anything anytime!
              </div>
            </div>
          </div>
        )}

        {/* ── AI TUTOR TAB ── */}
        {tab === "ai" && (
          <div className="screen">
            <div style={{ marginBottom: 16 }}>
              <div className="logo-mark">AI Tutor</div>
              <div className="logo-sub">Powered by Claude · Ask Anything</div>
            </div>

            {/* Quick ask chips */}
            <div style={{ marginBottom: 14, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: 4 }}>
              {[
                "Explain Quadratic Equations simply",
                "How to score 100 in Maths?",
                "Best revision strategy for board exams",
                "Explain Ohm's Law with example",
                "Write essay on Save Water",
                "Telugu grammar – sandhi rules",
              ].map(q => (
                <span key={q} className="pill" onClick={() => quickAsk(q)}>{q}</span>
              ))}
            </div>

            {/* Chat messages */}
            <div className="chat-wrap">
              {chatHistory.map((m, i) => (
                <div key={i} className={`bubble-row ${m.role === "user" ? "user" : ""}`}>
                  <div className={`avatar ${m.role === "ai" || m.role === "assistant" ? "ai" : "user"}`}>
                    {m.role === "user" ? "🧑" : "🤖"}
                  </div>
                  <div className={`bubble ${m.role === "user" ? "user" : "ai"}`}
                    style={{ whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="bubble-row">
                  <div className="avatar ai">🤖</div>
                  <div className="bubble ai">
                    {streamText ? (
                      <span style={{ whiteSpace: "pre-wrap" }}>{streamText}</span>
                    ) : (
                      <div className="typing-dot">
                        <div className="dot" /><div className="dot" /><div className="dot" />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-row" style={{ position: "sticky", bottom: 80, background: "transparent" }}>
              <input
                placeholder="Ask anything about 10th syllabus..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
              />
              <button className="send-btn" onClick={() => sendChat()} disabled={aiLoading || !chatInput.trim()}>
                {aiLoading ? "⏳" : "➤"}
              </button>
            </div>
          </div>
        )}

        {/* ── EXAM TAB ── */}
        {tab === "exam" && (
          <div className="screen">
            <div style={{ marginBottom: 16 }}>
              <div className="logo-mark">Practice Exams</div>
              <div className="logo-sub">Board-Pattern Questions · Self Assessment</div>
            </div>

            <div className="card" style={{ background: "linear-gradient(135deg,#FF6B3515,#FFD93D10)", borderColor: "#FF6B3530", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.85 }}>
                ✅ Board-pattern questions for each subject<br />
                ✅ 30-minute timer per exam<br />
                ✅ AI-powered answer evaluation<br />
                ✅ Score improvement tracking
              </div>
            </div>

            <div className="section-title">Choose Subject</div>
            {SUBJECTS.map(sub => {
              const done = doneExams[sub.id];
              const sc = scoreOf(sub.id);
              return (
                <div key={sub.id} className="topic-row" style={done ? { borderColor: "#6BCB7740" } : {}}
                  onClick={() => { setExamSub(sub.id); setPage("exam-active"); }}>
                  <div className="topic-left">
                    <span style={{ fontSize: 22 }}>{sub.icon}</span>
                    <div>
                      <div>{sub.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {done ? "✅ Attempted" : "📝 Not attempted"} · Score: {sc}%
                      </div>
                    </div>
                  </div>
                  <div className="topic-right">{done ? "Retry →" : "Start →"}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── COMMAND CENTER TAB ── */}
        {tab === "command" && (
          <div className="screen">
            <div style={{ marginBottom: 16 }}>
              <div className="logo-mark">Command Center</div>
              <div className="logo-sub">Your Complete Performance Report</div>
            </div>

            <div className="rank-card">
              <div className="rank-emoji">{rank.emoji}</div>
              <div className="rank-name" style={{ color: rank.color }}>{rank.name}</div>
              <div className="rank-desc">{rank.desc}</div>
            </div>

            <div className="card">
              <div className="card-title">Overall Progress</div>
              <div className="ring-wrap">
                <div className="ring-inner">
                  <svg width="130" height="130" viewBox="0 0 130 130">
                    <circle cx="65" cy="65" r="55" fill="none" stroke="#ffffff12" strokeWidth="12" />
                    <circle cx="65" cy="65" r="55" fill="none" stroke={rank.color} strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 55}`}
                      strokeDashoffset={`${2 * Math.PI * 55 * (1 - avgScore / 100)}`}
                      strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                  </svg>
                  <div className="ring-center">
                    <div className="ring-pct" style={{ color: rank.color }}>{avgScore}%</div>
                    <div className="ring-lbl">Average</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                {[
                  { n: SUBJECTS.filter(s => scoreOf(s.id) >= 70).length, l: "Strong", c: "#6BCB77" },
                  { n: weakSubs.length, l: "Weak", c: "#ff5252" },
                  { n: Object.values(doneExams).filter(Boolean).length, l: "Exams", c: "#4ECDC4" },
                  { n: Object.values(doneTopics).flat().length, l: "Topics", c: "#FFD93D" },
                ].map(x => (
                  <div key={x.l}>
                    <div style={{ fontSize: 26, fontWeight: 900, color: x.c }}>{x.n}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{x.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-title">Subject Breakdown</div>
            {SUBJECTS.map(sub => {
              const sc = scoreOf(sub.id);
              const topicsDone = (doneTopics[sub.id] || []).length;
              const totalTopics = (TOPICS[sub.id] || []).length;
              return (
                <div key={sub.id} className="subj-prog">
                  <span style={{ fontSize: 22 }}>{sub.icon}</span>
                  <div className="sp-info">
                    <div className="sp-name">{sub.name}</div>
                    <div className="pbar-wrap">
                      <div className="pbar" style={{ width: sc + "%", background: sub.color }} />
                    </div>
                    <div className="sp-meta">{topicsDone}/{totalTopics} topics · {doneExams[sub.id] ? "✅ Exam done" : "📝 Exam pending"}</div>
                  </div>
                  <div className="sp-pct" style={{ color: sc < 50 ? "#ff5252" : sc >= 70 ? "#6BCB77" : "#FFD93D" }}>{sc}%</div>
                </div>
              );
            })}

            <div className="ai-plan">
              <div className="card-title">🤖 AI Study Plan for {student.name.split(" ")[0]}</div>
              <p>
                {weakSubs.length > 0 && <><strong>⚡ Priority Subjects:</strong> {weakSubs.map(s => s.name).join(", ")}<br /></>}
                <strong>📅 Daily Goal:</strong> 2 hours study + 30 min practice<br />
                <strong>📝 Board Exam:</strong> March 2026<br />
                <strong>✅ Pass Status:</strong> {avgScore >= 35 ? "Safe — Keep maintaining!" : "At risk — Study daily to guarantee pass!"}<br />
                <strong>🏆 Full Score Path:</strong> Complete all topics + 3 mock exams per subject
              </p>
            </div>

            <button className="btn btn-ghost" onClick={() => {
              if (confirm("Reset all progress?")) {
                setScores({});
                setDoneTopics({});
                setDoneExams({});
                showToast("Progress reset!");
              }
            }}>🔄 Reset Progress</button>
          </div>
        )}

        {/* NAV */}
        <nav className="nav">
          {[
            { id: "learn", icon: "📚", label: "LEARN" },
            { id: "ai", icon: "🤖", label: "AI TUTOR" },
            { id: "exam", icon: "📝", label: "EXAM" },
            { id: "command", icon: "🎯", label: "COMMAND" },
          ].map(n => (
            <button key={n.id} className={`nav-btn ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", school: "", rollno: "", weakSubject: "", goal: "" });

  const steps = [
    // Step 0 – Welcome
    <div key={0}>
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>🎓</div>
        <div className="logo-mark">Pass2Top</div>
        <div className="logo-sub">Telangana 10th Board 2026</div>
        <div style={{ marginTop: 16, background: "#FF6B3518", border: "1px solid #FF6B3530", borderRadius: 16, padding: "10px 18px", fontSize: 14, fontWeight: 700, color: "#FF6B35" }}>
          ✨ Minimum Pass Guarantee • Maximum Full Score ✨
        </div>
      </div>
      <div className="card">
        <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.9, textAlign: "center" }}>
          🤖 <strong style={{ color: "#fff" }}>Real AI powered by Claude</strong><br />
          📚 All 6 subjects · 80+ topics covered<br />
          📝 Board-pattern question papers<br />
          🎯 Personalized study plan for you<br />
          💬 24/7 AI chat tutor
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => setStep(1)}>Get Started 🚀</button>
    </div>,

    // Step 1 – Name & School
    <div key={1}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40 }}>👋</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>Tell me about yourself</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>This helps me personalize your study plan</div>
      </div>
      <input placeholder="Your Full Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="School Name" value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
      <input placeholder="Roll Number" value={form.rollno} onChange={e => setForm({ ...form, rollno: e.target.value })} />
      <button className="btn btn-primary" onClick={() => { if (form.name.trim()) setStep(2); else alert("Please enter your name!"); }}>Next →</button>
      <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
    </div>,

    // Step 2 – Weak subject
    <div key={2}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>📊</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>Which subject worries you most?</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>I'll prioritize this for you</div>
      </div>
      <div className="subj-grid">
        {SUBJECTS.map(s => (
          <div key={s.id} className={`subj-card ${form.weakSubject === s.id ? "selected" : ""}`}
            style={form.weakSubject === s.id ? { borderColor: s.color, background: s.color + "22" } : {}}
            onClick={() => setForm({ ...form, weakSubject: s.name })}>
            <span className="subj-icon">{s.icon}</span>
            <div className="subj-name">{s.name}</div>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
      <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
    </div>,

    // Step 3 – Goal
    <div key={3}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>🏆</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>What is your goal?</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Be honest — I'll help you get there!</div>
      </div>
      {["Just want to pass (35+)", "Want good marks (60+)", "Want distinction (75+)", "Want to be a topper (90+)"].map(g => (
        <button key={g} className="choice-btn" style={form.goal === g ? { borderColor: "#FF6B35", background: "#FF6B3520", color: "#FF6B35" } : {}}
          onClick={() => setForm({ ...form, goal: g })}>{g}</button>
      ))}
      <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => { if (form.goal) onLogin(form); else alert("Please select your goal!"); }}>
        🚀 Start My Journey
      </button>
      <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
    </div>,
  ];

  return (
    <>
      <style>{G}</style>
      <div className="app">
        <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
        <div className="screen" style={{ paddingBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            {[0, 1, 2, 3].map(i => <span key={i} className={`step-dot ${step === i ? "active" : ""}`} />)}
          </div>
          {steps[step]}
        </div>
      </div>
    </>
  );
}

// ─── SUBJECT SCREEN ───────────────────────────────────────────────────────────
function SubjectScreen({ student, sub, score, topics, doneTopics, onBack, onTopic }) {
  return (
    <>
      <style>{G}</style>
      <div className="app">
        <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
        <div className="screen">
          <div className="page-header">
            <button className="back-btn" onClick={onBack}>←</button>
            <div className="page-title">{sub.icon} {sub.name}</div>
          </div>

          <div className="card" style={{ background: sub.light, borderColor: sub.color + "44", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Your Score</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: sub.color }}>{score}%</div>
                <span className={`badge badge-${score < 50 ? "red" : score >= 70 ? "gold" : "green"}`}>
                  {score < 50 ? "⚠️ Needs Work" : score >= 70 ? "🏆 Strong" : "✅ On Track"}
                </span>
              </div>
              <div style={{ fontSize: 52 }}>{sub.icon}</div>
            </div>
            <div className="pbar-wrap" style={{ marginTop: 14, height: 8 }}>
              <div className="pbar" style={{ width: score + "%", background: sub.color }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginTop: 5 }}>
              <span>Pass: 35%</span>
              <span>{doneTopics.length}/{topics.length} topics done</span>
              <span>Full: 100%</span>
            </div>
          </div>

          <div className="section-title">Topics — Click for AI Tips</div>
          {topics.map(t => {
            const done = doneTopics.includes(t);
            return (
              <div key={t} className={`topic-row ${done ? "done" : ""}`} onClick={() => onTopic(t)}>
                <div className="topic-left">
                  <span style={{ fontSize: 18 }}>{done ? "✅" : "📖"}</span>
                  <span>{t}</span>
                </div>
                <div className="topic-right" style={{ color: done ? "#6BCB77" : "var(--muted)" }}>
                  {done ? "Done" : "Study →"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── TOPIC SCREEN (AI-POWERED) ────────────────────────────────────────────────
function TopicScreen({ student, subject, topic, done, onBack, onMarkDone }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamText]);

  useEffect(() => {
    if (!initialLoaded) {
      setInitialLoaded(true);
      loadInitialTip();
    }
  }, []);

  const loadInitialTip = async () => {
    setLoading(true);
    const prompt = `Student: ${student.name}, Goal: ${student.goal}, Telangana 10th 2026.
Topic: ${topic} (Subject: ${subject.name})

Give a comprehensive study guide for this topic:
1. 📌 What is it (simple definition)
2. 🔑 Key formulas / definitions / important points (in bullet points)
3. 📝 Most likely exam questions and marks
4. 💡 Memory tricks / shortcuts
5. ⚠️ Common mistakes students make
6. ✅ How to write perfect answers in board exam

Keep it clear, concise, and exam-focused!`;

    const msgs = [{ role: "user", content: prompt }];
    try {
      let full = "";
      await askClaude(msgs, chunk => {
        full = chunk;
        setStreamText(chunk);
      });
      setStreamText("");
      setMessages([{ role: "assistant", content: full }]);
    } catch {
      setMessages([{ role: "assistant", content: "⚠️ Couldn't load AI tips. Please check your internet connection." }]);
    }
    setLoading(false);
  };

  const sendFollowUp = async () => {
    const text = chatInput.trim();
    if (!text || loading) return;
    setChatInput("");
    const context = `Context: Telangana 10th 2026, Subject: ${subject.name}, Topic: ${topic}, Student: ${student.name}`;
    const apiMessages = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: `${context}\n\nQuestion: ${text}` }
    ];
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStreamText("");
    try {
      let full = "";
      await askClaude(apiMessages, chunk => { full = chunk; setStreamText(chunk); });
      setStreamText("");
      setMessages(prev => [...prev, { role: "assistant", content: full }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Error. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{G}</style>
      <div className="app">
        <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /></div>
        <div className="screen">
          <div className="page-header">
            <button className="back-btn" onClick={onBack}>←</button>
            <div>
              <div className="page-title" style={{ fontSize: 16 }}>{subject.icon} {topic}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{subject.name} · AI Study Guide</div>
            </div>
          </div>

          {/* AI Tips Stream */}
          <div className="chat-wrap">
            {messages.length === 0 && loading && (
              <div className="bubble-row">
                <div className="avatar ai">🤖</div>
                <div className="bubble ai">
                  {streamText ? <span style={{ whiteSpace: "pre-wrap" }}>{streamText}</span> :
                    <div className="typing-dot"><div className="dot" /><div className="dot" /><div className="dot" /></div>}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`bubble-row ${m.role === "user" ? "user" : ""}`}>
                <div className={`avatar ${m.role === "user" ? "user" : "ai"}`}>{m.role === "user" ? "🧑" : "🤖"}</div>
                <div className={`bubble ${m.role === "user" ? "user" : "ai"}`} style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
              </div>
            ))}
            {messages.length > 0 && loading && (
              <div className="bubble-row">
                <div className="avatar ai">🤖</div>
                <div className="bubble ai">
                  {streamText ? <span style={{ whiteSpace: "pre-wrap" }}>{streamText}</span> :
                    <div className="typing-dot"><div className="dot" /><div className="dot" /><div className="dot" /></div>}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Follow-up chat */}
          {messages.length > 0 && (
            <>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>💬 Ask a follow-up question about this topic:</div>
              <div className="chat-input-row">
                <input placeholder={`Ask about ${topic}...`} value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendFollowUp()} />
                <button className="send-btn" onClick={sendFollowUp} disabled={loading || !chatInput.trim()}>
                  {loading ? "⏳" : "➤"}
                </button>
              </div>
            </>
          )}

          {done ? (
            <div className="success-box" style={{ marginTop: 10 }}>✅ You've already studied this topic! Keep revising.</div>
          ) : (
            <button className="btn btn-success" style={{ marginTop: 10 }} onClick={onMarkDone}>
              ✅ Mark as Studied (+5 score)
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── EXAM SCREEN (AI-POWERED EVALUATION) ─────────────────────────────────────
function ExamScreen({ student, subject, onBack, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [answers, setAnswers] = useState({});
  const [evalResults, setEvalResults] = useState({});
  const [evalLoading, setEvalLoading] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    generateQuestions();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const generateQuestions = async () => {
    setLoadingQ(true);
    const prompt = `Generate a Telangana SSC (10th class) 2026 board exam question paper for ${subject.name}.

Generate exactly 8 questions with this pattern:
- 2 questions × 1 mark (very short answer)  
- 2 questions × 2 marks (short answer)
- 2 questions × 4 marks (detailed answer)
- 2 questions × 5 marks (long answer/diagram)

Return ONLY valid JSON array, no other text:
[
  {"q":"question text","marks":1,"hint":"brief hint for student"},
  ...
]

Questions must be from Telangana 10th 2026 syllabus. Vary topics. Make them realistic board exam questions.`;

    try {
      let full = "";
      await askClaude([{ role: "user", content: prompt }], chunk => { full = chunk; });
      const match = full.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setQuestions(parsed.slice(0, 8));
      } else throw new Error("No JSON");
    } catch {
      // Fallback questions
      setQuestions([
        { q: `Define the most important concept in ${subject.name} that appears in board exams.`, marks: 1, hint: "One line definition" },
        { q: `Write a short note on a key topic in ${subject.name}.`, marks: 2, hint: "3-4 lines" },
        { q: `Explain with example: an important principle in ${subject.name}.`, marks: 4, hint: "Explain with diagram/example" },
        { q: `Write a detailed answer on the most important chapter in ${subject.name}.`, marks: 5, hint: "Full explanation with examples" },
        { q: `What is the practical application of ${subject.name} concepts in daily life?`, marks: 2, hint: "2-3 examples" },
        { q: `Compare and contrast two important concepts in ${subject.name}.`, marks: 4, hint: "Table or points format" },
        { q: `Solve/explain a problem from ${subject.name} step by step.`, marks: 5, hint: "Show all steps" },
        { q: `State and explain a theorem/law/rule from ${subject.name}.`, marks: 1, hint: "State with formula" },
      ]);
    }
    setLoadingQ(false);
  };

  const evaluateAnswer = async (index) => {
    const q = questions[index];
    const ans = answers[index] || "";
    if (!ans.trim()) return;
    setEvalLoading({ ...evalLoading, [index]: true });

    const prompt = `Evaluate this Telangana 10th board exam answer:

Subject: ${subject.name}
Question (${q.marks} marks): ${q.q}
Student's Answer: ${ans}

Evaluate fairly and provide:
1. Score: X/${q.marks} marks
2. What's correct (in student's answer)
3. What's missing or wrong
4. Model answer (concise, board-exam style)

Format your response clearly with these exact sections.`;

    try {
      let full = "";
      await askClaude([{ role: "user", content: prompt }], chunk => { full = chunk; });
      setEvalResults({ ...evalResults, [index]: full });
    } catch {
      setEvalResults({ ...evalResults, [index]: "⚠️ Evaluation failed. Check your internet." });
    }
    setEvalLoading({ ...evalLoading, [index]: false });
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    const answered = Object.keys(answers).filter(k => answers[k].trim()).length;
    const gained = Math.round((answered / questions.length) * 15);
    setTotalScore(gained);
    setSubmitted(true);
  };

  const urgent = timeLeft < 300;

  if (loadingQ) return (
    <>
      <style>{G}</style>
      <div className="app">
        <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /></div>
        <div className="screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🤖</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Generating Your Exam...</div>
          <div style={{ fontSize: 14, color: "var(--muted)", textAlign: "center" }}>AI is creating board-pattern questions for {subject.name}</div>
          <div className="typing-dot" style={{ marginTop: 20 }}><div className="dot" /><div className="dot" /><div className="dot" /></div>
        </div>
      </div>
    </>
  );

  if (submitted) return (
    <>
      <style>{G}</style>
      <div className="app">
        <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /></div>
        <div className="screen" style={{ paddingBottom: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 20 }}>
            <div style={{ fontSize: 64 }}>🎉</div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 12 }}>Exam Submitted!</div>
            <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>{subject.name} Practice Complete</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Questions Answered</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#6BCB77" }}>
              {Object.keys(answers).filter(k => answers[k].trim()).length}/{questions.length}
            </div>
            <div style={{ fontSize: 13, color: "#6BCB77", marginTop: 4 }}>+{totalScore} score added to {subject.name}</div>
          </div>
          <div className="card">
            <div className="card-title">📊 Now review your answers with AI evaluation below:</div>
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--orange)", marginBottom: 6 }}>Q{i + 1} ({q.marks}M): {q.q}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Your answer: {answers[i] || "(not answered)"}</div>
                {evalResults[i] ? (
                  <div className="ai-ans">
                    <div className="ai-ans-title">🤖 AI Evaluation</div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{evalResults[i]}</div>
                  </div>
                ) : (
                  <button className="btn btn-ghost btn-sm" disabled={evalLoading[i]}
                    onClick={() => evaluateAnswer(i)}>
                    {evalLoading[i] ? "⏳ Evaluating..." : "🤖 Get AI Evaluation"}
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => onComplete(totalScore)}>
            ✅ Finish & See Results
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{G}</style>
      <div className="app">
        <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /></div>
        <div className="screen">
          <div className="page-header">
            <button className="back-btn" onClick={onBack}>←</button>
            <div>
              <div className="page-title" style={{ fontSize: 16 }}>{subject.icon} {subject.name} Exam</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>AI-Generated · Board Pattern</div>
            </div>
          </div>

          <div className={`timer-bar ${urgent ? "urgent" : ""}`}>
            ⏱ {fmtTime(timeLeft)} {urgent ? "— HURRY UP!" : "remaining"}
          </div>

          {questions.map((q, i) => (
            <div key={i} className="q-card">
              <div className="q-meta">
                <div className="q-num">Question {i + 1}</div>
                <div className="q-marks">{q.marks} {q.marks === 1 ? "Mark" : "Marks"}</div>
              </div>
              <div className="q-text">{q.q}</div>
              {q.hint && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10, fontStyle: "italic" }}>💡 Hint: {q.hint}</div>}
              <textarea
                placeholder="Write your answer here..."
                value={answers[i] || ""}
                onChange={e => setAnswers({ ...answers, [i]: e.target.value })}
              />
            </div>
          ))}

          <button className="btn btn-success" onClick={handleSubmit}>
            ✅ Submit Exam Paper
          </button>
          <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
        </div>
      </div>
    </>
  );
}
