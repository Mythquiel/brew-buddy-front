import {Outlet, useLocation} from "react-router-dom";
import Footer from "../layout/Footer";

export function BaseLayout() {
    const { pathname } = useLocation();
    const isHome = pathname === "/";

  return (
    <div className="app-shell">
      <main id="content" className={`container${isHome ? " home-style" : ""}`} role="main" aria-label="Main content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}