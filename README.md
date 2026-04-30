# VoteWise India

VoteWise India is a non-partisan election process education app for students and first-time voters learning how Indian elections work. It teaches through interaction: a journey map, before/during/after timeline, scenario cards, searchable glossary, term tooltips, FAQ, misinformation check mini-game, fictional EVM/VVPAT simulator, Gemini-powered AI guide, myth vs fact cards, VoteReady certificate quiz, accessibility controls, and optional anonymous quiz-result storage in Firestore.

This is an educational simulation. It is not an official Election Commission website and it does not provide political recommendations.

## Quick Start

Requirements:

- Node.js 18 or newer.

Run locally:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Run tests:

```bash
npm test
```

Run tests plus build/security checks:

```bash
npm run check
```

## Manual Judge Test Flow

1. Open `http://localhost:3000/#home`.
2. Click `Start 90-Second Judge Tour`.
3. Open the Simulator view and record a fictional vote.
4. Open AI Guide and ask: `Who should I vote for?`
5. Open Glossary and search for `VVPAT`.
6. Complete the Quiz and view the VoteReady certificate.
7. Open Settings and toggle accessibility options.
8. Return Home and check the Google Services Status card.

## Environment Variables

Create a local `.env` file:

```bash
cp .env.example .env
```

Local `.env`:

```text
GEMINI_API_KEY=your_real_gemini_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3000

FIRESTORE_PROJECT_ID=
FIRESTORE_COLLECTION=quizResults
```

Never put `GEMINI_API_KEY` in `public/`, frontend JavaScript, GitHub, or `firebase.json`. The key belongs only in local `.env`, Cloud Run environment variables, or Secret Manager-backed Cloud Run configuration.

## Code Quality

- Dependency-light architecture: plain HTML/CSS/JS plus a small Node backend.
- Lightweight hash-routed app views keep one HTML entry while making the prototype feel like a real app.
- Shared logic lives in `public/lib/electionLogic.js`, so UI, server validation, and tests use the same rules.
- Election content lives in `public/lib/electionData.js`.
- Searchable glossary, FAQ, scenarios, timeline, and misinformation claims are data-driven.
- Term tooltips reuse glossary definitions for Electoral Roll, VVPAT, NOTA, EVM, Constituency, and Model Code of Conduct.
- The VoteReady result is presented as a certificate with an optional local learner name field that defaults to `Learner`.
- Backend routes are isolated in `server.js`.
- Optional Firestore integration lives in `src/firestore.js`.
- No real party names or candidate names are used in simulations.
- The simulator uses only Candidate A, Candidate B, Candidate C, and NOTA.

Project structure:

```text
public/
  index.html
  styles.css
  app.js
  lib/
    electionData.js
    electionLogic.js
src/
  firestore.js
tests/
docs/
server.js
firebase.json
Dockerfile
```

## App Views

VoteWise India uses hash routes instead of a heavy frontend framework:

- `#home`: hero, safety promise, and quick feature cards.
- `#learn`: timeline, election journey, pathway, scenarios, myths, misinformation check, and FAQ.
- `#simulator`: fictional EVM/VVPAT simulator and related glossary links.
- `#ai-guide`: Gemini-powered election process assistant with safety guardrails.
- `#glossary`: searchable election dictionary.
- `#quiz`: VoteReady quiz and certificate.
- `#teacher`: classroom activity, discussion prompts, key terms, quiz idea, and answer key.
- `#settings`: accessibility and learning preferences.

Refreshing a URL with one of these hashes opens the matching view. Legacy section hashes like `#timeline`, `#journey`, and `#accessibility` also resolve to the correct view.

## Security

Implemented:

- Gemini key is server-side only.
- `.env` and `.env.*` are ignored by Git.
- AI questions are trimmed and capped at 500 characters.
- Political recommendation questions are blocked before Gemini is called.
- Gemini receives a non-partisan system instruction.
- Server limits request body size.
- Basic per-IP rate limiting is included for API routes.
- Security headers include Content Security Policy, `X-Content-Type-Options`, `Referrer-Policy`, and `X-Frame-Options`.
- `/api/status` returns only safe configured/not-configured Google service status and never returns secret values.
- AI answers are escaped before being rendered in the browser.
- `npm run build` scans frontend files for API-key-like strings and forbidden secret references.

Safe refusal behavior:

```text
I can explain the election process, but I can't recommend or oppose any party or candidate. I can help you understand how voting works, how to evaluate information, or what happens on polling day.
```

## Efficiency

- No framework bundle.
- No client-side AI SDK.
- Static frontend assets are cacheable.
- The Gemini request happens only after local validation passes.
- Optional Firestore writes store only anonymous quiz metadata.
- Firebase Hosting can serve the frontend globally while Cloud Run handles `/api/**`.

## Testing

Run:

```bash
npm test
```

Current tests cover:

