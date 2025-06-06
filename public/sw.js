
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
    clients.matchAll({ type: 'window' }).then((clientList) => {
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
    const { prayerName, prayerId, time, delay, soundId, minutesBefore } = event.data;
    
    // Cancel any existing notification for this prayer
    if (scheduledNotifications.has(prayerId)) {
      clearTimeout(scheduledNotifications.get(prayerId));
    }
    
    // Schedule new notification
    const timeoutId = setTimeout(() => {
      console.log(`Showing notification for ${prayerName} prayer`);
      
      self.registration.showNotification(`${prayerName} Prayer Time`, {
        body: `${prayerName} prayer time is in ${minutesBefore} minutes (${time})`,
        icon: '/favicon.ico',
        tag: `prayer-${prayerId}`,
        requireInteraction: true,
        badge: '/favicon.ico',
        data: {
          prayerId: prayerId,
          soundId: soundId,
          time: time
        }
      });
      
      // Remove from scheduled notifications after showing
      scheduledNotifications.delete(prayerId);
    }, delay);
    
    // Store the timeout ID to allow cancellation
    scheduledNotifications.set(prayerId, timeoutId);
    
    console.log(`Prayer notification scheduled: ${prayerName} at ${time}, ${minutesBefore} minutes before`);
  }
});

async function handlePrayerNotification() {
  // This function handles scheduled notifications
  console.log('Handling prayer notification in background');
}
