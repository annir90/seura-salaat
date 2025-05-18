
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

// Updated with more reliable and direct adhan sound sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://www.islamcan.com/audio/adhan/azan6.mp3", // Added www for potentially better hosting
    icon: <Bell size={20} />,
  },
  {
    id: "adhan-makkah",
    name: "Makkah Adhan",
    url: "https://www.islamcan.com/audio/adhan/azan2.mp3", // Added www for potentially better hosting
    icon: <Bell size={20} />,
  },
  {
    id: "ringtone",
    name: "Soft Reminder",
    url: "https://muslim-info-app-seo.appspot.com/audio/soft-notification.mp3", // Changed to a different audio source
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
    
    // Preload audio when modal opens for better UX
    ADHAN_OPTIONS.forEach(option => {
      preloadAudio(option.id, option.url);
    });
    
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

  const preloadAudio = (soundId: string, url: string) => {
    try {
      // Clean up any existing audio element
      if (audioRefs.current[soundId]) {
        const oldAudio = audioRefs.current[soundId];
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.src = "";
        }
      }

      // Create new audio element with improved configuration
      const audio = new Audio();
      
      // Add cache-busting parameter to avoid browser caching issues
      const cacheBuster = `?cb=${Date.now()}`;
      audio.src = url + cacheBuster;
      audio.preload = "auto";
      
      // Store reference
      audioRefs.current[soundId] = audio;
      
      console.log(`Preloading ${soundId} from ${url}`);
      
      // Add basic event listeners for preloading
      audio.addEventListener("canplaythrough", () => {
        console.log(`Audio ${soundId} is ready to play`);
      });
      
      audio.addEventListener("error", (e) => {
        console.error(`Error preloading audio for ${soundId}:`, e);
        setLoadErrors(prev => ({...prev, [soundId]: true}));
      });
      
      // Start loading
      audio.load();
    } catch (error) {
      console.error(`Error setting up preload for ${soundId}:`, error);
    }
  };

  const stopAllSounds = () => {
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
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

  // Simplified audio playback function with better error handling
  const playSound = (soundId: string) => {
    console.log(`Attempting to play sound: ${soundId}`);
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;
    
    // If already playing this sound, stop it
    if (isPlaying === soundId) {
      stopAllSounds();
      return;
    }
    
    // Stop any other playing sounds first
    stopAllSounds();
    
    // Set playing state immediately for UI feedback
    setIsPlaying(soundId);
    
    try {
      // Create a completely fresh audio instance for each play attempt
      const audio = new Audio();
      
      // Set up event handlers before setting source
      audio.addEventListener("play", () => {
        console.log(`${soundOption.name} playback started`);
      });
      
      audio.addEventListener("canplaythrough", () => {
        console.log(`${soundOption.name} is ready for playback`);
        if (isPlaying === soundId) {
          audio.play().catch(e => {
            console.error(`Playback failed for ${soundOption.name}:`, e);
            handlePlaybackError(soundId, soundOption.name);
          });
        }
      });
      
      audio.addEventListener("ended", () => {
        console.log(`${soundOption.name} playback completed`);
        setIsPlaying(null);
      });
      
      audio.addEventListener("error", (e) => {
        console.error(`Error with ${soundOption.name} audio:`, e);
        handlePlaybackError(soundId, soundOption.name);
      });
      
      // Important: Set volume explicitly to ensure it's not muted
      audio.volume = 1.0;
      
      // Cache-busting for better reliability
      const cacheBuster = `?cb=${Date.now() + Math.random()}`;
      audio.src = soundOption.url + cacheBuster;
      audio.preload = "auto";
      
      console.log(`Loading ${soundOption.name} from: ${audio.src}`);
      
      // Store reference to this audio element
      audioRefs.current[soundId] = audio;
      
      // Manually load and attempt play
      audio.load();
      
      // Add a slight delay before attempting to play
      setTimeout(() => {
        if (isPlaying === soundId && audioRefs.current[soundId] === audio) {
          console.log(`Attempting delayed play of ${soundOption.name}`);
          audio.play().catch(e => {
            console.error(`Delayed play failed for ${soundOption.name}:`, e);
            
            // For Islamic audio, try one more approach
            if (soundId.includes("adhan")) {
              retryWithFallback(soundId, soundOption);
            } else {
              handlePlaybackError(soundId, soundOption.name);
            }
          });
        }
      }, 300);
    } catch (error) {
      console.error(`General error playing ${soundOption.name}:`, error);
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const retryWithFallback = (soundId: string, soundOption: AdhanSoundOption) => {
    console.log(`Retrying ${soundOption.name} with fallback approach`);
    
    try {
      // Create an audio element directly in the DOM for better browser support
      const audioElement = document.createElement('audio');
      audioElement.id = `audio-${soundId}-${Date.now()}`;
      audioElement.style.display = 'none';
      audioElement.controls = true;
      audioElement.volume = 1.0;
      
      // Add to DOM temporarily
      document.body.appendChild(audioElement);
      
      // Set up source with cache busting
      const source = document.createElement('source');
      source.src = `${soundOption.url}?cb=${Date.now()}`;
      source.type = 'audio/mpeg';
      audioElement.appendChild(source);
      
      // Set up event handlers
      audioElement.oncanplay = () => {
        console.log(`DOM audio element for ${soundOption.name} can play`);
        if (isPlaying === soundId) {
          audioElement.play().catch(e => {
            console.error(`DOM audio play failed for ${soundOption.name}:`, e);
            handlePlaybackError(soundId, soundOption.name);
          });
        }
      };
      
      audioElement.onended = () => {
        console.log(`DOM audio for ${soundOption.name} ended`);
        setIsPlaying(null);
        // Clean up
        document.body.removeChild(audioElement);
      };
      
      audioElement.onerror = () => {
        console.error(`DOM audio error for ${soundOption.name}`);
        handlePlaybackError(soundId, soundOption.name);
        // Clean up
        document.body.removeChild(audioElement);
      };
      
      // Store a reference so we can control it
      audioRefs.current[soundId] = audioElement;
      
      // Load and play
      audioElement.load();
    } catch (e) {
      console.error(`Fallback approach failed for ${soundOption.name}:`, e);
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Playback Issue",
      description: `Unable to play ${soundName}. Please try another sound.`,
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

