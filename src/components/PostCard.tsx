
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/usePosts';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  image_url?: string;
}

export const PostCard = ({ 
  id, 
  title, 
  content, 
  author, 
  subreddit, 
  upvotes, 
  downvotes, 
  comments, 
  timeAgo,
  image_url 
}: PostCardProps) => {
  const { user } = useAuth();
  const { vote } = useVote();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const netVotes = upvotes - downvotes;
  
  // Check if content is too long for mobile
  const isContentLong = content && content.length > (isMobile ? 150 : 200);
  const shouldTruncate = isContentLong && !isExpanded;
  
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) return;
    await vote(id, voteType, user.id);
  };

  const displayContent = shouldTruncate 
    ? content.substring(0, isMobile ? 150 : 200) + '...'
    : content;

  return (
    <Card className={`${isMobile ? 'mb-2' : 'mb-4'} overflow-hidden`}>
      <div className="flex">
        {/* Vote buttons - Ottimizzati per mobile */}
        <div className={`flex flex-col items-center bg-gray-50 ${isMobile ? 'p-1.5 min-w-[50px]' : 'p-2 min-w-[60px]'}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('up')}
            className={`p-1 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-gray-600 hover:text-orange-500 hover:bg-orange-50`}
            disabled={!user}
          >
            <ChevronUp className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium ${netVotes > 0 ? 'text-orange-500' : netVotes < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            {netVotes}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVote('down')}
            className={`p-1 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-gray-600 hover:text-blue-500 hover:bg-blue-50`}
            disabled={!user}
          >
            <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </Button>
        </div>

        {/* Content - Ottimizzato per mobile */}
        <div className={`flex-1 ${isMobile ? 'p-3' : 'p-4'}`}>
          {/* Header */}
          <div className={`flex items-center text-gray-500 mb-2 ${isMobile ? 'text-xs flex-wrap' : 'text-sm'}`}>
            <Link 
              to={`/r/${subreddit}`} 
              className="hover:underline font-medium"
            >
              r/{subreddit}
            </Link>
            <span className="mx-1">•</span>
            <span className={`${isMobile ? 'truncate' : ''}`}>u/{author}</span>
            <span className="mx-1">•</span>
            <span className={`${isMobile ? 'text-xs' : ''}`}>
              {isMobile ? 
                new Date(timeAgo).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }) :
                timeAgo
              }
            </span>
          </div>

          {/* Title */}
          <Link to={`/post/${id}`}>
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 hover:text-blue-600 mb-2 line-clamp-2`}>
              {title}
            </h2>
          </Link>

          {/* Content with rich text support */}
          {content && (
            <div className={`text-gray-700 ${isMobile ? 'mb-2' : 'mb-3'}`}>
              <div 
                className={`prose max-w-none ${isMobile ? 'prose-xs' : 'prose-sm'}`}
                dangerouslySetInnerHTML={{ 
                  __html: displayContent 
                }}
              />
              {shouldTruncate && (
                <Button
                  variant="link"
                  onClick={() => setIsExpanded(true)}
                  className={`text-blue-600 hover:text-blue-800 p-0 h-auto mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}
                >
                  Leggi di più
                </Button>
              )}
              {isExpanded && isContentLong && (
                <Button
                  variant="link"
                  onClick={() => setIsExpanded(false)}
                  className={`text-blue-600 hover:text-blue-800 p-0 h-auto mt-2 ml-2 ${isMobile ? 'text-xs' : 'text-sm'}`}
                >
                  Mostra meno
                </Button>
              )}
            </div>
          )}

          {/* Image */}
          {image_url && (
            <div className={`${isMobile ? 'mb-2' : 'mb-3'}`}>
              <img 
                src={image_url} 
                alt="" 
                className="max-w-full h-auto rounded-lg"
                loading="lazy"
              />
            </div>
          )}

          {/* Actions - Ottimizzate per mobile */}
          <div className={`flex items-center text-gray-500 ${isMobile ? 'space-x-2 text-xs' : 'space-x-4 text-sm'}`}>
            <Link to={`/post/${id}`}>
              <Button variant="ghost" size="sm" className={`${isMobile ? 'h-6 px-1' : 'h-8 px-2'}`}>
                <MessageCircle className={`${isMobile ? 'h-3 w-3 mr-0.5' : 'h-4 w-4 mr-1'}`} />
                <span className={`${isMobile ? 'hidden' : ''}`}>{comments} commenti</span>
                {isMobile && <span>{comments}</span>}
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className={`${isMobile ? 'h-6 px-1' : 'h-8 px-2'}`}>
              <Share className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4 mr-1'}`} />
              {!isMobile && <span>Condividi</span>}
            </Button>
            <Button variant="ghost" size="sm" className={`${isMobile ? 'h-6 px-1' : 'h-8 px-2'}`}>
              <Bookmark className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4 mr-1'}`} />
              {!isMobile && <span>Salva</span>}
            </Button>
            <Button variant="ghost" size="sm" className={`${isMobile ? 'h-6 px-1' : 'h-8 px-2'}`}>
              <MoreHorizontal className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
