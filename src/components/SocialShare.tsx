
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
    text: "Check out this amazing prayer times app! 🕌",
    url: window.location.origin,
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    
    try {
      // Check if native sharing is available
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("App shared successfully! 🎉");
      } else {
        // Fallback for desktop: copy to clipboard
        const shareText = `${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copied to clipboard! 📋");
      }
    } catch (error) {
      // Handle user cancellation or other errors
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Final fallback: copy to clipboard
        try {
          const shareText = `${shareData.text}\n${shareData.url}`;
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
      className="bg-prayer-primary hover:bg-prayer-primary/90 flex items-center gap-3 w-full h-12 text-base font-medium shadow-lg"
    >
      {isSharing ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          Sharing...
        </>
      ) : (
        <>
          <Share2 className="h-5 w-5" />
          Share App
          <ExternalLink className="h-4 w-4 opacity-60" />
        </>
      )}
    </Button>
  );
};

export default SocialShare;
