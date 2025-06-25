
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notificationService, PrayerNotificationSettings, NotificationSettings } from "@/services/notificationService";
import { getTranslation } from "@/services/translationService";

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const t = getTranslation();
  const [settings, setSettings] = useState<PrayerNotificationSettings>(notificationService.getSettings());
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const permission = await notificationService.checkPermissions();
    setHasPermission(permission);
  };

  const requestPermission = async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
    if (granted) {
      toast.success(t.notificationPermissionGranted || "Notification permission granted");
    } else {
      toast.error(t.notificationPermissionDenied || "Notification permission denied");
    }
  };

  const updatePrayerSetting = (prayerId: keyof PrayerNotificationSettings, key: keyof NotificationSettings, value: any) => {
    const newSettings = {
      ...settings,
      [prayerId]: {
        ...settings[prayerId],
        [key]: value
      }
    };
    setSettings(newSettings);
    notificationService.saveSettings(newSettings);
    
    // If disabling notifications, cancel pending ones for this prayer
    if (key === 'enabled' && !value) {
      notificationService.cancelPrayerNotification(prayerId);
    }
  };

  const timingOptions = [
    { value: 0, label: t.atPrayerTime || "At prayer time" },
    { value: 5, label: "5 minutes before" },
    { value: 10, label: "10 minutes before" },
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" }
  ];

  const prayers = [
    { id: 'fajr' as const, name: t.fajr || 'Fajr' },
    { id: 'dhuhr' as const, name: t.dhuhr || 'Dhuhr' },
    { id: 'asr' as const, name: t.asr || 'Asr' },
    { id: 'maghrib' as const, name: t.maghrib || 'Maghrib' },
    { id: 'isha' as const, name: t.isha || 'Isha' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.notifications || "Notifications"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.manageNotificationSettings || "Manage prayer notification settings"}
            </p>
          </div>
        </div>

        {/* Permission Status */}
        {!hasPermission && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  {t.notificationPermissionRequired || "Notification Permission Required"}
                </h3>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                {t.notificationPermissionDescription || "Enable notifications to receive prayer reminders"}
              </p>
              <Button onClick={requestPermission} className="bg-orange-600 hover:bg-orange-700">
                {t.enableNotifications || "Enable Notifications"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Prayer Notification Settings */}
        <div className="space-y-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id} className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
                  {prayer.name}
                  <Switch
                    checked={settings[prayer.id].enabled}
                    onCheckedChange={(checked) => updatePrayerSetting(prayer.id, 'enabled', checked)}
                    disabled={!hasPermission}
                  />
                </CardTitle>
              </CardHeader>
              
              {settings[prayer.id].enabled && hasPermission && (
                <CardContent className="pt-0 space-y-4">
                  {/* Timing Selection */}
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                        {t.notificationTiming || "Notification Timing"}
                      </label>
                      <Select
                        value={settings[prayer.id].timing.toString()}
                        onValueChange={(value) => updatePrayerSetting(prayer.id, 'timing', parseInt(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Fixed Sound Info */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Notification sound: Adhan (fixed)</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Test All Notifications Button */}
        {hasPermission && (
          <Card className="mt-6 shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardContent className="p-4">
              <Button
                onClick={async () => {
                  await notificationService.sendTestNotification();
                  toast.success(t.testNotificationSent || "Test notification sent");
                }}
                className="w-full"
                variant="outline"
              >
                {t.sendTestNotification || "Send Test Notification"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
