# Math Tree (Tally Second Test)

A full-stack number-discussion playground built for the Ellty assignment. The backend is an Express + TypeScript API backed by MongoDB, while the frontend is a Vite + React SPA that visualizes the calculation tree, handles authentication, and lets registered users publish operations.

## Tech Stack

- **Backend:** Node.js, Express 5, TypeScript, Mongoose, JWT Auth, Jest + Supertest for tests.
- **Frontend:** React 19 + Vite, modern hooks, custom context for auth, CSS modules for styling.
- **Tooling:** ts-node for dev, ts-jest for tests, mongodb-memory-server for in-memory integration tests.

## Repository Layout

```
Tally-Second/
├── client/          # Vite + React SPA
├── server/          # Express + TypeScript API
└── requirements-map # Business scenario traceability (docs)
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or Docker). The default dev URI is `mongodb://localhost:27017/math-tree` but you can override via `.env`.

## Backend (server)

1. Copy env template and adjust as needed:

```bash
cd Tally-Second/server
cp .env.example .env
```

2. Install dependencies and start the dev API:

```bash
npm install
npm run dev
```

3. Build for production:

```bash
npm run build
npm start
```

4. Run the Jest + Supertest integration suite (uses in-memory Mongo):

```bash
npm test
```

### Notable Environment Variables

| Name | Default | Description |
| --- | --- | --- |
| `PORT` | 5000 | HTTP port for the API |
| `MONGO_URI` | `mongodb://localhost:27017/math-tree` | Mongo instance; replace with Docker hostname when using Compose |
| `JWT_SECRET` | `super-secret-key` | Token signing secret |

## Frontend (client)

1. Configure the API URL (only needed when not hitting `http://localhost:5000`):

```bash
cd Tally-Second/client
echo VITE_API_URL=http://localhost:5000/api > .env.local
```

2. Install deps and start Vite dev server:

```bash
npm install
npm run dev
```

3. Build static assets:

```bash
npm run build
npm run preview
```

### Interface highlights

- Discussion chains now render in a centered "timeline" layout inspired by the product mockup. The styles live in `client/src/App.css` (`.panel--tree`, `.tree`, `.node-card*`).
- Node cards display avatars (initials), timestamps, and operation pills so it is easy to scan who performed each step.
- The sidebar (auth + start panel) stays sticky on large screens, keeping the primary actions within reach while scrolling through long chains.

## Usage Flow

1. **Browse tree anonymously:** Hitting the SPA without login pulls `GET /api/calc` and renders the nested discussion tree.
2. **Register & login:** Use the Auth panel to create an account and obtain a JWT. Newly created users start as `unregistered` observers.
3. **Upgrade role:** Click “Become Registered” to call `POST /api/auth/upgrade` and gain rights to start/reply.
4. **Start chains / reply:** Use the “Start a discussion” panel to publish a starting number or expand any node and click **Reply** to send operations.

## API Reference (quick glance)

| Method & Path | Description | Auth |
| --- | --- | --- |
| `POST /api/auth/register` | Create an account (username/password). | None |
| `POST /api/auth/login` | Obtain JWT. | None |
| `POST /api/auth/upgrade` | Change role from `unregistered` → `registered`. | Bearer |
| `GET /api/auth/me` | Fetch current user profile. | Bearer |
| `GET /api/calc` | Fetch the calculation tree + summary. | Public |
| `POST /api/calc/start` | Start a new chain with a starting number. | Bearer + registered |
| `POST /api/calc/reply` | Publish an operation responding to any node. | Bearer + registered |

## Deployment Notes & Next Steps

- **Docker Compose:** Recommended future work is to add a docker-compose stack with `server`, `client`, and `mongo` services. API is already configured to read the `mongo` hostname via `MONGO_URI`.
- **Seeding & pagination:** Current implementation focuses on correctness; consider adding seeds and pagination for large trees.
- **Client tests:** Server integration tests are in place; extending coverage with React Testing Library would be a good follow-up.

## GitHub Upload & Pages Deployment

1. **Initialize the repo locally (only once):**

	```powershell
	cd "c:\Users\ADITYA RAJ\Documents\tally\Tally-Second"
	git init
	git branch -m main
	git add .
	git commit -m "feat: initial import"
	git remote add origin https://github.com/<your-username>/<repo-name>.git
	git push -u origin main
	```

2. **Pages workflow:** Pushing to `main` triggers `.github/workflows/deploy-client.yml`, which builds the Vite SPA inside `client/` and publishes `client/dist` to GitHub Pages. Nothing else is required once the workflow exists.

3. **Set Pages source:** In the GitHub repository → *Settings* → *Pages*, choose “GitHub Actions” as the source.

4. **Custom domains / paths:** The workflow passes the repository name to `VITE_BASE_PATH`, so the client automatically serves from `https://<user>.github.io/<repo>/`. If you ever host it elsewhere, override the path by running `VITE_BASE_PATH=/custom/ npm run build` before deploying.

## Troubleshooting

- If tests hang, ensure no real MongoDB is bound to the same port; the suite uses `mongodb-memory-server` and should not require external services.
- When running client + server concurrently, confirm CORS is allowed (already enabled globally via `cors()` middleware).
- Delete `localStorage` entry `math-tree.auth` to simulate a fresh unauthenticated view.
