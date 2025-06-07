import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/usePosts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Bookmark, MessageSquare, TrendingUp } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { savedPosts } = useSavedPosts();
  const { data: posts } = usePosts();
  const isMobile = useIsMobile();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Accesso richiesto</h1>
            <p className="text-gray-600 mb-4">Devi essere loggato per vedere il tuo profilo.</p>
            <Button onClick={() => window.location.href = '/auth'}>
              Accedi
            </Button>
          </Card>
        </div>
        {isMobile && <MobileNav />}
      </div>
    );
  }

  const userSavedPosts = posts?.filter(post => savedPosts.includes(post.id)) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className={`max-w-4xl mx-auto px-4 py-8 ${isMobile ? 'pb-20' : ''}`}>
        {/* Profilo utente */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.email}</h1>
              <p className="text-gray-600">Membro della community</p>
            </div>
            <Button variant="outline" onClick={signOut}>
              Logout
            </Button>
          </div>
        </Card>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{savedPosts.length}</p>
                <p className="text-sm text-gray-600">Post salvati</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Commenti</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Post creati</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Post salvati */}
        <div>
          <h2 className="text-xl font-bold mb-4">Post Salvati</h2>
          {userSavedPosts.length > 0 ? (
            <div className="space-y-4">
              {userSavedPosts.map((post) => (
                <PostCard 
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  content={post.content || ''}
                  author={post.profiles.username}
                  subreddit={post.subreddits.name}
                  upvotes={post.upvotes}
                  downvotes={post.downvotes}
                  comments={0}
                  timeAgo={new Date(post.created_at).toLocaleString('it-IT')}
                  image_url={post.image_url || undefined}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun post salvato</h3>
              <p className="text-gray-600">I post che salvi appariranno qui.</p>
            </Card>
          )}
        </div>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}
