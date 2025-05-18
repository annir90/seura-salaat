
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

// Updated with more reliable adhan sound sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://islamcan.com/audio/adhan/azan6.mp3", // Direct link without www
    icon: <Bell size={20} />,
  },
  {
    id: "adhan-makkah",
    name: "Makkah Adhan",
    url: "https://islamcan.com/audio/adhan/azan2.mp3", // Alternative adhan
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

  // Improved audio loading and playback function with better error handling
  const playSound = (soundId: string) => {
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;
    
    // If already playing this sound, stop it
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
    
    // Set playing state immediately for UI feedback
    setIsPlaying(soundId);
    
    try {
      // Clean up any existing audio element
      if (audioRefs.current[soundId]) {
        const oldAudio = audioRefs.current[soundId];
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = "";
          oldAudio.load();
        }
      }

      // Create new audio element with improved configuration
      const audio = new Audio();
      
      // Improved event handling for better playback
      audio.addEventListener("canplaythrough", () => {
        console.log(`Audio ${soundOption.name} is ready to play`);
        if (isPlaying === soundId) {
          audio.play().catch(e => {
            console.error(`Playback failed for ${soundOption.name}:`, e);
            handlePlaybackError(soundId, soundOption.name);
          });
        }
      });
      
      audio.addEventListener("ended", () => {
        console.log(`Audio ${soundOption.name} playback completed`);
        if (isPlaying === soundId) {
          setIsPlaying(null);
        }
      });
      
      audio.addEventListener("error", (e) => {
        console.error(`Error loading audio for ${soundOption.name}:`, e);
        handlePlaybackError(soundId, soundOption.name);
      });
      
      // Store reference to audio element
      audioRefs.current[soundId] = audio;
      
      // Set source and preload
      audio.preload = "auto";
      
      // Different handling for Islamic audio sources
      if (soundId.includes("adhan")) {
        // Special handling for Islamic audio - no crossorigin to prevent CORS issues
        audio.src = soundOption.url;
      } else {
        // For other sources like Google's OGG files
        audio.crossOrigin = "anonymous";
        audio.src = soundOption.url;
      }
      
      console.log(`Loading ${soundOption.name} from URL: ${soundOption.url}`);
      
      // Start loading
      audio.load();
      
      // Attempt to play with timeout to allow some loading time
      setTimeout(() => {
        if (isPlaying === soundId && audioRefs.current[soundId] === audio) {
          audio.play().catch(e => {
            console.error(`Initial play failed for ${soundOption.name}:`, e);
            
            // Try again with a different approach for adhan files
            if (soundId.includes("adhan")) {
              const newAudio = new Audio();
              newAudio.preload = "auto";
              audioRefs.current[soundId] = newAudio;
              
              newAudio.addEventListener("canplaythrough", () => {
                if (isPlaying === soundId) {
                  newAudio.play().catch(err => handlePlaybackError(soundId, soundOption.name));
                }
              });
              
              newAudio.addEventListener("ended", () => {
                if (isPlaying === soundId) {
                  setIsPlaying(null);
                }
              });
              
              newAudio.addEventListener("error", () => {
                handlePlaybackError(soundId, soundOption.name);
              });
              
              // Try with a cache-busting parameter
              const cacheBuster = `?cb=${Date.now()}`;
              newAudio.src = soundOption.url + cacheBuster;
              newAudio.load();
            } else {
              handlePlaybackError(soundId, soundOption.name);
            }
          });
        }
      }, 300);
    } catch (error) {
      console.error(`General error with ${soundOption.name}:`, error);
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Playback Issue",
      description: `Unable to play ${soundName}. Please try another sound or reload the page.`,
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
            Select a sound for prayer notifications. Preview options before selecting.
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
