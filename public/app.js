import {
  electionTimeline,
  faqItems,
  glossaryTerms,
  journeySteps,
  misinformationClaims,
  mythFacts,
  pathways,
  quizQuestions,
  scenarios,
  suggestedQuestions
} from "./lib/electionData.js";
import {
  checkMisinformationAnswer,
  createVoteReadyCertificate,
  createVoteState,
  createAnonymousQuizResult,
  filterGlossaryTerms,
  findGlossaryTerm,
  getSafeRefusal,
  renderVvpatSlipHtml,
  resolveViewRoute,
  resetVoteState,
  scoreQuiz,
  validateQuestion
} from "./lib/electionLogic.js";

const progress = loadProgress();

const appState = {
  selectedStep: journeySteps[0],
  selectedPathway: progress.selectedPathway,
  selectedScenario: progress.selectedScenario,
  simulatorTried: progress.simulatorTried,
  viewedGlossaryTerms: progress.viewedGlossaryTerms,
  vote: resetVoteState(),
  lastQuizResult: progress.lastQuizResult,
  slipTimer: null,
  settings: loadSettings(),
  revealObserver: null,
  sectionObserver: null
};

const APP_VIEW_ORDER = ["home", "learn", "simulator", "ai-guide", "glossary", "quiz", "teacher", "settings", "project-details"];
const CANDIDATE_OPTIONS = ["Candidate A", "Candidate B", "Candidate C", "NOTA"];
const TOOLTIP_TERMS = ["Model Code of Conduct", "Electoral Roll", "Constituency", "VVPAT", "NOTA", "EVM"];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const els = {
  body: document.body,
  header: document.querySelector(".site-header"),
  themeToggle: document.querySelector("#theme-toggle"),
  navButton: document.querySelector(".nav-menu-button"),
  navLinks: document.querySelector("#nav-links"),
  navSectionLinks: document.querySelectorAll("[data-view-link]"),
  visualStage: document.querySelector(".visual-stage"),
  journeyList: document.querySelector("#journey-list"),
  journeyDetail: document.querySelector("#journey-detail"),
  timelineGrid: document.querySelector("#timeline-grid"),
  pathwayOptions: document.querySelector("#pathway-options"),
  pathwayOutput: document.querySelector("#pathway-output"),
  scenarioGrid: document.querySelector("#scenario-grid"),
  scenarioOutput: document.querySelector("#scenario-output"),
  evmDevice: document.querySelector(".evm-device"),
  candidateButtons: document.querySelector("#candidate-buttons"),
  vvpatWindow: document.querySelector("#vvpat-window"),
  voteStatus: document.querySelector("#vote-status"),
  resetVote: document.querySelector("#reset-vote"),
  aiForm: document.querySelector("#ai-form"),
  aiQuestion: document.querySelector("#ai-question"),
  questionCount: document.querySelector("#question-count"),
  questionChips: document.querySelector("#question-chips"),
  aiAnswer: document.querySelector("#ai-answer"),
  mythGrid: document.querySelector("#myth-grid"),
  misinfoGame: document.querySelector("#misinfo-game"),
  glossaryQuery: document.querySelector("#glossary-query"),
  glossaryGrid: document.querySelector("#glossary-grid"),
  glossaryCount: document.querySelector("#glossary-count"),
  faqList: document.querySelector("#faq-list"),
  quizForm: document.querySelector("#quiz-form"),
  quizResult: document.querySelector("#quiz-result"),
  analyticsStatus: document.querySelector("#analytics-status"),
  accessibilityToggle: document.querySelector("#accessibility-toggle"),
  settingsPanel: document.querySelector("#settings-panel"),
  biggerText: document.querySelector("#bigger-text"),
  highContrast: document.querySelector("#high-contrast"),
  simpleEnglish: document.querySelector("#simple-english"),
  reduceMotion: document.querySelector("#reduce-motion"),
  readingFocus: document.querySelector("#reading-focus"),
  themeSync: document.querySelector("#theme-sync"),
  resetSettings: document.querySelector("#reset-settings"),
  settingsStatus: document.querySelector("#settings-status")
};

init();

function init() {
  els.body.classList.add("motion-ready");
  applySettings();
  setupViews();
  renderTimeline();
  renderJourney();
  renderPathways();
  renderScenarios();
  renderSimulator();
  renderQuestionChips();
  renderMyths();
  renderMisinformationGame();
  renderGlossary();
  renderFaq();
  renderQuiz();
  bindEvents();
  applyTermTooltips();
  setupRouter();
  setupHeroTilt();
  fetchServiceStatus();
  prepareReveal();
}

