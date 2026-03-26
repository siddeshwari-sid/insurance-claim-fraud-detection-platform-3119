import React from "react";

export function Card({ title, subtitle, children, right }) {
  return (
    <section className="ui-surface overflow-hidden">
      {(title || subtitle || right) && (
        <header className="ui-surface-header flex items-start justify-between gap-4 border-b px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-sm font-semibold text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-white/60">{subtitle}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </header>
      )}
      <div className="px-5 py-5">{children}</div>
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
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white",
        "bg-primary-gradient shadow-glow",
        "transition active:scale-[0.98] hover:brightness-110",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold",
        "border border-white/12 bg-white/5 text-white/90",
        "transition hover:bg-white/10 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-60"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Badge({ color = "gray", children }) {
  const styles = {
    gray: "border-white/10 bg-white/5 text-white/80",
    red: "border-red-400/20 bg-red-500/10 text-red-200",
    amber: "border-amber-300/20 bg-amber-400/10 text-amber-200",
    cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    green: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    blue: "border-blue-300/20 bg-blue-400/10 text-blue-100"
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
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
      <div className="text-xs text-white/55">{k}</div>
      <div className="text-sm text-white/90">{v ?? "-"}</div>
    </div>
  );
}

export function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-white/55"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((r) => (
            <tr key={rowKey(r)} className="transition hover:bg-white/5">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 text-sm text-white/90">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm text-white/55"
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
