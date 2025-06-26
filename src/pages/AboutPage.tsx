
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Mail, Info, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutPage = () => {
  const navigate = useNavigate();

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
              About
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Learn more about our organization
            </p>
          </div>
        </div>

        <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              About Us
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  We are the <strong>Albanian Islamic Cultural Center</strong> (Albaanien Islami Kulttuuri Keskus AIKK ry), 
                  serving the Muslim community in Finland.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our goal is to promote Islamic education, preserve cultural identity, and provide support 
                  for the Albanian-speaking Muslims in Finland.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">PrayConnect Purpose</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    PrayConnect is designed to help Muslims maintain their daily prayers with accurate prayer times, 
                    Qibla direction, and spiritual tools. We strive to make Islamic practices more accessible in the digital age.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Email</h4>
                  <a 
                    href="mailto:hyvinkaaislamkeskus@gmail.com" 
                    className="inline-flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    hyvinkaaislamkeskus@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">Website</h4>
                  <a 
                    href="https://hyvinkaaislamkeskus.fi/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    hyvinkaaislamkeskus.fi
                  </a>
                </div>
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="font-medium">PrayConnect v1.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
