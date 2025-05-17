
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertTriangle, Play, Pause, Volume2, Bell, Speaker } from "lucide-react";
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

// Updated with reliable open-source adhan sounds
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "gentle-notification",
    name: "Gentle Notification",
    url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    icon: <Volume2 className="h-5 w-5" />,
  },
  {
    id: "short-adhan",
    name: "Short Adhan",
    url: "https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3",
    icon: <Speaker className="h-5 w-5" />,
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
    
    // Pre-load audio elements
    ADHAN_OPTIONS.forEach((option) => {
      if (!audioRefs.current[option.id]) {
        const audio = new Audio();
        
        audio.onended = () => {
          setIsPlaying(null);
          console.log(`Audio ${option.name} playback completed`);
        };
        
        audio.onerror = () => {
          console.error(`Error loading audio for ${option.name}`);
          setIsPlaying(null);
          setLoadingSound(null);
          setLoadErrors(prev => ({...prev, [option.id]: true}));
          
          toast({
            title: "Audio Error",
            description: `Couldn't load the ${option.name} sound. Please try another option.`,
            variant: "destructive",
          });
        };
        
        // Don't preload to avoid network issues
        audioRefs.current[option.id] = audio;
      }
    });

    return () => {
      // Clean up only when modal closes completely
      stopAllSounds();
    };
  }, [isOpen, toast]);

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
    
    // Set loading state
    setLoadingSound(soundId);
    
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    if (!soundOption) return;

    // Get or create the audio element
    let audioEl = audioRefs.current[soundId];
    if (!audioEl) {
      audioEl = new Audio();
      audioRefs.current[soundId] = audioEl;
    }
    
    // Set up event listeners
    const onCanPlay = () => {
      console.log(`${soundOption.name} can play now`);
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

    const onError = () => {
      console.error(`Error loading ${soundOption.name}`);
      handlePlaybackError(soundId, soundOption.name);
    };

    // Clean up previous event listeners to avoid duplicates
    audioEl.removeEventListener('canplaythrough', onCanPlay);
    audioEl.removeEventListener('error', onError);
    
    // Add new event listeners
    audioEl.addEventListener('canplaythrough', onCanPlay, { once: true });
    audioEl.addEventListener('error', onError, { once: true });
    
    // Set source and load
    audioEl.src = soundOption.url;
    audioEl.load();
    
    // Set a timeout for loading
    setTimeout(() => {
      if (loadingSound === soundId) {
        console.log("Timeout while loading audio");
        handlePlaybackError(soundId, soundOption.name);
      }
    }, 5000);
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
