# Interactive Calendar

An interactive calendar for college students to keep track of classes,
assignments, and other commitments. The app combines a monthly calendar and
local task list with an optional, read-only view of Google Calendar events.

**Live application:** [interactive-calendar-cyan.vercel.app](https://interactive-calendar-cyan.vercel.app/)

## Features

- Navigate between months, select a day, and return to today.
- Add dated tasks, edit them, mark them complete, and delete them.
- Save tasks in the current browser using local storage. Tasks do not sync
  between browsers or devices and may be lost if browser data is cleared.
- Optionally view events from your primary Google Calendar for the selected day.
- Use a responsive layout on mobile, tablet, and desktop.

Courses, Assignments, and Settings are currently placeholder pages; their
features are not implemented.

## Technologies

- React, React Router, Vite, and plain CSS for the SPA.
- React Context for shared task state, with local component state for forms and
  calendar selection.
- Google Calendar API and Google Identity Services for optional event access.
- Vitest, React Testing Library, jsdom, Oxlint, and Playwright for testing and
  linting.

The application source, dependency manifest, and lockfile are in
[`interactive-calendar/`](./interactive-calendar/).

## Setup and installation

The versions in the lockfile require Node.js **22.22.2 or newer in the 22.x
series, 24.15.0 or newer in the 24.x series, or 26 or newer**, plus npm.

```sh
git clone https://github.com/TLAllen662/InteractiveCalendar.git
cd InteractiveCalendar/interactive-calendar
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Google
Calendar is optional; the calendar and local tasks work without it.

From `interactive-calendar/`, use:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Preview a previously created production build locally. |
| `npm run lint` | Run Oxlint. |
| `npm test` | Run the Vitest utility and React interaction tests. |
| `npm run test:responsive` | Run Playwright browser checks. |

For responsive checks, first run `npx playwright install chromium` and install
any operating-system libraries Playwright requires. Google Calendar tests use
mocked responses and do not require Google credentials.

## Routes

| Route | Current behavior |
| --- | --- |
| `/` | Monthly calendar, local tasks, and optional Google Calendar events. |
| `/courses` | Courses placeholder. |
| `/assignments` | Assignments placeholder. |
| `/settings` | Settings placeholder. |
| Other paths | Not-found page. |

## Google Calendar API

The app requests events from the signed-in user's **primary** calendar using
the [Google Calendar events list API](https://developers.google.com/workspace/calendar/api/v3/reference/events/list)
and Google Identity Services. It requests the
`https://www.googleapis.com/auth/calendar.events.readonly` OAuth scope. This
permission allows reading events from all calendars the user can access, though
the app only requests the primary calendar.

Events are read-only and are not copied into local tasks; local tasks are not
sent to Google. The API request includes adjacent days to account for calendar
time zones, and the app displays only events overlapping the selected day.
Timed events use the browser's local time zone. The interface shows loading and
error states and allows retrying requests.

### Optional Google setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   and enable the Google Calendar API.
2. Configure the OAuth consent screen and the read-only scope above. Add test
   users if the app is in testing mode.
3. Create an OAuth client ID for a **Web application**. Add the exact app
   origin, such as `http://localhost:5173`, to its authorized JavaScript origins.
4. In `interactive-calendar/`, copy `.env.example` to `.env.local` and set
   `VITE_GOOGLE_CLIENT_ID` to your client ID. Restart Vite after changing it.
5. On the calendar page, select **Connect Google Calendar** and grant access.

Do not put an OAuth client secret in the client application. Access tokens are
kept in memory only; leaving the calendar page or reloading requires connecting
again. Disconnecting clears the current session but does not revoke the Google
grant. Access can be revoked in
[Google Account permissions](https://myaccount.google.com/permissions). Google
may require app verification before public release.

## Deployment

The live app is hosted on [Vercel](https://interactive-calendar-cyan.vercel.app/).
For a Vercel project connected to this GitHub repository:

1. Set the project root directory to `interactive-calendar` and select the Vite
   framework preset.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Connect the production branch in Vercel for automatic deployments. The
   included [`vercel.json`](./interactive-calendar/vercel.json) rewrites SPA
   routes to `index.html` so direct links work.
4. To enable Google Calendar, set `VITE_GOOGLE_CLIENT_ID` in the Vercel
   environment, add the production origin to the Google OAuth client's authorized
   JavaScript origins, and redeploy. Do not add a client secret to the
   client-side environment.

## Project structure

Within [`interactive-calendar/src/`](./interactive-calendar/src/):

- `components/`: reusable UI, calendar, task, and layout components.
- `pages/`: route-level pages.
- `contexts/` and `hooks/`: shared task state and stateful behavior.
- `services/`: Google authorization and API requests.
- `utils/`: date and local-storage utilities.
- `test/`: shared Vitest setup; component and utility tests live alongside
  application code.

Playwright responsive tests are in
[`interactive-calendar/tests/`](./interactive-calendar/tests/).
