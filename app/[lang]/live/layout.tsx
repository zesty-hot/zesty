import { Locale } from "@/lib/i18n/config";
import { getLiveMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const metaData = getLiveMetadata({ lang: lang as Locale });
  return metaData;
}

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
