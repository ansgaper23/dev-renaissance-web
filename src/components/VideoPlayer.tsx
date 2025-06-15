import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

// El mensaje que se ve en el screenshot
const INFO_MESSAGE =
  "Esta opción de video contiene ventanas emergentes y la carga es óptima, puedes mirar sin cortes.";

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
  const [infoOpen, setInfoOpen] = useState(true);

  // Agrupa los servidores por idioma
  const availableServers =
    (streamServers && streamServers.length > 0)
      ? streamServers
      : streamUrl
        ? [{ name: 'Servidor Principal', url: streamUrl, language: 'Español Latino', quality: 'HD' }]
        : [
          { name: 'Servidor Demo', url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", language: 'Español Latino', quality: 'HD' }
        ];

  // Adaptar el layout tipo cards horizontal superior
  const LANG_PRIORITY = ['Español Latino', 'Español', 'Subtitulado'];

  // Mapeo bandera
  const LANG_FLAGS: { [key: string]: string } = {
    'Español Latino': '🇲🇽',
    'Latino': '🇲🇽',
    'Español': '🇪🇸',
    'Subtitulado': '🇺🇸',
    'English': '🇺🇸',
  };

  // Agrupa por idioma
  const serversByLanguage = React.useMemo(() => {
    const grouped: { [key: string]: typeof availableServers } = {};
    availableServers.forEach(server => {
      const language = server.language || 'Español Latino';
      if (!grouped[language]) grouped[language] = [];
      grouped[language].push(server);
    });
    // Orden fija por prioridad de idioma
    const sorted: { [key: string]: typeof availableServers } = {};
    LANG_PRIORITY.forEach(lang => { if (grouped[lang]) sorted[lang] = grouped[lang]; });
    Object.keys(grouped).forEach(lang => { if (!sorted[lang]) sorted[lang] = grouped[lang]; });
    return sorted;
  }, [availableServers]);

  // Todos los servidores vienen en orden: [Español Latino, Español, Subtitulado, ...]
  const allServerList = Object.entries(serversByLanguage)
    .reduce((arr, [lang, servers]) => ([...arr, ...servers]), [] as typeof availableServers);

  const currentServer = allServerList[selectedServer] || allServerList[0];
  const currentStreamUrl = currentServer?.url;

  // Estilo para los botones tipo card
  const cardClass =
    "flex flex-col items-center justify-center shadow-md bg-[#192033] rounded-[10px] min-w-[120px] px-4 py-3 text-white font-bold cursor-pointer transition-all duration-150 relative border-t border-l border-r border-[#232b43]";
  const cardActive =
    "shadow-lg border-b-[5px] border-yellow-400 z-10 scale-105";
  const cardInactive =
    "border-b-[5px] border-transparent hover:border-yellow-300/80 hover:scale-105 opacity-80 hover:opacity-100";

  const qualityText =
    "uppercase text-xs pt-1 tracking-widest font-bold text-yellow-300 leading-tight";

  // Reemplaza el renderServerBar por uno visualmente similar al ejemplo
  const renderServerBar = () => (
    <div className="w-full flex justify-center items-center gap-5 py-6 bg-transparent">
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
                "transition-transform duration-150 text-base",
                "hover:ring-2 hover:ring-yellow-300"
              ].join(' ')}
              style={{
                boxShadow: isSelected
                  ? '0 8px 24px 0 rgba(60,72,144,.22)'
                  : '0 2px 8px 0 rgba(30,42,80,.06)',
                cursor: isSelected ? 'default' : 'pointer',
                maxWidth: 180,
              }}
              onClick={() => !isSelected && setSelectedServer(globalIdx)}
              tabIndex={0}
              aria-label={`Elegir servidor ${language}`}
            >
              {/* Bandera e idioma */}
              <div className="flex items-center gap-1 mb-1 text-lg">
                <span>{flag}</span>
                <span className="font-semibold text-[16px]">{language === "Español Latino" ? "MX Latino" : language}</span>
              </div>
              <div className={qualityText}>
                {server.quality || "HD"}
              </div>
              {/* Línea amarilla inferior solo si seleccionado */}
              {isSelected && (
                <div
                  className="absolute bottom-0 left-0 w-full h-[4px] bg-yellow-400 rounded-b-md"
                  style={{ marginBottom: '-5px' }}
                />
              )}
            </div>
          );
        })
      )}
      {/* Botón Descargar, ahora visualmente tipo card, azul fuerte */}
      <a
        href={currentStreamUrl}
        rel="noopener noreferrer"
        target="_blank"
        className={[
          cardClass,
          "bg-[#2653c7] flex flex-col items-center justify-center min-w-[150px]",
          "hover:bg-[#213c7a] transition-all duration-150 group"
        ].join(' ')}
        style={{
          maxWidth: 210,
          marginLeft: 16,
          position: "relative"
        }}
        title="Descargar (experimental)"
      >
        <Download className="text-white mb-1 group-hover:scale-110 transition-transform duration-100" size={28} />
        <span className="font-bold text-[16px]">DESCARGAR</span>
        <span className="uppercase text-xs pt-1 tracking-widest font-bold text-white">CALIDAD HD</span>
        <div
          className="absolute bottom-0 left-0 w-full h-[4px] bg-yellow-400 rounded-b-md"
          style={{ marginBottom: '-5px' }}
        />
      </a>
    </div>
  );

  // Mensaje amarillo
  const renderTopInfo = () => infoOpen && (
    <div className="flex w-full items-center justify-between bg-yellow-400 px-4 py-2 font-medium text-black text-sm relative z-10 rounded-t-md">
      <span>{INFO_MESSAGE}</span>
      <button
        className="ml-4 bg-black/10 text-black/70 px-1 rounded hover:bg-black/20"
        onClick={() => setInfoOpen(false)}
        aria-label="Cerrar advertencia"
      >✕</button>
    </div>
  );

  // Renderiza el video/iframe basado en la URL
  const getVideoElement = (url: string) => {
    if (!url) return null;
    // Check for iframe-compatible URLs
    if (
      url.includes('embed') ||
      url.includes('swiftplayers.com') ||
      url.includes('streamtape.com') ||
      url.includes('doodstream.com') ||
      url.includes('mixdrop.co') ||
      url.includes('fembed.com') ||
      url.includes('jilliandescribecompany.com') ||
      url.includes('/e/') ||
      url.includes('player') ||
      url.includes('iframe')
    ) {
      return (
        <iframe
          key={url}
          src={url}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="no-referrer-when-downgrade"
        />
      );
    }
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
      return (
        <iframe
          key={url}
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allowFullScreen
        />
      );
    }
    // Direct video
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

  // Main layout: centra y no full screen, con max width y padding arriba
  return (
    <div className="flex flex-col items-center w-full pt-5 pb-8">
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
    </div>
  );
};

export default VideoPlayer;
