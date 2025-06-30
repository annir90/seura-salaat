const determineNextPrayer = (prayers: PrayerTime[]): PrayerTime[] => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  console.log(`Current time: ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} (${currentTime} minutes)`);

  // Ignore sunrise
  const actualPrayers = prayers.filter(prayer => prayer.id !== 'sunrise');

  // Track next prayer index
  let nextPrayerIndex = -1;

  actualPrayers.forEach((prayer, i) => {
    if (prayer.time && prayer.time !== "00:00") {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      let prayerTime = hours * 60 + minutes;

      // Handle after-midnight Isha
      if (hours >= 0 && hours < 6 && now.getHours() >= 18) {
        prayerTime += 24 * 60;
      }

      const adjustedCurrentTime = now.getHours() >= 18 ? currentTime + 24 * 60 : currentTime;

      if (prayerTime > adjustedCurrentTime && nextPrayerIndex === -1) {
        nextPrayerIndex = i;
        console.log(`Next prayer found: ${prayer.name} at ${prayer.time}`);
      }

      console.log(`${prayer.name}: ${prayer.time} (${prayerTime} minutes) - ${prayerTime > adjustedCurrentTime ? 'FUTURE' : 'PAST'}`);
    }
  });

  // Fallback: all prayers passed, mark last one (usually Isha)
  if (nextPrayerIndex === -1 && actualPrayers.length > 0) {
    nextPrayerIndex = actualPrayers.length - 1;
    console.log(`All prayers passed, setting next to: ${actualPrayers[nextPrayerIndex].name}`);
  }

  return prayers.map((prayer) => {
    const actualPrayerIndex = actualPrayers.findIndex((p) => p.id === prayer.id);
    const isNext = actualPrayerIndex === nextPrayerIndex && prayer.id !== 'sunrise';
    return {
      ...prayer,
      isNext
    };
  });
};
