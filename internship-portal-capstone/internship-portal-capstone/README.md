# InternBridge — Full-Stack Internship Portal Capstone

A production-ready full-stack internship portal allowing students to search and filter verified internships, bookmark roles, submit applications with validation, and track or withdraw submissions across desktop and mobile viewports.

## Features
- **Complete Student Journey:** Search by keyword/skill, filter by domain, inspect role responsibilities, bookmark roles, submit applications, and manage application statuses.
- **Mobile-First & Accessible UI:** Responsive CSS Grid layout, 44px minimum tap targets, keyboard-friendly navigation, skip links, and `aria-live` status feedback.
- **Observability & Operations:** Structured JSON request logging with `X-Request-Id` tracing and a `/health` readiness endpoint reporting uptime, datastore reachability, and memory usage.
- **Security Hardening:** HTTP security headers via `helmet`, CORS configuration, request size limits, server-side input sanitization, and duplicate-application protection.

## Project Structure
```text
internship-portal-capstone/
├── docs/
│   └── ENGINEERING_DECISIONS.md   # Architecture choices, trade-offs, and audit notes
├── public/
│   ├── index.html                 # Accessible semantic markup & modals
│   ├── styles.css                 # Mobile-first responsive styles
│   └── app.js                     # Client state, API integration & UI rendering
├── src/
│   ├── data/store.js              # Seeded internship & application datastore
│   ├── middleware/
│   │   ├── logger.js              # Structured JSON logger & request ID tracer
│   │   └── validate.js            # Server-side sanitization & payload validation
│   ├── routes/api.js              # REST API endpoints
│   └── server.js                  # Express app, security middleware & /health check
├── tests/
│   └── api.test.js                # Integration & regression tests (node:test)
├── .env.example
└── package.json
```

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```

3. **Run the application**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

4. **Run automated tests**
   ```bash
   npm test
   ```

## API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness & datastore readiness check |
| `GET` | `/api/internships?q=&domain=` | List, search, and filter internships |
| `GET` | `/api/internships/:id` | Get full details for a single internship |
| `GET` | `/api/applications?email=` | Fetch applications for a student |
| `POST` | `/api/applications` | Validate and submit a new application |
| `PATCH` | `/api/applications/:id/withdraw` | Withdraw an existing application |
| `GET` | `/api/saved?email=` | Get bookmarked internship IDs |
| `POST` | `/api/saved/toggle` | Bookmark or unbookmark an internship |

## Engineering Decisions
See [`docs/ENGINEERING_DECISIONS.md`](docs/ENGINEERING_DECISIONS.md) for architecture notes, trade-offs, and security/accessibility verification details.
