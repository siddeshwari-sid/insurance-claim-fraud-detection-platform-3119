const DEFAULT_TIMEOUT_MS = 30000;

function buildUrl(path) {
  const base =
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001";
  return `${base.replace(/\/+$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function safeReadJson(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  const text = await res.text();
  // Some backends return text error bodies; return both to help troubleshooting.
  return { _nonJsonBody: text };
}

async function request(path, { method = "GET", headers, body, timeoutMs } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: "application/json",
        ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(headers || {})
      },
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
      signal: controller.signal
    });

    const data = await safeReadJson(res);
    if (!res.ok) {
      const message =
        data?.message ||
        data?.error ||
        data?._nonJsonBody ||
        `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

// PUBLIC_INTERFACE
export async function getClaims({ status, minScore, q } = {}) {
  /** Fetch claims list with optional filters. */
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (minScore !== undefined && minScore !== null && minScore !== "") params.set("minScore", String(minScore));
  if (q) params.set("q", q);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/claims${query}`);
}

// PUBLIC_INTERFACE
export async function getClaimById(claimId) {
  /** Fetch a single claim by ID. */
  return request(`/claims/${encodeURIComponent(claimId)}`);
}

// PUBLIC_INTERFACE
export async function updateClaimStatus(claimId, status) {
  /** Update claim status (e.g., NEW, REVIEW, ESCALATED, CLOSED). */
  return request(`/claims/${encodeURIComponent(claimId)}`, { method: "PATCH", body: { status } });
}



// PUBLIC_INTERFACE
export async function uploadCsv(file) {
  /** Upload a CSV file to ingest claims. Expects backend at POST /upload_csv. */
  const form = new FormData();
  form.append("file", file);
  return request(`/upload_csv`, { method: "POST", body: form });
}
