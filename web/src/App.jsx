import { quizData } from "./quizData";
import { useState, useEffect, useRef } from "react";
import "./App.css";

const TOTAL_CHAPTERS = 24;
const STORAGE_KEY = "lk24_children_global";

export default function App() {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [page, setPage] = useState("home");
  const [parentReadDate, setParentReadDate] = useState("");
  const [fireworks, setFireworks] = useState(false);
  const fireworkAudio = useRef(null);

  useEffect(() => {
    setChildren(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("parent_read_" + today)) {
      setParentReadDate(today);
    }
  }, []);

  /* ---------------- 功能邏輯（完全未動） ---------------- */
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
  };

  const triggerFireworks = () => {
    setFireworks(true);
    if (!fireworkAudio.current) {
      fireworkAudio.current = new Audio("/firework.mp3");
    }
    fireworkAudio.current.currentTime = 0;
    fireworkAudio.current.play();
    setTimeout(() => setFireworks(false), 3000);
  };

  /* ================= UI ================= */
  return (
    <div style={{ padding: 16 }}>

      {/* 🔝🔝🔝 置頂主視覺圖示（新增） 🔝🔝🔝 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 12
      }}>
        <img
          src="/center-icon.png"
          alt="愛來去傳福音使舊人變新人"
          style={{
            maxWidth: "90%",
            height: "auto",
            maxHeight: 120
          }}
        />
      </div>

      {/* 🔥 煙火 */}
      {fireworks && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 32,
          zIndex: 999
        }}>
          🎆 🎇 🎆
        </div>
      )}

      {/* ---------------- 首頁 ---------------- */}
      {page === "home" && (
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center" }}>📖 路加福音讀經精兵</h2>

          {/* ✅ 保留賽跑圈（已完全沒有任何圖示） */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <svg width="260" height="260">
              <circle
                cx="130"
                cy="130"
                r="90"
                stroke="#ffb74d"
                strokeWidth="18"
                fill="none"
              />
            </svg>
          </div>

          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="請輸入家長手機"
            style={{
              width: "100%",
              padding: 12,
              fontSize: 16,
              marginBottom: 10
            }}
          />

          <button
            onClick={login}
            style={{ width: "100%", padding: 14, fontSize: 18 }}
          >
            登入
          </button>
        </div>
      )}

      {/* ---------------- 管理 / 答題 ---------------- */}
      {user && page === "manage" && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h3>家長中心</h3>
          <button onClick={logout}>登出</button>

          <button
            onClick={parentRead}
            disabled={!!parentReadDate}
            style={{ width: "100%", padding: 12, marginTop: 10 }}
          >
            {parentReadDate ? "今日已陪讀" : "今日陪讀 +1"}
          </button>

          {/* 其餘管理 / 答題區完全不變 */}
        </div>
      )}

    </div>
  );
}
