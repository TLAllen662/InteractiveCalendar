# Interactive Calendar

An interactive calendar for college students, built with React and Vite.

## Development

```sh
npm install
npm run dev
```

Run `npm run build` for a production build, `npm run lint` to check the code,
and `npm test` for the utility and interaction tests.

## Using the calendar

Choose a day to view its tasks. Add tasks with a date, mark them complete, edit
them, or delete them. The month controls navigate the calendar and Today returns
to the current day. Tasks are stored in this browser's local storage; they do not
sync across browsers or devices and can be lost if browser data is cleared. If
saved data cannot be read, editing is disabled to avoid overwriting it.

## Google Calendar (optional)

The calendar can display events from the selected day on your primary Google
Calendar. This is read-only: Google events are not copied into local tasks,
and local tasks are not sent to Google. The requested Google permission allows
reading events from all calendars you can access, although this app only
requests events from your primary calendar. To account for calendar time zones,
the request includes adjacent days; only events overlapping the selected day
are displayed.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project and enable the Google Calendar API.
2. Configure the OAuth consent screen for your audience, including any test
   users required while the app is in testing. Request the
   `https://www.googleapis.com/auth/calendar.events.readonly` scope.
3. Create an OAuth client ID for a **Web application**, and add the exact app
   origin (for example `http://localhost:5173`) to its authorized JavaScript
   origins. Use HTTPS for deployed origins as required by Google.
4. Copy `.env.example` to `.env.local`, set `VITE_GOOGLE_CLIENT_ID` to the
   client ID, and restart Vite. Do not put an OAuth client secret in the app.
5. On the calendar page, select **Connect Google Calendar** and grant access.

The connection uses Google Identity Services and keeps its access token only in
memory; leaving the calendar page or reloading requires connecting again.
Disconnect clears the current session but does not revoke the Google grant.
You can revoke access in your [Google Account permissions](https://myaccount.google.com/permissions).
Events are shown in the browser's local time zone. Google may require app
verification before a public release.

## Routes

- `/`: interactive calendar and tasks.
- `/courses`, `/assignments`, and `/settings`: placeholder pages for planned
  features.
- Unmatched URLs show a not-found page.

## Project structure

- `src/components/`: reusable UI, calendar, task, and layout components.
- `src/pages/`: route-level pages that compose components.
- `src/hooks/`: reusable stateful behavior.
- `src/services/`: external API and authorization services.
- `src/contexts/`: shared task state and its provider.
- `src/utils/`: date and local-storage utilities.

React Router handles client-side navigation. The app uses plain CSS and the
browser's `fetch` API. Deployments must serve `index.html` for client-side
routes.

Tasks and storage errors are shared through `TaskProvider` across routes.
Calendar selection, form inputs, and Google Calendar connection state remain
local to their components; data is passed to reusable UI through props.
