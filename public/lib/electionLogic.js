export const MAX_AI_QUESTION_LENGTH = 500;

const refusal =
  "I can explain the election process, but I can't recommend or oppose any party or candidate. I can help you understand how voting works, how to evaluate information, or what happens on polling day.";

const recommendationPatterns = [
  /\bwho\s+should\s+i\s+vote\b/i,
  /\bwho\s+to\s+vote\s+for\b/i,
  /\bwhich\s+(party|candidate)\s+(is|should|would|will|do)\b/i,
  /\bbest\s+(party|candidate)\b/i,
  /\brecommend\s+(a\s+)?(party|candidate)\b/i,
  /\bsupport\s+(party|candidate|bjp|congress|aap|dmk|tmc|nota)\b/i,
  /\boppose\s+(party|candidate|bjp|congress|aap|dmk|tmc)\b/i,
  /\bvote\s+for\s+(bjp|congress|aap|dmk|tmc|candidate)\b/i
];

const GEMINI_BUSY_MARKERS = ["unavailable", "high demand", "overloaded", "busy"];
const VIEW_ROUTES = new Set(["home", "learn", "simulator", "ai-guide", "glossary", "quiz", "teacher", "settings"]);
const LEGACY_SECTION_ROUTES = {
  top: "home",
  timeline: "learn",
  journey: "learn",
  pathway: "learn",
  scenarios: "learn",
  myths: "learn",
  misinformation: "learn",
  faq: "learn",
  accessibility: "settings"
};

export function sanitizeQuestion(input) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_AI_QUESTION_LENGTH);
}

export function isPoliticalRecommendationQuestion(input) {
  const question = sanitizeQuestion(input);
  return recommendationPatterns.some((pattern) => pattern.test(question));
}

export function getSafeRefusal() {
  return refusal;
}

export function getGeminiServiceMessage(status, detail = "") {
  const normalizedDetail = String(detail || "").toLowerCase();
  const isBusy = Number(status) === 503 || GEMINI_BUSY_MARKERS.some((marker) => normalizedDetail.includes(marker));

  if (isBusy) {
    return "Gemini is temporarily busy. Please try again in a minute. You can still use the journey, simulator, glossary, myth cards, and quiz while it catches up.";
  }

  return "I could not reach Gemini right now. You can still use the journey, simulator, glossary, myth cards, and quiz offline.";
}

export function validateQuestion(input) {
  const question = sanitizeQuestion(input);

  if (!question) {
    return { ok: false, reason: "Please enter a question about the election process." };
  }

  if (String(input ?? "").length > MAX_AI_QUESTION_LENGTH) {
    return {
      ok: false,
      reason: `Please keep questions under ${MAX_AI_QUESTION_LENGTH} characters.`
    };
  }

  if (isPoliticalRecommendationQuestion(question)) {
    return { ok: false, reason: refusal, blocked: true };
  }

  return { ok: true, question };
}

export function getVoteReadyLabel(score) {
  if (score <= 4) return "Beginner";
  if (score <= 7) return "Getting VoteReady";
  return "Election Process Pro";
}

export function scoreQuiz(questions, answers) {
  let score = 0;
  const explanations = [];
  const missedTopics = new Map();

  questions.forEach((question, index) => {
    const selected = Number(answers[question.id] ?? answers[index]);
    const correct = selected === question.answer;

    if (correct) {
      score += 1;
    } else {
      missedTopics.set(question.topic, (missedTopics.get(question.topic) ?? 0) + 1);
    }

    explanations.push({
      id: question.id,
      topic: question.topic,
      question: question.question,
      correct,
      selected,
      correctAnswer: question.options[question.answer],
      explanation: question.explanation
    });
  });

  const weakTopics = [...missedTopics.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([topic]) => topic);

  const total = questions.length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  return {
    score,
    total,
    percentage,
    label: getVoteReadyLabel(score),
    weakTopics,
    explanations,
    nextSteps: getRecommendedNextSteps(weakTopics)
  };
}

