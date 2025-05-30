
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react";

export const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersResult, postsResult, commentsResult, subredditsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' }),
        supabase.from('subreddits').select('id', { count: 'exact' })
      ]);

      return {
        users: usersResult.count || 0,
        posts: postsResult.count || 0,
        comments: commentsResult.count || 0,
        subreddits: subredditsResult.count || 0
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Utenti Totali",
      value: stats?.users || 0,
      icon: Users,
      description: "Utenti registrati"
    },
    {
      title: "Post Totali", 
      value: stats?.posts || 0,
      icon: FileText,
      description: "Post pubblicati"
    },
    {
      title: "Commenti Totali",
      value: stats?.comments || 0,
      icon: MessageSquare,
      description: "Commenti scritti"
    },
    {
      title: "Subreddit",
      value: stats?.subreddits || 0,
      icon: TrendingUp,
      description: "Community create"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
