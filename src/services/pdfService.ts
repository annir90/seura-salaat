import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { toast } from "@/components/ui/use-toast";

export const generatePrayerTimesText = (monthYear: string, prayerData: any[]): string => {
  let textContent = `Prayer Times - ${monthYear}\n`;
  textContent += "=".repeat(50) + "\n\n";
  
  prayerData.forEach((dayData) => {
    textContent += `Day: ${dayData.day}, Weekday: ${dayData.weekday}\n`;
    textContent += `Imsak: ${dayData.imsak || 'N/A'}, Fajr: ${dayData.fajr}, Sunrise: ${dayData.sunrise}\n`;
    textContent += `Dhuhr: ${dayData.dhuhr}, Asr: ${dayData.asr}, Maghrib: ${dayData.maghrib}, Isha: ${dayData.isha}\n`;
    textContent += "-".repeat(40) + "\n";
  });
  
  return textContent;
};

export const downloadPrayerTimesText = async (monthYear: string, prayerData: any[]) => {
  try {
    const textContent = generatePrayerTimesText(monthYear, prayerData);
    const fileName = `prayer-times-${monthYear.toLowerCase().replace(' ', '-')}.txt`;
    
    // Save to device using Capacitor Filesystem
    const result = await Filesystem.writeFile({
      path: fileName,
      data: textContent,
      directory: Directory.Data,
      encoding: Encoding.UTF8
    });
    
    toast({
      title: "Prayer Times Downloaded",
      description: `Prayer times saved as ${fileName}`,
    });
    
    return result;
  } catch (error) {
    console.error('Error downloading prayer times:', error);
    toast({
      title: "Download Failed",
      description: "Unable to save prayer times file",
      variant: "destructive"
    });
    throw error;
  }
};