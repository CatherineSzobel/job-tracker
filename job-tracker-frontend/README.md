# Job Tracker: frontend

The React app for Job Tracker. See the [main README](../README.md) for features, setup and the API.

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api and /sanctum to http://job-tracker.test
npm run lint     # ESLint
npm run build    # production build in dist/
```

- `src/views`: one file per page
- `src/components`: feature components; `components/UI` holds the shared pieces (Modal, Tabs, list header, select mode, toasts, confirm dialog)
- `src/stores`: zustand (auth, theme, toasts, confirm dialogs)
- `src/constants`: fixed values shared across pages (statuses, tags, landing page content)
- `src/assets/landing`: optional landing page screenshots (`name.png`, plus `name-dark.png` for dark mode)
