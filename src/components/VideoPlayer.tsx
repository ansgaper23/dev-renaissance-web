import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import CustomVideoPlayer from './CustomVideoPlayer';

// El mensaje que se ve en el screenshot
const INFO_MESSAGE = "Esta opción de video contiene ventanas emergentes y la carga es óptima, puedes mirar sin cortes.";

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

const VideoPlayer = ({
  title,
  streamServers = [],
  streamUrl
}: VideoPlayerProps) => {
  const [selectedServer, setSelectedServer] = useState(0);
  const [infoOpen, setInfoOpen] = useState(true);

  // Agrupa los servidores por idioma
  const availableServers = streamServers && streamServers.length > 0 ? streamServers : streamUrl ? [{
    name: 'Servidor Principal',
    url: streamUrl,
    language: 'Español Latino',
    quality: 'HD'
  }] : [{
    name: 'Servidor Demo',
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    language: 'Español Latino',
    quality: 'HD'
  }];

  // Adaptar el layout tipo cards horizontal superior
  const LANG_PRIORITY = ['Español Latino', 'Español', 'Subtitulado'];

  // Mapeo bandera
  const LANG_FLAGS: {
    [key: string]: string;
  } = {
    'Español Latino': '🇲🇽',
    'Latino': '🇲🇽',
    'Español': '🇪🇸',
    'Subtitulado': '🇺🇸',
    'English': '🇺🇸'
  };

  // Agrupa por idioma
  const serversByLanguage = React.useMemo(() => {
    const grouped: {
      [key: string]: typeof availableServers;
    } = {};
    availableServers.forEach(server => {
      const language = server.language || 'Español Latino';
      if (!grouped[language]) grouped[language] = [];
      grouped[language].push(server);
    });
    // Orden fija por prioridad de idioma
    const sorted: {
      [key: string]: typeof availableServers;
    } = {};
    LANG_PRIORITY.forEach(lang => {
      if (grouped[lang]) sorted[lang] = grouped[lang];
    });
    Object.keys(grouped).forEach(lang => {
      if (!sorted[lang]) sorted[lang] = grouped[lang];
    });
    return sorted;
  }, [availableServers]);

  // Todos los servidores vienen en orden: [Español Latino, Español, Subtitulado, ...]
  const allServerList = Object.entries(serversByLanguage).reduce((arr, [lang, servers]) => [...arr, ...servers], [] as typeof availableServers);
  const currentServer = allServerList[selectedServer] || allServerList[0];
  const currentStreamUrl = currentServer?.url;

  // Check if current URL is a direct MP4 file
  const isDirectMp4 = currentStreamUrl?.toLowerCase().includes('.mp4');

  // Estilo para los botones tipo card con efecto cristal/minimalista
  const cardClass = `
    flex flex-col items-center justify-center
    rounded-[11px] 
    min-w-[85px] px-2.5 py-2
    cursor-pointer
    transition-all duration-150
    relative
    border border-white/20
    backdrop-blur-md
    bg-gradient-to-br from-blue-500/40 to-blue-800/40
    shadow-[0_4px_18px_0_rgba(120,150,255,0.11)]
    hover:bg-blue-400/20 hover:border-cuevana-blue
    hover:shadow-md
    hover:scale-105
    active:scale-100
    font-semibold text-white
    select-none
    outline-none
    focus-visible:ring-2 focus-visible:ring-blue-400
    overflow-hidden
    text-xs
  `;
  const cardActive = `
    border-yellow-300 shadow-[0_6px_24px_0_rgba(220,220,40,0.09)]
    scale-105
    before:absolute before:inset-0 before:pointer-events-none
    before:rounded-[11px] before:bg-white/20 before:opacity-70
  `;
  const cardInactive = `
    border-transparent
    opacity-85
  `;
  const qualityText = "uppercase text-[10px] pt-[2px] tracking-widest font-bold text-yellow-200 leading-tight drop-shadow";

  // Reemplaza el renderServerBar para el nuevo look minimalista y glassmorphism
  const renderServerBar = () => <div className="w-full flex justify-center items-center gap-2 bg-transparent py-0">
      {Object.entries(serversByLanguage).map(([language, servers], lngIdx) => servers.map((server, srvIdx) => {
      const globalIdx = allServerList.findIndex(s => s === server);
      const flag = LANG_FLAGS[language] || '🌐';
      const isSelected = selectedServer === globalIdx;
      return <div key={language + srvIdx} className={[cardClass, isSelected ? cardActive : cardInactive].join(' ')} style={{
        maxWidth: 130,
        boxShadow: isSelected ? '0 8px 22px 0 rgba(255,255,180,0.11)' : '0 1px 7px 0 rgba(80,110,255,0.06)',
        borderWidth: isSelected ? 2 : 1,
        background: isSelected ? 'linear-gradient(135deg, rgba(247,255,220,0.17) 0%, rgba(33,48,60,0.62) 100%)' : 'linear-gradient(120deg, rgba(59,130,246,0.19) 0%, rgba(51,65,85,0.22) 100%)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        cursor: isSelected ? 'default' : 'pointer',
        outline: isSelected ? '2px solid #FFD600' : 'none'
      }} onClick={() => !isSelected && setSelectedServer(globalIdx)} tabIndex={0} aria-label={`Elegir servidor ${language}`}>
              {/* Bandera e idioma */}
              <div className="flex items-center mb-0.5 gap-1 text-base font-medium">
                <span className="text-lg">{flag}</span>
                <span className="text-[12px] tracking-wide">{language === "Español Latino" ? "MX Latino" : language}</span>
              </div>
              <div className={qualityText}>
                {server.quality || "HD"}
              </div>
              {/* Línea amarilla inferior solo si seleccionado */}
              {isSelected && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-300 rounded-b" style={{
          marginBottom: '-1px',
          boxShadow: '0 1px 5px 0 #ffe06635'
        }} />}
            </div>;
    }))}
    </div>;

  // Mensaje amarillo
  const renderTopInfo = () => infoOpen && <div className="flex w-full items-center justify-between bg-yellow-400 px-4 py-2 font-medium text-black text-sm relative z-10 rounded-t-md">
      <span>{INFO_MESSAGE}</span>
      <button className="ml-4 bg-black/10 text-black/70 px-1 rounded hover:bg-black/20" onClick={() => setInfoOpen(false)} aria-label="Cerrar advertencia">✕</button>
    </div>;

  // Renderiza el video/iframe basado en la URL
  const getVideoElement = (url: string) => {
    if (!url) return null;

    const normalizedUrl = url.trim();
    
    // Si es un archivo MP4 directo, usar el reproductor personalizado
    if (normalizedUrl.toLowerCase().includes('.mp4')) {
      return <CustomVideoPlayer src={normalizedUrl} title={title} />;
    }
    
    // YouTube - clean embed without recommendations
    if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
      let videoId = '';
      if (normalizedUrl.includes('watch?v=')) {
        videoId = normalizedUrl.split('watch?v=')[1].split('&')[0];
      } else if (normalizedUrl.includes('youtu.be/')) {
        videoId = normalizedUrl.split('youtu.be/')[1].split('?')[0];
      } else if (normalizedUrl.includes('embed/')) {
        videoId = normalizedUrl.split('embed/')[1].split('?')[0];
      }
      
      const cleanEmbedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&controls=1&autoplay=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1`;
      return <iframe key={normalizedUrl} src={cleanEmbedUrl} title={title} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" />;
    }
    
    // Archive.org URLs - use custom player to avoid native controls in fullscreen
    if (normalizedUrl.includes('archive.org')) {
      const ArchiveVideoPlayer = React.lazy(() => import('./ArchiveVideoPlayer'));
      return (
        <React.Suspense fallback={
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }>
          <ArchiveVideoPlayer src={normalizedUrl} title={title} />
        </React.Suspense>
      );
    }
    
    // Check for iframe-compatible URLs
    if (normalizedUrl.includes('embed') || normalizedUrl.includes('swiftplayers.com') || normalizedUrl.includes('streamtape.com') || normalizedUrl.includes('doodstream.com') || normalizedUrl.includes('mixdrop.co') || normalizedUrl.includes('fembed.com') || normalizedUrl.includes('jilliandescribecompany.com') || normalizedUrl.includes('xupalace.org') || normalizedUrl.includes('/e/') || normalizedUrl.includes('player') || normalizedUrl.includes('iframe')) {
      return (
        <div className="relative w-full h-full">
          <iframe key={normalizedUrl} src={normalizedUrl} title={title} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="no-referrer-when-downgrade" />
          <div className="absolute inset-0 pointer-events-none" />
        </div>
      );
    }
    
    // Direct video fallback
    return <video key={normalizedUrl} controls className="w-full h-full" preload="metadata">
        <source src={normalizedUrl} type="video/mp4" />
        <source src={normalizedUrl} type="video/webm" />
        <source src={normalizedUrl} type="video/ogg" />
        Tu navegador no soporta el elemento de video.
      </video>;
  };

  // Main layout: centra y no full screen, con max width y padding arriba
  // Añadimos px-2 (padding horizontal) en mobile y px-0 en md+: da más espacio lateral en mobile
  return (
    <div className="flex flex-col items-center w-full pt-5 pb-8 px-2 md:px-0">
      <div className="w-full flex flex-col items-center">
        <div className="max-w-6xl w-full mx-auto rounded-xl bg-[#101424] shadow-xl border border-cuevana-gray-300 overflow-hidden">
          {/* Barra de servidores */}
          {renderServerBar()}
          {/* Mensaje amarillo arriba */}
          {renderTopInfo()}
          {/* Player centrado, aspect ratio y bordes redondeados */}
          <div className="relative w-full aspect-video bg-black mx-auto rounded-b-xl overflow-hidden min-h-[300px] sm:min-h-[420px] md:min-h-[520px] lg:min-h-[640px]">
            {getVideoElement(currentStreamUrl)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
