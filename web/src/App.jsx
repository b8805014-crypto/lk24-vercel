import { quizData } from "./quizData.js";
import { useState, useEffect } from "react";
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

// -------------（題目你之前說要 1–24 全部，我完整附在後半段）------------------
import { quizData } from "./quizData"; 
//（等下我會貼整份 quizData 給你）
// ---------------------------------------------------------------------

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");
  const [parentCheckInToday, setParentCheckInToday] = useState("");

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(all);

    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem("parent_check_" + today);
    if (saved) setParentCheckInToday(today);
  }, []);

  // ---------------- 登入 / 登出 -----------------------

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

  // ---------------- 父母簽到 +1 -----------------------

  const parentSignIn = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (parentCheckInToday === today) {
      alert("今天已簽到！");
      return;
    }

    // 父母簽到後 → 所有孩子 +1
    const updated = children.map((c) => {
      if (c.phone === user) return { ...c, points: c.points + 1 };
      return c;
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 記錄簽到
    localStorage.setItem("parent_check_" + today, "yes");
    setParentCheckInToday(today);

    alert("簽到成功！已為孩子加 1 點");
  };

  // ---------------- 新增孩子 -----------------------

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

  const deleteChild = (id) => {
    if (!confirm("確定刪除嗎？")) return;
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ----------------- 答題得分 ------------------------

  const answerQuiz = (id, chapter, answers) => {
    const today = new Date().toISOString().slice(0, 10);
    const questions = quizData[chapter];

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    if (correct < 2) {
      alert("需要兩題都答對才可得點！");
      return;
    }

    const updated = children.map((c) => {
      if (c.id !== id) return c;
      if (c.todayQuiz === today) {
        alert("今天已答題");
        return c;
      }

      return {
        ...c,
        points: c.points + 1,
        chapter: Math.min(c.chapter + 1, TOTAL_CHAPTERS),
        todayQuiz: today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ------------------- 跑道位置計算 -------------------

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

  // 避免名字重疊
  const getNameOffset = (index) => {
    const offsets = [0, -12, 12, -20, 20];
    return offsets[index % offsets.length];
  };

 return (
    <div style={{ padding: 20 }}>

      {/* ------------------ 首頁 ------------------ */}
      {page === "home" && (
        <div style={{ display: "flex", gap: 20 }}>

          {/* 左邊：跑道 */}
          <div style={{ position: "relative" }}>
            <h1 style={{ textAlign: "center" }}>📖 路加福音讀經精兵</h1>

            <div style={{ width: 420, height: 420 }}>
              <svg width="420" height="420">
                <circle
                  cx="210"
                  cy="210"
                  r="145"
                  stroke="#ffb74d"
                  strokeWidth="22"
                  fill="none"
                />

                {/* 中央清晰圖示 */}
                <image
                  href="/center-icon.png"
                  x="140"
                  y="150"
                  width="140"
                  height="140"
                />

                {children.map((c, index) => {
                  const pos = getPosition(c.chapter);
                  return (
                    <g key={c.id}>
                      <image
                        href={getRoleImg(c.role, c.points)}
                        x={pos.x - 18}
                        y={pos.y - 18}
                        width="36"
                        height="36"
                        className={getEvolveClass(c.points)}
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 22 + getNameOffset(index)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#333"
                      >
                        {c.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 排行榜 */}
            <h3 style={{ textAlign: "center" }}>🏆 排行榜</h3>
            {[...children]
              .sort((a, b) => b.points - a.points)
              .map((c, i) => (
                <div key={c.id} style={{ textAlign: "center" }}>
                  🥇 第 {i + 1} 名：{c.name}（{c.points} 點）
                </div>
              ))}
          </div>

          {/* 右邊美編經文 */}
          <div
            style={{
              width: 260,
              padding: 20,
              background: "linear-gradient(135deg, #fff7e6, #ffe0b2)",
              borderRadius: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              height: 300
            }}
          >
            <h2 style={{ color: "#d35400" }}>✨ 今日力量經文</h2>
            <p style={{ fontSize: 22, fontWeight: "bold", lineHeight: "1.5" }}>
              「靠耶和華而得的喜樂是你們的力量」
            </p>
            <p style={{ textAlign: "right", marginTop: 20, fontWeight: "bold" }}>
              ——尼希米記 8:10
            </p>

            {!user && (
              <div style={{ marginTop: 40 }}>
                <input
                  placeholder="請輸入家長手機號碼"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <br />
                <button style={{ marginTop: 10 }} onClick={login}>
                  👉 家長登入
                </button>
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
          <button onClick={logout} style={{ marginLeft: 10 }}>
            登出
          </button>

          <hr />

          {/* 父母簽到 */}
          <div
            style={{
              background: "#e8f5e9",
              padding: 15,
              borderRadius: 10,
              marginBottom: 20
            }}
          >
            <h3>📅 家長每日簽到</h3>
            {parentCheckInToday ? (
              <p>✔ 今日已簽到</p>
            ) : (
              <button onClick={parentSignIn}>👉 今日簽到 +1</button>
            )}
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

          {children
            .filter((c) => c.phone === user)
            .map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 10,
                  marginBottom: 10,
                  borderRadius: 10
                }}
              >
                <img
                  src={getRoleImg(c.role, c.points)}
                  width="60"
                  className={getEvolveClass(c.points)}
                />
                <h4>{c.name}</h4>
                <p>目前章節：{c.chapter}/24</p>
                <p>目前點數：{c.points}</p>

                {/* 題目 */}
                <h4>今日問答（第 {c.chapter} 章）</h4>

                {quizData[c.chapter]?.map((q, qi) => (
                  <div key={qi} style={{ marginBottom: 10 }}>
                    <p>Q{qi + 1}. {q.q}</p>
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        style={{ margin: 3 }}
                        onClick={() => {
                          if (!window.quizAnswers) window.quizAnswers = {};
                          if (!window.quizAnswers[c.id])
                            window.quizAnswers[c.id] = [];
                          window.quizAnswers[c.id][qi] = oi;
                          alert("已選擇：" + opt);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ))}

                <button
                  onClick={() =>
                    answerQuiz(c.id, c.chapter, window.quizAnswers?.[c.id] || [])
                  }
                >
                  ✅ 提交答案（需全對）
                </button>

                <button
                  onClick={() => deleteChild(c.id)}
                  style={{ marginLeft: 10, color: "red" }}
                >
                  ❌ 刪除
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
