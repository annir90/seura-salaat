
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrayerTime } from "@/services/prayerTimeService";
import { getTranslation } from "@/services/translationService";

interface PrayerCardProps {
  prayer: PrayerTime;
}

const PrayerCard = ({ prayer }: PrayerCardProps) => {
  const t = getTranslation();

  return (
    <Card className={`mb-4 ${prayer.isNext ? 'border-l-4 border-l-orange-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {prayer.name}
                  {prayer.isNext && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs animate-pulse">
                      Next
                    </Badge>
                  )}
                </h3>
                <p className="text-prayer-primary font-semibold text-lg">{prayer.time}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerCard;