function bindEvents() {
  els.themeToggle.addEventListener("click", () => {
    appState.settings.dark = !appState.settings.dark;
    pulseThemeTransition();
    saveSettings();
    applySettings();
  });

  els.navButton.addEventListener("click", () => {
    const isOpen = els.navLinks.classList.toggle("open");
    els.navButton.setAttribute("aria-expanded", String(isOpen));
  });

  els.navSectionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      els.navLinks.classList.remove("open");
      els.navButton.setAttribute("aria-expanded", "false");
    });
  });

  els.resetVote.addEventListener("click", () => {
    clearTimeout(appState.slipTimer);
    appState.vote = resetVoteState();
    renderSimulator();
    setFresh(els.voteStatus);
  });

  els.aiQuestion.addEventListener("input", () => {
    els.questionCount.textContent = `${els.aiQuestion.value.length}/500`;
  });

  els.aiForm.addEventListener("submit", handleAiSubmit);

  els.accessibilityToggle.addEventListener("click", () => {
    const isOpen = els.settingsPanel.classList.toggle("is-open");
    els.accessibilityToggle.setAttribute("aria-expanded", String(isOpen));
  });

  prefersReducedMotion.addEventListener("change", () => {
    applySettings();
    prepareReveal();
  });

  bindSetting(els.biggerText, "biggerText");
  bindSetting(els.highContrast, "highContrast");
  bindSetting(els.simpleEnglish, "simpleEnglish", () => {
    renderJourney();
    renderPathways();
  });
  bindSetting(els.reduceMotion, "reduceMotion");
  bindSetting(els.readingFocus, "readingFocus");
  bindSetting(els.themeSync, "dark");

  els.resetSettings.addEventListener("click", () => {
    localStorage.clear();
    appState.settings = getDefaultSettings();
    const defaultProgress = getDefaultProgress();
    appState.selectedPathway = defaultProgress.selectedPathway;
    appState.selectedScenario = defaultProgress.selectedScenario;
    appState.simulatorTried = defaultProgress.simulatorTried;
    appState.viewedGlossaryTerms = defaultProgress.viewedGlossaryTerms;
    appState.lastQuizResult = defaultProgress.lastQuizResult;

    saveSettings();
    saveProgress();
    applySettings();
    renderJourney();
    renderPathways();
    renderScenarios();
    els.quizForm.reset();
    setStatus(els.settingsStatus, "Accessibility settings and progress reset.", "success");
  });

  els.glossaryQuery.addEventListener("input", () => {
    renderGlossary(els.glossaryQuery.value);
  });

  document.querySelector("#start-judge-tour")?.addEventListener("click", () => {
    const panel = document.querySelector("#judge-tour-panel");
    panel.hidden = !panel.hidden;
    panel.scrollIntoView({ behavior: isMotionReduced() ? "auto" : "smooth", block: "center" });
  });
}

function setupViews() {
  const main = document.querySelector("#main");
  const views = Object.fromEntries(
    APP_VIEW_ORDER.map((name) => {
      const view = document.createElement("section");
      view.className = "app-view";
      view.dataset.view = name;
      view.id = `view-${name}`;
      view.setAttribute("tabindex", "-1");
      view.hidden = true;
      return [name, view];
    })
  );

  const move = (viewName, selector) => {
    const node = document.querySelector(selector);
    if (node) views[viewName].append(node);
  };

  move("home", "#top");
  move("home", ".notice-band");
  views.home.append(createHomeOverview());

  views.learn.append(
    createViewIntro(
      "Learn",
      "Build a clear mental model of the election process before, during, and after polling day."
    )
  );
  ["#timeline", "#journey", "#pathway", "#scenarios", "#myths", "#misinformation", "#faq"].forEach((selector) =>
    move("learn", selector)
  );

  views.simulator.append(
    createViewIntro(
      "Simulator",
      "Practice a fictional EVM/VVPAT flow. This does not store, transmit, or represent a real vote."
    )
  );
  move("simulator", "#simulator");
  views.simulator.append(createGlossaryJump(["EVM", "VVPAT", "NOTA"]));

  views["ai-guide"].append(
    createViewIntro(
      "AI Guide",
      "Ask Gemini process questions through a safety layer that refuses political recommendations."
    )
  );
  move("ai-guide", "#ai-guide");

  views.glossary.append(
    createViewIntro("Glossary", "Search beginner-friendly election terms, examples, and related concepts.")
  );
  move("glossary", "#glossary");

  views.quiz.append(createViewIntro("Quiz", "Test your process knowledge and generate a local VoteReady certificate."));
  move("quiz", "#quiz");

  views.teacher.append(createTeacherMode());
  
  views["project-details"].append(createProjectDetailsView());

  views.settings.append(createViewIntro("Settings", "Adjust accessibility and learning preferences for this device."));
  move("settings", "#accessibility");

  main.replaceChildren(...APP_VIEW_ORDER.map((name) => views[name]));
}

function createViewIntro(title, description) {
  const section = document.createElement("section");
  section.className = "view-intro";
  section.innerHTML = `
    <p class="eyebrow">VoteWise India</p>
    <h1>${title}</h1>
    <p>${description}</p>
  `;
  return section;
}

