import { NavLink } from 'react-router-dom'

function Navigation() {
  return (
    <nav className="navigation" aria-label="Main navigation">
      <NavLink className="nav-link" to="/" end>Calendar</NavLink>
      <NavLink className="nav-link" to="/courses">Courses</NavLink>
      <NavLink className="nav-link" to="/assignments">Assignments</NavLink>
      <NavLink className="nav-link" to="/settings">Settings</NavLink>
    </nav>
  )
}

export default Navigation
