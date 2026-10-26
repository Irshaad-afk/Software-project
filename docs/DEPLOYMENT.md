# Deployment Guide

## Local

1. Install Python 3 or use any static development HTTP server.
2. In the project folder run `python -m http.server 4173`.
3. Open http://localhost:4173.

To run checks, install Node 20+ and execute `npm test`.
No npm dependencies are needed for runtime; Supabase's browser client is
loaded from a version-pinned CDN URL in the existing app.

## Public Vercel site

The hosted project is `powerguard-weather-app` under the existing owner's
Vercel account. Deploy the repository as a **static** site with root set to
this repository, framework Other, and build command empty.

Static root entrypoints:
- `/index.html`: public dashboard
- `/admin.html`: moderation screen

## Authentication

In Supabase Authentication → URL Configuration, set the production Site URL to
`https://powerguard-weather-app.vercel.app`; allow production callback URL(s).
For signups by non-team email addresses, configure a suitable SMTP provider;
Supabase's built-in mailer is restricted and intended for testing only.

Do not add Vercel secrets, DB passwords or a Supabase service-role key to GitHub.
