import React, { useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';
import LanguageServerTabs from './LanguageServerTabs';

const INFO_MESSAGE = "Esta opción de video contiene ventanas emergentes o publicidad de juegos de azar. Te recomendamos cerrar o no interactuar con ellas.";

interface VideoPlayerProps {
  title: string;
  streamServers?: Array<{
    name: string;
    url: string;
    quality?: string;
    language?: string;
    lang?: string;
  }>;
  streamUrl?: string;
}

const VideoPlayer = ({ title, streamServers = [], streamUrl }: VideoPlayerProps) => {
  const availableServers = streamServers.length > 0
    ? streamServers
    : streamUrl
      ? [{ name: 'Servidor Principal', url: streamUrl, language: 'Español Latino', quality: 'HD' }]
      : [{ name: 'Servidor Demo', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', language: 'Español Latino', quality: 'HD' }];

  const [currentServer, setCurrentServer] = useState(availableServers[0]);
  const [infoOpen, setInfoOpen] = useState(true);
  const currentStreamUrl = currentServer?.url || availableServers[0]?.url;

  const getVideoElement = (url: string) => {
    if (!url) return null;
    const n = url.trim();

    if (n.toLowerCase().includes('.mp4')) {
      return <CustomVideoPlayer src={n} title={title} />;
    }

    if (n.includes('youtube.com') || n.includes('youtu.be')) {
      let videoId = '';
      if (n.includes('watch?v=')) videoId = n.split('watch?v=')[1].split('&')[0];
      else if (n.includes('youtu.be/')) videoId = n.split('youtu.be/')[1].split('?')[0];
      else if (n.includes('embed/')) videoId = n.split('embed/')[1].split('?')[0];
      return <iframe key={n} src={`https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&autoplay=0&fs=1`} title={title} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" />;
    }

    if (n.includes('archive.org')) {
      const ArchiveVideoPlayer = React.lazy(() => import('./ArchiveVideoPlayer'));
      return (
        <React.Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" /></div>}>
          <ArchiveVideoPlayer src={n} title={title} />
        </React.Suspense>
      );
    }

    if (n.includes('embed') || n.includes('/e/') || n.includes('player') || n.includes('iframe') || n.includes('streamwish') || n.includes('vidhide') || n.includes('swiftplayers') || n.includes('streamtape') || n.includes('doodstream') || n.includes('mixdrop') || n.includes('fembed') || n.includes('xupalace')) {
      return (
        <div className="relative w-full h-full">
          <iframe key={n} src={n} title={title} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      );
    }

    return <video key={n} controls className="w-full h-full" preload="metadata"><source src={n} type="video/mp4" /><source src={n} type="video/webm" />Tu navegador no soporta el elemento de video.</video>;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Language/Server selector */}
      <div className="w-full max-w-6xl mx-auto mb-3 px-2 md:px-0">
        <LanguageServerTabs
          servers={availableServers}
          onServerSelect={setCurrentServer}
          selectedServerUrl={currentStreamUrl}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto rounded-xl bg-[#101424] shadow-xl border border-cuevana-gray-300 overflow-hidden">
        {infoOpen && (
          <div className="flex w-full items-center justify-between bg-yellow-400 px-4 py-2 font-medium text-black text-sm">
            <span>{INFO_MESSAGE}</span>
            <button className="ml-4 bg-black/10 text-black/70 px-1 rounded hover:bg-black/20" onClick={() => setInfoOpen(false)}>✕</button>
          </div>
        )}
        <div className="relative w-full aspect-video bg-black rounded-b-xl overflow-hidden min-h-[300px] sm:min-h-[420px] md:min-h-[520px] lg:min-h-[640px]">
          {getVideoElement(currentStreamUrl)}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
