
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
      // Stop current audio if playing
      stopCurrentAudio();

      if (playingSound === soundOption.id) {
        // If the same sound is playing, stop it
        return;
      }

      // Create new audio element with better mobile support
      const audio = new Audio();
      audioRef.current = audio;
      
      // Enhanced audio setup for mobile devices
      audio.preload = 'metadata';
      audio.volume = 0.8;
      audio.crossOrigin = 'anonymous';
      
      // Add user interaction for mobile Safari
      const playPromise = () => {
        return new Promise<void>((resolve, reject) => {
          const attemptPlay = () => {
            audio.play()
              .then(() => {
                setPlayingSound(soundOption.id);
                console.log(`Playing sound: ${soundOption.name}`);
                resolve();
              })
              .catch((error) => {
                console.error("Error playing sound:", error);
                // Try to play with user gesture
                if (error.name === 'NotAllowedError') {
                  // Create a temporary button for user interaction
                  const playButton = document.createElement('button');
                  playButton.textContent = 'Tap to play sound';
                  playButton.style.position = 'fixed';
                  playButton.style.top = '50%';
                  playButton.style.left = '50%';
                  playButton.style.transform = 'translate(-50%, -50%)';
                  playButton.style.zIndex = '9999';
                  playButton.style.padding = '10px';
                  playButton.style.backgroundColor = '#007bff';
                  playButton.style.color = 'white';
                  playButton.style.border = 'none';
                  playButton.style.borderRadius = '5px';
                  
                  playButton.onclick = () => {
                    audio.play().then(() => {
                      setPlayingSound(soundOption.id);
                      document.body.removeChild(playButton);
                      resolve();
                    }).catch(reject);
                  };
                  
                  document.body.appendChild(playButton);
                  
                  // Auto-remove after 5 seconds
                  setTimeout(() => {
                    if (document.body.contains(playButton)) {
                      document.body.removeChild(playButton);
                      reject(new Error('User interaction timeout'));
                    }
                  }, 5000);
                } else {
                  reject(error);
                }
              });
          };
          
          attemptPlay();
        });
      };

      // Set up event listeners
      audio.addEventListener('loadstart', () => {
        console.log(`Loading sound: ${soundOption.name}`);
      });

      audio.addEventListener('canplay', async () => {
        console.log(`Sound ready to play: ${soundOption.name}`);
        try {
          await playPromise();
        } catch (error) {
          console.error("Failed to play after loading:", error);
          setPlayingSound(null);
        }
      });

      // When audio ends, reset playing state
      audio.addEventListener('ended', () => {
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
