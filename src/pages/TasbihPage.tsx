
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Minus, RotateCcw, Vibrate } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TasbihPage = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

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
    if (isVibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration
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
    toast.success("Tasbih counter reset to 0");
  };

  const toggleVibration = () => {
    const newValue = !isVibrationEnabled;
    setIsVibrationEnabled(newValue);
    localStorage.setItem('tasbih-vibration', newValue.toString());
    
    if (newValue) {
      toast.success("Vibration enabled");
      // Test vibration when enabled
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    } else {
      toast.success("Vibration disabled");
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              Tasbih Counter
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Digital dhikr and tasbih counter</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Counter Card */}
          <Card className="shadow-lg border-0 bg-white dark:bg-gray-800 rounded-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Current Count
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-8">
              {/* Count Display */}
              <div className="py-8">
                <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-4">
                  {count}
                </div>
                {count >= 33 && count % 33 === 0 && (
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✨ {Math.floor(count / 33)} cycle{Math.floor(count / 33) > 1 ? 's' : ''} of 33 completed
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
                  className="h-16 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={incrementCount}
                  className="h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                >
                  <Plus className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetCount}
                  className="h-16 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>

              {/* Helper Text */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Tap the + button to count your dhikr</p>
                <p>Traditional cycle: 33 repetitions</p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                  <Vibrate className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Counter Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Haptic Feedback</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vibrate on each tap for better feedback
                  </p>
                </div>
                <Button
                  variant={isVibrationEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVibration}
                  className={isVibrationEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  <Vibrate className="h-4 w-4 mr-2" />
                  {isVibrationEnabled ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Common Dhikr Reference */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Common Dhikr
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">سُبْحَانَ اللَّهِ</p>
                  <p className="text-gray-600 dark:text-gray-400">Subhan Allah (Glory be to Allah)</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">الْحَمْدُ لِلَّهِ</p>
                  <p className="text-gray-600 dark:text-gray-400">Alhamdulillah (Praise be to Allah)</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">اللَّهُ أَكْبَرُ</p>
                  <p className="text-gray-600 dark:text-gray-400">Allahu Akbar (Allah is Greatest)</p>
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
