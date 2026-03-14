import { useTranslation } from "react-i18next";

export default function Footer() {
  const { i18n } = useTranslation();

  return (
      <footer className="mt-auto flex items-center justify-between p-4 px-6 bg-[var(--color-green-dark)] text-[var(--color-green-lightest)] min-h-[60px]">
          <div className="inline-flex items-center gap-2">
              <button
                  onClick={() => i18n.changeLanguage("pl")}
                  className="bg-brew-lightest/10 border-none text-[var(--color-green-lightest)] px-2 py-1 rounded-md cursor-pointer transition-all duration-200 hover:bg-brew-lightest/20"
              >
                  PL
              </button>
              <button
                  onClick={() => i18n.changeLanguage("en")}
                  className="bg-brew-lightest/10 border-none text-[var(--color-green-lightest)] px-2 py-1 rounded-md cursor-pointer transition-all duration-200 hover:bg-brew-lightest/20"
              >
                  EN
              </button>
          </div>
          <div className="container">© {new Date().getFullYear()} BrewBuddy</div>
      </footer>
  )
}