
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getPrayerTimes, PrayerTime } from "@/services/prayerTimeService";
import { Loader2 } from "lucide-react";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleDateChange = async (date: Date | undefined) => {
    setSelectedDate(date);
    
    if (date) {
      setLoading(true);
      try {
        const times = await getPrayerTimes(date);
        setPrayerTimes(times);
      } catch (error) {
        console.error("Error loading prayer times for selected date:", error);
        setPrayerTimes([]);
      } finally {
        setLoading(false);
      }
    } else {
      setPrayerTimes([]);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">Prayer Calendar</h1>
      
      <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 mb-6 border border-border">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          className="p-3 pointer-events-auto"
        />
      </div>
      
      {selectedDate && (
        <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 border border-border">
          <h2 className="font-semibold text-lg mb-4 text-foreground">
            Prayer Times for {formatDate(selectedDate)}
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-prayer-primary" />
            </div>
          ) : prayerTimes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {prayerTimes.map((prayer) => (
                <div key={prayer.id} className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">{prayer.name}</p>
                  <p className="text-lg font-semibold text-prayer-primary">{prayer.time}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No prayer times available for this date
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
