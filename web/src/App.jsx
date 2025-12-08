import { useState, useEffect } from "react";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

const roleImages = [
  { name: "皮卡丘", imgs: ["/roles/pikachu1.png", "/roles/pikachu2.png", "/roles/pikachu3.png"] },
  { name: "瑪利歐", imgs: ["/roles/mario1.png", "/roles/mario2.png", "/roles/mario3.png"] },
  { name: "音速小子", imgs: ["/roles/sonic1.png", "/roles/sonic2.png", "/roles/sonic3.png"] },
  { name: "卡比", imgs: ["/roles/kirby1.png", "/roles/kirby2.png", "/roles/kirby3.png"] },
  { name: "薩爾達", imgs: ["/roles/zelda1.png", "/roles/zelda2.png", "/roles/zelda3.png"] },
];

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

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
      phone: user,
      chapter: 1,
      points: 0,
      today: ""
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

    const updated = children.map((child) => {
      if (child.id !== id) return child;

      if (child.today === today) {
        alert("今天已閱讀過");
        return child;
      }

      return {
        ...child,
        chapter: Math.min(child.chapter + 1, TOTAL_CHAPTERS),
        points: child.points + 1,
        today
      };
    });

    setChildren(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const stageText = (points) => {
    if (points >= 16) return "🏆 第三階段完成";
    if (points >= 8) return "🥈 第二階段完成";
    if (points >= 1) return "🥉 第一階段完成";
    return "起跑中";
  };

  const getRoleImg = (roleName, points) => {
    const role = roleImages.find(r => r.name === roleName);
    if (!role) return "";
    if (points >= 16) return role.imgs[2];
    if (points >= 8) return role.imgs[1];
    return role.imgs[0];
  };

  // === 圓形跑道位置計算 ===
  const getPosition = (chapter) => {
    const percent = (chapter - 1) / TOTAL_CHAPTERS;
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    const r = 140;
    const cx = 200;
    const cy = 200;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>📖 路加福音 24 章圓形賽跑</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}>
        <svg width="400" height="400" style={{ background: "#f5f5f5", borderRadius: "50%" }}>
          <circle cx="200" cy="200" r="140" stroke="#c49a6c" strokeWidth="20" fill="none" />
          <text x="190" y="40" fontSize="12">START</text>

          {children.map((c) => {
            const pos = getPosition(c.chapter);
            return (
              <g key={c.id}>
                <image
                  href={getRoleImg(c.role, c.points)}
                  x={pos.x - 15}
                  y={pos.y - 15}
                  width="30"
                  height="30"
                />
                <text x={pos.x} y={pos.y - 20} fontSize="10" textAnchor="middle">{c.name}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 進度列表 */}
      <div>
        {children.map((c) => (
          <div key={c.id} style={{ marginBottom: 10 }}>
            <img src={getRoleImg(c.role, c.points)} width="40" style={{ verticalAlign: "middle" }} />
            <strong style={{ marginLeft: 10 }}>{c.name}</strong>
            <span style={{ marginLeft: 10 }}>{stageText(c.points)}</span>
            <div>進度：{c.chapter - 1} / 24</div>
            <button onClick={() => deleteChild(c.id)} style={{ marginLeft: 10 }}>❌ 刪除</button>
          </div>
        ))}
      </div>

      <hr />

      {!user ? (
        <div style={{ textAlign: "center" }}>
          <h3>家長登入</h3>
          <input
            placeholder="請輸入手機"
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

          <h3>選擇角色新增孩子</h3>
          <div style={{ display: "flex", gap: 15 }}>
            {roleImages.map((r) => (
              <div key={r.name} style={{ textAlign: "center" }}>
                <img src={r.imgs[0]} width="60" />
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
                <img src={getRoleImg(c.role, c.points)} width="60" />
                <h3>{c.name}</h3>
                <p>進度：{c.chapter - 1} / 24</p>
                <p>點數：{c.points}</p>
                <button onClick={() => readChapter(c.id)}>✅ 今日完成一章</button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
