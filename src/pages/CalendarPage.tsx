
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getPrayerTimes, PrayerTime } from "@/services/prayerTimeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Loader2, CalendarDays } from "lucide-react";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  // Load prayer times when date changes
  useEffect(() => {
    const loadPrayerTimes = async () => {
      if (!selectedDate) {
        setPrayerTimes([]);
        return;
      }
      
      setLoading(true);
      try {
        const times = await getPrayerTimes(selectedDate);
        setPrayerTimes(times);
      } catch (error) {
        console.error("Error loading prayer times for selected date:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPrayerTimes();
  }, [selectedDate]);
  
  const formatSelectedDate = (date: Date | undefined) => {
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
      <h1 className="text-2xl font-bold mb-6 text-foreground">Prayer Calendar</h1>
      
      <div className="bg-card text-card-foreground rounded-2xl shadow-md p-4 mb-6 border border-border">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateChange}
          className="p-3 pointer-events-auto"
        />
      </div>
      
      {!selectedDate ? (
        <Card className="bg-card text-card-foreground border border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Choose the day you want to know!</h3>
            <p className="text-muted-foreground text-center">Select a date from the calendar above to view prayer times for that day.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-prayer-primary" />
              Prayer Times for {formatSelectedDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-prayer-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {prayerTimes.map((prayer) => (
                  <div 
                    key={prayer.id} 
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      prayer.isNext 
                        ? 'bg-prayer-primary/10 border-prayer-primary/30 dark:bg-prayer-primary/20' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        prayer.isNext ? 'bg-prayer-primary' : 'bg-muted-foreground/50'
                      }`} />
                      <span className={`font-medium ${
                        prayer.isNext ? 'text-prayer-primary' : 'text-foreground'
                      }`}>
                        {prayer.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-semibold ${
                        prayer.isNext ? 'text-prayer-primary' : 'text-foreground'
                      }`}>
                        {prayer.time}
                      </span>
                      {prayer.isNext && (
                        <p className="text-xs text-prayer-primary mt-0.5">Next Prayer</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarPage;
