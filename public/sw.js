
// Service Worker for background notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Storage for scheduled notifications
const scheduledNotifications = new Map();

// Handle background sync for prayer notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'prayer-notification') {
    event.waitUntil(handlePrayerNotification());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  event.notification.close();
  
  // Focus or open the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Handle background message for prayer times
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_PRAYER_NOTIFICATION') {
    const { prayerName, prayerId, time, delay, soundId, minutesBefore, scheduledFor } = event.data;
    
    console.log(`Service Worker: Scheduling ${prayerName} notification`);
    
    // Cancel any existing notification for this prayer
    if (scheduledNotifications.has(prayerId)) {
      clearTimeout(scheduledNotifications.get(prayerId));
    }
    
    // Schedule new notification with better background handling
    const timeoutId = setTimeout(async () => {
      console.log(`Service Worker: Showing background notification for ${prayerName} prayer`);
      
      try {
        // Show persistent notification that works in background
        await self.registration.showNotification(`${prayerName} Prayer Time`, {
          body: `${prayerName} prayer time is in ${minutesBefore} minutes (${time})`,
          icon: '/favicon.ico',
          tag: `prayer-${prayerId}`,
          requireInteraction: true,
          badge: '/favicon.ico',
          vibrate: [300, 100, 300, 100, 300],
          silent: false,
          actions: [
            {
              action: 'dismiss',
              title: 'Dismiss'
            },
            {
              action: 'open',
              title: 'Open App'
            }
          ],
          data: {
            prayerId: prayerId,
            soundId: soundId,
            time: time,
            prayerName: prayerName
          }
        });

        // Send message to main thread if app is open to play sound and vibrate
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        if (clients.length > 0) {
          clients.forEach(client => {
            client.postMessage({
              type: 'PRAYER_NOTIFICATION',
              prayerName,
              prayerId,
              soundId,
              time
            });
          });
        }
        
      } catch (error) {
        console.error('Service Worker: Error showing notification:', error);
      }
      
      // Remove from scheduled notifications after showing
      scheduledNotifications.delete(prayerId);
    }, delay);
    
    // Store the timeout ID to allow cancellation
    scheduledNotifications.set(prayerId, timeoutId);
    
    console.log(`Service Worker: Prayer notification scheduled for ${prayerName} at ${new Date(scheduledFor).toLocaleString()}`);
  }
  
  if (event.data && event.data.type === 'CLEAR_ALL_NOTIFICATIONS') {
    // Clear all scheduled notifications
    scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    scheduledNotifications.clear();
    
    // Clear all existing notifications
    self.registration.getNotifications().then(notifications => {
      notifications.forEach(notification => notification.close());
    });
    
    console.log('Service Worker: All scheduled notifications cleared');
  }
});

// Handle notification action clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification action clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open or focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
  // 'dismiss' action just closes the notification (already done above)
});

async function handlePrayerNotification() {
  // This function handles scheduled notifications for background sync
  console.log('Service Worker: Handling prayer notification in background');
}

// Handle fetch events (optional, for caching)
self.addEventListener('fetch', (event) => {
  // Add caching logic here if needed for offline functionality
});
