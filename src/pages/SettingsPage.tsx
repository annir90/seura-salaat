
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  ChevronRight,
  Globe,
  Bell,
  Info,
  LogOut,
  User,
  Languages
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
  const { theme } = useTheme();
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

  const handleNotificationsNavigation = () => {
    navigate('/settings/notifications');
  };

  const handleAboutNavigation = () => {
    navigate('/settings/about');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
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

          {/* Notifications */}
          <Card 
            className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleNotificationsNavigation}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                    <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{t.notifications}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.blockAllowPriorities}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>

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
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-8 pb-2">
          <p className="font-medium">{t.appVersion}</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
