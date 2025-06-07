
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Bell, Play } from "lucide-react";

export interface AdhanSoundOption {
  id: string;
  name: string;
  description: string;
}

interface AdhanSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  onSelect: (soundId: string) => void;
  selectedSoundId?: string;
  notificationEnabled?: boolean;
  onNotificationToggle?: (enabled: boolean) => void;
}

const adhanSoundOptions: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    description: "Classic adhan sound",
  },
  {
    id: "makkah-adhan",
    name: "Makkah Adhan",
    description: "Adhan from Masjid al-Haram",
  },
  {
    id: "soft-notification",
    name: "Soft Notification",
    description: "Gentle notification sound",
  },
];

const AdhanSoundModal = ({
  isOpen,
  onClose,
  prayerName,
  onSelect,
  selectedSoundId = "traditional-adhan",
  notificationEnabled = true,
  onNotificationToggle
}: AdhanSoundModalProps) => {
  const handleSelectSound = (soundId: string) => {
    onSelect(soundId);
  };

  const playSound = async (soundId: string) => {
    try {
      const audio = new Audio(`/audio/${soundId}.mp3`);
      audio.volume = 0.7;
      await audio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            {prayerName} Prayer Notification
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Notification Toggle Switch */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="bg-prayer-light/20 p-2 rounded-full">
                <Bell className="h-5 w-5 text-prayer-primary" />
              </div>
              <div>
                <h3 className="font-medium text-base">Enable notifications</h3>
                <p className="text-sm text-muted-foreground">Get alerts before {prayerName} prayer</p>
              </div>
            </div>
            {onNotificationToggle && (
              <Switch
                checked={notificationEnabled}
                onCheckedChange={onNotificationToggle}
              />
            )}
          </div>
          
          {notificationEnabled && (
            <>
              <div className="mb-4">
                <h3 className="font-medium text-base mb-2">Select notification sound</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose which sound plays for this prayer
                </p>
              </div>
              
              <RadioGroup
                value={selectedSoundId}
                onValueChange={handleSelectSound}
                className="space-y-3"
              >
                {adhanSoundOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      selectedSoundId === option.id
                        ? "border-prayer-primary bg-prayer-light/10"
                        : "border-border"
                    } hover:bg-accent transition-colors`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer flex-1">
                        <div>
                          <h4 className="font-medium">{option.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playSound(option.id)}
                      className="ml-2 p-2 h-8 w-8"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
