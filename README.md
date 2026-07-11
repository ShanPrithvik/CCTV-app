# Smart CCTV Console

A React web console for managing CCTV cameras and configuring AI-based detection rules (shoplifting, crowd detection, restricted-area monitoring). Operators can register camera RTSP streams, draw Regions of Interest (ROI) directly on a camera snapshot, and attach detection rules per camera.

> This is the **frontend** of the app. It talks to a backend REST API expected at `http://localhost:5000`.

## Features

- **Camera management** — add, view, and delete cameras with an RTSP URL and a friendly name.
- **Detection rules** — create, edit, and delete rules per camera.
- **Model types**:
  - `Shoplifting`
  - `Crowd Detection` — with configurable *number of people* and *time to lookout* thresholds.
  - `Restricted Area`
- **ROI selector** — draw a region of interest (up to 4 points) on the live camera snapshot.
- **Toast notifications** for success/error feedback.
- Clean, responsive UI built with Material UI (MUI).

## Tech Stack

- [React 19](https://react.dev/) (Create React App)
- [React Router 7](https://reactrouter.com/)
- [Material UI 6](https://mui.com/) (`@mui/material`, `@mui/icons-material`, Emotion)
- [Axios](https://axios-http.com/) for HTTP requests

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- The backend API running locally on port `5000` (see API section below)

## Getting Started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:3000)
npm start
```

The app opens at [http://localhost:3000](http://localhost:3000) and redirects to `/cameras`.

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
│   ├── camerasApi.js      # camera CRUD API calls
│   └── ruleConfigApi.js   # rule CRUD + camera view API calls
├── components/
│   ├── CameraItem.jsx     # single camera row (add/edit/delete)
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

Camera snapshots are served from `http://localhost:5000/camera-view/<camera_name>.png`.

> Note: the API base URL is currently hard-coded in `src/api/*.js`. Consider moving it to an environment variable (e.g. `REACT_APP_API_BASE_URL`) before deploying.

## License

Private project. All rights reserved.
