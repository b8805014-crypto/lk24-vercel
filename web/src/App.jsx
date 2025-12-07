import { useState, useEffect } from "react";

const roles = [
  "皮卡丘",
  "瑪利歐",
  "勇者鬥惡龍",
  "星之卡比",
  "寶可夢訓練家"
];

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

  // 讀取資料
  useEffect(() => {
    if (!phone) return;
    const data = JSON.parse(localStorage.getItem(phone)) || [];
    setChildren(data);
  }, [phone]);

  const login = () => {
    if (!phone) return alert("請輸入手機號碼");
    setUser(phone);
  };

  const addChild = () => {
    const name = prompt("請輸入孩子名字");
    const role = prompt("請輸入角色（例如：皮卡丘）");

    const child = {
      id: Date.now(),
      name,
      role,
      points: 0,
      currentChapter: 1,
      todayKey: ""
    };

    const newList = [...children, child];
    setChildren(newList);
    localStorage.setItem(phone, JSON.stringify(newList));
  };

  const readChapter = (id, withParent) => {
    const today = new Date().toISOString().slice(0, 10);

    const updated = children.map((child) => {
      if (child.id !== id) return child;

      // 限制一天只能一次
      if (child.todayKey === today) {
        alert("今天已記錄過！");
        return child;
      }

      let addPoints = withParent ? 2 : 1;

      let newPoints = child.points + addPoints;
      let newChapter = child.currentChapter + 1;

      return {
        ...child,
        points: newPoints,
        currentChapter: newChapter,
        todayKey: today
      };
    });

    setChildren(updated);
    localStorage.setItem(phone, JSON.stringify(updated));
  };

  const getStage = (chapter) => {
    if (chapter <= 9) return 1;
    if (chapter <= 17) return 2;
    return 3;
  };

  const checkUpgrade = (points) => {
    if (points >= 24) return "第三階段完成 ✅";
    if (points >= 16) return "第二階段完成 ✅";
    if (points >= 8) return "第一階段完成 ✅";
    return "尚未升級";
  };

  if (!user) {
    return (
      <div style={{ padding: 30 }}>
        <h2>📱 家長登入（手機號碼）</h2>
        <input
          placeholder="請輸入手機"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <br /><br />
        <button onClick={login}>登入</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>📖 路加福音 24 章閱讀系統</h2>
      <p>登入帳號：{user}</p>

      <button onClick={addChild}>➕ 新增孩子</button>

      <hr />

      {children.map((c) => (
        <div key={c.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h3>{c.name}（角色：{c.role}）</h3>
          <p>目前章節：{c.currentChapter - 1} / 24</p>
          <p>累計點數：{c.points}</p>
          <p>目前階段：第 {getStage(c.currentChapter)} 階段</p>
          <p>升級狀態：{checkUpgrade(c.points)}</p>

          {c.currentChapter <= 24 && (
            <>
              <button onClick={() => readChapter(c.id, false)}>
                📘 孩子自己讀（+1）
              </button>

              <button onClick={() => readChapter(c.id, true)} style={{ marginLeft: 10 }}>
                👨‍👩‍👧 家長陪讀（+2）
              </button>
            </>
          )}

          {c.currentChapter > 24 && (
            <p>🎉 已完成 24 章！</p>
          )}
        </div>
      ))}
    </div>
  );
}
