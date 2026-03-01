export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  is_deleted: boolean
  view_count: number
  created_at: string
  updated_at: string
  author?: Profile
  like_count?: number
  comment_count?: number
  user_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  author?: Profile
  like_count?: number
  user_liked?: boolean
  replies?: Comment[]
}

export interface Like {
  id: string
  user_id: string
  post_id: string | null
  comment_id: string | null
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}
