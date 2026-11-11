import { useTasks } from '../hooks/useTasks.js'
import { TaskContext } from './TaskContext.js'

function TaskProvider({ children }) {
  const taskState = useTasks()

  return <TaskContext.Provider value={taskState}>{children}</TaskContext.Provider>
}

export default TaskProvider
