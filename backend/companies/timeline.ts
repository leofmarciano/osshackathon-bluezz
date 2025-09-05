import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { Bucket } from "encore.dev/storage/objects";
import log from "encore.dev/log";
import { clerkClient } from "../auth/auth";

// Initialize database
const db = new SQLDatabase("companies", {
  migrations: "./migrations",
});

// Create bucket for post images
export const postImages = new Bucket("post-images", {
  public: true,
  versioned: false
});

// Types
interface Post {
  id: number;
  company_id: number;
  author_id: string;
  author_name: string;
  author_avatar?: string | null;
  content: string;
  image_url?: string | null;
  created_at: Date;
  updated_at: Date;
  likes_count?: number;
  comments_count?: number;
  has_liked?: boolean;
}

interface PostLike {
  id: number;
  post_id: number;
  user_id: string;
  created_at: Date;
}

interface PostComment {
  id: number;
  post_id: number;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  content: string;
  created_at: Date;
}

// Request/Response types
interface CreatePostRequest {
  company_id: number;
  content: string;
  image_url?: string; // Already uploaded image URL
}

interface CreatePostResponse {
  post: Post;
}

interface GetPostsRequest {
  company_id: number;
  limit?: number;
  offset?: number;
}

interface GetPostsResponse {
  posts: Post[];
  total: number;
}

interface LikePostRequest {
  post_id: number;
}

interface LikePostResponse {
  success: boolean;
  likes_count: number;
}

interface AddCommentRequest {
  post_id: number;
  content: string;
}

interface AddCommentResponse {
  comment: PostComment;
}

interface GetCommentsRequest {
  post_id: number;
  limit?: number;
  offset?: number;
}

interface GetCommentsResponse {
  comments: PostComment[];
  total: number;
}

interface UploadImageRequest {
  filename: string;
  data: string; // base64 encoded
  contentType: string;
}

interface UploadImageResponse {
  url: string;
}

// Helper function to check if user is company owner
async function isCompanyOwner(companyId: number, userId: string): Promise<boolean> {
  const company = await db.queryRow<{ owner_id: string }>`
    SELECT owner_id FROM companies WHERE id = ${companyId}
  `;
  return company?.owner_id === userId;
}

// Helper function to sanitize content
function sanitizeContent(content: string): string {
  const originalContent = content;
  
  // Remove any potential script tags or dangerous HTML
  // Allow only basic markdown characters
  const sanitized = content
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  // Check if content was modified (potentially dangerous content detected)
  if (originalContent !== sanitized && 
      (originalContent.includes('<script') || 
       originalContent.includes('javascript:') || 
       /on\w+\s*=/gi.test(originalContent))) {
    throw APIError.invalidArgument("Content contains potentially dangerous scripts or HTML. Please use plain text or markdown.");
  }
  
  return sanitized;
}

// Helper function to validate content length
function validateContentLength(content: string, maxLength: number = 10000): void {
  if (!content || content.trim().length === 0) {
    throw APIError.invalidArgument("Content cannot be empty");
  }
  if (content.length > maxLength) {
    throw APIError.invalidArgument(`Content exceeds maximum length of ${maxLength} characters`);
  }
}

