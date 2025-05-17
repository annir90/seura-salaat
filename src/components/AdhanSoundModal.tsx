
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

// Updated options list - removed Gentle Notification and Visual Only
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://www.islamcan.com/audio/adhan/azan6.mp3",
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
    // Stop any other playing sounds first
    stopAllSounds();
    
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;
    
    // Handle regular audio options
    if (soundOption.url) {
      // Get or create the audio element
      let audioEl = audioRefs.current[soundId];
      if (!audioEl) {
        audioEl = new Audio(soundOption.url);
        audioRefs.current[soundId] = audioEl;
        
        // Set up event listeners that persist for the audio instance
        audioEl.onended = () => {
          setIsPlaying(null);
          console.log(`Audio ${soundOption.name} playback completed`);
        };
        
        audioEl.onerror = (e) => {
          console.error(`Error loading audio for ${soundOption.name}`, e);
          handlePlaybackError(soundId, soundOption.name);
        };
      }

      // Force reload the audio source to ensure it's fresh
      audioEl.src = soundOption.url;
      audioEl.load();

      // Play the sound with better error handling
      setIsPlaying(soundId);
      
      try {
        const playPromise = audioEl.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Playing ${soundOption.name}`);
            })
            .catch(error => {
              console.error("Play failed:", error);
              handlePlaybackError(soundId, soundOption.name);
            });
        }
      } catch (error) {
        console.error("Play error:", error);
        handlePlaybackError(soundId, soundOption.name);
      }
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Error",
      description: `Failed to play ${soundName}. Please try again.`,
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
                      disabled={isCurrentlyPlaying}
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
