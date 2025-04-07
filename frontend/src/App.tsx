import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeroGeometric } from "@/components/ui/hero";
import { DocumentationPage } from "@/components/ui/documentation";
// import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Suspense } from "react";
import { ConnectLLMPage } from "@/components/ui/connectLLMs";

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030303]">
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

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
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
                <HeroGeometric />
              </ProtectedRoute>
            }
          />
          <Route path="/settings" element={<HeroGeometric />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
