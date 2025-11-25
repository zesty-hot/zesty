
import { ChatWindow } from '@/app/[lang]/messages/[slug]/(client-renders)/chat-window';

interface MessagePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MessagePage({ params }: MessagePageProps) {
  const { slug: chatId } = await params;

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <ChatWindow chatId={chatId} />
    </div>
  );
}