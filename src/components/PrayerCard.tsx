
import React, { useState, useEffect } from "react";
import { PrayerTime } from "@/services/prayerTimeService";
import { cn } from "@/lib/utils";
import { Bell, BellOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AdhanSoundModal from "./AdhanSoundModal";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const STORAGE_KEY_PREFIX = "prayer_adhan_";
const NOTIFICATION_TOGGLE_PREFIX = "prayer-notification-";

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | undefined>("traditional-adhan");
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  // Load saved preferences from localStorage on component mount
  useEffect(() => {
    try {
      if (!prayer?.id) {
        console.warn("PrayerCard received prayer without id:", prayer);
        return;
      }
      
      // Load sound preference
      const savedSound = localStorage.getItem(`${STORAGE_KEY_PREFIX}${prayer.id}`);
      console.log(`Loaded sound preference for ${prayer.id}:`, savedSound);
      
      if (savedSound) {
        setSelectedSound(savedSound);
      }

      // Load notification toggle state
      const savedNotificationState = localStorage.getItem(`${NOTIFICATION_TOGGLE_PREFIX}${prayer.id}`);
      if (savedNotificationState !== null) {
        setNotificationEnabled(savedNotificationState === 'true');
      }
    } catch (error) {
      console.error("Error loading prayer preferences:", error);
    }
  }, [prayer?.id]);

  const isPast = () => {
    try {
      if (!prayer?.time || typeof prayer.time !== 'string') {
        console.warn("isPast called with invalid prayer time:", prayer?.time);
        return false;
      }
      
      const now = new Date();
      const timeParts = prayer.time.split(":");
      
      if (timeParts.length !== 2) {
        console.warn("Invalid time format:", prayer.time);
        return false;
      }
      
      const [hours, minutes] = timeParts.map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn("Invalid time values:", { hours, minutes, originalTime: prayer.time });
        return false;
      }
      
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);
      return now > prayerDate;
    } catch (error) {
      console.error("Error in isPast calculation:", error, "Prayer:", prayer);
      return false;
    }
  };

  // Safety check for prayer object
  if (!prayer) {
    console.error("PrayerCard received null/undefined prayer");
    return null;
  }

  const past = isPast() && !prayer.isNext;

  const handleOpenModal = () => {
    console.log("Opening adhan modal for prayer:", prayer.name);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing adhan modal");
    setIsModalOpen(false);
  };

  const handleSelectSound = (soundId: string) => {
    try {
      if (!prayer?.id || !soundId) {
        console.error("Invalid parameters for handleSelectSound:", { prayerId: prayer?.id, soundId });
        return;
      }
      
      setSelectedSound(soundId);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${prayer.id}`, soundId);
      console.log(`Selected sound ${soundId} for prayer ${prayer.name}`);
    } catch (error) {
      console.error("Error saving sound preference:", error);
    }
  };

  const handleNotificationToggle = (enabled: boolean) => {
    try {
      if (!prayer?.id) {
        console.error("Cannot toggle notification: prayer id is missing");
        return;
      }
      
      setNotificationEnabled(enabled);
      localStorage.setItem(`${NOTIFICATION_TOGGLE_PREFIX}${prayer.id}`, enabled.toString());
      console.log(`Notification ${enabled ? 'enabled' : 'disabled'} for prayer ${prayer.name}`);
    } catch (error) {
      console.error("Error saving notification preference:", error);
    }
  };

  const prayerName = prayer.name || "Unknown Prayer";
  const prayerTime = prayer.time || "00:00";

  return (
    <div 
      className={cn(
        "prayer-card flex justify-between items-center mb-3 p-3 rounded-lg animate-fade-in relative overflow-hidden",
        prayer.isNext && "bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-900/20",
        past && "opacity-70"
      )}
      style={{ animationDelay: `${(prayer.id?.charCodeAt(0) || 0) % 5 * 0.1}s` }}
    >
      {prayer.isNext && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 animate-pulse"></div>
      )}
      
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <h3 className="font-semibold text-base text-foreground">{prayerName}</h3>
          {prayer.isNext && (
            <span className="ml-2 animate-pulse bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium">Next</span>
          )}
        </div>
        <p className="font-medium text-lg md:text-xl text-prayer-primary">{prayerTime}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Notification Toggle Switch */}
        <div className="flex items-center gap-1">
          <Switch
            checked={notificationEnabled}
            onCheckedChange={handleNotificationToggle}
            className="scale-75"
          />
          {notificationEnabled ? (
            <Bell size={16} className="text-prayer-primary" />
          ) : (
            <BellOff size={16} className="text-muted-foreground" />
          )}
        </div>

        {/* Sound Selection Button */}
        <button 
          className={cn(
            "rounded-full p-2 transition-colors hover:bg-accent",
            selectedSound && notificationEnabled ? "bg-prayer-light text-prayer-primary" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`Set notification sound for ${prayerName}`}
          onClick={handleOpenModal}
          disabled={!notificationEnabled}
        >
          <Bell size={20} className={selectedSound && notificationEnabled ? "text-prayer-primary" : ""} />
        </button>
      </div>

      <AdhanSoundModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prayerName={prayerName}
        onSelect={handleSelectSound}
        selectedSoundId={selectedSound}
      />
    </div>
  );
};

export default PrayerCard;
