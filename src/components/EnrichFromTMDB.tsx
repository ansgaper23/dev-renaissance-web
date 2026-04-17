import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Play, Pause } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminSession } from "@/services/movieService";

const BATCH_SIZE = 2; // procesar 2 a la vez para no saturar

const EnrichFromTMDB = () => {
  const [movieRunning, setMovieRunning] = useState(false);
  const [seriesRunning, setSeriesRunning] = useState(false);
  const [movieRemaining, setMovieRemaining] = useState<number | null>(null);
  const [seriesRemaining, setSeriesRemaining] = useState<number | null>(null);
  const [movieDone, setMovieDone] = useState(0);
  const [seriesDone, setSeriesDone] = useState(0);
  const [movieErrors, setMovieErrors] = useState(0);
  const [seriesErrors, setSeriesErrors] = useState(0);
  const [autoMovie, setAutoMovie] = useState(false);
  const [autoSeries, setAutoSeries] = useState(false);

  const fetchCounts = async () => {
    const { count: m } = await supabase
      .from("movies").select("id", { count: 'exact', head: true })
      .or("overview.is.null,overview.eq.,genres.is.null,rating.is.null");
    const { count: s } = await supabase
      .from("series").select("id", { count: 'exact', head: true })
      .or("overview.is.null,overview.eq.,genres.is.null,rating.is.null");
    setMovieRemaining(m || 0);
    setSeriesRemaining(s || 0);
  };

  useEffect(() => { fetchCounts(); }, []);

  const runBatch = async (type: 'movie' | 'tv') => {
    const session = getAdminSession();
    if (!session?.session_token) {
      toast.error("Sesión de admin no encontrada");
      return null;
    }
    const { data, error } = await supabase.functions.invoke('enrich-from-tmdb', {
      body: { type, limit: BATCH_SIZE },
      headers: { 'x-admin-token': session.session_token },
    });
    if (error) {
      toast.error(`Error: ${error.message}`);
      return null;
    }
    return data;
  };

  const processMovies = async () => {
    setMovieRunning(true);
    const data = await runBatch('movie');
    if (data) {
      setMovieDone(prev => prev + (data.updated?.length || 0));
      setMovieErrors(prev => prev + (data.errors?.length || 0));
      setMovieRemaining(data.remaining);
      if (data.updated?.length) toast.success(`${data.updated.length} películas actualizadas`);
      if (data.remaining === 0) {
        setAutoMovie(false);
        toast.success("¡Todas las películas actualizadas!");
      }
    }
    setMovieRunning(false);
  };

  const processSeries = async () => {
    setSeriesRunning(true);
    const data = await runBatch('tv');
    if (data) {
      setSeriesDone(prev => prev + (data.updated?.length || 0));
      setSeriesErrors(prev => prev + (data.errors?.length || 0));
      setSeriesRemaining(data.remaining);
      if (data.updated?.length) toast.success(`${data.updated.length} series actualizadas`);
      if (data.remaining === 0) {
        setAutoSeries(false);
        toast.success("¡Todas las series actualizadas!");
      }
    }
    setSeriesRunning(false);
  };

  // Auto loop películas
  useEffect(() => {
    if (!autoMovie || movieRunning) return;
    if (movieRemaining === 0) { setAutoMovie(false); return; }
    const t = setTimeout(processMovies, 800);
    return () => clearTimeout(t);
  }, [autoMovie, movieRunning, movieRemaining]);

  // Auto loop series
  useEffect(() => {
    if (!autoSeries || seriesRunning) return;
    if (seriesRemaining === 0) { setAutoSeries(false); return; }
    const t = setTimeout(processSeries, 800);
    return () => clearTimeout(t);
  }, [autoSeries, seriesRunning, seriesRemaining]);

  const movieProgress = movieRemaining !== null && (movieDone + movieRemaining) > 0
    ? (movieDone / (movieDone + movieRemaining)) * 100 : 0;
  const seriesProgress = seriesRemaining !== null && (seriesDone + seriesRemaining) > 0
    ? (seriesDone / (seriesDone + seriesRemaining)) * 100 : 0;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-200 flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Enriquecer desde TMDB
        </CardTitle>
        <p className="text-sm text-gray-400">
          Completa descripción, géneros, rating, imágenes y trailer de películas/series importadas por API.
          Procesa de {BATCH_SIZE} en {BATCH_SIZE} para no saturar el servicio.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Películas */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Películas</span>
            <span className="text-gray-400">
              Faltan: {movieRemaining ?? '...'} · Actualizadas: {movieDone} · Errores: {movieErrors}
            </span>
          </div>
          <Progress value={movieProgress} />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={processMovies}
              disabled={movieRunning || movieRemaining === 0}
              variant="outline"
            >
              {movieRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Procesar lote ({BATCH_SIZE})
            </Button>
            <Button
              size="sm"
              onClick={() => setAutoMovie(!autoMovie)}
              disabled={movieRemaining === 0}
              variant={autoMovie ? "destructive" : "default"}
            >
              {autoMovie ? <><Pause className="h-4 w-4 mr-2" />Pausar auto</> : <><Play className="h-4 w-4 mr-2" />Auto-procesar todo</>}
            </Button>
          </div>
        </div>

        {/* Series */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Series</span>
            <span className="text-gray-400">
              Faltan: {seriesRemaining ?? '...'} · Actualizadas: {seriesDone} · Errores: {seriesErrors}
            </span>
          </div>
          <Progress value={seriesProgress} />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={processSeries}
              disabled={seriesRunning || seriesRemaining === 0}
              variant="outline"
            >
              {seriesRunning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Procesar lote ({BATCH_SIZE})
            </Button>
            <Button
              size="sm"
              onClick={() => setAutoSeries(!autoSeries)}
              disabled={seriesRemaining === 0}
              variant={autoSeries ? "destructive" : "default"}
            >
              {autoSeries ? <><Pause className="h-4 w-4 mr-2" />Pausar auto</> : <><Play className="h-4 w-4 mr-2" />Auto-procesar todo</>}
            </Button>
          </div>
        </div>

        <Button size="sm" variant="ghost" onClick={fetchCounts} disabled={movieRunning || seriesRunning}>
          <RefreshCw className="h-3 w-3 mr-2" /> Refrescar conteo
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnrichFromTMDB;
