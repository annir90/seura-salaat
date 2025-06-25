
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

  return (
    <span 
      id={`ayah-${ayah.numberInSurah}`}
      className="inline"
    >
      <span className="quran-verse-mushaf">
        {ayah.text}
        <span className="verse-number-decorative">
          ﴿{formatVerseNumber(ayah.numberInSurah)}﴾
        </span>
      </span>
      {' '}
    </span>
  );
};

export default QuranVerse;
