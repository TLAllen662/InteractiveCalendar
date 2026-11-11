import { useEffect, useState } from 'react'
import CalendarGrid from '../components/CalendarGrid.jsx'
import Card from '../components/Card.jsx'
import GoogleCalendarEvents from '../components/GoogleCalendarEvents.jsx'
import TaskForm from '../components/TaskForm.jsx'
import TaskList from '../components/TaskList.jsx'
import { useTaskContext } from '../contexts/TaskContext.js'
import { formatDate, formatLongDate } from '../utils/dates.js'

function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()))
  const [today, setToday] = useState(() => formatDate(new Date()))
  const [editingTask, setEditingTask] = useState(null)
  const [actionError, setActionError] = useState('')
  const { tasks, canEdit, updateTasks } = useTaskContext()

  useEffect(() => {
    const timer = window.setInterval(() => setToday(formatDate(new Date())), 60000)
    return () => window.clearInterval(timer)
  }, [])

  function selectDate(date) {
    setSelectedDate(date)
    setEditingTask(null)
  }

  function saveTask(values) {
    let updated
    if (editingTask) {
      updated = tasks.map((task) => task.id === editingTask.id ? { ...task, ...values } : task)
    } else {
      try {
        const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('')
        updated = [...tasks, { id, ...values, completed: false }]
      } catch (error) {
        console.error('Unable to create task:', error)
        setActionError('The task could not be created. Please try again in a supported browser.')
        return false
      }
    }
    setActionError('')
    updateTasks(updated)
    selectDate(values.date)
    return true
  }

  function toggleTask(id) {
    updateTasks(tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  }

  function deleteTask(id) {
    if (!window.confirm('Delete this task?')) return
    updateTasks(tasks.filter((task) => task.id !== id))
    if (editingTask?.id === id) setEditingTask(null)
  }

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Made for college life</p>
        <h1>Your calendar</h1>
        <p>Keep track of classes, assignments, and everything in between.</p>
      </div>
      {actionError && <p className="storage-error" role="alert">{actionError}</p>}
      <div className="calendar-layout">
        <CalendarGrid selectedDate={selectedDate} today={today} tasks={tasks} onSelectDate={selectDate} />
        <Card className="tasks-card">
          <h2>Tasks</h2>
          <p className="selected-date">{formatLongDate(selectedDate)}</p>
          <TaskList tasks={tasks.filter((task) => task.date === selectedDate)} onToggle={toggleTask} onEdit={setEditingTask} onDelete={deleteTask} canEdit={canEdit} />
          {canEdit && <TaskForm key={`${selectedDate}-${editingTask?.id ?? 'new'}`} selectedDate={selectedDate} task={editingTask} onSave={saveTask} onCancel={() => setEditingTask(null)} />}
        </Card>
      </div>
      <GoogleCalendarEvents selectedDate={selectedDate} />
    </>
  )
}

export default CalendarPage
