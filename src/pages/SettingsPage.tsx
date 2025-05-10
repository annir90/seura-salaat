
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MapPin, Save } from "lucide-react";
import { 
  getSelectedLocation, 
  saveSelectedLocation, 
  getAvailableLocations, 
  addCustomLocation,
  Location
} from "@/services/locationService";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState<Location>(getSelectedLocation());
  const [calculationMethod, setCalculationMethod] = useState("ISNA");
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  
  // For custom location dialog
  const [customLocationName, setCustomLocationName] = useState("");
  const [customLatitude, setCustomLatitude] = useState("");
  const [customLongitude, setCustomLongitude] = useState("");
  
  // Load available locations
  useEffect(() => {
    setAvailableLocations(getAvailableLocations());
  }, []);
  
  const handleSave = () => {
    saveSelectedLocation(location);
    
    // Save calculation method to localStorage
    localStorage.setItem('prayerapp-calculation-method', calculationMethod);
    
    toast.success("Settings saved successfully");
  };
  
  // Load calculation method from localStorage
  useEffect(() => {
    const savedMethod = localStorage.getItem('prayerapp-calculation-method');
    if (savedMethod) {
      setCalculationMethod(savedMethod);
    }
  }, []);
  
  const handleAddCustomLocation = () => {
    try {
      const lat = parseFloat(customLatitude);
      const lng = parseFloat(customLongitude);
      
      if (isNaN(lat) || isNaN(lng) || !customLocationName) {
        toast.error("Please enter valid location details");
        return;
      }
      
      if (lat < -90 || lat > 90) {
        toast.error("Latitude must be between -90 and 90");
        return;
      }
      
      if (lng < -180 || lng > 180) {
        toast.error("Longitude must be between -180 and 180");
        return;
      }
      
      const newLocation = addCustomLocation(customLocationName, lat, lng);
      setAvailableLocations([...availableLocations, newLocation]);
      setLocation(newLocation);
      saveSelectedLocation(newLocation);
      
      // Reset form
      setCustomLocationName("");
      setCustomLatitude("");
      setCustomLongitude("");
      
      toast.success("Custom location added");
    } catch (error) {
      toast.error("Error adding custom location");
    }
  };
  
  const handleLocationChange = (locationId: string) => {
    const selectedLocation = availableLocations.find(l => l.id === locationId);
    if (selectedLocation) {
      setLocation(selectedLocation);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Location Settings</h2>
          
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="location">Your Location</Label>
              <div className="flex gap-2">
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
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="shrink-0">
                      <MapPin className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Custom Location</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Location Name</Label>
                        <Input
                          id="name"
                          value={customLocationName}
                          onChange={(e) => setCustomLocationName(e.target.value)}
                          placeholder="E.g., My City, Country"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="latitude">Latitude</Label>
                          <Input
                            id="latitude"
                            value={customLatitude}
                            onChange={(e) => setCustomLatitude(e.target.value)}
                            placeholder="E.g., 60.2055"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="longitude">Longitude</Label>
                          <Input
                            id="longitude"
                            value={customLongitude}
                            onChange={(e) => setCustomLongitude(e.target.value)}
                            placeholder="E.g., 24.6559"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddCustomLocation}>
                        <Save className="h-4 w-4 mr-2" />
                        Add Location
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">Currently Selected:</div>
              <div className="bg-gray-50 p-3 rounded-md">
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
                onValueChange={setCalculationMethod}
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
        
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="font-semibold text-lg mb-4">Notification Settings</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications" className="text-base">Prayer Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications before prayer times</p>
            </div>
            <Switch 
              id="notifications" 
              checked={notifications} 
              onCheckedChange={setNotifications} 
            />
          </div>
        </div>
        
        <Button 
          className="w-full bg-prayer-primary hover:bg-prayer-secondary"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
        
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>PrayConnect v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
