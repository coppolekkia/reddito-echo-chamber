
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PostFeed } from "@/components/PostFeed";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <PostFeed />
          <Sidebar />
        </div>
      </div>
    </div>
  );
};

export default Index;
