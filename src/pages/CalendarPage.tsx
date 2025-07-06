
import { useState, useEffect } from "react";
import { getPrayerTimes, PrayerTime } from "@/services/prayerTimeService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Loader2, CalendarDays } from "lucide-react";
import { getTranslation } from "@/services/translationService";
import { getSelectedLocation } from "@/services/locationService";

interface DayPrayerTimes {
  date: Date;
  dayNumber: number;
  weekdayFi: string;
  prayers: {
    imsak: string;
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
}

const CalendarPage = () => {
  const [monthlyTimes, setMonthlyTimes] = useState<DayPrayerTimes[]>([]);
  const [loading, setLoading] = useState(true);
  const t = getTranslation();
  const location = getSelectedLocation();
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // Get weekday abbreviations based on current language
  const getWeekdayAbbr = (dayIndex: number): string => {
    const weekdays = [
      t.weekdays.sunday,
      t.weekdays.monday,
      t.weekdays.tuesday,
      t.weekdays.wednesday,
      t.weekdays.thursday,
      t.weekdays.friday,
      t.weekdays.saturday
    ];
    
    // Return first 2-3 characters as abbreviation
    return weekdays[dayIndex].substring(0, 2);
  };

  useEffect(() => {
    const loadMonthlyTimes = async () => {
      setLoading(true);
      const times: DayPrayerTimes[] = [];
      
      // July 2025 has 31 days
      for (let day = 1; day <= 31; day++) {
        const date = new Date(2025, 6, day); // Month is 0-indexed (6 = July)
        
        try {
          const prayerTimes = await getPrayerTimes(date);
          
          // Map prayer times to our format
          const prayers = {
            imsak: calculateImsak(prayerTimes.find(p => p.id === 'fajr')?.time || '00:00'),
            fajr: prayerTimes.find(p => p.id === 'fajr')?.time || '00:00',
            sunrise: prayerTimes.find(p => p.id === 'sunrise')?.time || '00:00',
            dhuhr: prayerTimes.find(p => p.id === 'dhuhr')?.time || '00:00',
            asr: prayerTimes.find(p => p.id === 'asr')?.time || '00:00',
            maghrib: prayerTimes.find(p => p.id === 'maghrib')?.time || '00:00',
            isha: prayerTimes.find(p => p.id === 'isha')?.time || '00:00'
          };

          times.push({
            date,
            dayNumber: day,
            weekdayFi: getWeekdayAbbr(date.getDay()),
            prayers
          });
        } catch (error) {
          console.error(`Error loading prayer times for day ${day}:`, error);
        }
      }
      
      setMonthlyTimes(times);
      setLoading(false);
    };

    loadMonthlyTimes();
  }, [t]);

  // Calculate Imsak (approximately 10 minutes before Fajr)
  const calculateImsak = (fajrTime: string): string => {
    try {
      const [hours, minutes] = fajrTime.split(':').map(Number);
      const fajrMinutes = hours * 60 + minutes;
      const imsakMinutes = fajrMinutes - 10;
      
      const imsakHours = Math.floor(imsakMinutes / 60);
      const imsakMins = imsakMinutes % 60;
      
      return `${String(imsakHours).padStart(2, '0')}:${String(imsakMins).padStart(2, '0')}`;
    } catch (error) {
      return '00:00';
    }
  };

  const isToday = (day: number): boolean => {
    return day === todayDay && todayMonth === 6 && todayYear === 2025;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary mr-3" />
          <div className="text-lg text-muted-foreground">{t.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="text-center bg-gradient-to-r from-prayer-primary/10 to-prayer-light/10 rounded-t-lg">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-prayer-primary">
            <CalendarDays className="h-7 w-7" />
            {t.prayerTimesFor} – {t.months.july} 2025 ({location.name})
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[650px]">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b-2 border-prayer-primary/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-center w-20 text-foreground">Day</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px] text-foreground">Imsak</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px] text-foreground">{t.fajr}</TableHead>
                  <TableHead className="font-bold text-center min-w-[70px] text-foreground">{t.sunrise}</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px] text-foreground">{t.dhuhr}</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px] text-foreground">{t.asr}</TableHead>
                  <TableHead className="font-bold text-center min-w-[70px] text-foreground">{t.maghrib}</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px] text-foreground">{t.isha}</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {monthlyTimes.map((dayData, index) => (
                  <TableRow 
                    key={dayData.dayNumber}
                    className={`
                      ${index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}
                      ${isToday(dayData.dayNumber) 
                        ? 'bg-gradient-to-r from-prayer-light/40 to-prayer-primary/20 border-l-4 border-prayer-primary font-semibold shadow-sm' 
                        : ''}
                      hover:bg-muted/40 transition-all duration-200 border-b border-border/50
                    `}
                  >
                    <TableCell className="text-center p-4">
                      <div className="flex flex-col items-center space-y-1">
                        <span className={`text-xl font-bold ${isToday(dayData.dayNumber) ? 'text-prayer-primary' : 'text-foreground'}`}>
                          {dayData.dayNumber}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          {dayData.weekdayFi}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.imsak}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.fajr}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.sunrise}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.dhuhr}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.asr}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.maghrib}
                    </TableCell>
                    <TableCell className="text-center p-4 text-sm font-medium text-foreground">
                      {dayData.prayers.isha}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
