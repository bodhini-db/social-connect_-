# SocialConnect (social-connect_-)

SocialConnect is a full-stack social media web app built with Next.js + TypeScript, Supabase, Tailwind CSS, and shadcn/ui. It meets the provided assignment rubric for Authentication, Profile management, Posts (text + image), Likes, Comments, Follow, and feed.

## 1. Features summary

- Authentication
  - Register (email, username, password, first_name, last_name)
  - Login (email or username + password)
  - Logout
  - JWT-based session from Supabase
- User profiles
  - Full profile CRUD (current user, other user view)
  - `bio`, `avatar_url`, `website`, `location`, `posts_count`, followers/following
- Posts
  - Create / read / update / delete own posts
  - Text content (max 280 chars)
  - Optional image using Supabase Storage (jpeg/png, max 2MB)
  - Denormalized `like_count`, `comment_count`
- Social interactions
  - Like/unlike posts
  - Add/list/delete comments
  - Follow/unfollow users
  - Personalized feed with followed user priority
- UI + UX
  - Feed, profile, discover user list, post detail, mobile menu, dark mode toggle, share button
  - Profile image crop preview as 1:1 square
  - settings page with extra options

## 2. Tech stack

- Next.js (App Router) v16
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + auth + storage)
- Zod validation
- Sonner for toast notifications
- Lucide icons

## 3. Architecture

### App routes (pages)
- `app/page.tsx`: landing
- `app/(auth)/login/page.tsx` and `register/page.tsx`
- `app/(app)/feed/page.tsx`
- `app/(app)/posts/[post_id]/page.tsx`
- `app/(app)/profile/[username]/page.tsx`
- `app/(app)/profile/edit/page.tsx`
- `app/(app)/users/page.tsx` (discover)
- `app/(app)/settings/page.tsx` (new settings area)

### API routes
- `/api/auth/register` (POST)
- `/api/auth/login` (POST)
- `/api/auth/logout` (POST)
- `/api/users/me` (GET, PUT, PATCH)
- `/api/users/{user_id}` (GET)
- `/api/users` (GET)
- `/api/users/{user_id}/follow` (POST, DELETE)
- `/api/users/{user_id}/followers` (GET)
- `/api/users/{user_id}/following` (GET)
- `/api/posts` (GET, POST)
- `/api/posts/{post_id}` (GET, PUT, PATCH, DELETE)
- `/api/posts/{post_id}/like` (POST, DELETE)
- `/api/posts/{post_id}/comments` (GET, POST)
- `/api/posts/{post_id}/comments/{comment_id}` (DELETE)
- `/api/feed` (GET)
- `/api/upload` (POST)

### Core modules
- `lib/auth.ts`: server auth helpers (`getCurrentUser`, `requireAuth`, `getCurrentUserId`)
- `lib/db/users.ts`: profile queries, follow/unfollow, username checks
- `lib/db/posts.ts`: post CRUD, feed queries
- `lib/db/likes.ts`: like/unlike + count update
- `lib/db/comments.ts`: comment CRUD + count update
- `lib/db/follows.ts`: follower/following helpers
- `lib/supabase/client.ts`: browser Supabase client
- `lib/supabase/server.ts`: server + admin supabase client
- `lib/validation.ts`: zod schemas (register, login, profile, posts, comments)

## 4. API details

### Authentication
#### POST /api/auth/register
- body: `{ email, username, password, first_name, last_name }`
- validation: `registerSchema`
- logic: username uniqueness check -> `supabase.auth.signUp` with metadata
- returns: `user` profile + `access_token`

#### POST /api/auth/login
- body: `{ identifier, password }`
- `identifier` can be email or username
- user path: if username, query `profiles` to get ID and admin get user email
- supabase sign in with email + password
- update `profiles.last_login`
- returns profile and `access_token`

#### POST /api/auth/logout
- uses auth client signOut

### Users
#### GET /api/users
- list users (discover), includes profile summary

#### GET /api/users/{user_id}
- individual profile read

#### GET /api/users/me
- current logged-in user data

