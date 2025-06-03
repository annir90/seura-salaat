
import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getTranslation } from "@/services/translationService";

const SocialShare = () => {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslation();

  const shareData = {
    title: "Seura Prayer",
    text: "Check out this amazing prayer times app!",
    url: window.location.href,
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: "📱",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`
    },
    {
      name: "Telegram",
      icon: "✈️",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
    },
    {
      name: "Twitter",
      icon: "🐦",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
    },
    {
      name: "Email",
      icon: "📧",
      url: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`
    },
    {
      name: "SMS",
      icon: "💬",
      url: `sms:?body=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`
    }
  ];

  const handleShare = (platform: typeof socialPlatforms[0]) => {
    if (navigator.share && platform.name === "Native") {
      navigator.share(shareData);
    } else {
      window.open(platform.url, '_blank');
    }
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setIsOpen(false);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-prayer-primary hover:bg-prayer-primary/90 flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          {t.shareAppButton}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.shareApp}</DialogTitle>
          <DialogDescription>
            {t.shareAppDesc}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <span className="text-2xl mb-1">📤</span>
              <span className="text-xs font-medium">Share</span>
            </button>
          )}
          {socialPlatforms.map((platform) => (
            <button
              key={platform.name}
              onClick={() => handleShare(platform)}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <span className="text-2xl mb-1">{platform.icon}</span>
              <span className="text-xs font-medium">{platform.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShare;
