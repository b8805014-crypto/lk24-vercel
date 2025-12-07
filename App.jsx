import { useState } from 'react'

export default function App() {
  const [phone, setPhone] = useState('')
  const [points, setPoints] = useState(0)

  return (
    <div style={{ padding: 20 }}>
      <h1>路加福音24章 · 閱讀平台</h1>

      <input
        placeholder="家長手機登入"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br /><br />

      <button onClick={() => setPoints(points + 1)}>
        兒童讀一章 +1 點
      </button>

      <button onClick={() => setPoints(points + 1)}>
        家長陪讀 +1 點
      </button>

      <p>今日累計點數：{points}（最高2點）</p>
    </div>
  )
}
