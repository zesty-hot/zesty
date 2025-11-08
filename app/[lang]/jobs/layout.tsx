import { jobsMetadata } from "@/lib/metadata";

export const metadata = jobsMetadata;

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
