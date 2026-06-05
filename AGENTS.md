# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

**Tune Traveller** (`project-tune-traveller`) is a SvelteKit 2 + Svelte 5 + Vite 8 frontend scaffold. There is no backend, database, Docker stack, or test runner yet — only a landing page and planning docs under `docs/planning/`.

### Services

| Service         | Command           | Port           | Required?                              |
| --------------- | ----------------- | -------------- | -------------------------------------- |
| Vite dev server | `npm run dev`     | 5173 (default) | Yes, for local development             |
| Vite preview    | `npm run preview` | 4173 (default) | Optional, for production build preview |

### Standard commands

See `README.md` for the canonical list:

- **Install deps:** `npm install`
- **Dev server:** `npm run dev` (add `-- --open` to launch browser)
- **Lint:** `npm run lint` (Prettier + ESLint)
- **Type check:** `npm run check` (svelte-check)
- **Build:** `npm run build`
- **Preview build:** `npm run preview`

### Notes for cloud agents

- **Package manager:** npm only (`package-lock.json` is present; no pnpm/yarn).
- **Node:** v22+ works with the current dependency set.
- **No `.env` required** for the current scaffold — the landing page runs without secrets.
- **No git hooks** (no Husky/pre-commit) are configured in this repo.
- **Detached HEAD / branch:** The full app lives on `origin/cursor/initialise-project-4d0b`; `main` may only have an empty initial commit. Check out the feature branch before developing.
- **Dev server:** Use a tmux session (e.g. `vite-dev-server`) for long-running `npm run dev`. Vite will auto-increment the port if 5173 is busy.