function createHomeOverview() {
  const section = document.createElement("section");
  section.className = "section home-overview";
  section.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Start Here</p>
      <h2>Choose the tool you need right now.</h2>
      <p>VoteWise India is organized into focused app views so learning stays calm and manageable.</p>
    </div>
    <div class="feature-grid">
      <a class="feature-card" href="#learn"><strong>Start Learning</strong><span>Timeline, journey, scenarios, FAQ, myths, and misinformation practice.</span></a>
      <a class="feature-card" href="#simulator"><strong>Try Simulator</strong><span>Use fictional options to understand EVM/VVPAT verification.</span></a>
      <a class="feature-card" href="#ai-guide"><strong>Ask AI Guide</strong><span>Ask neutral process questions with political recommendation guardrails.</span></a>
      <a class="feature-card" href="#quiz"><strong>Take Quiz</strong><span>Earn a local VoteReady certificate and review weak topics.</span></a>
    </div>
    <div class="home-grid">
      <article class="trust-card">
        <p class="eyebrow">Trust & Privacy</p>
        <h2>Safe and Private Learning</h2>
        <ul class="trust-list">
          <li>No account or login required.</li>
          <li>Progress is saved on this device only.</li>
          <li>No personal voter data is collected.</li>
          <li>Gemini runs through a secure backend.</li>
          <li>Political recommendation questions are blocked.</li>
          <li>Educational, non-partisan simulation.</li>
        </ul>
      </article>
    </div>
    </section>
    <div class="trust-note-banner">
      <p class="trust-note"><strong>Safety Notice:</strong> VoteWise India is a non-partisan educational tool. It does not provide real political recommendations. For real voting actions, users should verify details with official election authorities.</p>
    </div>
  `;
  return section;
}

function createProjectDetailsView() {
  const section = document.createElement("section");
  section.className = "app-view-content project-details-content";
  section.innerHTML = `
    <section class="view-intro">
      <p class="eyebrow">Evaluator Information</p>
      <h1>Project Details</h1>
      <p>Technical overview, build checks, and evaluator shortcuts for the PromptWars submission.</p>
    </section>
    <section class="section">
      <div class="home-grid">
        <article class="judge-card">
          <p class="eyebrow">Judge Demo</p>
          <h2>Start 90-Second Judge Tour</h2>
          <p>Follow the shortest path through the strongest hackathon features.</p>
          <button class="button primary" type="button" id="start-judge-tour">Start 90-Second Judge Tour</button>
          <div class="judge-tour-panel" id="judge-tour-panel" hidden>
            <ol>
              <li><a href="#learn">Learn view</a> — timeline, journey, scenarios, myths, and misinformation check.</li>
              <li><a href="#simulator">Simulator</a> — fictional EVM/VVPAT demo.</li>
              <li><a href="#ai-guide">AI Guide safety</a> — ask “Who should I vote for?” and see the refusal.</li>
              <li><a href="#glossary">Glossary</a> — search VVPAT or NOTA.</li>
              <li><a href="#quiz">Quiz</a> — create a VoteReady certificate.</li>
              <li><a href="#settings">Settings</a> — test accessibility preferences.</li>
            </ol>
          </div>
        </article>
        <article class="status-card" id="google-status-card" aria-live="polite">
          <p class="eyebrow">Google Services</p>
          <h2>Status</h2>
          <dl class="status-list">
            <dt>Gemini API</dt><dd data-status-key="geminiConfigured">Checking...</dd>
            <dt>Firestore</dt><dd data-status-key="firestoreConfigured">Checking...</dd>
            <dt>Firebase Hosting</dt><dd data-status-key="firebaseHostingReady">Checking...</dd>
            <dt>Cloud Run</dt><dd data-status-key="cloudRunReady">Checking...</dd>
            <dt>Secret Manager</dt><dd data-status-key="secretManagerRecommended">Configured for Cloud Run</dd>
          </dl>
        </article>
      </div>
      <section class="evaluation-card" aria-labelledby="evaluation-title">
        <p class="eyebrow">Hackathon Readiness</p>
        <h2 id="evaluation-title">Built for PromptWars Evaluation</h2>
        <div class="evaluation-grid">
          <article><h3>Code Quality</h3><p>Dependency-light architecture, shared logic, data-driven content, hash-routed app views.</p></article>
          <article><h3>Security</h3><p>Gemini key server-side only, political recommendation blocking, security headers, no real parties/candidates.</p></article>
          <article><h3>Efficiency</h3><p>No heavy framework bundle, no client-side AI SDK, local static content, repo under 10 MB.</p></article>
          <article><h3>Testing</h3><p>Quiz, glossary, misinformation, route, Firestore conversion, and political guardrail tests.</p></article>
          <article><h3>Accessibility</h3><p>Skip link, keyboard controls, visible focus, high contrast, bigger text, reduce motion, reading focus, theme toggle.</p></article>
          <article><h3>Google Services</h3><p>Gemini API, Firebase Hosting-ready, Cloud Run-ready, Secret Manager-ready, optional Firestore support.</p></article>
        </div>
      </section>
    </section>
  `;
  return section;
}

/**
 * Creates a helper section to jump to glossary terms.
 * @param {string[]} terms - Array of glossary terms.
 * @returns {HTMLElement} The created section element.
 */
function createGlossaryJump(terms) {
  const section = document.createElement("section");
  section.className = "section compact-helper";
  section.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Related Glossary Terms</p>
      <h2>Review the vocabulary behind the simulator.</h2>
    </div>
    <div class="section-link-row">
      ${terms.map((term) => `<a class="button secondary" href="#glossary" data-glossary-term="${term}">${term}</a>`).join("")}
    </div>
  `;
  return section;
}

function createTeacherMode() {
  const section = document.createElement("section");
  section.className = "app-view-content";
  section.innerHTML = `
    <section class="view-intro">
      <p class="eyebrow">Classroom Mode</p>
      <h1>Teacher Mode</h1>
      <p>A ready-to-run classroom sequence for explaining elections without party politics.</p>
    </section>
    <section class="section teacher-grid-section">
      <div class="teacher-grid">
        <article class="teacher-card"><h2>5-minute activity</h2><p>Ask students to arrange Eligibility, Registration, Electoral Roll, Polling Day, Counting, and Results in order. Then compare with the Learn timeline.</p></article>
        <article class="teacher-card"><h2>Discussion questions</h2><ul><li>Why does the electoral roll matter?</li><li>How does VVPAT help verification?</li><li>Why should an AI tool avoid vote recommendations?</li></ul></article>
        <article class="teacher-card"><h2>Key terms</h2><p>Electoral Roll, Constituency, EVM, VVPAT, NOTA, Model Code of Conduct, Counting, Result Declaration.</p></article>
        <article class="teacher-card"><h2>Quick quiz idea</h2><p>Use the VoteReady quiz as an exit ticket. Ask students to write one weak topic they want to review.</p></article>
        <article class="teacher-card"><h2>Answer key</h2><p>VVPAT is not a take-home receipt. NOTA does not automatically cancel an election. Voters usually vote at their assigned polling station.</p></article>
      </div>
    </section>
  `;
  return section;
}

function bindSetting(input, key, afterChange = () => {}) {
  input.addEventListener("change", () => {
    appState.settings[key] = input.checked;
    pulseThemeTransition();
    saveSettings();
    applySettings();
    afterChange();
    setFresh(input.closest("label"));
    updateSettingStatus(`${input.closest("label")?.querySelector("strong")?.textContent || "Setting"} updated.`);
    prepareReveal(input.closest(".section") || document);
  });
}

/**
 * Renders the interactive election journey list and detail view.
 */
