import brewBuddyLogo from '../assets/brew_buddy_logo.svg'
import '../style/App.css'
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  const goToTeas = () => {
    console.log('Navigating to /teas') // debug
    navigate('/teas')
  }

  return (
    <>
      <div>
        <img src={brewBuddyLogo} className="logo brew-buddy" alt="Brew Buddy logo"/>
      </div>
      <div className="card">
        <button type="button" onClick={goToTeas}>
          Let&apos;s get brewing 🍵
        </button>
      </div>
    </>
  )
}
