import { Locale } from "@/lib/i18n/config";
import { getDatingMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const metaData = getDatingMetadata({ lang: lang as Locale });
  return metaData;
}

export default function DatingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
