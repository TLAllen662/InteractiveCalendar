import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav aria-label="Main navigation">
      <NavLink className="nav-link" to="/" end>Calendar</NavLink>
    </nav>
  )
}

export default Navigation
