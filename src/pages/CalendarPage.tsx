
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  const isFriday = (date: Date | undefined) => {
    return date && date.getDay() === 5; // 5 corresponds to Friday in JavaScript
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
      
      {isFriday(selectedDate) ? (
        <div className="bg-prayer-primary/10 rounded-lg p-4 mb-4 border border-prayer-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-5 w-5 text-prayer-primary" />
            <h3 className="font-semibold text-lg">Jumaa Prayer</h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-prayer-primary" />
              <p className="text-muted-foreground">Prayer time: <span className="font-medium text-foreground">13:30</span></p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Join us for Friday prayer (Salat al-Jumaa) at the mosque. Remember to arrive early for the khutbah.</p>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-muted flex items-center justify-center">
          <p className="text-muted-foreground text-center">Select Friday to see Jumaa prayer times</p>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
