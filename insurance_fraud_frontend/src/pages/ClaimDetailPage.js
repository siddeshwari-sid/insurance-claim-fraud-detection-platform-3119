import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClaimById, getExplanation, updateClaimStatus } from "../api/client";

function scoreOf(claim) {
  return claim?.fraud_score ?? claim?.score ?? claim?.risk_score ?? claim?.riskScore ?? 0;
}

function amountOf(claim) {
  return claim?.claim_amount ?? claim?.amount ?? claim?.total_amount ?? 0;
}

function signalListOf(claim) {
  return claim?.fraud_signals || claim?.signals || claim?.flags || [];
}

export default function ClaimDetailPage() {
  const { claimId } = useParams();

  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState("");

  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [c, ex] = await Promise.all([
          getClaimById(claimId),
          getExplanation(claimId).catch(() => null) // explanation endpoint may be optional
        ]);

        if (!mounted) return;
        const claimObj = c?.claim || c?.data || c;
        setClaim(claimObj);
        setExplanation(ex?.explanation || ex?.data || ex);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load claim.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (claimId) load();

    return () => {
      mounted = false;
    };
  }, [claimId]);

  const status = claim?.status || "NEW";
  const score = Number(scoreOf(claim) || 0);

  const statusBadgeClass = useMemo(() => {
    if (score >= 85) return "badgeDanger";
    if (score >= 70) return "badgePrimary";
    return "badgeSuccess";
  }, [score]);

  return (
    <div className="grid">
      {error ? (
        <div className="alert alertError" style={{ gridColumn: "span 12" }} role="alert">
          {error}
        </div>
      ) : null}

      <div className="card" style={{ gridColumn: "span 12" }}>
        <div className="cardHeader">
          <div>
            <h2>Claim <span className="mono">{claimId}</span></h2>
            <span>Rule-based scoring with supporting signals and explanation</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className={`badge ${statusBadgeClass}`}>Score: {loading ? "…" : Math.round(score)}</span>
            <span className="badge">Status: {status}</span>
            <Link className="btn" to="/queue">Back to Queue</Link>
          </div>
        </div>

        {loading ? (
          <div className="helpText">Loading claim details…</div>
        ) : claim ? (
          <div className="grid" style={{ gap: 12 }}>
            <div className="card" style={{ gridColumn: "span 4", boxShadow: "none" }}>
              <div className="cardHeader">
                <h2>Summary</h2>
                <span className="badge">Core fields</span>
              </div>
              <div className="helpText">Policy</div>
              <div className="mono" style={{ marginBottom: 10 }}>{claim.policy_id || claim.policyNumber || claim.policy || "—"}</div>
              <div className="helpText">Claimant</div>
              <div style={{ marginBottom: 10 }}>{claim.claimant_name || claim.claimant || claim.insured_name || "—"}</div>
              <div className="helpText">Amount</div>
              <div style={{ marginBottom: 10 }}>${Number(amountOf(claim) || 0).toLocaleString()}</div>
              <div className="helpText">Date of Loss</div>
              <div className="mono">{claim.date_of_loss || claim.loss_date || claim.date || "—"}</div>
            </div>

            <div className="card" style={{ gridColumn: "span 8", boxShadow: "none" }}>
              <div className="cardHeader">
                <h2>Signals</h2>
                <span>What triggered the score</span>
              </div>

              {Array.isArray(signalListOf(claim)) && signalListOf(claim).length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {signalListOf(claim).map((s, idx) => {
                    const label = typeof s === "string" ? s : s?.name || s?.code || JSON.stringify(s);
                    const severity = s?.severity || (score >= 70 ? "HIGH" : "MEDIUM");
                    const cls = severity === "HIGH" ? "badgeDanger" : severity === "MEDIUM" ? "badgePrimary" : "badgeSuccess";
                    return (
                      <span key={idx} className={`badge ${cls}`} title={typeof s === "string" ? s : JSON.stringify(s, null, 2)}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="helpText">No explicit signals provided by backend for this claim.</div>
              )}

              <div style={{ marginTop: 14 }}>
                <div className="helpText">Update status</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <select
                    className="select"
                    value={status}
                    disabled={statusBusy}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      setStatusBusy(true);
                      try {
                        const updated = await updateClaimStatus(claimId, newStatus);
                        const claimObj = updated?.claim || updated?.data || updated;
                        setClaim((prev) => ({ ...(prev || {}), ...(claimObj || {}), status: newStatus }));
                      } catch (err) {
                        setError(err?.message || "Failed to update status.");
                      } finally {
                        setStatusBusy(false);
                      }
                    }}
                  >
                    <option value="NEW">NEW</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="ESCALATED">ESCALATED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  <span className="helpText">{statusBusy ? "Saving…" : "Changes are persisted to backend."}</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ gridColumn: "span 12", boxShadow: "none" }}>
              <div className="cardHeader">
                <h2>Explanation</h2>
                <span>AI / rule narrative (if available)</span>
              </div>

              {explanation ? (
                <pre className="mono" style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                  {typeof explanation === "string" ? explanation : JSON.stringify(explanation, null, 2)}
                </pre>
              ) : (
                <div className="helpText">
                  No explanation returned. Ensure backend implements <span className="mono">GET /explanation/:claim_id</span>.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="helpText">Claim not found.</div>
        )}
      </div>
    </div>
  );
}
