import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listClaims } from "../lib/apiClient";
import { Badge, Card, Table } from "../components/ui/UI";
import { formatNumber, getClaimId } from "../lib/utils";

function riskColor(score) {
  const s = Number(score);
  if (Number.isNaN(s)) return "gray";
  if (s >= 80) return "red";
  if (s >= 50) return "amber";
  if (s >= 25) return "cyan";
  return "green";
}

export default function InvestigatorQueuePage() {
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
        if (mounted) setError(e.message || "Failed to load queue");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const queue = useMemo(() => {
    return [...claims]
      .map((c) => ({
        ...c,
        _risk: Number(c.risk_score ?? c.riskScore ?? c.score ?? 0)
      }))
      .filter((c) => c._risk >= 50)
      .sort((a, b) => b._risk - a._risk);
  }, [claims]);

  const columns = [
    {
      key: "claim",
      header: "Claim",
      render: (r) => {
        const id = getClaimId(r);
        return id ? (
          <Link
            to={`/claims/${encodeURIComponent(id)}`}
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            {String(id)}
          </Link>
        ) : (
          "-"
        );
      }
    },
    {
      key: "claimant",
      header: "Claimant",
      render: (r) => r.claimant_name ?? r.claimant ?? r.customer_name ?? "-"
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => `$${formatNumber(r.amount ?? r.claim_amount ?? r.total)}`
    },
    {
      key: "risk",
      header: "Risk",
      render: (r) => <Badge color={riskColor(r._risk)}>{formatNumber(r._risk)}</Badge>
    }
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Investigator Queue"
        subtitle="Claims with risk score ≥ 50, sorted by highest risk."
        right={
          loading ? (
            <span className="text-xs text-gray-400">Loading…</span>
          ) : (
            <span className="text-xs text-gray-400">
              {queue.length} queued
            </span>
          )
        }
      >
        {error && (
          <div className="mb-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        <Table columns={columns} rows={queue} rowKey={(r) => String(getClaimId(r) ?? Math.random())} />
      </Card>
    </div>
  );
}
