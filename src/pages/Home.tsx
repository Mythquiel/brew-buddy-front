import brewBuddyLogo from "../assets/brew_buddy_logo.svg";
import {useNavigate} from "react-router-dom";
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
            <div className="fixed top-4 right-4 z-[1000]">
                <button
                    type="button"
                    className="bg-[#1b4332] text-brew-accent border-none px-4 py-2 text-base cursor-pointer rounded-[6px] shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-all duration-200 font-medium hover:bg-[#2d6a4f] active:translate-y-px"
                    onClick={openLogin}
                >
                    {t("login.open")}
                </button>
            </div>
            <div className="min-h-full flex flex-col items-center justify-center text-[var(--color-neutral-warm)] text-center">
                <img
                    src={brewBuddyLogo}
                    className="w-[500px] h-auto mb-8 [filter:drop-shadow(0_6px_12px_rgba(0,0,0,0.4))]"
                    alt="Brew Buddy logo"
                />
                <button
                    type="button"
                    className="bg-[#1b4332] text-brew-accent border-none px-6 py-3 text-2xl cursor-pointer transition-all duration-200 font-normal rounded-[var(--radius-pill)] hover:bg-[#2d6a4f] active:translate-y-0.5"
                    onClick={goToDrinks}
                >
                    {t("welcomeMessage")}!
                </button>
            </div>
        </>
    );
}