import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listClaims } from "../lib/apiClient";
import { formatNumber, getClaimId } from "../lib/utils";
import { Badge, Card, Table } from "../components/ui/UI";

function riskColor(score) {
  const s = Number(score);
  if (Number.isNaN(s)) return "gray";
  if (s >= 80) return "red";
  if (s >= 50) return "amber";
  if (s >= 25) return "cyan";
  return "green";
}

export default function DashboardPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listClaims();
        const arr = Array.isArray(data) ? data : data?.claims || [];
        if (mounted) setClaims(arr);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load claims");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = claims.length;
    const high = claims.filter((c) => Number(c.risk_score ?? c.riskScore) >= 80)
      .length;
    const med = claims.filter((c) => {
      const s = Number(c.risk_score ?? c.riskScore);
      return s >= 50 && s < 80;
    }).length;
    return { total, high, med };
  }, [claims]);

  const columns = [
    {
      key: "claimant",
      header: "Claimant",
      render: (r) => r.claimant_name ?? r.claimant ?? r.customer_name ?? "-"
    },
    {
      key: "policy",
      header: "Policy",
      render: (r) => r.policy_number ?? r.policyId ?? "-"
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => `$${formatNumber(r.amount ?? r.claim_amount ?? r.total)}` 
    },
    {
      key: "risk",
      header: "Risk Score",
      render: (r) => {
        const s = r.risk_score ?? r.riskScore ?? r.score;
        return <Badge color={riskColor(s)}>{formatNumber(s)}</Badge>;
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => {
        const id = getClaimId(r);
        return id ? (
          <Link
            to={`/claims/${encodeURIComponent(id)}`}
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            View
          </Link>
        ) : (
          <span className="text-xs text-gray-500">No ID</span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Total Claims" subtitle="Current dataset">
          <div className="text-2xl font-semibold">{formatNumber(summary.total)}</div>
          <div className="mt-1 text-xs text-gray-400">
            Upload additional CSVs to expand dataset.
          </div>
        </Card>
        <Card title="High Risk" subtitle="Risk score ≥ 80">
          <div className="text-2xl font-semibold text-red-200">
            {formatNumber(summary.high)}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Prioritize for SIU review.
          </div>
        </Card>
        <Card title="Medium Risk" subtitle="Risk score 50–79">
          <div className="text-2xl font-semibold text-amber-200">
            {formatNumber(summary.med)}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Validate supporting evidence.
          </div>
        </Card>
      </div>

      <Card
        title="Claims"
        subtitle="Sorted by risk score (highest first). Click View for details and explanation."
        right={
          loading ? (
            <span className="text-xs text-gray-400">Loading…</span>
          ) : null
        }
      >
        {error && (
          <div className="mb-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <Table
          columns={columns}
          rows={[...claims].sort((a, b) => {
            const as = Number(a.risk_score ?? a.riskScore ?? a.score ?? 0);
            const bs = Number(b.risk_score ?? b.riskScore ?? b.score ?? 0);
            return bs - as;
          })}
          rowKey={(r) => String(getClaimId(r) ?? Math.random())}
        />
      </Card>
    </div>
  );
}
