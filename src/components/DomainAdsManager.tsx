import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDomainAds, createDomainAd, updateDomainAd, deleteDomainAd, DomainAd } from '@/services/domainAdsService';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Globe, Monitor, Save, Loader2 } from 'lucide-react';

const DomainAdsManager = () => {
  const queryClient = useQueryClient();
  const [newAd, setNewAd] = useState({ domain: '', ad_name: '', ad_code: '', scope: 'playback' as 'global' | 'playback' });

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['domainAds'],
    queryFn: fetchDomainAds,
  });

  const createMutation = useMutation({
    mutationFn: createDomainAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domainAds'] });
      setNewAd({ domain: '', ad_name: '', ad_code: '', scope: 'playback' });
      toast({ title: "Anuncio creado", description: "El anuncio se ha guardado correctamente" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateDomainAd(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['domainAds'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDomainAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domainAds'] });
      toast({ title: "Eliminado", description: "El anuncio ha sido eliminado" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleCreate = () => {
    if (!newAd.domain.trim() || !newAd.ad_code.trim()) {
      toast({ title: "Error", description: "Dominio y código son requeridos", variant: "destructive" });
      return;
    }
    createMutation.mutate(newAd);
  };

  // Group ads by domain
  const groupedAds = ads.reduce<Record<string, DomainAd[]>>((acc, ad) => {
    if (!acc[ad.domain]) acc[ad.domain] = [];
    acc[ad.domain].push(ad);
    return acc;
  }, {});

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Anuncios por Dominio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new ad */}
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-4">
          <h4 className="text-white font-medium">Agregar Nuevo Anuncio</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-gray-300 text-sm">Dominio</Label>
              <Input
                value={newAd.domain}
                onChange={(e) => setNewAd(p => ({ ...p, domain: e.target.value }))}
                placeholder="cuevana3.gal"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Nombre del anuncio</Label>
              <Input
                value={newAd.ad_name}
                onChange={(e) => setNewAd(p => ({ ...p, ad_name: e.target.value }))}
                placeholder="Banner principal"
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-sm">Alcance</Label>
              <Select value={newAd.scope} onValueChange={(v: 'global' | 'playback') => setNewAd(p => ({ ...p, scope: v }))}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playback">
                    <div className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Solo reproducción</div>
                  </SelectItem>
                  <SelectItem value="global">
                    <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Global (todas las páginas)</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-gray-300 text-sm">Código del anuncio</Label>
            <Textarea
              value={newAd.ad_code}
              onChange={(e) => setNewAd(p => ({ ...p, ad_code: e.target.value }))}
              placeholder="<script>...</script>"
              className="bg-gray-900 border-gray-600 text-white font-mono text-sm"
              rows={4}
            />
          </div>
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            Agregar Anuncio
          </Button>
        </div>

        {/* Current ads grouped by domain */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando anuncios...
          </div>
        ) : Object.keys(groupedAds).length === 0 ? (
          <p className="text-gray-400">No hay anuncios configurados</p>
        ) : (
          Object.entries(groupedAds).map(([domain, domainAds]) => (
            <div key={domain} className="space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-400" />
                {domain}
                <Badge variant="secondary" className="text-xs">{domainAds.length} anuncio(s)</Badge>
              </h4>
              <div className="space-y-2">
                {domainAds.map((ad) => (
                  <div key={ad.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded border border-gray-700">
                    <Switch
                      checked={ad.is_active}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: ad.id, is_active: checked })}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{ad.ad_name || 'Sin nombre'}</span>
                        <Badge variant={ad.scope === 'global' ? 'default' : 'secondary'} className="text-xs">
                          {ad.scope === 'global' ? 'Global' : 'Reproducción'}
                        </Badge>
                        {!ad.is_active && <Badge variant="outline" className="text-xs text-red-400 border-red-400">Inactivo</Badge>}
                      </div>
                      <p className="text-gray-400 text-xs mt-1 font-mono truncate">{ad.ad_code.substring(0, 80)}...</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(ad.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>💡 Tip:</strong> Cada dominio puede tener múltiples anuncios. Los anuncios con alcance "Reproducción" solo se muestran en páginas de películas/series. Los "Global" se muestran en todas las páginas del dominio.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainAdsManager;