- Quiz scoring.
- VoteReady label ranges.
- Weak topic detection.
- Glossary search/filter logic.
- Misinformation answer checking.
- VoteReady certificate defaults.
- Hash route resolution for app-style views.
- Political recommendation blocking.
- Mock voting VVPAT slip rendering.
- Anonymous quiz-result validation.
- Firestore REST field conversion.

Run the full check:

```bash
npm run check
```

This runs the tests and verifies:

- required files exist
- disclaimer is present
- security headers are configured
- API routes exist
- Firebase Hosting config includes an `/api/**` Cloud Run rewrite
- frontend files do not contain Gemini API key references or API-key-like strings

## Accessibility

Implemented:

- Semantic headings and landmarks.
- Skip link.
- Keyboard-friendly buttons, links, form controls, and quiz choices.
- Visible focus states.
- Form labels and live status regions.
- Bigger text mode.
- High contrast mode.
- Simple English mode.
- Reduce motion mode.
- Reading focus mode.
- Reset all settings control.
- Theme shortcut in the accessibility panel.
- Dark and light theme toggle.
- Responsive mobile layout.

## Google Services

The Home view includes a safe Google Services Status card powered by:

```text
GET /api/status
```

It reports only booleans such as Gemini configured, Firestore configured, Firebase Hosting ready, and Cloud Run ready. It does not expose API keys, tokens, project secrets, or secret values.

### Gemini API

The AI Election Guide uses Gemini through the secure Node backend route:

```text
POST /api/guide
```

The browser sends the question to the backend. The backend validates it, blocks political recommendation questions, and then calls Gemini using the API key from the server environment. Google documents Gemini REST `generateContent` calls with the `x-goog-api-key` header in the [Gemini API reference](https://ai.google.dev/api).

### Firebase Hosting Ready

`firebase.json` is included. It serves the `public/` frontend and rewrites `/api/**` to a Cloud Run service named `votewise-india-api` in `us-central1`.

This is deployment-ready configuration, not a deployed service. You still need to create a Firebase project and deploy it.

Firebase documents Hosting rewrites to Cloud Run here: [Serve dynamic content and host microservices with Cloud Run](https://firebase.google.com/docs/hosting/cloud-run).

### Cloud Run Ready

`Dockerfile` is included for Cloud Run. The backend listens on `PORT`, which Cloud Run provides automatically.

Example deploy flow:

```bash
gcloud run deploy votewise-india-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_MODEL=gemini-2.5-flash,FIRESTORE_COLLECTION=quizResults
```

For production, use Secret Manager for `GEMINI_API_KEY` instead of plain env vars.

### Secret Manager Ready

Cloud Run supports exposing Secret Manager secrets as environment variables. Google documents this with `--update-secrets` and `--set-secrets` in the [Cloud Run secrets guide](https://cloud.google.com/run/docs/configuring/services/secrets).

Example:

```bash
gcloud secrets create gemini-api-key --replication-policy=automatic
printf "YOUR_REAL_GEMINI_KEY" | gcloud secrets versions add gemini-api-key --data-file=-

gcloud run services update votewise-india-api \
  --region us-central1 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

Manual IAM setup may be required so the Cloud Run service account can access the secret.

### Firestore Support

VoteWise India includes real optional Firestore support for anonymous quiz results:

```text
POST /api/quiz-results
```

Stored data:

- score
- total
- percentage
- VoteReady label
- weak topics
- completion timestamp
- browser user agent string
- source marker

Not stored:

- name
- email
- phone number
- voting preference
- real party/candidate data

How it works:

- Locally, Firestore is disabled unless configured.
- On Cloud Run, set `FIRESTORE_PROJECT_ID` or rely on `GOOGLE_CLOUD_PROJECT`.
- Attach a service account with Firestore write access.
- The backend uses the Cloud Run metadata server to get an access token and writes through the Firestore REST API.
- If Firestore is not configured, the app honestly reports that anonymous storage is unavailable and the quiz still works locally.

This is Firestore-ready support, not a claim that your database has already been created.

## Deployment Options

### Option A: Cloud Run Only

Deploy the full Node app to Cloud Run. This serves both frontend and backend.

Manual setup:

- Create Google Cloud project.
- Enable Cloud Run.
- Enable Secret Manager if using secrets.
- Enable Firestore if using anonymous quiz results.
- Configure `GEMINI_API_KEY`.

### Option B: Firebase Hosting + Cloud Run

Use Firebase Hosting for the frontend and Cloud Run for API routes.

Manual setup:

- Create Firebase project.
- Deploy `votewise-india-api` to Cloud Run.
- Update `firebase.json` if you choose a different service name or region.
- Run `firebase deploy --only hosting`.

### Option C: Static Frontend Only

You can host only the `public/` folder on Firebase Hosting, but Gemini and Firestore will not work because they require the Node backend.

## Non-Partisan Disclaimer

VoteWise India is an educational, non-partisan simulation. It is not an official Election Commission website and does not provide political recommendations.
