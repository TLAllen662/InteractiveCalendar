import { Outlet } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks.js'
import Header from './Header.jsx'

function Layout() {
  const taskState = useTasks()

  return (
    <>
      <Header />
      <main className="page">
        {taskState.error && <p className="storage-error" role="alert">{taskState.error}</p>}
        <Outlet context={taskState} />
      </main>
    </>
  )
}

export default Layout
