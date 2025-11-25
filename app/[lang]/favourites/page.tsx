import { serverSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  DollarSign,
  Users,
  Video,
  Radio,
  Crown,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

// We'll define types based on what we fetch to ensure type safety in our components
type FavouritedCompanion = Awaited<ReturnType<typeof getFavouritedCompanions>>[number];
type SubscribedVIP = Awaited<ReturnType<typeof getSubscribedVIPs>>[number];
type FollowedStreamer = Awaited<ReturnType<typeof getFollowedStreamers>>[number];
type AttendingEvent = Awaited<ReturnType<typeof getAttendingEvents>>[number];
type AcceptedJob = Awaited<ReturnType<typeof getAcceptedJobs>>[number];

// --- Data Fetching ---

async function getFavouritedCompanions(userId: string) {
  return await prisma.privateAd.findMany({
    where: {
      followers: {
        some: {
          supabaseId: userId
        }
      }
    },
    include: {
      worker: {
        include: {
          images: true
        }
      },
      services: {
        include: {
          options: true
        }
      }
    }
  });
}

async function getSubscribedVIPs(userId: string) {
  return await prisma.vIPSubscription.findMany({
    where: {
      subscriber: {
        supabaseId: userId
      },
      active: true
    },
    include: {
      vipPage: {
        include: {
          user: {
            include: {
              images: true
            }
          },
          _count: {
            select: {
              content: true,
              subscriptions: true
            }
          }
        }
      }
    }
  });
}

async function getFollowedStreamers(userId: string) {
  return await prisma.liveStreamFollower.findMany({
    where: {
      user: {
        supabaseId: userId
      }
    },
    include: {
      channel: {
        include: {
          user: {
            include: {
              images: true
            }
          },
          streams: {
            where: {
              isLive: true
            },
            take: 1
          },
          _count: {
            select: {
              followers: true
            }
          }
        }
      }
    }
  });
}

async function getAttendingEvents(userId: string) {
  return await prisma.eventAttendee.findMany({
    where: {
      user: {
        supabaseId: userId
      },
      status: {
        in: ['GOING', 'MAYBE']
      }
    },
    include: {
      event: true
    },
    orderBy: {
      event: {
        startTime: 'asc'
      }
    }
  });
}

async function getAcceptedJobs(userId: string) {
  return await prisma.jobApplication.findMany({
    where: {
      applicant: {
        supabaseId: userId
      },
      status: 'ACCEPTED'
    },
    include: {
      job: {
        include: {
          studio: true
        }
      }
    },
    orderBy: {
      job: {
        startDate: 'asc'
      }
    }
  });
}

// --- Page Component ---

export default async function FavouritesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const [
    companions,
    vipSubscriptions,
    streamers,
    events,
    jobs
  ] = await Promise.all([
    getFavouritedCompanions(user.id),
    getSubscribedVIPs(user.id),
    getFollowedStreamers(user.id),
    getAttendingEvents(user.id),
    getAcceptedJobs(user.id)
  ]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            My Favourites & Activity
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">

        {/* 1. Companions Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-pink-500" />
              Favourited Companions
            </h2>
            {/* <Badge variant="secondary">{companions.length}</Badge> */}
          </div>

          {companions.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No favourites yet"
              description="Browse companions and heart your favourites to see them here."
              actionLink={`/${lang}/escorts`}
              actionText="Browse Companions"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {companions.map((ad) => (
                <CompanionCard key={ad.id} ad={ad} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {/* 2. VIP Subscriptions Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-500" />
              VIP Subscriptions
            </h2>
            {/* <Badge variant="secondary">{vipSubscriptions.length}</Badge> */}
          </div>

          {vipSubscriptions.length === 0 ? (
            <EmptyState
              icon={Crown}
              title="No active subscriptions"
              description="Subscribe to VIP pages for exclusive content."
              actionLink={`/${lang}/vip`}
              actionText="Discover VIP Creators"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vipSubscriptions.map((sub) => (
                <VipCard key={sub.id} subscription={sub} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {/* 3. Livestreamers Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-500" />
              Followed Streamers
            </h2>
            {/* <Badge variant="secondary">{streamers.length}</Badge> */}
          </div>

          {streamers.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No followed streamers"
              description="Follow streamers to get notified when they go live."
              actionLink={`/${lang}/live`}
              actionText="Watch Live Streams"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {streamers.map((follower) => (
                <StreamerCard key={follower.id} follower={follower} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {/* 4. Events Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Upcoming Events
            </h2>
            {/* <Badge variant="secondary">{events.length}</Badge> */}
          </div>

          {events.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming events"
              description="Join events to meet people and have fun."
              actionLink={`/${lang}/events`}
              actionText="Find Events"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((attendee) => (
                <EventCard key={attendee.id} attendee={attendee} lang={lang} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Studio Jobs Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-orange-500" />
              Accepted Jobs
            </h2>
            {/* <Badge variant="secondary">{jobs.length}</Badge> */}
          </div>

          {jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No accepted jobs"
              description="Apply for studio jobs to start working."
              actionLink={`/${lang}/jobs`}
              actionText="Browse Jobs"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((application) => (
                <JobCard key={application.id} application={application} lang={lang} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// --- UI Components ---

function EmptyState({ icon: Icon, title, description, actionLink, actionText }: {
  icon: any, title: string, description: string, actionLink: string, actionText: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
      <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-sm mb-6">{description}</p>
      <Link href={actionLink}>
        <Button variant="outline">
          {actionText}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function CompanionCard({ ad, lang }: { ad: FavouritedCompanion, lang: string }) {
  const defaultImage = ad.worker.images.find(img => img.default) || ad.worker.images[0];

  return (
    <Link href={`/${lang}/escorts/${ad.worker.slug}`} className="group block">
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
        <div className="relative aspect-square bg-muted">
          {defaultImage ? (
            <img
              src={defaultImage.url}
              alt={ad.worker.slug || 'Companion'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Users className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm">
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            {ad.worker.slug}
          </h3>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{ad.worker.suburb || 'Unknown Location'}</span>
            </div>
            {ad.services[0]?.options[0]?.price && (
              <div className="font-semibold text-foreground">
                ${ad.services[0].options[0].price}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function VipCard({ subscription, lang }: { subscription: SubscribedVIP, lang: string }) {
  const user = subscription.vipPage.user;
  const defaultImage = user.images.find(img => img.default) || user.images[0];

  return (
    <Link href={`/${lang}/vip/${user.slug}`} className="group block">
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
        <div className="relative aspect-square bg-muted">
          {defaultImage ? (
            <img
              src={defaultImage.url}
              alt={user.slug || 'VIP Creator'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Crown className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-purple-600 hover:bg-purple-700">VIP</Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-purple-600 transition-colors">
            {user.slug}
          </h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>{subscription.vipPage._count.content} posts</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{subscription.vipPage._count.subscriptions} subs</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StreamerCard({ follower, lang }: { follower: FollowedStreamer, lang: string }) {
  const user = follower.channel.user;
  const defaultImage = user.images.find(img => img.default) || user.images[0];
  const isLive = follower.channel.streams.length > 0 && follower.channel.streams[0].isLive;

  return (
    <Link href={`/${lang}/live/${user.slug}`} className="group block">
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
        <div className="relative bg-muted">
          {defaultImage ? (
            <img
              src={defaultImage.url}
              alt={user.slug || 'Streamer'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Radio className="w-12 h-12" />
            </div>
          )}
          {isLive && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-red-500 transition-colors">
            {user.slug}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {follower.channel.description || 'No description'}
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{follower.channel._count.followers} followers</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ attendee, lang }: { attendee: AttendingEvent, lang: string }) {
  const event = attendee.event;
  const startDate = new Date(event.startTime);

  return (
    <Link href={`/${lang}/events/${event.slug}`} className="group block">
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col h-full">
        <div className="relative aspect-video bg-muted shrink-0">
          {event.coverImage ? (
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Calendar className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={attendee.status === 'GOING' ? 'default' : 'secondary'}>
              {attendee.status}
            </Badge>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-2">
            <Clock className="w-3 h-3" />
            <span>
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {event.title}
          </h3>
          <div className="mt-auto pt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{event.venue || event.suburb || 'TBD'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function JobCard({ application, lang }: { application: AcceptedJob, lang: string }) {
  const job = application.job;

  return (
    <Link href={`/${lang}/jobs/${job.slug}`} className="group block">
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col h-full">
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {job.type.replace('_', ' ')}
            </Badge>
            <Badge className="bg-green-600">ACCEPTED</Badge>
          </div>

          <h3 className="font-bold text-lg mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
            {job.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span className="font-medium text-foreground">{job.studio.name}</span>
          </div>

          <div className="mt-auto space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">${(job.payAmount / 100).toFixed(0)}</span>
              <span className="text-xs">• {job.payType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Starting {new Date(job.startDate).toLocaleDateString()}</span>
            </div>
            {job.suburb && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{job.suburb}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}