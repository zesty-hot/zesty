import { escortsMetadata } from "@/lib/metadata";

export const metadata = escortsMetadata;

export default function EscortsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
