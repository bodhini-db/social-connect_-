// User and Profile Types
export interface Profile {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  location: string | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  location?: string;
}

// Post Types
export interface Post {
  id: string;
  content: string;
  author_id: string;
  image_url: string | null;
  is_active: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: Profile;
  is_liked_by_me?: boolean;
}

export interface CreatePostInput {
  content: string;
  image_url?: string;
}

export interface UpdatePostInput {
  content: string;
}

// Comment Types
export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
}

export interface CreateCommentInput {
  content: string;
}

// Like Types
export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// Follow Types
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface FollowWithProfile extends Follow {
  follower?: Profile;
  following?: Profile;
}

// Auth Types
export interface RegisterInput {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginInput {
  identifier: string; // email or username
  password: string;
}

export interface AuthResponse {
  user: Profile;
  access_token: string;
}

// API Response Types
export interface ApiError {
  error: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Feed Types
export interface FeedPost extends PostWithAuthor {
  is_from_following: boolean;
}
