
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff } from "lucide-react";
import { PrayerTime } from "@/services/prayerTimeService";
import { getTranslation } from "@/services/translationService";
import { notificationService, PrayerNotificationSettings } from "@/services/notificationService";
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
    
    if (!currentEnabled) {
      // If enabling, cancel existing notifications for this prayer
      await notificationService.cancelPrayerNotification(prayerKey);
    }
  };

  const prayerKey = getPrayerSettingsKey(prayer.id);
  const isNotificationEnabled = prayerKey ? settings[prayerKey].enabled : false;
  
  // Don't show notification bell for sunrise since it's not a prayer time
  const showNotificationBell = prayer.id !== 'sunrise';

  return (
    <Card className={`mb-4 ${prayer.isNext ? 'border-l-4 border-l-orange-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {prayer.name}
                  {prayer.isNext && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs animate-pulse">
                      Next
                    </Badge>
                  )}
                </h3>
                <p className="text-prayer-primary font-semibold text-lg">{prayer.time}</p>
              </div>
            </div>
          </div>
          
          {showNotificationBell && (
            <button
              onClick={toggleNotification}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isNotificationEnabled ? (
                <Bell className="h-5 w-5 text-orange-500" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerCard;
