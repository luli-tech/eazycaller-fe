# EazyCaller Frontend

React/Vite dialer UI for EazyCaller. The app provides mock login, a phone keypad, call status display, and server-backed call history.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Local Development

Install dependencies:

```sh
npm install
```

Start the frontend:

```sh
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:8080`.

Production builds use the Render backend configured in `.env.production`:

```env
VITE_API_BASE_URL=https://easzycaller-be.onrender.com
```

## Backend Contract

The frontend calls:

- `POST /api/call`
- `GET /api/calls`
- `GET /api/call/:callId/status`
- `POST /api/call/:callId/end`

Requests include `X-User-ID`, using the email from the local mock login.

## Build And Test

```sh
npm run build
npm test
```
