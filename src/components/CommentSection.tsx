
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, MessageSquare, Reply } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: {
    username: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export const CommentSection = ({ postId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles (username)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organizza i commenti in una struttura gerarchica
      const commentsMap = new Map();
      const topLevelComments: Comment[] = [];

      data.forEach(comment => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      data.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(commentsMap.get(comment.id));
          }
        } else {
          topLevelComments.push(commentsMap.get(comment.id));
        }
      });

      setComments(topLevelComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Errore nel caricamento dei commenti');
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          author_id: user.id,
          post_id: postId,
          parent_id: null
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast.success('Commento aggiunto!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Errore nell\'aggiungere il commento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: replyContent.trim(),
          author_id: user.id,
          post_id: postId,
          parent_id: parentId
        });

      if (error) throw error;

      setReplyContent('');
      setReplyingTo(null);
      await fetchComments();
      toast.success('Risposta aggiunta!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Errore nell\'aggiungere la risposta');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteComment = async (commentId: string, voteType: 'up' | 'down') => {
    if (!user) return;

    try {
      // Controlla se l'utente ha già votato
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Rimuovi il voto se è dello stesso tipo
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Aggiorna il voto se è di tipo diverso
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Crea un nuovo voto
        await supabase
          .from('votes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            vote_type: voteType,
          });
      }

      await fetchComments();
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const CommentComponent = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <Card className={`p-4 ${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <div className="flex items-start space-x-3">
        <div className="flex flex-col items-center space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVoteComment(comment.id, 'up')}
            disabled={!user}
            className="p-1 h-6 w-6"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium">
            {comment.upvotes - comment.downvotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVoteComment(comment.id, 'down')}
            disabled={!user}
            className="p-1 h-6 w-6"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span className="font-medium">u/{comment.profiles.username}</span>
            <span>•</span>
            <span>{new Date(comment.created_at).toLocaleString('it-IT')}</span>
          </div>
          
          <p className="text-gray-800 mb-2">{comment.content}</p>
          
          {user && !isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Reply className="h-3 w-3 mr-1" />
              Rispondi
            </Button>
          )}
          
          {replyingTo === comment.id && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Scrivi una risposta..."
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={loading || !replyContent.trim()}
                  size="sm"
                >
                  Rispondi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Annulla
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentComponent key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Commenti</h3>
      
      {user ? (
        <Card className="p-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Cosa ne pensi?"
            className="min-h-[100px] mb-3"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={loading || !newComment.trim()}
          >
            {loading ? 'Pubblicando...' : 'Commenta'}
          </Button>
        </Card>
      ) : (
        <Card className="p-4 text-center">
          <p className="text-gray-600">Accedi per lasciare un commento</p>
        </Card>
      )}
      
      <div>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">Nessun commento ancora.</p>
        )}
      </div>
    </div>
  );
};
