
import React, { useState, useEffect } from "react";
import { fetchSurahs, fetchSurah, Surah, Ayah } from "@/services/quranService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen, Translate } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <Translate size={18} />
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
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Surah {selectedSurah}: {getSurahName(parseInt(selectedSurah))}
                  </h2>
                  
                  {/* Surah info */}
                  <div className="text-sm text-muted-foreground mt-1">
                    {surahs.find(s => s.number === parseInt(selectedSurah))?.englishNameTranslation} • {
                      surahs.find(s => s.number === parseInt(selectedSurah))?.revelationType
                    }
                  </div>
                </div>
                
                <p className="text-muted-foreground mt-2 md:mt-0">
                  Page {currentPage} of {totalPages} 
                  <span className="ml-2">
                    ({indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAyahs.length)} of {filteredAyahs.length} verses)
                  </span>
                </p>
              </div>
              
              <Table className="border-collapse border border-muted rounded-md overflow-hidden">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-16 text-center">Verse</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead className="w-20 text-right">Page/Juz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAyahs.map((ayah) => (
                    <TableRow key={ayah.number} className="border-b border-muted">
                      <TableCell className="text-prayer-primary font-medium text-center">
                        {ayah.numberInSurah}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-3">
                          {/* Arabic Text */}
                          <p dir="rtl" className="text-right text-xl font-arabic leading-loose mb-2">
                            {ayah.text}
                          </p>
                          
                          {/* Translation Text - conditionally rendered */}
                          {showTranslation && ayah.translation && (
                            <p className="text-muted-foreground text-sm leading-relaxed pt-2 border-t border-dashed border-muted">
                              {ayah.translation}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <div className="text-xs">Page {ayah.page}</div>
                        <div className="text-xs">Juz {ayah.juz}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
