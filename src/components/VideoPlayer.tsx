import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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

  // Estilo para los botones tipo card con efecto cristal/minimalista
  const cardClass = `
    flex flex-col items-center justify-center
    rounded-[14px] 
    min-w-[110px] px-4 py-3
    cursor-pointer
    transition-all duration-150
    relative
    border border-white/20
    backdrop-blur-md
    bg-gradient-to-br from-blue-500/40 to-blue-800/40
    shadow-[0_4px_24px_0_rgba(120,150,255,0.13)]
    hover:bg-blue-400/25 hover:border-cuevana-blue
    hover:shadow-lg
    hover:scale-105
    active:scale-100
    font-semibold text-white
    select-none
    outline-none
    focus-visible:ring-2 focus-visible:ring-blue-400
    overflow-hidden
  `;
  const cardActive = `
    border-yellow-300 shadow-[0_8px_32px_0_rgba(220,220,40,0.12)]
    scale-105
    before:absolute before:inset-0 before:pointer-events-none
    before:rounded-[14px] before:bg-white/20 before:opacity-80
  `;
  const cardInactive = `
    border-transparent
    opacity-85
  `;
  const qualityText = "uppercase text-xs pt-1 tracking-widest font-bold text-yellow-200 leading-tight drop-shadow";

  // Reemplaza el renderServerBar para el nuevo look minimalista y glassmorphism
  const renderServerBar = () =>
    <div className="w-full flex justify-center items-center gap-4 bg-transparent py-2">
      {Object.entries(serversByLanguage).map(([language, servers], lngIdx) =>
        servers.map((server, srvIdx) => {
          const globalIdx = allServerList.findIndex(s => s === server);
          const flag = LANG_FLAGS[language] || '🌐';
          const isSelected = selectedServer === globalIdx;
          return (
            <div
              key={language + srvIdx}
              className={[
                cardClass,
                isSelected ? cardActive : cardInactive,
              ].join(' ')}
              style={{
                maxWidth: 180,
                boxShadow: isSelected
                  ? '0 8px 32px 0 rgba(255,255,180,0.13)'
                  : '0 2px 12px 0 rgba(80,110,255,0.07)',
                borderWidth: isSelected ? 2 : 1,
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(247,255,220,0.22) 0%, rgba(33,48,60,0.65) 100%)'
                  : 'linear-gradient(120deg, rgba(59,130,246,0.26) 0%, rgba(51,65,85,0.31) 100%)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                cursor: isSelected ? 'default' : 'pointer',
                outline: isSelected ? '2px solid #FFD600' : 'none'
              }}
              onClick={() => !isSelected && setSelectedServer(globalIdx)}
              tabIndex={0}
              aria-label={`Elegir servidor ${language}`}
            >
              {/* Bandera e idioma */}
              <div className="flex items-center mb-0.5 gap-1 text-lg font-medium">
                <span>{flag}</span>
                <span className="text-[15px] tracking-wide">{language === "Español Latino" ? "MX Latino" : language}</span>
              </div>
              <div className={qualityText}>
                {server.quality || "HD"}
              </div>
              {/* Línea amarilla inferior solo si seleccionado */}
              {isSelected && (
                <div
                  className="absolute bottom-0 left-0 w-full h-[3px] bg-yellow-300 rounded-b"
                  style={{ marginBottom: '-1px', boxShadow: '0 2px 10px 0 #ffe06650' }}
                />
              )}
            </div>
          );
        })
      )}
    </div>;

  // Mensaje amarillo
  const renderTopInfo = () => infoOpen && <div className="flex w-full items-center justify-between bg-yellow-400 px-4 py-2 font-medium text-black text-sm relative z-10 rounded-t-md">
      <span>{INFO_MESSAGE}</span>
      <button className="ml-4 bg-black/10 text-black/70 px-1 rounded hover:bg-black/20" onClick={() => setInfoOpen(false)} aria-label="Cerrar advertencia">✕</button>
    </div>;

  // Renderiza el video/iframe basado en la URL
  const getVideoElement = (url: string) => {
    if (!url) return null;
    // Check for iframe-compatible URLs
    if (url.includes('embed') || url.includes('swiftplayers.com') || url.includes('streamtape.com') || url.includes('doodstream.com') || url.includes('mixdrop.co') || url.includes('fembed.com') || url.includes('jilliandescribecompany.com') || url.includes('/e/') || url.includes('player') || url.includes('iframe')) {
      return <iframe key={url} src={url} title={title} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="no-referrer-when-downgrade" />;
    }
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
      return <iframe key={url} src={embedUrl} title={title} className="w-full h-full border-0" allowFullScreen />;
    }
    // Direct video
    return <video key={url} controls className="w-full h-full" preload="metadata">
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        Tu navegador no soporta el elemento de video.
      </video>;
  };

  // Main layout: centra y no full screen, con max width y padding arriba
  return <div className="flex flex-col items-center w-full pt-5 pb-8">
      <div className="w-full flex flex-col items-center">
        <div className="max-w-3xl w-full mx-auto rounded-xl bg-[#101424] shadow-xl border border-cuevana-gray-300 overflow-hidden">
          {/* Barra de servidores */}
          {renderServerBar()}
          {/* Mensaje amarillo arriba */}
          {renderTopInfo()}
          {/* Player centrado, aspect ratio y bordes redondeados */}
          <div className="relative w-full aspect-video bg-black mx-auto rounded-b-xl overflow-hidden">
            {getVideoElement(currentStreamUrl)}
          </div>
        </div>
      </div>
    </div>;
};
export default VideoPlayer;
