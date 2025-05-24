
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
import { Moon, Sun, Monitor, User } from "lucide-react";
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
  const [calculationMethod, setCalculationMethod] = useState("ISNA");
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [userEmail] = useState<string | null>(null); // Will be connected to auth later
  const { theme, setTheme } = useTheme();
  
  // Load available locations
  useEffect(() => {
    setAvailableLocations(getAvailableLocations());
    autoDetectLocation();
  }, []);
  
  // Load calculation method from localStorage
  useEffect(() => {
    const savedMethod = localStorage.getItem('prayerapp-calculation-method');
    if (savedMethod) {
      setCalculationMethod(savedMethod);
    }
  }, []);

  // Auto-detect user location
  const autoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Auto-detected location: ${latitude}, ${longitude}`);
          
          // Find closest location or create a custom one
          const detectedLocation: Location = {
            id: "auto-detected",
            name: "Auto-detected Location",
            latitude,
            longitude
          };
          
          setLocation(detectedLocation);
          saveSelectedLocation(detectedLocation);
          toast.success("Location auto-detected successfully");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not auto-detect location. Using default.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };
  
  const handleLocationChange = (locationId: string) => {
    const selectedLocation = availableLocations.find(l => l.id === locationId);
    if (selectedLocation) {
      setLocation(selectedLocation);
      saveSelectedLocation(selectedLocation);
      toast.success("Location updated");
    }
  };

  const handleCalculationMethodChange = (method: string) => {
    setCalculationMethod(method);
    localStorage.setItem('prayerapp-calculation-method', method);
    toast.success("Calculation method updated");
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
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {userEmail ? userEmail : "Visitor"}
              </p>
              <p className="text-sm text-muted-foreground">
                {userEmail ? "Signed in" : "Not signed in"}
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
          
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="location">Your Location</Label>
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
            
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Currently Selected:</div>
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium">{location.name}</div>
                <div className="text-sm text-muted-foreground">
                  Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                </div>
              </div>
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
                  <SelectItem value="ISNA">ISNA (Islamic Society of North America)</SelectItem>
                  <SelectItem value="MWL">Muslim World League</SelectItem>
                  <SelectItem value="Egyptian">Egyptian General Authority</SelectItem>
                  <SelectItem value="Makkah">Umm al-Qura University, Makkah</SelectItem>
                  <SelectItem value="ICF">Islamic Center of Finland</SelectItem>
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
