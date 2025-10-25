import { PropsWithChildren } from "react";
import "../style/layout.css";
import Nav from "../layout/Nav";

export function Layout({ children }: PropsWithChildren) {
  return (
    <>
      <a href="#content" className="skiplink">Skip to content</a>
      <Nav />
      <div className="app-shell">
        <main id="content" className="container" role="main" aria-label="Main content">
          {children}
        </main>
        <footer className="footer">
          <div className="container">© {new Date().getFullYear()} BrewBuddy</div>
        </footer>
      </div>
    </>
  );
}