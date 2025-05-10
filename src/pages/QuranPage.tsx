
import { useState, useEffect } from "react";
import { fetchSurahs, fetchSurah, Surah, Ayah } from "@/services/quranService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);

  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      const data = await fetchSurahs();
      setSurahs(data);
      setLoading(false);
    };
    
    loadSurahs();
  }, []);

  const handleSurahChange = async (surahNumber: string) => {
    setLoadingAyahs(true);
    const surahNum = parseInt(surahNumber);
    const selected = surahs.find(s => s.number === surahNum) || null;
    setSelectedSurah(selected);
    
    if (selected) {
      const ayahData = await fetchSurah(surahNum);
      setAyahs(ayahData);
    }
    setLoadingAyahs(false);
  };

  return (
    <div className="flex flex-col pb-6">
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="bg-prayer-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Noble Quran</h1>
        <p className="text-muted-foreground">Read and reflect</p>
      </div>

      {/* Surah Selection */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <label className="block text-sm font-medium mb-2">Select Surah:</label>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select onValueChange={handleSurahChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Surah" />
              </SelectTrigger>
              <SelectContent>
                {surahs.map((surah) => (
                  <SelectItem key={surah.number} value={surah.number.toString()}>
                    {surah.number}. {surah.englishName} ({surah.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Display Selected Surah */}
      {selectedSurah && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-center">
            {selectedSurah.englishName} ({selectedSurah.name})
          </h2>
          <p className="text-center text-muted-foreground mb-4">
            {selectedSurah.englishNameTranslation} • {selectedSurah.revelationType} • {selectedSurah.numberOfAyahs} verses
          </p>
        </div>
      )}

      {/* Ayahs */}
      {loadingAyahs ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      ) : (
        ayahs.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                {ayahs.map((ayah) => (
                  <div key={ayah.number} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-prayer-primary/10 text-prayer-primary px-2 py-1 rounded text-sm font-medium">
                        {ayah.numberInSurah}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Page {ayah.page}, Juz {ayah.juz}
                      </span>
                    </div>
                    <p className="text-right text-lg font-arabic leading-loose">{ayah.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Empty State */}
      {!loadingAyahs && !loading && ayahs.length === 0 && !selectedSurah && (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Surah</h3>
          <p className="text-muted-foreground">Choose a Surah from the dropdown above to start reading</p>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
