import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTasks, saveTasks, TASKS_KEY } from './taskStorage.js'

function createStorage(initialValue = null) {
  let value = initialValue
  return {
    getItem: (key) => key === TASKS_KEY ? value : null,
    setItem: (key, next) => {
      assert.equal(key, TASKS_KEY)
      value = next
    },
  }
}

test('saves and restores dated tasks', () => {
  const storage = createStorage()
  const tasks = [{ id: 'one', title: 'Study', date: '2024-02-29', completed: false }]
  assert.deepEqual(loadTasks(storage), [])
  saveTasks(storage, tasks)
  assert.deepEqual(loadTasks(storage), tasks)
})

test('rejects invalid data instead of treating it as an empty list', () => {
  assert.throws(() => loadTasks(createStorage('{')))
  assert.throws(() => loadTasks(createStorage(JSON.stringify([{ id: 'one', title: 'Study', date: '2023-02-29', completed: false }]))))
  const task = { id: 'one', title: 'Study', date: '2024-02-29', completed: false }
  assert.throws(() => loadTasks(createStorage(JSON.stringify([task, task]))))
})
