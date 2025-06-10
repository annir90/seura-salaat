import React, { useState, useEffect } from "react";
import { PrayerTime } from "@/services/prayerTimeService";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import AdhanSoundModal from "./AdhanSoundModal";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const STORAGE_KEY_PREFIX = "prayer_adhan_";
const NOTIFICATION_TOGGLE_PREFIX = "prayer-notification-";

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | undefined>("traditional-adhan");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  // Set up prayer reminder when component mounts or settings change
  useEffect(() => {
    if (notificationEnabled && selectedSound && prayer?.time && prayer?.id) {
      setupPrayerReminder();
    }
  }, [notificationEnabled, selectedSound, prayer?.time, prayer?.id]);

  const setupPrayerReminder = async () => {
    try {
      console.log(`Setting up reminder for ${prayer.name} prayer`);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission denied');
          return;
        }
      }

      if (Notification.permission !== 'granted') {
        console.log('Notifications not permitted');
        return;
      }

      // Get notification timing from settings
      const notificationTimingSetting = localStorage.getItem('prayer-notification-timing') || "5";
      const timingMinutes = parseInt(notificationTimingSetting, 10);
      
      // Parse prayer time
      const [hours, minutes] = prayer.time.split(':').map(Number);
      
      // Calculate notification time (minutes before prayer)
      const now = new Date();
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes - timingMinutes, 0, 0);
      
      // If the reminder time has passed for today, skip
      if (prayerDate <= now) {
        console.log(`Prayer reminder time has passed for ${prayer.name}`);
        return;
      }
      
      const delay = prayerDate.getTime() - now.getTime();
      console.log(`Scheduling ${prayer.name} reminder in ${delay}ms`);
      
      // Clear any existing timeout for this prayer
      const existingTimeoutId = localStorage.getItem(`timeout_${prayer.id}`);
      if (existingTimeoutId) {
        clearTimeout(parseInt(existingTimeoutId));
      }
      
      // Schedule the reminder
      const timeoutId = setTimeout(async () => {
        console.log(`Playing ${prayer.name} prayer reminder`);
        
        // Show notification
        const notification = new Notification(`${prayer.name} Prayer Reminder`, {
          body: `${prayer.name} prayer is in ${timingMinutes} minutes at ${prayer.time}`,
          icon: '/favicon.ico',
          tag: `prayer-${prayer.id}`,
          requireInteraction: true
        });
        
        // Play sound
        try {
          const audio = new Audio(`/audio/${selectedSound}.mp3`);
          audio.volume = 0.8;
          await audio.play();
          console.log(`Successfully played ${selectedSound} for ${prayer.name}`);
        } catch (error) {
          console.error('Error playing prayer sound:', error);
        }
        
        // Clean up
        localStorage.removeItem(`timeout_${prayer.id}`);
      }, delay);
      
      // Store timeout ID for cleanup
      localStorage.setItem(`timeout_${prayer.id}`, timeoutId.toString());
      
    } catch (error) {
      console.error('Error setting up prayer reminder:', error);
    }
  };

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
      
      // Re-setup reminder with new sound
      if (notificationEnabled) {
        setupPrayerReminder();
      }
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
      
      if (enabled) {
        setupPrayerReminder();
      } else {
        // Clear existing timeout
        const existingTimeoutId = localStorage.getItem(`timeout_${prayer.id}`);
        if (existingTimeoutId) {
          clearTimeout(parseInt(existingTimeoutId));
          localStorage.removeItem(`timeout_${prayer.id}`);
        }
      }
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
        <Button 
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full",
            selectedSound && notificationEnabled 
              ? "bg-prayer-primary/10 text-prayer-primary hover:bg-prayer-primary/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          aria-label={`Prayer notification settings for ${prayerName}`}
          onClick={() => setIsModalOpen(true)}
        >
          <Bell 
            size={20} 
            className={cn(
              selectedSound && notificationEnabled ? "text-prayer-primary" : "text-muted-foreground"
            )}
          />
        </Button>
      </div>

      <AdhanSoundModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prayerName={prayerName}
        onSelect={handleSelectSound}
        selectedSoundId={selectedSound}
        notificationEnabled={notificationEnabled}
        onNotificationToggle={handleNotificationToggle}
      />
    </div>
  );
};

export default PrayerCard;