#### PUT/PATCH /api/users/me
- update current user profile fields
- validation: `profileUpdateSchema` (bio, avatar_url, website, location, etc.)

### Posts
#### GET /api/posts
- list with pagination via `page`/`limit`
- includes `is_liked_by_me` computed by current user

#### POST /api/posts
- create post with text + optional `image_url`
- validation: `createPostSchema`

#### GET /api/posts/{post_id}
- specific post

#### PUT/PATCH /api/posts/{post_id}
- update own post only
- authorization check on `author_id`

#### DELETE /api/posts/{post_id}
- delete own post only

### Like + comments
#### POST /api/posts/{post_id}/like
- like post; unique check; increments count

#### DELETE /api/posts/{post_id}/like
- unlike; decrements count

#### GET /api/posts/{post_id}/comments
- list comments with pagination

#### POST /api/posts/{post_id}/comments
- create comment; updates `comment_count`

#### DELETE /api/posts/{post_id}/comments/{comment_id}
- delete own comment; updates count

### Feed
#### GET /api/feed
- returns active posts
- queries follow list and sorts followed-first + newest

### Follow system
#### POST /api/users/{user_id}/follow
#### DELETE /api/users/{user_id}/follow
#### GET /api/users/{user_id}/followers
#### GET /api/users/{user_id}/following

## 5. UI features and components

### Navbar
- `components/Navbar.tsx` (desktop + mobile sheet)
- mobile sheet opens right side, auto-close on nav click
- includes links to feed, discover, profile, settings

### Auth pages
- `app/(auth)/login/page.tsx` uses `useSearchParams` + suspense guard
- `app/(auth)/register/page.tsx`

### Profile
- `components/ProfileHeader.tsx` with avatar, meta, follow button, join date
- `/profile/[username]`, `/profile/edit` pages
- `components/EditProfileForm.tsx` with validation and website normalization

### Posts
- `components/PostCard.tsx` with like/comment/share, owner delete options
- `components/PostComposer.tsx` for new post creation

### Image upload
- `components/ImageUpload.tsx` with drag and drop, preview, upload to `/api/upload`
- enforce JPEG/PNG, max 2MB
- square preview `aspect-square`, preserving 1:1 appearance

### Settings
- `app/(app)/settings/page.tsx` with `EditProfileForm` + `SettingsPanel`
- includes toggles (email notifications, dark mode mock)
- separate from profile edit; information architecture request satisfied

## 6. Database / schema notes

- `scripts/001_create_tables.sql` and `002_create_triggers.sql` create:
  - `profiles`, `posts`, `likes`, `comments`, `follows`
  - denormalized `posts_count`, `followers_count`, `following_count`, `like_count`, `comment_count`
  - `is_active` flag on posts
  - triggers for update counters and data integrity

## 7. Implementation notes

- `normalizeWebsite()` in `EditProfileForm` ensures raw host -> https://host (e.g., `example.com` -> `https://example.com`)
- `PostCard` share button uses Web Share API + clipboard fallback via `navigator.clipboard.writeText`.
- mobile menu state is controlled in `Navbar` and closes on link click, `Sheet` component uses `open`/`onOpenChange`.

## 8. Local development

```bash
pnpm install
pnpm dev
# or npm/yarn equivalent
```

- env variables via `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`

### Build test

```bash
pnpm run build
```

## 9. Validation checklist (assignment map)

| Feature | Status | Notes |
|---|---|---|
| Register/Login/Logout | ✅ | auth routes with Supabase | 
| Profile editing | ✅ | `PUT /api/users/me`, profile page | 
| Create/delete posts | ✅ | posts routes |  
| Like/comment | ✅ | like/comment routes + UI |  
| Public feed | ✅ | `/api/feed` and feed page |  
| Follow/unfollow | ✅ (optional) | follow endpoints + UI |  
| Supabase Storage uploads | ✅ | `upload` api + image component |  
| URL validation + avatar 1:1 | ✅ | `validation.ts` + `ImageUpload` |  

## 10. Notes for deployment

- Vercel deploy available 

---

