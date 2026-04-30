import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  getGeminiServiceMessage,
  getSafeRefusal,
  sanitizeQuestion,
  validateAnonymousQuizResult,
  validateQuestion
} from "./public/lib/electionLogic.js";
import { isFirestoreConfigured, saveAnonymousQuizResult } from "./src/firestore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

loadDotEnv();

const port = Number(process.env.PORT || 3000);
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const requestLog = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  setSecurityHeaders(res);

  try {
    const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

    if (req.method === "POST" && pathname === "/api/guide") {
      await handleGuideRequest(req, res);
      return;
    }

    if (req.method === "POST" && pathname === "/api/quiz-results") {
      await handleQuizResultRequest(req, res);
      return;
    }

    if (req.method === "GET" && pathname === "/api/status") {
      handleStatusRequest(res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      await serveStatic(req, res);
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Something went wrong. Please try again." });
  }
});

server.listen(port, () => {
  console.log(`VoteWise India running at http://localhost:${port}`);
});

async function handleGuideRequest(req, res) {
  if (isRateLimited(req)) {
    sendJson(res, 429, {
      error: "Too many questions. Please wait a moment and try again."
    });
    return;
  }

  const body = await readJsonBody(req, 2048);
  const validation = validateQuestion(body.question);

  if (!validation.ok) {
    sendJson(res, validation.blocked ? 200 : 400, {
      answer: validation.reason,
      blocked: Boolean(validation.blocked)
    });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    sendJson(res, 503, {
      error: "Gemini is not configured yet. Add GEMINI_API_KEY to your environment.",
      answer:
        "Gemini is not connected yet. You can still ask process questions once GEMINI_API_KEY is set on the server."
    });
    return;
  }

  const answer = await askGemini(validation.question, apiKey);
  sendJson(res, 200, { answer });
}

function handleStatusRequest(res) {
  sendJson(res, 200, {
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    firestoreConfigured: isFirestoreConfigured(),
    firebaseHostingReady: existsSync(path.join(__dirname, "firebase.json")),
    cloudRunReady: existsSync(path.join(__dirname, "Dockerfile")),
    secretManagerRecommended: true
  });
}

async function handleQuizResultRequest(req, res) {
  if (isRateLimited(req)) {
    sendJson(res, 429, {
      stored: false,
      error: "Too many requests. Please wait a moment and try again."
    });
    return;
  }

  const body = await readJsonBody(req, 2048);
  const validation = validateAnonymousQuizResult(body);

  if (!validation.ok) {
    sendJson(res, 400, { stored: false, error: validation.reason });
    return;
  }

  const result = await saveAnonymousQuizResult(validation.result);
  sendJson(res, 200, result);
}

async function askGemini(question, apiKey) {
  const systemInstruction = [
    "You are VoteWise India's AI Election Guide.",
    "Explain the Indian election process for students and first-time voters.",
    "Be non-partisan, factual, concise, and beginner-friendly.",
    "Do not recommend, rank, support, or oppose any political party or candidate.",
    "Do not use real party names or real candidate names.",
    "If asked for political persuasion, refuse briefly and redirect to election process education.",
    "Clarify that VoteWise India is educational and not an official Election Commission website when relevant."
  ].join(" ");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: sanitizeQuestion(question) }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 420
        }
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    console.error("Gemini API error:", detail.slice(0, 500));
    return getGeminiServiceMessage(response.status, detail);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || getSafeRefusal();
}

async function serveStatic(req, res) {
  const requestedPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const safePath = path
    .normalize(decodeURIComponent(requestedPath))
    .replace(/^(\.\.[/\\])+/, "");
  const filePath =
    safePath === "/" ? path.join(publicDir, "index.html") : path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
    const fallback = path.join(publicDir, "index.html");
    res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    res.end(req.method === "HEAD" ? undefined : await readFile(fallback));
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  res.end(req.method === "HEAD" ? undefined : await readFile(filePath));
}

function readJsonBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > limitBytes) {
        reject(new Error("Request body too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });

    req.on("error", reject);
  });
}

function isRateLimited(req) {
  const key = req.socket.remoteAddress || "local";
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 20;
  const history = (requestLog.get(key) || []).filter((time) => now - time < windowMs);

  history.push(now);
  requestLog.set(key, history);

  return history.length > maxRequests;
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'"
  );
}

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");

  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
