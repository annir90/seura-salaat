
import { useState, useEffect } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { notificationService } from "@/services/notificationService";
import { getTranslation } from "@/services/translationService";

const NotificationSettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const t = getTranslation();

  useEffect(() => {
    // Load saved preferences
    const savedNotificationState = localStorage.getItem('prayer-notifications-enabled');
    
    if (savedNotificationState !== null) {
      setNotificationsEnabled(savedNotificationState === 'true');
    }
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    setIsLoading(true);
    console.log(`Toggling notifications: ${enabled}`);
    
    try {
      if (enabled) {
        console.log('Requesting notification permission...');
        const hasPermission = await notificationService.requestPermission();
        console.log('Permission result:', hasPermission);
        
        if (!hasPermission) {
          toast({
            title: "Permission Required",
            description: "Please allow notifications in your browser settings.",
            variant: "destructive",
          });
          setNotificationsEnabled(false);
          localStorage.setItem('prayer-notifications-enabled', 'false');
        } else {
          setNotificationsEnabled(true);
          localStorage.setItem('prayer-notifications-enabled', 'true');
          toast({
            title: "Notifications Enabled",
            description: "You'll receive prayer time reminders.",
          });
        }
      } else {
        setNotificationsEnabled(false);
        localStorage.setItem('prayer-notifications-enabled', 'false');
        notificationService.cancelAllNotifications();
        toast({
          title: "Notifications Disabled",
          description: "Prayer reminders have been turned off.",
        });
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/settings" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">{t.notificationSettings}</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-prayer-primary" />
                {t.prayerNotifications}
              </CardTitle>
              <CardDescription>
                {t.prayerNotificationsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable Notifications</span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
