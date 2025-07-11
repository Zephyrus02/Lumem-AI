import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { HeroGeometric } from "@/components/ui/hero";
import { DocumentationPage } from "@/components/ui/documentation";
import { ConnectLLMPage } from "@/components/ui/connectLLMs";
import { ChatPage } from "./components/ui/chat";
import { SettingsPage } from "./components/ui/settings";
import { ChatProvider } from "./contexts/ChatContext";
import { GetAuthToken } from "../wailsjs/go/main/App";

// Fallback component while loading auth or routes
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030303] overflow-hidden">
    <div className="text-white/60">Loading...</div>
  </div>
);

// ProtectedRoute checks if user is logged in via Wails backend
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await GetAuthToken();
        if (token) {
          setAuthorized(true);
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <LoadingFallback />;
  }

  return authorized ? <>{children}</> : null;
};

// Add a global layout wrapper to enforce overflow hidden
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden">{children}</div>
);

// Chat provider wrapper that has access to navigate
const ChatProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const handleNavigateToChat = () => {
    navigate("/chat");
  };

  return (
    <ChatProvider onNavigateToChat={handleNavigateToChat}>
      {children}
    </ChatProvider>
  );
};

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <ChatProviderWrapper>
          <PageWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HeroGeometric />} />
              <Route path="/docs" element={<DocumentationPage />} />

              {/* Protected Routes */}
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

              {/* Public/Optional Route */}
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </PageWrapper>
        </ChatProviderWrapper>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
