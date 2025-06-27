import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ChevronRight,
  Globe,
  Info,
  LogOut,
  User,
  Moon,
  Sun,
  Heart
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  setLanguage, 
  getCurrentLanguage, 
  getTranslation, 
  LanguageCode 
} from "@/services/translationService";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = getTranslation();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = () => {
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

  const handleSignOut = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    localStorage.removeItem('visitor-mode');
    toast.success("Signed out successfully");
    window.location.href = "/welcome";
  };

  const handleLanguageNavigation = () => {
    navigate('/settings/language');
  };

  const handleAboutNavigation = () => {
    navigate('/settings/about');
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    toast.success(checked ? "Dark mode enabled" : "Light mode enabled");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-4">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t.settings}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t.manageAppPreferences}
          </p>
        </div>

        {/* User Profile Section */}
        <Card className="mb-6 shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {isSignedIn && userEmail ? userEmail : (userEmail === t.visitor ? t.visitor : t.notSignedIn)}
                </h3>
                <p className={`text-sm ${isSignedIn ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {isSignedIn ? t.signedIn : (userEmail === t.visitor ? t.visitorMode : t.notSignedIn)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Options */}
        <div className="space-y-3">
          {/* Theme Toggle */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Sun className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === "dark" ? "Dark theme enabled" : "Light theme enabled"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card 
            className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleLanguageNavigation}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t.general}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.languageSettings}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Support the Mosque */}
          <Dialog open={isDonateModalOpen} onOpenChange={setIsDonateModalOpen}>
            <DialogTrigger asChild>
              <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                        <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">Support the Mosque</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Help us serve the community</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  Support the Mosque
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your donations help us maintain the mosque and serve the Muslim community better.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank IBAN:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-white dark:bg-gray-700 p-2 rounded border flex-1">
                        FI70 8000 3710 0641 37
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard("FI70 8000 3710 0641 37")}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Receiver:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-white dark:bg-gray-700 p-2 rounded border flex-1">
                        Albaanien Islami Kulttuuri Keskus ry
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard("Albaanien Islami Kulttuuri Keskus ry")}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  May Allah reward your generosity
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* About */}
          <Card 
            className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleAboutNavigation}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    <Info className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t.about}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.knowAboutApp}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Log out */}
          {(isSignedIn || userEmail === t.visitor) && (
            <Card 
              className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
              onClick={handleSignOut}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-600 dark:text-red-400">{t.logOut}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t.logOutFromApp}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* App Version */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 pb-2">
          <p className="font-medium">Seurasalaat v 1.0</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
