
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdhanSoundModal from "./AdhanSoundModal";
import { PrayerTime } from "@/services/prayerTimeService";
import { getTranslation } from "@/services/translationService";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const [showSoundModal, setShowSoundModal] = useState(false);
  const t = getTranslation();

  // Get current settings for this prayer
  const getNotificationEnabled = () => {
    const globalEnabled = localStorage.getItem('prayer-notifications-enabled') !== 'false';
    const prayerEnabled = localStorage.getItem(`prayer-notification-${prayer.id}`) !== 'false';
    return globalEnabled && prayerEnabled;
  };

  const getNotificationTiming = () => {
    return localStorage.getItem(`prayer-timing-${prayer.id}`) || '10';
  };

  const getSelectedSound = () => {
    return localStorage.getItem(`prayer_adhan_${prayer.id}`) || 'adhan-traditional';
  };

  const handleSoundSelect = (soundId: string) => {
    localStorage.setItem(`prayer_adhan_${prayer.id}`, soundId);
    console.log(`Sound selected for ${prayer.name}: ${soundId}`);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    localStorage.setItem(`prayer-notification-${prayer.id}`, enabled.toString());
  };

  const handleTimingChange = (timing: string) => {
    localStorage.setItem(`prayer-timing-${prayer.id}`, timing);
  };

  return (
    <>
      <Card className={`mb-4 ${prayer.isNext ? 'border-l-4 border-l-orange-500' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-prayer-primary" />
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {prayer.name}
                    {prayer.isNext && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs animate-pulse">
                        Next
                      </Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground">{prayer.time}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSoundModal(true)}
              >
                <Volume2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdhanSoundModal
        isOpen={showSoundModal}
        onClose={() => setShowSoundModal(false)}
        prayerName={prayer.name}
        onSelect={handleSoundSelect}
        selectedSoundId={getSelectedSound()}
        notificationEnabled={getNotificationEnabled()}
        onNotificationToggle={handleNotificationToggle}
        notificationTiming={getNotificationTiming()}
        onTimingChange={handleTimingChange}
      />
    </>
  );
};

export default PrayerCard;
