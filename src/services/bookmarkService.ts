
export interface VerseBookmark {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

const BOOKMARK_KEY = 'quran_verse_bookmark';

export const saveBookmark = (surahNumber: number, ayahNumber: number): void => {
  const bookmark: VerseBookmark = {
    surahNumber,
    ayahNumber,
    timestamp: Date.now()
  };
  
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark));
    console.log(`Bookmark saved: Surah ${surahNumber}, Ayah ${ayahNumber}`);
  } catch (error) {
    console.error('Error saving bookmark:', error);
  }
};

export const getBookmark = (): VerseBookmark | null => {
  try {
    const bookmarkData = localStorage.getItem(BOOKMARK_KEY);
    if (bookmarkData) {
      return JSON.parse(bookmarkData);
    }
  } catch (error) {
    console.error('Error retrieving bookmark:', error);
  }
  return null;
};

export const clearBookmark = (): void => {
  try {
    localStorage.removeItem(BOOKMARK_KEY);
    console.log('Bookmark cleared');
  } catch (error) {
    console.error('Error clearing bookmark:', error);
  }
};
