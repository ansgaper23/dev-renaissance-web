
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Use stream servers if available, otherwise fallback to single stream URL or default
  const availableServers = streamServers && streamServers.length > 0 ? streamServers : 
    streamUrl ? [{ name: 'Servidor Principal', url: streamUrl }] : [
      { name: 'Servidor Demo', url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
    ];
  
  console.log("VideoPlayer - Stream servers received:", streamServers);
  console.log("VideoPlayer - Available servers:", availableServers);
  
  // Extract unique qualities and languages from available servers
  const availableQualities = [...new Set(availableServers.map(server => server.quality).filter(Boolean))];
  const availableLanguages = [...new Set(availableServers.map(server => server.language).filter(Boolean))];

  // Set initial quality and language based on first server
  useEffect(() => {
    if (availableServers.length > 0) {
      const firstServer = availableServers[0];
      setSelectedQuality(firstServer.quality || '');
      setSelectedLanguage(firstServer.language || '');
    }
  }, [availableServers]);

  const currentStreamUrl = availableServers[selectedServer]?.url || availableServers[0]?.url;
  console.log("VideoPlayer - Current stream URL:", currentStreamUrl);

  const hasValidServers = streamServers && streamServers.length > 0 && streamServers.some(server => server.url && server.url.trim() !== '');

  const handleServerChange = (index: number) => {
    console.log("Selecting server:", index, availableServers[index]);
    setSelectedServer(index);
    const server = availableServers[index];
    if (server.quality) setSelectedQuality(server.quality);
    if (server.language) setSelectedLanguage(server.language);
  };

  // Function to determine if URL needs iframe or video tag
  const getVideoElement = (url: string) => {
    if (!url) return null;

    // Check for iframe-compatible URLs (swiftplayers, etc.)
    if (url.includes('swiftplayers.com') || url.includes('streamtape.com') || url.includes('doodstream.com') || url.includes('mixdrop.co') || url.includes('fembed.com')) {
      return (
        <iframe
          key={url}
          src={url}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    // Check if it's a YouTube URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
      return (
        <iframe
          key={url}
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      );
    }

    // For direct video URLs
    return (
      <video
        key={url}
        controls
        className="w-full h-full"
        preload="metadata"
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        Tu navegador no soporta el elemento de video.
      </video>
    );
  };

  return (
    <div className="w-full">
      {/* Server Options - At the top */}
      <div className="mb-4 p-4 bg-cuevana-gray-100 rounded-lg">
        <h4 className="text-cuevana-white font-medium mb-3">Servidores Disponibles:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {availableServers.map((server, index) => (
            <Button
              key={index}
              onClick={() => handleServerChange(index)}
              variant={selectedServer === index ? "default" : "outline"}
              size="sm"
              className={selectedServer === index
                ? "bg-cuevana-blue text-white"
                : "border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue"
              }
            >
              {server.name}
              {server.quality && (
                <span className="ml-1 text-xs opacity-75">({server.quality})</span>
              )}
            </Button>
          ))}
        </div>
        
        {!hasValidServers && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ No hay servidores configurados para esta película. Se muestra un video de ejemplo.
          </p>
        )}
        
        {hasValidServers && (
          <p className="text-green-400 text-sm mt-2">
            ✅ {availableServers.length} servidor(es) configurado(s)
          </p>
        )}
      </div>

      {/* Quality and Language Selectors - Only show if options are available */}
      {(availableQualities.length > 0 || availableLanguages.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {availableQualities.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-cuevana-white text-sm font-medium">Calidad:</span>
              {availableQualities.map((quality) => (
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
          )}
          
          {availableLanguages.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-cuevana-white text-sm font-medium">Idioma:</span>
              {availableLanguages.map((language) => (
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
          )}
        </div>
      )}

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {getVideoElement(currentStreamUrl)}
        
        {/* Custom overlay for branding */}
        <div className="absolute top-4 left-4 bg-cuevana-bg/80 text-cuevana-white text-sm px-3 py-1 rounded">
          Cuevana3
        </div>
      </div>

      {/* Download Options */}
      <div className="mt-4 p-4 bg-cuevana-gray-100 rounded-lg">
        <h4 className="text-cuevana-white font-medium mb-3">Descargar:</h4>
        <div className="flex flex-wrap gap-2">
          {availableQualities.length > 0 ? (
            availableQualities.map((quality) => (
              <Button
                key={quality}
                variant="outline"
                size="sm"
                className="border-cuevana-gold text-cuevana-gold hover:bg-cuevana-gold hover:text-cuevana-bg"
              >
                Descargar {quality}
              </Button>
            ))
          ) : (
            ['1080p', '720p', '480p'].map((quality) => (
              <Button
                key={quality}
                variant="outline"
                size="sm"
                className="border-cuevana-gold text-cuevana-gold hover:bg-cuevana-gold hover:text-cuevana-bg"
              >
                Descargar {quality}
              </Button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
