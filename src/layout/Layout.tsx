import { Outlet } from "react-router-dom";
import "../style/layout.css";
import Nav from "../layout/Nav";

export function Layout() {
  return (
    <>
      <Nav />
      <div className="app-shell">
        <main id="content" className="container" role="main" aria-label="Main content">
          <Outlet />
        </main>
        <footer className="footer">
          <div className="container">© {new Date().getFullYear()} BrewBuddy</div>
        </footer>
      </div>
    </>
  );
}