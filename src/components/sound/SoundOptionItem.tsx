
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { SoundOption } from "./soundOptions";

interface SoundOptionItemProps {
  soundOption: SoundOption;
  selectedSoundId?: string;
  playingSound: string | null;
  onSelect: (soundId: string) => void;
  onPlay: (soundOption: SoundOption) => void;
}

const SoundOptionItem = ({ 
  soundOption, 
  selectedSoundId, 
  playingSound, 
  onSelect, 
  onPlay 
}: SoundOptionItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
        selectedSoundId === soundOption.id
          ? "border-prayer-primary bg-prayer-primary/5"
          : "border-border hover:bg-accent"
      )}
      onClick={() => onSelect(soundOption.id)}
    >
      <div className="flex-1">
        <h4 className="font-medium text-sm">{soundOption.name}</h4>
        <p className="text-xs text-muted-foreground">{soundOption.description}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2"
        onClick={(e) => {
          e.stopPropagation();
          onPlay(soundOption);
        }}
      >
        {playingSound === soundOption.id ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default SoundOptionItem;
