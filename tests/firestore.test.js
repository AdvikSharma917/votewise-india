import test from "node:test";
import assert from "node:assert/strict";
import { getFirestoreConfig, isFirestoreConfigured, toFirestoreFields } from "../src/firestore.js";

test("Firestore configuration is honest when disabled", () => {
  assert.equal(isFirestoreConfigured({}), false);
  assert.deepEqual(getFirestoreConfig({}), {
    projectId: "",
    collection: "quizResults",
    accessToken: ""
  });
});

test("quiz result converts to Firestore REST fields", () => {
  const fields = toFirestoreFields({
    score: 8,
    total: 10,
    percentage: 80,
    label: "Election Process Pro",
    weakTopics: ["EVM/VVPAT"],
    completedAt: "2026-04-29T00:00:00.000Z",
    userAgent: "test"
  });

  assert.equal(fields.score.integerValue, "8");
  assert.equal(fields.label.stringValue, "Election Process Pro");
  assert.equal(fields.weakTopics.arrayValue.values[0].stringValue, "EVM/VVPAT");
  assert.equal(fields.source.stringValue, "votewise-india");
});
