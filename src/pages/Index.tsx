
import { useState, useEffect } from "react";
import { getPrayerTimes, getDateForHeader } from "@/services/prayerTimeService";
import PrayerCard from "@/components/PrayerCard";

const Index = () => {
  const [currentDate, setCurrentDate] = useState(getDateForHeader());
  const [prayerTimes, setPrayerTimes] = useState(getPrayerTimes());
  
  // Update prayer times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setPrayerTimes(getPrayerTimes());
      setCurrentDate(getDateForHeader());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-1">PrayConnect</h1>
        <p className="text-muted-foreground">{currentDate}</p>
      </div>
      
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
    </div>
  );
};

export default Index;
