
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Series, SeriesEpisode } from '@/services/seriesService';

interface SeriesVideoPlayerProps {
  series: Series;
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
}

const SeriesVideoPlayer = ({ 
  series, 
  selectedSeason, 
  selectedEpisode, 
  onSeasonChange, 
  onEpisodeChange 
}: SeriesVideoPlayerProps) => {
  const [selectedServer, setSelectedServer] = useState(0);
  const [expandedLanguages, setExpandedLanguages] = useState<{ [key: string]: boolean }>({});
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  const seasons = series.seasons || [];
  const currentSeason = seasons.find(s => s.season_number === selectedSeason);
  const currentEpisode = currentSeason?.episodes?.find(e => e.episode_number === selectedEpisode);
  
  // Get stream servers for current episode or fallback to series servers
  const availableServers = currentEpisode?.stream_servers && currentEpisode.stream_servers.length > 0 
    ? currentEpisode.stream_servers 
    : series.stream_servers && series.stream_servers.length > 0 
      ? series.stream_servers 
      : [{ name: 'Servidor Demo', url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", language: 'Español Latino' }];

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

  const toggleLanguage = (language: string) => {
    setExpandedLanguages(prev => ({
      ...prev,
      [language]: !prev[language]
    }));
  };

  const handleServerChange = (index: number) => {
    setSelectedServer(index);
  };

  const goToPreviousEpisode = () => {
    if (currentSeason && selectedEpisode > 1) {
      onEpisodeChange(selectedEpisode - 1);
    } else if (selectedSeason > 1) {
      const prevSeason = seasons.find(s => s.season_number === selectedSeason - 1);
      if (prevSeason && prevSeason.episodes.length > 0) {
        onSeasonChange(selectedSeason - 1);
        onEpisodeChange(prevSeason.episodes[prevSeason.episodes.length - 1].episode_number);
      }
    }
  };

  const goToNextEpisode = () => {
    if (currentSeason && selectedEpisode < currentSeason.episodes.length) {
      onEpisodeChange(selectedEpisode + 1);
    } else if (selectedSeason < seasons.length) {
      const nextSeason = seasons.find(s => s.season_number === selectedSeason + 1);
      if (nextSeason && nextSeason.episodes.length > 0) {
        onSeasonChange(selectedSeason + 1);
        onEpisodeChange(1);
      }
    }
  };

  const canGoPrevious = () => {
    return selectedEpisode > 1 || selectedSeason > 1;
  };

  const canGoNext = () => {
    return (currentSeason && selectedEpisode < currentSeason.episodes.length) || selectedSeason < seasons.length;
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
          title={`${series.title} - T${selectedSeason}E${selectedEpisode}`}
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
          title={`${series.title} - T${selectedSeason}E${selectedEpisode}`}
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
    <div className="w-full space-y-4">
      {/* Episode Navigation Controls */}
      <div className="flex items-center justify-between bg-cuevana-gray-100 rounded-lg p-4">
        <Button
          onClick={goToPreviousEpisode}
          disabled={!canGoPrevious()}
          variant="outline"
          className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-center">
          <h3 className="text-cuevana-white font-medium">
            {currentEpisode?.title || `Episodio ${selectedEpisode}`}
          </h3>
          <p className="text-cuevana-white/70 text-sm">
            Temporada {selectedSeason} - Episodio {selectedEpisode}
          </p>
        </div>

        <Button
          onClick={() => setShowEpisodeList(!showEpisodeList)}
          variant="outline"
          className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue mr-2"
        >
          <List className="h-4 w-4 mr-2" />
          Todo
        </Button>

        <Button
          onClick={goToNextEpisode}
          disabled={!canGoNext()}
          variant="outline"
          className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue disabled:opacity-50"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Episode List */}
      {showEpisodeList && (
        <div className="bg-cuevana-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h4 className="text-cuevana-white font-medium mb-4">Temporadas y episodios</h4>
          {seasons.map((season) => (
            <div key={season.season_number} className="mb-4">
              <div className="bg-cuevana-blue text-white p-2 rounded mb-2">
                <span className="font-medium">Temporada {season.season_number}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {season.episodes.map((episode) => (
                  <button
                    key={episode.episode_number}
                    onClick={() => {
                      onSeasonChange(season.season_number);
                      onEpisodeChange(episode.episode_number);
                      setShowEpisodeList(false);
                    }}
                    className={`text-left p-3 rounded border transition-colors ${
                      selectedSeason === season.season_number && selectedEpisode === episode.episode_number
                        ? 'bg-cuevana-blue border-cuevana-blue text-white'
                        : 'bg-cuevana-gray-200 border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-3">
                        {season.season_number} - {episode.episode_number}
                      </span>
                      <span>{episode.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Server Options by Language */}
      <div className="bg-cuevana-gray-100 rounded-lg p-4">
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

export default SeriesVideoPlayer;
