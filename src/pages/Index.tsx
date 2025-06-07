
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PostFeed } from "@/components/PostFeed";
import { MobileNav } from "@/components/MobileNav";
import { BannerDisplay } from "@/components/BannerDisplay";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Banner Top */}
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 pt-1' : 'px-2 sm:px-4 lg:px-8 pt-2'}`}>
        <BannerDisplay position="top" />
      </div>
      
      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-2' : 'px-2 sm:px-4 lg:px-8 py-2 sm:py-6'}`}>
        <div className={`flex ${isMobile ? 'flex-col' : 'gap-4 xl:gap-6'}`}>
          {/* Main content area - responsive width */}
          <div className={`${isMobile ? 'order-1 pb-20' : 'flex-1 min-w-0'} max-w-full`}>
            <PostFeed />
            
            {/* Banner Bottom - solo su mobile */}
            {isMobile && (
              <div className="mt-4">
                <BannerDisplay position="bottom" />
              </div>
            )}
          </div>
          
          {/* Sidebar - responsive behavior */}
          {!isMobile && (
            <aside className="w-80 xl:w-96 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                <Sidebar />
                <BannerDisplay position="sidebar" />
              </div>
              
              {/* Banner Bottom - solo su desktop */}
              <div className="mt-6">
                <BannerDisplay position="bottom" />
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
