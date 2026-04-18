import React, { useState } from 'react';
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
