import { Link } from 'react-router-dom'
import Navigation from './Navigation.jsx'

function Header() {
  return (
    <header className="site-header">
      <div className="header-content">
        <Link className="brand" to="/">Interactive Calendar</Link>
        <Navigation />
      </div>
    </header>
  )
}

export default Header
