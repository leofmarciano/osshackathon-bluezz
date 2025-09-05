import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Streamdown } from "streamdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBackend } from "../../lib/useBackend";
import { sanitizeHTML, sanitizeText, validateContentLength } from "../../lib/sanitize";
import {
  Heart, MessageCircle, Share2, Image, FileText, MapPin,
  MoreHorizontal, Send, X, Loader2, Calendar, Eye, AlertTriangle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TimelinePost {
  id: number;
  company_id: number;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  has_liked?: boolean;
}

interface PostComment {
  id: number;
  post_id: number;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

export default function CompanyTimeline({ 
  companyId,
  isOwner 
}: {
  companyId: string;
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const { userId } = useAuth();
  const backend = useBackend();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, PostComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string>("");
  const [commentErrors, setCommentErrors] = useState<Record<number, string>>({});

  // Load posts
  useEffect(() => {
    loadPosts();
  }, [companyId]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await backend.companies.getPosts(parseInt(companyId), {});
      setPosts(response.posts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() && !selectedImage) return;
    
    // Clear previous errors
    setError("");

    // Check for dangerous content patterns
    const dangerousPatterns = [
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(newPost))) {
      setError(t("companies.timeline.dangerousContent", "Your post contains potentially dangerous content. Please remove any scripts or HTML tags."));
      return;
    }

    // Validate content length
    if (!validateContentLength(newPost, 5000)) {
      setError(t("companies.timeline.contentTooLong", "Content must be between 1 and 5000 characters"));
      return;
    }

    setIsPosting(true);
    try {
      let imageUrl = undefined;
      
      // Upload image separately if provided
      if (selectedImage) {
        // Check file size (max 5MB)
        if (selectedImage.size > 5 * 1024 * 1024) {
          alert(t("companies.timeline.imageTooLarge", "Image must be less than 5MB"));
          setIsPosting(false);
          return;
        }

        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
          };
          reader.readAsDataURL(selectedImage);
        });

        // Upload image first
        const uploadResponse = await backend.companies.uploadImage({
          filename: selectedImage.name,
          data: base64,
          contentType: selectedImage.type
        });
        
        imageUrl = uploadResponse.url;
      }

      // Sanitize content before sending
      const sanitizedPost = sanitizeText(newPost);

      // Create post with sanitized content and image URL
      await backend.companies.createPost(parseInt(companyId), {
        content: sanitizedPost,
        image_url: imageUrl
      });

      // Reset form
      setNewPost("");
      setSelectedImage(null);
      setImagePreview("");
      
      // Reload posts
      loadPosts();
    } catch (error: any) {
      console.error("Error creating post:", error);
      
      // Show user-friendly error message
      if (error?.message?.includes("dangerous") || error?.message?.includes("script")) {
        setError(t("companies.timeline.securityError", "Your post was blocked for security reasons. Please remove any scripts or dangerous HTML."));
      } else if (error?.message?.includes("length")) {
        setError(t("companies.timeline.lengthError", "Your post is too long or too short."));
      } else {
        setError(t("companies.timeline.genericError", "Failed to create post. Please try again."));
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await backend.companies.likePost(postId, {});
      
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            has_liked: !post.has_liked,
            likes_count: response.likes_count
          };
        }
        return post;
      }));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const toggleComments = async (postId: number) => {
    const isShowing = !showComments[postId];
    setShowComments({ ...showComments, [postId]: isShowing });
    
    if (isShowing && !comments[postId]) {
      // Load comments if not loaded yet
      setLoadingComments({ ...loadingComments, [postId]: true });
      try {
        const response = await backend.companies.getComments(postId, {});
        setComments({ ...comments, [postId]: response.comments });
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setLoadingComments({ ...loadingComments, [postId]: false });
      }
    }
  };

  const handleComment = async (postId: number) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    
    // Clear previous errors
    setCommentErrors({ ...commentErrors, [postId]: "" });

    // Check for dangerous content
    const dangerousPatterns = [
      /<script[^>]*>/gi,
      /<iframe[^>]*>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    if (dangerousPatterns.some(pattern => pattern.test(content))) {
      setCommentErrors({ 
        ...commentErrors, 
        [postId]: t("companies.timeline.dangerousComment", "Your comment contains potentially dangerous content.") 
      });
      return;
    }

    // Validate comment length
    if (!validateContentLength(content, 1000)) {
      setCommentErrors({ 
        ...commentErrors, 
        [postId]: t("companies.timeline.commentTooLong", "Comment must be between 1 and 1000 characters") 
      });
      return;
    }

    try {
      // Sanitize comment before sending
      const sanitizedComment = sanitizeText(content);
      
      const response = await backend.companies.addComment(postId, {
        content: sanitizedComment
      });
      
      // Add new comment to local state
      setComments({
        ...comments,
        [postId]: [response.comment, ...(comments[postId] || [])]
      });
      
      // Clear input
      setCommentInputs({ ...commentInputs, [postId]: "" });
      
      // Update comment count
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments_count: (post.comments_count || 0) + 1 };
        }
        return post;
      }));
    } catch (error: any) {
      console.error("Error adding comment:", error);
      
      // Show user-friendly error message
      if (error?.message?.includes("dangerous") || error?.message?.includes("script")) {
        setCommentErrors({ 
          ...commentErrors, 
          [postId]: t("companies.timeline.securityError", "Your comment was blocked for security reasons.") 
        });
      } else {
        setCommentErrors({ 
          ...commentErrors, 
          [postId]: t("companies.timeline.genericCommentError", "Failed to add comment. Please try again.") 
        });
      }
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now.getTime() - postDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} ${t("common.daysAgo", "days ago")}`;
    if (hours > 0) return `${hours} ${t("common.hoursAgo", "hours ago")}`;
    if (minutes > 0) return `${minutes} ${t("common.minutesAgo", "minutes ago")}`;
    return t("common.justNow", "just now");
  };

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {isOwner && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{t("companies.timeline.createPost")}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <MDEditor
              value={newPost}
              onChange={(value) => setNewPost(value || "")}
              preview="edit"
              height={200}
            />
            
            {imagePreview && (
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-48 rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <Image className="mr-2 h-4 w-4" />
                  {t("companies.timeline.addImage")}
                </Button>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div className="flex-1" />

              <Button 
                onClick={handlePost} 
                disabled={isPosting || (!newPost.trim() && !selectedImage)}
              >
                {isPosting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {t("companies.timeline.post")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-500">{t("companies.timeline.loading")}</p>
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">{t("companies.timeline.noPosts")}</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-6">
              {/* Post Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.author_avatar} />
                    <AvatarFallback>
                      {post.author_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.author_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>{t("common.edit")}</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Post Content - Already sanitized on backend */}
              <div className="prose prose-blue max-w-none">
                <Streamdown>{post.content}</Streamdown>
              </div>

              {/* Post Image */}
              {post.image_url && (
                <div className="mt-4">
                  <img 
                    src={post.image_url} 
                    alt="Post" 
                    className="w-full rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={post.has_liked ? "text-red-600" : ""}
                  >
                    <Heart className={`mr-1 h-4 w-4 ${post.has_liked ? "fill-current" : ""}`} />
                    {post.likes_count || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {post.comments_count || 0}
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <Share2 className="mr-1 h-4 w-4" />
                    {t("common.share")}
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {/* Comment Error */}
                  {commentErrors[post.id] && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{commentErrors[post.id]}</AlertDescription>
                    </Alert>
                  )}
                  
                  {userId && (
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("companies.timeline.addComment")}
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({
                          ...commentInputs,
                          [post.id]: e.target.value
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleComment(post.id);
                          }
                        }}
                      />
                      <Button 
                        size="sm"
                        onClick={() => handleComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {loadingComments[post.id] ? (
                    <div className="text-center py-4">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user_avatar} />
                            <AvatarFallback>
                              {comment.user_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="text-sm font-semibold">{sanitizeText(comment.user_name)}</p>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatTimeAgo(comment.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}