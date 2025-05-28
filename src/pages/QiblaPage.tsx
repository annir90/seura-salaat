
import { useState, useEffect } from "react";
import { getQiblaDirection } from "@/services/prayerTimeService";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTranslation } from "@/services/translationService";

const QiblaPage = () => {
  const [direction, setDirection] = useState(getQiblaDirection());
  const [compassHeading, setCompassHeading] = useState(0);
  const [deviceOrientation, setDeviceOrientation] = useState(0);
  const t = getTranslation();
  
  useEffect(() => {
    // Request device orientation permission for iOS
    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            setupOrientationListener();
          }
        } catch (error) {
          console.error('Error requesting device orientation permission:', error);
        }
      } else {
        setupOrientationListener();
      }
    };

    const setupOrientationListener = () => {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          // Convert compass heading to match device orientation
          const heading = event.alpha;
          setDeviceOrientation(heading);
          setCompassHeading(heading);
        }
      };

      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);

      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation);
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    };

    requestPermission();
  }, []);
  
  const handleCalibrate = () => {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      toast.success(t.compassCalibrated);
      // Reset to current device orientation
      setCompassHeading(deviceOrientation);
    } else {
      toast.success(t.compassCalibrated);
      setCompassHeading(Math.random() * 360);
    }
  };

  // Calculate the accurate Qibla direction relative to device orientation
  const qiblaDirection = direction - compassHeading;
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">{t.qiblaFinder}</h1>
      
      <div className="relative mb-8 animate-fade-in">
        <div 
          className="w-64 h-64 rounded-full bg-prayer-light flex items-center justify-center relative border-4 border-white shadow-lg"
        >
          {/* North indicator */}
          <div className="absolute top-2 text-xs font-bold text-prayer-primary">N</div>
          
          {/* Device orientation indicator */}
          <div 
            className="w-4 h-4 rounded-full bg-blue-500 absolute"
            style={{
              transform: `rotate(${compassHeading}deg) translateY(-110px)`
            }}
          />
          
          {/* Qibla direction arrow */}
          <div 
            className="w-2 h-32 bg-prayer-primary rounded-full absolute origin-bottom transition-transform duration-300"
            style={{
              transform: `rotate(${qiblaDirection}deg)`
            }}
          >
            <div className="w-4 h-4 bg-prayer-primary absolute -top-2 left-1/2 transform -translate-x-1/2 rotate-45" />
          </div>
          
          <Compass className="w-8 h-8 text-prayer-primary" />
          
          {/* Compass markings */}
          <div className="absolute inset-0">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
              <div
                key={angle}
                className="absolute w-0.5 h-4 bg-prayer-primary/30"
                style={{
                  top: '8px',
                  left: '50%',
                  transformOrigin: '50% 120px',
                  transform: `translateX(-50%) rotate(${angle}deg)`
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <p className="text-muted-foreground mb-2">{t.qiblaDirection}</p>
        <p className="text-2xl font-bold text-prayer-primary">{Math.round(direction)}° {t.fromNorth}</p>
        <p className="text-sm text-muted-foreground mt-2">{t.deviceHeading}: {Math.round(compassHeading)}°</p>
      </div>
      
      <Button 
        variant="outline"
        className="bg-prayer-light text-prayer-primary hover:bg-prayer-accent"
        onClick={handleCalibrate}
      >
        {t.calibrateCompass}
      </Button>
      
      <div className="mt-6 text-sm text-center text-muted-foreground max-w-md">
        <p>{t.qiblaInstructions}</p>
      </div>
    </div>
  );
};

export default QiblaPage;
