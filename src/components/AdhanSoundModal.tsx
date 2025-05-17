
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertTriangle, Play, Pause, Volume2, Bell, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

// Updated with more reliable open-source adhan sounds
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://assets.mixkit.co/active_storage/sfx/212/212.wav",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "gentle-notification",
    name: "Gentle Notification",
    url: "https://assets.mixkit.co/active_storage/sfx/2869/2869.mp3",
    icon: <Volume2 className="h-5 w-5" />,
  },
  {
    id: "silent-notification",
    name: "Silent Notification",
    url: "",
    icon: <VolumeX className="h-5 w-5" />,
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
  const [loadingSound, setLoadingSound] = useState<string | null>(null);
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
    setLoadingSound(null);
  };

  const toggleSound = (soundId: string) => {
    // If this sound is already playing, stop it
    if (isPlaying === soundId) {
      stopAllSounds();
      return;
    }
    
    // Stop any other playing sounds first
    stopAllSounds();
    
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;

    // Skip loading for silent notification
    if (soundOption.id === "silent-notification") {
      setIsPlaying(soundId);
      return;
    }
    
    // Set loading state
    setLoadingSound(soundId);
    
    // Get or create the audio element
    let audioEl = audioRefs.current[soundId];
    if (!audioEl) {
      audioEl = new Audio();
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
      audioEl.src = soundOption.url;
      
      // Use a Promise to handle both successful and failed playback
      audioEl.load();
      
      // Set a timeout to prevent waiting too long
      const timeoutId = setTimeout(() => {
        if (loadingSound === soundId) {
          handlePlaybackError(soundId, soundOption.name);
        }
      }, 3000);
      
      audioEl.oncanplaythrough = () => {
        clearTimeout(timeoutId);
        audioEl?.play()
          .then(() => {
            setIsPlaying(soundId);
            setLoadingSound(null);
          })
          .catch(error => {
            console.error("Play failed:", error);
            handlePlaybackError(soundId, soundOption.name);
          });
      };
    } catch (error) {
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadingSound(null);
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    
    toast({
      title: "Audio Error",
      description: `Failed to play ${soundName}. Please try another sound.`,
      variant: "destructive",
    });
  };

  const handleSelect = (soundId: string) => {
    onSelect(soundId);
    toast({
      title: "Notification Sound Set",
      description: `${prayerName} notifications will use ${ADHAN_OPTIONS.find(o => o.id === soundId)?.name}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose {prayerName} Notification Sound</DialogTitle>
          <DialogDescription>
            Select a sound for {prayerName} prayer notifications. You can preview each option before selecting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {ADHAN_OPTIONS.map((option) => (
            <Card
              key={option.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedSoundId === option.id ? "border-prayer-primary border-2" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {option.icon}
                  {selectedSoundId === option.id && (
                    <Check className="h-4 w-4 text-prayer-primary" />
                  )}
                  <span className="font-medium">{option.name}</span>
                  {loadErrors[option.id] && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                
                <div className="flex gap-2">
                  {option.id !== "silent-notification" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toggleSound(option.id)}
                      disabled={loadingSound !== null && loadingSound !== option.id}
                    >
                      {isPlaying === option.id ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Stop</span>
                        </>
                      ) : loadingSound === option.id ? (
                        <>
                          <span className="animate-pulse">Loading...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Play</span>
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    onClick={() => handleSelect(option.id)}
                    disabled={selectedSoundId === option.id}
                  >
                    {selectedSoundId === option.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdhanSoundModal;
