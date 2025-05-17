
import { useState, useEffect } from "react";
import { getPrayerTimes, getDateForHeader, PrayerTime } from "@/services/prayerTimeService";
import PrayerCard from "@/components/PrayerCard";
import { Loader2 } from "lucide-react";

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
            <h2 className="font-semibold text-xl mb-3">Prayer Schedule</h2>
            {prayerTimes.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
