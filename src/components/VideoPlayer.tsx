
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

  // Use stream servers if available, otherwise fallback to single stream URL or default
  const availableServers = streamServers && streamServers.length > 0 ? streamServers : 
    streamUrl ? [{ name: 'Servidor Principal', url: streamUrl }] : [
      { name: 'Servidor Demo', url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
    ];
  
  console.log("VideoPlayer - Stream servers received:", streamServers);
  console.log("VideoPlayer - Available servers:", availableServers);

  const currentStreamUrl = availableServers[selectedServer]?.url || availableServers[0]?.url;
  console.log("VideoPlayer - Current stream URL:", currentStreamUrl);

  const hasValidServers = streamServers && streamServers.length > 0 && streamServers.some(server => server.url && server.url.trim() !== '');

  const handleServerChange = (index: number) => {
    console.log("Selecting server:", index, availableServers[index]);
    setSelectedServer(index);
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
      {/* Server Options */}
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
