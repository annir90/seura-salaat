
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
      return data.data.ayahs;
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
