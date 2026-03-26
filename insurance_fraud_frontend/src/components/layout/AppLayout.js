import React from "react";
import { NavLink } from "react-router-dom";

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "block rounded-md px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-gray-800 text-white"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppLayout({ children }) {
  return (
    <div className="min-h-full bg-gray-900 text-gray-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-gray-800 bg-gray-950 md:flex">
          <div className="px-4 py-4">
            <div className="text-sm font-semibold tracking-wide text-white">
              Fraud Detection
            </div>
            <div className="mt-1 text-xs text-gray-400">
              Claims & SIU Console
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            <NavItem to="/dashboard" label="Dashboard" />
            <NavItem to="/upload" label="Upload CSV" />
            <NavItem to="/queue" label="Investigator Queue" />
          </nav>

          <div className="border-t border-gray-800 px-4 py-3 text-xs text-gray-400">
            API: {process.env.REACT_APP_API_BASE || "http://localhost:3001"}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="md:hidden text-sm font-semibold">
                Fraud Detection
              </div>
              <div className="text-xs text-gray-400">
                Professional dark UI • Prioritize high-risk claims
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
