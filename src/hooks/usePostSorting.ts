
import { useState, useMemo } from 'react';
import { Post } from './usePosts';

export type SortType = 'hot' | 'new' | 'top' | 'rising';

export const usePostSorting = (posts: Post[] | undefined) => {
  const [sortType, setSortType] = useState<SortType>('hot');

  const sortedPosts = useMemo(() => {
    if (!posts) return [];

    const sortedArray = [...posts];

    switch (sortType) {
      case 'hot':
        // Hot: ordina per score (upvotes - downvotes) e recency
        return sortedArray.sort((a, b) => {
          const scoreA = a.upvotes - a.downvotes;
          const scoreB = b.upvotes - b.downvotes;
          
          if (scoreA === scoreB) {
            // Se stesso score, ordina per data (più recente prima)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          
          return scoreB - scoreA;
        });

      case 'new':
        // New: ordina per data di creazione (più recente prima)
        return sortedArray.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      case 'top':
        // Top: ordina per numero di upvotes
        return sortedArray.sort((a, b) => b.upvotes - a.upvotes);

      case 'rising':
        // Rising: ordina per trend (post recenti con buon score)
        return sortedArray.sort((a, b) => {
          const now = new Date().getTime();
          const hoursAgoA = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
          const hoursAgoB = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60);
          
          // Calcola un punteggio basato su upvotes e recency
          const trendScoreA = hoursAgoA < 24 ? (a.upvotes - a.downvotes) / Math.max(hoursAgoA, 1) : 0;
          const trendScoreB = hoursAgoB < 24 ? (b.upvotes - b.downvotes) / Math.max(hoursAgoB, 1) : 0;
          
          return trendScoreB - trendScoreA;
        });

      default:
        return sortedArray;
    }
  }, [posts, sortType]);

  return {
    sortType,
    setSortType,
    sortedPosts
  };
};
