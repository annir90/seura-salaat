
import { useState, useEffect } from "react";
import { fetchSurahs, Surah } from "@/services/quranService";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Book, Loader2 } from "lucide-react";
import SurahDisplay from "@/components/SurahDisplay";

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);

  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      try {
        const surahList = await fetchSurahs();
        setSurahs(surahList);
        setFilteredSurahs(surahList);
      } catch (error) {
        console.error("Error loading surahs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSurahs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = surahs.filter(surah =>
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.number.toString().includes(searchTerm)
      );
      setFilteredSurahs(filtered);
    } else {
      setFilteredSurahs(surahs);
    }
  }, [searchTerm, surahs]);

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
  };

  const handleBackToList = () => {
    setSelectedSurah(null);
  };

  // If a surah is selected, show the complete surah
  if (selectedSurah) {
    return <SurahDisplay surah={selectedSurah} onBack={handleBackToList} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
        <Book className="h-6 w-6" />
        Quran
      </h1>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search surahs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-3">
            {filteredSurahs.map((surah) => (
              <Card
                key={surah.number}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-accent/50"
                onClick={() => handleSurahClick(surah)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-prayer-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-prayer-primary">
                          {surah.number}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {surah.name} ({surah.englishName})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {surah.englishNameTranslation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {surah.numberOfAyahs} verses
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {surah.revelationType}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {!loading && filteredSurahs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No surahs found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
