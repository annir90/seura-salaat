import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, Clock, Volume2 } from "lucide-react";
import { PrayerTime } from "@/services/prayerTimeService";
import { getTranslation } from "@/services/translationService";
import { notificationService, PrayerNotificationSettings } from "@/services/notificationService";
import { soundOptions } from "@/components/sound/soundOptions";
import { useSoundPlayer } from "@/components/sound/useSoundPlayer";
import { useState, useEffect } from "react";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const t = getTranslation();
  const { playSound } = useSoundPlayer();
  const [settings, setSettings] = useState<PrayerNotificationSettings>(notificationService.getSettings());
  const [hasPermission, setHasPermission] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
      await notificationService.cancelPrayerNotification(prayerKey);
    }
  };

  const updatePrayerSetting = (key: keyof typeof settings[keyof PrayerNotificationSettings], value: any) => {
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
  };

  const testSound = (soundId: string) => {
    const soundOption = soundOptions.find(s => s.id === soundId);
    if (soundOption) {
      playSound(soundOption);
    }
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
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  {isNotificationEnabled ? (
                    <Bell className="h-5 w-5 text-primary" />
                  ) : (
                    <BellOff className="h-5 w-5 text-primary" />
                  )}
                </button>
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
                  
                  {isNotificationEnabled && hasPermission && prayerSettings && (
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

                      {/* Sound Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-gray-500" />
                          <label className="text-sm font-medium">
                            {t.notificationSound || "Notification Sound"}
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={prayerSettings.sound}
                            onValueChange={(value) => updatePrayerSetting('sound', value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {soundOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => testSound(prayerSettings.sound)}
                            className="shrink-0"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
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
