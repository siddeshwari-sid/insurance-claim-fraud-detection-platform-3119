import React from "react";
import { NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import DashboardPage from "./pages/DashboardPage";
import UploadPage from "./pages/UploadPage";
import QueuePage from "./pages/QueuePage";
import ClaimDetailPage from "./pages/ClaimDetailPage";
import LoginPage from "./pages/LoginPage";

function Sidebar() {
  const navClass = ({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark" aria-hidden="true" />
        <div className="brandTitle">
          <strong>Fraud Sentinel</strong>
          <span>Insurance Claims</span>
        </div>
      </div>

      <div className="navGroupLabel">Workspace</div>
      <NavLink to="/" className={navClass} end>
        <span aria-hidden="true">▦</span>
        <span>Dashboard</span>
      </NavLink>
      <NavLink to="/upload" className={navClass}>
        <span aria-hidden="true">⤒</span>
        <span>CSV Upload</span>
      </NavLink>
      <NavLink to="/queue" className={navClass}>
        <span aria-hidden="true">⚑</span>
        <span>Investigator Queue</span>
      </NavLink>

      <div className="navGroupLabel">Help</div>
      <a className="navItem" href={process.env.REACT_APP_BACKEND_URL || "#"} target="_blank" rel="noreferrer">
        <span aria-hidden="true">⎋</span>
        <span>Backend</span>
      </a>
    </aside>
  );
}

function Topbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const titleMap = {
    "/": { title: "Dashboard", subtitle: "Prioritize high-risk claims with rule-based scoring." },
    "/upload": { title: "CSV Upload", subtitle: "Ingest new claim data and refresh fraud scoring." },
    "/queue": { title: "Investigator Queue", subtitle: "Work the highest-risk cases first." }
  };

  const header = titleMap[location.pathname] || {
    title: "Claim",
    subtitle: "Review claim details, signals, and explanations."
  };

  return (
    <div className="topbar">
      <div className="pageTitle">
        <h1>{header.title}</h1>
        <p>{header.subtitle}</p>
      </div>

      <div className="actionsRow">
        <button className="btn" onClick={() => navigate("/upload")}>Upload</button>
        <button className="btn btnPrimary" onClick={() => navigate("/queue")}>Queue</button>
        {user ? (
          <button
            className="btn btnDanger"
            onClick={async () => {
              await signOut();
              navigate("/login");
            }}
            title={user.email || "Signed in"}
          >
            Sign out
          </button>
        ) : null}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Main app entry with routing and protected pages. */
  return (
    <div className="appShell">
      <Sidebar />
      <main className="main">
        <Topbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/upload"
            element={
              <RequireAuth>
                <UploadPage />
              </RequireAuth>
            }
          />
          <Route
            path="/queue"
            element={
              <RequireAuth>
                <QueuePage />
              </RequireAuth>
            }
          />
          <Route
            path="/claims/:claimId"
            element={
              <RequireAuth>
                <ClaimDetailPage />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
