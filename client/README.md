# Math Tree Client

This package contains the Vite + React SPA that talks to the Express API defined in `../server`. Use the top-level README for the full stack overview—this file only tracks client-specific commands.

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start Vite dev server
npm run build   # type-check and build static assets
npm run preview # preview the production build
```

## Environment

- `VITE_API_URL` (optional): defaults to `http://localhost:5000/api`. Create a `.env.local` if you need a different API origin.

## Notes

- Styling lives in `src/App.css`; components sit under `src/components`.
- The app bootstraps inside `src/main.tsx`, wrapping `<App />` with the auth context provider.
