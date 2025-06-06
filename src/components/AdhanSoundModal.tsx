
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell } from "lucide-react";

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
  {
    id: "none",
    name: "No Sound",
    description: "Silent notification only",
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
    // Don't close modal automatically
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
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
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
                    <div className="flex items-center gap-2">
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
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="bg-prayer-primary hover:bg-prayer-primary/90"
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
