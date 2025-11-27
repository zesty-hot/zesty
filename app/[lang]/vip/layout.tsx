import { getVipMetadata } from "@/lib/metadata";
import { Locale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const metaData = getVipMetadata({ lang: lang as Locale });
  return metaData;
}

export default function VipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
