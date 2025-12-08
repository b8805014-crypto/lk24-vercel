import { quizData } from "./quizData";
import { useState, useEffect, useRef } from "react";
import "./App.css";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

// 角色圖
const roleImages = [
  { name: "kirby", imgs: ["/roles/kirby1.png", "/roles/kirby2.png", "/roles/kirby3.png"] },
  { name: "pikachu", imgs: ["/roles/pikachu1.png", "/roles/pikachu2.png", "/roles/pikachu3.png"] },
  { name: "傑尼龜", imgs: ["/roles/squirtle1.png", "/roles/squirtle2.png", "/roles/squirtle3.png"] },
  { name: "妙蛙種子", imgs: ["/roles/bulbasaur1.png", "/roles/bulbasaur2.png", "/roles/bulbasaur3.png"] },
  { name: "小火龍", imgs: ["/roles/charmander1.png", "/roles/charmander2.png", "/roles/charmander3.png"] },
  { name: "綠毛蟲", imgs: ["/roles/caterpie1.png", "/roles/caterpie2.png", "/roles/caterpie3.png"] },
];

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");
  const [parentReadToday, setParentReadToday] = useState("");
  const containerRef = useRef(null);

  // fireworks + audio
  const [fireworksActive, setFireworksActive] = useState(false);
  const fireworkAudio = useRef(null);

  // flying points
  const [flyingItems, setFlyingItems] = useState([]); // {id, startX, startY, destX, destY, text, animate}

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(all);

    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("parent_read_" + today)) {
      setParentReadToday(today);
    }
  }, []);

  // ---------------- 登入 / 登出 ----------------
  const login = () => {
    if (!phone) return alert("請輸入手機");
    // try to warm up audio (non-blocking)
    if (!fireworkAudio.current) {
      fireworkAudio.current = new Audio("/firework.mp3");
      fireworkAudio.current.play().catch(() => {}).then?.(() => {
        fireworkAudio.current.pause();
        fireworkAudio.current.currentTime = 0;
      });
    }

    setUser(phone);
    setPage("manage");
  };

  const logout = () => {
    setUser(null);
    setPhone("");
    setPage("home");
  };

  // ---------------- 父母每日陪讀 +1 ----------------
  const parentRead = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (parentReadToday === today) {
      alert("今天已完成陪讀！");
      return;
    }

    const updated = children.map((c) => (c.phone === user ? { ...c, points: c.points + 1 } : c));
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("parent_read_" + today, "yes");
    setParentReadToday(today);

    // fireworks + flying points for each child of this user
    triggerFireworks();
    updated.filter(c => c.phone === user).forEach((c, i) => {
      setTimeout(() => triggerFlyingPoint("+1", c.id), i * 200);
    });

    // show confirmation after short delay so audio can start
    setTimeout(() => alert("今日陪讀完成！已為孩子加 1 點"), 150);
  };

  // ---------------- 新增孩子 ----------------
  const addChild = (role) => {
    const name = prompt("請輸入孩子名字");
    if (!name) return;

    const updated = [
      ...children,
      {
        id: Date.now(),
        name,
        role: role.name,
        phone: user,
        chapter: 1,
        points: 0,
        todayQuiz: ""
      }
    ];
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ---------------- 刪除孩子 ----------------
  const deleteChild = (id) => {
    const ok = confirm("確定刪除該角色？刪除後紀錄將完全消失，無法復原。");
    if (!ok) return;
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ---------------- 答題得分（需答對 >= 2） ----------------
  const answerQuiz = (id, chapter, answers) => {
    const today = new Date().toISOString().slice(0, 10);
    const questions = quizData[chapter] || [];

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    if (correct < 2) {
      alert("需要兩題都答對才可得點！");
      return;
    }

    let awarded = false;
    const updated = children.map((c) => {
      if (c.id !== id) return c;
      if (c.todayQuiz === today) {
        alert("今天已答題");
        return c;
      }
      awarded = true;
      return {
        ...c,
        points: c.points + 1,
        chapter: Math.min(c.chapter + 1, TOTAL_CHAPTERS),
        todayQuiz: today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (awarded) {
      triggerFlyingPoint("+1", id);
      triggerFireworks();
      setTimeout(() => alert("答題完成！已獲得 1 點"), 200);
    }
  };

  // ---------------- 跑道位置計算 ----------------
  const getPosition = (chapter) => {
    const percent = (chapter - 1) / TOTAL_CHAPTERS;
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return {
      x: 210 + 145 * Math.cos(angle),
      y: 210 + 145 * Math.sin(angle)
    };
  };

  const getRoleImg = (roleName, points) => {
    const r = roleImages.find((r) => r.name === roleName);
    if (!r) return "";
    if (points >= 16) return r.imgs[2];
    if (points >= 8) return r.imgs[1];
    return r.imgs[0];
  };

  const getEvolveClass = (points) => {
    if (points >= 16) return "evolve-3";
    if (points >= 8) return "evolve-2";
    return "evolve-1";
  };

  const getNameOffset = (index) => {
    const offsets = [0, -12, 12, -20, 20];
    return offsets[index % offsets.length];
  };

  // ---------------- 煙火 (至少 3 秒) ----------------
  const triggerFireworks = () => {
    setFireworksActive(true);
    if (!fireworkAudio.current) fireworkAudio.current = new Audio("/firework.mp3");
    fireworkAudio.current.currentTime = 0;
    fireworkAudio.current.play().catch(() => {});
    setTimeout(() => setFireworksActive(false), 3000);
  };

  // ---------------- 點數飛出動畫 ----------------
  const triggerFlyingPoint = (text, childId) => {
    const container = containerRef.current;
    if (!container) return;

    const startRect = container.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    // find child card target
    const card = document.querySelector(`[data-child='${childId}']`);
    let destX = startX + (Math.random() * 80 - 40);
    let destY = startY - 120 + (Math.random() * 60 - 30);
    if (card) {
      const p = card.querySelector(".child-points");
      const rect = p ? p.getBoundingClientRect() : card.getBoundingClientRect();
      destX = rect.left + rect.width / 2;
      destY = rect.top + rect.height / 2;
    }

    const id = Date.now() + Math.random();
    const item = { id, startX, startY, destX, destY, text, animate: false };
    setFlyingItems((prev) => [...prev, item]);

    // trigger animation on next tick
    setTimeout(() => {
      setFlyingItems((prev) => prev.map(it => (it.id === id ? { ...it, animate: true } : it)));
    }, 20);

    // cleanup
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  };

  return (
    <div ref={containerRef} style={{ padding: 18, fontFamily: "Arial, sans-serif" }}>
      {/* inline CSS for animations and overlay */}
      <style>{`
        .fireworks-box {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spark {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 6px;
          animation: sparkUp 1000ms ease-out forwards;
        }
        .spark.c0 { background: #ffd54f; animation-delay: 0ms; }
        .spark.c1 { background: #ff8a80; animation-delay: 80ms; }
        .spark.c2 { background: #80d8ff; animation-delay: 160ms; }
        .spark.c3 { background: #b39ddb; animation-delay: 240ms; }
        @keyframes sparkUp {
          0% { transform: translateY(0) scale(0.6); opacity: 1; }
          50% { transform: translateY(-80px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-180px) scale(0.8); opacity: 0; }
        }

        .flying-badge {
          position: fixed;
          z-index: 1500;
          transform: translate(-50%, -50%);
          transition: transform 1.05s cubic-bezier(.2,.8,.2,1), opacity 1.05s;
          background: linear-gradient(135deg,#fff59d,#ffd54f);
          padding: 6px 10px;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.12);
          font-weight: bold;
          opacity: 1;
        }
        .flying-badge.hidden { opacity: 0; }
      `}</style>

      {/* fireworks overlay */}
      {fireworksActive && (
        <div className="fireworks-box" aria-hidden>
          <div className="spark c0" />
          <div className="spark c1" />
          <div className="spark c2" />
          <div className="spark c3" />
          <div className="spark c0" />
        </div>
      )}

      {/* flying items */}
      {flyingItems.map((f) => {
        const dx = f.destX - f.startX;
        const dy = f.destY - f.startY;
        const transform = f.animate ? `translate(${dx}px, ${dy}px)` : `translate(0,0)`;
        return (
          <div
            key={f.id}
            className={`flying-badge ${f.animate ? "" : ""}`}
            style={{
              left: f.startX,
              top: f.startY,
              transform,
              opacity: f.animate ? 1 : 1
            }}
          >
            {f.text}
          </div>
        );
      })}

      {/* ------------------ 首頁 ------------------ */}
      {page === "home" && (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* left track */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <h1 style={{ textAlign: "center" }}>📖 路加福音讀經精兵</h1>

            <div style={{ width: 420, height: 420, maxWidth: "100%" }}>
              <svg width="420" height="420" viewBox="0 0 420 420">
                <circle cx="210" cy="210" r="145" stroke="#ffb74d" strokeWidth="22" fill="none" />
                {/* center icon left as-is */}
                <image href="/center-icon.png" x="140" y="150" width="140" height="140" />
                {/* role icons still shown along track */}
                {children.map((c, index) => {
                  const pos = getPosition(c.chapter);
                  return (
                    <g key={c.id}>
                      <image href={getRoleImg(c.role, c.points)} x={pos.x - 18} y={pos.y - 18} width="36" height="36" className={getEvolveClass(c.points)} />
                      <text x={pos.x} y={pos.y - 22 + getNameOffset(index)} textAnchor="middle" fontSize="10" fill="#333">{c.name}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* leaderboard */}
            <h3 style={{ textAlign: "center", marginTop: 10 }}>🏆 排行榜</h3>
            {[...children].sort((a, b) => b.points - a.points).map((c, i) => (
              <div key={c.id} style={{ textAlign: "center" }}>🥇 第 {i + 1} 名：{c.name}（{c.points} 點）</div>
            ))}
          </div>

          {/* right scripture box */}
          <div style={{
            width: 260,
            padding: 20,
            background: "linear-gradient(135deg, #fff7e6, #ffe0b2)",
            borderRadius: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h2 style={{ color: "#d35400" }}>✨ 今日力量經文</h2>
            <p style={{ fontSize: 22, fontWeight: "bold", lineHeight: "1.5" }}>「靠耶和華而得的喜樂是你們的力量」</p>
            <p style={{ textAlign: "right", marginTop: 20, fontWeight: "bold" }}>——尼希米記 8:10</p>

            {!user && (
              <div style={{ marginTop: 20 }}>
                <input placeholder="請輸入家長手機號碼" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <br />
                <button style={{ marginTop: 10 }} onClick={login}>👉 家長登入</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ 管理頁 ------------------ */}
      {user && page === "manage" && (
        <div>
          <h2>家長中心（{user}）</h2>

          <button onClick={() => setPage("home")}>回首頁</button>
          <button onClick={logout} style={{ marginLeft: 10 }}>登出</button>

          <hr />

          {/* 父母每日陪讀 */}
          <div style={{ background: "#e8f5e9", padding: 15, borderRadius: 10, marginBottom: 20 }}>
            <h3>📅 家長每日陪讀</h3>
            {parentReadToday ? <p>✔ 今日已陪讀</p> : <button onClick={parentRead}>👉 今日陪讀 +1</button>}
          </div>

          <h3>新增孩子</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {roleImages.map((r) => (
              <div key={r.name} style={{ textAlign: "center" }}>
                <img src={r.imgs[0]} width="60" />
                <div>{r.name}</div>
                <button onClick={() => addChild(r)}>選擇</button>
              </div>
            ))}
          </div>

          <hr />

          <h3>孩子管理</h3>
          {children.filter((c) => c.phone === user).map((c) => (
            <div key={c.id} data-child={c.id} className="child-card" style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10, borderRadius: 10 }}>
              <img src={getRoleImg(c.role, c.points)} width="60" className={getEvolveClass(c.points)} />
              <h4>{c.name}</h4>
              <p>目前章節：{c.chapter}/24</p>
              <p className="child-points">目前點數：{c.points}</p>

              {/* 題目 */}
              <h4>今日問答（第 {c.chapter} 章）</h4>
              { (quizData[c.chapter] || []).map((q, qi) => (
                <div key={qi} style={{ marginBottom: 10 }}>
                  <p>Q{qi+1}. {q.q}</p>
                  {q.options.map((opt, oi) => (
                    <button key={oi} style={{ margin: 3 }} onClick={() => {
                      if (!window.quizAnswers) window.quizAnswers = {};
                      if (!window.quizAnswers[c.id]) window.quizAnswers[c.id] = [];
                      window.quizAnswers[c.id][qi] = oi;
                      alert("已選擇：" + opt);
                    }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )) }

              <button onClick={() => answerQuiz(c.id, c.chapter, window.quizAnswers?.[c.id] || [])}>✅ 提交答案（需全對）</button>

              <button onClick={() => deleteChild(c.id)} style={{ marginLeft: 10, color: "red" }}>❌ 刪除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
