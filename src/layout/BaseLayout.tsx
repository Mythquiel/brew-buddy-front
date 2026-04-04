import {Outlet, useLocation} from "react-router-dom";
import Footer from "../layout/Footer";
import AIChatBubble from "../components/AIChatBubble";
import { useAuth } from "../auth/AuthContext";

export function BaseLayout() {
    const { pathname } = useLocation();
    const isHome = pathname === "/";
    const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <main
        id="content"
        className={isHome ? "flex-[1_0_auto] grid min-h-[80vh]" : "flex-[1_0_auto] pt-16 w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8"}
        role="main"
        aria-label="Main content"
      >
        <Outlet />
      </main>
      <Footer />
        {isAuthenticated ? (
          <AIChatBubble />
        ) : null}
    </div>
  );
}