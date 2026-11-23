# Architecture & Engineering Decisions

## 1. System Architecture
- **Frontend:** Semantic HTML5, responsive CSS Grid/Flexbox (`public/styles.css`), and modular vanilla ES6+ JavaScript (`public/app.js`) using native `<dialog>` elements for accessible modals.
- **Backend:** Node.js + Express (`src/server.js`) exposing a version-ready REST API under `/api/*` and a readiness endpoint at `/health`.
- **Persistence Layer:** Encapsulated in `src/data/store.js` so the storage adapter can be swapped for PostgreSQL or MongoDB without changing route handlers.

## 2. Key Trade-offs
- **Zero-build frontend vs. heavy bundler:** Chosen so any reviewer can clone and start the full-stack app immediately with `npm install && npm start`, while still maintaining clean separation of concerns, client-side state management, debounced search, and `aria-live` feedback.
- **Native `<dialog>` modals:** Provides built-in Escape-key dismissal, backdrop handling, and focus management without third-party UI library bloat.
- **Structured JSON logging:** Emits machine-readable logs with unique `X-Request-Id` correlation headers on every request while excluding PII/secrets from log payloads.

## 3. Production Checklist Verification
- **Accessibility:** Skip-to-content link, `:focus-visible` outlines, 44px minimum touch targets, semantic `<nav role="tablist">`, `aria-live="polite"` status announcements, and high-contrast color tokens.
- **Security:** `helmet` HTTP security headers, payload size limit (`50kb`), server-side input sanitization (`src/middleware/validate.js`), URL protocol validation (`http`/`https` only), and ownership verification on application withdrawal.
- **Quality & Regression:** Automated integration suite (`npm test` using `node:test`) covering health checks, search/filtering, input validation, and duplicate application prevention.
