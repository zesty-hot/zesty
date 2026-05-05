import { serverSupabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function getPastAttendedEvents(userId: string) {
  return await prisma.eventAttendee.findMany({
    where: {
      user: {
        supabaseId: userId
      },
      status: {
        in: ['GOING', 'MAYBE']
      },
      event: {
        startTime: {
          lt: new Date()
        }
      }
    },
    include: {
      event: true
    },
    orderBy: {
      event: {
        startTime: 'desc'
      }
    }
  });
}

export default async function PastEventsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const supabase = await serverSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const pastEvents = await getPastAttendedEvents(user.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/favourites`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-muted-foreground" />
              Past Events
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {pastEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
            <div className="bg-background p-4 rounded-full mb-4 shadow-sm">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No past events</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              You haven't attended any events yet.
            </p>
            <Link href={`/${lang}/events`}>
              <Button variant="outline">
                Browse Upcoming Events
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((attendee) => {
              const event = attendee.event;
              const startDate = new Date(event.startTime);

              return (
                <Link key={attendee.id} href={`/${lang}/events/${event.slug}`} className="group block">
                  <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:scale-[1.02] flex flex-col h-full opacity-75 hover:opacity-100">
                    <div className="relative aspect-video bg-muted shrink-0 grayscale group-hover:grayscale-0 transition-all">
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
                        <Badge variant="secondary">
                          Past
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