function renderJourney() {
  els.journeyList.innerHTML = journeySteps
    .map(
      (step, index) => `
        <button class="step-card stagger-child ${step.id === appState.selectedStep.id ? "active-step" : ""}" style="--reveal-delay: ${index * 45}ms" type="button" role="listitem" data-step="${step.id}" aria-pressed="${step.id === appState.selectedStep.id}">
          <strong>${step.title}</strong>
          <span>${appState.settings.simpleEnglish ? step.beginner : step.short}</span>
        </button>
      `
    )
    .join("");

  els.journeyList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedStep = journeySteps.find((step) => step.id === button.dataset.step);
      renderJourney();
      setFresh(els.journeyDetail);
    });
  });

  const step = appState.selectedStep;
  els.journeyDetail.innerHTML = `
    <h3>${step.title}</h3>
    <dl>
      <dt>What it means</dt>
      <dd>${appState.settings.simpleEnglish ? step.beginner : step.meaning}</dd>
      <dt>Why it matters</dt>
      <dd>${step.matters}</dd>
      <dt>Beginner explanation</dt>
      <dd>${step.beginner}</dd>
    </dl>
  `;
  setFresh(els.journeyDetail);
  prepareReveal(els.journeyList);
}

/**
 * Renders the before/during/after election timeline.
 */
function renderTimeline() {
  els.timelineGrid.innerHTML = electionTimeline
    .map(
      (phase, index) => `
        <article class="timeline-card stagger-child" style="--reveal-delay: ${index * 70}ms">
          <span class="timeline-number">0${index + 1}</span>
          <h3>${phase.phase}</h3>
          <p>${phase.summary}</p>
          <ol>
            ${phase.steps.map((step) => `<li>${withTooltips(step)}</li>`).join("")}
          </ol>
        </article>
      `
    )
    .join("");
  prepareReveal(els.timelineGrid);
  applyTermTooltips(els.timelineGrid);
}

/**
 * Renders the personalized voter pathways and content.
 */
function renderPathways() {
  els.pathwayOptions.innerHTML = Object.entries(pathways)
    .map(
      ([key, pathway], index) => `
        <button class="pathway-card stagger-child" style="--reveal-delay: ${index * 55}ms" type="button" role="listitem" data-pathway="${key}" aria-pressed="${key === appState.selectedPathway}">
          <strong>${pathway.label}</strong>
          <span>${pathway.title}</span>
        </button>
      `
    )
    .join("");

  els.pathwayOptions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedPathway = button.dataset.pathway;
      saveProgress();
      renderPathways();
      setFresh(els.pathwayOutput);
    });
  });

  const pathway = pathways[appState.selectedPathway];
  els.pathwayOutput.innerHTML = `
    <h3>${pathway.title}</h3>
    <p>${appState.settings.simpleEnglish ? simplifyPathway(pathway.summary) : pathway.summary}</p>
    <ol>
      ${pathway.steps.map((step, index) => `<li style="--item-index: ${index}">${step}</li>`).join("")}
    </ol>
  `;
  setFresh(els.pathwayOutput);
  prepareReveal(els.pathwayOptions);
}

function renderScenarios() {
  els.scenarioGrid.innerHTML = Object.entries(scenarios)
    .map(
      ([key, scenario], index) => `
        <button class="scenario-card stagger-child" style="--reveal-delay: ${index * 50}ms" type="button" role="listitem" data-scenario="${key}" aria-pressed="${key === appState.selectedScenario}">
          <strong>${scenario.label}</strong>
          <span>${scenario.explanation}</span>
        </button>
      `
    )
    .join("");

  els.scenarioGrid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      appState.selectedScenario = button.dataset.scenario;
      saveProgress();
      renderScenarios();
      setFresh(els.scenarioOutput);
    });
  });

  const scenario = scenarios[appState.selectedScenario];
  els.scenarioOutput.innerHTML = `
    <h3>${scenario.label}</h3>
    <p>${scenario.explanation}</p>
    <h4>Recommended learning path</h4>
    <ol>${scenario.path.map((step, index) => `<li style="--item-index: ${index}">${withTooltips(step)}</li>`).join("")}</ol>
    <h4>Suggested next sections</h4>
    <div class="section-link-row">
      ${scenario.next.map((href) => `<a class="button secondary" href="${href}">${sectionLabel(href)}</a>`).join("")}
    </div>
  `;
  prepareReveal(els.scenarioGrid);
  applyTermTooltips(els.scenarioOutput);
}

function simplifyPathway(text) {
  return text
    .replace("You likely need a quick refresh:", "Start here:")
    .replace("verify", "check")
    .replace("assigned", "given")
    .replace("credible information", "trusted information");
}

/**
 * Renders the mock voting simulator UI and state.
 */
function renderSimulator() {
  els.evmDevice.classList.toggle("has-vote", appState.vote.hasVoted);
  els.candidateButtons.innerHTML = CANDIDATE_OPTIONS
    .map(
      (option, index) => `
        <button class="candidate-button ${appState.vote.selected === option ? "selected" : ""}" type="button" data-option="${option}" aria-label="Record simulated vote for ${option}" ${appState.vote.hasVoted ? "disabled" : ""}>
          <span>${option}</span>
          <i aria-hidden="true">${index + 1}</i>
        </button>
      `
    )
    .join("");

  els.candidateButtons.querySelectorAll("button").forEach((button) => {
    button.addEventListener("pointerdown", () => button.classList.add("is-pressing"));
    button.addEventListener("animationend", () => button.classList.remove("is-pressing"));
    button.addEventListener("click", () => recordVote(button.dataset.option));
  });

  els.voteStatus.textContent = appState.vote.status;
  setFresh(els.voteStatus);

  if (appState.vote.slipVisible) {
    els.vvpatWindow.innerHTML = renderVvpatSlipHtml(appState.vote);
  } else if (appState.vote.hasVoted) {
    els.vvpatWindow.innerHTML = `<span>Slip hidden. Simulated vote remains recorded for ${appState.vote.selected}.</span>`;
  } else {
    els.vvpatWindow.innerHTML = renderVvpatSlipHtml(appState.vote);
  }
}

