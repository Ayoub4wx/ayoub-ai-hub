import type { Metadata } from 'next'
import PostDetailClient from '@/components/community/PostDetailClient'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: { id: string }
}

async function getPost(id: string) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      excerpt,
      meta_description,
      cover_image_url,
      cover_image_alt,
      created_at,
      updated_at,
      content,
      author:profiles!posts_author_id_fkey(username, display_name)
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  return post
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.id)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const description = post.meta_description || post.excerpt || post.title
  const authorName =
    (post.author as { display_name?: string | null; username?: string | null } | null)?.display_name ||
    (post.author as { display_name?: string | null; username?: string | null } | null)?.username ||
    'Ayoub AI Hub'

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      authors: [authorName],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url, alt: post.cover_image_alt || post.title }] : undefined,
    },
    twitter: {
      card: post.cover_image_url ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const post = await getPost(params.id)

  const jsonLd = post ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || post.title,
    datePublished: post.created_at,
    dateModified: post.updated_at,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    author: {
      '@type': 'Person',
      name:
        (post.author as { display_name?: string | null; username?: string | null } | null)?.display_name ||
        (post.author as { display_name?: string | null; username?: string | null } | null)?.username ||
        'Ayoub AI Hub',
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PostDetailClient id={params.id} />
    </>
  )
}
