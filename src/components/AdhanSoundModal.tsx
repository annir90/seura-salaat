import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, AlertTriangle, Play, Pause, Bell, BellRing, Clock, AlarmClock } from "lucide-react";
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

// Updated with more prayer-suitable notification sounds
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "simple-beep",
    name: "Simple Beep",
    url: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "notification",
    name: "Notification Sound",
    url: "https://assets.mixkit.co/active_storage/sfx/1513/1513-preview.mp3",
    icon: <BellRing className="h-5 w-5" />,
  },
  {
    id: "gentle-chime",
    name: "Gentle Chime",
    url: "https://assets.mixkit.co/active_storage/sfx/2514/2514-preview.mp3",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "calm-bell",
    name: "Calm Bell",
    url: "https://assets.mixkit.co/active_storage/sfx/3005/3005-preview.mp3",
    icon: <AlarmClock className="h-5 w-5" />,
  },
  {
    id: "soft-alert",
    name: "Soft Alert",
    url: "https://assets.mixkit.co/active_storage/sfx/1860/1860-preview.mp3",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "minimal-tone",
    name: "Minimal Tone",
    url: "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3",
    icon: <BellRing className="h-5 w-5" />,
  },
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

  // Initialize audio elements when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Stop all sounds when modal closes
      stopAllSounds();
      return;
    }
    
    // Create fresh audio elements each time the modal opens
    const newAudioRefs: { [key: string]: HTMLAudioElement } = {};
    
    ADHAN_OPTIONS.forEach((option) => {
      const audio = new Audio();
      audio.preload = "none"; // Don't preload automatically
      audio.src = option.url; // Set source immediately for faster loading when requested
      
      audio.onended = () => {
        setIsPlaying(null);
      };
      
      audio.onerror = () => {
        console.error("Error with audio:", option.name);
        setIsPlaying(null);
        setLoadingSound(null);
        
        // Update load errors
        setLoadErrors(prev => ({...prev, [option.id]: true}));
        
        toast({
          title: "Sound Error",
          description: `Could not play ${option.name}. Please try another sound.`,
          variant: "destructive",
        });
      };
      
      newAudioRefs[option.id] = audio;
    });
    
    audioRefs.current = newAudioRefs;
    
    // Reset errors when modal opens
    setLoadErrors({});
    
    return () => {
      // Clean up audio elements when component unmounts or modal closes
      stopAllSounds();
      Object.values(newAudioRefs).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, [isOpen, toast]);

  const stopAllSounds = () => {
    // Stop any playing sounds
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
    if (audioToPlay) {
      // Make sure it's loaded with the current source
      if (!audioToPlay.src.includes(ADHAN_OPTIONS.find(o => o.id === soundId)?.url || '')) {
        const option = ADHAN_OPTIONS.find(o => o.id === soundId);
        if (option) {
          audioToPlay.src = option.url;
        }
      }
      
      audioToPlay.load(); // Explicitly load the audio
      
      audioToPlay.play()
        .then(() => {
          setIsPlaying(soundId);
          setLoadingSound(null);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setLoadingSound(null);
          
          // Update load errors
          setLoadErrors(prev => ({...prev, [soundId]: true}));
          
          toast({
            title: "Playback Error",
            description: "Failed to play the audio. Please try another sound or check your device settings.",
            variant: "destructive",
          });
        });
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
