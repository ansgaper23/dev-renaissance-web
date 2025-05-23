
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import MovieTableConnector from '@/components/MovieTableConnector';
import AdminHeader from '@/components/AdminHeader';
import AdminDashboard from '@/components/AdminDashboard';
import ImportFromTMDB from '@/components/ImportFromTMDB';
import QuickAddMovie from '@/components/QuickAddMovie';
import QuickAddSeries from '@/components/QuickAddSeries';

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4">
        <AdminHeader />
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-gray-800">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-gray-800">
              Películas
            </TabsTrigger>
            <TabsTrigger value="series" className="data-[state=active]:bg-gray-800">
              Series
            </TabsTrigger>
            <TabsTrigger value="quick-add-movie" className="data-[state=active]:bg-gray-800">
              Agregar Película
            </TabsTrigger>
            <TabsTrigger value="quick-add-series" className="data-[state=active]:bg-gray-800">
              Agregar Serie
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-gray-800">
              Importar TMDB
            </TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
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
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 flex items-center gap-2">
                <Plus size={16} /> Nueva película
              </Button>
            </div>
            
            <MovieTableConnector searchTerm={searchTerm} />
          </TabsContent>
          
          {/* Series Tab */}
          <TabsContent value="series" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input 
                  placeholder="Buscar series..." 
                  className="pl-10 bg-gray-900 border-gray-800 w-full md:w-80"
                />
              </div>
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 flex items-center gap-2">
                <Plus size={16} /> Nueva serie
              </Button>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
              <h3 className="text-xl font-semibold mb-4">Funcionalidad de Series</h3>
              <p className="text-gray-400 mb-6">
                La gestión de series estará disponible próximamente. Por ahora puedes usar la función de "Agregar Serie" para preparar contenido.
              </p>
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                Próximamente
              </Button>
            </div>
          </TabsContent>
          
          {/* Quick Add Movie Tab */}
          <TabsContent value="quick-add-movie">
            <QuickAddMovie />
          </TabsContent>
          
          {/* Quick Add Series Tab */}
          <TabsContent value="quick-add-series">
            <QuickAddSeries />
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
