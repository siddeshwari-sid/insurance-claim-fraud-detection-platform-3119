import React, { useState } from "react";
import { uploadCsv } from "../lib/apiClient";
import { Button, Card, SecondaryButton } from "../components/ui/UI";

export default function UploadCsvPage() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please choose a CSV file.");
      return;
    }

    setBusy(true);
    try {
      const res = await uploadCsv(file);
      setResult(res);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card
        title="Upload Claims CSV"
        subtitle="Upload a CSV to ingest claims, apply rules, and generate risk scores."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-100">
              CSV File
            </label>
            <input
              className="mt-2 block w-full cursor-pointer rounded-md border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 file:mr-3 file:rounded-md file:border-0 file:bg-gray-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-100 hover:file:bg-gray-700"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
            />
            <p className="mt-2 text-xs text-gray-400">
              Tip: Include claim amount, claimant, policy, and incident metadata
              to improve signal coverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Uploading…" : "Upload & Ingest"}
            </Button>
            <SecondaryButton
              type="button"
              disabled={busy}
              onClick={() => {
                setFile(null);
                setResult(null);
                setError(null);
              }}
            >
              Clear
            </SecondaryButton>
          </div>

          {error && (
            <div className="rounded-md border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100">
              <div className="text-xs font-semibold text-gray-300">
                Upload result
              </div>
              <pre className="mt-2 overflow-x-auto text-xs text-gray-200">
{typeof result === "string" ? result : JSON.stringify(result, null, 2)}
              </pre>
              <div className="mt-2 text-xs text-gray-400">
                Navigate to Dashboard to review updated claims list.
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
