
import { Header } from "@/components/Header";
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
      <div className={`max-w-4xl mx-auto ${isMobile ? 'px-3 pt-1' : 'px-2 sm:px-4 lg:px-8 pt-2'}`}>
        <BannerDisplay position="top" />
      </div>
      
      <div className={`max-w-4xl mx-auto ${isMobile ? 'px-3 py-2 pb-20' : 'px-2 sm:px-4 lg:px-8 py-2 sm:py-6'}`}>
        <PostFeed />
        
        {/* Banner Bottom */}
        <div className={`${isMobile ? 'mt-4' : 'mt-6'}`}>
          <BannerDisplay position="bottom" />
        </div>
      </div>
      
      {isMobile && <MobileNav />}
    </div>
  );
};

export default Index;
