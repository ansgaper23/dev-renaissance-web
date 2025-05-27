
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  const [expandedLanguages, setExpandedLanguages] = useState<{ [key: string]: boolean }>({});

  // Use stream servers if available, otherwise fallback to single stream URL or default
  const availableServers = streamServers && streamServers.length > 0 ? streamServers : 
    streamUrl ? [{ name: 'Servidor Principal', url: streamUrl, language: 'Español Latino' }] : [
      { name: 'Servidor Demo', url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", language: 'Español Latino' }
    ];
  
  console.log("VideoPlayer - Stream servers received:", streamServers);
  console.log("VideoPlayer - Available servers:", availableServers);

  // Group servers by language
  const serversByLanguage = React.useMemo(() => {
    const grouped: { [key: string]: typeof availableServers } = {};
    
    availableServers.forEach(server => {
      const language = server.language || 'Español Latino';
      if (!grouped[language]) {
        grouped[language] = [];
      }
      grouped[language].push(server);
    });
    
    return grouped;
  }, [availableServers]);

  const currentStreamUrl = availableServers[selectedServer]?.url || availableServers[0]?.url;
  console.log("VideoPlayer - Current stream URL:", currentStreamUrl);

  const hasValidServers = streamServers && streamServers.length > 0 && streamServers.some(server => server.url && server.url.trim() !== '');

  const handleServerChange = (index: number) => {
    console.log("Selecting server:", index, availableServers[index]);
    setSelectedServer(index);
  };

  const toggleLanguage = (language: string) => {
    setExpandedLanguages(prev => ({
      ...prev,
      [language]: !prev[language]
    }));
  };

  // Function to determine if URL needs iframe or video tag
  const getVideoElement = (url: string) => {
    if (!url) return null;

    // Check for iframe-compatible URLs (embed URLs)
    if (url.includes('embed') || 
        url.includes('swiftplayers.com') || 
        url.includes('streamtape.com') || 
        url.includes('doodstream.com') || 
        url.includes('mixdrop.co') || 
        url.includes('fembed.com') ||
        url.includes('jilliandescribecompany.com') ||
        url.includes('/e/') ||
        url.includes('player') ||
        url.includes('embed')) {
      return (
        <iframe
          key={url}
          src={url}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="no-referrer-when-downgrade"
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
      {/* Server Options by Language */}
      <div className="mb-4 p-4 bg-cuevana-gray-100 rounded-lg">
        <h4 className="text-cuevana-white font-medium mb-3">Servidores Disponibles:</h4>
        
        {Object.entries(serversByLanguage).map(([language, servers]) => (
          <div key={language} className="mb-3">
            <Button
              onClick={() => toggleLanguage(language)}
              variant="outline"
              className="w-full justify-between border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue mb-2"
            >
              <span className="flex items-center">
                <span className="text-sm font-medium">{language}</span>
                <span className="ml-2 text-xs opacity-75">({servers.length} servidor{servers.length !== 1 ? 'es' : ''})</span>
              </span>
              {expandedLanguages[language] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {expandedLanguages[language] && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                {servers.map((server, serverIndex) => {
                  const globalIndex = availableServers.findIndex(s => s === server);
                  return (
                    <Button
                      key={serverIndex}
                      onClick={() => handleServerChange(globalIndex)}
                      variant={selectedServer === globalIndex ? "default" : "outline"}
                      size="sm"
                      className={selectedServer === globalIndex
                        ? "bg-cuevana-blue text-white"
                        : "border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue"
                      }
                    >
                      {server.name}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
        {!hasValidServers && (
          <p className="text-yellow-400 text-sm mt-2">
            ⚠️ No hay servidores configurados para este contenido. Se muestra un video de ejemplo.
          </p>
        )}
        
        {hasValidServers && (
          <p className="text-green-400 text-sm mt-2">
            ✅ {availableServers.length} servidor(es) configurado(s)
          </p>
        )}
      </div>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {getVideoElement(currentStreamUrl)}
        
        {/* Custom overlay for branding */}
        <div className="absolute top-4 left-4 bg-cuevana-bg/80 text-cuevana-white text-sm px-3 py-1 rounded">
          Cuevana3
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
