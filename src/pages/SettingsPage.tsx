
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
import { Moon, Sun, User, MapPin, LogOut, Languages, Bell, BellRing, Share2 } from "lucide-react";
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

  // Enhanced auto-detect user location with improved accuracy for Finland
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
              
              // Check if we have a close match in available Finnish locations first
              const closestLocation = findClosestLocation(latitude, longitude);
              
              if (closestLocation && calculateDistance(latitude, longitude, closestLocation.latitude, closestLocation.longitude) < 15) {
                // Use the predefined location if it's within 15km for better accuracy
                setLocation(closestLocation);
                saveSelectedLocation(closestLocation);
                toast.success(`Location set to ${closestLocation.name}`);
              } else {
                // Create a custom location with the detected name
                const detectedLocation = addCustomLocation(cityName, latitude, longitude);
                setLocation(detectedLocation);
                saveSelectedLocation(detectedLocation);
                toast.success(`Custom location detected: ${cityName}`);
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
          timeout: 15000,
          maximumAge: 60000 // 1 minute
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

  // Enhanced native sharing functionality
  const handleShareApp = async () => {
    const shareData = {
      title: "Seura Prayer - Prayer Times App",
      text: "Check out this great app for prayer times and reminders:",
      url: "https://d7360491-a249-4f6e-9474-c67ad3a482a2.lovableproject.com"
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("App shared successfully!");
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Share failed:", error);
          toast.error("Failed to share app");
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        const shareText = `${shareData.text} ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success("App link copied to clipboard!");
      } catch (error) {
        toast.error("Failed to copy link");
      }
    }
  };
  
  return (
    <div className="w-full mx-auto px-4 sm:px-6 pb-24 max-w-xl">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t.settings}</h1>
      
      <div className="space-y-6">
        {/* User Status */}
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-5 border border-border">
          <h2 className="font-semibold text-xl mb-5">{t.userStatus}</h2>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-3 rounded-full flex-shrink-0 ${isSignedIn ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <User className={`h-5 w-5 ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-base break-words">
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
                className="flex items-center gap-2 flex-shrink-0 h-10"
              >
                <LogOut className="h-4 w-4" />
                {t.signOut}
              </Button>
            )}
          </div>
        </div>

        {/* Share App Section */}
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-5 border border-border">
          <h2 className="font-semibold text-xl mb-5">{t.shareApp}</h2>
          <div className="space-y-5">
            <p className="text-base text-muted-foreground">
              {t.shareAppDesc}
            </p>
            
            <Button 
              onClick={handleShareApp}
              className="bg-prayer-primary hover:bg-prayer-primary/90 flex items-center gap-2 text-base py-5 w-full"
            >
              <Share2 className="h-5 w-5" />
              {t.shareAppButton}
            </Button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-5 border border-border">
          <h2 className="font-semibold text-xl mb-5">{t.language}</h2>
          <div className="space-y-4">
            <Label htmlFor="language" className="text-base">{t.language}</Label>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg">
                <SelectItem value="en">
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5" />
                    English
                  </div>
                </SelectItem>
                <SelectItem value="fi">
                  <div className="flex items-center gap-3">
                    <Languages className="h-5 w-5" />
                    Suomi
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-5 border border-border">
          <h2 className="font-semibold text-xl mb-5">{t.appearance}</h2>
          <div className="space-y-4">
            <Label htmlFor="theme" className="text-base">{t.theme}</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as any)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-3 cursor-pointer text-base">
                  <Sun className="h-5 w-5" />
                  {t.light}
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-3 cursor-pointer text-base">
                  <Moon className="h-5 w-5" />
                  {t.dark}
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Location Settings */}
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-5 border border-border">
          <h2 className="font-semibold text-xl mb-5">{t.locationSettings}</h2>
          
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base">{t.autoDetectLocation}</Label>
                <p className="text-sm text-muted-foreground mt-1">{t.autoDetectLocationDesc}</p>
              </div>
              <Button 
                onClick={autoDetectLocation}
                className="flex items-center gap-2 px-4 py-2 h-auto bg-prayer-primary text-white rounded-lg hover:bg-prayer-primary/90 transition-colors flex-shrink-0 w-full sm:w-auto"
              >
                <MapPin className="h-5 w-5" />
                {t.detect}
              </Button>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="location" className="text-base">{t.selectLocation}</Label>
              <Select 
                value={location.id} 
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg">
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
        
        {/* Prayer Notifications */}
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-5 border border-border">
          <h2 className="font-semibold text-xl mb-5">{t.notificationSettings}</h2>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-full flex-shrink-0 ${notifications ? 'bg-prayer-primary/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {notifications ? 
                    <BellRing className={`h-5 w-5 ${notifications ? 'text-prayer-primary' : 'text-gray-500'}`} /> :
                    <Bell className={`h-5 w-5 ${notifications ? 'text-prayer-primary' : 'text-gray-500'}`} />
                  }
                </div>
                <div className="flex-1">
                  <Label htmlFor="notifications" className="text-base">{t.prayerNotifications}</Label>
                  <p className="text-sm text-muted-foreground mt-1">{t.prayerNotificationsDesc}</p>
                </div>
              </div>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={handleNotificationsChange}
              />
            </div>
            
            {notifications && (
              <div className="grid gap-3 ml-10">
                <Label htmlFor="notification-timing" className="text-base">{t.notificationTiming}</Label>
                <Select 
                  value={notificationTiming} 
                  onValueChange={handleNotificationTimingChange}
                >
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg">
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
