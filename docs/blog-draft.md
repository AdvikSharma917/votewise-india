# Building VoteWise India for PromptWars / Build with AI 2026

For PromptWars / Build with AI 2026, I built VoteWise India, a non-partisan election process education app for students and first-time voters. The goal was to make election learning feel interactive instead of turning it into a long page of civic studies notes.

## The Problem

Many young learners understand elections mainly as the moment of voting. But an election is a full process: eligibility, registration, electoral rolls, candidate nomination, campaigning, polling day, EVM/VVPAT, counting, and results. If students only learn the final step, the rest can feel confusing or intimidating.

VoteWise India tries to make that process easier to understand through guided interaction.

I later reorganized the prototype from one long page into lightweight app-style views: Home, Learn, Simulator, AI Guide, Glossary, Quiz, Teacher Mode, and Settings. It still uses one HTML entry and no framework, but hash routes make it feel easier to navigate.

For judging, I added a 90-second tour on the Home view, a safe Google Services Status card, and a PromptWars evaluation card that maps the project directly to code quality, security, efficiency, testing, accessibility, and Google services.

## The Idea

The app teaches by doing:

- A journey map explains each election stage.
- A before/during/after timeline gives learners a quick mental model.
- A personalized pathway adapts learning for different users.
- Scenario cards help learners pick a route based on their situation.
- A searchable glossary and term tooltips explain hard words like Electoral Roll, VVPAT, NOTA, EVM, Constituency, and Model Code of Conduct.
- FAQ items answer common first-time voter questions.
- A misinformation check mini-game helps users practice spotting false claims.
- A mock EVM/VVPAT simulator lets users experience a fictional vote flow.
- A Gemini AI Election Guide answers process questions.
- Myth vs fact cards correct common misunderstandings.
- A VoteReady certificate quiz gives a score, weak topics, explanations, and next steps.
- Teacher Mode gives a 5-minute activity, discussion questions, key terms, quick quiz idea, and answer key.
- Accessibility settings include bigger text, high contrast, simple English, reduce motion, reading focus, theme shortcut, and reset controls.
- Optional Firestore support can store anonymous quiz outcomes when deployed with Google Cloud.

The design goal was a polished civic-tech feel: clean, modern, serious, and approachable.

## AI and Prompt Strategy

The AI guide uses Gemini only for election process education. The browser never sees the API key. Questions go to a Node server route, where they are validated before Gemini is called.

The Gemini instruction is intentionally narrow:

- Explain the Indian election process.
- Stay factual and beginner-friendly.
- Do not recommend, rank, support, or oppose political parties or candidates.
- Do not use real party or candidate names.
- Refuse political persuasion requests and redirect to process education.

This makes the AI feature part of the learning system instead of a chatbot pasted onto a page.

## Safety Guardrails

VoteWise India is completely non-partisan. It does not use real parties or real candidates in simulations. The mock voting simulator uses only Candidate A, Candidate B, Candidate C, and NOTA.

The AI guide blocks political recommendation questions before sending them to Gemini. For example, if someone asks who to vote for, the app refuses politely and offers to explain how voting works or how to evaluate information safely.

The app also includes a clear disclaimer: it is educational, non-partisan, and not an official Election Commission website.

## Accessibility

Accessibility was treated as part of the actual product, not a footer claim. The app includes:

- Keyboard-friendly controls.
- Visible focus states.
- Semantic headings.
- Skip link.
- Screen-reader-friendly status messages.
- Bigger text mode.
- High contrast mode.
- Simple English mode.
- Reduce motion mode.
- Dark and light themes.

These features help make civic learning more usable for more people.

## Testing

I added focused tests for the areas most likely to matter in a hackathon demo:

- Quiz scoring.
- VoteReady label ranges.
- Weak topic detection.
- Glossary search.
- Misinformation answer checking.
- VoteReady certificate defaults.
- Hash route resolution for app-style views.
- Political recommendation blocking.
- VVPAT slip rendering after a simulated vote.

The tests use Node's built-in test runner, which keeps the project lightweight and easy to run.

## Google Services

The project uses Gemini for the AI Election Guide. It is designed so the API key stays on the server through environment variables. The project can be deployed to Google Cloud Run or Firebase App Hosting, and the README explains how to configure Gemini securely.

I also added deployment-ready Google service support without pretending it is already live:

- Firebase Hosting can serve the static frontend.
- Firebase Hosting can rewrite `/api/**` requests to Cloud Run.
- Cloud Run can run the Node backend.
- Secret Manager can provide `GEMINI_API_KEY` in production.
- Firestore can store anonymous quiz-result metadata if enabled.

## What I Learned

The biggest lesson was that civic education apps need both clarity and restraint. It is easy to add more facts, more cards, and more UI. It is harder to make the experience calm enough that a first-time voter can understand what to do next.

I also learned that AI safety is not only about one prompt. The app needs layered protection: UI messaging, local validation, server-side blocking, model instructions, and clear disclaimers.

## Future Improvements

Future versions could add:

- Multi-language support.
- More classroom activities.
- Teacher dashboard mode.
- Offline-first content.
- A Firebase database for anonymous quiz analytics.
- Voice narration for accessibility.
- More detailed process modules with citations to official election education material.

VoteWise India is a small build, but the mission is important: help people understand the election process without pushing them toward any political choice.
