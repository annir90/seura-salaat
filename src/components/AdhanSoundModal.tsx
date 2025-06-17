
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Volume2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SoundOption {
  id: string;
  name: string;
  file: string;
  description: string;
}

const soundOptions: SoundOption[] = [
  {
    id: "adhan-traditional",
    name: "Adhan",
    file: "/audio/traditional-adhan.mp3",
    description: "Traditional Adhan sound"
  },
  {
    id: "adhan-soft", 
    name: "Soft",
    file: "/audio/soft-notification.mp3",
    description: "Soft notification sound"
  },
  {
    id: "notification-beep",
    name: "Beep",
    file: "/audio/makkah-adhan.mp3", 
    description: "Simple beep notification"
  }
];

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
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlaySound = async (soundOption: SoundOption) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }

      if (playingSound === soundOption.id) {
        // If the same sound is playing, stop it
        setPlayingSound(null);
        return;
      }

      // Create new audio element with better mobile support
      const audio = new Audio();
      audioRef.current = audio;
      
      // Enhanced audio setup for mobile devices
      audio.preload = 'metadata';
      audio.volume = 0.8;
      audio.crossOrigin = 'anonymous';
      
      // Add user interaction for mobile Safari
      const playPromise = () => {
        return new Promise<void>((resolve, reject) => {
          const attemptPlay = () => {
            audio.play()
              .then(() => {
                setPlayingSound(soundOption.id);
                console.log(`Playing sound: ${soundOption.name}`);
                resolve();
              })
              .catch((error) => {
                console.error("Error playing sound:", error);
                // Try to play with user gesture
                if (error.name === 'NotAllowedError') {
                  // Create a temporary button for user interaction
                  const playButton = document.createElement('button');
                  playButton.textContent = 'Tap to play sound';
                  playButton.style.position = 'fixed';
                  playButton.style.top = '50%';
                  playButton.style.left = '50%';
                  playButton.style.transform = 'translate(-50%, -50%)';
                  playButton.style.zIndex = '9999';
                  playButton.style.padding = '10px';
                  playButton.style.backgroundColor = '#007bff';
                  playButton.style.color = 'white';
                  playButton.style.border = 'none';
                  playButton.style.borderRadius = '5px';
                  
                  playButton.onclick = () => {
                    audio.play().then(() => {
                      setPlayingSound(soundOption.id);
                      document.body.removeChild(playButton);
                      resolve();
                    }).catch(reject);
                  };
                  
                  document.body.appendChild(playButton);
                  
                  // Auto-remove after 5 seconds
                  setTimeout(() => {
                    if (document.body.contains(playButton)) {
                      document.body.removeChild(playButton);
                      reject(new Error('User interaction timeout'));
                    }
                  }, 5000);
                } else {
                  reject(error);
                }
              });
          };
          
          attemptPlay();
        });
      };

      // Set up event listeners
      audio.addEventListener('loadstart', () => {
        console.log(`Loading sound: ${soundOption.name}`);
      });

      audio.addEventListener('canplay', async () => {
        console.log(`Sound ready to play: ${soundOption.name}`);
        try {
          await playPromise();
        } catch (error) {
          console.error("Failed to play after loading:", error);
          setPlayingSound(null);
        }
      });

      // When audio ends, reset playing state
      audio.addEventListener('ended', () => {
        setPlayingSound(null);
        audioRef.current = null;
      });

      // Handle audio errors
      audio.addEventListener('error', (e) => {
        console.error("Audio error for:", soundOption.file, e);
        setPlayingSound(null);
        audioRef.current = null;
      });

      // Set source and load
      audio.src = soundOption.file;
      audio.load();

    } catch (error) {
      console.error("Error in handlePlaySound:", error);
      setPlayingSound(null);
    }
  };

  const handleClose = () => {
    // Stop any playing audio when modal closes
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSound(null);
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
                  <div
                    key={soundOption.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedSoundId === soundOption.id
                        ? "border-prayer-primary bg-prayer-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                    onClick={() => handleSoundSelect(soundOption.id)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{soundOption.name}</h4>
                      <p className="text-xs text-muted-foreground">{soundOption.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySound(soundOption);
                      }}
                    >
                      {playingSound === soundOption.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
