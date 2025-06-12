
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  setLanguage, 
  getCurrentLanguage, 
  getTranslation, 
  LanguageCode 
} from "@/services/translationService";

const LanguageSettingsPage = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
  const t = getTranslation();

  const languages = [
    { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
    { code: 'fi' as LanguageCode, name: 'Suomi', flag: '🇫🇮' },
    { code: 'sq' as LanguageCode, name: 'Shqip', flag: '🇦🇱' }
  ];

  const handleLanguageChange = (languageCode: string) => {
    const newLanguage = languageCode as LanguageCode;
    setLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    toast.success(`Language updated to ${languages.find(l => l.code === newLanguage)?.name}`);
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t.language}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Choose your preferred language
            </p>
          </div>
        </div>

        <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
          <CardContent className="p-6">
            <RadioGroup
              value={currentLanguage}
              onValueChange={handleLanguageChange}
              className="space-y-4"
            >
              {languages.map((language) => (
                <div key={language.code} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <RadioGroupItem value={language.code} id={language.code} />
                  <Label htmlFor={language.code} className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-2xl">{language.flag}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {language.name}
                    </span>
                  </Label>
                  {currentLanguage === language.code && (
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  )}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LanguageSettingsPage;
