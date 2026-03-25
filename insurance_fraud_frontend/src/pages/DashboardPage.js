import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { getClaims } from "../api/client";

function normalizeClaims(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.claims)) return payload.claims;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function scoreOf(claim) {
  return (
    claim.fraud_score ??
    claim.score ??
    claim.risk_score ??
    claim.riskScore ??
    0
  );
}

function statusOf(claim) {
  return claim.status || claim.state || "NEW";
}

function amountOf(claim) {
  return claim.claim_amount ?? claim.amount ?? claim.total_amount ?? 0;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState("");

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
        setError(e?.message || "Failed to load claims.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = claims.length;
    const highRisk = claims.filter((c) => scoreOf(c) >= 70).length;
    const avgScore = total
      ? Math.round(claims.reduce((a, c) => a + Number(scoreOf(c) || 0), 0) / total)
      : 0;

    const totalAmount = claims.reduce((a, c) => a + Number(amountOf(c) || 0), 0);

    const byStatus = claims.reduce((acc, c) => {
      const s = statusOf(c);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.keys(byStatus)
      .sort()
      .map((k) => ({ name: k, value: byStatus[k] }));

    // buckets for score histogram
    const buckets = [
      { name: "0-29", from: 0, to: 29 },
      { name: "30-49", from: 30, to: 49 },
      { name: "50-69", from: 50, to: 69 },
      { name: "70-84", from: 70, to: 84 },
      { name: "85-100", from: 85, to: 100 }
    ];
    const bucketData = buckets.map((b) => ({
      name: b.name,
      count: claims.filter((c) => {
        const s = Number(scoreOf(c) || 0);
        return s >= b.from && s <= b.to;
      }).length
    }));

    const topRisk = [...claims]
      .sort((a, b) => Number(scoreOf(b) || 0) - Number(scoreOf(a) || 0))
      .slice(0, 8);

    return { total, highRisk, avgScore, totalAmount, statusData, bucketData, topRisk };
  }, [claims]);

  const pieColors = ["#3b82f6", "#06b6d4", "#f59e0b", "#a855f7", "#ef4444", "#22c55e"];

  return (
    <div className="grid">
      {error ? (
        <div className="alert alertError" style={{ gridColumn: "span 12" }} role="alert">
          {error}
        </div>
      ) : null}

      <div className="card" style={{ gridColumn: "span 4" }}>
        <div className="cardHeader">
          <h2>Total Claims</h2>
          <span className="badge">Live</span>
        </div>
        <div className="kpi">
          <div className="kpiValue">{loading ? "…" : stats.total}</div>
          <div className="kpiMeta">
            <span className="badge badgePrimary">Avg score: {loading ? "…" : stats.avgScore}</span>
            <span className="badge">High risk ≥ 70: {loading ? "…" : stats.highRisk}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ gridColumn: "span 4" }}>
        <div className="cardHeader">
          <h2>Exposure</h2>
          <span className="badge badgeSuccess">Sum amount</span>
        </div>
        <div className="kpi">
          <div className="kpiValue">
            {loading ? "…" : `$${Math.round(stats.totalAmount).toLocaleString()}`}
          </div>
          <div className="kpiMeta">
            <span className="badge">Rule engine prioritizes by score.</span>
          </div>
        </div>
      </div>



      <div className="card" style={{ gridColumn: "span 7" }}>
        <div className="cardHeader">
          <h2>Risk Score Distribution</h2>
          <span>Counts by bucket</span>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.bucketData}>
              <CartesianGrid stroke="rgba(148,163,184,0.14)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(249,250,251,0.65)" />
              <YAxis stroke="rgba(249,250,251,0.65)" />
              <Tooltip
                contentStyle={{ background: "rgba(2,6,23,0.9)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12 }}
              />
              <Bar dataKey="count" fill="rgba(59,130,246,0.85)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ gridColumn: "span 5" }}>
        <div className="cardHeader">
          <h2>Status Breakdown</h2>
          <span>Queue readiness</span>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ background: "rgba(2,6,23,0.9)", border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12 }}
              />
              <Pie data={stats.statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {stats.statusData.map((_, idx) => (
                  <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ gridColumn: "span 12" }}>
        <div className="cardHeader">
          <h2>Top Risk Claims</h2>
          <span>Click a claim to review details</span>
        </div>

        <table className="table" aria-label="Top risk claims">
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
            ) : stats.topRisk.length ? (
              stats.topRisk.map((c) => (
                <tr key={c.id || c.claim_id || JSON.stringify(c).slice(0, 24)}>
                  <td className="mono">{c.id || c.claim_id || "—"}</td>
                  <td className="mono">{c.policy_id || c.policyNumber || c.policy || "—"}</td>
                  <td>{c.claimant_name || c.claimant || c.insured_name || "—"}</td>
                  <td>${Number(amountOf(c) || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${Number(scoreOf(c)) >= 70 ? "badgeDanger" : "badgePrimary"}`}>
                      {Math.round(Number(scoreOf(c) || 0))}
                    </span>
                  </td>
                  <td><span className="badge">{statusOf(c)}</span></td>
                  <td style={{ width: 120 }}>
                    <Link className="btn btnPrimary" to={`/claims/${encodeURIComponent(c.id || c.claim_id || "")}`}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7}>No claims found. Upload a CSV to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
