
import { useBanners, Banner } from '@/hooks/useBanners';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, X } from 'lucide-react';
import { useState } from 'react';

interface BannerDisplayProps {
  position: 'top' | 'sidebar' | 'bottom' | 'inside-post' | 'popup';
}

export const BannerDisplay = ({ position }: BannerDisplayProps) => {
  const { banners, loading } = useBanners();

  if (loading) return null;

  const positionBanners = banners.filter(banner => banner.position === position);

  if (positionBanners.length === 0) return null;

  // Per i popup, mostro solo il primo banner con priorità più alta
  if (position === 'popup') {
    const topBanner = positionBanners.sort((a, b) => b.priority - a.priority)[0];
    return <PopupBanner banner={topBanner} />;
  }

  return (
    <div className={`space-y-4 ${position === 'sidebar' ? 'w-full' : ''}`}>
      {positionBanners.map((banner) => (
        <BannerCard key={banner.id} banner={banner} />
      ))}
    </div>
  );
};

const PopupBanner = ({ banner }: { banner: Banner }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClick = () => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const isHtmlContent = banner.content?.includes('<');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-w-lg w-full mx-4">
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-6">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-start space-x-4">
              {banner.image_url && (
                <img 
                  src={banner.image_url} 
                  alt={banner.title}
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">
                    {banner.title}
                  </h3>
                  {banner.link_url && (
                    <ExternalLink className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  )}
                </div>
                {banner.content && (
                  <div className="mt-2">
                    {isHtmlContent ? (
                      <div 
                        className="text-sm text-gray-600"
                        dangerouslySetInnerHTML={{ __html: banner.content }}
                      />
                    ) : (
                      <p className="text-sm text-gray-600">
                        {banner.content}
                      </p>
                    )}
                  </div>
                )}
                {banner.link_url && (
                  <button
                    onClick={handleClick}
                    className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Scopri di più
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const BannerCard = ({ banner }: { banner: Banner }) => {
  const handleClick = () => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const isHtmlContent = banner.content?.includes('<');

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
              <div className="mt-1">
                {isHtmlContent ? (
                  <div 
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: banner.content }}
                  />
                ) : (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {banner.content}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
