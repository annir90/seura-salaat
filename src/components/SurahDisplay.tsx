
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchSurah, Ayah, Surah } from "@/services/quranService";

interface SurahDisplayProps {
  surah: Surah;
  onBack: () => void;
}

const SurahDisplay = ({ surah, onBack }: SurahDisplayProps) => {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSurah = async () => {
      setLoading(true);
      try {
        const surahAyahs = await fetchSurah(surah.number);
        setAyahs(surahAyahs);
      } catch (error) {
        console.error("Error loading surah:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSurah();
  }, [surah.number]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Surahs
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {surah.number}. {surah.name} ({surah.englishName})
          </h1>
          <p className="text-muted-foreground">{surah.englishNameTranslation}</p>
          <p className="text-sm text-muted-foreground">
            {surah.numberOfAyahs} verses • {surah.revelationType}
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {ayahs.map((ayah) => (
            <div key={ayah.number} className="bg-card text-card-foreground rounded-lg p-6 border border-border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-prayer-primary bg-prayer-light px-2 py-1 rounded">
                  Ayah {ayah.numberInSurah}
                </span>
                <span className="text-xs text-muted-foreground">
                  Juz {ayah.juz} • Page {ayah.page}
                </span>
              </div>
              
              <div className="text-right mb-4 leading-relaxed text-xl" dir="rtl" lang="ar">
                {ayah.text}
              </div>
              
              {ayah.translation && (
                <div className="text-left text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {ayah.translation}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SurahDisplay;
