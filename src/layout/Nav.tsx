import brewBuddyIcon from '../assets/brew_buddy_cup.svg'
import { NavLink } from "react-router-dom"
import "../style/nav.css"
import {useTranslation} from "react-i18next";

export default function Nav() {
  const { t } = useTranslation("nav");

  return (
    <nav className="nav">
      <div className="nav-left">
        <img src={brewBuddyIcon} alt="Brew Buddy icon" className="logo" />
        <h1 className="title">Brew Buddy</h1>
      </div>

      <ul className="menu">
        <li><NavLink to="/drinks">{t("beverages")}</NavLink></li>
        <li><NavLink to="/stats">{t("stats")}</NavLink></li>
        <li><NavLink to="/contact">{t("contact")}</NavLink></li>
      </ul>
    </nav>
  )
}