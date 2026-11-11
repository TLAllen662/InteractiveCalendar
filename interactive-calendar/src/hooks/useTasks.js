import { useState } from 'react'
import { loadTasks, saveTasks } from '../utils/taskStorage.js'

function getInitialState() {
  try {
    return { tasks: loadTasks(window.localStorage), error: '', canEdit: true }
  } catch (error) {
    console.error('Unable to load saved tasks:', error)
    return {
      tasks: [],
      error: 'Saved tasks could not be loaded. Editing is disabled to protect your data. Check browser storage and reload.',
      canEdit: false,
    }
  }
}

export function useTasks() {
  const [state, setState] = useState(getInitialState)

  function updateTasks(tasks) {
    try {
      saveTasks(window.localStorage, tasks)
      setState({ tasks, error: '', canEdit: true })
    } catch (error) {
      console.error('Unable to save tasks:', error)
      setState({
        tasks,
        error: 'Changes could not be saved to this browser. They may be lost when you reload.',
        canEdit: true,
      })
    }
  }

  return { ...state, updateTasks }
}
