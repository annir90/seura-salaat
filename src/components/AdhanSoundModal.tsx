
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause } from "lucide-react";
import { soundOptions } from "./sound/soundOptions";
import { useSoundPlayer } from "./sound/useSoundPlayer";

interface AdhanSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  selectedSoundId: string;
  onSelect: (soundId: string) => void;
  notificationEnabled: boolean;
  onNotificationToggle: (enabled: boolean) => void;
  notificationTiming: string;
  onTimingChange: (timing: string) => void;
}

const AdhanSoundModal = ({
  isOpen,
  onClose,
  prayerName,
  selectedSoundId,
  onSelect,
  notificationEnabled,
  onNotificationToggle,
  notificationTiming,
  onTimingChange,
}: AdhanSoundModalProps) => {
  const { playingSound, playSound, stopCurrentAudio } = useSoundPlayer();
  const [localNotificationEnabled, setLocalNotificationEnabled] = useState(notificationEnabled);

  // Update local state when prop changes
  useEffect(() => {
    setLocalNotificationEnabled(notificationEnabled);
  }, [notificationEnabled]);

  const handleNotificationToggle = (enabled: boolean) => {
    console.log(`Toggling notification for ${prayerName}: ${enabled}`);
    setLocalNotificationEnabled(enabled);
    onNotificationToggle(enabled);
  };

  const handleSoundPlay = (soundId: string) => {
    if (playingSound === soundId) {
      stopCurrentAudio();
    } else {
      playSound(soundId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{prayerName} Prayer Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notification-toggle" className="text-base font-medium">
              Enable Notifications
            </Label>
            <Switch
              id="notification-toggle"
              checked={localNotificationEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {localNotificationEnabled && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-medium">Notification Timing</Label>
                <Select value={notificationTiming} onValueChange={onTimingChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Notification Sound</Label>
                <div className="space-y-2">
                  {soundOptions.map((sound) => (
                    <div
                      key={sound.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSoundId === sound.id
                          ? 'border-prayer-primary bg-prayer-primary/10'
                          : 'border-gray-200 hover:border-prayer-primary/50'
                      }`}
                      onClick={() => onSelect(sound.id)}
                    >
                      <div>
                        <h4 className="font-medium">{sound.name}</h4>
                        <p className="text-sm text-muted-foreground">{sound.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSoundPlay(sound.id);
                        }}
                      >
                        {playingSound === sound.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