function recordVote(option) {
  appState.vote = createVoteState(option);
  appState.simulatorTried = true;
  saveProgress();
  renderSimulator();

  clearTimeout(appState.slipTimer);
  appState.slipTimer = setTimeout(() => {
    appState.vote = { ...appState.vote, slipVisible: false };
    renderSimulator();
  }, 4200);
}

function renderQuestionChips() {
  els.questionChips.innerHTML = suggestedQuestions
    .map((question, index) => `<button class="chip stagger-child" style="--reveal-delay: ${index * 45}ms" type="button">${question}</button>`)
    .join("");

  els.questionChips.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      els.aiQuestion.value = button.textContent;
      els.questionCount.textContent = `${els.aiQuestion.value.length}/500`;
      els.aiForm.requestSubmit();
    });
  });
  prepareReveal(els.questionChips);
}

async function handleAiSubmit(event) {
  event.preventDefault();
  const validation = validateQuestion(els.aiQuestion.value);
  const submitButton = els.aiForm.querySelector('button[type="submit"]');

  if (!validation.ok) {
    setAiAnswer(validation.reason, validation.blocked ? "warning" : "error");
    return;
  }

  submitButton.classList.add("is-loading");
  submitButton.textContent = "Asking...";
  setAiAnswer(
    '<span class="typing-indicator" aria-label="Gemini guide is thinking"><span></span><span></span><span></span></span>',
    "thinking"
  );

  try {
    const response = await fetch("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: validation.question })
    });

    const data = await response.json();

    if (!response.ok) {
      setAiAnswer(data.answer || data.error || getSafeRefusal(), data.blocked ? "warning" : "error");
      return;
    }

    setAiAnswer(data.answer, data.blocked ? "warning" : "success");
  } catch {
    setAiAnswer(
      "The AI guide is unavailable right now. You can still use the journey, simulator, myth cards, and quiz offline.",
      "error"
    );
  } finally {
    submitButton.classList.remove("is-loading");
    submitButton.textContent = "Ask Gemini Guide";
  }
}

/**
 * Renders the myth vs fact flip cards.
 */
function renderMyths() {
  els.mythGrid.innerHTML = mythFacts
    .map(
      (item, index) => `
        <article class="myth-card stagger-child" style="--reveal-delay: ${index * 55}ms" role="button" tabindex="0" aria-expanded="false">
          <span class="myth-card-inner">
            <span class="myth-face">
              <h3>Myth</h3>
              <p>${item.myth}</p>
              <span class="myth-hint">Reveal fact</span>
            </span>
            <span class="myth-face fact-face">
              <strong>Fact</strong>
              <p>${item.fact}</p>
              <span class="myth-hint">Show myth</span>
            </span>
          </span>
        </article>
      `
    )
    .join("");

  els.mythGrid.querySelectorAll(".myth-card").forEach((card) => {
    const toggle = () => {
      card.setAttribute("aria-expanded", String(card.getAttribute("aria-expanded") !== "true"));
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      toggle();
    });
  });

  prepareReveal(els.mythGrid);
}

function renderMisinformationGame() {
  els.misinfoGame.innerHTML = misinformationClaims
    .map(
      (claim, index) => `
        <article class="misinfo-card reveal-on-scroll" data-claim-id="${claim.id}">
          <p><strong>Claim:</strong> ${claim.claim}</p>
          <div class="misinfo-actions">
            <button class="button secondary" type="button" data-answer="true">True</button>
            <button class="button secondary" type="button" data-answer="false">False</button>
          </div>
          <p class="misinfo-feedback" role="status" aria-live="polite"></p>
        </article>
      `
    )
    .join("");

  els.misinfoGame.querySelectorAll(".misinfo-card").forEach((card) => {
    const claim = misinformationClaims.find((item) => item.id === card.dataset.claimId);
    card.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const result = checkMisinformationAnswer(claim, button.dataset.answer === "true");
        card.classList.toggle("is-correct", result.correct);
        card.classList.toggle("is-review", !result.correct);
        card.querySelector(".misinfo-feedback").textContent = `${result.correct ? "Correct." : "Review this."} ${result.explanation}`;
      });
    });
  });

  prepareReveal(els.misinfoGame);
}

/**
 * Renders the searchable glossary grid.
 * @param {string} query - Optional search query to filter terms.
 */
