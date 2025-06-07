import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuth } from '@/hooks/useAuth';
import { useSubreddits } from '@/hooks/useSubreddits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Link, Loader2, ImagePlus, X, Sparkles, Users } from 'lucide-react';
import { ScrapingService } from '@/utils/ScrapingService';
import { GeminiService } from '@/utils/GeminiService';
import { useNavigate } from 'react-router-dom';

export const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: subreddits, isLoading: isLoadingSubreddits } = useSubreddits();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [selectedSubredditId, setSelectedSubredditId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [postType, setPostType] = useState<'text' | 'link' | 'image'>('text');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (subreddits && subreddits.length > 0 && !selectedSubredditId) {
      setSelectedSubredditId(subreddits[0].id);
    }
  }, [subreddits, selectedSubredditId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Errore",
          description: "L'immagine non può superare i 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

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
        const contentParts = [];
        
        if (result.data.description) {
          contentParts.push(result.data.description);
        } else if (result.data.content) {
          contentParts.push(result.data.content);
        }
        
        if (result.data.siteName) {
          contentParts.push(`\nFonte: ${result.data.siteName}`);
        }
        
        if (result.data.author) {
          contentParts.push(`Autore: ${result.data.author}`);
        }
        
        setContent(contentParts.join('\n'));
        setScrapedData(result.data);
        
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

  const handleEnhanceWithAI = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un titolo o contenuto da approfondire",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    try {
      // Strip HTML tags for AI processing
      const plainTextContent = content.replace(/<[^>]*>/g, '');
      const result = await GeminiService.enhancePostContent(title, plainTextContent, url);
      
      if (result.success && result.data) {
        setContent(result.data);
        
        toast({
          title: "Contenuto approfondito!",
          description: "L'AI ha analizzato e approfondito il contenuto",
        });
      } else {
        toast({
          title: "Errore",
          description: result.error || "Impossibile approfondire il contenuto",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'approfondimento con AI",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleCreateCommunity = () => {
    navigate('/create-community');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedSubredditId) {
      toast({
        title: "Errore",
        description: "Seleziona una comunità",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = null;
      
      if (postType === 'image' && selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast({
            title: "Errore",
            description: "Impossibile caricare l'immagine",
            variant: "destructive",
          });
          return;
        }
      }
      
      if (postType === 'link' && !imageUrl && url) {
        try {
          const scrapingResult = await ScrapingService.scrapeUrl(url);
          if (scrapingResult.success && scrapingResult.data?.image) {
            imageUrl = scrapingResult.data.image;
          }
        } catch (error) {
          console.log('Could not get image from scraped content:', error);
        }
      }

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
          subreddit_id: selectedSubredditId,
          image_url: imageUrl,
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
        setSelectedSubredditId(subreddits?.[0]?.id || '');
        setIsOpen(false);
        setPostType('text');
        removeImage();
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
                Comunità
              </label>
              <div className="flex gap-2">
                <select 
                  value={selectedSubredditId}
                  onChange={(e) => setSelectedSubredditId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isLoadingSubreddits}
                >
                  {isLoadingSubreddits ? (
                    <option>Caricamento...</option>
                  ) : subreddits && subreddits.length > 0 ? (
                    subreddits.map((subreddit) => (
                      <option key={subreddit.id} value={subreddit.id}>
                        r/{subreddit.name}
                        {subreddit.description && ` - ${subreddit.description.substring(0, 50)}${subreddit.description.length > 50 ? '...' : ''}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Nessuna comunità disponibile</option>
                  )}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCreateCommunity}
                  className="flex-shrink-0"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Nuova
                </Button>
              </div>
              {(!subreddits || subreddits.length === 0) && !isLoadingSubreddits && (
                <p className="text-sm text-gray-500 mt-1">
                  Non ci sono comunità disponibili. Crea la prima comunità!
                </p>
              )}
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
                <Button
                  type="button"
                  variant={postType === 'image' ? 'default' : 'outline'}
                  onClick={() => setPostType('image')}
                  className="flex-1"
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Immagine
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

            {postType === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Immagine
                </label>
                {!imagePreview ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                          <span>Carica un file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </label>
                        <p className="pl-1">o trascina e rilascia</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF fino a 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 max-h-96 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {postType === 'link' ? "Descrizione del link (opzionale)" : "Contenuto (opzionale)"}
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder={postType === 'link' ? "Descrizione del link..." : "Scrivi il contenuto del tuo post..."}
              />
            </div>

            {(title.trim() || content.trim() || scrapedData) && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleEnhanceWithAI}
                  disabled={isEnhancing}
                  variant="outline"
                  className="flex-1"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Approfondimento...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Approfondisci con AI
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedSubredditId}
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
                  setScrapedData(null);
                  setSelectedSubredditId(subreddits?.[0]?.id || '');
                  removeImage();
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
