import brewBuddyIcon from '../assets/brew_buddy_cup.svg'
import { NavLink } from "react-router-dom"
import "../style/nav.css"

export default function Nav() {
  return (
    <nav className="nav">
      <div className="nav-left">
        <img src={brewBuddyIcon} alt="Brew Buddy icon" className="logo" />
        <h1 className="title">Brew Buddy</h1>
      </div>

      <ul className="menu">
        <li><NavLink to="/drinks">List Drinks</NavLink></li>
        <li><NavLink to="/stats">Statistics</NavLink></li>
        <li><NavLink to="/contact">Contact</NavLink></li>
      </ul>
    </nav>
  )
}