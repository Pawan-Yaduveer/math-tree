# Feature Mapping & Implementation Plan

| Business Scenario | Backend Responsibilities | Data Model Touchpoints | Client Responsibilities |
| --- | --- | --- | --- |
| 1. Unregistered users can see the tree | `GET /api/calc` returns flattened list of nodes (with parent links) sorted chronologically. Public route, no auth. | Uses `Node` documents only. Provides derived tree structure on the client. | Fetch tree on load, build nested UI. Refresh when operations arrive. |
| 2. Unregistered users can create an account | `POST /api/auth/register` validates username/password, saves hashed password, default role `registered`. | `User` collection (username unique, passwordHash, role). | Show signup form, basic validations, success state. |
| 3. Unregistered users authenticate and change role | `POST /api/auth/login` issues JWT. Optional `PATCH /api/users/:id/role` for admin toggles (or auto elevate on signup). Token stored client-side. | `User` role field (`unregistered` → `registered`). | Login form, token storage, gating create/reply buttons. |
| 4. Registered users start chains | `POST /api/calc/start` (auth). Body: `{ value }`. Saves `Node` with `operation: "start"`, `parentId: null`. | `Node` document referencing `userId`. | UI form for starting number; optimistic update or refetch tree. |
| 5. Registered users add operation to selected start number | `POST /api/calc/reply` (auth). Body includes `parentId`, `operation`, `inputNumber`. Server computes result. | `Node` documents referencing parent. Validates divide-by-zero. | UI control near each node to choose operation + operand. |
| 6. Registered users can respond to any calculation | Same `POST /api/calc/reply` endpoint; parent can be any node. Authorization ensures owner is logged in. | `Node` tree forms arbitrary depth; indexes on `parentId`. | Expand/collapse tree, allow replies everywhere. |

## Data Storage
- MongoDB via Mongoose (already configured in `server/src/index.ts`).
- `Node` schema (added): `userId`, `parentId`, `operation`, `inputNumber`, `value`, timestamps.
- `User` schema: `username`, `passwordHash`, `role`. Passwords hashed with `bcryptjs`.

## Security & Auth Flow
1. Registration (open).
2. Login returns JWT signed with secret from `.env`.
3. Auth middleware verifies JWT, injects `req.user`.
4. Role enforcement: start/reply endpoints require `role !== 'unregistered'`.

## API Surface (Target)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/calc`
- `POST /api/calc/start` (auth)
- `POST /api/calc/reply` (auth)
- Optional: `GET /api/users/me` for session bootstrap.

## Client Plan
- `App.tsx` will host routes/sections:
  - AuthPanel: signup/login forms, shows status.
  - TreeView: fetches `GET /api/calc`, builds nested components.
  - NodeCard: displays value, operation, author, timestamp, reply button.
  - OperationForm: dropdown for op type + number input.
- Global context for auth token, stored in `localStorage`.
- Use fetch/axios for API calls, handle errors gracefully.

## Testing Strategy
- Server: Supertest suite covering auth, start, reply, divide-by-zero, unauthorized access.
- Client: React Testing Library for tree rendering (optional if time allows).

## Deployment Notes
- Docker Compose to spin up API + Mongo + client (Vite). Compose file will:
  - `server` service (exposes 5000)
  - `client` service (Vite dev build or production `npm run build` + serve)
  - `mongo` service with volume.
