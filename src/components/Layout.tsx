
import { useEffect, useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import BottomNavbar from "./BottomNavbar";
import { getSelectedLocation, Location } from "../services/locationService";
import { getCurrentLanguage } from "../services/translationService";

const Layout = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [calculationMethod, setCalculationMethod] = useState<string>("ISNA");
  const [dataSource, setDataSource] = useState<string>("Calculated");
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());
  
  // Memoize the storage change handler for better performance
  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === 'prayerapp-selected-location') {
      try {
        const newLocation = e.newValue ? JSON.parse(e.newValue) : null;
        if (newLocation) {
          setLocation(newLocation);
        }
      } catch (error) {
        console.error('Error parsing location from storage', error);
      }
    } else if (e.key === 'prayerapp-calculation-method') {
      if (e.newValue) {
        setCalculationMethod(e.newValue);
      }
    } else if (e.key === 'prayerapp-data-source') {
      if (e.newValue) {
        setDataSource(e.newValue);
      }
    } else if (e.key === 'app-language') {
      // Force re-render when language changes
      setCurrentLanguage(getCurrentLanguage());
      // Force a full page reload to ensure all components update with new language
      window.location.reload();
    }
  }, []);
  
  // Listen for location changes
  useEffect(() => {
    // Initial load
    setLocation(getSelectedLocation());
    setCurrentLanguage(getCurrentLanguage());
    
    // Get calculation method
    const savedMethod = localStorage.getItem('prayerapp-calculation-method');
    if (savedMethod) {
      setCalculationMethod(savedMethod);
    }

    // Listen for data source changes
    const storedDataSource = localStorage.getItem('prayerapp-data-source');
    if (storedDataSource) {
      setDataSource(storedDataSource);
    }
    
    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);
  
  return (
    <div className="flex flex-col min-h-screen bg-background" key={currentLanguage}>
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 pt-6 relative">
        <Outlet />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Layout;
