import React from "react";

export function Card({ title, subtitle, children, right }) {
  return (
    <section className="rounded-lg border border-gray-800 bg-gray-900 shadow-sm">
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between gap-4 border-b border-gray-800 px-4 py-3">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

export function Button({ children, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white",
        "hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, type = "button", disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-100",
        "hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Badge({ color = "gray", children }) {
  const styles = {
    gray: "bg-gray-800 text-gray-200 border-gray-700",
    red: "bg-red-950/50 text-red-200 border-red-900",
    amber: "bg-amber-950/40 text-amber-200 border-amber-900",
    cyan: "bg-cyan-950/40 text-cyan-200 border-cyan-900",
    green: "bg-emerald-950/40 text-emerald-200 border-emerald-900",
    blue: "bg-blue-950/40 text-blue-200 border-blue-900"
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[color] || styles.gray
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function KeyValueRow({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-xs text-gray-400">{k}</div>
      <div className="text-sm text-gray-100">{v ?? "-"}</div>
    </div>
  );
}

export function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="min-w-full divide-y divide-gray-800 bg-gray-950">
        <thead className="bg-gray-900">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {rows.map((r) => (
            <tr key={rowKey(r)} className="hover:bg-gray-900/60">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-sm text-gray-100">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-gray-400"
              >
                No results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
