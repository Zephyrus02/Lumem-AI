import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeroGeometric } from "@/components/ui/hero";
import { DocumentationPage } from "@/components/ui/documentation";
// import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Suspense } from "react";
import { ConnectLLMPage } from "@/components/ui/connectLLMs";
import { ChatPage } from "./components/ui/chat";
import { SettingsPage } from "./components/ui/settings";

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030303] overflow-hidden">
    <div className="text-white/60">Loading...</div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <>
    {/* <SignedIn>{children}</SignedIn> */}
    {/* <SignedOut> */}
      {/* <RedirectToSignIn /> */}
    {/* </SignedOut> */}
    {children}
  </>
);

// Add a global layout wrapper to enforce overflow hidden
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden">
    {children}
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <PageWrapper>
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<HeroGeometric />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route
              path="/connect"
              element={
                <ProtectedRoute>
                  <ConnectLLMPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </PageWrapper>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
