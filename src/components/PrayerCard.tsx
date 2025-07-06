
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Clock } from "lucide-react";
import { PrayerTime } from "@/services/prayerTimeService";
import { notificationService, PrayerNotificationSettings } from "@/services/notificationService";
import { getTranslation } from "@/services/translationService";
import { useState, useEffect } from "react";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const t = getTranslation();
  const [settings, setSettings] = useState<PrayerNotificationSettings>(notificationService.getSettings());
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const permission = await notificationService.checkPermissions();
    setHasPermission(permission);
  };

  const getPrayerSettingsKey = (prayerId: string): keyof PrayerNotificationSettings | null => {
    const keyMap: Record<string, keyof PrayerNotificationSettings> = {
      'fajr': 'fajr',
      'dhuhr': 'dhuhr',
      'asr': 'asr', 
      'maghrib': 'maghrib',
      'isha': 'isha'
    };
    return keyMap[prayerId] || null;
  };

  const toggleNotification = async () => {
    if (!hasPermission) {
      const granted = await notificationService.requestPermissions();
      if (!granted) return;
      setHasPermission(true);
    }

    const prayerKey = getPrayerSettingsKey(prayer.id);
    if (!prayerKey) return;

    const currentEnabled = settings[prayerKey].enabled;
    const newSettings = {
      ...settings,
      [prayerKey]: {
        ...settings[prayerKey],
        enabled: !currentEnabled
      }
    };
    
    setSettings(newSettings);
    notificationService.saveSettings(newSettings);
    
    // Use the new refresh method
    await notificationService.refreshNotifications();
    
    console.log(`${prayer.name} notifications ${!currentEnabled ? 'enabled' : 'disabled'}`);
  };

  const updatePrayerSetting = async (key: keyof typeof settings[keyof PrayerNotificationSettings], value: any) => {
    const prayerKey = getPrayerSettingsKey(prayer.id);
    if (!prayerKey) return;

    const newSettings = {
      ...settings,
      [prayerKey]: {
        ...settings[prayerKey],
        [key]: value
      }
    };
    setSettings(newSettings);
    notificationService.saveSettings(newSettings);
    
    // Store individual timing in localStorage for persistence
    if (key === 'timing') {
      localStorage.setItem(`prayer-timing-${prayerKey}`, value.toString());
    }
    
    // Use the new refresh method
    await notificationService.refreshNotifications();
    
    console.log(`Updated ${prayer.name} ${key} to:`, value);
  };

  const prayerKey = getPrayerSettingsKey(prayer.id);
  const isNotificationEnabled = prayerKey ? settings[prayerKey].enabled : false;
  const prayerSettings = prayerKey ? settings[prayerKey] : null;
  
  // Don't show notification bell for sunrise since it's not a prayer time
  const showNotificationBell = prayer.id !== 'sunrise';

  const timingOptions = [
    { value: 10, label: "10 minutes before" },
    { value: 15, label: "15 minutes before" }
  ];

  return (
    <Card className="mb-4 relative">
      <CardContent className="p-4">
        {prayer.isNext && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full animate-pulse-gentle"></div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="font-semibold text-lg">{prayer.name}</h3>
                <p className="text-prayer-primary font-semibold text-lg">{prayer.time}</p>
              </div>
            </div>
          </div>
          
          {showNotificationBell && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  {isNotificationEnabled ? (
                    <Bell className="h-5 w-5 text-primary" />
                  ) : (
                    <BellOff className="h-5 w-5 text-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{prayer.name} Notifications</h4>
                    <Switch
                      checked={isNotificationEnabled}
                      onCheckedChange={toggleNotification}
                    />
                  </div>
                  
                  {prayerSettings && isNotificationEnabled && hasPermission && (
                    <div className="space-y-4">
                      {/* Timing Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <label className="text-sm font-medium">
                            {t.notificationTiming || "Notification Timing"}
                          </label>
                        </div>
                        <Select
                          value={prayerSettings.timing.toString()}
                          onValueChange={(value) => updatePrayerSetting('timing', parseInt(value))}
                        >
                          <SelectTrigger>
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
                  )}
                  
                  {!hasPermission && (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Enable notifications to customize settings</p>
                      <Button 
                        onClick={async () => {
                          const granted = await notificationService.requestPermissions();
                          setHasPermission(granted);
                        }}
                        size="sm"
                        className="w-full"
                      >
                        Enable Notifications
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerCard;
