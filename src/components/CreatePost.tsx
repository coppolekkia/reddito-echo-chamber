
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Link, Loader2 } from 'lucide-react';
import { ScrapingService } from '@/utils/ScrapingService';

export const CreatePost = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [subredditName, setSubredditName] = useState('reactjs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [postType, setPostType] = useState<'text' | 'link'>('text');
  const queryClient = useQueryClient();

  const handleScrapeUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un URL valido",
        variant: "destructive",
      });
      return;
    }

    setIsScraping(true);
    try {
      const result = await ScrapingService.scrapeUrl(url);
      
      if (result.success && result.data) {
        setTitle(result.data.title || '');
        setContent(result.data.description || result.data.content || '');
        
        toast({
          title: "Contenuto recuperato!",
          description: "I dati del link sono stati estratti automaticamente",
        });
      } else {
        toast({
          title: "Errore",
          description: result.error || "Impossibile recuperare il contenuto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il recupero del contenuto",
        variant: "destructive",
      });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Get subreddit ID
      const { data: subreddit } = await supabase
        .from('subreddits')
        .select('id')
        .eq('name', subredditName)
        .single();

      if (!subreddit) {
        toast({
          title: "Errore",
          description: "Subreddit non trovato",
          variant: "destructive",
        });
        return;
      }

      // Prepare content based on post type
      let postContent = content;
      if (postType === 'link' && url) {
        postContent = `${content}\n\nLink: ${url}`;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          title,
          content: postContent || null,
          author_id: user.id,
          subreddit_id: subreddit.id,
        });

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile creare il post",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Post creato!",
          description: "Il tuo post è stato pubblicato con successo",
        });
        setTitle('');
        setContent('');
        setUrl('');
        setIsOpen(false);
        setPostType('text');
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Qualcosa è andato storto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mb-6">
      {!isOpen ? (
        <Card className="p-4">
          <Button 
            onClick={() => setIsOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crea un nuovo post
          </Button>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Crea un nuovo post</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subreddit
              </label>
              <select 
                value={subredditName}
                onChange={(e) => setSubredditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="reactjs">r/reactjs</option>
                <option value="javascript">r/javascript</option>
                <option value="webdev">r/webdev</option>
                <option value="programming">r/programming</option>
                <option value="technology">r/technology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di post
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={postType === 'text' ? 'default' : 'outline'}
                  onClick={() => setPostType('text')}
                  className="flex-1"
                >
                  Testo
                </Button>
                <Button
                  type="button"
                  variant={postType === 'link' ? 'default' : 'outline'}
                  onClick={() => setPostType('link')}
                  className="flex-1"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
              </div>
            </div>

            {postType === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://esempio.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleScrapeUrl}
                    disabled={isScraping || !url.trim()}
                    variant="outline"
                  >
                    {isScraping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Estrai"
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            <div>
              <Input
                placeholder="Titolo del post"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Textarea
                placeholder={postType === 'link' ? "Descrizione del link (opzionale)" : "Contenuto (opzionale)"}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isSubmitting ? 'Pubblicazione...' : 'Pubblica'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsOpen(false);
                  setTitle('');
                  setContent('');
                  setUrl('');
                  setPostType('text');
                }}
              >
                Annulla
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
