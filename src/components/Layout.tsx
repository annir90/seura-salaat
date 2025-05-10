
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import BottomNavbar from "./BottomNavbar";
import { getSelectedLocation, Location } from "../services/locationService";

const Layout = () => {
  const [location, setLocation] = useState<Location | null>(null);
  
  // Listen for location changes
  useEffect(() => {
    // Initial load
    setLocation(getSelectedLocation());
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'prayerapp-selected-location') {
        try {
          const newLocation = e.newValue ? JSON.parse(e.newValue) : null;
          if (newLocation) {
            setLocation(newLocation);
          }
        } catch (error) {
          console.error('Error parsing location from storage', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container max-w-md mx-auto px-4 pb-20 pt-6 relative">
        <div className="text-center text-xs text-muted-foreground mb-2">
          Prayer Times for {location?.name || "Espoo, Finland"}
        </div>
        <Outlet />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Layout;
