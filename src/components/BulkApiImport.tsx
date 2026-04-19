import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, Download, Film, Tv, StopCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAdminSession } from '@/services/movieService';

const BulkApiImport = () => {
  const [type, setType] = useState<'movies' | 'series'>('movies');
  const [url, setUrl] = useState('');
  const [limit, setLimit] = useState<number>(0); // 0 = sin límite
  const [batchSize, setBatchSize] = useState<number>(5);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, imported: 0, skipped: 0, failed: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const cancelRef = useRef(false);

  const handleImport = async () => {
    if (!url.trim() || !/^https?:\/\//i.test(url.trim())) {
      toast({ title: "Error", description: "Ingresa una URL válida (http/https)", variant: "destructive" });
      return;
    }
    if (batchSize < 1 || batchSize > 10) {
      toast({ title: "Error", description: "El tamaño de lote debe estar entre 1 y 10", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    cancelRef.current = false;
    setProgress({ processed: 0, total: 0, imported: 0, skipped: 0, failed: 0 });
    setErrors([]);

    const session = getAdminSession();
    let offset = 0;
    let totals = { imported: 0, skipped: 0, failed: 0 };
    const errorBag: string[] = [];

    try {
      while (!cancelRef.current) {
        const { data, error } = await supabase.functions.invoke('bulk-import-api', {
          body: {
            type,
            url: url.trim(),
            limit: limit > 0 ? limit : undefined,
            offset,
            batchSize,
          },
          headers: { 'x-admin-token': session?.session_token || '' },
        });

        // Try to extract real server error (FunctionsHttpError hides body in error.context)
        let serverMsg: string | null = (data as any)?.error || null;
        if (!serverMsg && error) {
          try {
            const ctx: any = (error as any).context;
            if (ctx?.json) serverMsg = (await ctx.json())?.error;
            else if (ctx?.text) serverMsg = await ctx.text();
          } catch { /* ignore */ }
          if (!serverMsg) serverMsg = error.message;
        }
        if (serverMsg) throw new Error(serverMsg);

        totals.imported += data.imported || 0;
        totals.skipped += data.skipped || 0;
        totals.failed += data.failed || 0;
        if (data.errors?.length) errorBag.push(...data.errors);

        setProgress({
          processed: data.nextOffset,
          total: data.totalToProcess,
          ...totals,
        });
        setErrors(errorBag.slice(-20));

        if (data.done) break;
        offset = data.nextOffset;

        // Small pause between batches to relieve pressure
        await new Promise((r) => setTimeout(r, 500));
      }

      toast({
        title: cancelRef.current ? "Importación cancelada" : "Importación completada",
        description: `${totals.imported} importadas, ${totals.skipped} duplicadas, ${totals.failed} fallidas`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
      cancelRef.current = false;
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
  };

  const progressPct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-medium mb-2">Importar desde URL JSON</h3>
          <p className="text-gray-400 text-sm">
            Procesamiento por lotes para evitar timeouts. El frontend invoca el edge function múltiples veces hasta completar todos los items. Datos enriquecidos con TMDB. Duplicados (por tmdb_id) se ignoran.
          </p>
        </div>

        {/* Type selector */}
        <div className="flex gap-3">
          <Button
            variant={type === 'movies' ? 'default' : 'outline'}
            onClick={() => setType('movies')}
            disabled={isImporting}
            className={type === 'movies' ? 'bg-brand-purple hover:bg-brand-purple/90' : 'border-gray-700'}
          >
            <Film size={16} className="mr-2" /> Películas
          </Button>
          <Button
            variant={type === 'series' ? 'default' : 'outline'}
            onClick={() => setType('series')}
            disabled={isImporting}
            className={type === 'series' ? 'bg-cuevana-blue hover:bg-cuevana-blue/90' : 'border-gray-700'}
          >
            <Tv size={16} className="mr-2" /> Series
          </Button>
        </div>

        {/* URL input */}
        <div className="space-y-1">
          <label className="text-sm text-gray-400">URL del JSON</label>
          <Input
            type="url"
            placeholder="https://ejemplo.com/peliculas.json"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isImporting}
            className="bg-gray-800 border-gray-700"
          />
          <p className="text-xs text-gray-500">
            Acepta arrays directos o estructuras como {`{ movies: [...] }`} / {`{ data: [...] }`}.
          </p>
        </div>

        {/* Limit + batch size */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Límite total (0 = sin límite)</label>
            <Input
              type="number"
              min={0}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={isImporting}
              className="bg-gray-800 border-gray-700 w-32"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Items por lote (1-10)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              disabled={isImporting}
              className="bg-gray-800 border-gray-700 w-32"
            />
          </div>
          <p className="text-xs text-gray-500 pb-2 max-w-md">
            Lotes pequeños (3-5) son más seguros. Para 14000 items con lote de 5 son ~2800 invocaciones, puede tardar mucho — déjalo corriendo.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleImport}
            disabled={isImporting}
            className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download size={16} /> Importar {type === 'movies' ? 'películas' : 'series'}
              </>
            )}
          </Button>
          {isImporting && (
            <Button onClick={handleCancel} variant="destructive" className="flex items-center gap-2">
              <StopCircle size={16} /> Detener
            </Button>
          )}
        </div>

        {/* Progress */}
        {(isImporting || progress.total > 0) && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">
                Progreso: {progress.processed} / {progress.total}
              </span>
              <span className="text-brand-purple font-bold">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-sm pt-2">
              <div>
                <span className="text-gray-400">Importadas:</span>
                <span className="ml-2 text-green-400 font-bold">{progress.imported}</span>
              </div>
              <div>
                <span className="text-gray-400">Duplicadas:</span>
                <span className="ml-2 text-yellow-400 font-bold">{progress.skipped}</span>
              </div>
              <div>
                <span className="text-gray-400">Fallidas:</span>
                <span className="ml-2 text-red-400 font-bold">{progress.failed}</span>
              </div>
            </div>
            {errors.length > 0 && (
              <div className="mt-2 text-xs text-red-400 max-h-40 overflow-auto space-y-1 border-t border-gray-700 pt-2">
                <div className="text-gray-400 mb-1">Últimos errores:</div>
                {errors.map((e, i) => (
                  <div key={i}>• {e}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkApiImport;
