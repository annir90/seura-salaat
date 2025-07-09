import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { toast } from "@/components/ui/use-toast";

export const generatePrayerTimesPDF = async (monthYear: string, prayerData: any[]) => {
  try {
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(20);
    pdf.text(`Prayer Times - ${monthYear}`, 20, 30);
    
    // Add table headers
    pdf.setFontSize(12);
    const headers = ['Date', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let yPosition = 50;
    
    // Draw headers
    headers.forEach((header, index) => {
      pdf.text(header, 20 + (index * 25), yPosition);
    });
    
    yPosition += 10;
    
    // Add prayer times data
    prayerData.forEach((dayData) => {
      const rowData = [
        `${dayData.weekday} ${dayData.day}`,
        dayData.fajr,
        dayData.sunrise,
        dayData.dhuhr,
        dayData.asr,
        dayData.maghrib,
        dayData.isha
      ];
      
      rowData.forEach((data, index) => {
        pdf.text(data, 20 + (index * 25), yPosition);
      });
      
      yPosition += 8;
      
      // Add new page if needed
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
    });
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const downloadPrayerTimesPDF = async (monthYear: string, prayerData: any[]) => {
  try {
    const pdf = await generatePrayerTimesPDF(monthYear, prayerData);
    const pdfOutput = pdf.output('datauristring');
    
    // Convert data URI to base64
    const base64Data = pdfOutput.split(',')[1];
    
    const fileName = `prayer-times-${monthYear.toLowerCase().replace(' ', '-')}.pdf`;
    
    // Save to device using Capacitor Filesystem
    const result = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents
    });
    
    toast({
      title: "PDF Downloaded",
      description: `Prayer times saved as ${fileName}`,
    });
    
    return result;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    toast({
      title: "Download Failed",
      description: "Unable to save PDF file",
      variant: "destructive"
    });
    throw error;
  }
};