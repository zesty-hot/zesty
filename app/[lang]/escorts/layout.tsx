import { Locale } from "@/lib/i18n/config";
import { getEscortsMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const metaData = getEscortsMetadata({ lang: lang as Locale });
  return metaData;
}

export default function EscortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
