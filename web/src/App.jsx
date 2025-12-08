  return (
    <div style={{ padding: 20 }}>

      {/* ------------------ 首頁 ------------------ */}
      {page === "home" && (
        <div style={{ display: "flex", gap: 20 }}>

          {/* 左邊：跑道 */}
          <div style={{ position: "relative" }}>
            <h1 style={{ textAlign: "center" }}>📖 路加福音讀經精兵</h1>

            <div style={{ width: 420, height: 420 }}>
              <svg width="420" height="420">
                <circle
                  cx="210"
                  cy="210"
                  r="145"
                  stroke="#ffb74d"
                  strokeWidth="22"
                  fill="none"
                />

                {/* 中央清晰圖示 */}
                <image
                  href="/center-icon.png"
                  x="140"
                  y="150"
                  width="140"
                  height="140"
                />

                {children.map((c, index) => {
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
                      <text
                        x={pos.x}
                        y={pos.y - 22 + getNameOffset(index)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#333"
                      >
                        {c.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* 排行榜 */}
            <h3 style={{ textAlign: "center" }}>🏆 排行榜</h3>
            {[...children]
              .sort((a, b) => b.points - a.points)
              .map((c, i) => (
                <div key={c.id} style={{ textAlign: "center" }}>
                  🥇 第 {i + 1} 名：{c.name}（{c.points} 點）
                </div>
              ))}
          </div>

          {/* 右邊美編經文 */}
          <div
            style={{
              width: 260,
              padding: 20,
              background: "linear-gradient(135deg, #fff7e6, #ffe0b2)",
              borderRadius: 20,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              height: 300
            }}
          >
            <h2 style={{ color: "#d35400" }}>✨ 今日力量經文</h2>
            <p style={{ fontSize: 22, fontWeight: "bold", lineHeight: "1.5" }}>
              「靠耶和華而得的喜樂是你們的力量」
            </p>
            <p style={{ textAlign: "right", marginTop: 20, fontWeight: "bold" }}>
              ——尼希米記 8:10
            </p>

            {!user && (
              <div style={{ marginTop: 40 }}>
                <input
                  placeholder="請輸入家長手機號碼"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <br />
                <button style={{ marginTop: 10 }} onClick={login}>
                  👉 家長登入
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------ 管理頁 ------------------ */}
      {user && page === "manage" && (
        <div>
          <h2>家長中心（{user}）</h2>

          <button onClick={() => setPage("home")}>回首頁</button>
          <button onClick={logout} style={{ marginLeft: 10 }}>
            登出
          </button>

          <hr />

          {/* 父母簽到 */}
          <div
            style={{
              background: "#e8f5e9",
              padding: 15,
              borderRadius: 10,
              marginBottom: 20
            }}
          >
            <h3>📅 家長每日簽到</h3>
            {parentCheckInToday ? (
              <p>✔ 今日已簽到</p>
            ) : (
              <button onClick={parentSignIn}>👉 今日簽到 +1</button>
            )}
          </div>

          <h3>新增孩子</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {roleImages.map((r) => (
              <div key={r.name} style={{ textAlign: "center" }}>
                <img src={r.imgs[0]} width="60" />
                <div>{r.name}</div>
                <button onClick={() => addChild(r)}>選擇</button>
              </div>
            ))}
          </div>

          <hr />

          <h3>孩子管理</h3>

          {children
            .filter((c) => c.phone === user)
            .map((c) => (
              <div
                key={c.id}
                style={{
                  border: "1px solid #ccc",
                  padding: 10,
                  marginBottom: 10,
                  borderRadius: 10
                }}
              >
                <img
                  src={getRoleImg(c.role, c.points)}
                  width="60"
                  className={getEvolveClass(c.points)}
                />
                <h4>{c.name}</h4>
                <p>目前章節：{c.chapter}/24</p>
                <p>目前點數：{c.points}</p>

                {/* 題目 */}
                <h4>今日問答（第 {c.chapter} 章）</h4>

                {quizData[c.chapter]?.map((q, qi) => (
                  <div key={qi} style={{ marginBottom: 10 }}>
                    <p>Q{qi + 1}. {q.q}</p>
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        style={{ margin: 3 }}
                        onClick={() => {
                          if (!window.quizAnswers) window.quizAnswers = {};
                          if (!window.quizAnswers[c.id])
                            window.quizAnswers[c.id] = [];
                          window.quizAnswers[c.id][qi] = oi;
                          alert("已選擇：" + opt);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ))}

                <button
                  onClick={() =>
                    answerQuiz(c.id, c.chapter, window.quizAnswers?.[c.id] || [])
                  }
                >
                  ✅ 提交答案（需全對）
                </button>

                <button
                  onClick={() => deleteChild(c.id)}
                  style={{ marginLeft: 10, color: "red" }}
                >
                  ❌ 刪除
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
