
import { useState, useEffect } from "react";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { soundOptions } from "@/components/sound/soundOptions";
import { useSoundPlayer } from "@/components/sound/useSoundPlayer";
import SoundOptionItem from "@/components/sound/SoundOptionItem";

const SoundSettingsPage = () => {
  const [selectedSoundId, setSelectedSoundId] = useState<string>('adhan');
  const { playingSound, playSound, stopCurrentAudio } = useSoundPlayer();

  useEffect(() => {
    // Load saved sound preference
    const savedSound = localStorage.getItem('prayerapp-notification-sound');
    if (savedSound) {
      setSelectedSoundId(savedSound);
    }
  }, []);

  const handleSoundSelect = (soundId: string) => {
    console.log(`Global sound preference set to: ${soundId}`);
    
    // Map the sound IDs to the expected format
    let mappedSoundId = soundId;
    if (soundId === 'adhan-traditional') {
      mappedSoundId = 'adhan';
    } else if (soundId === 'adhan-soft') {
      mappedSoundId = 'soft';
    } else if (soundId === 'notification-beep') {
      mappedSoundId = 'beep';
    }
    
    setSelectedSoundId(soundId);
    localStorage.setItem('prayerapp-notification-sound', mappedSoundId);
    
    toast({
      title: "Sound Updated",
      description: "Your notification sound preference has been saved.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/settings" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Notification Sound</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-prayer-primary" />
                Choose Your Sound
              </CardTitle>
              <CardDescription>
                Select the sound that will be used for all prayer notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {soundOptions.map((soundOption) => (
                  <SoundOptionItem
                    key={soundOption.id}
                    soundOption={soundOption}
                    selectedSoundId={selectedSoundId}
                    playingSound={playingSound}
                    onSelect={handleSoundSelect}
                    onPlay={playSound}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SoundSettingsPage;
