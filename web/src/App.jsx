import { quizData } from "./quizData";
import { useState, useEffect, useRef } from "react";
import "./App.css";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");
  const [parentReadDate, setParentReadDate] = useState("");
  const [fireworks, setFireworks] = useState(false);

  useEffect(() => {
    setChildren(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("parent_read_" + today)) {
      setParentReadDate(today);
    }
  }, []);

  /* ---------------- 登入 / 登出 ---------------- */
  const login = () => {
    if (!phone) return alert("請輸入手機");
    setUser(phone);
    setPage("manage");
  };

  const logout = () => {
    setUser(null);
    setPhone("");
    setPage("home");
  };

  /* ---------------- 陪讀 +1 ---------------- */
  const parentRead = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (parentReadDate === today) return alert("今天已陪讀");

    const updated = children.map(c =>
      c.phone === user ? { ...c, points: c.points + 1 } : c
    );

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem("parent_read_" + today, "yes");
    setParentReadDate(today);

    triggerFireworks();
  };

  /* ---------------- 孩子 ---------------- */
  const addChild = () => {
    const name = prompt("孩子名字");
    if (!name) return;

    const updated = [
      ...children,
      {
        id: Date.now(),
        name,
        phone: user,
        chapter: 1,
        points: 0,
        todayQuiz: ""
      }
    ];

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteChild = (id) => {
    if (!confirm("刪除後記錄將完全消失，確定嗎？")) return;
    const updated = children.filter(c => c.id !== id);
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  /* ---------------- 答題 ---------------- */
  const answerQuiz = (id, chapter, answers) => {
    const today = new Date().toISOString().slice(0, 10);
    const qs = quizData[chapter];

    let correct = 0;
    qs.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    if (correct !== qs.length) {
      alert("請全部答對才可得點");
      return;
    }

    const updated = children.map(c => {
      if (c.id !== id || c.todayQuiz === today) return c;
      return {
        ...c,
        points: c.points + 1,
        chapter: Math.min(c.chapter + 1, TOTAL_CHAPTERS),
        todayQuiz: today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    triggerFireworks();
  };

  /* ---------------- 煙火 ---------------- */
  const fireworkAudio = useRef(null);

  const triggerFireworks = () => {
    setFireworks(true);

    if (!fireworkAudio.current) {
      fireworkAudio.current = new Audio("/firework.mp3");
    }
    fireworkAudio.current.currentTime = 0;
    fireworkAudio.current.play();

    setTimeout(() => setFireworks(false), 3000);
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 16 }}>

      {fireworks && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          fontSize: 32,
          textAlign: "center"
        }}>
          🎆 🎇 🎆
        </div>
      )}

      {/* ---------------- 首頁 ---------------- */}
      {page === "home" && (
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center" }}>📖 路加福音讀經精兵</h2>

          {/* ✅ 保留賽跑圈，但不畫任何圖示 */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width="260" height="260">
              <circle
                cx="130"
                cy="130"
                r="90"
                stroke="#ffb74d"
                strokeWidth="18"
                fill="none"
              />
            </svg>
          </div>

          <div style={{
            background: "#f7f7f7",
            padding: 14,
            borderRadius: 8,
            marginBottom: 16
          }}>
            <b>今日力量經文</b>
            <p>靠耶和華而得的喜樂是你們的力量</p>
          </div>

          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="請輸入家長手機"
            style={{
              width: "100%",
              padding: 12,
              fontSize: 16,
              marginBottom: 10
            }}
          />

          <button
            onClick={login}
            style={{ width: "100%", padding: 14, fontSize: 18 }}
          >
            登入
          </button>
        </div>
      )}

      {/* ---------------- 管理 / 答題 ---------------- */}
      {user && page === "manage" && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h3>家長中心</h3>

          <button onClick={logout}>登出</button>

          <hr />

          <button
            onClick={parentRead}
            disabled={!!parentReadDate}
            style={{ width: "100%", padding: 12 }}
          >
            {parentReadDate ? "今日已陪讀" : "今日陪讀 +1"}
          </button>

          <hr />

          <button onClick={addChild} style={{ width: "100%", padding: 12 }}>
            新增孩子
          </button>

          <hr />

          {children.filter(c => c.phone === user).map(c => (
            <div key={c.id}
              style={{
                background: "#fafafa",
                padding: 16,
                marginBottom: 20,
                borderRadius: 8
              }}
            >
              <h4>{c.name}</h4>
              <p>章節：{c.chapter} / 24</p>
              <p>點數：{c.points}</p>

              {(quizData[c.chapter] || []).map((q, qi) => (
                <div key={qi}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 10
                  }}
                >
                  <b>{q.q}</b>
                  {q.options.map((o, oi) => (
                    <button
                      key={oi}
                      style={{ display: "block", width: "100%", marginTop: 6 }}
                      onClick={() => {
                        window.quizAns ||= {};
                        window.quizAns[c.id] ||= [];
                        window.quizAns[c.id][qi] = oi;
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ))}

              <button
                style={{ width: "100%", padding: 12 }}
                onClick={() =>
                  answerQuiz(c.id, c.chapter, window.quizAns?.[c.id] || [])
                }
              >
                ✅ 送出答案
              </button>

              <button
                onClick={() => deleteChild(c.id)}
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 8,
                  color: "red"
                }}
              >
                刪除孩子
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
