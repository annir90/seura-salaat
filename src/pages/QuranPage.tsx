
import React, { useState, useEffect, useRef } from "react";
import { fetchSurahs, fetchSurah, Surah, Ayah } from "@/services/quranService";
import { saveBookmark, getBookmark, VerseBookmark } from "@/services/bookmarkService";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen, Languages, ArrowLeft, ArrowUp, ArrowDown, BookmarkCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [allAyahs, setAllAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [showTranslation, setShowTranslation] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(true);
  const [bookmark, setBookmark] = useState<VerseBookmark | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      const surahsData = await fetchSurahs();
      setSurahs(surahsData);
      
      // Load saved bookmark
      const savedBookmark = getBookmark();
      setBookmark(savedBookmark);
      
      setLoading(false);
    };
    
    loadSurahs();
  }, []);

  // Handle scroll to show/hide scroll button and change its direction
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const scrollPosition = contentRef.current.scrollTop;
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      
      setShowScrollButton(scrollPosition > 100);
      const isNearBottom = scrollPosition + clientHeight > scrollHeight - 200;
      setIsScrolledUp(!isNearBottom);
    };
    
    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      handleScroll();
      
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [readingMode]);

  // Scroll handler function
  const handleScrollClick = () => {
    if (!contentRef.current) return;
    
    if (isScrolledUp) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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
        
        const surahName = surahs.find(s => s.number === surahNumber)?.englishName || '';
        toast({
          title: `Surah ${surahName} loaded`,
          description: `Successfully loaded all ${ayahsData.length} verses`,
        });

        // Scroll to bookmarked verse if it's in this surah
        if (bookmark && bookmark.surahNumber === surahNumber) {
          setTimeout(() => {
            scrollToBookmarkedVerse(bookmark.ayahNumber);
          }, 500);
        }
      } catch (error) {
        console.error("Error loading surah:", error);
        toast({
          title: "Error",
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
  }, [selectedSurah, surahs, bookmark]);

  // Function to scroll to bookmarked verse
  const scrollToBookmarkedVerse = (ayahNumber: number) => {
    const element = document.getElementById(`ayah-${ayahNumber}`);
    if (element && contentRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Function to handle verse bookmarking with scroll position tracking
  const handleBookmarkVerse = (ayahNumber: number) => {
    const surahNumber = parseInt(selectedSurah);
    saveBookmark(surahNumber, ayahNumber);
    setBookmark({ surahNumber, ayahNumber, timestamp: Date.now() });
    toast({
      title: "Reading Position Saved",
      description: `Surah ${getSurahName(surahNumber)} - Verse ${ayahNumber}`,
    });
  };

  // Auto-bookmark when user scrolls to a new verse
  useEffect(() => {
    if (!readingMode || !selectedSurah || allAyahs.length === 0) return;

    const handleAutoBookmark = () => {
      if (!contentRef.current) return;
      
      const scrollPosition = contentRef.current.scrollTop + contentRef.current.clientHeight / 2;
      
      // Find which verse is currently in view
      for (let i = 0; i < allAyahs.length; i++) {
        const element = document.getElementById(`ayah-${allAyahs[i].numberInSurah}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = contentRef.current!.getBoundingClientRect();
          
          if (rect.top >= containerRect.top && rect.top <= containerRect.top + containerRect.height / 2) {
            const currentBookmark = getBookmark();
            if (!currentBookmark || 
                currentBookmark.surahNumber !== parseInt(selectedSurah) || 
                currentBookmark.ayahNumber !== allAyahs[i].numberInSurah) {
              
              // Auto-save reading position
              const surahNumber = parseInt(selectedSurah);
              saveBookmark(surahNumber, allAyahs[i].numberInSurah);
              setBookmark({ surahNumber, ayahNumber: allAyahs[i].numberInSurah, timestamp: Date.now() });
            }
            break;
          }
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      // Debounce the auto-bookmark function
      let timeoutId: NodeJS.Timeout;
      const debouncedAutoBookmark = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleAutoBookmark, 1000);
      };
      
      contentElement.addEventListener('scroll', debouncedAutoBookmark);
      
      return () => {
        contentElement.removeEventListener('scroll', debouncedAutoBookmark);
        clearTimeout(timeoutId);
      };
    }
  }, [readingMode, selectedSurah, allAyahs]);

  // Check if a verse is bookmarked
  const isVerseBookmarked = (ayahNumber: number) => {
    return bookmark && 
           bookmark.surahNumber === parseInt(selectedSurah) && 
           bookmark.ayahNumber === ayahNumber;
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

  return (
    <div className="flex flex-col pb-20">
      {/* Selection View - Only shown when not in reading mode */}
      {!readingMode ? (
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="bg-prayer-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Noble Quran</h1>
          <p className="text-muted-foreground mb-4">Select a Surah to begin reading</p>
          
          {/* Show last read bookmark */}
          {bookmark && (
            <div className="bg-prayer-primary/10 dark:bg-prayer-primary/20 rounded-lg p-4 mb-4 border border-prayer-primary/20 w-full max-w-md">
              <div className="flex items-center gap-2 mb-2">
                <BookmarkCheck className="h-4 w-4 text-prayer-primary" />
                <span className="font-medium text-sm">Continue Reading</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {getSurahName(bookmark.surahNumber)} - Verse {bookmark.ayahNumber}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={continueReading}
              >
                Continue Reading
              </Button>
            </div>
          )}
          
          {/* Surah Selector */}
          <div className="w-full max-w-xs mb-4">
            <Select
              value={selectedSurah}
              onValueChange={setSelectedSurah}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Surah" />
              </SelectTrigger>
              <SelectContent>
                {surahs.map((surah) => (
                  <SelectItem key={surah.number} value={surah.number.toString()}>
                    {surah.number}. {surah.englishName} - {surah.englishNameTranslation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      )}

      {/* Empty State - When no surah is selected */}
      {!loading && !selectedSurah && !readingMode && (
        <div className="text-center p-12 border border-dashed rounded-lg mx-auto max-w-3xl">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Please Select a Surah</h3>
          <p className="text-muted-foreground">Choose a Surah from the dropdown above to start reading</p>
        </div>
      )}

      {/* Reading Mode - Full Screen Quran View with Complete Surah */}
      {readingMode && !loading && selectedSurah && allAyahs.length > 0 && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          {/* Minimal Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2" 
              onClick={exitReadingMode}
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            
            <div className="text-center flex-1">
              <h2 className="text-lg font-medium">
                {getSurahName(parseInt(selectedSurah))}
              </h2>
              <p className="text-sm text-muted-foreground">
                {allAyahs.length} verses
              </p>
            </div>
            
            <button 
              onClick={toggleTranslation}
              className="p-2 rounded-full hover:bg-muted"
              title={showTranslation ? "Hide translation" : "Show translation"}
            >
              <Languages size={18} className="text-prayer-primary" />
            </button>
          </div>
          
          {/* Complete Surah Content */}
          <div ref={contentRef} className="flex-1 overflow-auto quran-content-area">
            <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 lg:p-12">
              {allAyahs.map((ayah) => (
                <div 
                  key={ayah.number} 
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`p-4 md:p-6 bg-card border rounded-lg ${
                    isVerseBookmarked(ayah.numberInSurah) 
                      ? 'border-prayer-primary bg-prayer-primary/5' 
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-prayer-primary/10 text-prayer-primary px-3 py-1 rounded-full font-medium">
                      {ayah.numberInSurah}
                    </span>
                    {isVerseBookmarked(ayah.numberInSurah) && (
                      <div className="flex items-center gap-1 text-prayer-primary text-xs">
                        <BookmarkCheck className="h-3 w-3" />
                        <span>Reading Position</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Arabic Text */}
                    <div>
                      <p dir="rtl" className="text-right text-2xl font-arabic leading-loose">
                        {ayah.text}
                      </p>
                    </div>
                    
                    {/* Translation Text - conditionally rendered */}
                    {showTranslation && ayah.translation && (
                      <div className="pt-3 border-t border-dashed border-muted">
                        <p className="text-muted-foreground text-base leading-relaxed">
                          {ayah.translation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* End of Surah indicator */}
              <div className="text-center text-muted-foreground py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-prayer-primary/10 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-prayer-primary" />
                </div>
                <p className="text-lg font-medium">End of Surah</p>
                <p className="text-sm">
                  {getSurahName(parseInt(selectedSurah))} - {allAyahs.length} verses
                </p>
              </div>
            </div>
          </div>
          
          {/* Scroll button */}
          {showScrollButton && readingMode && (
            <button 
              className="fixed right-4 bottom-8 p-3 bg-prayer-primary text-white rounded-full shadow-lg z-30 hover:bg-prayer-primary/90 transition-all"
              onClick={handleScrollClick}
              aria-label={isScrolledUp ? "Scroll to bottom" : "Scroll to top"}
            >
              {isScrolledUp ? (
                <ArrowDown className="h-5 w-5" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )}

      {/* No results state */}
      {!loading && selectedSurah && allAyahs.length === 0 && !readingMode && (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Verses Available</h3>
          <p className="text-muted-foreground">There was a problem loading the Quran data. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
