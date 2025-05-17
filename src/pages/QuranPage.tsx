
import React, { useState, useEffect } from "react";
import { fetchSurahs, fetchEntireQuran, Surah, Ayah } from "@/services/quranService";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, BookOpen } from "lucide-react";
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

const QuranPage = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [allAyahs, setAllAyahs] = useState<Ayah[]>([]);
  const [filteredAyahs, setFilteredAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSurah, setActiveSurah] = useState<number | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<string>("all");
  const itemsPerPage = 20;

  useEffect(() => {
    const loadQuranData = async () => {
      setLoading(true);
      
      // Load surahs for reference data
      const surahsData = await fetchSurahs();
      setSurahs(surahsData);
      
      // Load all ayahs
      const ayahsData = await fetchEntireQuran();
      setAllAyahs(ayahsData);
      setFilteredAyahs(ayahsData);
      
      setLoading(false);
    };
    
    loadQuranData();
  }, []);

  // Filter ayahs when selectedSurah changes
  useEffect(() => {
    if (selectedSurah === "all") {
      setFilteredAyahs(allAyahs);
    } else {
      const surahNumber = parseInt(selectedSurah);
      const filtered = allAyahs.filter(ayah => ayah.surah === surahNumber);
      setFilteredAyahs(filtered);
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
    // Auto-expand the selected surah
    setActiveSurah(selectedSurah === "all" ? null : parseInt(selectedSurah));
  }, [selectedSurah, allAyahs]);

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

  // Toggle surah expansion
  const toggleSurah = (surahNumber: number) => {
    if (activeSurah === surahNumber) {
      setActiveSurah(null);
    } else {
      setActiveSurah(surahNumber);
    }
  };

  return (
    <div className="flex flex-col pb-20">
      <div className="text-center mb-6 flex flex-col items-center">
        <div className="bg-prayer-primary w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Noble Quran</h1>
        <p className="text-muted-foreground mb-4">Complete Quran View</p>
        
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
              <SelectItem value="all">All Surahs</SelectItem>
              {surahs.map((surah) => (
                <SelectItem key={surah.number} value={surah.number.toString()}>
                  {surah.number}. {surah.englishName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      )}

      {/* Quran Content */}
      {!loading && (
        <>
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedSurah === "all" 
                  ? "The Noble Quran" 
                  : `Surah ${selectedSurah}: ${getSurahName(parseInt(selectedSurah))}`}
              </h2>
              <p className="text-muted-foreground mb-2">
                Viewing page {currentPage} of {totalPages}
              </p>
              <p className="text-muted-foreground mb-4">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAyahs.length)} of {filteredAyahs.length} verses
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Verse</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead className="w-20 text-right">Page</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAyahs.map((ayah, index) => {
                    const previousAyah = index > 0 ? currentAyahs[index - 1] : null;
                    const isNewSurah = !previousAyah || previousAyah.surah !== ayah.surah;
                    
                    return (
                      <React.Fragment key={ayah.number}>
                        {isNewSurah && selectedSurah === "all" && (
                          <TableRow 
                            className="bg-prayer-primary/10 cursor-pointer hover:bg-prayer-primary/20"
                            onClick={() => toggleSurah(ayah.surah!)}
                          >
                            <TableCell colSpan={3} className="py-2">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold">
                                  Surah {ayah.surah}: {getSurahName(ayah.surah!)}
                                </span>
                                <span className="text-xs">
                                  {activeSurah === ayah.surah ? "▲" : "▼"}
                                </span>
                              </div>
                              {activeSurah === ayah.surah && (
                                <div className="text-sm mt-1 text-muted-foreground">
                                  {surahs.find(s => s.number === ayah.surah)?.englishNameTranslation || ''} • {
                                    surahs.find(s => s.number === ayah.surah)?.revelationType || ''
                                  }
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell className="text-prayer-primary font-medium">
                            {ayah.numberInSurah}
                          </TableCell>
                          <TableCell>
                            <p dir="rtl" className="text-right text-lg font-arabic leading-loose">
                              {ayah.text}
                            </p>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            <div className="text-xs">Page {ayah.page}</div>
                            <div className="text-xs">Juz {ayah.juz}</div>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Pagination */}
          <Pagination>
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
        </>
      )}

      {/* Empty State - should never show if properly loaded */}
      {!loading && filteredAyahs.length === 0 && (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Quran Data Available</h3>
          <p className="text-muted-foreground">There was a problem loading the Quran. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default QuranPage;
