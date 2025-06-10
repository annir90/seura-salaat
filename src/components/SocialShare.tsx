
import { useState } from "react";
import { Share2, ExternalLink } from "lucide-react";
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
      // Check if native sharing is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("App shared successfully! 🎉");
      } else if (navigator.share) {
        // Try sharing without checking canShare (for broader compatibility)
        await navigator.share(shareData);
        toast.success("App shared successfully! 🎉");
      } else {
        // Show user that native sharing is not available
        toast.error("Native sharing not supported on this device. Please share manually: " + shareData.url);
      }
    } catch (error) {
      // Handle user cancellation gracefully
      if (error.name === 'AbortError') {
        // User cancelled the share - don't show error
        console.log('Share cancelled by user');
      } else {
        console.error('Error sharing:', error);
        toast.error("Sharing failed. Native sharing may not be available on this device.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button 
      onClick={handleNativeShare}
      disabled={isSharing}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white flex items-center justify-center gap-3 w-full h-12 text-base font-medium shadow-lg rounded-xl transition-all duration-300"
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
