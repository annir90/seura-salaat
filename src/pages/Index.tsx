
import { useState, useEffect } from "react";
import { getPrayerTimes, getDateForHeader, PrayerTime } from "@/services/prayerTimeService";
import PrayerCard from "@/components/PrayerCard";
import { Loader2, CalendarDays, Clock } from "lucide-react";

const Index = () => {
  const [currentDate, setCurrentDate] = useState("");
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Expanded hadith collection with Arabic and English (20 hadiths)
  const hadiths = [
    {
      english: "The Prophet (peace be upon him) said: 'Prayer is the pillar of religion.'"
      arabic:           "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الصَّلَاةُ عِمَادُ الدِّينِ"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ الصَّلَاةُ",
      english: "The Prophet (peace be upon him) said: 'The first thing a person will be held accountable for on the Day of Judgment is prayer.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ حَافَظَ عَلَى الصَّلَوَاتِ الْخَمْسِ كَانَتْ لَهُ نُورًا وَبُرْهَانًا وَنَجَاةً يَوْمَ الْقِيَامَةِ",
      english: "The Prophet (peace be upon him) said: 'Whoever maintains the five prayers, they will be a light, proof, and salvation for him on the Day of Judgment.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
      english: "The Prophet (peace be upon him) said: 'Actions are but by intention.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا",
      english: "The Prophet (peace be upon him) said: 'The believer to another believer is like a building whose different parts enforce each other.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
      english: "The Prophet (peace be upon him) said: 'Whoever believes in Allah and the Last Day should speak good or remain silent.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      english: "The Prophet (peace be upon him) said: 'None of you truly believes until he loves for his brother what he loves for himself.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
      english: "The Prophet (peace be upon him) said: 'The world is a prison for the believer and paradise for the disbeliever.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ",
      english: "The Prophet (peace be upon him) said: 'Be conscious of Allah wherever you are.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: خَيْرُ النَّاسِ مَنْ نَفَعَ النَّاسَ",
      english: "The Prophet (peace be upon him) said: 'The best of people are those who benefit others.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ",
      english: "The Prophet (peace be upon him) said: 'Seeking knowledge is obligatory upon every Muslim.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْحَيَاءُ شُعْبَةٌ مِنَ الْإِيمَانِ",
      english: "The Prophet (peace be upon him) said: 'Modesty is a branch of faith.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا",
      english: "The Prophet (peace be upon him) said: 'Whoever sends blessings upon me once, Allah will send blessings upon him ten times.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الصَّبْرُ مِفْتَاحُ الْفَرَجِ",
      english: "The Prophet (peace be upon him) said: 'Patience is the key to relief.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ تَوَاضَعَ لِلَّهِ رَفَعَهُ",
      english: "The Prophet (peace be upon him) said: 'Whoever humbles himself for Allah, Allah will elevate him.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
      english: "The Prophet (peace be upon him) said: 'A Muslim is one from whose tongue and hand other Muslims are safe.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ",
      english: "The Prophet (peace be upon him) said: 'Paradise lies at the feet of mothers.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      english: "The Prophet (peace be upon him) said: 'O Allah, help me to remember You, thank You, and worship You in the best manner.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: مَنْ قَالَ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ دَخَلَ الْجَنَّةَ",
      english: "The Prophet (peace be upon him) said: 'Whoever says there is no god but Allah alone, with no partner, will enter Paradise.'"
    },
    {
      arabic: "قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ: أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ",
      english: "The Prophet (peace be upon him) said: 'The most beloved deeds to Allah are those that are most consistent, even if they are few.'"
    }
  ];
  
  const [currentHadith, setCurrentHadith] = useState(0);
  
  // Load prayer times
  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      const times = await getPrayerTimes();
      setPrayerTimes(times);
      const formattedDate = await getDateForHeader();
      setCurrentDate(formattedDate);
    } catch (error) {
      console.error("Error loading prayer times:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadPrayerTimes();
  }, []);
  
  // Update prayer times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      loadPrayerTimes();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Rotate hadith every 15 seconds for more consistent viewing
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHadith((prev) => (prev + 1) % hadiths.length);
    }, 15000);
    
    return () => clearInterval(interval);
  }, [hadiths.length]);

  // Check if today is Friday
  const isFriday = () => {
    const today = new Date();
    return today.getDay() === 5;
  };
  
  return (
    <div className="flex flex-col">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-prayer-primary" />
        </div>
      ) : (
        <>
          <div className="bg-gradient-purple rounded-2xl p-6 text-white mb-6 shadow-lg">
            <div className="text-center space-y-4">
              <div>
                <p dir="rtl" className="text-right text-xl font-arabic leading-loose mb-3">
                  {hadiths[currentHadith].arabic}
                </p>
                <p className="text-sm opacity-90 leading-relaxed">
                  {hadiths[currentHadith].english}
                </p>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                {hadiths.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentHadith ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="font-semibold text-xl mb-3 text-foreground">Prayer Schedule</h2>
            {prayerTimes.map((prayer) => (
              <PrayerCard key={prayer.id} prayer={prayer} />
            ))}
          </div>

          {isFriday() && (
            <div className="bg-prayer-primary/10 dark:bg-prayer-primary/20 rounded-lg p-4 mb-4 border border-prayer-primary/20 dark:border-prayer-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-5 w-5 text-prayer-primary" />
                <h3 className="font-semibold text-lg text-foreground">Jumaa Prayer</h3>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-prayer-primary" />
                  <p className="text-muted-foreground">Prayer time: <span className="font-medium text-foreground">13:30</span></p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Join us for Friday prayer (Salat al-Jumaa) at the mosque. Remember to arrive early for the khutbah.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
