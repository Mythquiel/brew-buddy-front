import brewBuddyLogo from "../assets/brew_buddy_logo.svg";
import { useNavigate } from "react-router-dom";
import "../style/home.css";

export default function Home() {
  const navigate = useNavigate();

  const goToDrinks = () => {
    navigate("/drinks");
  };

  return (
    <>
      <div className="home-page">
        <img src={brewBuddyLogo} className="logo brew-buddy" alt="Brew Buddy logo"
        />
          <button type="button" className="home-button" onClick={goToDrinks}>
            Let&apos;s get brewing 🍵
          </button>
      </div>
    </>
  );
}