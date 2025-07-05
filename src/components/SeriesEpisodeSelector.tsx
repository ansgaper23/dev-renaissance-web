
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Play } from 'lucide-react';
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
  onEpisodeChange
}: SeriesEpisodeSelectorProps) => {
  const seasons = series.seasons || [];
  
  if (seasons.length === 0) {
    return (
      <div className="bg-cuevana-gray-100 rounded-lg p-6 text-center">
        <p className="text-cuevana-white/70">No hay episodios disponibles para esta serie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Season Selector Dropdown */}
      <div className="bg-cuevana-gray-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-cuevana-white mb-4">Temporada</h3>
        <Select
          value={selectedSeason.toString()}
          onValueChange={(value) => onSeasonChange(parseInt(value))}
        >
          <SelectTrigger className="w-full bg-cuevana-gray-200 border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-blue hover:border-cuevana-blue">
            <SelectValue placeholder="Seleccionar temporada" />
          </SelectTrigger>
          <SelectContent className="bg-cuevana-gray-200 border-cuevana-white/30">
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

      {/* Episode List */}
      <div className="bg-cuevana-gray-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-cuevana-white mb-4">
          Episodios - Temporada {selectedSeason}
        </h3>
        
        {/* Mobile: Collapsible Episode List */}
        <div className="block md:hidden">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10">
                Episodio {selectedEpisode}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {seasons
                .find((season: SeriesSeason) => season.season_number === selectedSeason)
                ?.episodes.map((episode) => (
                  <Button
                    key={episode.episode_number}
                    variant={selectedEpisode === episode.episode_number ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onEpisodeChange(episode.episode_number)}
                    className={`w-full justify-start ${
                      selectedEpisode === episode.episode_number
                        ? 'bg-cuevana-blue hover:bg-cuevana-blue/90'
                        : 'text-cuevana-white hover:bg-cuevana-white/10'
                    }`}
                  >
                    <Play className="h-3 w-3 mr-2" />
                    {episode.episode_number}. {episode.title || `Episodio ${episode.episode_number}`}
                  </Button>
                )) || []}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop: Grid Episode List */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {seasons
              .find((season: SeriesSeason) => season.season_number === selectedSeason)
              ?.episodes.map((episode) => (
                <Button
                  key={episode.episode_number}
                  variant={selectedEpisode === episode.episode_number ? "default" : "outline"}
                  size="sm"
                  onClick={() => onEpisodeChange(episode.episode_number)}
                  className={`justify-start text-left h-auto py-3 px-4 ${
                    selectedEpisode === episode.episode_number
                      ? 'bg-cuevana-blue hover:bg-cuevana-blue/90'
                      : 'border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Play className="h-3 w-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Ep. {episode.episode_number}</div>
                      <div className="text-xs opacity-75 truncate">
                        {episode.title || `Episodio ${episode.episode_number}`}
                      </div>
                    </div>
                  </div>
                </Button>
              )) || []}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesEpisodeSelector;
