I’m building VoteWise India for PromptWars / Build with AI 2026.

The idea is simple: help students and first-time voters understand the Indian election process by experiencing it, not just reading paragraphs.

I also reorganized the prototype into app-style views: Home, Learn, Simulator, AI Guide, Glossary, Quiz, Teacher Mode, and Settings.

For judges, I added a 90-second tour, a safe Google Services status card, and a PromptWars evaluation summary mapped to the scoring categories.

What I built:

- An election journey map from eligibility to results
- A before/during/after election timeline
- Personalized voter pathways
- Scenario cards for different learner situations
- A searchable glossary and term tooltips
- FAQ for common first-time voter questions
- A misinformation check mini-game
- A fictional EVM/VVPAT mock voting simulator
- A Gemini-powered AI Election Guide
- Myth vs fact cards
- A 10-question VoteReady certificate quiz
- Teacher Mode with a short classroom activity and answer key
- Accessibility controls like bigger text, high contrast, simple English, reduce motion, reading focus, reset, and dark mode
- Optional anonymous quiz-result storage for Firestore when deployed

The most important design rule: the app is completely non-partisan. It does not support or oppose any party or candidate, does not use real party names in simulations, and refuses questions like “who should I vote for?” The AI guide only explains election processes.

I also focused on hackathon judging basics:

- clean code
- secure Gemini API handling through a server route
- Firebase Hosting + Cloud Run deployment readiness
- Secret Manager-ready production setup
- input validation and safety guardrails
- useful tests
- accessible UI
- Google/Firebase-ready deployment path

This project taught me that civic-tech is not just about putting information online. It is about helping people feel less confused and more prepared, while staying neutral and trustworthy.

#PromptWars #BuildWithAI #GoogleForDevelopers #Hack2Skill #GoogleAntigravity #Gemini #Firebase #CivicTech #ElectionEducation #BuildInPublic
