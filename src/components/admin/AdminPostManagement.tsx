
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostWithDetails {
  id: string;
  title: string;
  content: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  profiles: { username: string };
  subreddits: { name: string };
}

export const AdminPostManagement = () => {
  const [deletingPost, setDeletingPost] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          upvotes,
          downvotes,
          created_at,
          profiles (username),
          subreddits (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PostWithDetails[];
    },
  });

  const deletePost = async (postId: string) => {
    setDeletingPost(postId);
    try {
      // First delete all votes for this post
      await supabase
        .from('votes')
        .delete()
        .eq('post_id', postId);

      // Then delete all comments for this post
      await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId);

      // Finally delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post eliminato",
        description: "Il post è stato eliminato con successo",
      });

      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il post",
        variant: "destructive",
      });
    } finally {
      setDeletingPost(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestione Post</CardTitle>
          <CardDescription>Gestisci i post pubblicati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Post</CardTitle>
        <CardDescription>
          Gestisci i post pubblicati ({posts?.length || 0} post mostrati)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Autore</TableHead>
              <TableHead>Subreddit</TableHead>
              <TableHead>Voti</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate" title={post.title}>
                    {post.title}
                  </div>
                </TableCell>
                <TableCell>
                  {post.profiles?.username || 'Utente eliminato'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    r/{post.subreddits?.name || 'Subreddit eliminato'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      {post.upvotes}
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      {post.downvotes}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(post.created_at).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/post/${post.id}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      disabled={deletingPost === post.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
