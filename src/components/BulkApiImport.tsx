import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Film, Tv } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getAdminSession } from '@/services/movieService';

const BulkApiImport = () => {
  const [type, setType] = useState<'movies' | 'series'>('movies');
  const [url, setUrl] = useState('');
  const [limit, setLimit] = useState<number>(20);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImport = async () => {
    if (!url.trim() || !/^https?:\/\//i.test(url.trim())) {
      toast({ title: "Error", description: "Ingresa una URL válida (http/https)", variant: "destructive" });
      return;
    }
    if (limit < 1) {
      toast({ title: "Error", description: "El límite debe ser mayor a 0", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    setResult(null);

    try {
      const session = getAdminSession();
      const { data, error } = await supabase.functions.invoke('bulk-import-api', {
        body: { type, url: url.trim(), limit },
        headers: { 'x-admin-token': session?.session_token || '' },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setResult(data);
      toast({
        title: "Importación completada",
        description: `${data.imported} ${type === 'movies' ? 'películas' : 'series'} importadas, ${data.skipped} duplicadas/ignoradas`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-medium mb-2">Importar desde URL JSON</h3>
          <p className="text-gray-400 text-sm">
            Ingresa una URL que devuelva un JSON con películas o series. Los datos adicionales (género, sinopsis, fecha, rating) se obtienen automáticamente de TMDB. Los duplicados (por tmdb_id) se ignoran.
          </p>
        </div>

        {/* Type selector */}
        <div className="flex gap-3">
          <Button
            variant={type === 'movies' ? 'default' : 'outline'}
            onClick={() => setType('movies')}
            className={type === 'movies' ? 'bg-brand-purple hover:bg-brand-purple/90' : 'border-gray-700'}
          >
            <Film size={16} className="mr-2" /> Películas
          </Button>
          <Button
            variant={type === 'series' ? 'default' : 'outline'}
            onClick={() => setType('series')}
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
            className="bg-gray-800 border-gray-700"
          />
          <p className="text-xs text-gray-500">
            Acepta arrays directos o estructuras como {`{ movies: [...] }`} / {`{ data: [...] }`}.
          </p>
        </div>

        {/* Limit */}
        <div className="flex items-end gap-4 flex-wrap">
          <div className="space-y-1">
            <label className="text-sm text-gray-400">Límite de items por importación</label>
            <Input
              type="number"
              min={1}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-gray-800 border-gray-700 w-32"
            />
          </div>
          <p className="text-xs text-gray-500 pb-2">
            Sin límite máximo. Se procesa de a 2 con pausas para no saturar el sistema. Para catálogos grandes (1000+) puede tardar varios minutos.
          </p>
        </div>

        <Button
          onClick={handleImport}
          disabled={isImporting}
          className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2"
        >
          {isImporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importando {type === 'movies' ? 'películas' : 'series'}...
            </>
          ) : (
            <>
              <Download size={16} /> Importar {type === 'movies' ? 'películas' : 'series'}
            </>
          )}
        </Button>

        {/* Results */}
        {result && (
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-green-400">Resultado:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Total:</span>
                <span className="ml-2 text-white font-bold">{result.total}</span>
              </div>
              <div>
                <span className="text-gray-400">Importadas:</span>
                <span className="ml-2 text-green-400 font-bold">{result.imported}</span>
              </div>
              <div>
                <span className="text-gray-400">Duplicadas:</span>
                <span className="ml-2 text-yellow-400 font-bold">{result.skipped}</span>
              </div>
              <div>
                <span className="text-gray-400">Fallidas:</span>
                <span className="ml-2 text-red-400 font-bold">{result.failed}</span>
              </div>
            </div>
            {result.errors?.length > 0 && (
              <div className="mt-2 text-xs text-red-400 max-h-40 overflow-auto space-y-1">
                {result.errors.map((e: string, i: number) => (
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
