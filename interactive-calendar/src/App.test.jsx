import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { TASKS_KEY } from './utils/taskStorage.js'

function renderApp(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('calendar tasks', () => {
  it('creates, completes, edits, persists, and deletes a task', async () => {
    const user = userEvent.setup()
    const view = renderApp()
    await user.type(screen.getByLabelText('Task'), 'Biology reading')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByLabelText('Biology reading').checked).toBe(false)
    await user.click(screen.getByLabelText('Biology reading'))
    expect(screen.getByLabelText('Biology reading').checked).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Edit Biology reading' }))
    await user.clear(screen.getByLabelText('Task'))
    await user.type(screen.getByLabelText('Task'), 'Biology notes')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByLabelText('Biology notes').checked).toBe(true)

    view.unmount()
    renderApp()
    expect(screen.getByLabelText('Biology notes').checked).toBe(true)

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Delete Biology notes' }))
    expect(screen.getByText('No tasks for this day yet.')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(TASKS_KEY))).toEqual([])
  })

  it('navigates months and associates tasks with their selected date', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    await user.type(screen.getByLabelText('Task'), 'Upcoming exam')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.getByLabelText('Upcoming exam')).toBeTruthy()
    const task = JSON.parse(localStorage.getItem(TASKS_KEY))[0]
    expect(screen.getByLabelText('Date').value).toBe(task.date)

    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.queryByLabelText('Upcoming exam')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByLabelText('Upcoming exam')).toBeTruthy()
  })

  it('moves an edited task to its new date and respects a canceled deletion', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.type(screen.getByLabelText('Task'), 'Lab report')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.click(screen.getByRole('button', { name: 'Edit Lab report' }))
    await user.clear(screen.getByLabelText('Date'))
    await user.type(screen.getByLabelText('Date'), '2024-02-29')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    const month = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date(2024, 1, 1))
    expect(screen.getByText(month)).toBeTruthy()
    expect(screen.getByLabelText('Lab report')).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(TASKS_KEY))[0].date).toBe('2024-02-29')

    vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(screen.getByRole('button', { name: 'Delete Lab report' }))
    expect(screen.getByLabelText('Lab report')).toBeTruthy()
  })

  it('protects invalid saved data and reports failed writes', async () => {
    localStorage.setItem(TASKS_KEY, '{bad data')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const view = renderApp()
    expect(screen.getByRole('alert').textContent).toContain('Editing is disabled')
    expect(screen.queryByRole('button', { name: 'Add task' })).toBeNull()
    expect(localStorage.getItem(TASKS_KEY)).toBe('{bad data')
    view.unmount()

    localStorage.clear()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    const user = userEvent.setup()
    renderApp()
    await user.type(screen.getByLabelText('Task'), 'Unsaved task')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.getByRole('alert').textContent).toContain('could not be saved')
    expect(screen.getByLabelText('Unsaved task')).toBeTruthy()
    expect(consoleError).toHaveBeenCalled()
  })

  it('shows a not-found page for unknown routes', () => {
    renderApp('/unknown')
    expect(within(screen.getByRole('main')).getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  })
})
