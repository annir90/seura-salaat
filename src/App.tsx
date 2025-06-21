import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import LanguageSettingsPage from "./pages/LanguageSettingsPage";
import AboutPage from "./pages/AboutPage";
import QuranPage from "./pages/QuranPage";
import WelcomePage from "./pages/WelcomePage";
import TasbihPage from "./pages/TasbihPage";
import Layout from "./components/Layout";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// Check if user is authenticated or is a visitor
const isAuthenticated = () => {
  const authToken = localStorage.getItem('auth-token');
  const visitorMode = localStorage.getItem('visitor-mode');
  return !!(authToken || visitorMode);
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/welcome" replace />;
};

const App = () => {
  const [appReady, setAppReady] = useState(false);

  // Small delay to ensure smooth redirects and show welcome by default
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return null; // Show nothing during initial load
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="prayer-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/tasbih" element={
                <ProtectedRoute>
                  <TasbihPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/language" element={
                <ProtectedRoute>
                  <LanguageSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/notifications" element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/about" element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Index />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              {/* All unmatched routes redirect to welcome page by default */}
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
