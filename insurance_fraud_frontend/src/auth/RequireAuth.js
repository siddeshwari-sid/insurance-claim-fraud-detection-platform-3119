import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export function RequireAuth({ children }) {
  /** Redirects to /login when user is not authenticated. */
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return (
      <div style={{ padding: 24, color: "var(--text)" }}>
        Loading session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
