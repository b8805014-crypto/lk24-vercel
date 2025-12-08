import { quizData } from "./quizData";
import { useState, useEffect, useRef } from "react";
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
  const [page, setPage] = useState("home");
  const [children, setChildren] = useState([]);

  const [fireworksActive, setFireworksActive] = useState(false);
  const fireworkAudio = useRef(null);

  /* ===== 音效煙火 ===== */
  const triggerFireworks = () => {
    setFireworksActive(true);
    if (!fireworkAudio.current) {
      fireworkAudio.current = new Audio("/firework.mp3");
    }
    fireworkAudio.current.currentTime = 0;
    fireworkAudio.current.play().catch(() => {});
    setTimeout(() => setFireworksActive(false), 3000);
  };

  useEffect(() => {
    setChildren(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  }, []);

  /* ===== 登入 ===== */
  const login = () => {
    if (!phone) return alert("請輸入手機號碼");
    setUser(phone);
    setPage("manage");
  };

  const logout = () => {
    setUser(null);
    setPage("home");
  };

  /* ===== 跑道位置 ===== */
  const getPosition = (chapter) => {
    const progress = (chapter - 1) / TOTAL_CHAPTERS;
    const cx = 140;
    const cy = 140;
    const straight = 70;
    const radius = 60;
    const totalLen = 2 * straight + 2 * Math.PI * radius;
    let d = progress * totalLen;

    if (d <= straight)
      return { x: cx - straight + d, y: cy - radius };

    d -= straight;
    if (d <= Math.PI * radius) {
      const a = -Math.PI / 2 + d / radius;
      return { x: cx + straight + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
    }

    d -= Math.PI * radius;
    if (d <= straight)
      return { x: cx + straight - d, y: cy + radius };

    d -= straight;
    const a = Math.PI / 2 + d / radius;
    return { x: cx - straight + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const getRoleImg = (role, points) => {
    const r = roleImages.find(r => r.name === role);
    if (!r) return "";
    if (points >= 16) return r.imgs[2];
    if (points >= 8) return r.imgs[1];
    return r.imgs[0];
  };

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      {fireworksActive && <div className="fireworks-overlay active" />}

      {/* ===== 首頁 ===== */}
      {page === "home" && (
        <>
          <h1 style={styles.title}>📖 路加福音讀經精兵</h1>

          {/* 福音圖 */}
          <img
            src="/gospel.png"
            alt="福音"
            style={styles.gospel}
          />

          {/* 跑道 */}
          <div style={styles.trackWrap}>
            <img src="/track.png" alt="track" style={{ width: "100%" }} />

            {children.map(c => {
              const pos = getPosition(c.chapter);
              return (
                <div key={c.id} style={{
                  position: "absolute",
                  left: pos.x - 16,
                  top: pos.y - 16,
                  textAlign: "center"
                }}>
                  <img src={getRoleImg(c.role, c.points)} width="32" />
                  <div style={{ fontSize: 10 }}>{c.name}</div>
                </div>
              );
            })}
          </div>

          {/* 經文 */}
          <div style={styles.verse}>
            「靠耶和華而得的喜樂是你們的力量」
            <div style={{ fontSize: 14, textAlign: "right" }}>尼希米記 8:10</div>
          </div>

          {/* 登入 */}
          {!user && (
            <>
              <input
                style={styles.input}
                placeholder="家長手機號碼"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <button style={styles.button} onClick={login}>
                👉 家長登入
              </button>
            </>
          )}
        </>
      )}

      {/* ===== 管理頁 ===== */}
      {page === "manage" && user && (
        <div style={{ width: "100%" }}>
          <h2>家長中心</h2>
          <button onClick={logout}>登出</button>

          {children.filter(c => c.phone === user).map(c => (
            <div key={c.id} style={styles.card}>
              <img src={getRoleImg(c.role, c.points)} width="48" />
              <h4>{c.name}</h4>
              <p>章節：{c.chapter}</p>
              <p>點數：{c.points}</p>

              <button onClick={triggerFireworks}>✅ 今日報到 +1</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== 手機優化樣式 ===== */
const styles = {
  container: {
    minHeight: "100vh",
    padding: 16,
    textAlign: "center",
    fontFamily: "sans-serif"
  },
  title: {
    fontSize: 26,
    marginBottom: 16
  },
  gospel: {
    width: "85%",
    maxWidth: 320,
    marginBottom: 16
  },
  trackWrap: {
    position: "relative",
    width: 280,
    height: 280,
    margin: "0 auto 20px"
  },
  verse: {
    background: "#fff1d6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16
  },
  input: {
    width: "90%",
    padding: 12,
    fontSize: 16,
    marginBottom: 10
  },
  button: {
    width: "90%",
    padding: 14,
    fontSize: 16
  },
  card: {
    border: "1px solid #ccc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  }
};
