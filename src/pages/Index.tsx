
import { useState, useEffect } from "react";
import { getPrayerTimes, getDateForHeader, PrayerTime } from "@/services/prayerTimeService";
import PrayerCard from "@/components/PrayerCard";
import { Loader2, CalendarDays, Clock } from "lucide-react";

const Index = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load prayer times
  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      const times = await getPrayerTimes();
      setPrayerTimes(times);
      const formattedDate = await getDateForHeader();
      setCurrentDate(formattedDate);
    } catch (error) {
      console.error("Error loading prayer times:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadPrayerTimes();
  }, []);
  
  // Update prayer times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      loadPrayerTimes();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Check if today is Friday
  const isFriday = () => {
    const today = new Date();
    return today.getDay() === 5;
  };
  
  return (
    <div className="flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      ) : (
        <>
          <div className="bg-gradient-purple rounded-2xl p-6 text-white mb-6 shadow-lg">
            <h2 className="font-medium text-lg mb-4">Today's Prayer Times</h2>
            <div className="flex flex-wrap justify-between">
              {prayerTimes.map((prayer) => (
                <div key={prayer.id} className="mb-3 text-center w-1/3">
                  <p className="text-xs opacity-80">{prayer.name}</p>
                  <p className="font-semibold">{prayer.time}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3 text-foreground">Prayer Schedule</h2>
            {prayerTimes.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} />
            ))}
          </div>

          {isFriday() && (
            <div className="bg-prayer-primary/10 dark:bg-prayer-primary/20 rounded-lg p-4 mb-4 border border-prayer-primary/20 dark:border-prayer-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-5 w-5 text-prayer-primary" />
                <h3 className="font-semibold text-lg text-foreground">Jumaa Prayer</h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-prayer-primary" />
                  <p className="text-muted-foreground">Prayer time: <span className="font-medium text-foreground">13:30</span></p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Join us for Friday prayer (Salat al-Jumaa) at the mosque. Remember to arrive early for the khutbah.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
