import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import AssignmentsPage from './pages/AssignmentsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CalendarPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
