
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
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
    </div>
  );
};

export default CalendarPage;
