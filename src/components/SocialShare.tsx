
import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/services/translationService";

const SocialShare = () => {
  const t = getTranslation();

  const shareData = {
    title: "Seura Prayer - Prayer Times App",
    text: "Check out this great app for prayer times and reminders:",
    url: "https://d7360491-a249-4f6e-9474-c67ad3a482a2.lovableproject.com",
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        const shareText = `${shareData.text} ${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        console.log('Link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  return (
    <Button 
      onClick={handleNativeShare}
      className="bg-prayer-primary hover:bg-prayer-primary/90 flex items-center gap-2 w-full"
    >
      <Share2 className="h-4 w-4" />
      {t.shareAppButton}
    </Button>
  );
};

export default SocialShare;
