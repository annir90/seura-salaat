
# Android Setup Guide for Custom Prayer Sounds

## Required Android Permissions

Add these permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- For reading external storage (Android 10 and below) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- For accessing media files (Android 11+) -->
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

<!-- For notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />

<!-- For playing custom sounds -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## MainActivity.java Updates

Add this code to `android/app/src/main/java/.../MainActivity.java`:

```java
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.net.Uri;
import android.media.AudioAttributes;

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
        
        for (String prayer : prayers) {
            String channelId = "prayer_" + prayer;
            String channelName = prayer.substring(0, 1).toUpperCase() + prayer.substring(1) + " Prayer";
            String channelDescription = "Notifications for " + prayer + " prayer times";
            
            NotificationChannel channel = new NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription(channelDescription);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{1000, 1000, 1000, 1000, 1000});
            
            // Set default sound (can be overridden per notification)
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .build();
            
            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.adhan);
            channel.setSound(soundUri, audioAttributes);
            
            notificationManager.createNotificationChannel(channel);
        }
    }
}
```

## Audio Files Location

Place your default audio files in `android/app/src/main/res/raw/`:
- `adhan.wav` - Traditional adhan
- `soft.wav` - Soft notification sound  
- `beep.wav` - Simple beep sound

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
- Ensure notification permissions are granted
- Test on different Android versions (11+)
