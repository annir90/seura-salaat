
import React from "react";
import { Ayah } from "@/services/quranService";

interface QuranVerseProps {
  ayah: Ayah;
  showTranslation: boolean;
}

const QuranVerse = ({ ayah, showTranslation }: QuranVerseProps) => {
  // Format verse number in Arabic-Indic numerals with decorative styling
  const formatVerseNumber = (number: number) => {
    return number.toString();
  };

  return (
    <div 
      id={`ayah-${ayah.numberInSurah}`}
      className="verse-container"
    >
      {/* Arabic Verse - Clean flowing layout */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-1">
          <p className="quran-verse-clean text-3xl md:text-4xl lg:text-5xl text-foreground leading-relaxed">
            {ayah.text}
            <span className="verse-number-inline mr-2">
              ﴿{formatVerseNumber(ayah.numberInSurah)}﴾
            </span>
          </p>
        </div>
      </div>
      
      {/* Translation - Clean and minimal */}
      {showTranslation && ayah.translation && (
        <div className="mt-4 mb-8">
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed text-left max-w-4xl">
            <span className="text-sm font-medium text-prayer-primary mr-2">
              {ayah.numberInSurah}.
            </span>
            {ayah.translation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuranVerse;
