
import React, { useState, useEffect } from "react";
import { fetchSurahs, fetchSurah, Surah, Ayah } from "@/services/quranService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen, Languages } from "lucide-react";
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

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredAyahs, setFilteredAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSurah, setActiveSurah] = useState<number | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [showTranslation, setShowTranslation] = useState(true);
  const itemsPerPage = 10; // Reduced for better readability with translations

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

  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAyahs = filteredAyahs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAyahs.length / itemsPerPage);

  // Handle pagination
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
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

  return (
    <div className="flex flex-col pb-20">
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
        
        {/* Translation toggle button - only show when a surah is selected */}
        {selectedSurah && (
          <button 
            onClick={toggleTranslation}
            className="flex items-center gap-2 text-prayer-primary hover:text-prayer-secondary transition-colors mb-4"
          >
            <Languages size={18} />
            {showTranslation ? "Hide Translation" : "Show Translation"}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      )}

      {/* Empty State - When no surah is selected */}
      {!loading && !selectedSurah && (
        <div className="text-center p-12 border border-dashed rounded-lg mx-auto max-w-3xl">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Please Select a Surah</h3>
          <p className="text-muted-foreground">Choose a Surah from the dropdown above to start reading</p>
        </div>
      )}

      {/* Quran Content - Only show when a surah is selected */}
      {!loading && selectedSurah && filteredAyahs.length > 0 && (
        <>
          <Card className="mb-4">
            {/* Beautiful Surah Header */}
            <div className="bg-gradient-to-r from-prayer-light to-prayer-accent/30 p-6 border-b">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-prayer-secondary mb-1">
                  Surah {selectedSurah}: {getSurahName(parseInt(selectedSurah))}
                </h2>
                
                <div className="flex items-center justify-center gap-2 text-prayer-secondary/80">
                  <span className="text-lg font-medium">{getSurahTranslation(parseInt(selectedSurah))}</span>
                </div>
                
                <div className="mt-3 text-prayer-primary/90 text-sm font-medium">
                  Page {currentPage} of {totalPages} 
                  <span className="ml-2">
                    ({indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAyahs.length)} of {filteredAyahs.length} verses)
                  </span>
                </div>
              </div>
            </div>
            
            <CardContent className="p-6">
              <ScrollArea className="h-[calc(70vh-180px)]">
                <div className="space-y-6">
                  {currentAyahs.map((ayah) => (
                    <div key={ayah.number} className="p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-prayer-primary/10 text-prayer-primary px-3 py-1 rounded-full font-medium">
                          {ayah.numberInSurah}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          <span>Page {ayah.page} · Juz {ayah.juz}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Arabic Text */}
                        <div className="mb-3">
                          <p dir="rtl" className="text-right text-xl font-arabic leading-loose">
                            {ayah.text}
                          </p>
                        </div>
                        
                        {/* Translation Text - conditionally rendered */}
                        {showTranslation && ayah.translation && (
                          <div className="pt-3 border-t border-dashed border-muted">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {ayah.translation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Pagination - Only show when there are results */}
          {totalPages > 1 && (
            <Pagination className="my-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && paginate(currentPage - 1)} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {getPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* No results state */}
      {!loading && selectedSurah && filteredAyahs.length === 0 && (
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
