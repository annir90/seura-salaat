import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertTriangle, Play, Pause, Bell, Clock } from "lucide-react";
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

// Updated with more reliable hosted audio sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://ia800304.us.archive.org/18/items/Adhan_M/Adhan_M.mp3", // More reliable source from archive.org
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "gentle-notification",
    name: "Gentle Notification",
    url: "https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "peaceful-bell",
    name: "Peaceful Bell",
    url: "https://assets.mixkit.co/active_storage/sfx/1819/1819-preview.mp3",
    icon: <Bell className="h-5 w-5" />,
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

  // Create audio elements only once when component mounts
  useEffect(() => {
    ADHAN_OPTIONS.forEach((option) => {
      // Only create if it doesn't exist yet
      if (!audioRefs.current[option.id]) {
        const audio = new Audio();
        audio.preload = "none"; // Don't preload until needed
        
        // Setup event handlers
        audio.onended = () => {
          setIsPlaying(null);
        };
        
        audio.onerror = () => {
          console.error("Error with audio:", option.name, audio.error);
          setIsPlaying(null);
          setLoadingSound(null);
          setLoadErrors(prev => ({...prev, [option.id]: true}));
        };
        
        audioRefs.current[option.id] = audio;
      }
    });
    
    // Clean up on component unmount
    return () => {
      stopAllSounds();
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = "";
          audio.load();
        }
      });
    };
  }, []);

  // Handle modal state changes
  useEffect(() => {
    if (!isOpen) {
      stopAllSounds();
      return;
    }
    
    setLoadErrors({});
  }, [isOpen]);

  const stopAllSounds = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setIsPlaying(null);
    setLoadingSound(null);
  };

  const toggleSound = (soundId: string) => {
    // If this sound is already playing, stop it
    if (isPlaying === soundId) {
      const audio = audioRefs.current[soundId];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setIsPlaying(null);
      return;
    }
    
    // Stop any other playing sounds first
    stopAllSounds();
    
    // Start loading and playing the selected sound
    setLoadingSound(soundId);
    
    const audioToPlay = audioRefs.current[soundId];
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    
    if (audioToPlay && soundOption) {
      // Set source and start loading
      audioToPlay.src = soundOption.url;
      audioToPlay.load();
      
      // Small delay to ensure browser starts loading the audio
      setTimeout(() => {
        const playPromise = audioToPlay.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(soundId);
              setLoadingSound(null);
            })
            .catch((error) => {
              console.error("Error playing audio:", error);
              setLoadingSound(null);
              setLoadErrors(prev => ({...prev, [soundId]: true}));
              
              toast({
                title: "Playback Error",
                description: "Failed to play the audio. Please try another sound.",
                variant: "destructive",
              });
            });
        }
      }, 200);
    }
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
                    disabled={loadingSound !== null}
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
