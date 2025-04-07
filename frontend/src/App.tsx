import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeroGeometric } from "@/components/ui/hero";
import { DocumentationPage } from "@/components/ui/documentation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroGeometric />} />
        <Route path="/docs/*" element={<DocumentationPage />} />
        <Route path="/connect" element={<HeroGeometric />} />
        <Route path="/chat" element={<HeroGeometric />} />
        <Route path="/settings" element={<HeroGeometric />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
