import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GoogleCalendarEvents from './components/GoogleCalendarEvents.jsx'
import { CALENDAR_SCOPE, listCalendarEvents } from './services/googleCalendar.js'

const event = {
  id: 'event-1',
  summary: 'Lecture',
  start: { date: '2024-02-29' },
  end: { date: '2024-03-01' },
}

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data }
}

beforeEach(() => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
})

describe('Google Calendar service', () => {
  it('fetches all pages with authorization and filters events to the selected date', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ items: [event], nextPageToken: 'next-page' }))
      .mockResolvedValueOnce(response({ items: [
        { id: 'other', start: { date: '2024-03-01' }, end: { date: '2024-03-02' } },
      ] }))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()
    const events = await listCalendarEvents('token', '2024-02-29', controller.signal)
    expect(events).toEqual([event])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [url, options] = fetchMock.mock.calls[0]
    expect(new URL(url).pathname).toBe('/calendar/v3/calendars/primary/events')
    expect(new URL(url).searchParams.get('singleEvents')).toBe('true')
    expect(options.headers.Authorization).toBe('Bearer token')
    expect(options.signal).toBe(controller.signal)
    expect(new URL(fetchMock.mock.calls[1][0]).searchParams.get('pageToken')).toBe('next-page')
  })

  it('surfaces HTTP failures and invalid responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({}, 401)).mockResolvedValueOnce(response({ items: 'invalid' })))
    await expect(listCalendarEvents('token', '2024-02-29')).rejects.toThrow('session expired')
    await expect(listCalendarEvents('token', '2024-02-29')).rejects.toThrow('invalid response')
  })

  it('uses the browser day for timed events and date-only ranges for all-day events', async () => {
    const timed = (id, from, to) => ({ id, start: { dateTime: from.toISOString() }, end: { dateTime: to.toISOString() } })
    const crossingMidnight = timed('overnight', new Date(2024, 1, 28, 23), new Date(2024, 1, 29, 1))
    const nextDay = timed('next-day', new Date(2024, 2, 1, 0), new Date(2024, 2, 1, 1))
    const multiDay = { id: 'multi', start: { date: '2024-02-28' }, end: { date: '2024-03-01' } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ items: [crossingMidnight, nextDay, multiDay] })))
    expect(await listCalendarEvents('token', '2024-02-29')).toEqual([crossingMidnight, multiDay])
  })
})

describe('Google Calendar events', () => {
  function mockIdentity() {
    let config
    const requestAccessToken = vi.fn()
    const oauth = {
      initTokenClient: vi.fn((options) => { config = options; return { requestAccessToken } }),
      hasGrantedAllScopes: vi.fn(() => true),
    }
    vi.stubGlobal('google', { accounts: { oauth2: oauth } })
    return { oauth, requestAccessToken, respond: (value) => config.callback(value), fail: () => config.error_callback() }
  }

  async function connect(user, identity) {
    await user.click(await screen.findByRole('button', { name: 'Connect Google Calendar' }))
    expect(identity.requestAccessToken).toHaveBeenCalled()
    act(() => identity.respond({ access_token: 'token', expires_in: 3600 }))
  }

  it('shows loading and events, refreshes the selected date, and disconnects', async () => {
    const identity = mockIdentity()
    let finishRequest
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { finishRequest = resolve }))
      .mockResolvedValueOnce(response({ items: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const view = render(<GoogleCalendarEvents selectedDate="2024-02-29" />)
    await connect(user, identity)
    expect(identity.oauth.initTokenClient.mock.calls[0][0].scope).toBe(CALENDAR_SCOPE)
    expect(await screen.findByRole('status')).toBeTruthy()
    finishRequest(response({ items: [event] }))
    expect(await screen.findByText('Lecture')).toBeTruthy()
    expect(screen.getByText('All day')).toBeTruthy()

    view.rerender(<GoogleCalendarEvents selectedDate="2024-03-01" />)
    expect(await screen.findByText('No Google Calendar events for this day.')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    await user.click(screen.getByRole('button', { name: 'Disconnect' }))
    expect(screen.queryByText('Lecture')).toBeNull()
    expect(screen.getByRole('button', { name: 'Connect Google Calendar' })).toBeTruthy()
  })

  it('shows authorization and API errors and permits retry', async () => {
    const identity = mockIdentity()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response({}, 500)).mockResolvedValueOnce(response({ items: [] })))
    const user = userEvent.setup()
    render(<GoogleCalendarEvents selectedDate="2024-02-29" />)
    await user.click(await screen.findByRole('button', { name: 'Connect Google Calendar' }))
    act(() => identity.fail())
    expect(screen.getByRole('alert').textContent).toContain('closed or could not open')
    await connect(user, identity)
    expect((await screen.findByRole('alert')).textContent).toContain('HTTP 500')
    await user.click(screen.getByRole('button', { name: 'Refresh events' }))
    await waitFor(() => expect(screen.getByText('No Google Calendar events for this day.')).toBeTruthy())
  })

  it('ignores a stale response after changing the selected day', async () => {
    const identity = mockIdentity()
    let finishOldRequest
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { finishOldRequest = resolve }))
      .mockResolvedValueOnce(response({ items: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const view = render(<GoogleCalendarEvents selectedDate="2024-02-29" />)
    await connect(user, identity)
    await screen.findByRole('status')
    view.rerender(<GoogleCalendarEvents selectedDate="2024-03-01" />)
    expect(await screen.findByText('No Google Calendar events for this day.')).toBeTruthy()
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true)
    await act(async () => finishOldRequest(response({ items: [event] })))
    expect(screen.queryByText('Lecture')).toBeNull()
  })

  it('does not fetch events when the requested permission is denied', async () => {
    const identity = mockIdentity()
    identity.oauth.hasGrantedAllScopes.mockReturnValue(false)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<GoogleCalendarEvents selectedDate="2024-02-29" />)
    await connect(user, identity)
    expect(screen.getByRole('alert').textContent).toContain('not granted')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('explains missing configuration without starting authorization', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')
    render(<GoogleCalendarEvents selectedDate="2024-02-29" />)
    expect(screen.getByText(/not configured/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Connect Google Calendar' })).toBeNull()
  })
})
