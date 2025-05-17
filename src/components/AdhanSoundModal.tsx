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

// Updated with completely new reliable audio sources
const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    // Using a shorter, more reliably hosted mp3 file
    url: "https://www.islamcan.com/audio/adhan/azan1.mp3", 
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "gentle-notification",
    name: "Gentle Notification",
    url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=simple-notification-152054.mp3",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "ringtone",
    name: "Ringtone",
    url: "https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c1087c.mp3",
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

  // Create audio elements only once when component mounts with improved initialization
  useEffect(() => {
    ADHAN_OPTIONS.forEach((option) => {
      // Only create if it doesn't exist yet
      if (!audioRefs.current[option.id]) {
        const audio = new Audio();
        audio.preload = "metadata"; // Lighter preload option for better performance
        
        // Setup event handlers
        audio.onended = () => {
          setIsPlaying(null);
        };
        
        audio.onerror = (e) => {
          console.error("Audio error:", option.name, e);
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
      // Reset any previous state
      audioToPlay.pause();
      audioToPlay.currentTime = 0;
      
      // Set source and start loading
      audioToPlay.src = soundOption.url;
      audioToPlay.load();
      
      // Use a try-catch block to handle playback errors better
      try {
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
      } catch (error) {
        console.error("Error attempting to play audio:", error);
        setLoadingSound(null);
        setLoadErrors(prev => ({...prev, [soundId]: true}));
        
        toast({
          title: "Audio Error",
          description: "There was a problem playing this sound.",
          variant: "destructive",
        });
      }
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