// API: Create a new post (only company owner)
export const createPost = api(
  { expose: true, auth: true, method: "POST", path: "/companies/:company_id/posts" },
  async (req: CreatePostRequest): Promise<CreatePostResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Validate and sanitize content
      validateContentLength(req.content, 5000);
      const sanitizedContent = sanitizeContent(req.content);

      // Validate company_id
      if (!req.company_id || req.company_id < 1) {
        throw APIError.invalidArgument("Invalid company ID");
      }

      // Check if user is the company owner
      const isOwner = await isCompanyOwner(req.company_id, authData.userID);
      if (!isOwner) {
        throw APIError.permissionDenied("Only company owners can create posts");
      }

      // Get user info from Clerk
      const user = await clerkClient.users.getUser(authData.userID);
      const authorName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username || "Unknown";
      const authorAvatar = user.imageUrl;

      // Validate image URL if provided
      if (req.image_url) {
        // Ensure it's from our bucket or a trusted source
        if (!req.image_url.startsWith('https://')) {
          throw APIError.invalidArgument("Invalid image URL");
        }
      }

      // Create the post with sanitized content
      const post = await db.queryRow<Post>`
        INSERT INTO company_posts (
          company_id, author_id, author_name, author_avatar, content, image_url
        ) VALUES (
          ${req.company_id}, ${authData.userID}, ${authorName}, ${authorAvatar}, 
          ${sanitizedContent}, ${req.image_url}
        )
        RETURNING *
      `;

      if (!post) {
        throw APIError.internal("Failed to create post");
      }

      return { post };
    } catch (error) {
      log.error("Failed to create post", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to create post");
    }
  }
);

// API: Get posts for a company
export const getPosts = api(
  { expose: true, method: "GET", path: "/companies/:company_id/posts" },
  async (req: GetPostsRequest): Promise<GetPostsResponse> => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;
    
    // Get auth data if available
    const authData = getAuthData();
    const userId = authData?.userID;

    try {
      // Get posts with counts and user's like status
      let postsQuery;
      if (userId) {
        postsQuery = db.query<Post>`
          SELECT 
            p.*,
            (SELECT COUNT(*)::int FROM post_likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*)::int FROM post_comments WHERE post_id = p.id) as comments_count,
            EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ${userId}) as has_liked
          FROM company_posts p
          WHERE p.company_id = ${req.company_id}
          ORDER BY p.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        postsQuery = db.query<Post>`
          SELECT 
            p.*,
            (SELECT COUNT(*)::int FROM post_likes WHERE post_id = p.id) as likes_count,
            (SELECT COUNT(*)::int FROM post_comments WHERE post_id = p.id) as comments_count,
            false as has_liked
          FROM company_posts p
          WHERE p.company_id = ${req.company_id}
          ORDER BY p.created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      }
      
      const posts = await postsQuery;

      const postsArray: Post[] = [];
      for await (const post of posts) {
        postsArray.push(post);
      }

      // Get total count
      const countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count FROM company_posts WHERE company_id = ${req.company_id}
      `;

      return {
        posts: postsArray,
        total: countResult?.count || 0
      };
    } catch (error) {
      log.error("Failed to get posts", error as Error);
      throw APIError.internal("Failed to get posts");
    }
  }
);

// API: Like/unlike a post
export const likePost = api(
  { expose: true, auth: true, method: "POST", path: "/posts/:post_id/like" },
  async (req: LikePostRequest): Promise<LikePostResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Check if post exists
      const post = await db.queryRow<{ id: number }>`
        SELECT id FROM company_posts WHERE id = ${req.post_id}
      `;
      
      if (!post) {
        throw APIError.notFound("Post not found");
      }

      // Check if user already liked
      const existingLike = await db.queryRow<{ id: number }>`
        SELECT id FROM post_likes WHERE post_id = ${req.post_id} AND user_id = ${authData.userID}
      `;

      if (existingLike) {
        // Unlike
        await db.exec`
          DELETE FROM post_likes WHERE post_id = ${req.post_id} AND user_id = ${authData.userID}
        `;
      } else {
        // Like
        await db.exec`
          INSERT INTO post_likes (post_id, user_id) VALUES (${req.post_id}, ${authData.userID})
        `;
      }

      // Get updated like count
      const countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count FROM post_likes WHERE post_id = ${req.post_id}
      `;

      return {
        success: true,
        likes_count: countResult?.count || 0
      };
    } catch (error) {
      log.error("Failed to like/unlike post", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to like/unlike post");
    }
  }
);

