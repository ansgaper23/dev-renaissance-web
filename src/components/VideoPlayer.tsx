
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  streamUrls?: {
    [key: string]: string;
  };
}

const VideoPlayer = ({ title, streamUrls }: VideoPlayerProps) => {
  const [selectedQuality, setSelectedQuality] = useState('HD');
  const [selectedLanguage, setSelectedLanguage] = useState('Latino');

  const qualityOptions = ['HD', '720p', '480p'];
  const languageOptions = ['Latino', 'Subtitulado', 'Español'];

  // Mock stream URL - en producción esto vendría de tu base de datos
  const currentStreamUrl = streamUrls?.hd || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <div className="w-full">
      {/* Quality and Language Selectors */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-cuevana-white text-sm font-medium">Calidad:</span>
          {qualityOptions.map((quality) => (
            <Button
              key={quality}
              onClick={() => setSelectedQuality(quality)}
              variant={selectedQuality === quality ? "default" : "outline"}
              size="sm"
              className={selectedQuality === quality 
                ? "bg-cuevana-blue text-white" 
                : "border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-gray-200"
              }
            >
              {quality}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-cuevana-white text-sm font-medium">Idioma:</span>
          {languageOptions.map((language) => (
            <Button
              key={language}
              onClick={() => setSelectedLanguage(language)}
              variant={selectedLanguage === language ? "default" : "outline"}
              size="sm"
              className={selectedLanguage === language 
                ? "bg-cuevana-gold text-cuevana-bg" 
                : "border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-gray-200"
              }
            >
              {language}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full"
          poster="https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg"
        >
          <source src={currentStreamUrl} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        
        {/* Custom overlay for branding */}
        <div className="absolute top-4 left-4 bg-cuevana-bg/80 text-cuevana-white text-sm px-3 py-1 rounded">
          CineExplorer
        </div>
      </div>

      {/* Server Options */}
      <div className="mt-4 p-4 bg-cuevana-gray-100 rounded-lg">
        <h4 className="text-cuevana-white font-medium mb-3">Servidores Disponibles:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Servidor 1', 'Servidor 2', 'Servidor 3', 'Fembed'].map((server, index) => (
            <Button
              key={server}
              variant="outline"
              size="sm"
              className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue"
            >
              {server}
            </Button>
          ))}
        </div>
      </div>

      {/* Download Options */}
      <div className="mt-4 p-4 bg-cuevana-gray-100 rounded-lg">
        <h4 className="text-cuevana-white font-medium mb-3">Descargar:</h4>
        <div className="flex flex-wrap gap-2">
          {['1080p', '720p', '480p'].map((quality) => (
            <Button
              key={quality}
              variant="outline"
              size="sm"
              className="border-cuevana-gold text-cuevana-gold hover:bg-cuevana-gold hover:text-cuevana-bg"
            >
              Descargar {quality}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
