
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertTriangle, Play, Pause, Bell, Clock, Music } from "lucide-react";
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

// Updated with working audio sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_9bea15384a.mp3",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "gentle-notification",
    name: "Gentle Notification",
    url: "https://assets.mixkit.co/active_storage/sfx/2869/2869.wav",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "ringtone",
    name: "Ringtone",
    url: "https://cdn.pixabay.com/audio/2022/10/30/audio_23d59a963c.mp3",
    icon: <Music className="h-5 w-5" />,
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

  // Initialize audio objects when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopAllSounds();
      return;
    }

    // Reset errors when opening the modal
    setLoadErrors({});
    
    // Pre-create audio elements for each option, but don't load audio yet
    ADHAN_OPTIONS.forEach((option) => {
      if (!audioRefs.current[option.id]) {
        const audio = new Audio();
        
        audio.onended = () => setIsPlaying(null);
        
        audio.onerror = (e) => {
          console.error(`Error loading audio for ${option.name}:`, e);
          setIsPlaying(null);
          setLoadingSound(null);
          setLoadErrors(prev => ({...prev, [option.id]: true}));
          
          toast({
            title: "Audio Error",
            description: `Couldn't load the ${option.name} sound. Please try another option.`,
            variant: "destructive",
          });
        };
        
        audioRefs.current[option.id] = audio;
      }
    });

    return () => {
      // Clean up only when modal closes
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

  const toggleSound = async (soundId: string) => {
    // If this sound is already playing, stop it
    if (isPlaying === soundId) {
      stopAllSounds();
      return;
    }
    
    // Stop any other playing sounds first
    stopAllSounds();
    
    // Start loading and playing the selected sound
    setLoadingSound(soundId);
    
    const audioToPlay = audioRefs.current[soundId];
    const soundOption = ADHAN_OPTIONS.find(o => o.id === soundId);
    
    if (audioToPlay && soundOption) {
      try {
        // Reset any previous state
        audioToPlay.pause();
        
        try {
          audioToPlay.currentTime = 0;
        } catch (e) {
          // Ignore errors when setting currentTime on unloaded audio
        }
        
        // Set source
        audioToPlay.src = soundOption.url;
        
        // Start loading the audio
        audioToPlay.load();
        
        try {
          // Try to play immediately
          await audioToPlay.play();
          setIsPlaying(soundId);
          setLoadingSound(null);
        } catch (playError) {
          // If immediate play fails, wait for canplaythrough event
          audioToPlay.addEventListener('canplaythrough', async function onCanPlay() {
            audioToPlay.removeEventListener('canplaythrough', onCanPlay);
            try {
              await audioToPlay.play();
              setIsPlaying(soundId);
              setLoadingSound(null);
            } catch (error) {
              console.error("Play failed after canplaythrough:", error);
              handlePlaybackError(soundId, soundOption.name);
            }
          }, { once: true });
          
          // Set a timeout in case canplaythrough never fires
          setTimeout(() => {
            if (loadingSound === soundId) {
              console.log("Timeout while loading audio");
              handlePlaybackError(soundId, soundOption.name);
            }
          }, 5000);
        }
      } catch (error) {
        console.error("Error in audio setup:", error);
        handlePlaybackError(soundId, soundOption.name);
      }
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
