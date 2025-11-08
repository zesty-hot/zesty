import { datingMetadata } from "@/lib/metadata";

export const metadata = datingMetadata;

export default function DatingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
