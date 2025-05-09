
import { useState, useEffect } from "react";
import { getQiblaDirection } from "@/services/prayerTimeService";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const QiblaPage = () => {
  const [direction, setDirection] = useState(getQiblaDirection());
  const [compassHeading, setCompassHeading] = useState(0);
  
  const handleCalibrate = () => {
    // In a real app, this would access the device compass
    toast.success("Compass calibrated successfully");
    setCompassHeading(Math.random() * 360);
  };
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Qibla Finder</h1>
      
      <div className="relative mb-8 animate-fade-in">
        <div 
          className="w-64 h-64 rounded-full bg-prayer-light flex items-center justify-center relative border-4 border-white shadow-lg"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-6 h-6 rounded-full bg-prayer-primary absolute"
              style={{
                transform: `rotate(${compassHeading}deg) translateY(-110px)`
              }}
            />
            <div 
              className="w-2 h-32 bg-prayer-primary rounded-full absolute origin-bottom"
              style={{
                transform: `rotate(${direction - compassHeading}deg)`
              }}
            >
              <div className="w-4 h-4 bg-prayer-primary absolute -top-2 left-1/2 transform -translate-x-1/2 rotate-45" />
            </div>
            <Compass className="w-8 h-8 text-prayer-primary" />
          </div>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">Qibla is</p>
        <p className="text-2xl font-bold text-prayer-primary">{direction}° East</p>
      </div>
      
      <Button 
        variant="outline"
        className="bg-prayer-light text-prayer-primary hover:bg-prayer-accent"
        onClick={handleCalibrate}
      >
        Calibrate Compass
      </Button>
      
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <p>For best results, hold your device flat and away from magnetic interference.</p>
      </div>
    </div>
  );
};

export default QiblaPage;
