import { useState, useEffect } from "react";
import "./App.css";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

const roleImages = [
  { name: "kirby", imgs: ["/roles/kirby1.png", "/roles/kirby2.png", "/roles/kirby3.png"] },
  { name: "pikachu", imgs: ["/roles/pikachu1.png", "/roles/pikachu2.png", "/roles/pikachu3.png"] },
  { name: "傑尼龜", imgs: ["/roles/squirtle1.png", "/roles/squirtle2.png", "/roles/squirtle3.png"] },
  { name: "妙蛙種子", imgs: ["/roles/bulbasaur1.png", "/roles/bulbasaur2.png", "/roles/bulbasaur3.png"] },
  { name: "小火龍", imgs: ["/roles/charmander1.png", "/roles/charmander2.png", "/roles/charmander3.png"] },
  { name: "綠毛蟲", imgs: ["/roles/caterpie1.png", "/roles/caterpie2.png", "/roles/caterpie3.png"] },
];

/* 🔥 路加福音 24 章 × 每章 2 題完整題庫 */
const quizData = {
  1: [
    { q: "天使首先向哪位祭司顯現？", options: ["撒迦利亞", "亞倫", "撒母耳", "以利"], answer: 0 },
    { q: "撒迦利亞與以利沙伯被形容為？", options: ["不敬虔", "沒有孩子", "富有商人", "外邦人"], answer: 1 }
  ],
  2: [
    { q: "耶穌出生在哪裡？", options: ["拿撒勒", "伯利恆", "耶路撒冷", "撒馬利亞"], answer: 1 },
    { q: "哪一群人最先聽到耶穌降生的消息？", options: ["博士", "法利賽人", "牧羊人", "羅馬兵"], answer: 2 }
  ],
  3: [
    { q: "施洗約翰呼籲人們做什麼？", options: ["禁食", "悔改", "攻擊羅馬人", "獻祭"], answer: 1 },
    { q: "耶穌受洗時，聖靈形狀好像什麼？", options: ["鴿子", "火舌", "雲彩", "光柱"], answer: 0 }
  ],
  4: [
    { q: "耶穌被帶到曠野幾天？", options: ["10 天", "20 天", "30 天", "40 天"], answer: 3 },
    { q: "耶穌在會堂讀哪卷書？", options: ["以賽亞書", "詩篇", "創世記", "出埃及記"], answer: 0 }
  ],
  5: [
    { q: "耶穌呼召彼得時，他正在做什麼？", options: ["禱告", "捕魚", "建房子", "教訓人"], answer: 1 },
    { q: "耶穌醫治大痲瘋的人時，做了什麼？", options: ["遠距離醫治", "用泥土抹他", "伸手摸他", "叫他洗澡"], answer: 2 }
  ],
  6: [
    { q: "門徒在田間摘麥穗時，被指控什麼？", options: ["偷竊", "違背安息日", "不洗手", "說謊"], answer: 1 },
    { q: "耶穌在山上整夜做了什麼？", options: ["禁食", "禱告", "睡覺", "講道"], answer: 1 }
  ],
  7: [
    { q: "百夫長請耶穌做什麼？", options: ["醫治他的僕人", "醫治他的兒子", "處罰惡人", "趕鬼"], answer: 0 },
    { q: "耶穌在拿因城使誰復活？", options: ["管會堂的女兒", "寡婦的兒子", "拉撒路", "少年人"], answer: 1 }
  ],
  8: [
    { q: "撒種比喻中，落在好土的是？", options: ["被鳥吃", "乾掉", "結出果實", "被擠住"], answer: 2 },
    { q: "耶穌平靜風浪時，門徒怎樣？", options: ["生氣", "害怕", "逃跑", "歡呼"], answer: 1 }
  ],
  9: [
    { q: "耶穌差遣幾位門徒去傳道？", options: ["12", "70", "10", "7"], answer: 0 },
    { q: "誰被稱為好鄰舍？", options: ["利未人", "祭司", "好撒瑪利亞人", "官長"], answer: 2 }
  ],
  10: [
    { q: "瑪大忙著什麼？", options: ["掃地", "招待事務", "洗衣服", "買食物"], answer: 1 },
    { q: "耶穌教導的禱告是？", options: ["主禱文", "詩篇", "亞倫祝福", "祭司禱文"], answer: 0 }
  ],
  11: [
    { q: "有人指控耶穌靠誰趕鬼？", options: ["神", "別西卜", "天使", "撒拉弗"], answer: 1 },
    { q: "耶穌說人的眼睛像什麼？", options: ["光", "燈", "窗戶", "門"], answer: 2 }
  ],
  12: [
    { q: "耶穌說不可怕那些能做什麼的人？", options: ["逼迫", "殺身體", "誤會", "辱罵"], answer: 1 },
    { q: "耶穌用什麼比喻儆醒？", options: ["忠心僕人", "農夫", "牧羊人", "商人"], answer: 0 }
  ],
  13: [
    { q: "耶穌醫治彎腰十八年的女人是在何時？", options: ["安息日", "夜間", "節期", "早晨"], answer: 0 },
    { q: "神的國像什麼？", options: ["山", "芥菜種", "葡萄", "海"], answer: 1 }
  ],
  14: [
    { q: "耶穌在筵席上教導關於什麼？", options: ["奉獻", "謙卑", "信心", "安息日"], answer: 1 },
    { q: "大筵席比喻中，邀請誰？", options: ["富人", "親屬", "貧窮瘸腿瞎眼", "法利賽人"], answer: 2 }
  ],
  15: [
    { q: "失羊比喻中，牧人做什麼？", options: ["責備羊", "賣羊", "歡喜", "忽略"], answer: 2 },
    { q: "浪子回家時父親的反應？", options: ["拒絕", "責備", "歡喜接納", "要他工作"], answer: 2 }
  ],
  16: [
    { q: "財主與拉撒路比喻中，拉撒路到了哪？", options: ["陰間受苦", "亞伯拉罕懷裡", "外邦地", "門外"], answer: 1 },
    { q: "誰不能使人從死裡復活？", options: ["先知", "摩西", "法利賽人", "財主"], answer: 3 }
  ],
  17: [
    { q: "十個長大痲瘋的人回來感謝的有幾個？", options: ["1", "5", "10", "0"], answer: 0 },
    { q: "神的國在哪裡？", options: ["天上", "地上", "你們心裡", "未來"], answer: 2 }
  ],
  18: [
    { q: "那寡婦向誰求伸冤？", options: ["官長", "羅馬人", "不義的官", "法利賽人"], answer: 2 },
    { q: "耶穌說誰能進神的國？", options: ["學者", "財主", "小孩子", "兵丁"], answer: 2 }
  ],
  19: [
    { q: "撒該的職業是？", options: ["漁夫", "稅吏長", "醫生", "軍官"], answer: 1 },
    { q: "耶穌騎什麼進耶路撒冷？", options: ["馬", "驢駒", "駱駝", "車"], answer: 1 }
  ],
  20: [
    { q: "人應把稅給誰？", options: ["祭司", "凱撒", "自己", "門徒"], answer: 1 },
    { q: "耶穌引用誰的經文討論復活？", options: ["摩西", "大衛", "亞伯拉罕", "以賽亞"], answer: 0 }
  ],
  21: [
    { q: "寡婦投進聖殿的是？", options: ["很多", "金子", "兩個小錢", "禮物"], answer: 2 },
    { q: "耶穌預告聖殿會如何？", options: ["重建", "永存", "沒有一塊石頭不倒", "被潔淨"], answer: 2 }
  ],
  22: [
    { q: "逾越節耶穌設立了什麼？", options: ["禁食", "聖餐", "洗腳禮", "新歌"], answer: 1 },
    { q: "耶穌在哪裡禱告？", options: ["山頂", "客西馬尼", "海邊", "市集"], answer: 1 }
  ],
  23: [
    { q: "誰把耶穌的身體放進墳墓？", options: ["彼得", "約瑟", "尼哥底母", "官長"], answer: 1 },
    { q: "兵丁對耶穌做了什麼？", options: ["敬禮", "戲弄", "保護", "獎賞"], answer: 1 }
  ],
  24: [
    { q: "誰最先看到空墳墓？", options: ["彼得", "約翰", "婦女們", "羅馬兵"], answer: 2 },
    { q: "耶穌在哪裡向兩位門徒顯現？", options: ["加利利海", "以馬忤斯路上", "耶利哥", "聖殿"], answer: 1 }
  ]
};

