
# Android Setup Guide for Custom Prayer Sounds

## Required Android Permissions

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- For notifications (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- For reading external storage (Android 10 and below) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- For accessing media files (Android 11+) -->
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

<!-- For vibration -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- For playing custom sounds -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## MainActivity.java Updates

Replace your `MainActivity.java` with this code:

```java
package your.package.name;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.net.Uri;
import android.media.AudioAttributes;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create notification channels for prayers
        createPrayerNotificationChannels();
    }

    private void createPrayerNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            
            String[] prayers = {"fajr", "dhuhr", "asr", "maghrib", "isha"};
            String[] prayerNames = {"Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"};
            
            for (int i = 0; i < prayers.length; i++) {
                String channelId = "prayer_" + prayers[i];
                String channelName = prayerNames[i] + " Prayer";
                String channelDescription = "Notifications for " + prayers[i] + " prayer times";
                
                NotificationChannel channel = new NotificationChannel(
                    channelId, 
                    channelName, 
                    NotificationManager.IMPORTANCE_HIGH
                );
                
                channel.setDescription(channelDescription);
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{1000, 1000, 1000, 1000, 1000});
                
                // Set default sound (can be overridden per notification)
                AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
                
                // Default to adhan sound, but each notification can override this
                Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.adhan);
                channel.setSound(soundUri, audioAttributes);
                
                notificationManager.createNotificationChannel(channel);
            }
            
            android.util.Log.d("MainActivity", "Created notification channels for all prayers");
        }
    }
}
```

## Audio Files Location

Place your audio files in `android/app/src/main/res/raw/`:
- `adhan.wav` - Traditional adhan (for makkah_adhan, traditional_adhan)
- `soft.wav` - Soft notification sound  
- `beep.wav` - Simple beep sound

**Important**: File names must be lowercase and contain only letters, numbers, and underscores.

## Build Configuration

Make sure your `android/app/build.gradle` has:

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        targetSdkVersion 34
        minSdkVersion 24
    }
}
```

## Testing

1. Run `npm run build`
2. Run `npx cap sync android`
3. Run `npx cap run android`
4. Test sound selection and notifications on a physical device

## Troubleshooting

- Custom sounds must be in supported formats (MP3, WAV, M4A)
- File size should be reasonable (< 5MB recommended)
- Ensure notification permissions are granted in Android settings
- Test on different Android versions (11+)
- Check logcat for notification scheduling errors: `adb logcat | grep "notification"`

## Debugging Commands

```bash
# Check if notifications are scheduled
adb shell dumpsys notification

# View app logs
adb logcat | grep "your.package.name"

# Clear app data for testing
adb shell pm clear your.package.name
```
