
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Trash2 } from "lucide-react";
import { soundOptions } from "./sound/soundOptions";
import { useSoundPlayer } from "./sound/useSoundPlayer";
import SoundFilePicker from "./sound/SoundFilePicker";
import { saveCustomSoundForPrayer, getCustomSoundForPrayer, removeCustomSoundForPrayer } from "@/services/notification/soundMapping";
import { toast } from "@/components/ui/use-toast";

interface AdhanSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  prayerId: string;
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
  prayerId,
  selectedSoundId,
  onSelect,
  notificationEnabled,
  onNotificationToggle,
  notificationTiming,
  onTimingChange,
}: AdhanSoundModalProps) => {
  const { playingSound, playSound, stopCurrentAudio } = useSoundPlayer();
  const [localNotificationEnabled, setLocalNotificationEnabled] = useState(notificationEnabled);
  const [hasCustomSound, setHasCustomSound] = useState(false);
  const [customSoundPath, setCustomSoundPath] = useState<string>('');

  // Update local state when prop changes
  useEffect(() => {
    setLocalNotificationEnabled(notificationEnabled);
  }, [notificationEnabled]);

  // Check for custom sound when modal opens
  useEffect(() => {
    if (isOpen) {
      const customSound = getCustomSoundForPrayer(prayerId);
      setHasCustomSound(!!customSound);
      setCustomSoundPath(customSound || '');
    }
  }, [isOpen, prayerId]);

  const handleNotificationToggle = (enabled: boolean) => {
    console.log(`Toggling notification for ${prayerName}: ${enabled}`);
    setLocalNotificationEnabled(enabled);
    onNotificationToggle(enabled);
  };

  const handleSoundPlay = (soundId: string) => {
    const soundOption = soundOptions.find(s => s.id === soundId);
    if (!soundOption) return;
    
    if (playingSound === soundId) {
      stopCurrentAudio();
    } else {
      playSound(soundOption);
    }
  };

  const handleCustomSoundSelected = (soundPath: string, fileName: string) => {
    saveCustomSoundForPrayer(prayerId, soundPath, fileName);
    setHasCustomSound(true);
    setCustomSoundPath(soundPath);
    
    // Set the prayer to use custom sound
    onSelect(`custom_${prayerId}`);
    
    toast({
      title: "Custom Sound Set",
      description: `Custom sound saved for ${prayerName} prayer`,
    });
  };

  const handleRemoveCustomSound = () => {
    removeCustomSoundForPrayer(prayerId);
    setHasCustomSound(false);
    setCustomSoundPath('');
    
    // Reset to default sound
    onSelect('adhan');
    
    toast({
      title: "Custom Sound Removed",
      description: `Custom sound removed for ${prayerName} prayer`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
                
                {/* Custom Sound Section */}
                {hasCustomSound && (
                  <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-green-800">Custom Sound</h4>
                        <p className="text-sm text-green-600">Using your selected audio file</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCustomSound}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Default Sound Options */}
                <div className="space-y-2">
                  {soundOptions.map((sound) => (
                    <div
                      key={sound.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSoundId === sound.id && !hasCustomSound
                          ? 'border-prayer-primary bg-prayer-primary/10'
                          : 'border-gray-200 hover:border-prayer-primary/50'
                      }`}
                      onClick={() => !hasCustomSound && onSelect(sound.id)}
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

                {/* Custom Sound File Picker */}
                <SoundFilePicker
                  prayerId={prayerId}
                  prayerName={prayerName}
                  onSoundSelected={handleCustomSoundSelected}
                  selectedSoundPath={hasCustomSound ? customSoundPath : undefined}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
