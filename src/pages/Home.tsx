import brewBuddyLogo from "../assets/brew_buddy_logo.svg";
import {useNavigate} from "react-router-dom";
import styles from "../style/home.module.css";
import {useTranslation} from "react-i18next";
import { useLoginModal } from "../auth/LoginModalContext";

export default function Home() {
    const navigate = useNavigate();
    const {t} = useTranslation("home");
    const { open } = useLoginModal();

    const goToDrinks = () => {
        navigate("/drinks");
    };

    const openLogin = () => {
        open();
    };

    return (
        <>
            <div className={styles.loginButtonContainer}>
                <button type="button" className={styles.loginButton} onClick={openLogin}>
                    {t("login.open")}
                </button>
            </div>
            <div className={styles.homePage}>
                <img src={brewBuddyLogo} className={`${styles.logo} ${styles.brewBuddy}`} alt="Brew Buddy logo"/>
                <button type="button" className={styles.homeButton} onClick={goToDrinks}>
                    {t("welcomeMessage")} 🍵
                </button>
            </div>
        </>
    );
}