import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, siteConfig } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for event pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  
  try {
    // Fetch the event data
    const event = await withRetry(() =>
      prisma.event.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          suburb: true,
          venue: true,
          startTime: true,
          endTime: true,
          status: true,
          price: true,
          maxAttendees: true,
          coverImage: true,
          organizer: {
            select: {
              slug: true,
              title: true,
            },
          },
          _count: {
            select: {
              attendees: {
                where: {
                  status: "GOING",
                },
              },
            },
          },
        },
      })
    );

    // If event doesn't exist, return basic metadata
    if (!event) {
      return genMeta({
        title: "Event Not Found",
        description: "The event you're looking for doesn't exist.",
        noIndex: true,
      });
    }

    // Format date
    const eventDate = new Date(event.startTime).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Build location string
    const location = [event.venue, event.suburb].filter(Boolean).join(", ");

    // Get image
    const imageUrl = event.coverImage || `${siteConfig.url}/default-event.jpg`;

    // Truncate description
    const description = event.description
      ? event.description.length > 155
        ? `${event.description.substring(0, 152)}...`
        : event.description
      : `${event.title} - ${eventDate}. ${location ? `At ${location}.` : ""} ${
          event.price
            ? `$${(event.price / 100).toFixed(2)} entry.`
            : "Free entry."
        } ${event._count.attendees} attending.`;

    // Build title
    const titleParts = [event.title];
    if (event.suburb) {
      titleParts.push(`in ${event.suburb}`);
    }
    titleParts.push(eventDate);

    const title = titleParts.join(" - ");

    // Determine event type keywords
    const statusKeywords = {
      OPEN: ["open event", "public event"],
      INVITE_ONLY: ["private event", "exclusive event"],
      PAY_TO_JOIN: ["ticketed event", "paid event"],
      REQUEST_TO_JOIN: ["RSVP event", "request to join"],
    };

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        event.title,
        "adult event",
        "entertainment event",
        location ? `${location} event` : "",
        event.suburb || "",
        ...statusKeywords[event.status],
        event.price ? "paid event" : "free event",
        "lifestyle event",
        "adult party",
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/events/${slug}`,
    });
  } catch (error) {
    console.error("Error generating event metadata:", error);
    return genMeta({
      title: "Event",
      description: "Discover exclusive adult events and parties.",
      noIndex: true,
    });
  }
}

export default function EventSlugLayout({ children }: Props) {
  return <>{children}</>;
}
