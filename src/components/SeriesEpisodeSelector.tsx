import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Tv } from 'lucide-react';
import { Series, SeriesSeason } from '@/services/seriesService';

interface SeriesEpisodeSelectorProps {
  series: Series;
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
}

const SeriesEpisodeSelector = ({
  series,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
}: SeriesEpisodeSelectorProps) => {
  const seasons = series.seasons || [];

  if (seasons.length === 0) {
    return (
      <div className="bg-cuevana-gray-100 rounded-xl p-6 text-center">
        <p className="text-cuevana-white/70">No hay episodios disponibles para esta serie.</p>
      </div>
    );
  }

  const currentSeason = seasons.find((s: SeriesSeason) => s.season_number === selectedSeason);
  const episodes = currentSeason?.episodes || [];
  const currentEpisode = episodes.find((e) => e.episode_number === selectedEpisode);

  return (
    <div className="space-y-4">
      {/* Now playing banner */}
      <div className="text-sm">
        <span className="text-cuevana-blue font-semibold">Reproduciendo: </span>
        <span className="text-cuevana-white">
          {selectedSeason}x{String(selectedEpisode).padStart(2, '0')}
          {currentEpisode?.title ? ` - ${currentEpisode.title}` : ''}
        </span>
      </div>

      {/* Header: Title + Season Selector */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-2xl font-bold text-cuevana-white">Episodios</h3>
        <Select value={selectedSeason.toString()} onValueChange={(v) => onSeasonChange(parseInt(v))}>
          <SelectTrigger className="w-[180px] bg-cuevana-gray-100 border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-gray-200">
            <SelectValue placeholder="Temporada" />
          </SelectTrigger>
          <SelectContent className="bg-cuevana-gray-200 border-cuevana-gray-300 z-50">
            {seasons.map((season: SeriesSeason) => (
              <SelectItem
                key={season.season_number}
                value={season.season_number.toString()}
                className="text-cuevana-white hover:bg-cuevana-blue focus:bg-cuevana-blue focus:text-white"
              >
                Temporada {season.season_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Episode list - Netflix-style rows */}
      <div className="space-y-3">
        {episodes.map((episode) => {
          const isActive = selectedEpisode === episode.episode_number;
          const still = episode.still_path;
          return (
            <button
              key={episode.episode_number}
              onClick={() => onEpisodeChange(episode.episode_number)}
              className={`group w-full flex items-stretch gap-4 p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-cuevana-blue/10 border-cuevana-blue shadow-[0_0_0_1px_hsl(var(--primary))]'
                  : 'bg-cuevana-gray-100 border-cuevana-gray-300 hover:border-cuevana-blue/50 hover:bg-cuevana-gray-200'
              }`}
            >
              {/* Episode number */}
              <div
                className={`flex items-center justify-center text-2xl md:text-3xl font-bold w-8 md:w-10 flex-shrink-0 ${
                  isActive ? 'text-cuevana-blue' : 'text-cuevana-white/50 group-hover:text-cuevana-white/80'
                }`}
              >
                {episode.episode_number}
              </div>

              {/* Thumbnail */}
              <div className="relative w-32 md:w-44 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-cuevana-gray-300">
                {still ? (
                  <img
                    src={still}
                    alt={episode.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="h-8 w-8 text-cuevana-white/30" />
                  </div>
                )}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/70 text-cuevana-white">
                  Episodio {episode.episode_number}
                </div>
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } bg-black/40`}
                >
                  <div className="w-10 h-10 rounded-full bg-cuevana-blue flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4
                    className={`font-semibold text-sm md:text-base line-clamp-1 ${
                      isActive ? 'text-cuevana-blue' : 'text-cuevana-white'
                    }`}
                  >
                    {episode.episode_number}. {episode.title || `Episodio ${episode.episode_number}`}
                  </h4>
                  {episode.runtime ? (
                    <span className="flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded bg-cuevana-blue/20 text-cuevana-blue">
                      {episode.runtime} min
                    </span>
                  ) : null}
                </div>
                {episode.overview ? (
                  <p className="text-xs md:text-sm text-cuevana-white/70 line-clamp-2">
                    {episode.overview}
                  </p>
                ) : (
                  <p className="text-xs md:text-sm text-cuevana-white/40 italic">
                    Sin descripción disponible.
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SeriesEpisodeSelector;
