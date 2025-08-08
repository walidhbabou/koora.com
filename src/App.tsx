import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import Matches from "./pages/Matches";
import News from "./pages/News";
import Standings from "./pages/Standings";
import Videos from "./pages/Videos";
import Transfers from "./pages/Transfers";
import LanguageTest from "./pages/LanguageTest";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/news" element={<News />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/language-test" element={<LanguageTest />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
