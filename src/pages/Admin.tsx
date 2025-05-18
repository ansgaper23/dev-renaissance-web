
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import MovieTable from '@/components/MovieTable';
import ImportFromTMDB from '@/components/ImportFromTMDB';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Upload } from 'lucide-react';

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Película agregada",
      description: "La película se ha agregado correctamente",
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Panel de Administración</h1>
            <p className="text-gray-400 mt-1">Gestiona el contenido de tu plataforma de películas</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button variant="outline" className="hover:bg-gray-800 border-gray-700">
              Volver al sitio
            </Button>
          </div>
        </div>

        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="movies" className="data-[state=active]:bg-gray-800">
              Películas
            </TabsTrigger>
            <TabsTrigger value="add-movie" className="data-[state=active]:bg-gray-800">
              Agregar película
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-gray-800">
              Importar de TMDB
            </TabsTrigger>
          </TabsList>
          
          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input 
                  placeholder="Buscar películas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-800 w-full md:w-80"
                />
              </div>
              <Button className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2">
                <Plus size={16} /> Agregar película
              </Button>
            </div>
            
            <MovieTable searchTerm={searchTerm} />
          </TabsContent>
          
          {/* Add Movie Tab */}
          <TabsContent value="add-movie">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <form onSubmit={handleAddMovie} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input id="title" placeholder="Título de la película" className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year">Año</Label>
                      <Input id="year" placeholder="Año de lanzamiento" type="number" className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="poster">URL del Póster</Label>
                      <Input id="poster" placeholder="https://..." className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backdrop">URL del Fondo</Label>
                      <Input id="backdrop" placeholder="https://..." className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="genre">Género</Label>
                      <Input id="genre" placeholder="Acción, Aventura, etc." className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración</Label>
                      <Input id="duration" placeholder="2h 30m" className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rating">Calificación</Label>
                      <Input id="rating" placeholder="4.5" type="number" step="0.1" min="0" max="5" className="bg-gray-800 border-gray-700" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trailer">URL del Trailer</Label>
                      <Input id="trailer" placeholder="https://youtube.com/..." className="bg-gray-800 border-gray-700" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" placeholder="Descripción de la película..." className="bg-gray-800 border-gray-700 min-h-[120px]" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="streamUrl">URL del Stream</Label>
                    <Input id="streamUrl" placeholder="https://..." className="bg-gray-800 border-gray-700" />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90">
                    Guardar película
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Import Tab */}
          <TabsContent value="import">
            <ImportFromTMDB />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
