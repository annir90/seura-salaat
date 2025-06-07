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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Moon, Sun, User, MapPin, LogOut, Languages, Bell, BellRing } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  getSelectedLocation, 
  saveSelectedLocation, 
  getAvailableLocations, 
  Location,
  autoDetectLocationSilently
} from "@/services/locationService";
import { 
  setLanguage, 
  getCurrentLanguage, 
  getTranslation, 
  LanguageCode 
} from "@/services/translationService";
import { getPrayerTimes } from "@/services/prayerTimeService";
import SocialShare from "@/components/SocialShare";

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
    
    // Auto-detect location silently
    autoDetectLocationSilently().then((detectedLocation) => {
      if (detectedLocation) {
        setLocation(detectedLocation);
      }
    });
    
    // Setup prayer notifications if enabled
    if (savedNotifications === 'true') {
      setupPrayerNotifications();
    }
  }, []);

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
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-prayer-primary to-secondary bg-clip-text text-transparent mb-2">
            {t.settings}
          </h1>
          <p className="text-muted-foreground">Customize your prayer experience</p>
        </div>
        
        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="border-2 border-prayer-primary/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className={`p-3 rounded-full ${isSignedIn ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <User className={`h-6 w-6 ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                {t.userStatus}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-lg mb-1">
                    {isSignedIn && userEmail ? userEmail : (userEmail === t.visitor ? t.visitor : t.notSignedIn)}
                  </p>
                  <p className={`text-sm ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {isSignedIn ? t.signedIn : (userEmail === t.visitor ? t.visitorMode : t.notSignedIn)}
                  </p>
                </div>
                {(isSignedIn || userEmail === t.visitor) && (
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.signOut}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Share App Card */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Languages className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                {t.shareApp}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Share PrayConnect with your friends and family
              </p>
              <SocialShare />
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <Languages className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                {t.language}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇺🇸</span>
                      English
                    </div>
                  </SelectItem>
                  <SelectItem value="fi">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇫🇮</span>
                      Suomi
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  {theme === 'dark' ? 
                    <Moon className="h-6 w-6 text-orange-600 dark:text-orange-400" /> :
                    <Sun className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  }
                </div>
                {t.appearance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as any)}
                className="flex gap-8"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer text-base">
                    <Sun className="h-5 w-5" />
                    {t.light}
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer text-base">
                    <Moon className="h-5 w-5" />
                    {t.dark}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Location Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                {t.locationSettings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">              
                <Label htmlFor="location" className="text-base">{t.selectLocation}</Label>
                <Select 
                  value={location.id} 
                  onValueChange={handleLocationChange}
                >
                  <SelectTrigger className="w-full h-12 text-base">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {loc.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Prayer Notifications */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className={`p-3 rounded-full ${notifications ? 'bg-prayer-primary/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {notifications ? 
                    <BellRing className={`h-6 w-6 ${notifications ? 'text-prayer-primary' : 'text-gray-500'}`} /> :
                    <Bell className={`h-6 w-6 ${notifications ? 'text-prayer-primary' : 'text-gray-500'}`} />
                  }
                </div>
                {t.notificationSettings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="notifications" className="text-base font-medium">{t.prayerNotifications}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{t.prayerNotificationsDesc}</p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notifications} 
                    onCheckedChange={handleNotificationsChange}
                  />
                </div>
                
                {notifications && (
                  <div className="space-y-4 pt-4 border-t">
                    <Label htmlFor="notification-timing" className="text-base">{t.notificationTiming}</Label>
                    <Select 
                      value={notificationTiming} 
                      onValueChange={handleNotificationTimingChange}
                    >
                      <SelectTrigger className="w-full h-12 text-base">
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
            </CardContent>
          </Card>
          
          {/* App Info */}
          <div className="text-center text-sm text-muted-foreground pt-6">
            <p className="font-medium">PrayConnect v1.0</p>
            <p>Made with ❤️ for the Muslim community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
