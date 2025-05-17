
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AdhanSoundOption {
  id: string;
  name: string;
  url: string;
}

interface AdhanSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  onSelect: (soundId: string) => void;
  selectedSoundId?: string;
}

const ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "makkah",
    name: "Adhan Makkah",
    url: "https://islamic-audio.vercel.app/audio/adhan_makkah.mp3",
  },
  {
    id: "madinah",
    name: "Adhan Madinah",
    url: "https://islamic-audio.vercel.app/audio/adhan_madinah.mp3",
  },
];

const AdhanSoundModal: React.FC<AdhanSoundModalProps> = ({
  isOpen,
  onClose,
  prayerName,
  onSelect,
  selectedSoundId,
}) => {
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement | null }>({});
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize audio elements
  useEffect(() => {
    const elements: { [key: string]: HTMLAudioElement } = {};
    
    ADHAN_OPTIONS.forEach((option) => {
      const audio = new Audio(option.url);
      audio.preload = "none"; // Only load when play is pressed
      
      audio.onended = () => {
        setIsPlaying(null);
      };
      
      audio.onerror = () => {
        setIsPlaying(null);
        toast({
          title: "Error playing sound",
          description: `Could not play ${option.name}. Please try again.`,
          variant: "destructive",
        });
      };
      
      elements[option.id] = audio;
    });
    
    setAudioElements(elements);
    
    // Cleanup function to stop and remove audio elements
    return () => {
      Object.values(elements).forEach((audio) => {
        if (audio) {
          audio.pause();
          audio.src = "";
        }
      });
    };
  }, [toast]);

  const playSound = (soundId: string) => {
    // Stop any currently playing audio
    Object.values(audioElements).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    const audioToPlay = audioElements[soundId];
    if (audioToPlay) {
      audioToPlay.currentTime = 0;
      audioToPlay.play()
        .then(() => {
          setIsPlaying(soundId);
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Failed to play the audio. Please try again.",
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
                  {selectedSoundId === option.id && (
                    <Check className="h-4 w-4 text-prayer-primary" />
                  )}
                  <span className="font-medium">{option.name}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => playSound(option.id)}
                    disabled={isPlaying === option.id}
                  >
                    <Volume2 className="h-4 w-4" />
                    {isPlaying === option.id ? "Playing..." : "Listen"}
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
