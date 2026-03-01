/**
 * Your YouTube video IDs (used as fallback when no API key is set).
 * Format: the part after ?v= in the YouTube URL.
 * Thumbnails are fetched directly from img.youtube.com — no API key needed.
 */
export const YOUTUBE_VIDEO_IDS: string[] = [
  'UtezK-0CQaw',
]

/**
 * Paste your TikTok video URLs here.
 * Format: https://www.tiktok.com/@ayoub.env/video/VIDEO_ID
 *
 * To find your video ID:
 *  1. Open any of your TikTok videos in a browser
 *  2. Copy the full URL from the address bar
 *  3. Paste it below (up to 6 videos recommended)
 *
 * Thumbnails will be fetched automatically via TikTok's oEmbed API (no API key needed).
 */
export const TIKTOK_VIDEO_URLS: string[] = [
  'https://www.tiktok.com/@ayoub.env/video/7605783612432207125',
  'https://www.tiktok.com/@ayoub.env/video/7603006549891665172',
  'https://www.tiktok.com/@ayoub.env/video/7602633343347313940',
]

/**
 * Curated Instagram Posts.
 * Since Instagram's API requires complex auth for thumbnails, 
 * we provide the URLs and high-quality placeholder images.
 */
export const INSTAGRAM_POSTS = [
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DUpm-7oDDnL/',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'AI Future Insights 🚀',
    authorName: 'ayoub.env'
  },
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DVHB-56Afak/',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'Modern Tech Stacks 💻',
    authorName: 'ayoub.env'
  },
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DUVi0tfjP6m/',
    thumbnail: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'Developer Lifestyle ☕',
    authorName: 'ayoub.env'
  },
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DUTg31jjLZQ/',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'Cybersecurity & AI 🛡️',
    authorName: 'ayoub.env'
  },
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DUSxeUbDMuK/',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'Hardware & Chips 🔌',
    authorName: 'ayoub.env'
  },
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DVPlzEajLOt/',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'Robotics Revolution 🤖',
    authorName: 'ayoub.env'
  },
  {
    url: 'https://www.instagram.com/ayoub.env/reel/DVRZSM5DDcw/',
    thumbnail: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=600&h=800&auto=format&fit=crop',
    title: 'Latest Drop ✨',
    authorName: 'ayoub.env'
  }
]
