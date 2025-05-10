
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import BottomNavbar from "./BottomNavbar";
import { getSelectedLocation, Location } from "../services/locationService";
import { toast } from "@/components/ui/use-toast";

const Layout = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [calculationMethod, setCalculationMethod] = useState<string>("ISNA");
  const [dataSource, setDataSource] = useState<string>("Calculated");
  
  // Listen for location changes
  useEffect(() => {
    // Initial load
    setLocation(getSelectedLocation());
    
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
      } else if (e.key === 'prayerapp-calculation-method') {
        if (e.newValue) {
          setCalculationMethod(e.newValue);
        }
      } else if (e.key === 'prayerapp-data-source') {
        if (e.newValue) {
          setDataSource(e.newValue);
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
          <span className="text-xs ml-1 text-muted-foreground">
            ({calculationMethod === "ICF" ? "Islamic Center of Finland" : 
              calculationMethod === "ISNA" ? "ISNA" : 
              calculationMethod === "MWL" ? "Muslim World League" : 
              calculationMethod === "Egyptian" ? "Egyptian" : 
              calculationMethod === "Makkah" ? "Makkah" : "Standard"})
          </span>
        </div>
        <div className="text-center text-xs text-muted-foreground mb-2">
          <span className="text-xs font-medium">Data source: {dataSource === "Rabita" ? "Rabita.fi" : "Calculated"}</span>
        </div>
        <Outlet />
      </main>
      <BottomNavbar />
    </div>
  );
};

export default Layout;