// API: Add a comment to a post
export const addComment = api(
  { expose: true, auth: true, method: "POST", path: "/posts/:post_id/comments" },
  async (req: AddCommentRequest): Promise<AddCommentResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Validate and sanitize comment content
      validateContentLength(req.content, 1000);
      const sanitizedContent = sanitizeContent(req.content);

      // Validate post_id
      if (!req.post_id || req.post_id < 1) {
        throw APIError.invalidArgument("Invalid post ID");
      }

      // Check if post exists
      const post = await db.queryRow<{ id: number }>`
        SELECT id FROM company_posts WHERE id = ${req.post_id}
      `;
      
      if (!post) {
        throw APIError.notFound("Post not found");
      }

      // Get user info from Clerk
      const user = await clerkClient.users.getUser(authData.userID);
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.username || "Unknown";
      const userAvatar = user.imageUrl;

      // Add comment with sanitized content
      const comment = await db.queryRow<PostComment>`
        INSERT INTO post_comments (
          post_id, user_id, user_name, user_avatar, content
        ) VALUES (
          ${req.post_id}, ${authData.userID}, ${userName}, ${userAvatar}, ${sanitizedContent}
        )
        RETURNING *
      `;

      if (!comment) {
        throw APIError.internal("Failed to add comment");
      }

      return { comment };
    } catch (error) {
      log.error("Failed to add comment", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to add comment");
    }
  }
);

// API: Get comments for a post
export const getComments = api(
  { expose: true, method: "GET", path: "/posts/:post_id/comments" },
  async (req: GetCommentsRequest): Promise<GetCommentsResponse> => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    try {
      const comments = await db.query<PostComment>`
        SELECT * FROM post_comments
        WHERE post_id = ${req.post_id}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const commentsArray: PostComment[] = [];
      for await (const comment of comments) {
        commentsArray.push(comment);
      }

      // Get total count
      const countResult = await db.queryRow<{ count: number }>`
        SELECT COUNT(*)::int as count FROM post_comments WHERE post_id = ${req.post_id}
      `;

      return {
        comments: commentsArray,
        total: countResult?.count || 0
      };
    } catch (error) {
      log.error("Failed to get comments", error as Error);
      throw APIError.internal("Failed to get comments");
    }
  }
);

// API: Delete a post (only post owner)
export const deletePost = api(
  { expose: true, auth: true, method: "DELETE", path: "/posts/:post_id" },
  async (req: { post_id: number }): Promise<{ success: boolean }> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      // Check if post exists and user is the owner
      const post = await db.queryRow<{ id: number; author_id: string; image_url?: string }>`
        SELECT id, author_id, image_url FROM company_posts WHERE id = ${req.post_id}
      `;
      
      if (!post) {
        throw APIError.notFound("Post not found");
      }

      if (post.author_id !== authData.userID) {
        throw APIError.permissionDenied("You can only delete your own posts");
      }

      // Delete the post (cascades to likes and comments due to foreign keys)
      await db.exec`
        DELETE FROM company_posts WHERE id = ${req.post_id}
      `;

      // If there was an image, we could delete it from bucket here
      // But keeping it for now in case of audit needs

      return { success: true };
    } catch (error) {
      log.error("Failed to delete post", error as Error);
      if (error instanceof APIError) throw error;
      throw APIError.internal("Failed to delete post");
    }
  }
);

// API: Upload image separately (for markdown editor)
export const uploadImage = api(
  { expose: true, auth: true, method: "POST", path: "/companies/upload-image" },
  async (req: UploadImageRequest): Promise<UploadImageResponse> => {
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Authentication required");
    }

    try {
      const imageBuffer = Buffer.from(req.data, 'base64');
      const filename = `uploads/${authData.userID}/${Date.now()}-${req.filename}`;
      
      await postImages.upload(filename, imageBuffer, {
        contentType: req.contentType,
      });
      
      const url = postImages.publicUrl(filename);
      
      return { url };
    } catch (error) {
      log.error("Failed to upload image", error as Error);
      throw APIError.internal("Failed to upload image");
    }
  }
);