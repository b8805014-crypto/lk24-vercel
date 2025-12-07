import { useState, useEffect } from "react";

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

  useEffect(() => {
    if (!user) return;
    const data = JSON.parse(localStorage.getItem(user)) || [];
    setChildren(data);
  }, [user]);

  const login = () => {
    if (!phone) return alert("請輸入手機");
    setUser(phone);
  };

  const logout = () => {
    setUser(null);
    setPhone("");
    setChildren([]);
  };

  const addChild = (role) => {
    const name = prompt("請輸入孩子名字");

    const child = {
      id: Date.now(),
      name,
      role: role.name,
      roleImg: role.img,
      points: 0,
      chapter: 1,
      today: ""
    };

    const newList = [...children, child];
    setChildren(newList);
    localStorage.setItem(user, JSON.stringify(newList));
  };

  const readChapter = (id, withParent) => {
    const today = new Date().toISOString().slice(0, 10);

    const updated = children.map((child) => {
      if (child.id !== id) return child;

      if (child.today === today) {
        alert("今天已記錄過！");
        return child;
      }

      // 每次只加 1 點
      const newPoints = child.points + 1;

      return {
        ...child,
        points: newPoints,
        chapter: child.chapter + 1,
        today
      };
    });

    setChildren(updated);
    localStorage.setItem(user, JSON.stringify(updated));
  };

  const stageText = (points) => {
    if (points >= 24) return "🏆 第三階段完成";
    if (points >= 16) return "🥈 第二階段完成";
    if (points >= 8) return "🥉 第一階段完成";
    return "尚未升級";
  };

  const progressPercent = (chapter) => {
    return Math.min(((chapter - 1) / 24) * 100, 100);
  };

  if (!user) {
    return (
      <div style={{ padding: 30 }}>
        <h2>📱 家長登入</h2>
        <input
          placeholder="請輸入手機號碼"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <br /><br />
        <button onClick={login}>登入</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>📖 路加福音閱讀平台</h2>
      <div>
        登入帳號：{user}
        <button onClick={logout} style={{ marginLeft: 20 }}>登出</button>
      </div>

      <hr />

      <h3>➕ 選擇角色新增孩子</h3>
      <div style={{ display: "flex", gap: 15 }}>
        {roleImages.map((r) => (
          <div key={r.name} style={{ textAlign: "center" }}>
            <img src={r.img} width="80" />
            <div>{r.name}</div>
            <button onClick={() => addChild(r)}>選擇</button>
          </div>
        ))}
      </div>

      <hr />

      {children.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ccc", padding: 15, marginBottom: 15 }}>
          <h3>{c.name}</h3>

          <img src={c.roleImg} width="100" />

          <p>角色：{c.role}</p>
          <p>累積點數：{c.points}</p>
          <p>升級狀態：{stageText(c.points)}</p>

          <div style={{
            background: "#eee",
            height: 20,
            width: "100%",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 10
          }}>
            <div style={{
              width: progressPercent(c.chapter) + "%",
              height: "100%",
              background: "#4caf50"
            }} />
          </div>

          <p>讀經進度：{c.chapter - 1} / 24 章</p>

          {c.chapter <= 24 && (
            <>
              <button onClick={() => readChapter(c.id, false)}>
                📕 孩子閱讀 +1
              </button>
              <button
                onClick={() => readChapter(c.id, true)}
                style={{ marginLeft: 10 }}
              >
                👨‍👩‍👧 家長陪讀 +1
              </button>
            </>
          )}

          {c.chapter > 24 && <p>🎉 已完成全部章節！</p>}
        </div>
      ))}
    </div>
  );
}
