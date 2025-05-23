
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';

interface VideoPlayerProps {
  title: string;
  streamServers?: Array<{
    name: string;
    url: string;
    quality?: string;
    language?: string;
  }>;
  streamUrl?: string;
}

const VideoPlayer = ({ title, streamServers = [], streamUrl }: VideoPlayerProps) => {
  const [selectedServer, setSelectedServer] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('HD');
  const [selectedLanguage, setSelectedLanguage] = useState('Latino');

  const qualityOptions = ['HD', '720p', '480p'];
  const languageOptions = ['Latino', 'Subtitulado', 'Español'];

  // Use stream servers if available, otherwise fallback to single stream URL or default
  const availableServers = streamServers.length > 0 ? streamServers : [
    { name: 'Servidor Principal', url: streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
  ];
  
  const currentStreamUrl = availableServers[selectedServer]?.url || availableServers[0]?.url;

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
          key={currentStreamUrl}
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
          {availableServers.map((server, index) => (
            <Button
              key={index}
              onClick={() => setSelectedServer(index)}
              variant={selectedServer === index ? "default" : "outline"}
              size="sm"
              className={selectedServer === index
                ? "bg-cuevana-blue text-white"
                : "border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue"
              }
            >
              {server.name}
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
