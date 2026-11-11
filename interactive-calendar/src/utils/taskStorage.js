import { parseDate } from './dates.js'

export const TASKS_KEY = 'interactive-calendar.tasks.v1'

function isTask(task) {
  return (
    task !== null &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.date === 'string' &&
    parseDate(task.date) !== null &&
    typeof task.completed === 'boolean'
  )
}

export function loadTasks(storage) {
  const saved = storage.getItem(TASKS_KEY)
  if (saved === null) return []

  const tasks = JSON.parse(saved)
  if (
    !Array.isArray(tasks) ||
    !tasks.every(isTask) ||
    new Set(tasks.map((task) => task.id)).size !== tasks.length
  ) {
    throw new Error('Stored tasks have an invalid format.')
  }
  return tasks
}

export function saveTasks(storage, tasks) {
  storage.setItem(TASKS_KEY, JSON.stringify(tasks))
}
