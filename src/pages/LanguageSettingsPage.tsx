
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    
    const languageName = languages.find(l => l.code === newLanguage)?.name;
    toast.success(`Language updated to ${languageName}`);
    
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'app-language',
      newValue: newLanguage,
      oldValue: getCurrentLanguage()
    }));
    
    // Small delay to show toast before reload
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const getCurrentLanguageDisplay = () => {
    const current = languages.find(l => l.code === currentLanguage);
    return current ? `${current.flag} ${current.name}` : 'Select language';
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
            <div className="space-y-4">
              <Label htmlFor="language-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Language
              </Label>
              <Select
                value={currentLanguage}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder={getCurrentLanguageDisplay()}>
                    {getCurrentLanguageDisplay()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  {languages.map((language) => (
                    <SelectItem 
                      key={language.code} 
                      value={language.code}
                      className="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                        {currentLanguage === language.code && (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LanguageSettingsPage;
