
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const CreateCommunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Devi essere loggato per creare una comunità');
      return;
    }

    if (!name.trim()) {
      toast.error('Il nome della comunità è obbligatorio');
      return;
    }

    // Valida il nome della comunità
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      toast.error('Il nome può contenere solo lettere, numeri e underscore');
      return;
    }

    if (name.length < 3 || name.length > 21) {
      toast.error('Il nome deve essere tra 3 e 21 caratteri');
      return;
    }

    setLoading(true);
    try {
      // Controlla se la comunità esiste già
      const { data: existing } = await supabase
        .from('subreddits')
        .select('id')
        .eq('name', name.toLowerCase())
        .single();

      if (existing) {
        toast.error('Una comunità con questo nome esiste già');
        setLoading(false);
        return;
      }

      // Crea la nuova comunità
      const { data, error } = await supabase
        .from('subreddits')
        .insert({
          name: name.toLowerCase(),
          description: description.trim() || null,
          creator_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Comunità creata con successo!');
      setName('');
      setDescription('');
      
      // Naviga alla home page o eventualmente alla pagina della comunità
      navigate('/');
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Errore nella creazione della comunità');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Crea una nuova comunità</h2>
          <p className="text-gray-600 mb-4">Devi essere loggato per creare una comunità</p>
          <Button onClick={() => navigate('/auth')}>
            Accedi
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Crea una nuova comunità</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome della comunità *</Label>
          <div className="flex items-center mt-1">
            <span className="text-gray-500 mr-1">r/</span>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="nomecomunita"
              className="flex-1"
              maxLength={21}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            3-21 caratteri. Solo lettere, numeri e underscore.
          </p>
        </div>

        <div>
          <Label htmlFor="description">Descrizione (opzionale)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrivi di cosa parla la tua comunità..."
            className="min-h-[100px] mt-1"
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">
            Massimo 500 caratteri
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !name.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? 'Creando...' : 'Crea comunità'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Annulla
          </Button>
        </div>
      </form>
    </Card>
  );
};
