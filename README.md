# EazyCaller Frontend

React/Vite frontend for EazyCaller. It provides mock authentication, a browser dialer, country-code-aware phone number input, Twilio Voice SDK calling, call status display, and per-user call history.

## What The Frontend Does

- Lets users register or log in with mock local credentials
- Stores the mock user in `localStorage`
- Suggests a country code from the browser locale and prefixes phone numbers in E.164 format
- Requests microphone access before starting browser calls
- Fetches a Twilio Voice access token from the backend
- Starts browser-to-phone calls with `@twilio/voice-sdk`
- Tracks call states from Twilio SDK events
- Stores browser call history per user in `localStorage`
- Merges local history with server records from `GET /api/calls`

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix UI
- React Router
- TanStack Query
- Twilio Voice JavaScript SDK
- Vitest

## Main Routes

- `/login`: mock sign in
- `/register`: mock registration
- `/`: dialer
- `/calls`: recent calls

## Local Development

Install dependencies:

```sh
npm install
```

Start the dev server:

```sh
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

During development, Vite proxies `/api` requests to:

```text
http://localhost:8080
```

So the backend should be running locally on port `8080`.

From the repository root, you can also run:

```sh
make frontend
```

or start MongoDB, backend, and frontend together:

```sh
make dev
```

## Environment

The API base URL is controlled by:

```env
VITE_API_BASE_URL=/api
```

If `VITE_API_BASE_URL` is not set, the app defaults to `/api`.

For deployed frontend builds, set `VITE_API_BASE_URL` to the deployed backend URL if the frontend and backend are on different origins:

```env
VITE_API_BASE_URL=https://your-backend.example.com
```

## Backend Contract

The frontend calls these backend endpoints:

- `GET /api/voice/token`
- `GET /api/calls`
- `POST /api/call`
- `GET /api/call/:callId/status`
- `POST /api/call/:callId/end`

Current browser calling mainly uses `GET /api/voice/token`. The REST call endpoints are still supported by the backend and the history view can merge records returned by `GET /api/calls`.

App requests include:

```text
X-User-ID: user@example.com
```

The value is the email from mock login or registration.

## Call Flow

1. User logs in or registers.
2. User enters a destination number in the dialer.
3. `PhoneInput` prefixes the number with the selected country dial code.
4. `useCall` requests microphone permission.
5. `useCall` fetches a Twilio Voice token from `GET /api/voice/token`.
6. The Twilio SDK connects with `params: { To: normalizedPhoneNumber }`.
7. Twilio requests TwiML from the backend's `/twilio/client/voice` webhook.
8. SDK events update the UI status and local call history.

## Call History

History is stored per mock user in `localStorage`:

```text
eazycaller:call-history:<userId>
```

When the hook loads, it:

1. Reads local history for the signed-in user.
2. Fetches server history from `GET /api/calls`.
3. Merges both lists by call ID.
4. Sorts newest first.
5. Keeps the latest 50 records.

Clearing history removes the local cache for the active user.

## Scripts

```sh
npm run dev        # start Vite
npm run build      # production build
npm run build:dev  # development-mode build
npm run lint       # lint project
npm run preview    # preview production build
npm test           # run Vitest once
npm run test:watch # run Vitest in watch mode
```

## Project Structure

```text
src/
  components/       Reusable UI and dialer components
  components/ui/    shadcn/ui primitives
  hooks/            Auth, call, toast, and mobile hooks
  pages/            Route-level screens
  services/         Backend API client
  types/            Shared frontend types
  lib/              Utility helpers
```

## Verification

Run:

```sh
npm run build
npm test
```

The repository root `make check` also runs frontend lint, build, and tests after `cargo check` for the backend.

## Troubleshooting

- `GET /api/voice/token` fails: make sure the backend is running and the mock user is logged in.
- Browser call cannot start: allow microphone access and use a secure context where required by the browser.
- Twilio connection fails: confirm backend Twilio API Key and TwiML App settings are correct.
- Phone number validation fails: use E.164 format after the country prefix, for example `+2348012345678`.
- Call history looks empty: sign in with the same email used when the calls were made.
