/**
 * Best-effort number formatting with fallback.
 */
export function formatNumber(n, digits = 0) {
  const x = Number(n);
  if (Number.isNaN(x)) return "-";
  return x.toLocaleString(undefined, { maximumFractionDigits: digits });
}

/**
 * Attempt to normalize various claim identifiers from backend.
 */
export function getClaimId(claim) {
  return claim?.id ?? claim?.claim_id ?? claim?._id ?? claim?.claimId;
}

export function toIsoOrDash(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toISOString();
  } catch {
    return String(v);
  }
}
