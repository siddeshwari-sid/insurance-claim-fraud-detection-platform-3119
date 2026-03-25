import { render, screen } from "@testing-library/react";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

test("renders sidebar navigation", () => {
  render(
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  );

  expect(screen.getByText(/Fraud Sentinel/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/CSV Upload/i)).toBeInTheDocument();
  expect(screen.getByText(/Investigator Queue/i)).toBeInTheDocument();
});
