
import { useState, useRef } from "react";
import { SoundOption } from "./soundOptions";

export const useSoundPlayer = () => {
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingSound(null);
  };

  const playSound = async (soundOption: SoundOption) => {
    try {
      console.log(`Attempting to play sound: ${soundOption.name} (${soundOption.file})`);
      
      // Stop current audio if playing
      stopCurrentAudio();

      if (playingSound === soundOption.id) {
        // If the same sound is playing, stop it
        console.log('Stopping currently playing sound');
        return;
      }

      // Create new audio element
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set up audio properties
      audio.preload = 'auto';
      audio.volume = 0.8;
      audio.crossOrigin = 'anonymous';
      
      // Set up event listeners first
      audio.addEventListener('loadstart', () => {
        console.log(`Loading sound: ${soundOption.name}`);
      });

      audio.addEventListener('canplaythrough', () => {
        console.log(`Sound ready to play: ${soundOption.name}`);
        audio.play()
          .then(() => {
            setPlayingSound(soundOption.id);
            console.log(`Successfully playing sound: ${soundOption.name}`);
          })
          .catch((error) => {
            console.error("Error playing sound:", error);
            setPlayingSound(null);
            
            // For mobile devices that require user interaction
            if (error.name === 'NotAllowedError') {
              console.log('Autoplay prevented, user interaction required');
              // The user will need to tap the play button again
              setPlayingSound(null);
            }
          });
      });

      // When audio ends, reset playing state
      audio.addEventListener('ended', () => {
        console.log(`Sound ended: ${soundOption.name}`);
        setPlayingSound(null);
        audioRef.current = null;
      });

      // Handle audio errors
      audio.addEventListener('error', (e) => {
        console.error("Audio error for:", soundOption.file, e);
        setPlayingSound(null);
        audioRef.current = null;
      });

      // Set source and load
      audio.src = soundOption.file;
      console.log(`Loading audio from: ${soundOption.file}`);
      audio.load();

    } catch (error) {
      console.error("Error in playSound:", error);
      setPlayingSound(null);
    }
  };

  return {
    playingSound,
    playSound,
    stopCurrentAudio
  };
};
