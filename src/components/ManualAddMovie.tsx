import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMovie, MovieCreate } from '@/services/movieService';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const manualMovieSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  original_title: z.string().optional(),
  overview: z.string().optional(),
  release_date: z.string().optional(),
  rating: z.string().optional(),
  runtime: z.string().optional(),
  poster_path: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  backdrop_path: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  trailer_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  genres: z.string().optional(),
});

type ManualMovieFormData = z.infer<typeof manualMovieSchema>;

interface StreamServer {
  name: string;
  url: string;
  quality: string;
  language: string;
}

interface ManualAddMovieProps {
  // Nuevas props para permitir control externo del diálogo
  forceDialog?: boolean;
  open?: boolean;
  setOpen?: (v: boolean) => void;
  hideHeading?: boolean;
}

const ManualAddMovie: React.FC<ManualAddMovieProps> = ({
  forceDialog,
  open: externalOpen,
  setOpen: externalSetOpen,
  hideHeading,
}) => {
  // Si recibimos control externo, no manejamos localmente el estado del diálogo
  const [localOpen, setLocalOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = [
    forceDialog ? externalOpen! : localOpen,
    forceDialog ? externalSetOpen! : setLocalOpen
  ];
  const [streamServers, setStreamServers] = useState<StreamServer[]>([
    { name: '', url: '', quality: 'HD', language: 'Español' }
  ]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ManualMovieFormData>({
    resolver: zodResolver(manualMovieSchema),
    defaultValues: {
      title: '',
      original_title: '',
      overview: '',
      release_date: '',
      rating: '',
      runtime: '',
      poster_path: '',
      backdrop_path: '',
      trailer_url: '',
      genres: '',
    },
  });

  const addMovieMutation = useMutation({
    mutationFn: (movieData: MovieCreate) => addMovie(movieData),
    onSuccess: () => {
      toast({
        title: "Éxito",
        description: "Película agregada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['totalMovies'] });
      form.reset();
      setStreamServers([{ name: '', url: '', quality: 'HD', language: 'Español' }]);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addStreamServer = () => {
    setStreamServers([...streamServers, { name: '', url: '', quality: 'HD', language: 'Español' }]);
  };

  const removeStreamServer = (index: number) => {
    if (streamServers.length > 1) {
      setStreamServers(streamServers.filter((_, i) => i !== index));
    }
  };

  const updateStreamServer = (index: number, field: keyof StreamServer, value: string) => {
    const updated = streamServers.map((server, i) => 
      i === index ? { ...server, [field]: value } : server
    );
    setStreamServers(updated);
  };

  const onSubmit = (data: ManualMovieFormData) => {
    const movieData: MovieCreate = {
      title: data.title,
      original_title: data.original_title || null,
      overview: data.overview || null,
      release_date: data.release_date || null,
      rating: data.rating ? parseFloat(data.rating) : null,
      runtime: data.runtime ? parseInt(data.runtime) : null,
      poster_path: data.poster_path || null,
      backdrop_path: data.backdrop_path || null,
      trailer_url: data.trailer_url || null,
      genres: data.genres ? data.genres.split(',').map(g => g.trim()).filter(Boolean) : null,
      stream_servers: streamServers.filter(server => server.url.trim() !== ''),
    };

    addMovieMutation.mutate(movieData);
  };

  // Wrap el contenido dependiendo si viene por dialogo externo o modo clásico
  if (forceDialog) {
    return (
      <div className="space-y-6">
        {!hideHeading && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Agregar Película Manualmente</h2>
              <p className="text-gray-400 mt-1">
                Añade películas ingresando todos los datos manualmente
              </p>
            </div>
          </div>
        )}
        {/* Igual que el contenido dentro de DialogContent original */}
        {/* ... keep entire form component exactly the same as original ... */}
        {/* ... copy el contenido del formulario y la Card "Instrucciones", sin Dialog envolviendo ... */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Título *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Título de la película"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="original_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Título Original</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Título original"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Sinopsis</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Descripción de la película"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="release_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Fecha de Estreno</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Calificación (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="7.5"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Duración (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="120"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="genres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Géneros</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Acción, Aventura, Ciencia Ficción (separados por comas)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="poster_path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">URL del Póster</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://example.com/poster.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="backdrop_path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">URL del Fondo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="https://example.com/backdrop.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="trailer_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">URL del Tráiler</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stream Servers Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 text-base font-medium">Servidores de Streaming</Label>
                <Button
                  type="button"
                  onClick={addStreamServer}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Servidor
                </Button>
              </div>

              {streamServers.map((server, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-gray-800 rounded-lg">
                  <Input
                    placeholder="Nombre del servidor"
                    value={server.name}
                    onChange={(e) => updateStreamServer(index, 'name', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="URL del stream"
                    value={server.url}
                    onChange={(e) => updateStreamServer(index, 'url', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white md:col-span-2"
                  />
                  <Input
                    placeholder="Calidad"
                    value={server.quality}
                    onChange={(e) => updateStreamServer(index, 'quality', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <div className="flex gap-1">
                    <Input
                      placeholder="Idioma"
                      value={server.language}
                      onChange={(e) => updateStreamServer(index, 'language', e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {streamServers.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeStreamServer(index)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={addMovieMutation.isPending}
                className="bg-cuevana-blue hover:bg-cuevana-blue/90"
              >
                {addMovieMutation.isPending ? 'Agregando...' : 'Agregar Película'}
              </Button>
            </div>
          </form>
        </Form>
        {/* Card de instrucciones */}
        <div className="mt-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-gray-300">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-400 space-y-2">
              <p>• El título es obligatorio, los demás campos son opcionales</p>
              <p>• Los géneros deben estar separados por comas</p>
              <p>• Las URLs de imágenes deben ser enlaces directos a archivos de imagen</p>
              <p>• Puedes agregar múltiples servidores de streaming para cada película</p>
              <p>• La calificación debe estar entre 0 y 10</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Modo clásico (antiguo por pestaña)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agregar Película Manualmente</h2>
          <p className="text-gray-400 mt-1">
            Añade películas ingresando todos los datos manualmente
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Película
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Agregar Película Manualmente</DialogTitle>
              <DialogDescription className="text-gray-400">
                Completa la información de la película que deseas agregar
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Título *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="Título de la película"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="original_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Título Original</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="Título original"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="overview"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Sinopsis</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Descripción de la película"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="release_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Fecha de Estreno</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Calificación (1-10)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="7.5"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="runtime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Duración (minutos)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="120"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Géneros</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Acción, Aventura, Ciencia Ficción (separados por comas)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="poster_path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">URL del Póster</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="https://example.com/poster.jpg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backdrop_path"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">URL del Fondo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="https://example.com/backdrop.jpg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="trailer_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">URL del Tráiler</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stream Servers Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300 text-base font-medium">Servidores de Streaming</Label>
                    <Button
                      type="button"
                      onClick={addStreamServer}
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Servidor
                    </Button>
                  </div>

                  {streamServers.map((server, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-gray-800 rounded-lg">
                      <Input
                        placeholder="Nombre del servidor"
                        value={server.name}
                        onChange={(e) => updateStreamServer(index, 'name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Input
                        placeholder="URL del stream"
                        value={server.url}
                        onChange={(e) => updateStreamServer(index, 'url', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white md:col-span-2"
                      />
                      <Input
                        placeholder="Calidad"
                        value={server.quality}
                        onChange={(e) => updateStreamServer(index, 'quality', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <div className="flex gap-1">
                        <Input
                          placeholder="Idioma"
                          value={server.language}
                          onChange={(e) => updateStreamServer(index, 'language', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        {streamServers.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeStreamServer(index)}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={addMovieMutation.isPending}
                    className="bg-cuevana-blue hover:bg-cuevana-blue/90"
                  >
                    {addMovieMutation.isPending ? 'Agregando...' : 'Agregar Película'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-300">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-400 space-y-2">
          <p>• El título es obligatorio, los demás campos son opcionales</p>
          <p>• Los géneros deben estar separados por comas</p>
          <p>• Las URLs de imágenes deben ser enlaces directos a archivos de imagen</p>
          <p>• Puedes agregar múltiples servidores de streaming para cada película</p>
          <p>• La calificación debe estar entre 0 y 10</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualAddMovie;
