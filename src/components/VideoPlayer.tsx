
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  // Barra de servidores
  const renderServerBar = () => (
    <div
      className="
        w-full flex flex-wrap justify-center items-center gap-3 mb-0 px-4 pt-4
      "
    >
      {Object.entries(serversByLanguage).map(([language, servers], lngIdx) =>
        servers.map((server, srvIdx) => {
          const globalIdx = allServerList.findIndex(s => s === server);
          // Bandera/idioma
          const flag = LANG_FLAGS[language] || '🌐';
          return (
            <div key={language + srvIdx} className="flex flex-col items-center">
              <Button
                onClick={() => setSelectedServer(globalIdx)}
                variant={selectedServer === globalIdx ? "default" : "outline"}
                className={[
                  "rounded-t-md rounded-b-none px-4 py-2 shadow font-semibold transition",
                  selectedServer === globalIdx
                    ? "bg-blue-800 text-white border-b-4 border-yellow-400"
                    : "bg-blue-700/80 text-white border-b-4 border-transparent hover:border-yellow-200"
                ].join(' ')}
                style={{ minWidth: 120, fontSize: "1rem" }}
              >
                <div className="flex flex-col items-center leading-none">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{flag}</span>
                    <span className="font-semibold">{language}</span>
                  </div>
                  <span className="uppercase text-xs pt-1 tracking-widest font-bold text-yellow-300">
                    {server.quality || "CALIDAD HD"}
                  </span>
                </div>
              </Button>
            </div>
          );
        })
      )}
      {/* Botón de descarga (simulado: siempre visible, puedes personalizarlo) */}
      <a
        href={currentStreamUrl}
        rel="noopener noreferrer"
        target="_blank"
        className="rounded-t-md rounded-b-none px-4 py-2 bg-blue-900 text-white font-semibold shadow border-b-4 border-blue-400 ml-2 flex flex-col items-center hover:bg-blue-950 transition"
        style={{ minWidth: 120, fontSize: "1rem" }}
        title="Descargar (experimental)"
      >
        <span className="text-xl">⬇️</span>
        <span className="text-xs font-bold uppercase">Descargar</span>
        <span className="uppercase text-xs pt-1 tracking-widest">CALIDAD HD</span>
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

  // Main layout centrado y max-w igual screenshot
  return (
    <div className="flex flex-col items-center w-full py-6">
      <div className="w-full max-w-5xl mx-auto rounded-lg bg-cuevana-bg shadow-xl border border-cuevana-gray-300 overflow-hidden">
        {/* Barra de servidores */}
        {renderServerBar()}
        {/* Mensaje amarillo arriba */}
        {renderTopInfo()}
        {/* Player centrado con aspect-ratio y bordes redondeados */}
        <div className="relative w-full aspect-video bg-black mx-auto">
          {getVideoElement(currentStreamUrl)}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

