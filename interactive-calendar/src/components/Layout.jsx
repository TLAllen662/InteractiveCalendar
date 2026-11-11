import { Outlet } from 'react-router-dom'
import { useTaskContext } from '../contexts/TaskContext.js'
import Header from './Header.jsx'

function Layout() {
  const { error } = useTaskContext()

  return (
    <>
      <Header />
      <main className="page">
        {error && <p className="storage-error" role="alert">{error}</p>}
        <Outlet />
      </main>
    </>
  )
}

export default Layout
