"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/image-upload";
import { Spinner } from "@/components/ui/spinner";
import { toastManager } from "@/components/ui/toast";
import { ArrowLeft, Trash2, Image as ImageIcon, Video, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface VIPContent {
  id: string;
  type: "IMAGE" | "VIDEO" | "STATUS";
  caption: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  statusText: string | null;
  NSFW: boolean;
  createdAt: string;
  _count: {
    likes: number;
    comments: number;
  };
}

export default function VipContentPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<VIPContent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [activeTab, setActiveTab] = useState<"IMAGE" | "VIDEO" | "STATUS">("IMAGE");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [statusText, setStatusText] = useState("");
  const [nsfw, setNsfw] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vip/content");
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to load content.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        type: activeTab,
        caption,
        imageUrl: activeTab === "IMAGE" ? imageUrl : undefined,
        videoUrl: activeTab === "VIDEO" ? videoUrl : undefined,
        statusText: activeTab === "STATUS" ? statusText : undefined,
        NSFW: nsfw,
      };

      const res = await fetch("/api/vip/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create content");

      const newContent = await res.json();
      setContent([newContent, ...content]);

      // Reset form
      setCaption("");
      setImageUrl("");
      setVideoUrl("");
      setStatusText("");
      setNsfw(false);

      toastManager.add({
        title: "Success",
        description: "Content posted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error creating content:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to post content.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/vip/content/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete content");

      setContent(content.filter((c) => c.id !== id));
      toastManager.add({
        title: "Success",
        description: "Content deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting content:", error);
      toastManager.add({
        title: "Error",
        description: "Failed to delete content.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b backdrop-blur sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dash/vip`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                VIP Content
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage your exclusive posts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Post Column */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Create New Post</h2>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="IMAGE"><ImageIcon className="w-4 h-4 mr-1" />Image</TabsTrigger>
                <TabsTrigger value="VIDEO"><Video className="w-4 h-4 mr-1" />Video</TabsTrigger>
                <TabsTrigger value="STATUS"><MessageSquare className="w-4 h-4 mr-1" />Status</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="IMAGE" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <ImageUpload
                      value={imageUrl}
                      onChange={setImageUrl}
                      uploadEndpoint="/api/vip/upload"
                      accept="image/*"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Textarea
                      placeholder="Write a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="VIDEO" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Video File</Label>
                    <ImageUpload
                      value={videoUrl}
                      onChange={setVideoUrl}
                      uploadEndpoint="/api/vip/upload"
                      accept="video/*"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Caption</Label>
                    <Textarea
                      placeholder="Write a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="STATUS" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Status Update</Label>
                    <Textarea
                      placeholder="What's on your mind?"
                      className="min-h-[150px]"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                    />
                  </div>
                </TabsContent>

                {/* <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={nsfw} onCheckedChange={setNsfw} id="nsfw" />
                    <Label htmlFor="nsfw" className="cursor-pointer">NSFW Content</Label>
                  </div>
                </div> */}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner className="w-4 h-4 mr-2" /> : null}
                  Post Content
                </Button>
              </form>
            </Tabs>
          </Card>
        </div>

        {/* Content List Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold">Recent Posts</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-8 h-8" />
            </div>
          ) : content.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No content yet</h3>
              <p className="text-muted-foreground">
                Create your first post to start building your VIP feed.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {content.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{item.type}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                      {item.NSFW && (
                        <span className="bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full font-medium border border-red-500/20">
                          NSFW
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive -mt-2 -mr-2"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {item.type === "IMAGE" && item.imageUrl && (
                    <div className="bg-muted relative">
                      <img
                        src={item.imageUrl}
                        alt={item.caption || "Post image"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {item.type === "VIDEO" && item.videoUrl && (
                    <div className="aspect-video bg-black relative flex items-center justify-center">
                      <video
                        src={item.videoUrl}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  <div className="p-4">
                    {item.type === "STATUS" ? (
                      <p className="text-lg whitespace-pre-wrap">{item.statusText}</p>
                    ) : (
                      item.caption && <p className="whitespace-pre-wrap">{item.caption}</p>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item._count?.likes || 0}</span> Likes
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item._count?.comments || 0}</span> Comments
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}