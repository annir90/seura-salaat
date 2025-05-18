
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Play, Pause, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AdhanSoundOption {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
}

interface AdhanSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  onSelect: (soundId: string) => void;
  selectedSoundId?: string;
}

// Updated sound options with more reliable audio sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Adhan",
    url: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg", // Reliable source from Google
    icon: <Bell size={20} />,
  },
  {
    id: "ringtone",
    name: "Soft Reminder",
    url: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg", // Another reliable Google source
    icon: <Bell size={20} />,
  }
];

const AdhanSoundModal: React.FC<AdhanSoundModalProps> = ({
  isOpen,
  onClose,
  prayerName,
  onSelect,
  selectedSoundId,
}) => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<{ [key: string]: boolean }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopAllSounds();
      return;
    }
    
    // Reset errors when opening the modal
    setLoadErrors({});
    
    return () => {
      // Clean up when modal closes completely
      stopAllSounds();
    };
  }, [isOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
      audioRefs.current = {};
    };
  }, []);

  const stopAllSounds = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        try {
          audio.currentTime = 0;
        } catch (e) {
          // Ignore errors when setting currentTime on unloaded audio
        }
      }
    });
    setIsPlaying(null);
  };

  const playSound = (soundId: string) => {
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;
    
    // Check if the sound is already playing
    if (isPlaying === soundId) {
      // If playing, pause it
      const audioEl = audioRefs.current[soundId];
      if (audioEl) {
        audioEl.pause();
        setIsPlaying(null);
      }
    } else {
      // Stop any other playing sounds first
      stopAllSounds();
      
      if (soundOption.url) {
        try {
          // Create new audio element each time
          const audioEl = new Audio();
          
          console.log(`Creating new audio element for ${soundOption.name}`);
          
          // Set up event listeners before setting source
          audioEl.addEventListener('canplaythrough', () => {
            console.log(`Audio ${soundOption.name} is ready to play`);
          });
          
          audioEl.addEventListener('error', (e) => {
            console.error(`Error loading audio for ${soundOption.name}:`, e);
            handlePlaybackError(soundId, soundOption.name);
          });
          
          audioEl.addEventListener('ended', () => {
            console.log(`Audio ${soundOption.name} playback completed`);
            setIsPlaying(null);
          });
          
          audioEl.addEventListener('loadstart', () => {
            console.log(`Started loading ${soundOption.name} audio`);
          });
          
          // Store the audio element
          audioRefs.current[soundId] = audioEl;
          
          // Set properties
          audioEl.crossOrigin = "anonymous"; // Add cross-origin attribute
          audioEl.preload = "auto";
          
          // Log URL before setting it
          console.log(`Loading ${soundOption.name} from URL: ${soundOption.url}`);
          audioEl.src = soundOption.url;
          
          // Begin loading
          audioEl.load();
          
          // Set playing state and play
          setIsPlaying(soundId);
          
          const playPromise = audioEl.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`Successfully playing ${soundOption.name}`);
              })
              .catch(error => {
                console.error(`Play failed for ${soundOption.name}:`, error);
                handlePlaybackError(soundId, soundOption.name);
              });
          }
        } catch (error) {
          console.error(`General error with ${soundOption.name}:`, error);
          handlePlaybackError(soundId, soundOption.name);
        }
      }
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Error",
      description: `Failed to play ${soundName}. Please try again or select a different sound.`,
      variant: "destructive",
    });
  };

  const handleSelect = (soundId: string) => {
    onSelect(soundId);
    
    const selectedOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    toast({
      title: "Notification Setting Updated",
      description: `${prayerName} will use ${selectedOption?.name} notifications`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Notification Sound</DialogTitle>
          <DialogDescription>
            Select a sound for prayer notifications. You can preview the option before selecting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {ADHAN_OPTIONS.map((option) => {
            const isSelected = selectedSoundId === option.id;
            const hasError = loadErrors[option.id];
            const isCurrentlyPlaying = isPlaying === option.id;
            
            return (
              <div
                key={option.id}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  isSelected && "border-prayer-primary bg-prayer-light",
                  !isSelected && "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <span className="font-medium">{option.name}</span>
                    
                    {hasError && (
                      <AlertTriangle size={16} className="text-destructive" />
                    )}
                    
                    {isSelected && (
                      <Check size={16} className="text-prayer-primary" />
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 h-8"
                      onClick={() => playSound(option.id)}
                    >
                      {isCurrentlyPlaying ? <Pause size={16} /> : <Play size={16} />}
                      {isCurrentlyPlaying ? ' Stop' : ' Play'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant={isSelected ? "outline" : "default"}
                      onClick={() => handleSelect(option.id)}
                      className={cn(
                        "text-xs px-3 h-8",
                        isSelected && "bg-prayer-light text-prayer-primary border-prayer-primary hover:bg-prayer-light/90"
                      )}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
