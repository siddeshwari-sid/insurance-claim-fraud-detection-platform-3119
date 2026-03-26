const DEFAULT_BASE = "http://localhost:3001";

function getBaseUrl() {
  return (
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    DEFAULT_BASE
  );
}

async function parseJsonOrText(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return await res.json();
  return await res.text();
}

async function request(path, options = {}) {
  const base = getBaseUrl().replace(/\/+$/, "");
  const url = `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const body = await parseJsonOrText(res).catch(() => null);
    const msg =
      (body && body.message) ||
      (typeof body === "string" ? body : null) ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return await parseJsonOrText(res);
}

// PUBLIC_INTERFACE
export async function listClaims() {
  /** List claims (GET /claims). */
  return await request("/claims", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getClaim(claimId) {
  /** Get a single claim (GET /claims/:id). */
  return await request(`/claims/${encodeURIComponent(claimId)}`, {
    method: "GET"
  });
}

// PUBLIC_INTERFACE
export async function listFraudSignals() {
  /** List available fraud signals/rules (GET /fraud_signals). */
  return await request("/fraud_signals", { method: "GET" });
}

// PUBLIC_INTERFACE
export async function getExplanation(claimId) {
  /** Get AI/rule explanation for a claim (GET /explanation/:claim_id). */
  return await request(`/explanation/${encodeURIComponent(claimId)}`, {
    method: "GET"
  });
}

// PUBLIC_INTERFACE
export async function uploadCsv(file) {
  /** Upload CSV file for ingest (POST /upload_csv). */
  const form = new FormData();
  // backend may look for `file`; also accept `csv` in some implementations
  form.append("file", file);
  form.append("csv", file);

  return await request("/upload_csv", {
    method: "POST",
    body: form
  });
}
