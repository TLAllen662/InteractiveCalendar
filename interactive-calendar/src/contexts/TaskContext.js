import { createContext, useContext } from 'react'

export const TaskContext = createContext(null)

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === null) throw new Error('useTaskContext must be used within TaskProvider.')
  return context
}
