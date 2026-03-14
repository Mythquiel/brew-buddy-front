import brewBuddyIcon from '../assets/brew_buddy_cup.svg'
import {NavLink} from "react-router-dom"
import {useTranslation} from "react-i18next";
import { useLoginModal } from "../auth/LoginModalContext";

export default function Nav() {
    const {t} = useTranslation(["nav", "home"]);
    const { open } = useLoginModal();

    return (
        <nav className="fixed top-0 left-0 w-screen z-[1000] flex items-center justify-between bg-[var(--color-green-dark)] text-[var(--color-green-lightest)] px-6 py-2 h-16 shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-1">
                <img src={brewBuddyIcon} alt="Brew Buddy icon" className="w-[50px] h-[50px]"/>
                <h1 className="text-xl font-semibold text-white">Brew Buddy</h1>
            </div>

            <ul className="flex list-none gap-6 mr-8 p-0">
                <li>
                    <NavLink
                        to="/drinks"
                        className={({ isActive }) =>
                            `text-[var(--color-green-lightest)] no-underline font-medium transition-colors duration-200 hover:text-[var(--color-green-lighter)] cursor-pointer ${
                                isActive ? 'text-[var(--color-green-lighter)] border-b-2 border-[var(--color-green-lighter)] pb-0.5' : ''
                            }`
                        }
                    >
                        {t("beverages")}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/stats"
                        className={({ isActive }) =>
                            `text-[var(--color-green-lightest)] no-underline font-medium transition-colors duration-200 hover:text-[var(--color-green-lighter)] cursor-pointer ${
                                isActive ? 'text-[var(--color-green-lighter)] border-b-2 border-[var(--color-green-lighter)] pb-0.5' : ''
                            }`
                        }
                    >
                        {t("stats")}
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/support"
                        className={({ isActive }) =>
                            `text-[var(--color-green-lightest)] no-underline font-medium transition-colors duration-200 hover:text-[var(--color-green-lighter)] cursor-pointer ${
                                isActive ? 'text-[var(--color-green-lighter)] border-b-2 border-[var(--color-green-lighter)] pb-0.5' : ''
                            }`
                        }
                    >
                        {t("support")}
                    </NavLink>
                </li>
                <li>
                    <a
                        onClick={(e) => { e.preventDefault(); open(); }}
                        className="text-[var(--color-green-lightest)] no-underline font-medium transition-colors duration-200 hover:text-[var(--color-green-lighter)] cursor-pointer"
                    >
                        {t("login.open")}
                    </a>
                </li>
            </ul>
        </nav>
    )
}