import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import UploadCsvPage from "./pages/UploadCsvPage";
import InvestigatorQueuePage from "./pages/InvestigatorQueuePage";
import ClaimDetailsPage from "./pages/ClaimDetailsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadCsvPage />} />
          <Route path="/queue" element={<InvestigatorQueuePage />} />
          <Route path="/claims/:claimId" element={<ClaimDetailsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
