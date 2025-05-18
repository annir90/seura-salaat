
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

// Use more reliable adhan sound sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Adhan",
    // Using a direct file URL instead of third-party service
    url: "https://www.islamcan.com/audio/adhan/azan6.mp3",
    icon: <Bell size={20} />,
  },
  {
    id: "ringtone",
    name: "Soft Reminder",
    url: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
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

  // Improved audio loading and playback function
  const playSound = (soundId: string) => {
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;
    
    // Stop if already playing this sound
    if (isPlaying === soundId) {
      const audioEl = audioRefs.current[soundId];
      if (audioEl) {
        audioEl.pause();
        setIsPlaying(null);
      }
      return;
    }
    
    // Stop any other playing sounds first
    stopAllSounds();
    
    if (!soundOption.url) return;
    
    // Set playing state immediately to update UI
    setIsPlaying(soundId);
    
    try {
      // Clean up any existing audio element for this sound
      if (audioRefs.current[soundId]) {
        const oldAudio = audioRefs.current[soundId];
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = "";
          oldAudio.load(); // Force unload
        }
      }
      
      // Create new audio element with optimized settings
      const audioEl = new Audio();
      
      // For adhan sound specifically, we'll use these settings
      if (soundOption.id === "traditional-adhan") {
        // Don't set crossOrigin for Islamic audio sources as they may reject it
        audioEl.preload = "auto";
        audioEl.autoplay = false; // We'll manually play
      } else {
        // For other sources 
        audioEl.crossOrigin = "anonymous";
        audioEl.preload = "auto";
      }
      
      // Store reference before setting up events
      audioRefs.current[soundId] = audioEl;
      
      // Set up listeners
      audioEl.addEventListener('canplaythrough', () => {
        console.log(`Audio ${soundOption.name} is ready to play`);
        if (audioRefs.current[soundId] === audioEl) {
          playAudioElement(audioEl, soundId, soundOption.name);
        }
      });
      
      audioEl.addEventListener('ended', () => {
        console.log(`Audio ${soundOption.name} playback completed`);
        setIsPlaying(null);
      });
      
      audioEl.addEventListener('error', (e) => {
        console.error(`Error loading audio for ${soundOption.name}:`, e);
        handlePlaybackError(soundId, soundOption.name);
      });
      
      // Set source and begin loading
      console.log(`Loading ${soundOption.name} from URL: ${soundOption.url}`);
      audioEl.src = soundOption.url;
      audioEl.load();
      
      // Try to play after a short delay to give time for initial loading
      setTimeout(() => {
        if (isPlaying === soundId && audioRefs.current[soundId] === audioEl) {
          playAudioElement(audioEl, soundId, soundOption.name);
        }
      }, 200);
      
    } catch (error) {
      console.error(`General error with ${soundOption.name}:`, error);
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  // Helper function to play audio with fallbacks
  const playAudioElement = (audioEl: HTMLAudioElement, soundId: string, soundName: string) => {
    console.log(`Attempting to play ${soundName}`);
    
    const playPromise = audioEl.play();
    if (!playPromise) {
      console.warn(`Browser didn't return play promise for ${soundName}`);
      return;
    }
    
    playPromise.then(() => {
      console.log(`Successfully playing ${soundName}`);
    }).catch(error => {
      console.error(`Play failed for ${soundName}:`, error);
      
      // Special handling for autoplay policy errors (common in browsers)
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Playback Blocked",
          description: "Your browser may be blocking autoplay. Please try again.",
        });
      } else {
        // For network or other errors, use the built-in retry
        setTimeout(() => {
          if (isPlaying === soundId) {
            console.log(`Retrying play for ${soundName}`);
            audioEl.play().catch(e => {
              console.error(`Retry play failed for ${soundName}:`, e);
              handlePlaybackError(soundId, soundName);
            });
          }
        }, 300);
      }
    });
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Error",
      description: `Unable to play ${soundName}. Please try again or select a different sound.`,
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
