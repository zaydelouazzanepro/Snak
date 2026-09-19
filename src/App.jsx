import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Roulette from "./games/Roulette"
import Crash from "./games/Crash"
function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/roulette" element={<Roulette />} />
        <Route path="/crash" element={<Crash />} />

    </Routes>
  )
}

export default App
