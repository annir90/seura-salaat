
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/services/translationService";

const AboutPage = () => {
  const navigate = useNavigate();
  const t = getTranslation();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => navigate('/settings')}
        >
          <ArrowLeft size={20} />
          Back
        </Button>
        <h1 className="text-lg font-semibold">{t.about}</h1>
        <div className="w-16"></div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground leading-relaxed mb-6">
            Our aim is to support Muslims in practicing their faith by providing accurate prayer times, useful tools, and reminders based on local schedules.
          </p>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            This app is part of the initiative of the Albanian Islamic Community in Finland, a non-profit organization that serves the spiritual and social needs of Albanian Muslims living in the country.
          </p>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            We are dedicated to:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
            <li>Preserving Islamic values and identity</li>
            <li>Supporting community connection and unity</li>
            <li>Making it easier for users to stay on time for prayers</li>
            <li>Offering features with simplicity, privacy, and clarity</li>
          </ul>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            If you'd like to support our work, feel free to explore the donation option within the app.
          </p>
          
          <p className="text-muted-foreground leading-relaxed italic text-center">
            May Allah bless you and reward your efforts
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
