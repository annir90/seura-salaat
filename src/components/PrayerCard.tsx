
import { PrayerTime } from "@/services/prayerTimeService";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const isPast = () => {
    const now = new Date();
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    return now > prayerDate;
  };

  const past = isPast() && !prayer.isNext;

  return (
    <div 
      className={cn(
        "prayer-card flex justify-between items-center mb-3 animate-fade-in",
        prayer.isNext && "border-l-4 border-prayer-primary bg-gradient-light",
        past && "opacity-70"
      )}
      style={{ animationDelay: `${Number(prayer.id.charCodeAt(0)) % 5 * 0.1}s` }}
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-1">
          <h3 className="font-semibold text-base">{prayer.name}</h3>
          {prayer.isNext && (
            <span className="prayer-badge ml-2 animate-pulse-gentle">Next</span>
          )}
        </div>
        <p className="prayer-time">{prayer.time}</p>
      </div>
      
      <button 
        className={cn(
          "rounded-full p-2 transition-colors",
          "hover:bg-prayer-light text-prayer-primary"
        )}
        aria-label={`Set notification for ${prayer.name}`}
      >
        <Bell className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PrayerCard;
