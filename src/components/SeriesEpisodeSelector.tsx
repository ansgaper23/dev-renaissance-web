import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
  const currentIndex = episodes.findIndex((e) => e.episode_number === selectedEpisode);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  return (
    <div className="space-y-4">
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

      {/* Episode Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {episodes.map((episode) => {
          const isActive = selectedEpisode === episode.episode_number;
          return (
            <button
              key={episode.episode_number}
              onClick={() => onEpisodeChange(episode.episode_number)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                isActive
                  ? 'bg-cuevana-blue/10 border-cuevana-blue text-cuevana-white shadow-[0_0_0_1px_hsl(var(--primary))]'
                  : 'bg-cuevana-gray-100 border-cuevana-gray-300 text-cuevana-white/80 hover:border-cuevana-blue/50 hover:bg-cuevana-gray-200'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-colors ${
                  isActive ? 'bg-cuevana-blue text-white' : 'bg-cuevana-gray-300 text-cuevana-white/70 group-hover:bg-cuevana-gray-400'
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className={`font-medium text-sm truncate ${isActive ? 'text-cuevana-blue' : ''}`}>
                Episodio {episode.episode_number}
              </span>
            </button>
          );
        })}
      </div>

      {/* Prev / Current / Next bar */}
      <div className="flex items-center justify-between gap-2 bg-cuevana-gray-100 border border-cuevana-gray-300 rounded-xl px-4 py-3">
        <Button
          variant="ghost"
          onClick={() => prevEpisode && onEpisodeChange(prevEpisode.episode_number)}
          disabled={!prevEpisode}
          className="text-cuevana-white hover:bg-cuevana-gray-200 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <div className="text-center">
          <div className="font-semibold text-cuevana-white text-sm md:text-base">
            {currentEpisode?.title ? currentEpisode.title : `Episodio ${selectedEpisode}`}
          </div>
          <div className="text-xs text-cuevana-blue">Temporada {selectedSeason}</div>
        </div>

        <Button
          variant="ghost"
          onClick={() => nextEpisode && onEpisodeChange(nextEpisode.episode_number)}
          disabled={!nextEpisode}
          className="text-cuevana-white hover:bg-cuevana-gray-200 disabled:opacity-30"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default SeriesEpisodeSelector;
