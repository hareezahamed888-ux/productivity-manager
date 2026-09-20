# Productivity Manager

A simple productivity manager app for the web with task tracking, notes, and a calendar for date-based events.

## Features

- Add daily tasks with due dates
- Mark tasks complete or delete them
- Save quick notes for the day
- Create calendar events tied to a specific date
- View events by selected date
- Persist data locally using browser storage
- Basic **PWA** support with install prompt and offline caching

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Service Worker + Web App Manifest (PWA)

## Project Structure

```
├── index.html
├── styles.css
├── app.js
├── manifest.webmanifest
└── sw.js
```

## How to Use

```bash
npx serve .
```

1. Open the local URL in your browser
2. Add tasks and select due dates
3. Write notes in the notes section
4. Use the calendar to choose a date and add events
5. Data is stored locally in the browser

## Install as App

If your browser supports Progressive Web Apps, use the install prompt to add it to your home screen.

## Notes

- Data lives in `localStorage` (device + browser specific)
- For best results host on HTTPS or use a local server that supports service workers

---

Built by [Hareez Ahamed Z](https://github.com/hareezahamed888-ux)
