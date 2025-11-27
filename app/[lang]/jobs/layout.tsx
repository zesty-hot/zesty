import { getJobsMetadata } from "@/lib/metadata";
import { Locale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const metaData = getJobsMetadata({ lang: lang as Locale });
  return metaData;
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
