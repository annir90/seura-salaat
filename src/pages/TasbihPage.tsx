
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, RotateCcw, Vibrate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getTranslation } from "@/services/translationService";

const TasbihPage = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);
  const t = getTranslation();

  // Load saved count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('tasbih-count');
    if (savedCount) {
      setCount(parseInt(savedCount, 10));
    }

    const savedVibration = localStorage.getItem('tasbih-vibration');
    if (savedVibration !== null) {
      setIsVibrationEnabled(savedVibration === 'true');
    }
  }, []);

  // Save count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tasbih-count', count.toString());
  }, [count]);

  const vibrate = () => {
    if (isVibrationEnabled) {
      // Try multiple vibration methods for better compatibility
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration
      }
      // For mobile devices, also try the webkit vibrate
      if ('webkitVibrate' in navigator) {
        (navigator as any).webkitVibrate(50);
      }
    }
  };

  const incrementCount = () => {
    setCount(prev => prev + 1);
    vibrate();
  };

  const decrementCount = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
      vibrate();
    }
  };

  const resetCount = () => {
    setCount(0);
    vibrate();
    toast.success(t.tasbihCounterReset);
  };

  const toggleVibration = () => {
    const newValue = !isVibrationEnabled;
    setIsVibrationEnabled(newValue);
    localStorage.setItem('tasbih-vibration', newValue.toString());
    
    if (newValue) {
      toast.success(t.vibrationEnabled);
      // Test vibration when enabled - try multiple methods
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      if ('webkitVibrate' in navigator) {
        (navigator as any).webkitVibrate(100);
      }
    } else {
      toast.success(t.vibrationDisabled);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-prayer-light via-background to-prayer-light dark:from-prayer-dark dark:via-background dark:to-prayer-dark">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-prayer-primary to-prayer-secondary bg-clip-text text-transparent">
              {t.tasbihCounter}
            </h1>
            <p className="text-muted-foreground text-sm">{t.digitalDhikr}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Counter Card */}
          <Card className="shadow-lg border-0 bg-card rounded-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                {t.currentCount}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              {/* Count Display */}
              <div className="py-8">
                <div className="text-8xl font-bold bg-gradient-to-r from-prayer-primary to-prayer-secondary bg-clip-text text-transparent mb-4">
                  {count}
                </div>
                {count >= 33 && count % 33 === 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✨ {Math.floor(count / 33)} {Math.floor(count / 33) > 1 ? t.cycles : t.cycle} {t.completed}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={decrementCount}
                  disabled={count === 0}
                  className="h-16 text-lg font-medium border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={incrementCount}
                  className="h-16 text-xl font-bold bg-gradient-to-r from-prayer-primary to-prayer-secondary hover:from-prayer-primary/90 hover:to-prayer-secondary/90 text-white shadow-lg"
                >
                  <Plus className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetCount}
                  className="h-16 text-lg font-medium border-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>

              {/* Helper Text */}
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>{t.tapPlusToCount}</p>
                <p>{t.traditionalCycle}</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="shadow-sm border-0 bg-card rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-prayer-light dark:bg-prayer-accent/20 rounded-full">
                  <Vibrate className="h-5 w-5 text-prayer-primary" />
                </div>
                {t.counterSettings}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-foreground mb-1">{t.hapticFeedback}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t.vibrateOnTap}
                  </p>
                </div>
                <Button
                  variant={isVibrationEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVibration}
                  className={isVibrationEnabled ? "bg-prayer-primary hover:bg-prayer-primary/90" : ""}
                >
                  <Vibrate className="h-4 w-4 mr-2" />
                  {isVibrationEnabled ? t.on : t.off}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Common Dhikr Reference */}
          <Card className="shadow-sm border-0 bg-card rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">
                {t.commonDhikr}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-prayer-light dark:bg-prayer-accent/10 rounded-lg">
                  <p className="font-medium text-foreground mb-1">سُبْحَانَ اللَّهِ</p>
                  <p className="text-muted-foreground">{t.subhanAllah}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="font-medium text-foreground mb-1">الْحَمْدُ لِلَّهِ</p>
                  <p className="text-muted-foreground">{t.alhamdulillah}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="font-medium text-foreground mb-1">اللَّهُ أَكْبَرُ</p>
                  <p className="text-muted-foreground">{t.allahuAkbar}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TasbihPage;
