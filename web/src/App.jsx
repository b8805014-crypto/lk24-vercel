import { quizData } from "./quizData";
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
];

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

  /* ---------------- 登入 ---------------- */
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

  /* ---------------- 父母每日陪讀 ---------------- */
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
    alert("完成每日陪讀，所有孩子 +1！");
  };

  /* ---------------- 新增 / 刪除孩子 ---------------- */
  const addChild = (role) => {
    const name = prompt("孩子名字");
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

  const deleteChild = (id) => {
    if (!confirm("刪除後紀錄將完全消失，確定嗎？")) return;
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

    if (correct < 2) return alert("需兩題皆正確");

    const updated = children.map(c => {
      if (c.id !== id) return c;
      if (c.todayQuiz === today) return c;

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
    alert("答題成功 +1！");
  };

  const triggerFireworks = () => {
    setFireworks(true);
    setTimeout(() => setFireworks(false), 2500);
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 20 }}>
      {fireworks && <h1 style={{ textAlign: "center" }}>🎆🎆🎆</h1>}

      {page === "home" && (
        <>
          <h1 style={{ textAlign: "center" }}>📖 路加福音讀經精兵</h1>

          <div style={{ maxWidth: 360, margin: "0 auto" }}>
            <p><b>今日經文</b></p>
            <p>靠耶和華而得的喜樂是你們的力量</p>

            <input
              placeholder="家長手機"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <br />
            <button onClick={login}>登入</button>
          </div>
        </>
      )}

      {user && page === "manage" && (
        <>
          <h2>家長中心 ({user})</h2>
          <button onClick={logout}>登出</button>

          <hr />
          <h3>📅 每日陪讀</h3>
          {parentReadDate ? <p>今日已完成</p> :
            <button onClick={parentRead}>今日陪讀 +1</button>
          }

          <hr />
          <h3>新增孩子</h3>
          {roleImages.map(r => (
            <button key={r.name} onClick={() => addChild(r)}>
              新增 {r.name}
            </button>
          ))}

          <hr />
          {children.filter(c => c.phone === user).map(c => (
            <div key={c.id} style={{ border: "1px solid #ccc", padding: 10 }}>
              <h4>{c.name}</h4>
              <p>章節：{c.chapter}</p>
              <p>點數：{c.points}</p>

              {quizData[c.chapter].map((q, i) => (
                <div key={i}>
                  <p>{q.q}</p>
                  {q.options.map((o, oi) => (
                    <button
                      key={oi}
                      onClick={() => {
                        window.quizAnswers ||= {};
                        window.quizAnswers[c.id] ||= [];
                        window.quizAnswers[c.id][i] = oi;
                      }}
                    >{o}</button>
                  ))}
                </div>
              ))}

              <button onClick={() =>
                answerQuiz(c.id, c.chapter, window.quizAnswers?.[c.id] || [])
              }>
                提交答案
              </button>

              <button style={{ color: "red" }} onClick={() => deleteChild(c.id)}>
                刪除角色
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
