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

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");

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

  const addChild = (role) => {
    const name = prompt("請輸入孩子名字");
    if (!name) return;

    const child = {
      id: Date.now(),
      name,
      role: role.name,
      phone: user,
      chapter: 1,
      points: 0,
      todayRead: "",
      todayParent: ""
    };

    const updated = [...children, child];
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteChild = (id) => {
    if (!confirm("確定要刪除這個孩子嗎？")) return;
    const updated = children.filter((c) => c.id !== id);
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const readChapter = (id) => {
    const today = new Date().toISOString().slice(0, 10);

    const updated = children.map((c) => {
      if (c.id !== id) return c;
      if (c.todayRead === today) {
        alert("今天已經讀過了");
        return c;
      }
      return {
        ...c,
        chapter: Math.min(c.chapter + 1, TOTAL_CHAPTERS),
        points: c.points + 1,
        todayRead: today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const parentAddPoint = (id) => {
    const today = new Date().toISOString().slice(0, 10);

    const updated = children.map((c) => {
      if (c.id !== id) return c;
      if (c.todayParent === today) {
        alert("今天家長已經加過點了");
        return c;
      }
      return {
        ...c,
        points: c.points + 1,
        todayParent: today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getRoleImg = (roleName, points) => {
    const role = roleImages.find(r => r.name === roleName);
    if (!role) return "";
    if (points >= 16) return role.imgs[2];
    if (points >= 8) return role.imgs[1];
    return role.imgs[0];
  };

  const getEvolveClass = (points) => {
    if (points >= 16) return "evolve-3";
    if (points >= 8) return "evolve-2";
    return "evolve-1";
  };

  const getPosition = (chapter) => {
    const percent = (chapter - 1) / TOTAL_CHAPTERS;
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    const r = 145;
    const cx = 210;
    const cy = 210;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📖 路加福音 24 章圓形賽跑</h1>

      {/* ===== 首頁(美化版) ===== */}
      {page === "home" && (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <svg width="420" height="420" style={{ borderRadius: "50%" }}>
              <defs>
                <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fffde7" />
                  <stop offset="100%" stopColor="#ffe0b2" />
                </radialGradient>

                <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffcc80" />
                  <stop offset="100%" stopColor="#ffb74d" />
                </linearGradient>
              </defs>

              <circle cx="210" cy="210" r="200" fill="url(#bgGrad)" />

              <circle
                cx="210"
                cy="210"
                r="145"
                stroke="url(#trackGrad)"
                strokeWidth="22"
                fill="none"
              />

              <text x="195" y="30" fontSize="14">🏁 START</text>
              <text x="195" y="410" fontSize="14">🚩 FINISH</text>

              {/* 章節刻度 */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
                const r1 = 145;
                const r2 = 165;
                const cx = 210;
                const cy = 210;
                const x1 = cx + r1 * Math.cos(angle);
                const y1 = cy + r1 * Math.sin(angle);
                const x2 = cx + r2 * Math.cos(angle);
                const y2 = cy + r2 * Math.sin(angle);

                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#8d6e63"
                    strokeWidth="2"
                  />
                );
              })}

              {/* 角色 */}
              {children.map((c) => {
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
                    <rect
                      x={pos.x - 22}
                      y={pos.y - 38}
                      rx="6"
                      ry="6"
                      width="44"
                      height="18"
                      fill="rgba(255,255,255,0.85)"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - 25}
                      fontSize="10"
                      textAnchor="middle"
                      fill="#5d4037"
                    >
                      {c.name}
                    </text>
                  </g>
                );
              })}

              <text
                x="210"
                y="215"
                fontSize="16"
                textAnchor="middle"
                fill="#6d4c41"
                fontWeight="bold"
              >
                路加福音 24 章
              </text>
            </svg>
          </div>

          {/* 排行榜 */}
          <h3 style={{ textAlign: "center" }}>🏆 排行榜</h3>
          {[...children]
            .sort((a, b) => b.points - a.points)
            .map((c, i) => (
              <div key={c.id} style={{ textAlign: "center" }}>
                第 {i + 1} 名：{c.name}（{c.points} 點）
              </div>
            ))}

          {!user && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <h3>家長登入</h3>
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

      {/* ===== 管理頁(登入後) ===== */}
      {user && page === "manage" && (
        <>
          <div style={{ marginBottom: 10 }}>
            登入中：{user}
            <button onClick={() => setPage("home")} style={{ marginLeft: 10 }}>回首頁</button>
            <button onClick={logout} style={{ marginLeft: 10 }}>登出</button>
          </div>

          <h3>新增孩子</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {roleImages.map((r) => (
              <div key={r.name} style={{ textAlign: "center", width: 100 }}>
                <img src={r.imgs[0]} width="60" />
                <div>{r.name}</div>
                <button onClick={() => addChild(r)}>選擇</button>
              </div>
            ))}
          </div>

          <hr />

          <h3>孩子管理（可刪除）</h3>
          {children.filter(c => c.phone === user).map((c) => (
            <div key={c.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
              <img
                src={getRoleImg(c.role, c.points)}
                width="60"
                className={getEvolveClass(c.points)}
              />
              <h4>{c.name}</h4>
              <p>章節：{c.chapter - 1} / 24</p>
              <p>點數：{c.points}</p>

              <button onClick={() => readChapter(c.id)}>📖 今日讀經 +1</button>{" "}
              <button onClick={() => parentAddPoint(c.id)}>👨‍👩‍👧 家長陪讀 +1</button>{" "}
              <button onClick={() => deleteChild(c.id)}>❌ 刪除</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
