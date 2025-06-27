
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/ThemeProvider';
import Layout from './components/Layout';
import Index from './pages/Index';
import QiblaPage from './pages/QiblaPage';
import QuranPage from './pages/QuranPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import LanguageSettingsPage from './pages/LanguageSettingsPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import NotFound from './pages/NotFound';
import WelcomePage from './pages/WelcomePage';
import { Toaster } from "@/components/ui/toaster"

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="app-theme">
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="qibla" element={<QiblaPage />} />
                <Route path="quran" element={<QuranPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/language" element={<LanguageSettingsPage />} />
                <Route path="settings/about" element={<AboutPage />} />
                <Route path="settings/privacy" element={<PrivacyPolicyPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
