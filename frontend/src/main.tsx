import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider } from '@clerk/clerk-react'
import ErrorBoundary from './components/ErrorBoundary'

// Console log for debugging
console.log("Application starting...")

// Directly use the key from your .env.local file
// Try environment variable first, fall back to hardcoded value
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  "pk_test_YXdha2UtbGVtbWluZy0zOC5jbGVyay5hY2NvdW50cy5k";

console.log("Using Clerk key:", PUBLISHABLE_KEY ? "Key found" : "Key missing");

if (!PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key")
  document.body.innerHTML = '<div style="padding: 20px; color: white; background: black;">Error: Missing authentication key</div>'
} else {
  console.log("Clerk key found, initializing app...")
  
  // Wait for DOM to be fully ready
  document.addEventListener('DOMContentLoaded', () => {
    const rootElement = document.getElementById('root')
    
    if (!rootElement) {
      console.error("Root element not found")
      return
    }
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
            <App />
          </ClerkProvider>
        </ErrorBoundary>
      </React.StrictMode>,
    )
  })
}