export function filterGlossaryTerms(terms, query) {
  const search = String(query ?? "").trim().toLowerCase();

  if (!search) return terms;

  return terms.filter((item) => {
    const haystack = [
      item.term,
      item.explanation,
      item.matters,
      item.example,
      ...(item.related || [])
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function findGlossaryTerm(terms, term) {
  const normalized = normalizeTerm(term);
  return terms.find((item) => normalizeTerm(item.term) === normalized);
}

export function checkMisinformationAnswer(claim, userAnswer) {
  const selected = Boolean(userAnswer);

  return {
    correct: selected === Boolean(claim.answer),
    expected: Boolean(claim.answer),
    explanation: claim.explanation
  };
}

export function createVoteReadyCertificate(result, learnerName = "Learner") {
  const name = String(learnerName || "Learner").trim().slice(0, 40) || "Learner";

  return {
    name,
    score: Number(result.score),
    total: Number(result.total),
    percentage: Number(result.percentage),
    label: String(result.label || getVoteReadyLabel(Number(result.score))),
    weakTopics: Array.isArray(result.weakTopics) ? result.weakTopics.map(String) : [],
    nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps.map(String) : []
  };
}

export function resolveViewRoute(hash) {
  const raw = String(hash || "#home").replace(/^#/, "") || "home";

  if (VIEW_ROUTES.has(raw)) {
    return { view: raw, targetId: "" };
  }

  if (LEGACY_SECTION_ROUTES[raw]) {
    return { view: LEGACY_SECTION_ROUTES[raw], targetId: raw };
  }

  return { view: "home", targetId: "" };
}

export function getRecommendedNextSteps(weakTopics) {
  if (!weakTopics.length) {
    return [
      "Try explaining the process to a friend or classmate.",
      "Use the mock voting simulator to reinforce the EVM/VVPAT flow.",
      "Ask the AI guide a process question you still find confusing."
    ];
  }

  return weakTopics.slice(0, 3).map((topic) => `Review the ${topic} section and retry related quiz questions.`);
}

export function createVoteState(option) {
  const selected = String(option ?? "").trim();
  const allowed = ["Candidate A", "Candidate B", "Candidate C", "NOTA"];

  if (!allowed.includes(selected)) {
    throw new Error("Invalid simulated voting option.");
  }

  return {
    hasVoted: true,
    selected,
    slipVisible: true,
    status: `Simulated vote recorded for ${selected}. VVPAT slip is visible for verification.`,
    timestamp: new Date().toISOString()
  };
}

export function resetVoteState() {
  return {
    hasVoted: false,
    selected: "",
    slipVisible: false,
    status: "Simulator reset. Choose a fictional option to begin.",
    timestamp: ""
  };
}

export function renderVvpatSlipHtml(voteState) {
  if (!voteState?.slipVisible || !voteState?.selected) {
    return '<span>VVPAT slip appears here after a mock vote.</span>';
  }

  return `
    <div class="vvpat-slip" data-testid="vvpat-slip">
      <span>Educational VVPAT Slip</span>
      <strong>${escapeHtml(voteState.selected)}</strong>
      <span>Visible briefly for verification</span>
    </div>
  `;
}

export function createAnonymousQuizResult(result) {
  return {
    score: Number(result.score),
    total: Number(result.total),
    percentage: Number(result.percentage),
    label: String(result.label || ""),
    weakTopics: Array.isArray(result.weakTopics) ? result.weakTopics.map(String).slice(0, 10) : [],
    completedAt: new Date().toISOString()
  };
}

export function validateAnonymousQuizResult(input) {
  const score = Number(input?.score);
  const total = Number(input?.total);
  const percentage = Number(input?.percentage);
  const label = String(input?.label || "");
  const weakTopics = Array.isArray(input?.weakTopics) ? input.weakTopics.map(String).slice(0, 10) : [];

  if (!Number.isInteger(score) || !Number.isInteger(total) || total < 1 || total > 50) {
    return { ok: false, reason: "Invalid quiz result." };
  }

  if (score < 0 || score > total) {
    return { ok: false, reason: "Invalid quiz score." };
  }

  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    return { ok: false, reason: "Invalid quiz percentage." };
  }

  if (!["Beginner", "Getting VoteReady", "Election Process Pro"].includes(label)) {
    return { ok: false, reason: "Invalid VoteReady label." };
  }

  return {
    ok: true,
    result: {
      score,
      total,
      percentage,
      label,
      weakTopics,
      userAgent: String(input?.userAgent || "").slice(0, 160),
      completedAt: String(input?.completedAt || new Date().toISOString()).slice(0, 40)
    }
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeTerm(term) {
  return String(term ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
