# Interactive Calendar

An interactive calendar for college students, built with React and Vite.

## Development

```sh
npm install
npm run dev
```

Run `npm run build` for a production build, `npm run lint` to check the code,
and `npm test` for the utility tests.

## Using the calendar

Choose a day to view its tasks. Add tasks with a date, mark them complete, edit
them, or delete them. The month controls navigate the calendar and Today returns
to the current day. Tasks are stored in this browser's local storage; they do not
sync across browsers or devices and can be lost if browser data is cleared. If
saved data cannot be read, editing is disabled to avoid overwriting it.

## Project structure

- `src/components/`: reusable UI, calendar, task, and layout components.
- `src/pages/`: route-level pages that compose components.
- `src/hooks/`: reusable stateful behavior.
- `src/contexts/`: shared React contexts, when needed.
- `src/utils/`: date and local-storage utilities.

React Router handles client-side navigation. The app uses plain CSS and does not
yet require a UI library or API client. Deployments must serve `index.html` for
client-side routes.
