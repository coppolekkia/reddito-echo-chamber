import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useVote } from "@/hooks/usePosts";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  image_url?: string;
  comment_count?: number;
}

export const PostCard = ({ 
  id,
  title, 
  content, 
  author, 
  subreddit, 
  upvotes: initialUpvotes, 
  downvotes: initialDownvotes,
  comments, 
  timeAgo,
  image_url,
  comment_count 
}: PostCardProps) => {
  const { user } = useAuth();
  const { vote, isVoting } = useVote();
  const { toggleSave, isPostSaved, isSaving } = useSavedPosts();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentUpvotes, setCurrentUpvotes] = useState(initialUpvotes);
  const [currentDownvotes, setCurrentDownvotes] = useState(initialDownvotes);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    if (user) {
      // Check user's existing vote
      const checkUserVote = async () => {
        const { data } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setUserVote(data.vote_type as 'up' | 'down');
        }
      };
      checkUserVote();
    }
  }, [id, user]);

  useEffect(() => {
    setCurrentUpvotes(initialUpvotes);
    setCurrentDownvotes(initialDownvotes);
  }, [initialUpvotes, initialDownvotes]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || isVoting) return;

    const oldVote = userVote;
    const oldUpvotes = currentUpvotes;
    const oldDownvotes = currentDownvotes;

    // Optimistic update
    if (oldVote === voteType) {
      // Remove vote
      setUserVote(null);
      if (voteType === 'up') {
        setCurrentUpvotes(oldUpvotes - 1);
      } else {
        setCurrentDownvotes(oldDownvotes - 1);
      }
    } else if (oldVote && oldVote !== voteType) {
      // Change vote
      setUserVote(voteType);
      if (oldVote === 'up') {
        setCurrentUpvotes(oldUpvotes - 1);
        setCurrentDownvotes(oldDownvotes + 1);
      } else {
        setCurrentUpvotes(oldUpvotes + 1);
        setCurrentDownvotes(oldDownvotes - 1);
      }
    } else {
      // New vote
      setUserVote(voteType);
      if (voteType === 'up') {
        setCurrentUpvotes(oldUpvotes + 1);
      } else {
        setCurrentDownvotes(oldDownvotes + 1);
      }
    }

    try {
      await vote(id, voteType, user.id);
      // Refresh posts data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      // Revert optimistic update on error
      setUserVote(oldVote);
      setCurrentUpvotes(oldUpvotes);
      setCurrentDownvotes(oldDownvotes);
    }
  };

  const handleSave = () => {
    if (!user) {
      toast.error("Devi essere loggato per salvare i post");
      navigate('/auth');
      return;
    }

    toggleSave(id);
    toast.success(isPostSaved(id) ? "Post rimosso dai salvati" : "Post salvato!");
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${id}`;
    
    try {
      // Controlla se l'API Web Share è disponibile e supportata
      if (navigator.share && navigator.canShare && navigator.canShare({ url: postUrl })) {
        await navigator.share({
          title: title,
          text: `Guarda questo post: ${title}`,
          url: postUrl,
        });
      } else {
        // Fallback: copia negli appunti
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copiato negli appunti!");
      }
    } catch (error) {
      // Se anche il clipboard fallisce, mostra il link
      try {
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copiato negli appunti!");
      } catch (clipboardError) {
        // Ultimo fallback: mostra un alert con il link
        alert(`Copia questo link: ${postUrl}`);
      }
    }
  };

  const handleCommentClick = () => {
    // Naviga alla pagina del singolo post per vedere/aggiungere commenti
    navigate(`/post/${id}`);
  };

  const handleSubredditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/r/${subreddit}`);
  };

  const totalScore = currentUpvotes - currentDownvotes;
  const displayCommentCount = comment_count !== undefined ? comment_count : comments;
  const isPostCurrentlySaved = isPostSaved(id);

  // Determine if content should be truncated
  const shouldTruncateContent = content && content.length > 300;
  const displayContent = shouldTruncateContent && !showFullContent 
    ? content.substring(0, 300) + '...' 
    : content;

  if (isMobile) {
    return (
      <Card className="mb-3 overflow-hidden hover:shadow-md transition-shadow duration-200 mx-2">
        {/* Header del post */}
        <div className="p-3 pb-2">
          <div className="flex items-center text-xs text-gray-500 mb-2 flex-wrap">
            <span 
              className="font-semibold text-gray-700 hover:text-orange-500 cursor-pointer"
              onClick={handleSubredditClick}
            >
              r/{subreddit}
            </span>
            <span className="mx-1">•</span>
            <span>u/{author}</span>
            <span className="mx-1">•</span>
            <span>{timeAgo}</span>
          </div>
          
          <h3 
            className="text-base font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer leading-tight"
            onClick={() => navigate(`/post/${id}`)}
          >
            {title}
          </h3>
        </div>

        {/* Contenuto con possibilità di espansione */}
        {content && (
          <div className="px-3 pb-2">
            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {displayContent}
              {shouldTruncateContent && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-orange-500 hover:text-orange-600 ml-2 font-medium"
                >
                  {showFullContent ? 'Mostra meno' : 'Leggi tutto'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Immagine */}
        {image_url && (
          <div className="px-3 pb-2">
            <img 
              src={image_url} 
              alt="Post content" 
              className="w-full max-h-80 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                console.error('Error loading image:', image_url);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Azioni */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('up')}
                disabled={!user || isVoting}
                className={`p-1 h-8 w-8 ${userVote === 'up' ? 'text-orange-500 bg-orange-50' : 'text-gray-400'}`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className={`text-sm font-bold ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-gray-600'}`}>
                {totalScore}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('down')}
                disabled={!user || isVoting}
                className={`p-1 h-8 w-8 ${userVote === 'down' ? 'text-blue-500 bg-blue-50' : 'text-gray-400'}`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="p-1 h-8" onClick={handleCommentClick}>
              <MessageSquare className="h-4 w-4" />
              <span className="ml-1 text-xs">{displayCommentCount}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-1 h-8" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-1 h-8 ${isPostCurrentlySaved ? 'text-orange-500' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              <Bookmark className={`h-4 w-4 ${isPostCurrentlySaved ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Layout desktop con miglioramenti per il contenuto
  return (
    <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Vote Section */}
        <div className="flex flex-col items-center p-2 bg-gray-50 min-w-[50px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('up')}
            disabled={!user || isVoting}
            className={`p-1 h-8 w-8 ${userVote === 'up' ? 'text-orange-500 bg-orange-50' : 'text-gray-400 hover:text-orange-500'}`}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className={`text-sm font-bold py-1 ${userVote === 'up' ? 'text-orange-500' : userVote === 'down' ? 'text-blue-500' : 'text-gray-600'}`}>
            {totalScore}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('down')}
            disabled={!user || isVoting}
            className={`p-1 h-8 w-8 ${userVote === 'down' ? 'text-blue-500 bg-blue-50' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span 
              className="font-semibold text-gray-700 hover:text-orange-500 cursor-pointer"
              onClick={handleSubredditClick}
            >
              r/{subreddit}
            </span>
            <span className="mx-2">•</span>
            <span>Postato da u/{author}</span>
            <span className="mx-2">•</span>
            <span>{timeAgo}</span>
          </div>
          
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
            onClick={() => navigate(`/post/${id}`)}
          >
            {title}
          </h3>
          
          {content && (
            <div className="text-gray-700 mb-3 whitespace-pre-wrap break-words">
              {displayContent}
              {shouldTruncateContent && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-orange-500 hover:text-orange-600 ml-2 font-medium"
                >
                  {showFullContent ? 'Mostra meno' : 'Leggi tutto'}
                </button>
              )}
            </div>
          )}

          {image_url && (
            <div className="mb-3">
              <img 
                src={image_url} 
                alt="Post content" 
                className="w-full max-h-[500px] object-contain rounded-lg border border-gray-200"
                onError={(e) => {
                  console.error('Error loading image:', image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex items-center space-x-4 text-gray-500">
            <Button variant="ghost" size="sm" className="hover:bg-gray-100" onClick={handleCommentClick}>
              <MessageSquare className="h-4 w-4 mr-1" />
              {displayCommentCount} Commenti
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-gray-100" onClick={handleShare}>
              <Share className="h-4 w-4 mr-1" />
              Condividi
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`hover:bg-gray-100 ${isPostCurrentlySaved ? 'text-orange-500' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${isPostCurrentlySaved ? 'fill-current' : ''}`} />
              {isPostCurrentlySaved ? 'Salvato' : 'Salva'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
