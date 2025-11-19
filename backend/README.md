# Universal Resume Builder – Backend

Express + MongoDB API that powers the MakeResume web app (hackathon project “Universal Resume Builder for Bharat Workforce”).

## Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Google OAuth Client ID (for verifying `idToken`)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=supersecret
   GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
   BASE_URL=http://localhost:5000
   PUBLIC_APP_URL=http://localhost:8080
   ```
3. Install deps: `npm install`
4. Start dev server: `npm run dev`

## Key Routes

### Auth
| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/google` | Accepts `{ idToken }`, returns `{ token, user }` |

### Resume (Protected)
- `POST /api/resumes` – create resume (multipart supported)
- `GET /api/resumes/me` – current user’s resumes
- `GET /api/resumes/:id` – get resume
- `GET /api/resumes/:id/pdf?template=classic` – template-specific PDF
- `GET /api/resumes/:id/qr?template=modern` – QR code + full share link

### Public
- `GET /api/public/resume/:slug` – data for public view

## Features

- JWT auth middleware
- Resume model with versions + comments
- PDF generation via PDFKit (template-aware)
- QR generation with template-aware URLs pointing to frontend
- Upload endpoints using Multer
- Skill inference/translation stubs

## Dev Notes

- Uses `helmet` with relaxed COOP for Google login
- CORS allowlist via `ALLOWED_ORIGINS`
- Remember to restart after env/config changes (QR links read env vars)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Nodemon dev server |
| `npm start` | Production mode |

## Folder Structure

```
backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── templates/
├── utils/
└── uploads/
```

## Deployment Tips

- Set `PUBLIC_APP_URL` to your frontend domain so QR links use correct host.
- Use a persistent storage for `/uploads` if allowing media uploads.
- Configure process manager (PM2, systemd) for production.
