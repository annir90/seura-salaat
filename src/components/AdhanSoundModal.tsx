
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Clock } from "lucide-react";
import { soundOptions } from "./sound/soundOptions";
import { useSoundPlayer } from "./sound/useSoundPlayer";
import SoundOptionItem from "./sound/SoundOptionItem";

interface AdhanSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  onSelect: (soundId: string) => void;
  selectedSoundId?: string;
  notificationEnabled: boolean;
  onNotificationToggle: (enabled: boolean) => void;
  notificationTiming: string;
  onTimingChange: (timing: string) => void;
}

const AdhanSoundModal = ({ 
  isOpen, 
  onClose, 
  prayerName, 
  onSelect, 
  selectedSoundId,
  notificationEnabled,
  onNotificationToggle,
  notificationTiming,
  onTimingChange
}: AdhanSoundModalProps) => {
  const { playingSound, playSound, stopCurrentAudio } = useSoundPlayer();

  const handleClose = () => {
    // Stop any playing audio when modal closes
    stopCurrentAudio();
    onClose();
  };

  const handleSoundSelect = (soundId: string) => {
    onSelect(soundId);
    console.log(`Selected sound: ${soundId} for notifications`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-prayer-primary" />
            {prayerName} Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Notification Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Notifications</span>
              <Switch
                checked={notificationEnabled}
                onCheckedChange={onNotificationToggle}
              />
            </div>
          </div>

          {/* Timing Selection */}
          {notificationEnabled && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-prayer-primary" />
                <span className="text-sm font-medium">Notification Timing</span>
              </div>
              <Select value={notificationTiming} onValueChange={onTimingChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="10">10 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="20">20 minutes before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sound Selection */}
          {notificationEnabled && (
            <div className="space-y-3">
              <span className="text-sm font-medium">Notification Sound</span>
              <div className="space-y-2">
                {soundOptions.map((soundOption) => (
                  <SoundOptionItem
                    key={soundOption.id}
                    soundOption={soundOption}
                    selectedSoundId={selectedSoundId}
                    playingSound={playingSound}
                    onSelect={handleSoundSelect}
                    onPlay={playSound}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
