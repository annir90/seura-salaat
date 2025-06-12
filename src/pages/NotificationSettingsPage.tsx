
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Bell, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTranslation } from "@/services/translationService";

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [notificationTiming, setNotificationTiming] = useState("5");
  const t = getTranslation();

  useEffect(() => {
    const savedNotifications = localStorage.getItem('prayer-notifications-enabled');
    if (savedNotifications) {
      setNotifications(savedNotifications === 'true');
    }
    
    const savedTiming = localStorage.getItem('prayer-notification-timing');
    if (savedTiming) {
      setNotificationTiming(savedTiming);
    }
  }, []);

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('prayer-notifications-enabled', enabled.toString());
    
    if (enabled) {
      toast.success('Prayer notifications enabled');
    } else {
      toast.success('Prayer notifications disabled');
    }
  };

  const handleNotificationTimingChange = (timing: string) => {
    setNotificationTiming(timing);
    localStorage.setItem('prayer-notification-timing', timing);
    toast.success(`Notification timing set to ${timing} ${t.minutesBefore}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your prayer notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  {notifications ? 
                    <BellRing className="h-5 w-5 text-purple-600 dark:text-purple-400" /> :
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {t.notificationSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="notifications" className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {t.prayerNotifications}
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t.prayerNotificationsDesc}
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={notifications} 
                    onCheckedChange={handleNotificationsChange}
                  />
                </div>
                
                {notifications && (
                  <div className="space-y-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <Label htmlFor="notification-timing" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t.notificationTiming}
                      </Label>
                      <Select 
                        value={notificationTiming} 
                        onValueChange={handleNotificationTimingChange}
                      >
                        <SelectTrigger className="w-full mt-2 h-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg">
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 {t.minutesBefore}</SelectItem>
                          <SelectItem value="10">10 {t.minutesBefore}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
