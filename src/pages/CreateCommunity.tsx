
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { CreateCommunity } from "@/components/CreateCommunity";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function CreateCommunityPage() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className={`${isMobile ? 'pb-20' : ''}`}>
          <CreateCommunity />
        </div>
      </div>
      
      {isMobile && <MobileNav />}
    </div>
  );
}
