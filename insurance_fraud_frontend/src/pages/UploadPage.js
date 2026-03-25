import React, { useMemo, useState } from "react";
import Papa from "papaparse";
import { uploadCsv } from "../api/client";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileMeta = useMemo(() => {
    if (!file) return null;
    return { name: file.name, size: file.size, type: file.type || "text/csv" };
  }, [file]);

  return (
    <div className="grid">
      {error ? (
        <div className="alert alertError" style={{ gridColumn: "span 12" }} role="alert">
          {error}
        </div>
      ) : null}

      <div className="card" style={{ gridColumn: "span 12" }}>
        <div className="cardHeader">
          <h2>Upload claims CSV</h2>
          <span>POST /upload_csv</span>
        </div>

        <div className="grid" style={{ gap: 12 }}>
          <div style={{ gridColumn: "span 12" }}>
            <input
              className="input"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setError("");
                setResult(null);
                const f = e.target.files?.[0] || null;
                setFile(f);
                setPreview(null);

                if (f) {
                  Papa.parse(f, {
                    header: true,
                    skipEmptyLines: true,
                    preview: 6,
                    complete: (r) => setPreview({ rows: r.data || [], fields: r.meta?.fields || [] }),
                    error: (err) => setPreview({ error: err?.message || "Parse error" })
                  });
                }
              }}
            />

            {fileMeta ? (
              <div className="helpText" style={{ marginTop: 10 }}>
                Selected: <span className="mono">{fileMeta.name}</span> · {Math.round(fileMeta.size / 1024)} KB
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              <button
                className="btn btnPrimary"
                disabled={!file || busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  setResult(null);
                  try {
                    if (!file) throw new Error("Please select a CSV file.");
                    const res = await uploadCsv(file);
                    setResult(res);
                  } catch (e) {
                    setError(e?.message || "Upload failed.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Uploading…" : "Upload & Ingest"}
              </button>

              <button
                className="btn"
                disabled={busy}
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                  setError("");
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {result ? (
            <div className="alert" style={{ gridColumn: "span 12" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Ingest result</div>
              <pre className="mono" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card" style={{ gridColumn: "span 12" }}>
        <div className="cardHeader">
          <h2>Preview</h2>
          <span>First rows (client-side parse)</span>
        </div>

        {preview?.error ? (
          <div className="alert alertError">{preview.error}</div>
        ) : preview?.rows?.length ? (
          <table className="table" aria-label="CSV preview">
            <thead>
              <tr>
                {(preview.fields || Object.keys(preview.rows[0] || {})).slice(0, 4).map((f) => (
                  <th key={f}>{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  {(preview.fields || Object.keys(row || {})).slice(0, 4).map((f) => (
                    <td key={f} className="mono">
                      {String(row?.[f] ?? "—").slice(0, 26)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="helpText">Select a CSV file to see a quick preview.</div>
        )}

        <div className="helpText" style={{ marginTop: 12 }}>
          This preview is only for convenience. Backend ingestion determines final parsing and scoring.
        </div>
      </div>
    </div>
  );
}