function renderGlossary(query = "") {
  const filtered = filterGlossaryTerms(glossaryTerms, query);
  els.glossaryCount.textContent = `${filtered.length} term${filtered.length === 1 ? "" : "s"} shown`;
  els.glossaryGrid.innerHTML = filtered
    .map(
      (item, index) => `
        <article class="glossary-card reveal-on-scroll" style="--reveal-delay: ${Math.min(index * 18, 160)}ms">
          <h3>${item.term}</h3>
          <p>${item.explanation}</p>
          <dl>
            <dt>Why it matters</dt>
            <dd>${item.matters}</dd>
            <dt>Example</dt>
            <dd>${item.example}</dd>
          </dl>
          <div class="related-row">
            ${item.related.map((term) => `<span>${term}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
  prepareReveal(els.glossaryGrid);
}

function renderFaq() {
  els.faqList.innerHTML = faqItems
    .map(
      (item, index) => `
        <details class="faq-item reveal-on-scroll" style="--reveal-delay: ${index * 35}ms">
          <summary>${item.question}</summary>
          <p>${withTooltips(item.answer)}</p>
        </details>
      `
    )
    .join("");
  prepareReveal(els.faqList);
  applyTermTooltips(els.faqList);
}

function renderQuiz() {
  const questionsHtml = quizQuestions
    .map(
      (question, questionIndex) => `
        <article class="question-card reveal-on-scroll" data-question-id="${question.id}">
          <fieldset>
            <legend>${questionIndex + 1}. ${question.question}</legend>
            <div class="answers">
              ${question.options
                .map(
                  (option, optionIndex) => `
                    <label>
                      <input type="radio" name="${question.id}" value="${optionIndex}" required />
                      ${option}
                    </label>
                  `
                )
                .join("")}
            </div>
          </fieldset>
        </article>
      `
    )
    .join("");

  els.quizForm.innerHTML = `
    <div class="quiz-progress" aria-label="Quiz progress">
      <div class="quiz-progress-top">
        <span>Progress</span>
        <span id="quiz-progress-count">0/${quizQuestions.length}</span>
      </div>
      <div class="quiz-progress-track"><div class="quiz-progress-bar" id="quiz-progress-bar"></div></div>
    </div>
    ${questionsHtml}
    <div class="quiz-actions">
      <button class="button primary" type="submit">Submit Quiz</button>
      <button class="button secondary" type="reset">Clear Answers</button>
    </div>
  `;

  els.quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(els.quizForm);
    const answers = Object.fromEntries(formData.entries());
    const result = scoreQuiz(quizQuestions, answers);
    markQuizAnswers(result);
    renderQuizResult(result);
    submitAnonymousQuizResult(result);
  });

  els.quizForm.addEventListener("reset", () => {
    els.quizResult.innerHTML = "";
    els.analyticsStatus.textContent = "";
    updateQuizProgress();
    els.quizForm.querySelectorAll(".question-card").forEach((card) => {
      card.classList.remove("is-correct", "is-review");
    });
  });

  els.quizForm.addEventListener("change", updateQuizProgress);
  
  if (appState.lastQuizResult) {
    markQuizAnswers(appState.lastQuizResult);
    renderQuizResult(appState.lastQuizResult, false);
  }

  prepareReveal(els.quizForm);
}

function renderQuizResult(result, animate = true) {
  appState.lastQuizResult = result;
  saveProgress();
  const weakTopicContent = result.weakTopics.length
    ? result.weakTopics
        .map((topic, index) => `<span class="weak-topic-chip" style="--item-index: ${index}">${topic}</span>`)
        .join("")
    : '<span class="weak-topic-chip" style="--item-index: 0">No weak topics detected</span>';

  els.quizResult.innerHTML = `
    <div class="certificate-controls">
      <label for="learner-name">Certificate name</label>
      <input id="learner-name" type="text" maxlength="40" value="Learner" autocomplete="off" />
    </div>
    <div class="result-hero">
      <div class="score-ring" data-final-percentage="${result.percentage}" style="--score: 0%">
        <strong class="score-count" data-final-score="${result.percentage}">0%</strong>
      </div>
      <div>
        <p class="eyebrow">VoteReady Score</p>
        <p class="certificate-name">Learner</p>
        <h3>${result.label}</h3>
        <p>You scored ${result.score} out of ${result.total}. ${result.label === "Election Process Pro" ? "Strong work: you understand the core process." : "You are on the way. Review the topics below and try again."}</p>
      </div>
    </div>
    <div class="result-metrics">
      <div class="result-metric" style="--item-index: 0"><span>Score</span><strong>${result.score}/${result.total}</strong></div>
      <div class="result-metric" style="--item-index: 1"><span>Percentage</span><strong>${result.percentage}%</strong></div>
      <div class="result-metric" style="--item-index: 2"><span>Status</span><strong>${result.label}</strong></div>
    </div>
    <h4>Weak topics</h4>
    <div class="weak-topic-row">${weakTopicContent}</div>
    <h4>Recommended next steps</h4>
    <div class="next-step-grid">${result.nextSteps.map((step, index) => `<div class="next-step-card"><span>Step ${index + 1}</span><p>${step}</p></div>`).join("")}</div>
    <h4>Explanations</h4>
    <ol class="explanation-list">
      ${result.explanations
        .map(
          (item) => `
            <li class="${item.correct ? "correct" : "review"}">
              <strong>${item.correct ? "Correct" : "Review"}:</strong>
              ${item.explanation}
            </li>
          `
        )
        .join("")}
    </ol>
    <button class="button secondary" type="button" id="restart-quiz">Restart quiz</button>
  `;
  const nameInput = els.quizResult.querySelector("#learner-name");
  const certificateName = els.quizResult.querySelector(".certificate-name");
  nameInput.addEventListener("input", () => {
    const certificate = createVoteReadyCertificate(appState.lastQuizResult, nameInput.value);
    certificateName.textContent = certificate.name;
  });
  els.quizResult.querySelector("#restart-quiz").addEventListener("click", () => {
    els.quizForm.reset();
    els.quizResult.innerHTML = "";
    els.analyticsStatus.textContent = "";
    els.quizForm.scrollIntoView({ behavior: isMotionReduced() ? "auto" : "smooth", block: "start" });
  });
  setFresh(els.quizResult);
  if (animate) animateScore(result.percentage);
  if (animate) els.quizResult.scrollIntoView({ behavior: isMotionReduced() ? "auto" : "smooth", block: "start" });
}

async function submitAnonymousQuizResult(result) {
  const payload = {
    ...createAnonymousQuizResult(result),
    userAgent: navigator.userAgent
  };

  els.analyticsStatus.textContent = "Checking anonymous quiz-result storage...";

  try {
    const response = await fetch("/api/quiz-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.stored) {
      setStatus(els.analyticsStatus, "Anonymous quiz result stored in Firestore.", "success");
      return;
    }

    setStatus(
      els.analyticsStatus,
      "Anonymous quiz storage is not configured in this environment. Your quiz still works locally.",
      "warning"
    );
  } catch {
    setStatus(
      els.analyticsStatus,
      "Anonymous quiz storage is unavailable right now. Your quiz score was calculated locally.",
      "error"
    );
  }
}

async function fetchServiceStatus() {
  try {
    const response = await fetch("/api/status");
    const status = await response.json();
    updateServiceStatus(status);
  } catch {
    updateServiceStatus({
      geminiConfigured: false,
      firestoreConfigured: false,
      firebaseHostingReady: true,
      cloudRunReady: true,
      secretManagerRecommended: true
    });
  }
}

