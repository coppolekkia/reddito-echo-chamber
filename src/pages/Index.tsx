
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PostFeed } from "@/components/PostFeed";
import { MobileNav } from "@/components/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-6">
        <div className={`flex ${isMobile ? 'flex-col' : 'gap-6'}`}>
          <div className={`${isMobile ? 'order-1 pb-20' : ''} flex-1`}>
            <PostFeed />
          </div>
          {!isMobile && <Sidebar />}
        </div>
      </div>
      
      {isMobile && <MobileNav />}
    </div>
  );
};

export default Index;
