# PowerGuard — Weather Risk & Preparedness

Public website: https://powerguard-weather-app.vercel.app

## Purpose
PowerGuard helps people **prepare** for weather conditions that could increase the chance of electricity disruptions. It does not predict exact outages, restore power, or act as a complaint service.

### Core features
- Live Open-Meteo forecasts and transparent, uncalibrated weather-hazard scoring
- Hourly weather outlook, rain probability, gusts and forecast rainfall
- Personalizable charging, lighting, water, offline-material and safety checklist
- Optional, authenticated, **unverified** local outage observations
- Local situational-awareness summary, counting distinct active reporters within 2 hours (3+ produces a visible community advisory, **not a confirmed outage**)
- Reporter can mark their own observed outage as restored, without affecting anybody else's observation
- Moderator can review submissions, mark misleading/irrelevant items dismissed, or attach factual context; moderator does not process repairs or answer complaints
- Official provider and weather-agency resource links

## Local preview
Serve this directory over HTTP (e.g. `python -m http.server 4173`), then open http://localhost:4173. The site is otherwise a static app. The published build uses Supabase Auth and PostgreSQL; client configuration includes only a **publishable** API key, never a service-role key.

## Deployment
Vercel project `powerguard-weather-app`; Supabase project `gpsfsjygpfsyrnlidszi` (Free plan). Upload `index.html` and `admin.html` as static deployment files. Do not add the development JS extraction, screenshot, or SQL backups to the hosted root.

## Safety and limitations
- The score is a **weather hazard index, not a probability of power cuts**. Actual outages also depend on infrastructure and operational decisions.
- Community reports are self-reported. Counts are sensitive to adoption and spam; no report count establishes an official grid status.
- Open-Meteo failures are shown as SAMPLE DATA, visibly labeled.
- For electrical emergencies and planned-shutdown confirmations use verified utility sources.
- Authenticated contributors can mark only their own outage restored. Moderator actions are checked by Supabase Row Level Security and update-guard triggers.
- The site does not implement push notifications or outage restoration predictions.
- Checklist preferences are stored locally in a browser, not synced across devices.

## End-sem project walkthrough
1. Open dashboard and explain risk scoring as weighted weather hazards.
2. Choose another city and review the hourly weather outlook.
3. Mark preparedness actions complete; change personalization toggles.
4. Log in and submit a clearly labeled example observation; observe it in the local signals feed.
5. Mark your own observation restored; observe status change.
6. Use moderator screen (`/admin.html`) for quality review, never utility restoration.
7. Show Supabase authenticated reporting, RLS policies, and Vercel deployment.
## Repository structure

- `index.html` / `admin.html`: public app and moderation entrypoints
- `src/`: explainable risk engine, weather API, auth/data adapter, client features
- `styles/`: application and moderation stylesheets
- `tests/`: isolated Node regression tests
- `docs/`: design, security, flow diagrams, demo and deployment guidance

### Development
Run `npm test` with Node.js 20+ or serve the folder with `python -m http.server 4173`.
This static project uses ESM imports and should be opened through an HTTP server, not `file://`.

GitHub repository: https://github.com/Irshaad-afk/Software-project

**Do not add server-side Supabase service-role keys or password values to source control.**
