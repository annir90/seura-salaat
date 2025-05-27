
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const DEFAULT_ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Adhan",
    url: "/audio/traditional-adhan.mp3",
    icon: <Bell size={20} />,
  },
  {
    id: "adhan-makkah",
    name: "Soft",
    url: "/audio/makkah-adhan.mp3",
    icon: <Bell size={20} />,
  },
  {
    id: "ringtone",
    name: "Beep",
    url: "/audio/soft-notification.mp3",
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopAllSounds();
      return;
    }
    
    setLoadErrors({});
    
    return () => {
      stopAllSounds();
    };
  }, [isOpen]);

  const stopAllSounds = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      try {
        audioRef.current.currentTime = 0;
      } catch (e) {
        // Ignore errors when setting currentTime on unloaded audio
      }
      audioRef.current = null;
    }
    setIsPlaying(null);
  };

  const playSound = (soundId: string) => {
    const soundOption = DEFAULT_ADHAN_OPTIONS.find(o => o.id === soundId);
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
      // Create a fresh audio instance
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set up event handlers
      audio.addEventListener("ended", () => {
        setIsPlaying(null);
        audioRef.current = null;
      });
      
      audio.addEventListener("error", (e) => {
        console.error(`Error with ${soundOption.name} audio:`, e);
        handlePlaybackError(soundId, soundOption.name);
      });
      
      audio.addEventListener("canplaythrough", () => {
        if (audioRef.current === audio) {
          audio.play().catch(e => {
            console.error(`Playback failed for ${soundOption.name}:`, e);
            handlePlaybackError(soundId, soundOption.name);
          });
        }
      });
      
      // Set explicit volume
      audio.volume = 1.0;
      
      // Load audio
      audio.src = soundOption.url;
      audio.load();
      
    } catch (error) {
      console.error(`General error playing ${soundOption.name}:`, error);
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    audioRef.current = null;
    
    toast({
      title: "Audio Playback Issue",
      description: `Unable to play ${soundName}. Please check if the audio file is compatible.`,
      variant: "destructive",
    });
  };

  const handleSelect = (soundId: string) => {
    onSelect(soundId);
    
    const selectedOption = DEFAULT_ADHAN_OPTIONS.find(o => o.id === soundId);
    toast({
      title: "Notification Updated",
      description: `${prayerName} will use ${selectedOption?.name}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Notifications</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {DEFAULT_ADHAN_OPTIONS.map((option) => {
            const isSelected = selectedSoundId === option.id;
            const hasError = loadErrors[option.id];
            const isCurrentlyPlaying = isPlaying === option.id;
            
            return (
              <div
                key={option.id}
                className={cn(
                  "rounded-lg border p-4 transition-all border-border",
                  isSelected && "border-prayer-primary bg-prayer-light/10 dark:bg-prayer-light/5",
                  !isSelected && "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">{option.icon}</span>
                    <div>
                      <span className="font-medium text-foreground">{option.name}</span>
                    </div>
                    
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
                        isSelected && "bg-prayer-light/10 text-prayer-primary border-prayer-primary hover:bg-prayer-light/20"
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
