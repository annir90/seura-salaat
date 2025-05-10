
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getPrayerTimes, PrayerTime } from "@/services/prayerTimeService";
import PrayerCard from "@/components/PrayerCard";
import { Loader2 } from "lucide-react";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadPrayerTimes = async (date: Date) => {
    try {
      setLoading(true);
      const times = await getPrayerTimes(date);
      setPrayerTimes(times);
    } catch (error) {
      console.error("Error loading prayer times:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedDate) {
      loadPrayerTimes(selectedDate);
    }
  }, [selectedDate]);
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Prayer Calendar</h1>
      
      <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          className="p-3 pointer-events-auto"
        />
      </div>
      
      <div className="mb-6">
        <h2 className="font-semibold text-xl mb-3">
          Prayer Times for {formatDate(selectedDate)}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
          </div>
        ) : (
          prayerTimes.map((prayer) => (
            <PrayerCard key={prayer.id} prayer={prayer} />
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
