import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import Layout from './components/Layout';
import Index from './pages/Index';
import QiblaPage from './pages/QiblaPage';
import TasbihPage from './pages/TasbihPage';
import QuranPage from './pages/QuranPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import LanguageSettingsPage from './pages/LanguageSettingsPage';
import AboutPage from './pages/AboutPage';
import NotFound from './pages/NotFound';
import WelcomePage from './pages/WelcomePage';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from 'react-query';

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="qibla" element={<QiblaPage />} />
                <Route path="tasbih" element={<TasbihPage />} />
                <Route path="quran" element={<QuranPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/language" element={<LanguageSettingsPage />} />
                <Route path="settings/about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
