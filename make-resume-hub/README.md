# MakeResume – Frontend

React/Vite SPA that delivers the multi-modal resume builder UI (forms + voice + template previews).

## Quick Start

```bash
cd make-resume-hub
npm install
cp .env.example .env
npm run dev # http://localhost:8080
```

`.env` keys:
```
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

## Core Features

- Google OAuth login (token stored in localStorage)
- Multi-step form with voice dictation buttons on every field
- Manual + template-based resume preview
- Template-aware PDF download & QR sharing (classic/modern/minimalist/developer/creative)
- Resume list, comments, versions, public slug pages
- Public page template selector mirrors preview selection

## Project Layout

```
src/
  components/
    Layout.tsx
    ProtectedRoute.tsx
    VoiceInputButton.tsx
    templates/ResumeTemplates.tsx
  contexts/AuthContext.tsx
  pages/
    Landing, Login, Dashboard, CreateResumeForm, MyResumes,
    ResumePreview, PublicResume, NotFound
  services/api.ts
  types/resume.ts
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview built app |

## Setup Checklist

1. Start backend (`npm run dev` in `/backend`) so API requests succeed.
2. Put valid Google OAuth client ID in `.env`.
3. Update `VITE_API_BASE` when deploying (point to deployed API).
4. Serve `dist/` via static host (Netlify/Vercel/etc.).

## Notes

- Voice capture relies on browser Web Speech API (best in Chrome/Edge).
- Template selection state is query-param aware for public pages and QR links.
- For production, consider moving JWT to HttpOnly cookie + updating AuthContext accordingly.

## License

MIT (same as backend). Contributions welcome via PR.
