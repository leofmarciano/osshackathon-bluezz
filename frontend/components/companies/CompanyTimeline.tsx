import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MDEditor from "@uiw/react-md-editor";
import { Streamdown } from "streamdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart, MessageCircle, Share2, Image, FileText, MapPin,
  MoreHorizontal, Send, X, Loader2, Calendar, Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimelinePost {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  content: string;
  images?: string[];
  documents?: Array<{
    name: string;
    url: string;
    size: string;
  }>;
  location?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  views: number;
  hasLiked: boolean;
  userComments?: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: Date;
  }>;
}

export default function CompanyTimeline({ 
  companyId,
  isOwner 
}: {
  companyId: string;
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<TimelinePost[]>([
    // Mock data
    {
      id: "1",
      companyId,
      companyName: "Ocean Cleanup NGO",
      companyLogo: "https://picsum.photos/150/150?random=1",
      content: "Today we successfully removed 500kg of plastic from the coastal area! 🌊 Our volunteers worked tirelessly to make this happen. Thank you to everyone who participated!",
      images: [
        "https://picsum.photos/600/400?random=2",
        "https://picsum.photos/600/400?random=3"
      ],
      location: "Praia do Forte, BA",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 234,
      comments: 45,
      views: 1250,
      hasLiked: false,
      userComments: [
        {
          id: "c1",
          userId: "u1",
          userName: "João Silva",
          content: "Amazing work! Keep it up! 💙",
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
        }
      ]
    },
    {
      id: "2",
      companyId,
      companyName: "Ocean Cleanup NGO",
      companyLogo: "https://picsum.photos/150/150?random=1",
      content: "## Educational Workshop Success! 📚\n\nWe just completed our monthly educational workshop with 50 local students. Topics covered:\n\n- Ocean pollution impact\n- Marine life preservation\n- How to reduce plastic usage\n- Community action plans\n\nThe engagement was amazing! These young minds are the future of ocean conservation.",
      images: [
        "https://picsum.photos/600/400?random=4",
        "https://picsum.photos/600/400?random=5",
        "https://picsum.photos/600/400?random=6"
      ],
      location: "Escola Municipal Santos Dumont, SP",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      likes: 189,
      comments: 23,
      views: 890,
      hasLiked: true,
      userComments: []
    },
    {
      id: "3",
      companyId,
      companyName: "Ocean Cleanup NGO",
      companyLogo: "https://picsum.photos/150/150?random=1",
      content: "🐢 **Turtle Rescue Mission Completed!**\n\nOur team rescued a sea turtle trapped in fishing nets today. After careful removal of the nets and a health check, we're happy to report the turtle is doing well and was released back to the ocean!\n\nEvery life matters in our mission to protect marine biodiversity.",
      images: [
        "https://picsum.photos/600/400?random=7"
      ],
      location: "Praia de Copacabana, RJ",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      likes: 567,
      comments: 89,
      views: 3420,
      hasLiked: false,
      userComments: [
        {
          id: "c2",
          userId: "u2",
          userName: "Maria Santos",
          content: "Heroes! Thank you for saving this beautiful creature 🐢💚",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: "c3",
          userId: "u3",
          userName: "Carlos Oliveira",
          content: "This is why I support your organization. Real impact!",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        }
      ]
    },
    {
      id: "4",
      companyId,
      companyName: "Ocean Cleanup NGO",
      companyLogo: "https://picsum.photos/150/150?random=1",
      content: "### Partnership Announcement! 🤝\n\nWe're excited to announce our new partnership with **EcoTech Solutions**! Together, we'll be:\n\n1. Developing AI-powered ocean monitoring systems\n2. Creating biodegradable alternatives to common plastics\n3. Expanding our cleanup operations to 5 new beaches\n\nThis collaboration will help us scale our impact and reach our 2024 goals faster!",
      images: [
        "https://picsum.photos/600/400?random=8",
        "https://picsum.photos/600/400?random=9"
      ],
      documents: [
        {
          name: "Partnership_Agreement_Summary.pdf",
          url: "#",
          size: "245 KB"
        }
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      likes: 342,
      comments: 67,
      views: 2100,
      hasLiked: false,
      userComments: []
    },
    {
      id: "5",
      companyId,
      companyName: "Ocean Cleanup NGO",
      companyLogo: "https://picsum.photos/150/150?random=1",
      content: "**Monthly Impact Report - October 2023** 📊\n\n- 🗑️ 2.5 tons of plastic removed\n- 🏖️ 8 beaches cleaned\n- 👥 150 volunteers engaged\n- 🐟 12 marine animals rescued\n- 📚 300 students educated\n\nThank you to everyone who made this possible! Your support drives real change.",
      images: [
        "https://picsum.photos/600/400?random=10",
        "https://picsum.photos/600/400?random=11",
        "https://picsum.photos/600/400?random=12",
        "https://picsum.photos/600/400?random=13"
      ],
      location: "Multiple Locations, Brasil",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      likes: 892,
      comments: 134,
      views: 5670,
      hasLiked: true,
      userComments: []
    }
  ]);

  const [newPost, setNewPost] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [postLocation, setPostLocation] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const handlePost = async () => {
    if (!newPost.trim() && selectedImages.length === 0 && selectedDocuments.length === 0) return;

    setIsPosting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const post: TimelinePost = {
      id: Date.now().toString(),
      companyId,
      companyName: "Your Company",
      companyLogo: "https://picsum.photos/150/150?random=1",
      content: newPost,
      location: postLocation,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      views: 0,
      hasLiked: false,
      userComments: []
    };

    setPosts([post, ...posts]);
    setNewPost("");
    setSelectedImages([]);
    setSelectedDocuments([]);
    setPostLocation("");
    setIsPosting(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId
        ? { 
            ...post, 
            hasLiked: !post.hasLiked,
            likes: post.hasLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleComment = (postId: string) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    setPosts(posts.map(post => 
      post.id === postId
        ? {
            ...post,
            comments: post.comments + 1,
            userComments: [
              ...(post.userComments || []),
              {
                id: Date.now().toString(),
                userId: "current",
                userName: "You",
                content: comment,
                createdAt: new Date()
              }
            ]
          }
        : post
    ));

    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return t("timeline.time.now");
    if (seconds < 3600) return t("timeline.time.minutes", { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t("timeline.time.hours", { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t("timeline.time.days", { count: Math.floor(seconds / 86400) });
    
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments(selectedDocuments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Create Post Section - Only for Company Owner */}
      {isOwner && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">{t("timeline.create.title")}</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div data-color-mode="light">
              <MDEditor
                value={newPost}
                onChange={(val) => setNewPost(val || "")}
                height={200}
                preview="edit"
                textareaProps={{
                  placeholder: t("timeline.create.placeholder")
                }}
              />
            </div>

            {/* Selected Images Preview */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Selected ${index + 1}`}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute right-1 top-1"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Documents List */}
            {selectedDocuments.length > 0 && (
              <div className="space-y-2">
                {selectedDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeDocument(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <label htmlFor="post-images" className="cursor-pointer">
                  <Button variant="ghost" size="sm" asChild>
                    <span>
                      <Image className="h-4 w-4" />
                      <input
                        id="post-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedImages([...selectedImages, ...Array.from(e.target.files)]);
                          }
                        }}
                      />
                    </span>
                  </Button>
                </label>

                <label htmlFor="post-documents" className="cursor-pointer">
                  <Button variant="ghost" size="sm" asChild>
                    <span>
                      <FileText className="h-4 w-4" />
                      <input
                        id="post-documents"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) {
                            setSelectedDocuments([...selectedDocuments, ...Array.from(e.target.files)]);
                          }
                        }}
                      />
                    </span>
                  </Button>
                </label>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder={t("timeline.create.location")}
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    className="h-8 w-48"
                  />
                </div>
              </div>

              <Button
                onClick={handlePost}
                disabled={isPosting || (!newPost.trim() && selectedImages.length === 0 && selectedDocuments.length === 0)}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("timeline.create.posting")}
                  </>
                ) : (
                  t("timeline.create.post")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Posts */}
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="mb-4 flex items-start justify-between">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage src={post.companyLogo} />
                  <AvatarFallback>
                    {post.companyName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{post.companyName}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{post.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{t("timeline.post.edit")}</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      {t("timeline.post.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Post Content */}
            <div className="prose prose-sm max-w-none mb-4">
              <Streamdown>
                {post.content}
              </Streamdown>
            </div>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className={`mb-4 grid gap-2 ${
                post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}>
                {post.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="h-64 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            {/* Post Documents */}
            {post.documents && post.documents.length > 0 && (
              <div className="mb-4 space-y-2">
                {post.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-2 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{doc.name}</span>
                    <Badge variant="secondary">{doc.size}</Badge>
                  </a>
                ))}
              </div>
            )}

            {/* Post Stats */}
            <div className="mb-4 flex items-center gap-6 border-y py-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views.toLocaleString()} {t("timeline.stats.views")}
              </span>
              <span>{post.likes.toLocaleString()} {t("timeline.stats.likes")}</span>
              <span>{post.comments} {t("timeline.stats.comments")}</span>
            </div>

            {/* Post Actions */}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={post.hasLiked ? "text-red-600" : ""}
              >
                <Heart className={`mr-2 h-4 w-4 ${post.hasLiked ? "fill-current" : ""}`} />
                {t("timeline.actions.like")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("timeline.actions.comment")}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                {t("timeline.actions.share")}
              </Button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {post.userComments?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>
                        {comment.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm font-semibold">{comment.userName}</p>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Comment Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder={t("timeline.comment.placeholder")}
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => setCommentInputs({ 
                      ...commentInputs, 
                      [post.id]: e.target.value 
                    })}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleComment(post.id);
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
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      {posts.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            {t("timeline.loadMore")}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">
              {isOwner 
                ? t("timeline.empty.owner")
                : t("timeline.empty.visitor")
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}