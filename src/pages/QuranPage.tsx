
import React, { useState, useEffect } from "react";
import { fetchSurahs, fetchSurah, Surah, Ayah } from "@/services/quranService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen, Languages, ArrowLeft } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredAyahs, setFilteredAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSurah, setActiveSurah] = useState<number | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [showTranslation, setShowTranslation] = useState(true);
  const [readingMode, setReadingMode] = useState(false);
  // Increased the number of items per page to show more verses
  const itemsPerPage = 20;

  useEffect(() => {
    const loadSurahs = async () => {
      setLoading(true);
      const surahsData = await fetchSurahs();
      setSurahs(surahsData);
      setLoading(false);
    };
    
    loadSurahs();
  }, []);

  // Load ayahs when selectedSurah changes
  useEffect(() => {
    const loadAyahs = async () => {
      if (!selectedSurah) {
        // No surah selected, don't show any
        setFilteredAyahs([]);
        return;
      }
      
      setLoading(true);
      const surahNumber = parseInt(selectedSurah);
      
      try {
        // Directly fetch the selected surah with translation
        const ayahsData = await fetchSurah(surahNumber);
        setFilteredAyahs(ayahsData);
        
        // Auto-expand the selected surah
        setActiveSurah(surahNumber);
        
        // Reset to first page when filter changes
        setCurrentPage(1);
        
        // Set reading mode to true when a surah is selected
        setReadingMode(true);
        
        // Success toast
        const surahName = surahs.find(s => s.number === surahNumber)?.englishName || '';
        toast({
          title: `Surah ${surahName} loaded`,
          description: `Successfully loaded ${ayahsData.length} verses with translation`,
        });
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
      loadAyahs();
    }
  }, [selectedSurah, surahs]);

  // Calculate items range for pagination - Fixed to ensure all items are shown
  const calculateItemsRange = () => {
    const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
    const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, filteredAyahs.length);
    
    return {
      start: indexOfFirstItem,
      end: indexOfLastItem,
      items: filteredAyahs.slice(indexOfFirstItem, indexOfLastItem)
    };
  };

  const { start, end, items: currentAyahs } = calculateItemsRange();
  const totalPages = Math.ceil(filteredAyahs.length / itemsPerPage);

  // Handle pagination - Enhanced to ensure smooth scroll to top
  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    // Scroll to top of the content area
    document.querySelector('.quran-content-area')?.scrollTo(0, 0);
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === currentPage} 
            onClick={() => paginate(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  // Find surah name by surah number
  const getSurahName = (surahNumber: number) => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? `${surah.englishName} (${surah.name})` : '';
  };

  // Find surah translation by surah number
  const getSurahTranslation = (surahNumber: number) => {
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.englishNameTranslation : '';
  };

  // Toggle translation visibility
  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  // Exit reading mode
  const exitReadingMode = () => {
    setReadingMode(false);
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

      {/* Reading Mode - Full Screen Quran View */}
      {readingMode && !loading && selectedSurah && filteredAyahs.length > 0 && (
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
                {totalPages > 0 && `Page ${currentPage} of ${totalPages}`}
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
          
          {/* Quran Content - Fixed to ensure proper scrolling */}
          <div className="flex-1 overflow-auto quran-content-area">
            <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 lg:p-12 pb-32">
              {currentAyahs.map((ayah) => (
                <div key={ayah.number} className="p-4 md:p-6 bg-card border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-prayer-primary/10 text-prayer-primary px-3 py-1 rounded-full font-medium">
                      {ayah.numberInSurah}
                    </span>
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
              
              {/* Visual indicator for end of page */}
              <div className="text-center text-muted-foreground py-4">
                {currentPage < totalPages ? (
                  <p>Scroll down for more or use pagination below</p>
                ) : (
                  <p>End of Surah</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Fixed Footer with Pagination - Made more clearly visible */}
          {totalPages > 1 && (
            <div className="fixed bottom-0 left-0 right-0 p-6 border-t bg-background/95 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto gap-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1 mb-2 sm:mb-0">
                  Showing verses {start + 1}-{end} of {filteredAyahs.length}
                </div>
                
                <Pagination className="order-1 sm:order-2">
                  <PaginationContent className="flex-wrap gap-2">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => paginate(currentPage - 1)} 
                        className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} bg-muted/50 hover:bg-muted`}
                      />
                    </PaginationItem>
                    
                    {getPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => paginate(currentPage + 1)}
                        className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} bg-muted/50 hover:bg-muted`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results state */}
      {!loading && selectedSurah && filteredAyahs.length === 0 && !readingMode && (
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
