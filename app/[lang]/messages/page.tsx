"use client";

import { ChatList } from '@/app/[lang]/messages/(client-renders)/chat-list';
import { Spinner } from '@/components/ui/spinner';
import { toastManager } from '@/components/ui/toast';
import { useSupabaseSession } from '@/lib/supabase/client';
import { redirect, useParams, useRouter } from 'next/navigation';

export default function InboxPage() {
  const { data: session, status, user } = useSupabaseSession();
  const { lang } = useParams();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)] min-h-52">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    toastManager.add({
      title: "Authentication Required",
      description: "Please log in to access your messages.",
      type: "warning",
    });
    router.push(`/${lang}`);
    return;
  }

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <ChatList />
    </div>
  );
}