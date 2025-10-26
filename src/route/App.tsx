import { Routes, Route } from "react-router-dom";
import { Layout } from "../layout/Layout";
import Home from "../pages/Home"
import Beverages from "../pages/Beverages"
import Stats from "../pages/Stats"
import Contact from "../pages/Contact"

export default function App() {
  return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<Layout />}>
              <Route path="/drinks" element={<Beverages />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/contact" element={<Contact />} />
          </Route>
        </Routes>
  )
}