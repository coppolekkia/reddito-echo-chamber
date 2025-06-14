
-- Add cover_image_url and logo_url columns to subreddits table
ALTER TABLE public.subreddits 
ADD COLUMN cover_image_url TEXT,
ADD COLUMN logo_url TEXT;
