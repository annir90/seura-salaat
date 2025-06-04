
// Service Worker for background notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Handle background sync for prayer notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'prayer-notification') {
    event.waitUntil(handlePrayerNotification());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
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
    const { prayerName, time, delay } = event.data;
    
    setTimeout(() => {
      self.registration.showNotification(`${prayerName} Prayer Reminder`, {
        body: `${prayerName} prayer time is approaching at ${time}`,
        icon: '/favicon.ico',
        tag: `prayer-${prayerName}`,
        requireInteraction: true,
        badge: '/favicon.ico'
      });
    }, delay);
  }
});

async function handlePrayerNotification() {
  // This function can be extended to handle scheduled notifications
  console.log('Handling prayer notification in background');
}
