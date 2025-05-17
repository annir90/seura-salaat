
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
  translation?: string; // Added field for translation
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

// Fetch specific surah by number with translation
export const fetchSurah = async (surahNumber: number): Promise<Ayah[]> => {
  try {
    // Fetch Arabic text
    const arabicResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
    const arabicData = await arabicResponse.json();
    
    // Fetch English translation (using Sahih International translation)
    const translationResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`);
    const translationData = await translationResponse.json();
    
    if (arabicData.code === 200 && arabicData.status === 'OK' && 
        translationData.code === 200 && translationData.status === 'OK') {
      
      // Combine Arabic text with translations
      const combinedAyahs = arabicData.data.ayahs.map((ayah: Ayah, index: number) => ({
        ...ayah,
        translation: translationData.data.ayahs[index].text,
        surah: surahNumber
      }));
      
      return combinedAyahs;
    } else {
      throw new Error(`Failed to fetch Surah #${surahNumber}`);
    }
  } catch (error) {
    console.error(`Error fetching Surah #${surahNumber}:`, error);
    toast({
      title: "Error",
      description: "Failed to load Surah with translation. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};

// Fetch the entire Quran with translations
export const fetchEntireQuran = async (): Promise<Ayah[]> => {
  try {
    // Fetch Arabic text
    const arabicResponse = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
    const arabicData = await arabicResponse.json();
    
    // Fetch English translation
    const translationResponse = await fetch('https://api.alquran.cloud/v1/quran/en.sahih');
    const translationData = await translationResponse.json();
    
    if (arabicData.code === 200 && arabicData.status === 'OK' &&
        translationData.code === 200 && translationData.status === 'OK') {
      
      // Process the surahs and their ayahs with translations
      const allAyahs: Ayah[] = [];
      
      arabicData.data.surahs.forEach((surah: any, surahIndex: number) => {
        const translationSurah = translationData.data.surahs[surahIndex];
        
        surah.ayahs.forEach((ayah: any, ayahIndex: number) => {
          allAyahs.push({
            ...ayah,
            surah: surah.number,
            translation: translationSurah.ayahs[ayahIndex].text
          });
        });
      });
      
      return allAyahs;
    } else {
      throw new Error('Failed to fetch entire Quran with translations');
    }
  } catch (error) {
    console.error('Error fetching entire Quran with translations:', error);
    toast({
      title: "Error",
      description: "Failed to load Quran data with translations. Please try again later.",
      variant: "destructive",
    });
    return [];
  }
};
