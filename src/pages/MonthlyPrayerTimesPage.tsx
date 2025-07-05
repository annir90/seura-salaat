
import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getPrayerTimes, PrayerTime } from '@/services/prayerTimeService';
import { getSelectedLocation } from '@/services/locationService';
import { formatTranslatedDate } from '@/utils/dateUtils';
import { getTranslation } from '@/services/translationService';

interface DayPrayerTimes {
  date: Date;
  dayNumber: number;
  dayName: string;
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

const MonthlyPrayerTimesPage = () => {
  const [monthlyTimes, setMonthlyTimes] = useState<DayPrayerTimes[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState('July 2025');
  const location = getSelectedLocation();
  const t = getTranslation();
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

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

          const dayNames = [
            t.weekdays.sunday, t.weekdays.monday, t.weekdays.tuesday,
            t.weekdays.wednesday, t.weekdays.thursday, t.weekdays.friday, t.weekdays.saturday
          ];

          times.push({
            date,
            dayNumber: day,
            dayName: dayNames[date.getDay()],
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
          <div className="text-lg text-muted-foreground">Loading prayer times...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-semibold text-prayer-primary">
            <Calendar className="h-6 w-6" />
            Prayer Times - {currentMonth}, {location.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
                <TableRow>
                  <TableHead className="font-bold text-center w-16">Day</TableHead>
                  <TableHead className="font-bold text-center min-w-[60px]">Imsak</TableHead>
                  <TableHead className="font-bold text-center min-w-[60px]">Fajr</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px]">Sunrise</TableHead>
                  <TableHead className="font-bold text-center min-w-[60px]">Dhuhr</TableHead>
                  <TableHead className="font-bold text-center min-w-[60px]">Asr</TableHead>
                  <TableHead className="font-bold text-center min-w-[65px]">Maghrib</TableHead>
                  <TableHead className="font-bold text-center min-w-[60px]">Isha</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {monthlyTimes.map((dayData, index) => (
                  <TableRow 
                    key={dayData.dayNumber}
                    className={`
                      ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                      ${isToday(dayData.dayNumber) ? 'bg-prayer-light/30 border-l-4 border-prayer-primary' : ''}
                      hover:bg-muted/40 transition-colors
                    `}
                  >
                    <TableCell className="text-center p-3">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-lg">{dayData.dayNumber}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {dayData.dayName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
                      {dayData.prayers.imsak}
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
                      {dayData.prayers.fajr}
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
                      {dayData.prayers.sunrise}
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
                      {dayData.prayers.dhuhr}
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
                      {dayData.prayers.asr}
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
                      {dayData.prayers.maghrib}
                    </TableCell>
                    <TableCell className="text-center p-3 text-sm font-medium">
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

export default MonthlyPrayerTimesPage;
