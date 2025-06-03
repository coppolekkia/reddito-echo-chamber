
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
        <div className={`flex ${isMobile ? 'flex-col' : 'gap-4 xl:gap-6'}`}>
          {/* Main content area - responsive width */}
          <div className={`${isMobile ? 'order-1 pb-20' : 'flex-1 min-w-0'} max-w-full`}>
            <PostFeed />
          </div>
          
          {/* Sidebar - responsive behavior */}
          {!isMobile && (
            <aside className="w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-20">
                <Sidebar />
              </div>
            </aside>
          )}
        </div>
      </div>
      
      {isMobile && <MobileNav />}
    </div>
  );
};

export default Index;
