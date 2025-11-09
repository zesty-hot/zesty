"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Loader2,
  ArrowLeft,
  Share2,
  MoreHorizontal,
  Send,
  DollarSign,
} from "lucide-react";
import { StartChatButton } from "@/components/start-chat-button";

interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  location: string | null;
  suburb: string | null;
  venue: string | null;
  startTime: Date | string;
  endTime?: Date | string | null;
  status: 'OPEN' | 'INVITE_ONLY' | 'PAY_TO_JOIN' | 'REQUEST_TO_JOIN';
  price: number | null;
  maxAttendees: number | null;
  organizer: {
    id: string;
    slug: string | null;
    title: string | null;
    images?: { url: string }[];
    verified: boolean;
  };
  attendees: {
    id: string;
    status: 'GOING' | 'MAYBE' | 'PENDING' | 'DECLINED' | 'INVITED';
    user: {
      id: string;
      slug: string | null;
      title: string | null;
      images?: { url: string }[];
    };
  }[];
  posts?: EventPost[];
  isOrganizer: boolean;
  userAttendanceStatus: 'GOING' | 'MAYBE' | 'PENDING' | 'DECLINED' | 'INVITED' | null;
}

interface EventPost {
  id: string;
  content: string;
  createdAt: Date | string;
  author: {
    id: string;
    slug: string | null;
    title: string | null;
    images?: { url: string }[];
  };
  comments: EventComment[];
}

interface EventComment {
  id: string;
  content: string;
  createdAt: Date | string;
  author: {
    id: string;
    slug: string | null;
    title: string | null;
    images?: { url: string }[];
  };
}

