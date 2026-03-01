import { TikTokPost, InstagramPost } from '@/types/social'
import { TIKTOK_VIDEO_URLS, INSTAGRAM_POSTS } from '@/constants/social-videos'

// Fallback image URLs if oEmbed fails or for mock data
const FALLBACK_THUMBNAILS = [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600&h=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&h=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&h=800&auto=format&fit=crop',
]

interface OEmbedResponse {
    title: string
    author_name: string
    thumbnail_url: string
}

async function fetchTikTokThumbnail(url: string): Promise<TikTokPost | null> {
    try {
        const res = await fetch(
            `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
            { next: { revalidate: 3600 } }
        )
        if (!res.ok) return null
        const data: OEmbedResponse = await res.json()
        return {
            url,
            thumbnail: data.thumbnail_url,
            title: data.title,
            authorName: data.author_name,
        }
    } catch (error) {
        console.warn('TikTok oEmbed error for', url)
        return null
    }
}

export async function fetchTikTokVideos(): Promise<TikTokPost[]> {
    try {
        const results = await Promise.all(TIKTOK_VIDEO_URLS.map(fetchTikTokThumbnail))
        const videos = results.filter((v): v is TikTokPost => v !== null && Boolean(v.thumbnail))

        // If no videos could be fetched, return mock data
        if (videos.length === 0) {
            return TIKTOK_VIDEO_URLS.map((url, i) => ({
                url,
                thumbnail: FALLBACK_THUMBNAILS[i % FALLBACK_THUMBNAILS.length],
                title: 'Watch Ayoub on TikTok',
                authorName: 'ayoub.env'
            }))
        }

        return videos
    } catch {
        return []
    }
}

// Same pattern as TikTok: try Instagram oEmbed, return null on failure.
async function fetchInstagramThumbnail(post: typeof INSTAGRAM_POSTS[0]): Promise<InstagramPost | null> {
    try {
        const res = await fetch(
            `https://api.instagram.com/oembed/?url=${encodeURIComponent(post.url)}`,
            { next: { revalidate: 3600 } }
        )
        if (!res.ok) return null
        const data: OEmbedResponse = await res.json()
        return {
            url: post.url,
            thumbnail: data.thumbnail_url,
            title: data.title || post.title,
            authorName: data.author_name,
        }
    } catch {
        console.warn('Instagram oEmbed error for', post.url)
        return null
    }
}

export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
    const results = await Promise.all(INSTAGRAM_POSTS.map(fetchInstagramThumbnail))
    const posts = results.filter((p): p is InstagramPost => p !== null && Boolean(p.thumbnail))

    // If oEmbed failed for all, return static fallback data
    if (posts.length === 0) {
        return INSTAGRAM_POSTS.map((post, i) => ({
            ...post,
            thumbnail: post.thumbnail || FALLBACK_THUMBNAILS[i % FALLBACK_THUMBNAILS.length],
        }))
    }

    return posts
}
