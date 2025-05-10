
import { toast } from "@/components/ui/use-toast";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah?: number; // Added to track which surah an ayah belongs to
}

export interface QuranData {
  surahs: Surah[];
  selectedSurah?: Surah;
  ayahs: Ayah[];
  loading: boolean;
}

// Fetch list of all surahs
export const fetchSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await response.json();
    
    if (data.code === 200 && data.status === 'OK') {
      return data.data;
    } else {
      throw new Error('Failed to fetch Surahs');
    }
  } catch (error) {
    console.error('Error fetching Surahs:', error);
    toast({
      title: "Error",
      description: "Failed to load Quran data. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

// Fetch specific surah by number
export const fetchSurah = async (surahNumber: number): Promise<Ayah[]> => {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const data = await response.json();
    
    if (data.code === 200 && data.status === 'OK') {
      return data.data.ayahs.map((ayah: Ayah) => ({
        ...ayah,
        surah: surahNumber
      }));
    } else {
      throw new Error(`Failed to fetch Surah #${surahNumber}`);
    }
  } catch (error) {
    console.error(`Error fetching Surah #${surahNumber}:`, error);
    toast({
      title: "Error",
      description: "Failed to load Surah. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

// Fetch the entire Quran
export const fetchEntireQuran = async (): Promise<Ayah[]> => {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
    const data = await response.json();
    
    if (data.code === 200 && data.status === 'OK') {
      // Process the surahs and their ayahs
      const allAyahs: Ayah[] = [];
      
      data.data.surahs.forEach((surah: any) => {
        const surahAyahs = surah.ayahs.map((ayah: any) => ({
          ...ayah,
          surah: surah.number
        }));
        allAyahs.push(...surahAyahs);
      });
      
      return allAyahs;
    } else {
      throw new Error('Failed to fetch entire Quran');
    }
  } catch (error) {
    console.error('Error fetching entire Quran:', error);
    toast({
      title: "Error",
      description: "Failed to load Quran data. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};
