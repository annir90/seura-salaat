
import React from "react";
import { Ayah } from "@/services/quranService";

interface QuranVerseProps {
  ayah: Ayah;
  showTranslation: boolean;
}

const QuranVerse = ({ ayah, showTranslation }: QuranVerseProps) => {
  // Convert Arabic-Indic numerals to decorative circle
  const formatVerseNumber = (number: number) => {
    return number.toString();
  };

  return (
    <div 
      id={`ayah-${ayah.numberInSurah}`}
      className="verse-container mushaf-background"
    >
      {/* Arabic Verse */}
      <div className="flex items-start gap-4 mb-4">
        <div className="verse-number">
          {formatVerseNumber(ayah.numberInSurah)}
        </div>
        <div className="flex-1">
          <p className="quran-verse text-2xl md:text-3xl text-foreground leading-loose">
            {ayah.text}
          </p>
        </div>
      </div>
      
      {/* Translation */}
      {showTranslation && ayah.translation && (
        <div className="mt-4 pt-4 border-t border-dashed border-muted-foreground/30">
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed text-left">
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
