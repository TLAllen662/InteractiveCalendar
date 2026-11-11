import { Link, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/">Interactive Calendar</Link>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}

export default Layout
