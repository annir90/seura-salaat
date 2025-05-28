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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Moon, Sun, User, MapPin, LogOut, Languages, Share2, QrCode } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  getSelectedLocation, 
  saveSelectedLocation, 
  getAvailableLocations, 
  Location
} from "@/services/locationService";
import { 
  setLanguage, 
  getCurrentLanguage, 
  getTranslation, 
  LanguageCode 
} from "@/services/translationService";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [notificationTiming, setNotificationTiming] = useState("5");
  const [location, setLocation] = useState<Location>(getSelectedLocation());
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
  const [showQRCode, setShowQRCode] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = getTranslation();
  
  // Load settings on component mount
  useEffect(() => {
    setAvailableLocations(getAvailableLocations());
    
    // Load notifications setting
    const savedNotifications = localStorage.getItem('prayer-notifications-enabled');
    if (savedNotifications) {
      setNotifications(savedNotifications === 'true');
    }
    
    // Load notification timing
    const savedTiming = localStorage.getItem('prayer-notification-timing');
    if (savedTiming) {
      setNotificationTiming(savedTiming);
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
    const visitorMode = localStorage.getItem('visitor-mode');
    
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
    } else if (visitorMode) {
      setIsSignedIn(false);
      setUserEmail(t.visitor);
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

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('prayer-notifications-enabled', enabled.toString());
    toast.success(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleNotificationTimingChange = (timing: string) => {
    setNotificationTiming(timing);
    localStorage.setItem('prayer-notification-timing', timing);
    toast.success(`Notification timing set to ${timing} ${t.minutesBefore}`);
  };

  const handleLanguageChange = (languageCode: string) => {
    const newLanguage = languageCode as LanguageCode;
    setLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    toast.success(`Language updated to ${newLanguage === 'fi' ? 'Suomi' : 'English'}`);
    // Force page refresh to apply translations
    setTimeout(() => window.location.reload(), 500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    localStorage.removeItem('visitor-mode');
    toast.success("Signed out successfully");
    window.location.href = "/welcome";
  };

  const shareAppUrl = "https://d7360491-a249-4f6e-9474-c67ad3a482a2.lovableproject.com";
  
  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PrayConnect - Prayer Times App',
          text: 'Check out this amazing prayer times app!',
          url: shareAppUrl,
        });
        toast.success("App shared successfully!");
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareAppUrl);
        toast.success("App link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };

  const generateQRCodeUrl = (text: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t.settings}</h1>
      
      <div className="space-y-6">
        {/* User Status */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.userStatus}</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isSignedIn ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <User className={`h-5 w-5 ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {isSignedIn && userEmail ? userEmail : (userEmail === t.visitor ? t.visitor : t.notSignedIn)}
                </p>
                <p className={`text-sm ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {isSignedIn ? t.signedIn : (userEmail === t.visitor ? t.visitorMode : t.notSignedIn)}
                </p>
              </div>
            </div>
            {(isSignedIn || userEmail === t.visitor) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2 ml-2 shrink-0"
              >
                <LogOut className="h-4 w-4" />
                {t.signOut}
              </Button>
            )}
          </div>
        </div>

        {/* Share App Section */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">Share the App</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Help others discover PrayConnect! Share this app with your friends and family.
            </p>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleShareApp}
                  className="flex items-center gap-2 bg-prayer-primary hover:bg-prayer-primary/90"
                >
                  <Share2 className="h-4 w-4" />
                  Share App
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
              </div>
              
              {showQRCode && (
                <div className="flex justify-center p-4 bg-muted/20 rounded-lg">
                  <img 
                    src={generateQRCodeUrl(shareAppUrl)}
                    alt="QR Code for PrayConnect App"
                    className="w-48 h-48"
                  />
                </div>
              )}
              
              <div className="text-xs text-muted-foreground break-all">
                {shareAppUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.language}</h2>
          <div className="space-y-3">
            <Label htmlFor="language">{t.language}</Label>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    English
                  </div>
                </SelectItem>
                <SelectItem value="fi">
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Suomi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.appearance}</h2>
          <div className="space-y-3">
            <Label htmlFor="theme">{t.theme}</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as any)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  {t.light}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  {t.dark}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.locationSettings}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{t.autoDetectLocation}</Label>
                <p className="text-sm text-muted-foreground">{t.autoDetectLocationDesc}</p>
              </div>
              <button 
                onClick={autoDetectLocation}
                className="flex items-center gap-2 px-3 py-2 bg-prayer-primary text-white rounded-lg hover:bg-prayer-primary/90 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                {t.detect}
              </button>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">{t.selectLocation}</Label>
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
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.notificationSettings}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base">{t.prayerNotifications}</Label>
                <p className="text-sm text-muted-foreground">{t.prayerNotificationsDesc}</p>
              </div>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={handleNotificationsChange}
              />
            </div>
            
            {notifications && (
              <div className="grid gap-2">
                <Label htmlFor="notification-timing">{t.notificationTiming}</Label>
                <Select 
                  value={notificationTiming} 
                  onValueChange={handleNotificationTimingChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {t.minutesBefore}</SelectItem>
                    <SelectItem value="10">10 {t.minutesBefore}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
