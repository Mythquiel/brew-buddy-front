import { useTranslation } from "react-i18next";
import "../style/footer.css";

export default function Footer() {
  const { i18n } = useTranslation();

  return (
      <footer className="footer">
          <div className="language-switcher">
              <button onClick={() => i18n.changeLanguage("pl")}>PL</button>
              <button onClick={() => i18n.changeLanguage("en")}>EN</button>
          </div>
          <div className="container">© {new Date().getFullYear()} BrewBuddy</div>
      </footer>
  )
}