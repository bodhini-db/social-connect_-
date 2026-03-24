import { z } from 'zod'

// Username validation: 3-30 chars, alphanumeric + underscore
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

// Password validation: min 8 chars
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

// Bio validation: max 160 chars
export const bioSchema = z
  .string()
  .max(160, 'Bio must be at most 160 characters')
  .optional()
  .nullable()

// Post content validation: max 280 chars
export const postContentSchema = z
  .string()
  .min(1, 'Post content is required')
  .max(280, 'Post must be at most 280 characters')

// Comment content validation: max 280 chars
export const commentContentSchema = z
  .string()
  .min(1, 'Comment content is required')
  .max(280, 'Comment must be at most 280 characters')

// Registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: usernameSchema,
  password: passwordSchema,
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
})

// Login schema
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

// Profile update schema
export const profileUpdateSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  bio: bioSchema,
  avatar_url: z.string().url().optional().nullable(),
  website: z.string().url('Invalid URL').optional().nullable().or(z.literal('')),
  location: z.string().max(100, 'Location must be at most 100 characters').optional().nullable(),
})

// Post creation schema
export const createPostSchema = z.object({
  content: postContentSchema,
  image_url: z.string().url().optional().nullable(),
})

// Post update schema
export const updatePostSchema = z.object({
  content: postContentSchema,
})

// Comment creation schema
export const createCommentSchema = z.object({
  content: commentContentSchema,
})

// Image validation
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB

export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG and PNG images are allowed' }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image must be less than 2MB' }
  }
  return { valid: true }
}

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
