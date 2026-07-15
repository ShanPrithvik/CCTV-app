# Smart CCTV Console

A React web console for managing CCTV cameras and configuring AI-based detection rules (shoplifting, crowd detection, restricted-area monitoring). Operators can register camera RTSP streams, draw Regions of Interest (ROI) directly on a camera snapshot, and attach detection rules per camera.

> This is the **frontend** of the app. It talks to a backend REST API, configurable via `REACT_APP_API_URL` (defaults to `http://localhost:5000`).

## Features

- **Camera management** — add, view, and delete cameras with an RTSP URL and a friendly name.
- **Detection rules** — create, edit, and delete rules per camera.
- **Model types**:
  - `Shoplifting`
  - `Crowd Detection` — with configurable *number of people* and *time to lookout* thresholds.
  - `Restricted Area`
- **ROI selector** — draw a region of interest (up to 4 points) on the live camera snapshot.
- **Live View** — a "Live View" button on each camera streams the backend's live annotated detection feed (ROI outline, bounding boxes, alert overlays) via MJPEG, once a detection rule is running for that camera.
- **Toast notifications** for success/error feedback.
- Clean, responsive UI built with Material UI (MUI).

## Tech Stack

- [React 19](https://react.dev/) (Create React App)
- [React Router 7](https://reactrouter.com/)
- [Material UI 6](https://mui.com/) (`@mui/material`, `@mui/icons-material`, Emotion)
- [Axios](https://axios-http.com/) for HTTP requests

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- The backend API running locally on port `5000` by default (see API section below)

## Getting Started

```bash
# install dependencies
npm install

# point the app at your backend (copy and edit if not using localhost:5000)
cp .env.example .env

# start the dev server (http://localhost:3000)
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000) and redirects to `/cameras`.

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `REACT_APP_API_URL` | Base URL of the backend API | `http://localhost:5000` |

Create React App inlines environment variables at **build time**, so `REACT_APP_API_URL` must be set before running `npm start` / `npm run build` (or configured as a build-time env var on your hosting provider).

## Deployment (free static hosting)

This is a static Create React App build, so it deploys for free on Vercel, Netlify, or Cloudflare Pages:

1. Push this repo to GitHub.
2. Import it into Vercel/Netlify, with build command `npm run build` and publish directory `build`.
3. Set the `REACT_APP_API_URL` environment variable in the provider's dashboard to your deployed backend's URL.
4. Deploy. Re-deploy whenever `REACT_APP_API_URL` changes (it's baked into the build).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm start` | Run the app in development mode. |
| `npm test` | Launch the test runner in watch mode. |
| `npm run build` | Build the production bundle into `build/`. |

## Project Structure

```
src/
├── api/
│   ├── config.js          # centralized API base URL (REACT_APP_API_URL)
│   ├── camerasApi.js      # camera CRUD API calls
│   └── ruleConfigApi.js   # rule CRUD + camera view API calls
├── components/
│   ├── CameraItem.jsx     # single camera row (add/edit/delete/live view)
│   ├── LiveView.jsx       # MJPEG live detection view
│   ├── ROISelector.jsx    # draw Region of Interest on snapshot
│   └── ToastNotification.jsx
├── pages/
│   ├── CamerasPage.jsx    # list & manage cameras
│   └── RuleConfigPage.jsx # configure detection rules per camera
├── App.js                 # routes & MUI theme
└── index.js               # entry point
```

## Routes

| Path | Page |
| --- | --- |
| `/cameras` | Camera management |
| `/cameras/:cameraId/rule_config` | Rule configuration for a camera |

## Backend API

The frontend expects a REST API at `http://localhost:5000/api/camera`:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/camera` | List cameras |
| `GET` | `/api/camera/:id` | Get a camera |
| `POST` | `/api/camera` | Create a camera |
| `DELETE` | `/api/camera/:id` | Delete a camera |
| `GET` | `/api/camera/:id/rule` | List rules for a camera |
| `POST` | `/api/camera/:id/rule` | Create a rule |
| `PUT` | `/api/camera/:id/rule/:ruleId` | Update a rule |
| `DELETE` | `/api/camera/:id/rule/:ruleId` | Delete a rule |
| `GET` | `/api/camera/:id/stream` | Live MJPEG detection view |

Camera snapshots are served from `{REACT_APP_API_URL}/camera-view/<camera_name>.png`.

> Note: the backend's `PUT /api/camera/:id/rule/:ruleId` route used by `updateRule()` is not yet implemented server-side; editing an existing rule currently returns a 404/405 from the backend. Creating new rules and deleting rules both work.

## License

Private project. All rights reserved.
