
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, FileText, MessageSquare, TrendingUp, Calendar, Activity } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { it } from "date-fns/locale";

const chartConfig = {
  posts: {
    label: "Post",
    color: "hsl(var(--chart-1))",
  },
  comments: {
    label: "Commenti",
    color: "hsl(var(--chart-2))",
  },
  users: {
    label: "Utenti",
    color: "hsl(var(--chart-3))",
  },
  upvotes: {
    label: "Upvotes",
    color: "hsl(var(--chart-4))",
  },
  downvotes: {
    label: "Downvotes",
    color: "hsl(var(--chart-5))",
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AdminAdvancedStats = () => {
  // Statistiche generali
  const { data: generalStats, isLoading: generalLoading } = useQuery({
    queryKey: ['admin-advanced-stats'],
    queryFn: async () => {
      const [usersResult, postsResult, commentsResult, subredditsResult, votesResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('posts').select('id', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' }),
        supabase.from('subreddits').select('id', { count: 'exact' }),
        supabase.from('votes').select('vote_type', { count: 'exact' })
      ]);

      const { data: upvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('vote_type', 'up');

      const { data: downvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('vote_type', 'down');

      return {
        users: usersResult.count || 0,
        posts: postsResult.count || 0,
        comments: commentsResult.count || 0,
        subreddits: subredditsResult.count || 0,
        upvotes: upvotes?.length || 0,
        downvotes: downvotes?.length || 0,
        totalVotes: (upvotes?.length || 0) + (downvotes?.length || 0)
      };
    },
  });

  // Statistiche temporali (ultimi 7 giorni)
  const { data: timeStats, isLoading: timeLoading } = useQuery({
    queryKey: ['admin-time-stats'],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = startOfDay(subDays(new Date(), i));
        return date;
      }).reverse();

      const timeData = await Promise.all(
        last7Days.map(async (date) => {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);

          const [postsResult, commentsResult, usersResult] = await Promise.all([
            supabase
              .from('posts')
              .select('id', { count: 'exact' })
              .gte('created_at', date.toISOString())
              .lt('created_at', nextDay.toISOString()),
            supabase
              .from('comments')
              .select('id', { count: 'exact' })
              .gte('created_at', date.toISOString())
              .lt('created_at', nextDay.toISOString()),
            supabase
              .from('profiles')
              .select('id', { count: 'exact' })
              .gte('created_at', date.toISOString())
              .lt('created_at', nextDay.toISOString())
          ]);

          return {
            date: format(date, 'dd/MM', { locale: it }),
            posts: postsResult.count || 0,
            comments: commentsResult.count || 0,
            users: usersResult.count || 0,
          };
        })
      );

      return timeData;
    },
  });

  // Top subreddit per post
  const { data: topSubreddits, isLoading: subredditsLoading } = useQuery({
    queryKey: ['admin-top-subreddits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subreddits')
        .select(`
          id,
          name,
          posts (id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const subredditStats = data?.map(subreddit => ({
        name: subreddit.name,
        posts: subreddit.posts?.length || 0
      }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5) || [];

      return subredditStats;
    },
  });

  // Distribuzione dei voti
  const { data: voteDistribution, isLoading: votesLoading } = useQuery({
    queryKey: ['admin-vote-distribution'],
    queryFn: async () => {
      const { data: upvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('vote_type', 'up');

      const { data: downvotes } = await supabase
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('vote_type', 'down');

      return [
        { name: 'Upvotes', value: upvotes?.length || 0, color: '#00C49F' },
        { name: 'Downvotes', value: downvotes?.length || 0, color: '#FF8042' }
      ];
    },
  });

  if (generalLoading || timeLoading || subredditsLoading || votesLoading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metriche principali */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generalStats?.posts ? 
                ((generalStats.comments / generalStats.posts) * 100).toFixed(1) + '%' 
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Commenti per post
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapporto Voti</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generalStats?.totalVotes ? 
                ((generalStats.upvotes / generalStats.totalVotes) * 100).toFixed(1) + '%' 
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Voti positivi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Post/Utente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generalStats?.users ? 
                (generalStats.posts / generalStats.users).toFixed(1) 
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Post per utente registrato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Attive</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats?.subreddits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Subreddit creati
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafici */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Grafico temporale */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attività Ultimi 7 Giorni
            </CardTitle>
            <CardDescription>
              Trend di creazione contenuti e registrazioni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="posts" stroke={chartConfig.posts.color} strokeWidth={2} />
                  <Line type="monotone" dataKey="comments" stroke={chartConfig.comments.color} strokeWidth={2} />
                  <Line type="monotone" dataKey="users" stroke={chartConfig.users.color} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuzione voti */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribuzione Voti
            </CardTitle>
            <CardDescription>
              Rapporto tra voti positivi e negativi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={voteDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {voteDistribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Subreddit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Top Community per Post
          </CardTitle>
          <CardDescription>
            Le community più attive in termini di contenuti pubblicati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSubreddits} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="posts" fill={chartConfig.posts.color} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
