import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Roulette from "./games/Roulette"
function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
 <Route path="/roulette" element={<Roulette />} />
    </Routes>
  )
}

export default App
