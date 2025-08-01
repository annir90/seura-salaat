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
    
    // Check if we have permission to write files
    try {
      const permissions = await Filesystem.checkPermissions();
      if (permissions.publicStorage !== 'granted') {
        const requestResult = await Filesystem.requestPermissions();
        if (requestResult.publicStorage !== 'granted') {
          toast({
            title: "Permission Required",
            description: "Storage permission is required to save files",
            variant: "destructive"
          });
          return;
        }
      }
    } catch (permError) {
      console.warn('Permission check failed:', permError);
      // Continue with file save attempt even if permission check fails
    }
    
    // Save to user-accessible Documents directory
    const result = await Filesystem.writeFile({
      path: fileName,
      data: textContent,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    
    toast({
      title: "Prayer Times Downloaded",
      description: `Prayer times saved to Downloads/${fileName}`,
    });
    
    return result;
  } catch (error) {
    console.error('Error downloading prayer times:', error);
    
    // Provide more specific error messages
    let errorMessage = "Unable to save prayer times file";
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        errorMessage = "Storage permission denied. Please enable storage access in app settings.";
      } else if (error.message.includes('space')) {
        errorMessage = "Insufficient storage space available.";
      }
    }
    
    toast({
      title: "Download Failed",
      description: errorMessage,
      variant: "destructive"
    });
    throw error;
  }
};