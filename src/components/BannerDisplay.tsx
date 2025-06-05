
import { useBanners, Banner } from '@/hooks/useBanners';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface BannerDisplayProps {
  position: 'top' | 'sidebar' | 'bottom';
}

export const BannerDisplay = ({ position }: BannerDisplayProps) => {
  const { banners, loading } = useBanners();

  if (loading) return null;

  const positionBanners = banners.filter(banner => banner.position === position);

  if (positionBanners.length === 0) return null;

  return (
    <div className={`space-y-4 ${position === 'sidebar' ? 'w-full' : ''}`}>
      {positionBanners.map((banner) => (
        <BannerCard key={banner.id} banner={banner} />
      ))}
    </div>
  );
};

const BannerCard = ({ banner }: { banner: Banner }) => {
  const handleClick = () => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className={`${banner.link_url ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50`}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          {banner.image_url && (
            <img 
              src={banner.image_url} 
              alt={banner.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {banner.title}
              </h3>
              {banner.link_url && (
                <ExternalLink className="h-4 w-4 text-orange-500 flex-shrink-0" />
              )}
            </div>
            {banner.content && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {banner.content}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
