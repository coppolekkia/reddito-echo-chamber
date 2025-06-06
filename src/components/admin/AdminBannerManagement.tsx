
import { useState } from 'react';
import { useAdminBanners, Banner } from '@/hooks/useBanners';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, ExternalLink, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const AdminBannerManagement = () => {
  const { banners, loading, createBanner, updateBanner, deleteBanner } = useAdminBanners();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    content_type: 'text' as 'text' | 'html',
    image_url: '',
    link_url: '',
    position: 'top' as 'top' | 'sidebar' | 'bottom',
    priority: 0,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      content_type: 'text',
      image_url: '',
      link_url: '',
      position: 'top',
      priority: 0,
      is_active: true
    });
  };

  const handleCreate = async () => {
    try {
      await createBanner(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating banner:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingBanner) return;
    
    try {
      await updateBanner(editingBanner.id, formData);
      setEditingBanner(null);
      resetForm();
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questo banner?')) {
      await deleteBanner(id);
    }
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      content: banner.content || '',
      content_type: banner.content?.includes('<') ? 'html' : 'text',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      position: banner.position,
      priority: banner.priority,
      is_active: banner.is_active
    });
  };

  if (loading) {
    return <div className="text-center py-8">Caricamento banner...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestione Banner</CardTitle>
              <CardDescription>
                Gestisci i banner pubblicitari del sito
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Banner</DialogTitle>
                  <DialogDescription>
                    Inserisci i dettagli del nuovo banner
                  </DialogDescription>
                </DialogHeader>
                <BannerForm formData={formData} setFormData={setFormData} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
                    Crea Banner
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Posizione</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Priorità</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{banner.title}</span>
                        {banner.link_url && (
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      {banner.content && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {banner.content.includes('<') ? 'Contenuto HTML' : banner.content}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {banner.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={banner.content?.includes('<') ? "default" : "secondary"}>
                        {banner.content?.includes('<') ? (
                          <><Code className="h-3 w-3 mr-1" />HTML</>
                        ) : 'Testo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{banner.priority}</TableCell>
                    <TableCell>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Attivo" : "Disattivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingBanner && (
        <Dialog open={!!editingBanner} onOpenChange={() => setEditingBanner(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifica Banner</DialogTitle>
              <DialogDescription>
                Modifica i dettagli del banner
              </DialogDescription>
            </DialogHeader>
            <BannerForm formData={formData} setFormData={setFormData} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBanner(null)}>
                Annulla
              </Button>
              <Button onClick={handleEdit} className="bg-orange-500 hover:bg-orange-600">
                Salva Modifiche
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface BannerFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

const BannerForm = ({ formData, setFormData }: BannerFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Titolo *</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Titolo del banner"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Contenuto</label>
        <Tabs 
          value={formData.content_type} 
          onValueChange={(value) => setFormData({ ...formData, content_type: value })}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Testo</TabsTrigger>
            <TabsTrigger value="html">
              <Code className="h-4 w-4 mr-1" />
              Codice HTML
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-2">
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Descrizione del banner"
              rows={3}
            />
          </TabsContent>
          <TabsContent value="html" className="mt-2">
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="<div>Inserisci qui il tuo codice HTML...</div>"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Puoi inserire HTML, CSS inline e anche JavaScript. Usa con attenzione.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <label className="text-sm font-medium">URL Immagine</label>
        <Input
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          placeholder="https://esempio.com/immagine.jpg"
        />
      </div>

      <div>
        <label className="text-sm font-medium">URL Link</label>
        <Input
          value={formData.link_url}
          onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
          placeholder="https://esempio.com"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Posizione</label>
        <Select 
          value={formData.position} 
          onValueChange={(value) => setFormData({ ...formData, position: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="sidebar">Sidebar</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Priorità</label>
        <Input
          type="number"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <label className="text-sm font-medium">Banner attivo</label>
      </div>
    </div>
  );
};
