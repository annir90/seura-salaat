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
import { Moon, Sun, User, MapPin, LogOut, Languages } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  getSelectedLocation, 
  saveSelectedLocation, 
  getAvailableLocations, 
  Location,
  addCustomLocation
} from "@/services/locationService";
import { 
  setLanguage, 
  getCurrentLanguage, 
  getTranslation, 
  LanguageCode 
} from "@/services/translationService";
import SocialShare from "@/components/SocialShare";
import { getPrayerTimes } from "@/services/prayerTimeService";

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
    
    // Setup prayer notifications if enabled
    if (savedNotifications === 'true') {
      setupPrayerNotifications();
    }
  }, []);

  // Setup prayer notifications with service worker for background execution
  const setupPrayerNotifications = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Request permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }
    }

    if (Notification.permission === 'granted') {
      try {
        // Register service worker for background notifications
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
        }

        // Schedule notifications for today's prayers
        const prayerTimes = await getPrayerTimes();
        const timingMinutes = parseInt(notificationTiming);
        
        // Clear existing timeouts
        if (window.prayerTimeouts) {
          window.prayerTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        window.prayerTimeouts = [];
        
        prayerTimes.forEach(prayer => {
          if (prayer.time && prayer.time !== "00:00") {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerDate = new Date();
            prayerDate.setHours(hours, minutes - timingMinutes, 0, 0);
            
            const now = new Date();
            if (prayerDate > now) {
              const timeUntilNotification = prayerDate.getTime() - now.getTime();
              
              // Store timeout reference for cleanup
              const timeoutId = setTimeout(async () => {
                // Check if notifications are still enabled for this prayer
                const prayerEnabled = localStorage.getItem(`prayer-notification-${prayer.id}`) !== 'false';
                if (prayerEnabled && notifications) {
                  // Show notification
                  new Notification(`${prayer.name} Prayer Reminder`, {
                    body: `${prayer.name} prayer is in ${timingMinutes} minutes at ${prayer.time}`,
                    icon: '/favicon.ico',
                    tag: `prayer-${prayer.id}`,
                    requireInteraction: true
                  });

                  // Play adhan sound if selected
                  const selectedSound = localStorage.getItem(`prayer_adhan_${prayer.id}`);
                  if (selectedSound && selectedSound !== 'none') {
                    try {
                      const audio = new Audio(`/audio/${selectedSound}.mp3`);
                      audio.volume = 0.7;
                      await audio.play();
                    } catch (error) {
                      console.error('Error playing adhan sound:', error);
                    }
                  }
                }
              }, timeUntilNotification);
              
              window.prayerTimeouts.push(timeoutId);
            }
          }
        });
      } catch (error) {
        console.error('Error setting up notifications:', error);
        toast.error('Failed to setup prayer notifications');
      }
    }
  };

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

  // Enhanced auto-detect user location with reverse geocoding
  const autoDetectLocation = () => {
    if (navigator.geolocation) {
      toast.info("Detecting your location...");
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`Auto-detected coordinates: ${latitude}, ${longitude}`);
          
          try {
            // Try to get location name using reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              const cityName = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
              const countryName = data.countryName || '';
              
              // Create a more descriptive location name
              const locationName = countryName ? `${cityName}, ${countryName}` : cityName;
              
              // Check if we have a close match in available locations first
              const closestLocation = findClosestLocation(latitude, longitude);
              
              if (closestLocation && calculateDistance(latitude, longitude, closestLocation.latitude, closestLocation.longitude) < 25) {
                // Use the predefined location if it's within 25km
                setLocation(closestLocation);
                saveSelectedLocation(closestLocation);
                toast.success(`Location set to ${closestLocation.name}`);
              } else {
                // Create a custom location with the detected name
                const detectedLocation = addCustomLocation(locationName, latitude, longitude);
                setLocation(detectedLocation);
                saveSelectedLocation(detectedLocation);
                toast.success(`Custom location detected: ${locationName}`);
              }
            } else {
              // Fallback to coordinates if reverse geocoding fails
              const detectedLocation = addCustomLocation(
                `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
                latitude,
                longitude
              );
              setLocation(detectedLocation);
              saveSelectedLocation(detectedLocation);
              toast.success("Location detected successfully");
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            // Fallback to coordinate-based location
            const detectedLocation = addCustomLocation(
              `Auto-detected (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
              latitude,
              longitude
            );
            setLocation(detectedLocation);
            saveSelectedLocation(detectedLocation);
            toast.success("Location detected (coordinates)");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Could not detect location. ";
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Location access was denied.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }
          
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
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
    
    if (enabled) {
      setupPrayerNotifications();
      toast.success('Prayer notifications enabled');
    } else {
      // Clear existing timeouts
      if (window.prayerTimeouts) {
        window.prayerTimeouts.forEach(timeout => clearTimeout(timeout));
        window.prayerTimeouts = [];
      }
      toast.success('Prayer notifications disabled');
    }
  };

  const handleNotificationTimingChange = (timing: string) => {
    setNotificationTiming(timing);
    localStorage.setItem('prayer-notification-timing', timing);
    toast.success(`Notification timing set to ${timing} ${t.minutesBefore}`);
    
    if (notifications) {
      setupPrayerNotifications();
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    const newLanguage = languageCode as LanguageCode;
    setLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    toast.success(`Language updated to ${newLanguage === 'fi' ? 'Suomi' : 'English'}`);
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
  
  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t.settings}</h1>
      
      <div className="space-y-6">
        {/* User Status */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.userStatus}</h2>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full flex-shrink-0 ${isSignedIn ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <User className={`h-5 w-5 ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm break-words">
                  {isSignedIn && userEmail ? userEmail : (userEmail === t.visitor ? t.visitor : t.notSignedIn)}
                </p>
                <p className={`text-xs ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {isSignedIn ? t.signedIn : (userEmail === t.visitor ? t.visitorMode : t.notSignedIn)}
                </p>
              </div>
            </div>
            {(isSignedIn || userEmail === t.visitor) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
                {t.signOut}
              </Button>
            )}
          </div>
        </div>

        {/* Share App Section - Removed QR Code */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.shareApp}</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t.shareAppDesc}
            </p>
            
            <div className="flex flex-col gap-3">
              <SocialShare />
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4">{t.language}</h2>
          <div className="space-y-3">
            <Label htmlFor="language">{t.language}</Label>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-[9999] fixed">
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
                className="flex items-center gap-2 px-3 py-2 bg-prayer-primary text-white rounded-lg hover:bg-prayer-primary/90 transition-colors flex-shrink-0"
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-[9999] fixed">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-[9999] fixed">
                    <SelectItem value="5">5 {t.minutesBefore}</SelectItem>
                    <SelectItem value="10">10 {t.minutesBefore}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Seura Prayer v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
