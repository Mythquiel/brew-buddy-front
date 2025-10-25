import { Routes, Route } from "react-router-dom"
import Home from "../pages/Home"
import Teas from "../pages/Teas"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teas" element={<Teas />} />
    </Routes>
  )
}