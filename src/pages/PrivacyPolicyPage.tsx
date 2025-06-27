
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto px-4 py-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              How we protect your privacy
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                Privacy First Design
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Seura Salaat is designed with privacy in mind. We do not collect, store, or share any personal information from our users.
              </p>
            </CardContent>
          </Card>

          {/* Information We Don't Collect */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Information We Do NOT Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                We do not collect any personal information, including:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Personal identification (name, email, phone)</li>
                <li>• Location data</li>
                <li>• Usage analytics</li>
                <li>• Device information</li>
                <li>• Contact lists</li>
                <li>• Photos or media files</li>
              </ul>
            </CardContent>
          </Card>

          {/* How the App Works */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                How the App Works
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Seura Salaat operates primarily offline:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Prayer times are calculated locally on your device</li>
                <li>• All settings are stored locally only</li>
                <li>• No data is transmitted to servers</li>
                <li>• No user accounts required</li>
              </ul>
            </CardContent>
          </Card>

          {/* Local Notifications */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Local Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Prayer time notifications:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• Are generated entirely on your device</li>
                <li>• Do not involve external servers</li>
                <li>• Can be disabled in settings</li>
                <li>• Do not collect or transmit data</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Data Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                All app data is stored locally on your device, including prayer time settings, notification preferences, and app customization options. This data remains on your device and is never transmitted elsewhere.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Since we do not collect any personal data, there is no personal data for you to access, modify, or delete from our systems. All your app data remains under your control on your device.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="shadow-sm border-0 bg-white dark:bg-gray-800 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-2">
                annirstudio@gmail.com
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 pb-2">
          <p>Last updated: December 2024</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
