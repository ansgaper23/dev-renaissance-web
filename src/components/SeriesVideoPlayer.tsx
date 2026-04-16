import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Series } from '@/services/seriesService';
import LanguageServerTabs from './LanguageServerTabs';

interface SeriesVideoPlayerProps {
  series: Series;
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
}

const SeriesVideoPlayer = ({ series, selectedSeason, selectedEpisode, onSeasonChange, onEpisodeChange }: SeriesVideoPlayerProps) => {
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  const seasons = series.seasons || [];
  const currentSeason = seasons.find(s => s.season_number === selectedSeason);
  const currentEpisode = currentSeason?.episodes?.find(e => e.episode_number === selectedEpisode);

  const availableServers = currentEpisode?.stream_servers && currentEpisode.stream_servers.length > 0
    ? currentEpisode.stream_servers
    : series.stream_servers && series.stream_servers.length > 0
      ? series.stream_servers
      : [{ name: 'Servidor Demo', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', language: 'Español Latino' }];

  const [currentServer, setCurrentServer] = useState(availableServers[0]);
  const currentStreamUrl = currentServer?.url || availableServers[0]?.url;

  // Reset server when episode changes
  React.useEffect(() => {
    setCurrentServer(availableServers[0]);
  }, [selectedSeason, selectedEpisode]);

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

  const canGoPrevious = () => selectedEpisode > 1 || selectedSeason > 1;
  const canGoNext = () => (currentSeason && selectedEpisode < currentSeason.episodes.length) || selectedSeason < seasons.length;

  const getVideoElement = (url: string) => {
    if (!url) return null;
    const n = url.trim();

    if (n.includes('youtube.com') || n.includes('youtu.be')) {
      let videoId = '';
      if (n.includes('watch?v=')) videoId = n.split('watch?v=')[1].split('&')[0];
      else if (n.includes('youtu.be/')) videoId = n.split('youtu.be/')[1].split('?')[0];
      else if (n.includes('embed/')) videoId = n.split('embed/')[1].split('?')[0];
      return <iframe key={n} src={`https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0`} title={`${series.title} T${selectedSeason}E${selectedEpisode}`} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />;
    }

    if (n.includes('archive.org')) {
      const ArchiveVideoPlayer = React.lazy(() => import('./ArchiveVideoPlayer'));
      return <React.Suspense fallback={<div className="w-full h-full bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" /></div>}><ArchiveVideoPlayer src={n} title={`${series.title} T${selectedSeason}E${selectedEpisode}`} /></React.Suspense>;
    }

    if (n.includes('embed') || n.includes('/e/') || n.includes('player') || n.includes('iframe') || n.includes('streamwish') || n.includes('vidhide') || n.includes('swiftplayers') || n.includes('streamtape') || n.includes('doodstream') || n.includes('mixdrop') || n.includes('fembed') || n.includes('xupalace')) {
      return <div className="relative w-full h-full"><iframe key={n} src={n} title={`${series.title} T${selectedSeason}E${selectedEpisode}`} className="w-full h-full border-0" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="no-referrer-when-downgrade" /></div>;
    }

    return <video key={n} controls className="w-full h-full" preload="metadata"><source src={n} type="video/mp4" />Tu navegador no soporta el elemento de video.</video>;
  };

  return (
    <div className="w-full space-y-4">
      {/* Episode Navigation */}
      <div className="flex items-center justify-between bg-cuevana-gray-100 rounded-lg p-4">
        <Button onClick={goToPreviousEpisode} disabled={!canGoPrevious()} variant="outline" className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue disabled:opacity-50">
          <ChevronLeft className="h-4 w-4 mr-2" />Anterior
        </Button>
        <div className="text-center">
          <h3 className="text-cuevana-white font-medium">{currentEpisode?.title || `Episodio ${selectedEpisode}`}</h3>
          <p className="text-cuevana-white/70 text-sm">Temporada {selectedSeason} - Episodio {selectedEpisode}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEpisodeList(!showEpisodeList)} variant="outline" className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue">
            <List className="h-4 w-4 mr-2" />Todo
          </Button>
          <Button onClick={goToNextEpisode} disabled={!canGoNext()} variant="outline" className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue disabled:opacity-50">
            Siguiente<ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Episode List */}
      {showEpisodeList && (
        <div className="bg-cuevana-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
          <h4 className="text-cuevana-white font-medium mb-4">Temporadas y episodios</h4>
          {seasons.map((season) => (
            <div key={season.season_number} className="mb-4">
              <div className="bg-cuevana-blue text-white p-2 rounded mb-2"><span className="font-medium">Temporada {season.season_number}</span></div>
              <div className="grid grid-cols-1 gap-2">
                {season.episodes.map((episode) => (
                  <button key={episode.episode_number} onClick={() => { onSeasonChange(season.season_number); onEpisodeChange(episode.episode_number); setShowEpisodeList(false); }}
                    className={`text-left p-3 rounded border transition-colors ${selectedSeason === season.season_number && selectedEpisode === episode.episode_number ? 'bg-cuevana-blue border-cuevana-blue text-white' : 'bg-cuevana-gray-200 border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-blue'}`}>
                    <span className="font-medium mr-3">{season.season_number}-{episode.episode_number}</span>
                    <span>{episode.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Language/Server Tabs */}
      <LanguageServerTabs
        servers={availableServers}
        onServerSelect={setCurrentServer}
        selectedServerUrl={currentStreamUrl}
      />

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {getVideoElement(currentStreamUrl)}
      </div>
    </div>
  );
};

export default SeriesVideoPlayer;
