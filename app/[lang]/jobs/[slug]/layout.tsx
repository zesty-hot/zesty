import { Metadata } from "next";
import { prisma, withRetry } from "@/lib/prisma";
import { generateMetadata as genMeta, siteConfig } from "@/lib/metadata";

type Props = {
  params: Promise<{ slug: string; lang: string }>;
  children: React.ReactNode;
};

/**
 * Generate dynamic metadata for job posting pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;

  try {
    // Fetch the job data
    const job = await withRetry(() =>
      prisma.job.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          type: true,
          payAmount: true,
          payType: true,
          lengthHours: true,
          lengthDays: true,
          suburb: true,
          venue: true,
          startDate: true,
          endDate: true,
          status: true,
          coverImage: true,
          studio: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      })
    );

    // If job doesn't exist, return basic metadata
    if (!job) {
      return genMeta({
        title: "Job Not Found",
        description: "The job posting you're looking for doesn't exist.",
        noIndex: true,
      });
    }

    // Format job type
    const jobType = job.type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");

    // Format pay
    const payInfo =
      job.payType === "FIXED"
        ? `$${job.payAmount}`
        : `$${job.payAmount}/${job.payType.toLowerCase()}`;

    // Format duration
    const duration = job.lengthDays
      ? `${job.lengthDays} ${job.lengthDays === 1 ? "day" : "days"}`
      : job.lengthHours
        ? `${job.lengthHours} ${job.lengthHours === 1 ? "hour" : "hours"}`
        : "Flexible";

    // Build location string
    const location = [job.venue, job.suburb].filter(Boolean).join(", ");

    // Get image
    const imageUrl = job.coverImage || `${siteConfig.url}/default-job.jpg`;

    // Truncate description
    const description = job.description
      ? job.description.length > 155
        ? `${job.description.substring(0, 152)}...`
        : job.description
      : `${jobType} position at ${job.studio.name}. ${payInfo}. ${duration} duration. ${location ? `Located in ${location}.` : ""
      } Apply now!`;

    // Build title
    const titleParts = [job.title, jobType];
    if (job.studio.name) {
      titleParts.push(`at ${job.studio.name}`);
    }
    if (job.suburb) {
      titleParts.push(`in ${job.suburb}`);
    }

    const title = titleParts.join(" - ");

    // Job type keywords
    const jobTypeKeywords: { [key: string]: string[] } = {
      ACTOR: ["actor job", "acting work", "adult performer"],
      DIRECTOR: ["director job", "directing work", "film director"],
      CAMERA_OPERATOR: ["camera operator", "cinematography", "videographer"],
      EDITOR: ["editor job", "video editing", "post-production"],
      PRODUCTION_STAFF: ["production job", "film crew", "production staff"],
      MODEL: ["model job", "modeling work"],
      OTHER: ["adult industry job"],
    };

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        job.title,
        "adult industry job",
        ...(jobTypeKeywords[job.type] || []),
        job.suburb || "",
        location || "",
        `${job.studio.name} job`,
        job.payType.toLowerCase() === "fixed" ? "fixed pay" : "hourly pay",
        "entertainment job",
        "modeling opportunity",
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/jobs/${slug}`,
    });
  } catch (error) {
    console.error("Error generating job metadata:", error);
    return genMeta({
      title: "Job Posting",
      description: "Explore opportunities in the adult entertainment industry.",
      noIndex: true,
    });
  }
}

export default function JobSlugLayout({ children }: Props) {
  return <>{children}</>;
}
