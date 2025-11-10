import { Routes, Route } from "react-router-dom";
import { BaseLayout } from "../layout/BaseLayout";
import Home from "../pages/Home";
import Beverages from "../pages/Beverages";
import Stats from "../pages/Stats";
import Contact from "../pages/Contact";
import NavLayout from "../layout/NavLayout";

export default function App() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route index element={<Home />} />
        <Route element={<NavLayout />}>
          <Route path="drinks" element={<Beverages />} />
          <Route path="stats" element={<Stats />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Route>
    </Routes>
  );
}