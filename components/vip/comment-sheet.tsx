"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ProfileModal } from "@/components/profile-modal";

interface Comment {
  id: string;
  text: string;
  user: {
    zesty_id: string;
    slug: string | null;
    verified: boolean;
    images?: { url: string }[];
  };
  createdAt: string;
}

interface CommentSheetProps {
  contentId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentAdded?: (contentId: string) => void;
}

export function CommentSheet({
  contentId,
  isOpen,
  onOpenChange,
  onCommentAdded
}: CommentSheetProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [selectedUserSlug, setSelectedUserSlug] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentId) {
      fetchComments();
    } else {
      setComments([]);
      setNewComment("");
    }
  }, [isOpen, contentId]);

  const fetchComments = async () => {
    if (!contentId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vip/comment?contentId=${contentId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/vip/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          text: newComment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
        if (onCommentAdded) {
          onCommentAdded(contentId);
        }
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedUserSlug(comment.user.slug)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user.images?.[0]?.url} />
                      <AvatarFallback>
                        {comment.user.slug?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-semibold cursor-pointer hover:underline"
                        onClick={() => setSelectedUserSlug(comment.user.slug)}
                      >
                        {comment.user.slug || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="min-h-[44px] max-h-32 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>

      <ProfileModal
        slug={selectedUserSlug}
        open={!!selectedUserSlug}
        onOpenChange={(open) => !open && setSelectedUserSlug(null)}
      />
    </Sheet>
  );
}
