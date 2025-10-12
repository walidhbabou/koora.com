import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
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
import Search from "./pages/Search";
import AdminDashboard from "./pages/AdminDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import ModeratorDashboard from "./pages/ModeratorDashboard";
import LoginPage from "./pages/LoginPage";
import RoleBasedRouter from "./components/RoleBasedRouter";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdTestPage from "./components/AdTestPage";
import SimpleAdTest from "./components/SimpleAdTest";

import DarkModeToggle from "./components/DarkModeToggle";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import BackToTopButton from "./components/BackToTopButton";

const queryClient = new QueryClient();

const App = () => {
  // Example: get language from localStorage or default to 'ar'
  const lang = localStorage.getItem("lang") || "ar";
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Helmet>
              <html lang={lang} />
              <title>
                {lang === "ar"
                  ? "كورة - مباريات كرة القدم، أخبار، انتقالات، نتائج مباشرة"
                  : "Koora - Football Matches, News, Transfers, Live Scores"}
              </title>
              <meta
                name="description"
                content={
                  lang === "ar"
                    ? "تابع آخر أخبار كرة القدم، مواعيد ونتائج المباريات، انتقالات اللاعبين، ترتيب الدوريات، كل شيء عن كرة القدم العربية والعالمية."
                    : "Follow the latest football news, match schedules, transfers, league standings, everything about Arab and world football."
                }
              />
              <meta
                name="keywords"
                content={
                  lang === "ar"
                    ? "كرة القدم, مباريات, نتائج مباشرة, انتقالات, ترتيب الدوريات, أخبار كرة القدم, الدوري المصري, دوري أبطال أفريقيا, الدوري الأوروبي, الدوري الإنجليزي, الدوري الإسباني"
                    : "football, matches, live scores, transfers, league standings, football news, Egyptian league, CAF Champions League, Europa League, Premier League, La Liga"
                }
              />
              <meta
                property="og:title"
                content={
                  lang === "ar"
                    ? "كورة - مباريات كرة القدم، أخبار، انتقالات، نتائج مباشرة"
                    : "Koora - Football Matches, News, Transfers, Live Scores"
                }
              />
              <meta
                property="og:description"
                content={
                  lang === "ar"
                    ? "تابع آخر أخبار كرة القدم، مواعيد ونتائج المباريات، انتقالات اللاعبين، ترتيب الدوريات، كل شيء عن كرة القدم العربية والعالمية."
                    : "Follow the latest football news, match schedules, transfers, league standings, everything about Arab and world football."
                }
              />
              <meta property="og:type" content="website" />
              <meta property="og:url" content="https://koora.com" />
              <meta property="og:image" content="/public/kooralogo.png" />
              <meta name="twitter:card" content="summary_large_image" />
              <meta
                name="twitter:title"
                content={
                  lang === "ar"
                    ? "كورة - مباريات كرة القدم، أخبار، انتقالات، نتائج مباشرة"
                    : "Koora - Football Matches, News, Transfers, Live Scores"
                }
              />
              <meta
                name="twitter:description"
                content={
                  lang === "ar"
                    ? "تابع آخر أخبار كرة القدم، مواعيد ونتائج المباريات، انتقالات اللاعبين، ترتيب الدوريات، كل شيء عن كرة القدم العربية والعالمية."
                    : "Follow the latest football news, match schedules, transfers, league standings, everything about Arab and world football."
                }
              />
              <meta name="twitter:image" content="/public/kooralogo.png" />
            </Helmet>
            {/* <DarkModeToggle /> */}
            <Toaster />
            <Sonner />
            <BackToTopButton />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/match/:id" element={<MatchDetailsPage />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/category/:category" element={<News />} />
                <Route path="/news/:slug" element={<NewsDetails />} />
                <Route path="/standings" element={<Standings />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/transfers" element={<Transfers />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/team/:teamId" element={<TeamDetails />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/ad-test" element={<AdTestPage />} />
                <Route path="/simple-ad-test" element={<SimpleAdTest />} />
                <Route path="/search" element={<Search />} />
                <Route path="/language-test" element={<LanguageTest />} />
                <Route path="/translation-demo" element={<TranslationDemo />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<RoleBasedRouter />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/editor"
                  element={
                    <ProtectedRoute requireEditor={true}>
                      <EditorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/author"
                  element={
                    <ProtectedRoute requireAuthor={true}>
                      <AuthorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/moderator"
                  element={
                    <ProtectedRoute requireModerator={true}>
                      <ModeratorDashboard />
                    </ProtectedRoute>
                  }
                />
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
};

export default App;
