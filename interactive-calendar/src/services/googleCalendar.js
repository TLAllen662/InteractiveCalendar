import { parseDate } from '../utils/dates.js'

export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events.readonly'

let identityPromise

export function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve(window.google.accounts.oauth2)
  if (identityPromise) return identityPromise

  identityPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google.accounts.oauth2)
      } else {
        script.remove()
        identityPromise = undefined
        reject(new Error('Google Identity Services did not initialize.'))
      }
    }
    script.onerror = () => {
      script.remove()
      identityPromise = undefined
      reject(new Error('Google Identity Services could not be loaded.'))
    }
    document.head.appendChild(script)
  })
  return identityPromise
}

function validateEvent(event) {
  if (!event || typeof event.id !== 'string' || !event.start || !event.end ||
      (event.summary !== undefined && typeof event.summary !== 'string')) {
    throw new Error('Google Calendar returned an invalid event.')
  }
  const allDay = typeof event.start.date === 'string' && typeof event.end.date === 'string' &&
    parseDate(event.start.date) && parseDate(event.end.date) && event.start.date < event.end.date
  const timed = typeof event.start.dateTime === 'string' && typeof event.end.dateTime === 'string' &&
    !Number.isNaN(Date.parse(event.start.dateTime)) && !Number.isNaN(Date.parse(event.end.dateTime))
  if (!allDay && !timed) throw new Error('Google Calendar returned an invalid event time.')
  return event
}

export async function listCalendarEvents(accessToken, date, signal) {
  const start = parseDate(date)
  if (!start) throw new Error('The selected date is invalid.')
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)
  // All-day events use the calendar's time zone, which can differ from the browser's.
  const searchStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 1)
  const searchEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
  const params = new URLSearchParams({
    timeMin: searchStart.toISOString(),
    timeMax: searchEnd.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  const events = []
  const seenTokens = new Set()
  let pageToken

  do {
    if (pageToken) params.set('pageToken', pageToken)
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    })
    if (!response.ok) {
      if (response.status === 401) throw new Error('Your Google session expired. Disconnect and connect again.')
      throw new Error(`Google Calendar request failed (HTTP ${response.status}).`)
    }
    const data = await response.json()
    if (!data || (data.items !== undefined && !Array.isArray(data.items)) ||
        (data.nextPageToken !== undefined && typeof data.nextPageToken !== 'string')) {
      throw new Error('Google Calendar returned an invalid response.')
    }
    events.push(...(data.items ?? []).map(validateEvent))
    pageToken = data.nextPageToken
    if (pageToken && seenTokens.has(pageToken)) throw new Error('Google Calendar returned a repeated page token.')
    if (pageToken) seenTokens.add(pageToken)
  } while (pageToken)

  return events.filter((event) => event.start.date
    ? event.start.date <= date && event.end.date > date
    : new Date(event.start.dateTime) < end && new Date(event.end.dateTime) > start)
}
