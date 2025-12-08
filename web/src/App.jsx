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

  // fireworks / flying points
  const [fireworksActive, setFireworksActive] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]); // {id, style, text}

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(all);

    const today = new Date().toISOString().slice(0, 10);
    const saved = localStorage.getItem("parent_read_" + today);
    if (saved) setParentReadToday(today);
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

  // 家長每日陪讀 +1
  const parentRead = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (parentReadToday === today) {
      alert("今天已完成陪讀！");
      return;
    }

    // 為該家長底下的所有孩子 +1
    const updated = children.map((c) => {
      if (c.phone === user) return { ...c, points: c.points + 1 };
      return c;
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    localStorage.setItem("parent_read_" + today, "yes");
    setParentReadToday(today);

    // 啟動煙火 + 點數飛出（中央飛到每個孩子卡位）
    triggerFireworks();
    // 讓每個孩子都看見飛分：針對該家長孩子逐一觸發飛分
    updated.filter(c => c.phone === user).forEach((c, idx) => {
      // 延遲一點次序性
      setTimeout(() => {
        triggerFlyingPoint("+1", c.id);
      }, idx * 250);
    });

    alert("今日陪讀完成！已為孩子加 1 點");
  };

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

  // 答題得分（若符合規則會 +1 並觸發煙火＋飛分）
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

    if (!awarded) {
      // 沒有找到或已答過，直接更新狀態（已在上面做），然後 return
      setChildren(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return;
    }

    // 更新並觸發動畫
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 觸發煙火（短暫）與點數飛出到該孩子卡片
    triggerFireworks();
    triggerFlyingPoint("+1", id);
  };

  // ------------------- 跑道位置計算 -------------------
  const getPosition = (chapter) => {
    const progress = (chapter - 1) / TOTAL_CHAPTERS; // 0~1
    const cx = 210;
    const cy = 210;

    const straight = 100; // 半條直線長
    const radius = 90;    // 半圓半徑

    const totalLen = 2 * straight + 2 * Math.PI * radius;
    let d = progress * totalLen;

    // 上直線（由左到右）
    if (d <= straight) {
      return { x: cx - straight + d, y: cy - radius };
    }

    d -= straight;

    // 右半圓
    if (d <= Math.PI * radius) {
      const angle = -Math.PI / 2 + d / radius;
      return {
        x: cx + straight + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    }

    d -= Math.PI * radius;

    // 下直線（由右到左）
    if (d <= straight) {
      return { x: cx + straight - d, y: cy + radius };
    }

    d -= straight;

    // 左半圓
    const angle = Math.PI / 2 + d / radius;
    return {
      x: cx - straight + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
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

  // 觸發煙火，短暫顯示
  const triggerFireworks = () => {
    setFireworksActive(true);
    setTimeout(() => setFireworksActive(false), 1500);
  };

  // 觸發飛分（從畫面中心飛到對應 child 卡的 .child-points）
  const triggerFlyingPoint = (text, childId) => {
    const container = containerRef.current;
    if (!container) return;

    const startRect = container.getBoundingClientRect();
    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;

    // 找到目標元素
    const card = document.querySelector(`[data-child='${childId}']`);
    let destX = startX + (Math.random() * 100 - 50);
    let destY = startY - 150 + (Math.random() * 60 - 30);
    if (card) {
      const p = card.querySelector(".child-points");
      const rect = p ? p.getBoundingClientRect() : card.getBoundingClientRect();
      destX = rect.left + rect.width / 2;
      destY = rect.top + rect.height / 2;
    }

    const id = Date.now() + Math.random();
    const item = {
      id,
      text,
      startX,
      startY,
      destX,
      destY,
    };

    setFlyingItems((prev) => [...prev, item]);

    // 自動移除（動畫時間結束）
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((f) => f.id !== id));
    }, 1200);
  };

  return (
    <div ref={containerRef} style={{ padding: 20 }}>
      {/* fireworks overlay */}
      <div className={`fireworks-overlay ${fireworksActive ? "active" : ""}`}>
        {fireworksActive &&
          Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className={`firework spark-${i % 5}`} />
          ))}
      </div>

      {/* flying points */}
      {flyingItems.map((f) => (
        <div
          key={f.id}
          className="flying-item"
          style={{
            left: f.startX,
            top: f.startY,
            transform: `translate(-50%, -50%)`,
            // NOTE: we animate using CSS variables to compute translate to dest
            // pass dest positions as data-attrs
            ["--dest-x"]: `${f.destX}px`,
            ["--dest-y"]: `${f.destY}px`,
          }}
        >
          <div className="flying-text">{f.text}</div>
        </div>
      ))}

      {/* ------------------ 首頁 ------------------ */}
      {page === "home" && (
        {/* 左邊：跑道 */}
        <div className="left-track">
          <h1 className="title-center">📖 路加福音讀經精兵</h1>

          <div
            style={{
              width: 420,
              height: 420,
              position: "relative",
            }}
          >
            {/* 賽跑圖底圖 */}
            <img
              src="/track.png"
              alt="track"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />

            {/* 角色疊在跑道上 */}
            {children.map((c, index) => {
              const pos = getPosition(c.chapter);
              return (
                <div
                  key={c.id}
                  style={{
                    position: "absolute",
                    left: pos.x - 18,
                    top: pos.y - 18,
                    textAlign: "center",
                   pointerEvents: "none"
                 }}
               >
                 <img
                   src={getRoleImg(c.role, c.points)}
                   width="36"
                   className={getEvolveClass(c.points)}
                 />
                 <div
                   style={{
                     fontSize: 10,
                     marginTop: -2,
                     transform: `translateY(${getNameOffset(index)}px)`
                   }}
                 >
                   {c.name}
                 </div>
               </div>
             );
          })}
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
          
          {/* 右邊美編經文（靠旁） */}
          <div className="right-verse">
            <h2 className="verse-title">✨ 今日力量經文</h2>
            <p className="verse-main">
              「靠耶和華而得的喜樂是你們的力量」
            </p>
            <p className="verse-ref">—— 尼希米記 8:10</p>

            {!user && (
              <div style={{ marginTop: 20 }}>
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

          {/* 父母每日陪讀 */}
          <div className="read-box">
            <h3>📅 家長每日陪讀</h3>
            {parentReadToday ? (
              <p>✔ 今日已陪讀</p>
            ) : (
              <button onClick={parentRead}>👉 今日陪讀 +1</button>
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
                data-child={c.id}
                className="child-card"
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
                <p className="child-points">目前點數：{c.points}</p>

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
                  ✅ 提交答案（需兩題皆正確）
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
