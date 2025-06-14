
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Header } from "@/components/Header";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminPostManagement } from "@/components/admin/AdminPostManagement";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminAdvancedStats } from "@/components/admin/AdminAdvancedStats";
import { AdminBannerManagement } from "@/components/admin/AdminBannerManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, FileText, BarChart3, Megaphone, TrendingUp } from "lucide-react";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-lg">Caricamento...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <Shield className="h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Accesso Negato</h2>
              <p className="text-gray-600">Non hai i permessi per accedere a questa pagina.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            Pannello Amministratore
          </h1>
          <p className="text-gray-600 mt-2">
            Gestisci utenti, contenuti e statistiche del sito
          </p>
        </div>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiche
            </TabsTrigger>
            <TabsTrigger value="advanced-stats" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avanzate
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utenti
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Post
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Banner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="advanced-stats">
            <AdminAdvancedStats />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="posts">
            <AdminPostManagement />
          </TabsContent>

          <TabsContent value="banners">
            <AdminBannerManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
