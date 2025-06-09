
import { useState } from "react";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTranslation } from "@/services/translationService";

const SocialShare = () => {
  const t = getTranslation();
  const [isSharing, setIsSharing] = useState(false);

  const shareData = {
    title: "PrayConnect - Prayer Times App",
    text: "Check out this amazing prayer times app! 🕌 Download PrayConnect for accurate prayer times and Islamic features.",
    url: window.location.origin,
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    
    try {
      // Check if native sharing is available (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("App shared successfully! 🎉");
      } else {
        // Fallback: copy to clipboard for desktop
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copied to clipboard! 📋");
      }
    } catch (error) {
      // Handle user cancellation or other errors
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Final fallback: copy to clipboard
        try {
          const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
          await navigator.clipboard.writeText(shareText);
          toast.success("Link copied to clipboard! 📋");
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          toast.error("Failed to share. Please try again.");
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button 
      onClick={handleNativeShare}
      disabled={isSharing}
      className="bg-gradient-to-r from-prayer-primary to-prayer-secondary hover:from-prayer-primary/90 hover:to-prayer-secondary/90 text-white flex items-center justify-center gap-3 w-full h-12 text-base font-medium shadow-lg rounded-xl transition-all duration-300"
    >
      {isSharing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          <span>Sharing...</span>
        </>
      ) : (
        <>
          <Share2 className="h-5 w-5" />
          <span>Share App</span>
          <ExternalLink className="h-4 w-4 opacity-70" />
        </>
      )}
    </Button>
  );
};

export default SocialShare;
