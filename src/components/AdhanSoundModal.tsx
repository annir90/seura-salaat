
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle, Play, Pause, Bell, Upload } from "lucide-react";
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

// Default audio options with local files
const DEFAULT_ADHAN_OPTIONS: AdhanSoundOption[] = [
  {
    id: "traditional-adhan",
    name: "Traditional Adhan",
    url: "/audio/traditional-adhan.mp3",
    icon: <Bell size={20} />,
  },
  {
    id: "adhan-makkah",
    name: "Makkah Adhan",
    url: "/audio/makkah-adhan.mp3",
    icon: <Bell size={20} />,
  },
  {
    id: "ringtone",
    name: "Soft Reminder",
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
  const [customSounds, setCustomSounds] = useState<AdhanSoundOption[]>([]);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const { toast } = useToast();

  // Combine default and custom sounds
  const allSounds = [...DEFAULT_ADHAN_OPTIONS, ...customSounds];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopAllSounds();
      return;
    }
    
    setLoadErrors({});
    loadCustomSounds();
    
    return () => {
      stopAllSounds();
    };
  }, [isOpen]);

  // Load custom sounds from localStorage
  const loadCustomSounds = () => {
    try {
      const saved = localStorage.getItem('custom-adhan-sounds');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomSounds(parsed);
      }
    } catch (error) {
      console.error('Error loading custom sounds:', error);
    }
  };

  // Save custom sounds to localStorage
  const saveCustomSounds = (sounds: AdhanSoundOption[]) => {
    try {
      localStorage.setItem('custom-adhan-sounds', JSON.stringify(sounds));
      setCustomSounds(sounds);
    } catch (error) {
      console.error('Error saving custom sounds:', error);
      toast({
        title: "Storage Error",
        description: "Could not save custom sound. Storage may be full.",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid File",
        description: "Please select an audio file (MP3, WAV, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const audioUrl = e.target?.result as string;
      const newSound: AdhanSoundOption = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        url: audioUrl,
        icon: <Upload size={20} />
      };

      const updatedCustomSounds = [...customSounds, newSound];
      saveCustomSounds(updatedCustomSounds);
      
      toast({
        title: "Audio Added",
        description: `${newSound.name} has been added to your custom sounds`,
      });
    };

    reader.onerror = () => {
      toast({
        title: "Upload Error",
        description: "Could not read the audio file",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
    
    // Reset input
    event.target.value = '';
  };

  // Remove custom sound
  const removeCustomSound = (soundId: string) => {
    const updatedSounds = customSounds.filter(sound => sound.id !== soundId);
    saveCustomSounds(updatedSounds);
    
    // Stop playing if this sound was playing
    if (isPlaying === soundId) {
      stopAllSounds();
    }
    
    toast({
      title: "Sound Removed",
      description: "Custom sound has been removed",
    });
  };

  const stopAllSounds = () => {
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
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
    const soundOption = allSounds.find(o => o.id === soundId);
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
      const audio = new Audio(soundOption.url);
      
      // Set up event handlers
      audio.addEventListener("ended", () => {
        setIsPlaying(null);
      });
      
      audio.addEventListener("error", (e) => {
        console.error(`Error with ${soundOption.name} audio:`, e);
        handlePlaybackError(soundId, soundOption.name);
      });
      
      // Set explicit volume
      audio.volume = 1.0;
      
      // Store reference and start playing
      audioRefs.current[soundId] = audio;
      
      // Play the audio
      audio.play().catch(e => {
        console.error(`Playback failed for ${soundOption.name}:`, e);
        handlePlaybackError(soundId, soundOption.name);
      });
    } catch (error) {
      console.error(`General error playing ${soundOption.name}:`, error);
      handlePlaybackError(soundId, soundOption.name);
    }
  };
  
  const handlePlaybackError = (soundId: string, soundName: string) => {
    setLoadErrors(prev => ({...prev, [soundId]: true}));
    setIsPlaying(null);
    
    toast({
      title: "Audio Playback Issue",
      description: `Unable to play ${soundName}. Please check if the audio file is available.`,
      variant: "destructive",
    });
  };

  const handleSelect = (soundId: string) => {
    onSelect(soundId);
    
    const selectedOption = allSounds.find(o => o.id === soundId);
    toast({
      title: "Notification Setting Updated",
      description: `${prayerName} will use ${selectedOption?.name} notifications`,
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Choose Notification Sound</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a sound for prayer notifications. Preview options before selecting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* File upload section */}
          <div className="border-2 border-dashed border-border rounded-lg p-4">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Add your own audio file</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button variant="outline" size="sm" className="text-xs">
                  Choose Audio File
                </Button>
              </label>
            </div>
          </div>

          {/* Sound options */}
          {allSounds.map((option) => {
            const isSelected = selectedSoundId === option.id;
            const hasError = loadErrors[option.id];
            const isCurrentlyPlaying = isPlaying === option.id;
            const isCustom = option.id.startsWith('custom-');
            
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
                      {isCustom && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
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
                    
                    {isCustom && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs px-2 h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeCustomSound(option.id)}
                      >
                        ×
                      </Button>
                    )}
                    
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
