
import { PrayerTime } from "../prayerTimeService";
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { getSoundFileName } from './soundMapping';

export const scheduleNativeNotification = async (
  prayer: PrayerTime,
  notificationTime: Date,
  minutesLeft: number,
  soundId: string,
  scheduledNotificationIds: Set<number>
): Promise<void> => {
  const notificationId = parseInt(prayer.id.replace(/\D/g, '') || '0') + Date.now() % 1000;
  
  const soundFileName = getSoundFileName(soundId);
  console.log(`Using sound file: ${soundFileName} for prayer: ${prayer.name}`);
  
  const notification: ScheduleOptions = {
    notifications: [{
      title: `${prayer.name} Prayer Reminder`,
      body: `${prayer.name} prayer starts in ${minutesLeft} minutes at ${prayer.time}`,
      id: notificationId,
      schedule: { at: notificationTime },
      sound: soundFileName,
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      attachments: [],
      actionTypeId: '',
      extra: {
        prayerId: prayer.id,
        soundId: soundId,
        time: prayer.time,
        prayerName: prayer.name,
        minutesLeft: minutesLeft
      }
    }]
  };

  await LocalNotifications.schedule(notification);
  scheduledNotificationIds.add(notificationId);
  
  console.log(`Native notification scheduled for ${prayer.name} at ${notificationTime.toLocaleString()} with sound: ${soundFileName}`);
};

export const cancelNativeNotification = async (prayerId: string, scheduledNotificationIds: Set<number>): Promise<void> => {
  try {
    const pending = await LocalNotifications.getPending();
    const notificationToCancel = pending.notifications.find(
      notification => notification.extra?.prayerId === prayerId
    );
    
    if (notificationToCancel) {
      await LocalNotifications.cancel({ notifications: [{ id: notificationToCancel.id }] });
      scheduledNotificationIds.delete(notificationToCancel.id);
      console.log(`Native notification cancelled for prayer ID: ${prayerId}`);
    }
  } catch (error) {
    console.error('Error cancelling native notification:', error);
  }
};

export const cancelAllNativeNotifications = async (scheduledNotificationIds: Set<number>): Promise<void> => {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ 
        notifications: pending.notifications.map(n => ({ id: n.id }))
      });
    }
    scheduledNotificationIds.clear();
    console.log('All native notifications cancelled.');
  } catch (error) {
    console.error('Error cancelling all native notifications:', error);
  }
};
