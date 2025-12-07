import { useState, useEffect } from "react";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

const roleImages = [
  { name: "皮卡丘", img: "/roles/pikachu.png" },
  { name: "瑪利歐", img: "/roles/mario.png" },
  { name: "音速小子", img: "/roles/sonic.png" },
  { name: "卡比", img: "/roles/kirby.png" },
  { name: "薩爾達", img: "/roles/zelda.png" }
];

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

  // 首頁讀取所有孩子
  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(all);
  }, []);

  const login = () => {
    if (!phone) return alert("請輸入手機");
    setUser(phone);
  };

  const logout = () => {
    setUser(null);
    setPhone("");
  };

  const addChild = (role) => {
    const name = prompt("請輸入孩子名字");
    if (!name) return;

    const child = {
      id: Date.now(),
      name,
      role: role.name,
      roleImg: role.img,
      phone: user,
      chapter: 1,
      points: 0,
      today: ""
    };

    const updated = [...children, child];
    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const readChapter = (id) => {
    const today = new Date().toISOString().slice(0, 10);

    const updated = children.map((child) => {
      if (child.id !== id) return child;

      if (child.today === today) {
        alert("今天已閱讀過");
        return child;
      }

      return {
        ...child,
        chapter: child.chapter + 1,
        points: child.points + 1,
        today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const stageText = (points) => {
    if (points >= 24) return "🏆 第三階段完成";
    if (points >= 16) return "🥈 第二階段完成";
    if (points >= 8) return "🥉 第一階段完成";
    return "準備起跑";
  };

  const trackPosition = (chapter) => {
    const percent = ((chapter - 1) / TOTAL_CHAPTERS) * 100;
    return Math.min(percent, 100);
  };

  return (
    <div style={{ padding: 20 }}>
      {/* ==== 首頁賽跑圈 ==== */}
      <h1 style={{ textAlign: "center" }}>📖 路加福音 24 章閱讀賽跑</h1>

      <div style={{
        backgroundImage: "url('/track.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        padding: 20,
        borderRadius: 20,
        marginBottom: 20
      }}>
        {children.map((c) => (
          <div key={c.id} style={{ marginBottom: 15 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src={c.roleImg} width="50" />
              <strong style={{ marginLeft: 10 }}>{c.name}</strong>
              <span style={{ marginLeft: 10 }}>{stageText(c.points)}</span>
            </div>

            <div style={{
              background: "#ddd",
              height: 12,
              borderRadius: 10,
              overflow: "hidden",
              marginTop: 5
            }}>
              <div style={{
                width: trackPosition(c.chapter) + "%",
                height: "100%",
                background: "#4caf50"
              }} />
            </div>

            <div style={{ fontSize: 12 }}>
              進度：{c.chapter - 1} / 24 章
            </div>
          </div>
        ))}
      </div>

      {/* ==== 登入區 ==== */}
      {!user ? (
        <div style={{ textAlign: "center" }}>
          <h3>家長登入</h3>
          <input
            placeholder="請輸入手機號碼"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <br /><br />
          <button onClick={login}>登入</button>
        </div>
      ) : (
        <div style={{ marginTop: 30 }}>
          <div>
            登入帳號：{user}
            <button onClick={logout} style={{ marginLeft: 20 }}>登出</button>
          </div>

          <h3>新增孩子（選擇角色）</h3>
          <div style={{ display: "flex", gap: 15 }}>
            {roleImages.map((r) => (
              <div key={r.name} style={{ textAlign: "center" }}>
                <img src={r.img} width="60" />
                <div>{r.name}</div>
                <button onClick={() => addChild(r)}>選擇</button>
              </div>
            ))}
          </div>

          <hr />

          {children
            .filter((c) => c.phone === user)
            .map((c) => (
              <div key={c.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                <img src={c.roleImg} width="80" />
                <h3>{c.name}</h3>
                <p>進度：{c.chapter - 1} / 24</p>
                <p>點數：{c.points}</p>

                <button onClick={() => readChapter(c.id)}>
                  ✅ 今日完成一章
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
