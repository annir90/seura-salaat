import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Play, Pause, Volume2, Bell, VolumeX } from "lucide-react";
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

// Updated with more reliable audio sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://islamic-audio.cdn.lovable.dev/adhan-short.mp3",
    icon: <Bell size={20} />, // Will remove this since we have the Bell on the left
  },
  {
    id: "gentle-notification",
    name: "Gentle Notification",
    url: "https://islamic-audio.cdn.lovable.dev/gentle-notification.mp3",
    icon: <Volume2 size={20} />,
  },
  {
    id: "silent-notification",
    name: "Visual Only",
    url: "https://islamic-audio.cdn.lovable.dev/gentle-ping.mp3", // Added a gentle sound for preview
    icon: <VolumeX size={20} />,
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

    // For Visual Only option, we still want to play the preview sound, but explain it's just for preview
    if (soundOption.id === "silent-notification") {
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
        
        audioEl.onerror = () => {
          console.error(`Error loading audio for ${soundOption.name}`);
          handlePlaybackError(soundId, soundOption.name);
        };
      }

      // Play the preview sound
      try {
        audioEl.play()
          .then(() => {
            setIsPlaying(soundId);
            toast({
              title: "Preview Only",
              description: "This is just a preview. When selected, Visual Only will not play any sound for actual notifications.",
            });
          })
          .catch(error => {
            console.error("Play failed:", error);
            handlePlaybackError(soundId, soundOption.name);
          });
      } catch (error) {
        handlePlaybackError(soundId, soundOption.name);
      }
      
      return;
    }
    
    // Regular sound options
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
      
      audioEl.onerror = () => {
        console.error(`Error loading audio for ${soundOption.name}`);
        handlePlaybackError(soundId, soundOption.name);
      };
    }

    // Play the sound
    try {
      audioEl.play()
        .then(() => {
          setIsPlaying(soundId);
        })
        .catch(error => {
          console.error("Play failed:", error);
          handlePlaybackError(soundId, soundOption.name);
        });
    } catch (error) {
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Error",
      description: `Failed to play ${soundName}. Please try another sound.`,
      variant: "destructive",
    });
  };

  const handleSelect = (soundId: string) => {
    onSelect(soundId);
    
    const selectedOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    const notificationTypeMessage = soundId === "silent-notification" 
      ? "Visual notifications only (no sound)"
      : `${selectedOption?.name} notifications`;
      
    toast({
      title: "Notification Setting Updated",
      description: `${prayerName} will use ${notificationTypeMessage}`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Notification Sound</DialogTitle>
          <DialogDescription>
            Select a sound for prayer notifications. You can preview each option before selecting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {ADHAN_OPTIONS.map((option) => {
            const isSelected = selectedSoundId === option.id;
            const hasError = loadErrors[option.id];
            
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
                    <Bell size={20} className={isSelected ? "text-prayer-primary" : ""} />
                    {/* Removed option.icon here to avoid duplicate icons */}
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
                      disabled={isPlaying === option.id}
                    >
                      {isPlaying === option.id ? 'Stop' : 'Play'}
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
