import { eventsMetadata } from "@/lib/metadata";

export const metadata = eventsMetadata;

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