export default function EventPage() {
  const { slug, lang } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [isPostingThread, setIsPostingThread] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchEventData();
  }, [slug]);

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/events/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else if (response.status === 404) {
        router.push(`/${lang}/events`);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!session) {
      router.push(`/${lang}/auth/signin`);
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch(`/api/events/${slug}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        await fetchEventData(); // Refresh data
      }
    } catch (error) {
      console.error('Error joining event:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPostingThread(true);
    try {
      const response = await fetch(`/api/events/${slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      });

      if (response.ok) {
        setNewPost("");
        await fetchEventData();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPostingThread(false);
    }
  };

  const handleCreateComment = async (postId: string) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`/api/events/${slug}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      if (response.ok) {
        setReplyContent("");
        setReplyingTo(null);
        await fetchEventData();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-muted-foreground mb-6">
            This event doesn't exist or has been removed
          </p>
          <Link href={`/${lang}/events`}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const startTime = new Date(event.startTime);
  const endTime = event.endTime ? new Date(event.endTime) : null;
  const hasJoined = event.userAttendanceStatus === 'GOING' || event.userAttendanceStatus === 'MAYBE';
  const isPending = event.userAttendanceStatus === 'PENDING';
  const goingCount = event.attendees.filter(a => a.status === 'GOING').length;
  const maybeCount = event.attendees.filter(a => a.status === 'MAYBE').length;

  // Show join prompt if user hasn't joined
  if (!hasJoined && !event.isOrganizer) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href={`/${lang}/events`}>
              <Button variant="ghost" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Cover Image */}
            {event.coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden mb-6">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <EventStatusBadge status={event.status} />
                  {event.price && (
                    <Badge variant="outline">
                      ${(event.price / 100).toFixed(2)}
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
                {event.description && (
                  <p className="text-lg text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-6 p-6 border rounded-xl bg-card">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {startTime.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {startTime.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                        {endTime && ` - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                      </p>
                    </div>
                  </div>

                  {event.venue && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold">Location</p>
                        <p className="text-sm text-muted-foreground">{event.venue}</p>
                        {event.suburb && (
                          <p className="text-sm text-muted-foreground">{event.suburb}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold">Attendees</p>
                      <p className="text-sm text-muted-foreground">
                        {goingCount} going · {maybeCount} interested
                      </p>
                      {event.maxAttendees && (
                        <p className="text-sm text-muted-foreground">
                          Capacity: {event.maxAttendees}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                      {event.organizer.images?.[0]?.url ? (
                        <img src={event.organizer.images[0].url} alt={event.organizer.slug || 'Organizer'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold">
                          {event.organizer.slug?.[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Organized by</p>
                      <StartChatButton variant="ghost" otherUserSlug={event.organizer.slug as string}>
                        {event.organizer.slug}
                        {event.organizer.verified && " ✓"}
                      </StartChatButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Join Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleJoinEvent} 
                  disabled={isJoining || isPending}
                  size="lg"
                  className="flex-1"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : isPending ? (
                    'Request Pending'
                  ) : event.status === 'PAY_TO_JOIN' ? (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Pay ${(event.price! / 100).toFixed(2)} to Join
                    </>
                  ) : event.status === 'REQUEST_TO_JOIN' ? (
                    'Request to Join'
                  ) : (
                    'Join Event'
                  )}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Join this event to see posts, comments, and connect with attendees
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full event view for joined users
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${lang}/events`}>
              <Button variant="ghost" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="lg">
                <Share2 className="w-4 h-4" />
              </Button>
              {event.isOrganizer && (
                <Button variant="outline" size="lg">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Cover Image */}
            {event.coverImage && (
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <EventStatusBadge status={event.status} />
                {event.price && (
                  <Badge variant="outline">
                    ${(event.price / 100).toFixed(2)}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-3">{event.title}</h1>
              {event.description && (
                <p className="text-muted-foreground whitespace-pre-line">
                  {event.description}
                </p>
              )}
            </div>

            {/* Create Post */}
            <div className="border rounded-xl p-4 bg-card">
              <form onSubmit={handleCreatePost} className="space-y-3">
                <Textarea
                  placeholder="Share something with attendees..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPostingThread || !newPost.trim()}>
                    {isPostingThread ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {event.posts && event.posts.length > 0 ? (
                event.posts.map((post) => (
                  <div key={post.id} className="border rounded-xl p-4 bg-card">
                    {/* Post Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <Link href={`/${lang}/vip/${post.author.slug}`}>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                          {post.author.images?.[0]?.url ? (
                            <img src={post.author.images[0].url} alt={post.author.slug || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold">
                              {post.author.slug?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/${lang}/vip/${post.author.slug}`} className="font-semibold hover:underline">
                          {post.author.slug}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="mb-3 whitespace-pre-line">{post.content}</p>

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 mt-4 pt-4 border-t">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Link href={`/${lang}/vip/${comment.author.slug}`}>
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                                {comment.author.images?.[0]?.url ? (
                                  <img src={comment.author.images[0].url} alt={comment.author.slug || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                    {comment.author.slug?.[0]?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1 bg-muted rounded-lg p-3">
                              <Link href={`/${lang}/vip/${comment.author.slug}`} className="font-semibold text-sm hover:underline">
                                {comment.author.slug}
                              </Link>
                              <p className="text-sm">{comment.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: 'numeric', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === post.id ? (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Write a comment..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleCreateComment(post.id)}
                              disabled={!replyContent.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setReplyingTo(post.id)}
                      >
                        Reply
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border rounded-xl bg-muted/30">
                  <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <div className="border rounded-xl p-4 bg-card space-y-4">
              <h3 className="font-semibold">Event Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">
                      {startTime.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      {startTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>

                {event.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{event.venue}</p>
                      {event.suburb && (
                        <p className="text-muted-foreground">{event.suburb}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{goingCount} going</p>
                    <p className="text-muted-foreground">{maybeCount} interested</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="border rounded-xl p-4 bg-card">
              <h3 className="font-semibold mb-4">Attendees ({goingCount})</h3>
              <div className="space-y-2">
                {event.attendees
                  .filter(a => a.status === 'GOING')
                  .slice(0, 10)
                  .map((attendee) => (
                    <Link 
                      key={attendee.id} 
                      href={`/${lang}/vip/${attendee.user.slug}`}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
                        {attendee.user.images?.[0]?.url ? (
                          <img src={attendee.user.images[0].url} alt={attendee.user.slug || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                            {attendee.user.slug?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium">{attendee.user.slug}</span>
                    </Link>
                  ))}
                {goingCount > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{goingCount - 10} more
                  </p>
                )}
              </div>
            </div>

            {/* Organizer */}
            <div className="border rounded-xl p-4 bg-card">
              <h3 className="font-semibold mb-3">Organized by</h3>
              <Link href={`/${lang}/vip/${event.organizer.slug}`} className="flex items-center gap-3 hover:bg-muted p-2 rounded transition-colors">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                  {event.organizer.images?.[0]?.url ? (
                    <img src={event.organizer.images[0].url} alt={event.organizer.slug || 'Organizer'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold">
                      {event.organizer.slug?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{event.organizer.slug}</p>
                  {event.organizer.verified && (
                    <Badge variant="secondary" className="h-5 text-xs bg-blue-500 text-white">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventStatusBadge({ status }: { status: string }) {
  const badges = {
    OPEN: <Badge className="bg-green-600 hover:bg-green-700">Open to All</Badge>,
    INVITE_ONLY: <Badge className="bg-purple-600 hover:bg-purple-700">Invite Only</Badge>,
    PAY_TO_JOIN: <Badge className="bg-yellow-600 hover:bg-yellow-700">Paid Event</Badge>,
    REQUEST_TO_JOIN: <Badge className="bg-blue-600 hover:bg-blue-700">Request to Join</Badge>,
  };
  
  return badges[status as keyof typeof badges] || null;
}
