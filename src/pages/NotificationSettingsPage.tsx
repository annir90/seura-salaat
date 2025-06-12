
import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Clock, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { notificationService } from "@/services/notificationService";

const NotificationSettingsPage = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTiming, setNotificationTiming] = useState("5");
  const [testingSound, setTestingSound] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedNotificationState = localStorage.getItem('prayer-notifications-enabled');
    const savedTiming = localStorage.getItem('prayer-notification-timing');
    
    if (savedNotificationState !== null) {
      setNotificationsEnabled(savedNotificationState === 'true');
    }
    if (savedTiming) {
      setNotificationTiming(savedTiming);
    }
  }, []);

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('prayer-notifications-enabled', enabled.toString());
    
    if (enabled) {
      const hasPermission = await notificationService.requestPermission();
      if (!hasPermission) {
        toast({
          title: "Permission Required",
          description: "Please allow notifications in your browser settings.",
          variant: "destructive",
        });
        setNotificationsEnabled(false);
        localStorage.setItem('prayer-notifications-enabled', 'false');
      } else {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive prayer time reminders.",
        });
      }
    } else {
      notificationService.clearAllNotifications();
      toast({
        title: "Notifications Disabled",
        description: "Prayer reminders have been turned off.",
      });
    }
  };

  const handleTimingChange = (value: string) => {
    setNotificationTiming(value);
    localStorage.setItem('prayer-notification-timing', value);
    toast({
      title: "Timing Updated",
      description: `Notifications will appear ${value} minutes before prayer time.`,
    });
  };

  const testNotificationSound = async () => {
    setTestingSound(true);
    try {
      await notificationService.testSound('traditional-adhan');
      toast({
        title: "Sound Test",
        description: "Adhan sound played successfully!",
      });
    } catch (error) {
      console.error('Sound test failed:', error);
      toast({
        title: "Sound Test Failed",
        description: "Unable to play adhan sound. Check your device settings.",
        variant: "destructive",
      });
    } finally {
      setTestingSound(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/settings" className="mr-4">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Notification Settings</h1>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-prayer-primary" />
                Prayer Notifications
              </CardTitle>
              <CardDescription>
                Receive reminders for prayer times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enable Notifications</span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
            </CardContent>
          </Card>

          {notificationsEnabled && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-prayer-primary" />
                    Notification Timing
                  </CardTitle>
                  <CardDescription>
                    How many minutes before prayer time to notify
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={notificationTiming} onValueChange={handleTimingChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute before</SelectItem>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-prayer-primary" />
                    Sound Test
                  </CardTitle>
                  <CardDescription>
                    Test if prayer reminder sounds work on your device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={testNotificationSound}
                    disabled={testingSound}
                    className="w-full"
                  >
                    {testingSound ? "Playing..." : "Test Adhan Sound"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make sure your device volume is up and not in silent mode
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
