import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getClaim, getExplanation, listFraudSignals } from "../lib/apiClient";
import { Badge, Card, KeyValueRow, SecondaryButton } from "../components/ui/UI";
import { formatNumber, toIsoOrDash } from "../lib/utils";

function riskColor(score) {
  const s = Number(score);
  if (Number.isNaN(s)) return "gray";
  if (s >= 80) return "red";
  if (s >= 50) return "amber";
  if (s >= 25) return "cyan";
  return "green";
}

export default function ClaimDetailsPage() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [signals, setSignals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [c, e, s] = await Promise.allSettled([
        getClaim(claimId),
        getExplanation(claimId),
        listFraudSignals()
      ]);

      if (c.status === "fulfilled") setClaim(c.value);
      if (e.status === "fulfilled") setExplanation(e.value);
      if (s.status === "fulfilled") setSignals(s.value);

      if (c.status === "rejected") throw c.reason;
    } catch (err) {
      setError(err.message || "Failed to load claim details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId]);

  const risk = claim?.risk_score ?? claim?.riskScore ?? claim?.score;

  return (
    <div className="space-y-6">
      <Card
        title={`Claim ${claimId}`}
        subtitle="Review claim metadata, risk score, and explanation signals."
        right={
          <SecondaryButton onClick={load} disabled={loading}>
            Refresh
          </SecondaryButton>
        }
      >
        {error && (
          <div className="mb-3 rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading && !claim ? (
          <div className="text-sm text-gray-400">Loading…</div>
        ) : claim ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  Overview
                </div>
                <Badge color={riskColor(risk)}>
                  Risk {formatNumber(risk)}
                </Badge>
              </div>

              <div className="mt-3 divide-y divide-gray-800">
                <KeyValueRow
                  k="Claimant"
                  v={claim.claimant_name ?? claim.claimant ?? claim.customer_name}
                />
                <KeyValueRow
                  k="Policy #"
                  v={claim.policy_number ?? claim.policyId}
                />
                <KeyValueRow
                  k="Amount"
                  v={`$${formatNumber(claim.amount ?? claim.claim_amount ?? claim.total)}`}
                />
                <KeyValueRow k="Incident Date" v={toIsoOrDash(claim.incident_date ?? claim.incidentDate)} />
                <KeyValueRow k="Created" v={toIsoOrDash(claim.created_at ?? claim.createdAt)} />
              </div>
            </div>

            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <div className="text-sm font-semibold text-white">Explanation</div>
              <p className="mt-2 text-xs text-gray-400">
                Backend-generated explanation for why this claim was scored.
              </p>

              <div className="mt-3 rounded-md border border-gray-800 bg-gray-900 p-3">
                <pre className="whitespace-pre-wrap text-xs text-gray-100">
{explanation
  ? typeof explanation === "string"
    ? explanation
    : JSON.stringify(explanation, null, 2)
  : "No explanation available (endpoint may not be implemented yet)."}
                </pre>
              </div>
            </div>

            <div className="md:col-span-2 rounded-lg border border-gray-800 bg-gray-950 p-4">
              <div className="text-sm font-semibold text-white">Fraud Signals</div>
              <p className="mt-2 text-xs text-gray-400">
                The rules/signals catalog returned by <code>/fraud_signals</code>.
              </p>
              <div className="mt-3 rounded-md border border-gray-800 bg-gray-900 p-3">
                <pre className="whitespace-pre-wrap text-xs text-gray-100">
{signals
  ? typeof signals === "string"
    ? signals
    : JSON.stringify(signals, null, 2)
  : "No fraud signals returned."}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">No claim found.</div>
        )}
      </Card>
    </div>
  );
}
