import { useEffect, useRef, useState } from 'react'
import { CALENDAR_SCOPE, listCalendarEvents, loadGoogleIdentity } from '../services/googleCalendar.js'
import Card from './Card.jsx'

function eventTime(event) {
  if (event.start.date) return 'All day'
  const start = new Date(event.start.dateTime)
  const end = new Date(event.end.dateTime)
  const sameDay = start.toDateString() === end.toDateString()
  const options = sameDay ? { timeStyle: 'short' } : { dateStyle: 'medium', timeStyle: 'short' }
  const formatter = new Intl.DateTimeFormat(undefined, options)
  return `${formatter.format(start)} – ${formatter.format(end)}`
}

function GoogleCalendarEvents({ selectedDate }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [identity, setIdentity] = useState(null)
  const [identityError, setIdentityError] = useState('')
  const [identityAttempt, setIdentityAttempt] = useState(0)
  const [authError, setAuthError] = useState('')
  const [authorizing, setAuthorizing] = useState(false)
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const mounted = useRef(false)
  const currentResult = result?.session === session && result?.date === selectedDate && result?.refresh === refresh ? result : null
  const loading = Boolean(session && !currentResult)
  const events = currentResult?.events ?? []
  const eventsError = currentResult?.error ?? ''

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!clientId) return
    let active = true
    loadGoogleIdentity().then((oauth) => {
      if (active) {
        setIdentity(oauth)
        setIdentityError('')
      }
    }).catch(() => {
      if (active) setIdentityError('Google sign-in could not be loaded. Check your connection and try again.')
    })
    return () => { active = false }
  }, [clientId, identityAttempt])

  useEffect(() => {
    if (!session) return
    const delay = Math.max(0, session.expiresAt - Date.now())
    const timer = window.setTimeout(() => {
      setSession(null)
      setResult(null)
      setAuthError('Your Google session expired. Connect again to view events.')
    }, delay)
    return () => window.clearTimeout(timer)
  }, [session])

  useEffect(() => {
    if (!session) return
    const controller = new AbortController()
    let active = true
    listCalendarEvents(session.accessToken, selectedDate, controller.signal).then((result) => {
      if (active) setResult({ session, date: selectedDate, refresh, events: result, error: '' })
    }).catch((error) => {
      if (active && error.name !== 'AbortError') {
        setResult({ session, date: selectedDate, refresh, events: [], error: error.message || 'Google Calendar events could not be loaded.' })
      }
    })
    return () => {
      active = false
      controller.abort()
    }
  }, [session, selectedDate, refresh])

  function connect() {
    setAuthError('')
    setAuthorizing(true)
    try {
      const client = identity.initTokenClient({
        client_id: clientId,
        scope: CALENDAR_SCOPE,
        include_granted_scopes: false,
        callback: (response) => {
          if (!mounted.current) return
          setAuthorizing(false)
          if (response.error || !response.access_token || !response.expires_in ||
              !identity.hasGrantedAllScopes(response, CALENDAR_SCOPE)) {
            setAuthError('Google Calendar access was not granted. Please try again.')
            return
          }
          setSession({ accessToken: response.access_token, expiresAt: Date.now() + response.expires_in * 1000 })
        },
        error_callback: () => {
          if (!mounted.current) return
          setAuthorizing(false)
          setAuthError('Google sign-in was closed or could not open. Please try again.')
        },
      })
      client.requestAccessToken()
    } catch (error) {
      console.error('Unable to start Google sign-in:', error)
      setAuthorizing(false)
      setAuthError('Google sign-in could not be started. Please try again.')
    }
  }

  function disconnect() {
    setSession(null)
    setResult(null)
    setAuthError('')
  }

  return (
    <Card className="google-events">
      <h2>Google Calendar</h2>
      <p>View events from your primary Google Calendar for the selected day. Google permission allows read-only access to events on all calendars you can access.</p>
      {!clientId && <p>Google Calendar is not configured. See the project README to set up a client ID.</p>}
      {clientId && !session && (
        <>
          {identityError ? (
            <button type="button" className="button button-secondary" onClick={() => { setIdentityError(''); setIdentityAttempt((attempt) => attempt + 1) }}>Retry Google sign-in setup</button>
          ) : (
            <button type="button" className="button button-secondary" onClick={connect} disabled={!identity || authorizing}>
              {authorizing ? 'Connecting…' : identity ? 'Connect Google Calendar' : 'Loading Google sign-in…'}
            </button>
          )}
          {identityError && <p className="error" role="alert">{identityError}</p>}
          {authError && <p className="error" role="alert">{authError}</p>}
        </>
      )}
      {session && (
        <>
          <div className="google-actions">
            <button type="button" className="button button-secondary" onClick={() => setRefresh((value) => value + 1)} disabled={loading}>Refresh events</button>
            <button type="button" className="button button-secondary" onClick={disconnect}>Disconnect</button>
          </div>
          <p className="google-note">Disconnecting clears this session only. Manage access in your Google account.</p>
          {loading && <p role="status">Loading Google Calendar events…</p>}
          {eventsError && <p className="error" role="alert">{eventsError}</p>}
          {!loading && !eventsError && events.length === 0 && <p>No Google Calendar events for this day.</p>}
          {!loading && !eventsError && events.length > 0 && (
            <ul className="google-event-list">
              {events.map((event) => (
                <li key={event.id}>
                  <strong>{event.summary || 'Untitled event'}</strong>
                  <span>{eventTime(event)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  )
}

export default GoogleCalendarEvents
