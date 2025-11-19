# MakeResume – Universal Resume Builder

End-to-end solution for the “Universal Resume Builder for Bharat Workforce” hackathon: React/Vite frontend + Express/Mongo backend. Users can create resumes through forms + voice input, preview multiple templates, download PDFs, and share QR-linked public profiles.

## Repo Structure

```
.
├── backend/         # Express API, Mongo models, PDF/QR utils
└── make-resume-hub/ # React frontend built with Vite + Tailwind
```

## Prerequisites

- Node.js ≥ 18
- npm (or pnpm/yarn)
- MongoDB instance (local or Atlas)
- Google OAuth Client ID

## 1. Backend Setup (`backend/`)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=supersecret
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
BASE_URL=http://localhost:5000
PUBLIC_APP_URL=http://localhost:8080   # frontend origin for QR links
ALLOWED_ORIGINS=http://localhost:8080
```

Run dev API:
```bash
npm run dev
```

### Key Endpoints
- `POST /api/auth/google` – exchange Google `idToken` for JWT
- `POST /api/resumes` – create resume (supports multipart `profilePhoto` and `version` payloads)
- `GET /api/resumes/:id/pdf?template=classic` – template-specific PDF (PDFKit)
- `GET /api/resumes/:id/qr?template=modern` – QR + share URL hanging off frontend
- `GET /api/public/resume/:slug` – public data for `/r/:slug`

## 2. Frontend Setup (`make-resume-hub/`)

```bash
cd make-resume-hub
npm install
cp .env.example .env
```

Populate `.env`:
```
VITE_API_BASE=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

Run Vite dev server:
```bash
npm run dev   # http://localhost:8080
```

### Frontend Highlights
- Google OAuth login
- Multi-step form with speech-to-text buttons on every input
- Template selector (Classic, Modern, Minimalist, Developer, Creative)
- Template-aware QR links & PDF downloads
- Public resume page `/r/:slug?template=...` mirrors template selection

## 3. End-to-End Flow

1. Start backend (`localhost:5000`) and frontend (`localhost:8080`)
2. Sign in via Google
3. Use dashboard → “Fill a Form” or “Speak Your Info”
4. Complete steps, submit resume
5. Preview with template selector
6. Download PDF or share via QR/public link

## Scripts Overview

| Location | Command | Description |
| --- | --- | --- |
| backend | `npm run dev` | Nodemon server |
| backend | `npm start` | Production mode |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Production build |
| frontend | `npm run preview` | Preview built app |

## Deployment Tips

- Set `PUBLIC_APP_URL` to your deployed frontend domain so QR links work everywhere.
- Host frontend `make-resume-hub/dist` on static host (Netlify/Vercel/S3).
- Run backend on Node host (Railway, Render, EC2, etc.) with Mongo connection.
- Configure HTTPS + proper CORS allowlist per environment.

## Demo Notes

- Record a short video covering: login → voice-enabled form → template preview → PDF download → QR share → public link open on mobile.
- Include `README` + `setup instructions` (this file) in submission along with demo video.

## License

MIT. Contributions welcome—open an issue/PR if you extend templates or add new input modes.

