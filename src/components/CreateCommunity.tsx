
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
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Hash } from 'lucide-react';

export const CreateCommunity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      
      // Invalida le query per aggiornare le liste
      queryClient.invalidateQueries({ queryKey: ['subreddits'] });
      queryClient.invalidateQueries({ queryKey: ['communities-with-stats'] });
      
      setName('');
      setDescription('');
      
      // Naviga alla home page
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Crea una nuova comunità</h2>
            <p className="text-gray-600 mb-4">Devi essere loggato per creare una comunità</p>
            <Button onClick={() => navigate('/auth')}>
              Accedi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna alla home
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Hash className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Crea una nuova comunità</h2>
            <p className="text-gray-600">Costruisci uno spazio per condividere interessi comuni</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-base font-medium">Nome della comunità *</Label>
            <div className="flex items-center mt-2">
              <span className="text-gray-500 mr-2 font-medium">r/</span>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="nomecomunita"
                className="flex-1"
                maxLength={21}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              3-21 caratteri. Solo lettere, numeri e underscore. Una volta creata, non potrai cambiare il nome.
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium">Descrizione (opzionale)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrivi di cosa parla la tua comunità e cosa possono aspettarsi i membri..."
              className="min-h-[120px] mt-2"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                Una buona descrizione aiuta le persone a capire di cosa parla la tua comunità
              </p>
              <span className="text-sm text-gray-400">
                {description.length}/500
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">📋 Cosa succede dopo?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Diventerai il moderatore della comunità</li>
              <li>• Potrai iniziare a pubblicare contenuti</li>
              <li>• Altri utenti potranno unirsi e contribuire</li>
              <li>• Potrai personalizzare le regole della comunità</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="bg-orange-500 hover:bg-orange-600 flex-1"
            >
              {loading ? 'Creando...' : 'Crea comunità'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Annulla
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
