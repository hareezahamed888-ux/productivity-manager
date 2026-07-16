# Productivity Manager

A simple productivity manager app for the web with task tracking, notes, and a calendar for date-based events.

## Features

- Add daily tasks with due dates
- Mark tasks complete or delete them
- Save quick notes for the day
- Create calendar events tied to a specific date
- View events by selected date in the calendar
- Persist data locally using browser storage
- Basic PWA support with install prompt and offline caching

## Files

- `index.html` — main application markup
- `styles.css` — app styling and responsive layout
- `app.js` — task, note, and event management logic
- `manifest.webmanifest` — PWA manifest for install behavior
- `sw.js` — service worker for offline caching

## How to use

1. Open `index.html` in your browser.
2. Add tasks and select a due date.
3. Write notes in the notes section.
4. Use the calendar section to choose a date and add events.
5. The app stores your data locally in the browser.

## Install as App

If your browser supports Progressive Web Apps, you can install the app using the browser install prompt.

## Customize

- Update `styles.css` to change the visual theme.
- Modify `app.js` to add support for categories, priorities, or reminders.

## Notes

- Data is stored in local browser storage, so it is only available on the same device and browser.
- For best results, host the app on a local server or use a browser that supports service workers and PWA install features.
