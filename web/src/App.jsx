import { quizData } from "./quizData.js";
import { useState, useEffect, useRef } from "react";
import "./App.css";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

const roleImages = [
  { name: "kirby", imgs: ["/roles/kirby1.png"] },
  { name: "pikachu", imgs: ["/roles/pikachu1.png"] },
  { name: "傑尼龜", imgs: ["/roles/squirtle1.png"] },
];

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");
  const [fireworks, setFireworks] = useState(false);

  const fireworkAudio = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(saved);
  }, []);

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

  const addChild = (role) => {
    const name = prompt("孩子名字");
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
        todayQuiz: "",
      },
    ];

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const triggerFireworks = () => {
    setFireworks(true);

    if (!fireworkAudio.current) {
      fireworkAudio.current = new Audio("/firework.mp3");
    }

    fireworkAudio.current.currentTime = 0;
    fireworkAudio.current.play();

    setTimeout(() => setFireworks(false), 3000);
  };

  const answerQuiz = (id, chapter, answers) => {
    const today = new Date().toISOString().slice(0, 10);
    const questions = quizData[chapter];

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    if (correct < questions.length) {
      alert("請全部答對才可得點");
      return;
    }

    const updated = children.map((c) => {
      if (c.id !== id) return c;
      if (c.todayQuiz === today) return c;

      return {
        ...c,
        points: c.points + 1,
        chapter: Math.min(c.chapter + 1, TOTAL_CHAPTERS),
        todayQuiz: today,
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    triggerFireworks();
  };

  return (
    <div style={{ padding: 15 }}>

      {/* 🔥 煙火動畫 */}
      {fireworks && (
        <div className="fireworks">
          🎆🎇🎆
        </div>
      )}

      {/* ---------------- 首頁 ---------------- */}
      {page === "home" && (
        <div style={{ textAlign: "center" }}>
          <img
            src="/center-icon.png"
            alt="主題"
            style={{ width: "80%", maxWidth: 260 }}
          />

          <h1 style={{ margin: "10px 0" }}>📖 路加福音讀經精兵</h1>

          <div
            style={{
              background: "#fff7e6",
              margin: "10px auto",
              padding: 15,
              borderRadius: 15,
              maxWidth: 320,
            }}
          >
            <b>今日力量經文</b>
            <p>靠耶和華而得的喜樂是你們的力量</p>
            <p style={{ textAlign: "right" }}>尼 8:10</p>
          </div>

          {!user && (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="家長手機"
              />
              <br />
              <button onClick={login}>家長登入</button>
            </>
          )}
        </div>
      )}

      {/* ---------------- 管理頁 ---------------- */}
      {user && page === "manage" && (
        <div>
          <h2>家長中心</h2>
          <button onClick={() => setPage("home")}>首頁</button>
          <button onClick={logout}>登出</button>

          <hr />

          <h3>新增孩子</h3>
          {roleImages.map((r) => (
            <button key={r.name} onClick={() => addChild(r)}>
              {r.name}
            </button>
          ))}

          <hr />

          {children
            .filter((c) => c.phone === user)
            .map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <h4>{c.name}</h4>
                <p>章節 {c.chapter} / 24</p>
                <p>點數 {c.points}</p>

                <h4>今日問答</h4>
                {quizData[c.chapter]?.map((q, qi) => (
                  <div key={qi}>
                    <p>{q.q}</p>
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => {
                          if (!window.quizAnswers) window.quizAnswers = {};
                          if (!window.quizAnswers[c.id])
                            window.quizAnswers[c.id] = [];
                          window.quizAnswers[c.id][qi] = oi;
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ))}

                <button
                  onClick={() =>
                    answerQuiz(
                      c.id,
                      c.chapter,
                      window.quizAnswers?.[c.id] || []
                    )
                  }
                >
                  ✅ 送出答案
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
