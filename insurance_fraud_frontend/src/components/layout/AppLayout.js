import React from "react";
import { NavLink } from "react-router-dom";

function BrandMark() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-glow-sm">
      <span className="text-sm font-black tracking-tight text-white">FD</span>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group relative block rounded-xl px-3 py-2 text-sm font-medium transition",
          "border border-transparent",
          isActive
            ? "border-white/10 bg-white/10 text-white shadow-glow-sm"
            : "text-white/70 hover:border-white/10 hover:bg-white/5 hover:text-white"
        ].join(" ")
      }
    >
      <span
        className={[
          "absolute inset-0 rounded-xl opacity-0 transition",
          "bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-400/10",
          isActive ? "opacity-100" : "group-hover:opacity-100"
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="relative">{label}</span>
    </NavLink>
  );
}

export default function AppLayout({ children }) {
  return (
    <div className="min-h-full text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-black/20 backdrop-blur md:flex">
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-wide text-white">
                  Fraud Detection
                </div>
                <div className="mt-0.5 text-xs text-white/60">
                  Claims & SIU Console
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-2">
            <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Navigation
            </div>
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/upload" label="Upload CSV" />
            <NavItem to="/queue" label="Investigator Queue" />
          </nav>

          <div className="border-t border-white/10 px-5 py-4 text-xs text-white/55">
            API: {process.env.REACT_APP_API_BASE || "http://localhost:3001"}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 md:hidden">
                <BrandMark />
                <div className="text-sm font-semibold">Fraud Detection</div>
              </div>

              <div className="ml-auto text-xs text-white/60">
                Finance-style dark UI • Prioritize high-risk claims
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
