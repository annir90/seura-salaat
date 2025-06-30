
import React, { useState, useEffect, useRef } from "react";
import { fetchSurahs, fetchSurah, Surah, Ayah } from "@/services/quranService";
import { saveBookmark, getBookmark, VerseBookmark } from "@/services/bookmarkService";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen, ArrowLeft, Save, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getTranslation } from "@/services/translationService";
import QuranVerse from "@/components/QuranVerse";

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allAyahs, setAllAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [showTranslation, setShowTranslation] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [bookmark, setBookmark] = useState<VerseBookmark | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const t = getTranslation();

  // Hide/show bottom navbar based on reading mode
  useEffect(() => {
    const bottomNavbar = document.querySelector('.fixed.bottom-0');
    if (bottomNavbar) {
      if (readingMode) {
        (bottomNavbar as HTMLElement).style.display = 'none';
      } else {
        (bottomNavbar as HTMLElement).style.display = 'block';
      }
    }

    // Cleanup: ensure navbar is visible when component unmounts
    return () => {
      const bottomNavbar = document.querySelector('.fixed.bottom-0');
      if (bottomNavbar) {
        (bottomNavbar as HTMLElement).style.display = 'block';
      }
    };
  }, [readingMode]);

  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      const surahsData = await fetchSurahs();
      setSurahs(surahsData);
      setFilteredSurahs(surahsData);
      
      // Load saved bookmark
      const savedBookmark = getBookmark();
      setBookmark(savedBookmark);
      
      setLoading(false);
    };
    
    loadSurahs();
  }, []);

  // Filter surahs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSurahs(surahs);
    } else {
      const filtered = surahs.filter(surah => 
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.number.toString().includes(searchQuery) ||
        surah.name.includes(searchQuery)
      );
      setFilteredSurahs(filtered);
    }
  }, [searchQuery, surahs]);

  // Load complete surah when selectedSurah changes
  useEffect(() => {
    const loadCompleteSurah = async () => {
      if (!selectedSurah) {
        setAllAyahs([]);
        return;
      }
      
      setLoading(true);
      const surahNumber = parseInt(selectedSurah);
      
      try {
        const ayahsData = await fetchSurah(surahNumber);
        setAllAyahs(ayahsData);
        setReadingMode(true);
        
        // Scroll to bookmarked verse if it's in this surah
        if (bookmark && bookmark.surahNumber === surahNumber) {
          setTimeout(() => {
            scrollToBookmarkedVerse(bookmark.ayahNumber);
          }, 500);
        }
      } catch (error) {
        console.error("Error loading surah:", error);
        toast({
          title: t.error,
          description: "Failed to load surah. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedSurah) {
      loadCompleteSurah();
    }
  }, [selectedSurah, surahs, bookmark, t]);

  // Function to scroll to bookmarked verse
  const scrollToBookmarkedVerse = (ayahNumber: number) => {
    const element = document.getElementById(`ayah-${ayahNumber}`);
    if (element && contentRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Manual bookmark save function
  const handleSaveBookmark = async () => {
    if (!readingMode || !selectedSurah || allAyahs.length === 0 || !contentRef.current || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Find which verse is currently in the center of the viewport
      const viewportCenter = contentRef.current.scrollTop + contentRef.current.clientHeight / 2;
      let currentVerse = null;
      
      for (let i = 0; i < allAyahs.length; i++) {
        const element = document.getElementById(`ayah-${allAyahs[i].numberInSurah}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = contentRef.current!.getBoundingClientRect();
          const elementTop = rect.top - containerRect.top + contentRef.current!.scrollTop;
          
          if (elementTop <= viewportCenter) {
            currentVerse = allAyahs[i];
          } else {
            break;
          }
        }
      }
      
      if (currentVerse) {
        const surahNumber = parseInt(selectedSurah);
        saveBookmark(surahNumber, currentVerse.numberInSurah);
        setBookmark({ surahNumber, ayahNumber: currentVerse.numberInSurah, timestamp: Date.now() });
        
        const surahName = getSurahName(surahNumber);
        toast({
          title: "Bookmark saved",
          description: `${surahName} - Verse ${currentVerse.numberInSurah}`,
        });
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
      toast({
        title: t.error,
        description: "Failed to save bookmark",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Find surah name by surah number
  const getSurahName = (surahNumber: number) => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? `${surah.englishName} (${surah.name})` : '';
  };

  // Toggle translation visibility
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  // Exit reading mode
  const exitReadingMode = () => {
    setReadingMode(false);
    setSelectedSurah("");
    setAllAyahs([]);
  };

  // Continue reading from bookmark
  const continueReading = () => {
    if (bookmark) {
      setSelectedSurah(bookmark.surahNumber.toString());
    }
  };

  // Handle surah card click
  const handleSurahClick = (surahNumber: number) => {
    setSelectedSurah(surahNumber.toString());
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Selection View - Only shown when not in reading mode */}
      {!readingMode ? (
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="bg-prayer-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t.quran}</h1>
          <p className="text-muted-foreground mb-6">{t.selectSurahToRead}</p>
          
          {/* Search Input */}
          <div className="w-full max-w-md mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search surahs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Show last read bookmark */}
          {bookmark && (
            <div className="bg-prayer-primary/10 dark:bg-prayer-primary/20 rounded-xl p-6 mb-6 border border-prayer-primary/20 w-full max-w-md shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-prayer-primary/20 rounded-full">
                  <BookOpen className="h-5 w-5 text-prayer-primary" />
                </div>
                <span className="font-semibold text-foreground">{t.continueReading}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {getSurahName(bookmark.surahNumber)} - Verse {bookmark.ayahNumber}
              </p>
              <Button 
                onClick={continueReading}
                className="w-full bg-prayer-primary hover:bg-prayer-primary/90 text-white"
              >
                {t.continueReading}
              </Button>
            </div>
          )}
          
          {/* All Surahs - Single Column */}
          {loading ? (
            <div className="space-y-4 w-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {filteredSurahs.length > 0 ? (
                filteredSurahs.map((surah) => (
                  <div
                    key={surah.number}
                    onClick={() => handleSurahClick(surah.number)}
                    className="group bg-card hover:bg-muted/50 border border-border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] hover:border-prayer-primary/30 flex items-center gap-4"
                  >
                    <div className="bg-prayer-primary/15 text-prayer-primary px-3 py-2 rounded-full text-sm font-bold min-w-[50px] text-center">
                      {surah.number}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg text-foreground group-hover:text-prayer-primary transition-colors">
                          {surah.englishName}
                        </h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {surah.numberOfAyahs} {t.verses}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {surah.englishNameTranslation}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p dir="rtl" className="font-arabic text-xl text-prayer-primary/80">
                        {surah.name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No surahs found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Reading Mode - Traditional Mushaf layout */}
      {readingMode && !loading && selectedSurah && allAyahs.length > 0 && (
        <div className="fixed inset-0 bg-mushaf-page z-50 flex flex-col">
          {/* Enhanced Header with strong dark mode visibility */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/98 backdrop-blur-md border-border shadow-sm">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-foreground hover:bg-muted font-medium" 
              onClick={exitReadingMode}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            
            <div className="text-center flex-1">
              <h2 className="text-lg font-bold text-foreground">
                {getSurahName(parseInt(selectedSurah))}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                {allAyahs.length} {t.verses}
              </p>
            </div>
            
            <div className="w-10"></div>
          </div>
          
          {/* Traditional Mushaf Content */}
          <div ref={contentRef} className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-8 py-12">
              {/* Main Quran Text - Continuous Flow */}
              <div className="mushaf-text-container">
                <p dir="rtl" className="quran-mushaf-text">
                  {allAyahs.map((ayah) => (
                    <QuranVerse 
                      key={ayah.number}
                      ayah={ayah}
                    />
                  ))}
                </p>
              </div>
              
              {/* End of Surah marker */}
              <div className="text-center py-16 mt-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-prayer-primary/10 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-prayer-primary" />
                </div>
                <p className="text-lg font-medium mb-2 text-prayer-primary">{t.endOfSurah}</p>
                <p className="text-sm text-muted-foreground">
                  {getSurahName(parseInt(selectedSurah))}
                </p>
              </div>
            </div>
          </div>
          
          {/* Save bookmark button */}
          {readingMode && (
            <div className="fixed right-4 bottom-8 z-30">
              <button 
                className={`p-3 bg-prayer-primary text-white rounded-full shadow-lg hover:bg-prayer-primary/90 transition-all ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveBookmark}
                disabled={isSaving}
                aria-label="Save bookmark"
                title="Save current reading position"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State for reading mode */}
      {loading && readingMode && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      )}
    </div>
  );
};

export default QuranPage;
