import { useState } from 'react'
import { parseDate } from '../utils/dates.js'

function TaskForm({ selectedDate, task, onSave, onCancel }) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [date, setDate] = useState(task?.date ?? selectedDate)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (!title.trim() || !parseDate(date)) {
      setError('Enter a task and a valid date.')
      return
    }
    if (!onSave({ title: title.trim(), date })) return
    setTitle('')
    setError('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h3>{task ? 'Edit task' : 'Add a task'}</h3>
      <label htmlFor="task-title">Task</label>
      <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required placeholder="e.g. Finish biology reading" />
      <label htmlFor="task-date">Date</label>
      <input id="task-date" type="date" min="1000-01-01" max="9999-12-31" value={date} onChange={(event) => setDate(event.target.value)} required />
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-actions">
        <button type="submit" className="button button-primary">{task ? 'Save changes' : 'Add task'}</button>
        {task && <button type="button" className="button button-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}

export default TaskForm