/* 🔥 名字避免重疊 */
const getNameOffset = (index) => {
  const offsets = [0, -12, 12, -20, 20, -30];
  return offsets[index % offsets.length];
};

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");

  /* 載入本機資料 */
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(all);
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

  /* 新增孩子 */
  const addChild = (role) => {
    const name = prompt("請輸入孩子名字");
    if (!name) return;

    const updated = [...children, {
      id: Date.now(),
      name,
      role: role.name,
      phone: user,
      chapter: 1,
      points: 0,
      todayQuiz: ""
    }];

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  /* 刪除孩子 */
  const deleteChild = (id) => {
    if (!confirm("確定刪除嗎？")) return;
    const updated = children.filter(c => c.id !== id);
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  /* 回答題目 */
  const answerQuiz = (id, chapter, answers) => {
    const today = new Date().toISOString().slice(0, 10);
    const questions = quizData[chapter];

    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    if (correct < 2) {
      alert("兩題都要答對才能得點！");
      return;
    }

    const updated = children.map((c) => {
      if (c.id !== id) return c;
      if (c.todayQuiz === today) {
        alert("今天已答過題！");
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

  /* 小動物成長圖層級 */
  const getRoleImg = (roleName, points) => {
    const r = roleImages.find(r => r.name === roleName);
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

  /* 賽道位置（圓形） */
  const getPosition = (chapter) => {
    const percent = (chapter - 1) / TOTAL_CHAPTERS;
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return {
      x: 210 + 145 * Math.cos(angle),
      y: 210 + 145 * Math.sin(angle)
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📖 路加福音 24 章圓形賽跑</h1>

      {/* ===== 首頁 ===== */}
      {page === "home" && (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", width: 420, height: 420 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: 'url("/bible-bg.png")',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "240px",
                  opacity: 0.15,
                  pointerEvents: "none"
                }}
              />

              <svg width="420" height="420">
                <circle
                  cx="210"
                  cy="210"
                  r="145"
                  stroke="#ffb74d"
                  strokeWidth="22"
                  fill="none"
                  className="track-animate"
                />

                <text x="190" y="30">🏁 START</text>

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
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {c.name}
                      </text>
                    </g>
                  );
                })}

                <text
                  x="210"
                  y="215"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  LUKE 24
                </text>
              </svg>
            </div>
          </div>

          {/* 排行榜 */}
          <h3 style={{ textAlign: "center" }}>🏆 排行榜</h3>
          {[...children]
            .sort((a, b) => b.points - a.points)
            .map((c, i) => (
              <div key={c.id} style={{ textAlign: "center" }}>
                第{i + 1}名：{c.name}（{c.points}點）
              </div>
            ))}

          {!user && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <input
                placeholder="請輸入手機"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <br /><br />
              <button onClick={login}>登入</button>
            </div>
          )}
        </>
      )}

      {/* ===== 管理頁 ===== */}
      {user && page === "manage" && (
        <>
          <div>
            登入中：{user}
            <button onClick={() => setPage("home")} style={{ marginLeft: 10 }}>回首頁</button>
            <button onClick={logout} style={{ marginLeft: 10 }}>登出</button>
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
          {children.filter(c => c.phone === user).map((c) => (
            <div key={c.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
              <img
                src={getRoleImg(c.role, c.points)}
                width="60"
                className={getEvolveClass(c.points)}
              />
              <h4>{c.name}</h4>
              <p>章節：{c.chapter}/24</p>
              <p>點數：{c.points}</p>

              <h4>📘 第 {c.chapter} 章題目</h4>

              {quizData[c.chapter].map((q, qi) => (
                <div key={qi}>
                  <p>{q.q}</p>
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => {
                        if (!window.quizAnswers) window.quizAnswers = {};
                        if (!window.quizAnswers[c.id]) window.quizAnswers[c.id] = [];
                        window.quizAnswers[c.id][qi] = oi;
                        alert(`已選擇：${opt}`);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                  <br /><br />
                </div>
              ))}

              <button
                onClick={() =>
                  answerQuiz(c.id, c.chapter, window.quizAnswers?.[c.id] || [])
                }
              >
                ✅ 提交答案
              </button>

              <br /><br />
              <button onClick={() => deleteChild(c.id)}>❌ 刪除</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
