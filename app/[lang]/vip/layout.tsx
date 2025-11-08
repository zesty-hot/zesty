import { vipMetadata } from "@/lib/metadata";

export const metadata = vipMetadata;

export default function VipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
