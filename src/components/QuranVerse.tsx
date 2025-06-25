
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
    <div 
      id={`ayah-${ayah.numberInSurah}`}
      className="verse-container"
    >
      {/* Arabic Verse - Clean flowing layout */}
      <div className="mb-4">
        <p className="quran-verse-mushaf text-3xl md:text-4xl lg:text-5xl text-foreground leading-relaxed">
          {ayah.text}
          <span className="verse-number-decorative">
            ﴿{formatVerseNumber(ayah.numberInSurah)}﴾
          </span>
        </p>
      </div>
    </div>
  );
};

export default QuranVerse;
