import { useState, useEffect, useRef } from "react";
import "./App.css";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setChildren(all);
  }, []);

  // ===== 跑道位置計算 =====
  const getPosition = (chapter) => {
    const progress = (chapter - 1) / TOTAL_CHAPTERS;
    const size = 280;
    const cx = size / 2;
    const cy = size / 2;
    const straight = 70;
    const radius = 60;

    const totalLen = 2 * straight + 2 * Math.PI * radius;
    let d = progress * totalLen;

    if (d <= straight) return { x: cx - straight + d, y: cy - radius };
    d -= straight;

    if (d <= Math.PI * radius) {
      const a = -Math.PI / 2 + d / radius;
      return { x: cx + straight + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
    }
    d -= Math.PI * radius;

    if (d <= straight) return { x: cx + straight - d, y: cy + radius };
    d -= straight;

    const a = Math.PI / 2 + d / radius;
    return { x: cx - straight + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  return (
    <div style={styles.container}>
      {/* ===== 主視覺 ===== */}
      <div style={styles.mainCenter}>
        <h1 style={styles.title}>📖 路加福音讀經精兵</h1>

        <img
          src="/gospel.png"
          alt="愛來去傳福音"
          style={styles.gospelImage}
        />

        {/* ===== 跑道 ===== */}
        <div style={styles.trackWrap}>
          <img
            src="/track.png"
            alt="賽跑圈"
            style={styles.trackImage}
          />

          {children.map((c, idx) => {
            const pos = getPosition(c.chapter || 1);
            return (
              <div
                key={c.id}
                style={{
                  position: "absolute",
                  left: pos.x - 12,
                  top: pos.y - 12,
                  textAlign: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={styles.runnerDot}>🏃</div>
                <div style={styles.runnerName}>{c.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== 右 / 下 經文區 ===== */}
      <div style={styles.verseBox}>
        <h2 style={styles.verseTitle}>✨ 今日力量經文</h2>
        <p style={styles.verseText}>
          「靠耶和華而得的喜樂是你們的力量」
        </p>
        <p style={styles.verseFrom}>—— 尼希米記 8:10</p>

        {!user && (
          <>
            <input
              style={styles.input}
              placeholder="請輸入家長手機號碼"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button style={styles.button}>👉 家長登入</button>
          </>
        )}
      </div>
    </div>
  );
}

/* =====================
   ✅ 手機優化 Styles
===================== */

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    minHeight: "100vh",
  },

  mainCenter: {
    flex: "1 1 100%",
    padding: "20px",
    textAlign: "center",
  },

  title: {
    fontSize: "clamp(26px, 6vw, 42px)",
    marginBottom: "16px",
  },

  gospelImage: {
    width: "min(90vw, 380px)",
    marginBottom: "20px",
  },

  trackWrap: {
    position: "relative",
    width: "280px",
    height: "280px",
    margin: "0 auto",
  },

  trackImage: {
    width: "100%",
    height: "100%",
  },

  runnerDot: {
    fontSize: "16px",
  },

  runnerName: {
    fontSize: "10px",
  },

  verseBox: {
    flex: "1 1 100%",
    maxWidth: "360px",
    margin: "20px auto",
    padding: "20px",
    background: "#fff1d6",
    borderRadius: "16px",
  },

  verseTitle: {
    fontSize: "20px",
    color: "#d35400",
  },

  verseText: {
    fontSize: "clamp(16px, 4.5vw, 20px)",
    fontWeight: "bold",
    lineHeight: 1.6,
  },

  verseFrom: {
    textAlign: "right",
    marginBottom: "10px",
  },

  input: {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "10px",
  },

  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
