import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeroGeometric } from "@/components/ui/hero";
import { DocumentationPage } from "@/components/ui/documentation";
import { Suspense } from "react";
import { ConnectLLMPage } from "@/components/ui/connectLLMs";
import { ChatPage } from "./components/ui/chat";
import { SettingsPage } from "./components/ui/settings";
import { ChatProvider } from "./contexts/ChatContext";
import { useNavigate } from "react-router-dom";

// Fallback component for loading states
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#030303] overflow-hidden">
    <div className="text-white/60">Loading...</div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

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
        </ChatProviderWrapper>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
