import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Roulette from "./games/Roulette"
import Crash from "./games/Crash"
import Mines from "./games/Mines"
import Plinko from "./games/Plinko"
import Slide from "./games/Slide"
import Gold from "./games/Gold"
import CardsLand from './pages/CardsLand';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path="/" element={<Home />} />
        <Route path="/roulette" element={<Roulette />} />
        <Route path="/crash" element={<Crash />} />
         <Route path="/mines" element={<Mines />} />\
           <Route path="/gold" element={<Gold />} />
          <Route path="/slide" element={<Slide />} />
         <Route path="/plinko" element={<Plinko />} />
          <Route path="/cardsland" element={<CardsLand />} />

    </Routes>
  )
}

export default App
