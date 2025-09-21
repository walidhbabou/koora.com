import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Matches from "./pages/Matches";
import MatchDetailsPage from "./pages/MatchDetailsPage";
import News from "./pages/News";
import NewsDetails from "./pages/NewsDetails";
import Standings from "./pages/Standings";
import Videos from "./pages/Videos";
import Transfers from "./pages/Transfers";
import LanguageTest from "./pages/LanguageTest";
import TranslationDemo from "./pages/TranslationDemo";
import TeamDetails from "./pages/TeamDetails";
import TestPage from "./pages/TestPage";
import AdminDashboard from "./pages/AdminDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import LoginPage from "./pages/LoginPage";
import RoleBasedRouter from "./components/RoleBasedRouter";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import DarkModeToggle from "./components/DarkModeToggle";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <DarkModeToggle />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/match/:id" element={<MatchDetailsPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetails />} />
              <Route path="/standings" element={<Standings />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/team/:teamId" element={<TeamDetails />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/language-test" element={<LanguageTest />} />
              <Route path="/translation-demo" element={<TranslationDemo />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<RoleBasedRouter />} />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/editor" element={
                <ProtectedRoute requireEditor={true}>
                  <EditorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/author" element={
                <ProtectedRoute requireAuthor={true}>
                  <AuthorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/moderator" element={
                <ProtectedRoute requireModerator={true}>
                  <ModeratorDashboard />
                </ProtectedRoute>
              } />
                <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/privacy" element={<Privacy />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
