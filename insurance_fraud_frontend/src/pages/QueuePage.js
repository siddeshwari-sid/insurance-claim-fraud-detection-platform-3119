import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getClaims } from "../api/client";

function normalizeClaims(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.claims)) return payload.claims;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function scoreOf(claim) {
  return claim.fraud_score ?? claim.score ?? claim.risk_score ?? claim.riskScore ?? 0;
}

function amountOf(claim) {
  return claim.claim_amount ?? claim.amount ?? claim.total_amount ?? 0;
}

export default function QueuePage() {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState("");

  const [minScore, setMinScore] = useState(70);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("score_desc"); // score_desc | amount_desc

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = await getClaims();
        if (!mounted) return;
        setClaims(normalizeClaims(payload));
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load investigator queue.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    const filtered = claims
      .filter((c) => Number(scoreOf(c) || 0) >= Number(minScore || 0))
      .filter((c) => (status ? String(c.status || "NEW") === status : true))
      .filter((c) => {
        if (!q) return true;
        const needle = q.toLowerCase();
        const hay = [
          c.id,
          c.claim_id,
          c.policy_id,
          c.policyNumber,
          c.claimant_name,
          c.claimant,
          c.insured_name
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(needle);
      });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "amount_desc") return Number(amountOf(b) || 0) - Number(amountOf(a) || 0);
      return Number(scoreOf(b) || 0) - Number(scoreOf(a) || 0);
    });

    return sorted;
  }, [claims, minScore, status, q, sort]);

  return (
    <div className="grid">
      {error ? (
        <div className="alert alertError" style={{ gridColumn: "span 12" }} role="alert">
          {error}
        </div>
      ) : null}

      <div className="card" style={{ gridColumn: "span 12" }}>
        <div className="cardHeader">
          <h2>Queue Filters</h2>
          <span>Prioritize your highest-risk workload</span>
        </div>

        <div className="formRow">
          <div>
            <div className="helpText">Min score</div>
            <input
              className="input"
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
            />
          </div>
          <div>
            <div className="helpText">Status</div>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Any</option>
              <option value="NEW">NEW</option>
              <option value="REVIEW">REVIEW</option>
              <option value="ESCALATED">ESCALATED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        <div className="formRow" style={{ marginTop: 10 }}>
          <div>
            <div className="helpText">Search</div>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Claim ID, policy ID, claimant…"
            />
          </div>
          <div>
            <div className="helpText">Sort</div>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="score_desc">Risk score (high → low)</option>
              <option value="amount_desc">Claim amount (high → low)</option>
            </select>
          </div>
        </div>

        <div className="helpText" style={{ marginTop: 10 }}>
          Showing <span className="mono">{loading ? "…" : rows.length}</span> claims.
        </div>
      </div>

      <div className="card" style={{ gridColumn: "span 12" }}>
        <div className="cardHeader">
          <h2>Claims</h2>
          <span>Review and escalate as needed</span>
        </div>

        <table className="table" aria-label="Investigator queue">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Policy</th>
              <th>Claimant</th>
              <th>Amount</th>
              <th>Score</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Loading…</td></tr>
            ) : rows.length ? (
              rows.map((c) => {
                const id = c.id || c.claim_id;
                return (
                  <tr key={id || JSON.stringify(c).slice(0, 24)}>
                    <td className="mono">{id || "—"}</td>
                    <td className="mono">{c.policy_id || c.policyNumber || c.policy || "—"}</td>
                    <td>{c.claimant_name || c.claimant || c.insured_name || "—"}</td>
                    <td>${Number(amountOf(c) || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${Number(scoreOf(c)) >= 70 ? "badgeDanger" : "badgePrimary"}`}>
                        {Math.round(Number(scoreOf(c) || 0))}
                      </span>
                    </td>
                    <td><span className="badge">{c.status || "NEW"}</span></td>
                    <td style={{ width: 120 }}>
                      {id ? (
                        <Link className="btn btnPrimary" to={`/claims/${encodeURIComponent(id)}`}>
                          Open
                        </Link>
                      ) : (
                        <span className="helpText">No ID</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={7}>No claims meet the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
