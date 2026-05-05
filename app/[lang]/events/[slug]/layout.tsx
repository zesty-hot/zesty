import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, getSiteConfig } from "@/lib/metadata";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for event pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const siteConfig = getSiteConfig({ lang: lang as Locale });
  const dictionary = getDictionary(lang as Locale);
  const eventsDict = dictionary?.metadata?.events || {};

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

    // If event doesn't exist, return basic metadata from translations or site defaults
    if (!event) {
      return genMeta({
        title: eventsDict.not_found_title ?? siteConfig.title,
        description: eventsDict.not_found_description ?? siteConfig.description,
        noIndex: true,
      });
    }

    // Format date using site locale
    const localeCode = (siteConfig.locale || "en-US").replace("_", "-");
    const eventDate = new Date(event.startTime).toLocaleDateString(localeCode, {
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
      : (() => {
          const atLabel = eventsDict.at_label ?? "";
          const freeEntryLabel = eventsDict.free_entry_label ?? "";
          const attendeesLabel = eventsDict.attendees_label ?? "";
          const subject = `${event.title} - ${eventDate}.`;
          const parts: string[] = [subject];
          if (location && atLabel) parts.push(`${atLabel} ${location}.`);
          if (event.price) parts.push(`$${(event.price / 100).toFixed(2)}`);
          else if (freeEntryLabel) parts.push(freeEntryLabel);
          if (typeof event._count?.attendees === 'number' && attendeesLabel) parts.push(`${event._count.attendees} ${attendeesLabel}`);
          return parts.filter(Boolean).join(' ');
        })();

    // Build title
    const titleParts = [event.title];
    if (event.suburb) {
      titleParts.push(`in ${event.suburb}`);
    }
    titleParts.push(eventDate);

    const title = titleParts.join(" - ");

    // Determine event type keywords from translations
    const baseKeywords: string[] = eventsDict.keywords ?? [];
    const statusKeywords: string[] = (eventsDict.status_keywords && eventsDict.status_keywords[event.status]) || [];
    const templates = eventsDict.templates ?? {};
    const locationKeyword = location && templates.location_event ? templates.location_event.replace('{location}', location) : location ? `${location}` : "";

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        event.title,
        ...baseKeywords,
        locationKeyword,
        event.suburb || "",
        ...statusKeywords,
        event.price ? (eventsDict.paid_event_label ?? '') : (eventsDict.free_entry_label ?? ''),
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/events/${slug}`,
    });
  } catch (error) {
    console.error("Error generating event metadata:", error);
    return genMeta({
      title: eventsDict.default_title ?? siteConfig.title,
      description: eventsDict.default_description ?? siteConfig.description,
      noIndex: true,
    });
  }
}

export default function EventSlugLayout({ children }: Props) {
  return <>{children}</>;
}
