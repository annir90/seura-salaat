import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Moon, Sun, Monitor, User, MapPin } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  getSelectedLocation, 
  saveSelectedLocation, 
  getAvailableLocations, 
  Location
} from "@/services/locationService";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState<Location>(getSelectedLocation());
  const [calculationMethod, setCalculationMethod] = useState("ICF");
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Load settings on component mount
  useEffect(() => {
    setAvailableLocations(getAvailableLocations());
    
    // Load calculation method
    const savedMethod = localStorage.getItem('prayerapp-calculation-method');
    if (savedMethod) {
      setCalculationMethod(savedMethod);
    }
    
    // Load notifications setting
    const savedNotifications = localStorage.getItem('prayer-notifications-enabled');
    if (savedNotifications) {
      setNotifications(savedNotifications === 'true');
    }
    
    // Check user authentication status
    checkUserStatus();
    autoDetectLocation();
  }, []);

  // Check if user is signed in
  const checkUserStatus = () => {
    // Check for authentication tokens or user data
    const authToken = localStorage.getItem('auth-token');
    const userData = localStorage.getItem('user-data');
    
    if (authToken && userData) {
      try {
        const user = JSON.parse(userData);
        setUserEmail(user.email);
        setIsSignedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsSignedIn(false);
        setUserEmail(null);
      }
    } else {
      setIsSignedIn(false);
      setUserEmail(null);
    }
  };

  // Auto-detect user location
  const autoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Auto-detected location: ${latitude}, ${longitude}`);
          
          // Find closest available location or create custom one
          const closestLocation = findClosestLocation(latitude, longitude);
          
          if (closestLocation) {
            setLocation(closestLocation);
            saveSelectedLocation(closestLocation);
            toast.success(`Location set to ${closestLocation.name}`);
          } else {
            // Create custom location if no close match found
            const detectedLocation: Location = {
              id: "auto-detected",
              name: `Auto-detected (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
              latitude,
              longitude
            };
            
            setLocation(detectedLocation);
            saveSelectedLocation(detectedLocation);
            toast.success("Custom location auto-detected successfully");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not auto-detect location. Using default Espoo location.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  // Find closest available location
  const findClosestLocation = (lat: number, lng: number): Location | null => {
    let closestLocation: Location | null = null;
    let minDistance = Infinity;
    
    availableLocations.forEach(loc => {
      const distance = calculateDistance(lat, lng, loc.latitude, loc.longitude);
      if (distance < minDistance && distance < 50) { // Within 50km
        minDistance = distance;
        closestLocation = loc;
      }
    });
    
    return closestLocation;
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  
  const handleLocationChange = (locationId: string) => {
    const selectedLocation = availableLocations.find(l => l.id === locationId);
    if (selectedLocation) {
      setLocation(selectedLocation);
      saveSelectedLocation(selectedLocation);
      toast.success(`Location updated to ${selectedLocation.name}`);
    }
  };

  const handleCalculationMethodChange = (method: string) => {
    setCalculationMethod(method);
    localStorage.setItem('prayerapp-calculation-method', method);
    toast.success(`Calculation method updated to ${method}`);
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('prayer-notifications-enabled', enabled.toString());
    toast.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Settings</h1>
      
      <div className="space-y-6">
        {/* User Status */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">User Status</h2>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isSignedIn ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <User className={`h-5 w-5 ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
            <div>
              <p className="font-medium">
                {isSignedIn && userEmail ? userEmail : "Visitor"}
              </p>
              <p className={`text-sm ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                {isSignedIn ? "Signed in" : "Not signed in"}
              </p>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">Appearance</h2>
          <div className="space-y-3">
            <Label htmlFor="theme">Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as any)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                  <Monitor className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">Location Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-detect Location</Label>
                <p className="text-sm text-muted-foreground">Automatically detect your current location</p>
              </div>
              <button 
                onClick={autoDetectLocation}
                className="flex items-center gap-2 px-3 py-2 bg-prayer-primary text-white rounded-lg hover:bg-prayer-primary/90 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                Detect
              </button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Select Location</Label>
              <Select 
                value={location.id} 
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="calculation">Calculation Method</Label>
              <Select 
                value={calculationMethod}
                onValueChange={handleCalculationMethodChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select calculation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ICF">Islamic Center of Finland (Recommended)</SelectItem>
                  <SelectItem value="ISNA">ISNA (Islamic Society of North America)</SelectItem>
                  <SelectItem value="MWL">Muslim World League</SelectItem>
                  <SelectItem value="Egyptian">Egyptian General Authority</SelectItem>
                  <SelectItem value="Makkah">Umm al-Qura University, Makkah</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">Notification Settings</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-base">Prayer Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications before prayer times</p>
            </div>
            <Switch 
              id="notifications" 
              checked={notifications} 
              onCheckedChange={handleNotificationsChange}
            />
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>PrayConnect v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
