
import React, { useState, useEffect } from "react";
import { PrayerTime } from "@/services/prayerTimeService";
import { cn } from "@/lib/utils";
import { Bell, VolumeX } from "lucide-react";
import AdhanSoundModal from "./AdhanSoundModal";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const STORAGE_KEY_PREFIX = "prayer_adhan_";

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | undefined>(undefined);

  // Load saved sound preference from localStorage on component mount
  useEffect(() => {
    const savedSound = localStorage.getItem(`${STORAGE_KEY_PREFIX}${prayer.id}`);
    if (savedSound) {
      setSelectedSound(savedSound);
    }
  }, [prayer.id]);

  const isPast = () => {
    const now = new Date();
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    return now > prayerDate;
  };

  const past = isPast() && !prayer.isNext;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectSound = (soundId: string) => {
    setSelectedSound(soundId);
    // Save to localStorage for persistence
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${prayer.id}`, soundId);
    console.log(`Selected sound ${soundId} for prayer ${prayer.name}`);
  };

  const getNotificationIcon = () => {
    if (selectedSound === "silent-notification") {
      return <VolumeX size={20} className="text-prayer-primary" />;
    }
    return <Bell size={20} className={selectedSound ? "text-prayer-primary" : ""} />;
  };

  return (
    <div 
      className={cn(
        "prayer-card flex justify-between items-center mb-3 p-3 rounded-lg animate-fade-in",
        prayer.isNext && "border-l-4 border-prayer-primary bg-gradient-light",
        past && "opacity-70"
      )}
      style={{ animationDelay: `${Number(prayer.id.charCodeAt(0)) % 5 * 0.1}s` }}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <h3 className="font-semibold text-base">{prayer.name}</h3>
          {prayer.isNext && (
            <span className="prayer-badge ml-2 animate-pulse-gentle bg-prayer-light text-prayer-primary px-2 py-0.5 rounded-full text-xs">Next</span>
          )}
        </div>
        <p className="prayer-time">{prayer.time}</p>
      </div>
      
      <button 
        className={cn(
          "rounded-full p-2 transition-colors",
          selectedSound ? "bg-prayer-light text-prayer-primary" : "hover:bg-prayer-light text-prayer-primary"
        )}
        aria-label={`Set notification for ${prayer.name}`}
        onClick={handleOpenModal}
      >
        {getNotificationIcon()}
      </button>

      <AdhanSoundModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prayerName={prayer.name}
        onSelect={handleSelectSound}
        selectedSoundId={selectedSound}
      />
    </div>
  );
};

export default PrayerCard;
