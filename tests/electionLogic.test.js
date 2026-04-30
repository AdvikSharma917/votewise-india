import test from "node:test";
import assert from "node:assert/strict";
import { glossaryTerms, misinformationClaims, quizQuestions } from "../public/lib/electionData.js";
import {
  checkMisinformationAnswer,
  createVoteReadyCertificate,
  createVoteState,
  createAnonymousQuizResult,
  filterGlossaryTerms,
  getGeminiServiceMessage,
  getVoteReadyLabel,
  isPoliticalRecommendationQuestion,
  renderVvpatSlipHtml,
  resolveViewRoute,
  scoreQuiz,
  validateAnonymousQuizResult,
  validateQuestion
} from "../public/lib/electionLogic.js";

test("quiz scoring returns score, percentage, and explanations", () => {
  const answers = Object.fromEntries(quizQuestions.map((question) => [question.id, question.answer]));
  const result = scoreQuiz(quizQuestions, answers);

  assert.equal(result.score, 10);
  assert.equal(result.total, 10);
  assert.equal(result.percentage, 100);
  assert.equal(result.label, "Election Process Pro");
  assert.equal(result.explanations.length, 10);
});

test("VoteReady labels match score ranges", () => {
  assert.equal(getVoteReadyLabel(0), "Beginner");
  assert.equal(getVoteReadyLabel(4), "Beginner");
  assert.equal(getVoteReadyLabel(5), "Getting VoteReady");
  assert.equal(getVoteReadyLabel(7), "Getting VoteReady");
  assert.equal(getVoteReadyLabel(8), "Election Process Pro");
  assert.equal(getVoteReadyLabel(10), "Election Process Pro");
});

test("weak topic detection lists missed topics", () => {
  const answers = Object.fromEntries(quizQuestions.map((question) => [question.id, question.answer]));
  answers.q7 = 0;
  answers.q10 = 0;

  const result = scoreQuiz(quizQuestions, answers);

  assert.equal(result.score, 8);
  assert.deepEqual(result.weakTopics, ["AI Safety", "EVM/VVPAT"]);
  assert.ok(result.nextSteps.some((step) => step.includes("AI Safety")));
});

test("political recommendation questions are blocked before AI", () => {
  assert.equal(isPoliticalRecommendationQuestion("Can you tell me who to vote for?"), true);

  const validation = validateQuestion("Which candidate is best for students?");

  assert.equal(validation.ok, false);
  assert.equal(validation.blocked, true);
  assert.match(validation.reason, /can't recommend or oppose/i);
});

test("mock voting creates a VVPAT slip for the selected fictional option", () => {
  const vote = createVoteState("Candidate B");
  const html = renderVvpatSlipHtml(vote);

  assert.equal(vote.hasVoted, true);
  assert.equal(vote.slipVisible, true);
  assert.match(html, /data-testid="vvpat-slip"/);
  assert.match(html, /Candidate B/);
});

test("anonymous quiz result payload validates without personal identity", () => {
  const answers = Object.fromEntries(quizQuestions.map((question) => [question.id, question.answer]));
  const scored = scoreQuiz(quizQuestions, answers);
  const payload = createAnonymousQuizResult(scored);
  const validation = validateAnonymousQuizResult(payload);

  assert.equal(validation.ok, true);
  assert.equal(validation.result.score, 10);
  assert.equal(validation.result.label, "Election Process Pro");
  assert.equal(Object.hasOwn(validation.result, "name"), false);
  assert.equal(Object.hasOwn(validation.result, "email"), false);
});

test("glossary search filters terms by related simple language", () => {
  const results = filterGlossaryTerms(glossaryTerms, "paper slip");

  assert.ok(results.some((item) => item.term === "VVPAT"));
  assert.ok(!results.some((item) => item.term === "Lok Sabha"));
});

test("misinformation answer checker explains true and false claims", () => {
  const claim = misinformationClaims.find((item) => item.id === "vvpat-receipt");
  const result = checkMisinformationAnswer(claim, false);

  assert.equal(result.correct, true);
  assert.equal(result.expected, false);
  assert.match(result.explanation, /not a take-home receipt/i);
});

test("VoteReady certificate defaults learner name and preserves result", () => {
  const certificate = createVoteReadyCertificate(
    {
      score: 6,
      total: 10,
      percentage: 60,
      label: "Getting VoteReady",
      weakTopics: ["Electoral Roll"],
      nextSteps: ["Review Electoral Roll"]
    },
    ""
  );

  assert.equal(certificate.name, "Learner");
  assert.equal(certificate.label, "Getting VoteReady");
  assert.deepEqual(certificate.weakTopics, ["Electoral Roll"]);
});

test("hash routes resolve to app-style views and legacy sections", () => {
  assert.deepEqual(resolveViewRoute("#glossary"), { view: "glossary", targetId: "" });
  assert.deepEqual(resolveViewRoute("#timeline"), { view: "learn", targetId: "timeline" });
  assert.deepEqual(resolveViewRoute("#accessibility"), { view: "settings", targetId: "accessibility" });
  assert.deepEqual(resolveViewRoute("#unknown"), { view: "home", targetId: "" });
});

test("Gemini 503 or high demand message stays user-friendly and educational", () => {
  const message = getGeminiServiceMessage(503, "UNAVAILABLE: model is under high demand");

  assert.match(message, /Gemini is temporarily busy. Please try again in a minute./);
  assert.match(message, /journey, simulator, glossary, myth cards, and quiz/i);
});
