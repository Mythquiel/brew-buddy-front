import brewBuddyIcon from '../assets/brew_buddy_cup.svg'
import {NavLink} from "react-router-dom"
import styles from "../style/nav.module.css"
import {useTranslation} from "react-i18next";
import { useLoginModal } from "../auth/LoginModalContext";

export default function Nav() {
    const {t} = useTranslation(["nav", "home"]);
    const { open } = useLoginModal();

    return (
        <nav className={styles.nav}>
            <div className={styles.navLeft}>
                <img src={brewBuddyIcon} alt="Brew Buddy icon" className={styles.logo}/>
                <h1 className={styles.title}>Brew Buddy</h1>
            </div>

            <ul className={styles.menu}>
                <li><NavLink to="/drinks">{t("beverages")}</NavLink></li>
                <li><NavLink to="/stats">{t("stats")}</NavLink></li>
                <li><NavLink to="/contact">{t("contact")}</NavLink></li>
                <li>
                    <a onClick={(e) => { e.preventDefault(); open(); }}>
                        {t("login.open")}
                    </a>
                </li>
            </ul>
        </nav>
    )
}