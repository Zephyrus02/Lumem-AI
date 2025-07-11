import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import ErrorBoundary from "./components/ErrorBoundary";

// Console log for debugging
console.log("Application starting...");

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

console.log("Using Clerk key:", PUBLISHABLE_KEY ? "Key found" : "Key missing");

if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key");
  document.body.innerHTML =
    '<div style="padding: 20px; color: white; background: black;">Error: Missing authentication key</div>';
} else {
  console.log("Clerk key found, initializing app...");

  document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("Root element not found");
      return;
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <App />
          </ClerkProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  });
}
