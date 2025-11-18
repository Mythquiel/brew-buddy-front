import brewBuddyLogo from "../assets/brew_buddy_logo.svg";
import {useNavigate} from "react-router-dom";
import "../style/home.css";
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
            <div className="login-button-container">
                <button type="button" className="login-button" onClick={openLogin}>
                    {t("login.open")}
                </button>
            </div>
            <div className="home-page">
                <img src={brewBuddyLogo} className="logo brew-buddy" alt="Brew Buddy logo"/>
                <button type="button" className="home-button" onClick={goToDrinks}>
                    {t("welcomeMessage")} 🍵
                </button>
            </div>
        </>
    );
}