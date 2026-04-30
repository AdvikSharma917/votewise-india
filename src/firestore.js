const DEFAULT_COLLECTION = "quizResults";

export function getFirestoreConfig(env = process.env) {
  return {
    projectId: env.FIRESTORE_PROJECT_ID || env.GOOGLE_CLOUD_PROJECT || env.GCLOUD_PROJECT || "",
    collection: env.FIRESTORE_COLLECTION || DEFAULT_COLLECTION,
    accessToken: env.FIRESTORE_ACCESS_TOKEN || ""
  };
}

export function isFirestoreConfigured(env = process.env) {
  return Boolean(getFirestoreConfig(env).projectId);
}

export async function saveAnonymousQuizResult(result, env = process.env) {
  const config = getFirestoreConfig(env);

  if (!config.projectId) {
    return {
      stored: false,
      reason: "Firestore is not configured. Set FIRESTORE_PROJECT_ID or GOOGLE_CLOUD_PROJECT."
    };
  }

  const token = config.accessToken || (await getCloudRunAccessToken());

  if (!token) {
    return {
      stored: false,
      reason:
        "Firestore project is configured, but no Google access token is available. On Cloud Run, attach a service account with Firestore write access."
    };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    config.projectId
  )}/databases/(default)/documents/${encodeURIComponent(config.collection)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fields: toFirestoreFields(result)
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Firestore API error:", detail.slice(0, 500));
    return {
      stored: false,
      reason: "Firestore rejected the write. Check IAM permissions and Firestore database setup."
    };
  }

  const data = await response.json();
  return { stored: true, document: data.name };
}

export function toFirestoreFields(result) {
  return {
    score: { integerValue: String(result.score) },
    total: { integerValue: String(result.total) },
    percentage: { integerValue: String(result.percentage) },
    label: { stringValue: result.label },
    weakTopics: {
      arrayValue: {
        values: result.weakTopics.map((topic) => ({ stringValue: topic }))
      }
    },
    completedAt: { timestampValue: normalizeTimestamp(result.completedAt) },
    userAgent: { stringValue: result.userAgent || "" },
    source: { stringValue: "votewise-india" }
  };
}

async function getCloudRunAccessToken() {
  try {
    const response = await fetch(
      "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
      {
        headers: { "Metadata-Flavor": "Google" },
        signal: AbortSignal.timeout(1200)
      }
    );

    if (!response.ok) return "";

    const data = await response.json();
    return data.access_token || "";
  } catch {
    return "";
  }
}

function normalizeTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