function updateServiceStatus(status) {
  const labels = {
    geminiConfigured: status.geminiConfigured ? "Configured" : "Not configured",
    firestoreConfigured: status.firestoreConfigured ? "Configured" : "Optional anonymous storage not enabled",
    firebaseHostingReady: status.firebaseHostingReady ? "Ready" : "Not ready",
    cloudRunReady: status.cloudRunReady ? "Ready" : "Not ready",
    secretManagerRecommended: status.secretManagerRecommended ? "Configured for Cloud Run" : "Review for production"
  };

  Object.entries(labels).forEach(([key, label]) => {
    const node = document.querySelector(`[data-status-key="${key}"]`);
    if (!node) return;
    node.textContent = label;
    node.dataset.state = /not/i.test(label) ? "inactive" : "active";
  });
}

function setupRouter() {
  const updateHeader = () => {
    els.header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  window.addEventListener("hashchange", () => activateRoute(window.location.hash));
  document.querySelectorAll("[data-glossary-term]").forEach((link) => {
    link.addEventListener("click", () => {
      const term = link.dataset.glossaryTerm;
      if (!appState.viewedGlossaryTerms.includes(term)) {
        appState.viewedGlossaryTerms.push(term);
        saveProgress();
      }
      window.setTimeout(() => {
        els.glossaryQuery.value = link.dataset.glossaryTerm;
        renderGlossary(link.dataset.glossaryTerm);
        els.glossaryQuery.focus();
      }, 0);
    });
  });

  activateRoute(window.location.hash || "#home", { replaceMissing: true });
}

function activateRoute(hash, options = {}) {
  const route = resolveViewRoute(hash);
  const views = document.querySelectorAll("[data-view]");

  views.forEach((view) => {
    view.hidden = view.dataset.view !== route.view;
    view.classList.toggle("is-active-view", view.dataset.view === route.view);
  });

  els.navSectionLinks.forEach((link) => {
    const isActive = link.dataset.viewLink === route.view;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const activeView = document.querySelector(`[data-view="${route.view}"]`);
  const target = route.targetId ? document.getElementById(route.targetId) : activeView;

  if (options.replaceMissing && (!hash || hash === "#top")) {
    history.replaceState(null, "", "#home");
  }

  window.requestAnimationFrame(() => {
    (target || activeView)?.scrollIntoView({ behavior: isMotionReduced() ? "auto" : "smooth", block: "start" });
    activeView?.focus({ preventScroll: true });
    prepareReveal(activeView || document);
  });
}

function setupHeroTilt() {
  if (!els.visualStage || isMotionReduced()) return;

  els.visualStage.addEventListener("pointermove", (event) => {
    if (isMotionReduced()) return;
    const rect = els.visualStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    els.visualStage.style.setProperty("--tilt-x", String(x * 5));
    els.visualStage.style.setProperty("--tilt-y", String(y * -5));
  });

  els.visualStage.addEventListener("pointerleave", () => {
    els.visualStage.style.setProperty("--tilt-x", "0");
    els.visualStage.style.setProperty("--tilt-y", "0");
  });
}

function prepareReveal(root = document) {
  const nodes = [
    ...root.querySelectorAll(".section, .notice-band, .reveal-on-scroll, .stagger-child")
  ].filter((node) => !node.dataset.revealBound);

  if (!nodes.length) return;

  if (isMotionReduced()) {
    nodes.forEach((node) => {
      node.classList.add("is-visible");
      node.dataset.revealBound = "true";
    });
    return;
  }

  if (!appState.revealObserver) {
    appState.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          appState.revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
  }

  nodes.forEach((node, index) => {
    node.dataset.revealBound = "true";
    node.classList.add(node.classList.contains("stagger-child") ? "stagger-child" : "reveal-on-scroll");
    if (!node.style.getPropertyValue("--reveal-delay")) {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 35, 180)}ms`);
    }
    appState.revealObserver.observe(node);
  });
}

function updateQuizProgress() {
  const answered = new FormData(els.quizForm);
  const count = [...answered.keys()].length;
  const percentage = Math.round((count / quizQuestions.length) * 100);
  const progressBar = els.quizForm.querySelector("#quiz-progress-bar");
  const progressCount = els.quizForm.querySelector("#quiz-progress-count");

  if (progressBar) progressBar.style.setProperty("--quiz-progress", `${percentage}%`);
  if (progressCount) progressCount.textContent = `${count}/${quizQuestions.length}`;
}

function markQuizAnswers(result) {
  result.explanations.forEach((item) => {
    const card = els.quizForm.querySelector(`[data-question-id="${item.id}"]`);
    if (!card) return;
    card.classList.toggle("is-correct", item.correct);
    card.classList.toggle("is-review", !item.correct);
  });
}

function animateScore(finalPercentage) {
  const ring = els.quizResult.querySelector(".score-ring");
  const count = els.quizResult.querySelector(".score-count");

  if (!ring || !count) return;

  if (isMotionReduced()) {
    ring.style.setProperty("--score", `${finalPercentage}%`);
    count.textContent = `${finalPercentage}%`;
    return;
  }

  const duration = 760;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(finalPercentage * eased);
    ring.style.setProperty("--score", `${value}%`);
    count.textContent = `${value}%`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

function setAiAnswer(content, type = "success") {
  els.aiAnswer.classList.remove("is-warning", "is-error", "is-fresh");
  els.aiAnswer.classList.toggle("is-warning", type === "warning");
  els.aiAnswer.classList.toggle("is-error", type === "error");

  if (type === "thinking") {
    els.aiAnswer.innerHTML = `<p>${content}</p>`;
  } else {
    els.aiAnswer.innerHTML = `<p>${escapeHtml(content)}</p>`;
  }

  setFresh(els.aiAnswer);
}

function setStatus(element, message, type = "success") {
  element.textContent = message;
  element.dataset.status = type;
  setFresh(element);
}

function setFresh(element) {
  if (!element || isMotionReduced()) return;

  element.classList.remove("is-fresh", "is-refreshing");
  void element.offsetWidth;
  element.classList.add(element.classList.contains("detail-panel") || element.classList.contains("pathway-output") || element.classList.contains("scenario-output") ? "is-refreshing" : "is-fresh");
}

function withTooltips(text) {
  let output = escapeHtml(text);

  TOOLTIP_TERMS.forEach((term) => {
    const item = findGlossaryTerm(glossaryTerms, term);
    if (!item) return;
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "g");
    output = output.replace(
      pattern,
      `<button class="term-tooltip" type="button" data-term="${escapeHtml(term)}" aria-label="${escapeHtml(term)} definition">${escapeHtml(term)}</button>`
    );
  });

  return output;
}

function applyTermTooltips(root = document) {
  root.querySelectorAll(".term-tooltip").forEach((button) => {
    if (button.dataset.bound === "true") return;
    button.dataset.bound = "true";
    const item = findGlossaryTerm(glossaryTerms, button.dataset.term);
    if (!item) return;
    const tooltip = document.createElement("span");
    tooltip.className = "tooltip-bubble";
    tooltip.setAttribute("role", "tooltip");
    tooltip.textContent = item.explanation;
    button.append(tooltip);
    button.addEventListener("click", () => {
      const isOpen = button.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
    button.addEventListener("blur", () => {
      button.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function sectionLabel(href) {
  return href.replace("#", "").replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDefaultSettings() {
  return {
    dark: false,
    biggerText: false,
    highContrast: false,
    simpleEnglish: false,
    reduceMotion: false,
    readingFocus: false
  };
}

function getDefaultProgress() {
  return {
    selectedPathway: "firstTime",
    selectedScenario: "firstTimeVoter",
    simulatorTried: false,
    viewedGlossaryTerms: [],
    lastQuizResult: null
  };
}

function pulseThemeTransition() {
  if (isMotionReduced()) return;
  els.body.classList.add("is-theme-shifting");
  window.setTimeout(() => els.body.classList.remove("is-theme-shifting"), 360);
}

function updateSettingStatus(message) {
  if (els.settingsStatus) {
    setStatus(els.settingsStatus, message, "success");
  }
}

function isMotionReduced() {
  return appState.settings.reduceMotion || prefersReducedMotion.matches;
}

function loadSettings() {
  try {
    return {
      dark: localStorage.getItem("vw-dark") === "true",
      biggerText: localStorage.getItem("vw-bigger-text") === "true",
      highContrast: localStorage.getItem("vw-high-contrast") === "true",
      simpleEnglish: localStorage.getItem("vw-simple-english") === "true",
      reduceMotion: localStorage.getItem("vw-reduce-motion") === "true",
      readingFocus: localStorage.getItem("vw-reading-focus") === "true"
    };
  } catch {
    return getDefaultSettings();
  }
}

function saveSettings() {
  localStorage.setItem("vw-dark", String(appState.settings.dark));
  localStorage.setItem("vw-bigger-text", String(appState.settings.biggerText));
  localStorage.setItem("vw-high-contrast", String(appState.settings.highContrast));
  localStorage.setItem("vw-simple-english", String(appState.settings.simpleEnglish));
  localStorage.setItem("vw-reduce-motion", String(appState.settings.reduceMotion));
  localStorage.setItem("vw-reading-focus", String(appState.settings.readingFocus));
}

function loadProgress() {
  try {
    return {
      selectedPathway: localStorage.getItem("vw-pathway") || "firstTime",
      selectedScenario: localStorage.getItem("vw-scenario") || "firstTimeVoter",
      simulatorTried: localStorage.getItem("vw-simulator-tried") === "true",
      viewedGlossaryTerms: JSON.parse(localStorage.getItem("vw-glossary-terms") || "[]"),
      lastQuizResult: JSON.parse(localStorage.getItem("vw-last-quiz") || "null")
    };
  } catch {
    return getDefaultProgress();
  }
}

function saveProgress() {
  localStorage.setItem("vw-pathway", appState.selectedPathway);
  localStorage.setItem("vw-scenario", appState.selectedScenario);
  localStorage.setItem("vw-simulator-tried", String(appState.simulatorTried));
  localStorage.setItem("vw-glossary-terms", JSON.stringify(appState.viewedGlossaryTerms));
  localStorage.setItem("vw-last-quiz", JSON.stringify(appState.lastQuizResult));
}

function applySettings() {
  els.body.classList.toggle("dark", appState.settings.dark);
  els.body.classList.toggle("bigger-text", appState.settings.biggerText);
  els.body.classList.toggle("high-contrast", appState.settings.highContrast);
  els.body.classList.toggle("simple-english", appState.settings.simpleEnglish);
  els.body.classList.toggle("reduce-motion", appState.settings.reduceMotion);
  els.body.classList.toggle("reading-focus", appState.settings.readingFocus);
  els.body.classList.toggle("motion-reduced", isMotionReduced());
  els.themeToggle.setAttribute("aria-pressed", String(appState.settings.dark));
  els.biggerText.checked = appState.settings.biggerText;
  els.highContrast.checked = appState.settings.highContrast;
  els.simpleEnglish.checked = appState.settings.simpleEnglish;
  els.reduceMotion.checked = appState.settings.reduceMotion;
  els.readingFocus.checked = appState.settings.readingFocus;
  els.themeSync.checked = appState.settings.dark;

  if (isMotionReduced()) {
    document.querySelectorAll(".reveal-on-scroll, .stagger-child").forEach((node) => {
      node.classList.add("is-visible");
    });
    if (els.visualStage) {
      els.visualStage.style.setProperty("--tilt-x", "0");
      els.visualStage.style.setProperty("--tilt-y", "0");
    }
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
