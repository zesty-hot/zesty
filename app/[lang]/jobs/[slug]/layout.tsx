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
 * Generate dynamic metadata for job posting pages
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const siteConfig = getSiteConfig({ lang: lang as Locale });
  const dictionary = getDictionary(lang as Locale);
  const jobsDict = dictionary?.metadata?.jobs || {};

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
        title: jobsDict.not_found_title || "Job Not Found",
        description: jobsDict.not_found_description || "The job posting you're looking for doesn't exist.",
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
        : (jobsDict.flexible_label || "Flexible");

    // Build location string
    const location = [job.venue, job.suburb].filter(Boolean).join(", ");

    // Get image
    const imageUrl = job.coverImage || `${siteConfig.url}/default-job.jpg`;

    // Truncate description
    const description = job.description
      ? job.description.length > 155
        ? `${job.description.substring(0, 152)}...`
        : job.description
      : `${jobType} position at ${job.studio.name}. ${payInfo}. ${duration} duration. ${location ? `${jobsDict.located_in_label || 'Located in'} ${location}.` : ""}
      } ${jobsDict.apply_now_label || 'Apply now!'}`;

    // Build title
    const titleParts = [job.title, jobType];
    if (job.studio.name) {
      titleParts.push(`at ${job.studio.name}`);
    }
    if (job.suburb) {
      titleParts.push(`in ${job.suburb}`);
    }

    const title = titleParts.join(" - ");

    // Keywords pulled from translations (type-specific + defaults)
    const typeKeywords: string[] = (jobsDict.type_keywords && jobsDict.type_keywords[job.type]) || (jobsDict.type_keywords && jobsDict.type_keywords["OTHER"]) || [];
    const defaultKeywords: string[] = jobsDict.default_keywords || [];

    const studioKeyword = job.studio?.name ? `${job.studio.name} ${jobsDict.studio_job_suffix || 'job'}` : "";
    const payKeyword = job.payType && job.payType.toLowerCase() === "fixed" ? (jobsDict.fixed_pay_label || "fixed pay") : (jobsDict.hourly_pay_label || "hourly pay");

    // Generate rich metadata
    return genMeta({
      title,
      description,
      image: imageUrl,
      keywords: [
        job.title,
        ...defaultKeywords,
        ...typeKeywords,
        job.suburb || "",
        location || "",
        studioKeyword,
        payKeyword,
      ].filter(Boolean),
      canonical: `${siteConfig.url}/${lang}/jobs/${slug}`,
    });
  } catch (error) {
    console.error("Error generating job metadata:", error);
    return genMeta({
      title: jobsDict.default_title || "Job Posting",
      description: jobsDict.default_description || "Explore opportunities in the adult entertainment industry.",
      noIndex: true,
    });
  }
}

export default function JobSlugLayout({ children }: Props) {
  return <>{children}</>;
}
