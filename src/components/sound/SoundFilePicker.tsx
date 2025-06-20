
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, File, Check } from 'lucide-react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/components/ui/use-toast';

interface SoundFilePickerProps {
  prayerId: string;
  prayerName: string;
  onSoundSelected: (soundPath: string, fileName: string) => void;
  selectedSoundPath?: string;
}

const SoundFilePicker = ({ prayerId, prayerName, onSoundSelected, selectedSoundPath }: SoundFilePickerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelection = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Not Supported",
        description: "File selection is only available on mobile devices",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create file input element for web fallback during development
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*,.mp3,.wav,.m4a';
      
      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
          // Validate file type
          if (!file.type.startsWith('audio/') && 
              !file.name.toLowerCase().endsWith('.mp3') && 
              !file.name.toLowerCase().endsWith('.wav') &&
              !file.name.toLowerCase().endsWith('.m4a')) {
            toast({
              title: "Invalid File",
              description: "Please select an audio file (MP3, WAV, or M4A)",
              variant: "destructive"
            });
            return;
          }

          // Read file as base64
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const base64Data = e.target?.result as string;
              const base64WithoutPrefix = base64Data.split(',')[1];
              
              // Create filename for the prayer-specific sound
              const fileName = `custom_${prayerId}_${Date.now()}.${file.name.split('.').pop()}`;
              const filePath = `sounds/${fileName}`;

              // Save file to app's data directory
              await Filesystem.writeFile({
                path: filePath,
                data: base64WithoutPrefix,
                directory: Directory.Data,
                encoding: Encoding.UTF8
              });

              // Store the file path preference
              const soundPath = `${Directory.Data}/${filePath}`;
              onSoundSelected(soundPath, fileName);

              toast({
                title: "Sound Selected",
                description: `Custom sound saved for ${prayerName} prayer`,
              });

            } catch (error) {
              console.error('Error saving sound file:', error);
              toast({
                title: "Error",
                description: "Failed to save the selected sound file",
                variant: "destructive"
              });
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: "Error",
            description: "Failed to process the selected file",
            variant: "destructive"
          });
        }
      };

      input.click();
    } catch (error) {
      console.error('Error selecting file:', error);
      toast({
        title: "Error",
        description: "Failed to open file selector",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Custom Sound</CardTitle>
        <CardDescription>
          Select a custom adhan sound for {prayerName} prayer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {selectedSoundPath && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">Custom sound selected</span>
            </div>
          )}
          
          <Button
            onClick={handleFileSelection}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Selecting...' : 'Select Audio File'}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Supported formats: MP3, WAV, M4A
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoundFilePicker;
