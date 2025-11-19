# MakeResume – Approach Overview (One Page)

## Problem
Blue-, grey-, and white-collar workers often struggle with traditional resume builders: they need simpler input modes (voice/chat/forms), mobile-friendly PDFs, QR sharing, and a way to iterate with comments/versions. The challenge asked for at least two input modes, resume generation (PDF + profile page), QR sharing, and versioned storage.

## Solution Overview
MakeResume combines a React/Vite frontend with an Express/Mongo backend to deliver a multi-modal resume experience:
- **Input Modes:** Multi-step form enhanced with speech-to-text buttons on every field (voice+form). Chat flow is staged as “coming soon”.
- **Resume Generation:** Users preview resumes across 5 templates (Classic, Modern, Minimalist, Developer, Creative). Downloads use a template-aware PDFKit generator.
- **Shareability:** Each resume gets a public slug and template-specific QR link (e.g., `/r/<slug>?template=modern`). Links open a mobile-friendly public page.
- **Storage & Collaboration:** Resumes belong to a user, store multiple versions, track comments, and let users choose which version is current.

## Architecture
- **Frontend (make-resume-hub):** React 18 + Vite + Tailwind. Handles auth, dashboard, multi-step form, voice controls, preview, template selection, comments, and QR modal. Google OAuth login; tokens stored in localStorage.
- **Backend (backend):** Express + MongoDB. Handles auth (verify Google ID tokens, issue JWT), resume CRUD, versioning, comments, PDF/QR generation, and public resume API. Uses PDFKit for server-side generation and `qrcode` for data URLs.
- **Public Page:** `/r/<slug>` in frontend pulls `publicService` API data, applies the template, and exposes a selector so recipients can see alternate styles.

## Key Decisions
1. **Voice Mode via Web Speech API:** Instead of a separate “voice page”, we keep the form but add mic buttons on every field. This reduces UX complexity and still meets the “two input modes” requirement.
2. **Template-Driven Preview + PDF:** We render templates on the client for instant feedback and pass the template ID to the backend so downloads match exactly what users see.
3. **QR Links with Template Query:** Each QR encodes `/r/<slug>?template=<id>`, allowing separate shareable links per style.
4. **PDFKit over Puppeteer:** For serverless friendliness (e.g., Vercel), PDFKit avoids heavy headless browser dependencies while still allowing custom layouts.

## Data Model
```text
User
 └─ Resume
     ├─ contact info
     ├─ versions[] { title, summary, experience, education, skills, languages, portfolioMedia }
     ├─ currentVersionIndex
     └─ comments[]
```

## Flow Summary
1. **Auth:** Google OAuth → backend verifies `idToken` → returns JWT stored on client.
2. **Create:** User completes form (with optional voice dictation) → `POST /api/resumes`.
3. **Preview:** `/app/resume/:id/preview` fetches resume, lets user choose template, download PDF, or open QR modal.
4. **Share:** QR code + template-specific link; recipients open `/r/<slug>?template=...` without logging in.
5. **Feedback:** Others can leave comments; owner sees them in preview.

## Requirements Coverage
| Requirement | How it’s satisfied |
|-------------|--------------------|
| ≥2 input modes | Guided form + speech-to-text mic buttons |
| Resume generation | Template preview + PDFKit downloads |
| Mobile-friendly profile | `/r/:slug` responsive page |
| QR share link | `GET /api/resumes/:id/qr` with template support |
| Resume storage & versioning | Mongo `versions[]` + `currentVersionIndex` |
| Comments/notes | `comments` array, comments tab in preview |

Optional ideas stubbed or partially implemented (skill inference, translation, media uploads) are ready for future enhancement.

## Deployment
Designed for Vercel/Render:
- Frontend: build via Vite, host static assets.
- Backend: Express server with environment variables (`MONGODB_URI`, `PUBLIC_APP_URL`, etc.). QR URLs use `PUBLIC_APP_URL` so links point to the deployed frontend.

## Next Steps
- Fully implement chat-style input and automatic translations.
- Persist uploads to cloud storage (S3/Cloudinary) for media portfolio.
- Add user analytics, AI-based skill inference, and verification/trust scores.

MakeResume provides a flexible foundation that already meets the core hackathon requirements while leaving room for creative extensions.

