
import React, { useState, useEffect } from "react";
import { PrayerTime } from "@/services/prayerTimeService";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import AdhanSoundModal from "./AdhanSoundModal";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const STORAGE_KEY_PREFIX = "prayer_adhan_";

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | undefined>("traditional-adhan");

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
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${prayer.id}`, soundId);
    console.log(`Selected sound ${soundId} for prayer ${prayer.name}`);
  };

  return (
    <div 
      className={cn(
        "prayer-card flex justify-between items-center mb-3 p-3 rounded-lg animate-fade-in",
        prayer.isNext && "border-l-4 border-orange-500 bg-gradient-to-r from-orange-50/30 to-transparent dark:from-orange-900/20",
        past && "opacity-70"
      )}
      style={{ animationDelay: `${Number(prayer.id.charCodeAt(0)) % 5 * 0.1}s` }}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <h3 className="font-semibold text-base text-foreground">{prayer.name}</h3>
          {prayer.isNext && (
            <span className="ml-2 animate-pulse-gentle bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium">Next</span>
          )}
        </div>
        <p className={cn(
          "font-medium text-lg md:text-xl",
          prayer.isNext ? "text-orange-600 dark:text-orange-400" : "text-prayer-primary"
        )}>{prayer.time}</p>
      </div>
      
      <button 
        className={cn(
          "rounded-full p-2 transition-colors hover:bg-accent",
          prayer.isNext && "border-2 border-orange-500",
          selectedSound ? "bg-prayer-light text-prayer-primary" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label={`Set notification for ${prayer.name}`}
        onClick={handleOpenModal}
      >
        <Bell size={20} className={selectedSound ? "text-prayer-primary" : ""} />
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
