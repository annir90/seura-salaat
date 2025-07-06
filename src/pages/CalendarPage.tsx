
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getPrayerTimes, PrayerTime } from "@/services/prayerTimeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Loader2, CalendarDays } from "lucide-react";
import { getTranslation } from "@/services/translationService";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(false);
  const t = getTranslation();
  
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
        setPrayerTimes([]);
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
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t.prayerCalendar}</h1>
      
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
            <h3 className="text-lg font-medium mb-2">{t.chooseDayPrompt}</h3>
            <p className="text-muted-foreground text-center">{t.selectDatePrompt}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card text-card-foreground border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-prayer-primary" />
              {t.prayerTimesFor} {formatSelectedDate(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-prayer-primary" />
              </div>
            ) : prayerTimes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {prayerTimes.map((prayer) => (
                  <div 
                    key={prayer.id} 
                    className="flex flex-col items-center p-4 bg-muted/20 rounded-lg border"
                  >
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {prayer.name}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {prayer.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noPrayerTimes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarPage;
