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

  // ===== 煙火 / 飛分 =====
  const [fireworksActive, setFireworksActive] = useState(false);
  const [flyingItems, setFlyingItems] = useState([]);
  const fireworkAudio = useRef(null);

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

  return (
    <div ref={containerRef} style={{ height: "100vh", display: "flex" }}>
      {/* ================= 首頁 ================= */}
      {page === "home" && (
        <>
          {/* 中央 */}
          <div style={styles.mainCenter}>
            <h1 style={styles.title}>📖 路加福音讀經精兵</h1>

            <img
              src="/gospel.png"
              alt="愛來去傳福音使舊人變新人"
              style={styles.gospelImage}
            />
          </div>

          {/* 右側經文 */}
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
                <button style={styles.button} onClick={login}>
                  👉 家長登入
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* ================= 管理頁（原功能保留） ================= */}
      {user && page === "manage" && (
        <div style={{ padding: 20 }}>
          <h2>家長中心（{user}）</h2>
          <button onClick={() => setPage("home")}>回首頁</button>
          <button onClick={logout} style={{ marginLeft: 10 }}>登出</button>

          <hr />
          <h3>孩子名單</h3>
          {children.filter(c => c.phone === user).map(c => (
            <div key={c.id}>
              {c.name}（{c.points} 點）
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= 樣式 ================= */

const styles = {
  mainCenter: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  title: {
    fontSize: "42px",
    marginBottom: "30px",
  },
  gospelImage: {
    width: "420px",
    maxWidth: "80%",
  },
  verseBox: {
    width: "360px",
    margin: "20px",
    padding: "32px",
    background: "#fff1d6",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  verseTitle: {
    fontSize: "22px",
    color: "#d35400",
  },
  verseText: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  verseFrom: {
    textAlign: "right",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
