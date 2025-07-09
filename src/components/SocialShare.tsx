
import { useState } from "react";
import { Share2, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share } from '@capacitor/share';
import { getTranslation } from "@/services/translationService";

const SocialShare = () => {
  const t = getTranslation();
  const [isSharing, setIsSharing] = useState(false);

  const shareData = {
    title: "Seura Salaat",
    text: "Check out this beautiful prayer app!",
    url: "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME",
    dialogTitle: "Share Seura Salaat with your friends"
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    
    try {
      // Use Capacitor Share plugin
      await Share.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
        dialogTitle: shareData.dialogTitle
      });
      toast.success("App shared successfully! 🎉");
    } catch (error) {
      console.error('Error sharing:', error);
      // Handle user cancellation gracefully
      if (error && error.message && error.message.includes('cancelled')) {
        console.log('Share cancelled by user');
        // Don't show error for user cancellation
      } else {
        // Try clipboard as fallback
        try {
          await navigator.clipboard.writeText(shareData.url);
          toast.success("App URL copied to clipboard! 📋");
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          toast.error("Unable to share. Please copy this URL manually: " + shareData.url);
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
