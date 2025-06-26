
import React from "react";
import { Ayah } from "@/services/quranService";

interface QuranVerseProps {
  ayah: Ayah;
}

const QuranVerse = ({ ayah }: QuranVerseProps) => {
  // Format verse number in Arabic-Indic numerals with decorative styling
  const formatVerseNumber = (number: number) => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return number.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
  };

  // Remove Bismillah from the first verse of each Surah (except Surah At-Tawbah which is Surah 9)
  const getCleanedText = (text: string, verseNumber: number, surahNumber: number) => {
    // If it's the first verse and not Surah At-Tawbah (9), remove Bismillah
    if (verseNumber === 1 && surahNumber !== 9) {
      // Remove the common Bismillah text patterns
      const bismillahPatterns = [
        'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        'بسم الله الرحمن الرحيم',
        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
      ];
      
      let cleanedText = text;
      bismillahPatterns.forEach(pattern => {
        cleanedText = cleanedText.replace(pattern, '').trim();
      });
      
      return cleanedText;
    }
    
    return text;
  };

  const cleanedText = getCleanedText(ayah.text, ayah.numberInSurah, ayah.surah);

  return (
    <span 
      id={`ayah-${ayah.numberInSurah}`}
      className="quran-verse-text"
    >
      {cleanedText}
      <span className="verse-number-circle">
        {formatVerseNumber(ayah.numberInSurah)}
      </span>
      {' '}
    </span>
  );
};

export default QuranVerse;
