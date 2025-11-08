import { liveMetadata } from "@/lib/metadata";

export const metadata = liveMetadata;

export default function LiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
