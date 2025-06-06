
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
import QuranPage from "./pages/QuranPage";
import WelcomePage from "./pages/WelcomePage";
import Layout from "./components/Layout";
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

  // Small delay to ensure smooth redirects
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
              <Route path="/welcome" element={
                isAuthenticated() ? <Navigate to="/" replace /> : <WelcomePage />
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
              {/* Redirect all unmatched routes to welcome page if not authenticated */}
              <Route path="*" element={
                isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/welcome" replace />
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
