
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { getPrayerTimes, PrayerTime } from "@/services/prayerTimeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Loader2, CalendarDays } from "lucide-react";
import { getTranslation } from "@/services/translationService";

const CalendarPage = () => {
  const [monthlyPrayerTimes, setMonthlyPrayerTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const t = getTranslation();
  
  // Helper function to generate monthly file name
  const getMonthlyFileName = (date: Date): string => {
    const months = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month}-${year}.json`;
  };

  // Load monthly prayer times
  useEffect(() => {
    const loadMonthlyPrayerTimes = async () => {
      setLoading(true);
      try {
        const monthlyFileName = getMonthlyFileName(currentMonth);
        console.log("Loading monthly prayer times:", monthlyFileName);
        
        const response = await fetch(`/data/${monthlyFileName}`);
        if (!response.ok) {
          throw new Error(`Failed to load prayer schedule: ${response.status}`);
        }
        
        const schedule = await response.json();
        setMonthlyPrayerTimes(schedule);
        console.log("Monthly prayer schedule loaded:", schedule.length, "days");
      } catch (error) {
        console.error("Error loading monthly prayer times:", error);
        setMonthlyPrayerTimes([]);
      } finally {
        setLoading(false);
      }
    };

    loadMonthlyPrayerTimes();
  }, [currentMonth]);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t.prayerCalendar}</h1>
      
      <Card className="bg-card text-card-foreground border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-prayer-primary" />
            Prayer Times - {formatMonthYear(currentMonth)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-prayer-primary" />
            </div>
          ) : monthlyPrayerTimes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fajr</TableHead>
                    <TableHead>Sunrise</TableHead>
                    <TableHead>Dhuhr</TableHead>
                    <TableHead>Asr</TableHead>
                    <TableHead>Maghrib</TableHead>
                    <TableHead>Isha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyPrayerTimes
                    .sort((a: any, b: any) => a.day - b.day)
                    .map((dayData: any) => (
                    <TableRow key={dayData.day}>
                      <TableCell className="font-medium">
                        {dayData.weekday} {dayData.day}
                      </TableCell>
                      <TableCell>{dayData.fajr}</TableCell>
                      <TableCell className="text-muted-foreground">{dayData.sunrise}</TableCell>
                      <TableCell>{dayData.dhuhr}</TableCell>
                      <TableCell>{dayData.asr}</TableCell>
                      <TableCell>{dayData.maghrib}</TableCell>
                      <TableCell>{dayData.isha}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prayer times available for this month</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
