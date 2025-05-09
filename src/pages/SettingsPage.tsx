
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState("New York, USA");
  const [calculationMethod, setCalculationMethod] = useState("ISNA");
  
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleDetectLocation = () => {
    // In a real app, this would use geolocation
    toast.info("Location detected");
    setLocation("New York, USA");
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
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleDetectLocation}
                  className="shrink-0"
                >
                  Detect
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="calculation">Calculation Method</Label>
              <select 
                id="calculation"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                value={calculationMethod}
                onChange={(e) => setCalculationMethod(e.target.value)}
              >
                <option value="ISNA">ISNA (Islamic Society of North America)</option>
                <option value="MWL">Muslim World League</option>
                <option value="Egyptian">Egyptian General Authority</option>
                <option value="Makkah">Umm al-Qura University, Makkah</option>
              </select>
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
