
import React from "react";
import { ArrowLeft, Heart, Users, Clock, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslation } from "@/services/translationService";

const AboutPage = () => {
  const navigate = useNavigate();
  const t = getTranslation();

  const features = [
    {
      icon: Clock,
      title: t.prayerTimes,
      description: "Accurate prayer times based on your location"
    },
    {
      icon: Book,
      title: t.quran,
      description: "Read the Holy Quran with beautiful typography"
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with fellow Muslims in your area"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => navigate('/settings')}
        >
          <ArrowLeft size={20} />
          {t.back}
        </Button>
        <h1 className="text-lg font-semibold">{t.about}</h1>
        <div className="w-16"></div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* App Info */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-prayer-primary rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Seura Salaat</h2>
            <p className="text-muted-foreground">
              A beautiful Islamic app for prayer times, Quran reading, and spiritual guidance
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{t.features}</h3>
          <div className="grid gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 bg-prayer-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-prayer-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t.version}</span>
            <span className="font-medium">seurasalaat</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Developer</span>
            <span className="font-medium">Seura Team</span>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-prayer-primary">
            <Heart className="h-5 w-5" />
            <span className="font-medium">Made with love for the Muslim community</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our mission is to help Muslims maintain their spiritual connection through technology, 
            providing accurate prayer times, easy access to the Quran, and tools for spiritual growth.
          </p>
        </div>

        {/* Contact */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            May Allah accept our efforts and guide us all.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
