import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Server {
  name: string;
  url: string;
  quality?: string;
  language?: string;
  lang?: string;
}

interface LanguageServerTabsProps {
  servers: Server[];
  onServerSelect: (server: Server) => void;
  selectedServerUrl?: string;
}

const LANG_CONFIG: Record<string, { flag: string; label: string; }> = {
  'latino': { flag: '🇲🇽', label: 'Español Latino' },
  'español latino': { flag: '🇲🇽', label: 'Español Latino' },
  'mx latino': { flag: '🇲🇽', label: 'Español Latino' },
  'spanish': { flag: '🇪🇸', label: 'Español Castellano' },
  'español': { flag: '🇪🇸', label: 'Español Castellano' },
  'español castellano': { flag: '🇪🇸', label: 'Español Castellano' },
  'english': { flag: '🇺🇸', label: 'Inglés Subtitulado' },
  'subtitulado': { flag: '🇺🇸', label: 'Inglés Subtitulado' },
  'inglés subtitulado': { flag: '🇺🇸', label: 'Inglés Subtitulado' },
  'multilenguaje': { flag: '🌐', label: 'Multilenguaje [CC]' },
};

function normalizeLang(server: Server): string {
  const raw = (server.language || server.lang || 'latino').toLowerCase().trim();
  return raw;
}

function getLangConfig(raw: string) {
  if (LANG_CONFIG[raw]) return LANG_CONFIG[raw];
  for (const [key, val] of Object.entries(LANG_CONFIG)) {
    if (raw.includes(key)) return val;
  }
  return { flag: '🌐', label: raw.charAt(0).toUpperCase() + raw.slice(1) };
}

const LanguageServerTabs: React.FC<LanguageServerTabsProps> = ({ servers, onServerSelect, selectedServerUrl }) => {
  const [expandedLang, setExpandedLang] = useState<string | null>(null);

  // Group servers by normalized language
  const grouped = React.useMemo(() => {
    const map = new Map<string, { config: { flag: string; label: string }; servers: Server[]; bestQuality: string }>();
    servers.forEach(server => {
      const raw = normalizeLang(server);
      const config = getLangConfig(raw);
      const key = config.label;
      if (!map.has(key)) {
        map.set(key, { config, servers: [], bestQuality: server.quality || 'HD' });
      }
      map.get(key)!.servers.push(server);
      // Track best quality
      const q = (server.quality || 'HD').toUpperCase();
      if (q === 'HD' || q === '1080P') map.get(key)!.bestQuality = 'HD';
    });
    return Array.from(map.entries());
  }, [servers]);

  if (grouped.length === 0) return null;

  return (
    <div className="w-full">
      {/* Language tabs */}
      <div className="flex flex-wrap gap-3 mb-2">
        {grouped.map(([langKey, { config, servers: langServers, bestQuality }]) => {
          const isExpanded = expandedLang === langKey;
          return (
            <div key={langKey} className="relative">
              <button
                onClick={() => setExpandedLang(isExpanded ? null : langKey)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm ${
                  isExpanded
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-blue-600/90 text-white hover:bg-blue-500'
                }`}
              >
                <span className="text-lg">{config.flag}</span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold">{config.label}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">
                    CALIDAD · {bestQuality.toUpperCase() || 'HD'}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Server dropdown */}
              {isExpanded && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-blue-700 rounded-lg shadow-2xl min-w-[200px] py-2 border border-blue-500/50">
                  {langServers.map((server, idx) => {
                    const isActive = selectedServerUrl === server.url;
                    return (
                      <div key={idx} className="px-3 py-2">
                        <div className="text-white text-sm font-medium mb-1">
                          {server.name || `Servidor ${idx + 1}`}
                        </div>
                        <button
                          onClick={() => {
                            onServerSelect(server);
                            setExpandedLang(null);
                          }}
                          className={`w-full py-1.5 px-4 rounded-md text-sm font-bold uppercase tracking-wide transition-all ${
                            isActive
                              ? 'bg-yellow-400 text-black'
                              : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                          }`}
                        >
                          REPRODUCIR
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageServerTabs;
